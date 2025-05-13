import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { useBtcPrice } from "@/lib/hooks";
import { formatCurrency, calculateGrowthStage, calculateGrowthPercent } from "@/lib/utils";
import { GrowthState } from "@/lib/types";
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
    isLoadingLogs
  } = useBonsaiStore();
  
  const { data: latestPrice, isLoading: isLoadingPrice } = useBtcPrice();
  
  // State for manual price entry
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [manualPrice, setManualPrice] = useState<string>("");
  
  useEffect(() => {
    if (latestPrice && !isLoadingPrice) {
      const currentPrice = latestPrice.bitcoin.usd;
      updateBtcData({ currentPrice });
    }
  }, [latestPrice, isLoadingPrice, updateBtcData]);

  const handleWater = useCallback(() => {
    if (!btcData.currentPrice) return;
    
    const price = btcData.currentPrice;
    const percent = calculateGrowthPercent(price, btcData.anchorPrice);
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
  }, [btcData, addLog, toast]);

  const handleHarvest = useCallback(() => {
    if (!btcData.currentPrice) return;
    
    const price = btcData.currentPrice;
    const percent = calculateGrowthPercent(price, btcData.anchorPrice);
    const growthState = calculateGrowthStage(
      percent, 
      settings?.positiveThresholds || [10, 20, 30],
      settings?.negativeThresholds || [-10, -20, -30]
    );
    
    const note = `Harvested at ${percent > 0 ? '+' : ''}${percent.toFixed(2)}% growth`;
    
    addLog({
      type: "harvest",
      price,
      note,
    });
    
    toast({
      title: "Harvest Action Logged",
      description: `BTC sell recorded at $${formatCurrency(price)}`,
    });
  }, [btcData, settings, addLog, toast]);

  const percentChange = calculateGrowthPercent(btcData.currentPrice, btcData.anchorPrice);
  const growthState = calculateGrowthStage(
    percentChange, 
    settings?.positiveThresholds || [10, 20, 30],
    settings?.negativeThresholds || [-10, -20, -30]
  );

  const isLoading = isLoadingSettings || isLoadingLogs || isLoadingPrice;

  // Function to determine if price should glow (at 100k, 125k, 150k, or 200k thresholds)
  const shouldPriceGlow = (price: number | null): boolean => {
    if (!price) return false;
    const thresholds = [100000, 125000, 150000, 200000];
    // Allow for a small range around thresholds (within 1%)
    return thresholds.some(threshold => Math.abs(price - threshold) / threshold < 0.01);
  };

  // Handle manual water/buy with custom price
  const handleManualBuy = () => {
    const price = parseFloat(manualPrice);
    if (isNaN(price) || price <= 0) return;
    
    addLog({
      type: "water",
      price,
      note: `Manual buy at $${formatCurrency(price)}`,
    });
    
    toast({
      title: "Water Action Logged",
      description: `BTC buy recorded at $${formatCurrency(price)}`,
    });
    
    setShowBuyModal(false);
    setManualPrice("");
  };

  // Handle manual harvest/sell with custom price
  const handleManualSell = () => {
    const price = parseFloat(manualPrice);
    if (isNaN(price) || price <= 0) return;
    
    addLog({
      type: "harvest",
      price,
      note: `Manual sell at $${formatCurrency(price)}`,
    });
    
    toast({
      title: "Harvest Action Logged",
      description: `BTC sell recorded at $${formatCurrency(price)}`,
    });
    
    setShowSellModal(false);
    setManualPrice("");
  };

  const priceGlowClass = shouldPriceGlow(btcData.currentPrice) ? "animate-pulse text-[#ffcc33]" : "";

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-0 m-0 bg-black overflow-hidden">
      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
        <div className="w-full h-full bg-scanlines"></div>
      </div>
      
      {/* Main widget */}
      <div className="relative w-[330px] h-[550px] border-4 border-[#22ff33] bg-[#051405] text-[#22ff33] overflow-hidden">
        {/* Widget border effect - double border as seen in the mockup */}
        <div className="absolute inset-0 border-2 border-[#22ff33]/20 m-2 pointer-events-none"></div>
        
        {/* Content with subtle grid effect */}
        <div className="grid-lines h-full w-full p-6 flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#22ff33] animate-pulse font-['VT323'] text-xl">LOADING DATA...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Header with percentage */}
              <h1 className="text-[26px] font-['VT323'] mb-6 tracking-wider">% LEVEL</h1>
              
              {/* Main bonsai visualization */}
              <div className="mb-8">
                <BonsaiTree growthState={growthState} percentChange={percentChange} />
              </div>
              
              {/* Bitcoin price - with glowing effect at threshold values */}
              <div className={`text-[22px] font-['VT323'] w-full text-center mb-12 tracking-wider ${priceGlowClass}`}>
                BTC PRICE: {formatCurrency(btcData.currentPrice || 0)}$
              </div>
              
              {/* Settings button - styled to match the mockup */}
              <Link href="/settings" className="w-full mb-4">
                <button className="w-full py-3 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33]/10 transition-colors flex items-center justify-center">
                  <span className="mr-2">⚙</span> SETTINGS
                </button>
              </Link>
              
              {/* Action buttons - exactly matching the mockup layout */}
              <div className="flex w-full space-x-4">
                <button 
                  className="flex-1 py-3 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33]/10 transition-colors flex items-center justify-center"
                  onClick={() => setShowBuyModal(true)}
                >
                  <span className="mr-2">💧</span> WATER
                </button>
                
                <button 
                  className="flex-1 py-3 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33]/10 transition-colors flex items-center justify-center"
                  onClick={() => setShowSellModal(true)}
                >
                  <span className="mr-2">†</span> HARVEST
                </button>
              </div>
            </div>
          )}
          
          {/* Manual Buy/Water Modal */}
          {showBuyModal && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
              <div className="bg-[#051405] border-2 border-[#22ff33] p-6 w-5/6 flex flex-col">
                <h2 className="text-[20px] font-['VT323'] mb-4 text-center">RECORD BTC BUY</h2>
                <p className="text-[16px] font-['VT323'] mb-4 text-center">Enter the BTC price at which you bought:</p>
                
                <input 
                  type="number" 
                  className="bg-[#051405] border-2 border-[#22ff33] text-[#22ff33] font-['VT323'] p-2 mb-6 text-center" 
                  placeholder="Enter BTC price"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
                
                <div className="flex space-x-4">
                  <button 
                    className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] hover:bg-[#22ff33]/10 transition-colors"
                    onClick={handleManualBuy}
                  >
                    CONFIRM
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] hover:bg-[#22ff33]/10 transition-colors"
                    onClick={() => setShowBuyModal(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Manual Sell/Harvest Modal */}
          {showSellModal && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
              <div className="bg-[#051405] border-2 border-[#22ff33] p-6 w-5/6 flex flex-col">
                <h2 className="text-[20px] font-['VT323'] mb-4 text-center">RECORD BTC SELL</h2>
                <p className="text-[16px] font-['VT323'] mb-4 text-center">Enter the BTC price at which you sold:</p>
                
                <input 
                  type="number" 
                  className="bg-[#051405] border-2 border-[#22ff33] text-[#22ff33] font-['VT323'] p-2 mb-6 text-center" 
                  placeholder="Enter BTC price"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
                
                <div className="flex space-x-4">
                  <button 
                    className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] hover:bg-[#22ff33]/10 transition-colors"
                    onClick={handleManualSell}
                  >
                    CONFIRM
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] hover:bg-[#22ff33]/10 transition-colors"
                    onClick={() => setShowSellModal(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}