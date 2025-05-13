import { useCallback, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { useBtcPrice } from "@/lib/hooks";
import { formatCurrency, calculateGrowthStage, calculateGrowthPercent } from "@/lib/utils";
import { GrowthState } from "@/lib/types";

// Function to get the appropriate bonsai image based on growth state
function getBonsaiImagePath(growthState: GrowthState): string {
  switch (growthState) {
    case "ath":
      return "/assets/all_time_high.png";
    case "atl":
      return "/assets/all_time_low.png";
    case "positive-30":
      return "/assets/incline_30.png";
    case "positive-20":
      return "/assets/incline_20.png";
    case "positive-10":
      return "/assets/incline_10.png";
    case "neutral":
      return "/assets/just_pot.png";
    case "negative-10":
      return "/assets/decline_10.png";
    case "negative-20":
      return "/assets/decline_20.png";
    case "negative-30":
      return "/assets/decline_30.png";
    default:
      return "/assets/just_pot.png";
  }
}

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

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center p-0 m-0 bg-[#001205]">
      <div id="main-widget" className="relative border-4 border-[#22ff33] p-6 bg-[#051405] max-w-md w-full text-[#22ff33] rounded-none">
        {/* Widget border effect */}
        <div className="absolute inset-0 border-2 border-[#22ff33]/20 m-2 pointer-events-none"></div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[520px]">
            <p className="text-[#22ff33] animate-pulse font-['VT323'] text-xl">LOADING DATA...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Header with percentage */}
            <h1 className="text-[26px] font-['VT323'] mb-4">% LEVEL</h1>
            
            {/* Main bonsai image */}
            <div className="relative w-[220px] h-[220px] mb-8 flex items-center justify-center">
              <img 
                src={getBonsaiImagePath(growthState)} 
                alt={`Bitcoin bonsai at ${percentChange.toFixed(0)}% change`}
                className="max-w-full max-h-full"
              />
            </div>
            
            {/* Bitcoin price */}
            <div className="text-[20px] font-['VT323'] w-full text-center mb-8">
              BTC PRICE: {formatCurrency(btcData.currentPrice || 0)}$
            </div>
            
            {/* Settings button */}
            <Link href="/settings">
              <button className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl mb-4 hover:bg-[#22ff33] hover:text-[#051405] transition-colors flex items-center justify-center">
                <span className="mr-2">⚙</span> SETTINGS
              </button>
            </Link>
            
            {/* Water and Harvest buttons */}
            <div className="flex w-full space-x-4 mb-4">
              <button 
                className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33] hover:text-[#051405] transition-colors flex items-center justify-center"
                onClick={handleWater}
              >
                <span className="mr-2">💧</span> WATER
              </button>
              
              <button 
                className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33] hover:text-[#051405] transition-colors flex items-center justify-center"
                onClick={handleHarvest}
              >
                <span className="mr-2">†</span> HARVEST
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
