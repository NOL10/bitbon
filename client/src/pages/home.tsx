import { useCallback, useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { useBtcPrice } from "@/lib/hooks";
import { formatCurrency, calculateGrowthStage, calculateGrowthPercent, isNearThreshold, PRICE_THRESHOLDS, calculateAverageBuyPrice } from "@/lib/utils";
import { GrowthState, GrowthFrequency } from "@/lib/types";
import { BonsaiTree } from "@/components/BonsaiTree";

export default function Home() {
  const { toast } = useToast();
  const { 
    settings, 
    logs, 
    addLog, 
    btcData, 
    updateBtcData, 
    isLoadingSettings, 
    isLoadingLogs,
    resetState
  } = useBonsaiStore();
  
  const { data: latestPrice, isLoading: isLoadingPrice } = useBtcPrice(60000);
  
  useEffect(() => {
    if (latestPrice && !isLoadingPrice) {
      const currentPrice = latestPrice.bitcoin.usd;
      updateBtcData({ currentPrice });
    }
  }, [latestPrice, isLoadingPrice, updateBtcData]);

  // DEBUG: Print all logs to confirm order
  console.log("All logs:", logs);

  // Store a time series of BTC prices (timestamped)
  const [priceHistory, setPriceHistory] = useState<{ price: number; timestamp: number }[]>([]);
  const lastFrequency = useRef<GrowthFrequency | null>(null);

  // On every price update, append the new price with timestamp
  useEffect(() => {
    if (btcData.currentPrice !== null && btcData.currentPrice !== undefined && !isLoadingPrice) {
      setPriceHistory(prev => {
        // If frequency changed, reset history
        if (lastFrequency.current !== settings?.growthFrequency) {
          lastFrequency.current = settings?.growthFrequency || null;
          return [{ price: btcData.currentPrice as number, timestamp: Date.now() }];
        }
        // Only add if price changed
        if (prev.length === 0 || prev[prev.length - 1].price !== btcData.currentPrice) {
          return [...prev, { price: btcData.currentPrice as number, timestamp: Date.now() }];
        }
        return prev;
      });
    }
  }, [btcData.currentPrice, isLoadingPrice, settings?.growthFrequency]);

  // Calculate average buy price from water logs AFTER the most recent harvest (oldest first order)
  let waterLogs: typeof logs = [];
  if (logs && logs.length > 0) {
    const lastHarvestIdx = logs.map(log => log.type).lastIndexOf("harvest");
    if (lastHarvestIdx === -1) {
      waterLogs = logs.filter(log => log.type === "water");
    } else {
      waterLogs = logs.slice(lastHarvestIdx + 1).filter(log => log.type === "water");
    }
  }
  const avgBuyPrice = calculateAverageBuyPrice(waterLogs);

  // Rolling window length for each frequency
  const windowLengthMs = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };
  const now = Date.now();
  const windowStart = now - windowLengthMs[settings?.growthFrequency || "day"];
  const pricesInWindow = priceHistory.filter(p => p.timestamp >= windowStart);

  // Find max and min percent change in window
  let percentChange = 0;
  let growthState: GrowthState = "neutral";

  if (avgBuyPrice && avgBuyPrice > 0 && pricesInWindow.length > 0) {
    let maxPercent = -Infinity;
    let minPercent = Infinity;
    for (const p of pricesInWindow) {
      const percent = ((p.price - avgBuyPrice) / avgBuyPrice) * 100;
      if (percent > maxPercent) maxPercent = percent;
      if (percent < minPercent) minPercent = percent;
    }
    if (Math.abs(maxPercent) >= Math.abs(minPercent)) {
      percentChange = maxPercent;
    } else {
      percentChange = minPercent;
    }
    growthState = calculateGrowthStage(
      percentChange,
      settings?.positiveThresholds || [10, 20, 30],
      settings?.negativeThresholds || [-10, -20, -30],
      settings?.growthFrequency || "day"
    );
  } else {
    percentChange = 0;
    growthState = "neutral";
  }

  // Only allow harvest if there is at least one water log since the last harvest
  const canHarvest = waterLogs.length > 0;

  // Update Water handler to always use current price
  const handleWater = useCallback(() => {
    if (!btcData.currentPrice) return;
    
    const price = btcData.currentPrice;
    const percent = calculateGrowthPercent(price, avgBuyPrice);
    const note = `Watered at ${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
    
    addLog({
      type: "water",
      price,
      note,
    });
    
    toast({
      title: "Water Action Logged",
      description: `BTC buy recorded at $${formatCurrency(price)}`,
    });
  }, [btcData, avgBuyPrice, addLog, toast]);

  // Update Harvest handler to always use current price
  const handleHarvest = useCallback(() => {
    if (!canHarvest) {
      toast({
        title: "Cannot Harvest",
        description: "You must water your bonsai before you can harvest!",
        variant: "destructive"
      });
      return;
    }
    if (!btcData.currentPrice) return;
    
    const price = btcData.currentPrice;
    const percent = calculateGrowthPercent(price, avgBuyPrice);
    const gainLossPercent = percent; // This is already the gain/loss vs avg buy price
    const note = `Harvested at ${gainLossPercent > 0 ? '+' : ''}${gainLossPercent.toFixed(2)}% ${gainLossPercent >= 0 ? 'gain' : 'loss'}`;
    
    addLog({
      type: "harvest",
      price,
      note,
    });
    
    // After logging the harvest, reset bonsai growth state (not logs)
    // Set anchor price to latest BTC price to keep bonsai neutral and avoid errors
    if (btcData.currentPrice) {
      updateBtcData({ anchorPrice: btcData.currentPrice });
    }
    // Optionally, reset other growth-related state here
    
    toast({
      title: "Harvest Action Logged",
      description: `BTC sell recorded at $${formatCurrency(price)}`,
    });
  }, [canHarvest, btcData, avgBuyPrice, addLog, toast, updateBtcData]);

  const isLoading = isLoadingSettings || isLoadingLogs || isLoadingPrice;

  const priceGlowClass = isNearThreshold(btcData.currentPrice ?? 0, PRICE_THRESHOLDS, 1)
    ? "gold-glow text-[#ffd700]"
    : "green-glow text-[#22ff33]";

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-0 m-0 bg-black">
      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
        <div className="w-full h-full bg-scanlines"></div>
      </div>
      
      {/* Main widget */}
      <div className="relative w-[340px] h-[590px] border-4 border-[#22ff33] bg-[#051405] text-[#22ff33] overflow-hidden shadow-xl rounded-lg flex flex-col">
        {/* Widget border effect - double border as seen in the mockup */}
        <div className="absolute inset-0 border-2 border-[#22ff33]/40 m-2 pointer-events-none rounded-lg"></div>
        {/* Content with subtle grid effect */}
        <div className="grid-lines flex-1 w-full p-5 flex flex-col border-b-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#22ff33] animate-pulse font-['VT323'] text-xl">LOADING DATA...</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-[320px] justify-start items-center">
              {/* Header with percentage */}
              <h1 className="text-[30px] font-['VT323'] mb-5 tracking-[0.2em] text-[#22ff33] text-shadow-glow uppercase">Bonsai</h1>
              {/* Main bonsai visualization */}
              <div className="mb-6 flex-1 flex items-center justify-center">
                <BonsaiTree growthState={growthState} percentChange={percentChange} />
              </div>
              {/* Show current rise of BTC relative to average buy price */}
              <div className={`text-[22px] font-['VT323'] w-full text-center mb-2 tracking-wider ${percentChange >= 0 ? 'text-[#22ff33]' : 'text-[#a82e2e]'}`}>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%</div>
              {/* Show current growth frequency */}
              <div className="text-[16px] font-['VT323'] w-full text-center mb-1 tracking-widest text-white/80 uppercase">
                {settings?.growthFrequency || 'day'}
              </div>
              {/* Prompt to water if avgBuyPrice is not set */}
              {(!avgBuyPrice || avgBuyPrice === 0) && (
                <div className="text-[#ff3333] text-center text-lg font-['VT323'] mb-4 animate-pulse">WATER YOUR BONSAI TO BEGIN!</div>
              )}
              {/* Bitcoin price - with glowing effect at threshold values */}
              <div className={`text-[24px] font-['VT323'] w-full text-center mb-6 tracking-wider ${priceGlowClass}`}>BTC PRICE: {formatCurrency(btcData.currentPrice || 0)}$</div>
              {/* Settings button - styled to match action buttons */}
              <div className="w-full border-4 border-[#22ff33] rounded-lg overflow-hidden bg-[#051405] relative shadow-lg h-[54px] mb-3 flex items-center justify-center">
                <Link href="/settings" className="w-full h-full">
                  <button className="w-full h-full flex flex-row items-center justify-center bg-[#051405] text-[#22ff33] font-['VT323'] text-lg font-bold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_8px_#22ff33] focus:outline-none rounded-none">
                    <span className="mr-2">⚙</span>
                    <span className="tracking-widest">SETTINGS</span>
                  </button>
                </Link>
                {/* Scanline/gradient overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines z-0" />
              </div>
            </div>
          )}
        </div>
        {/* Action buttons - stick to bottom */}
        <div className="flex w-full border-4 border-[#22ff33] rounded-b-lg overflow-hidden bg-[#051405] relative shadow-lg h-[54px] mt-auto">
          {/* Scanline/gradient overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines z-0" />
                  <button 
            className="flex-1 h-full px-2 bg-[#051405] text-[#22ff33] font-['VT323'] text-lg font-bold flex flex-row items-center justify-center border-r-2 border-[#22ff33] group relative z-10 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_8px_#22ff33] focus:outline-none rounded-none"
            onClick={handleWater}
                  >
            <span className="mr-2 text-[1.5rem]">💧</span>
            <span className="tracking-widest">WATER</span>
                  </button>
                  <button 
            className="flex-1 h-full px-2 bg-[#051405] text-[#22ff33] font-['VT323'] text-lg font-bold flex flex-row items-center justify-center group relative z-10 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_8px_#22ff33] focus:outline-none rounded-none"
            onClick={handleHarvest}
                  >
            <span className="mr-2 text-[1.5rem]">†</span>
            <span className="tracking-widest">HARVEST</span>
                  </button>
          {/* Divider highlight (overrides border for more glow) */}
          <div className="absolute left-1/2 top-2 bottom-2 w-[2px] bg-[#22ff33] shadow-[0_0_4px_#22ff33] z-20 rounded"></div>
        </div>
        <style>{`
          .gold-glow {
            text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700;
            animation: goldPulse 2s infinite;
          }
          .green-glow {
            text-shadow: 0 0 10px #22ff33, 0 0 20px #22ff33, 0 0 30px #22ff33;
            animation: greenPulse 2s infinite;
          }
          @keyframes goldPulse {
            0% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700; }
            50% { text-shadow: 0 0 15px #ffd700, 0 0 25px #ffd700, 0 0 35px #ffd700; }
            100% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700; }
          }
          @keyframes greenPulse {
            0% { text-shadow: 0 0 10px #22ff33, 0 0 20px #22ff33, 0 0 30px #22ff33; }
            50% { text-shadow: 0 0 15px #22ff33, 0 0 25px #22ff33, 0 0 35px #22ff33; }
            100% { text-shadow: 0 0 10px #22ff33, 0 0 20px #22ff33, 0 0 30px #22ff33; }
          }
        `}</style>
      </div>
    </div>
  );
}