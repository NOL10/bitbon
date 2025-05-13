import { memo } from "react";
import { useBonsaiStore } from "@/lib/store";
import { formatCurrency, calculateGrowthPercent } from "@/lib/utils";

const BtcStats = memo(() => {
  const { btcData, settings } = useBonsaiStore();
  
  if (!btcData.currentPrice) {
    return (
      <div className="flex justify-between mb-8 animate-pulse">
        <div>
          <div className="text-sm mb-1">CURRENT PRICE:</div>
          <div className="text-2xl mb-2">LOADING...</div>
          <div className="text-xs mb-1">24H CHANGE:</div>
          <div className="text-lg">LOADING...</div>
        </div>
        <div className="text-right">
          <div className="text-sm mb-1">AVG BUY PRICE:</div>
          <div className="text-lg mb-2">LOADING...</div>
          <div className="text-xs mb-1">STATE:</div>
          <div className="text-lg">LOADING...</div>
        </div>
      </div>
    );
  }

  const percentChange = calculateGrowthPercent(btcData.currentPrice, btcData.anchorPrice);
  const percentChangeText = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
  const percentChangeColor = percentChange >= 0 ? 'text-[#FFCC00]' : 'text-[#FF3333]';
  
  let growthStateText = "NEUTRAL";
  if (percentChange > 0) {
    growthStateText = "GROWING";
  } else if (percentChange < 0) {
    growthStateText = "DECLINING";
  }
  
  // Check for all-time high or low based on thresholds
  if (settings) {
    const highestThreshold = Math.max(...settings.positiveThresholds);
    const lowestThreshold = Math.min(...settings.negativeThresholds);
    
    if (percentChange > highestThreshold) {
      growthStateText = "ALL TIME HIGH";
    } else if (percentChange < lowestThreshold) {
      growthStateText = "ALL TIME LOW";
    }
  }

  return (
    <div className="flex justify-between mb-8">
      <div>
        <div className="text-sm mb-1">CURRENT PRICE:</div>
        <div className="text-2xl mb-2">${formatCurrency(btcData.currentPrice)}</div>
        <div className="text-xs mb-1">CHANGE:</div>
        <div className={`text-lg ${percentChangeColor}`}>{percentChangeText}</div>
      </div>
      
      <div className="text-right">
        <div className="text-sm mb-1">ANCHOR PRICE:</div>
        <div className="text-lg mb-2">${formatCurrency(btcData.anchorPrice)}</div>
        <div className="text-xs mb-1">STATE:</div>
        <div className="text-lg">{growthStateText}</div>
      </div>
    </div>
  );
});

BtcStats.displayName = "BtcStats";

export default BtcStats;
