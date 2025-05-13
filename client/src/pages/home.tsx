import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import BonsaiTree from "@/components/BonsaiTree";
import BtcStats from "@/components/BtcStats";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { useBtcPrice } from "@/lib/hooks";
import { formatCurrency, calculateGrowthStage, calculateGrowthPercent } from "@/lib/utils";

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

  const lastAction = logs && logs.length > 0 
    ? `LAST ACTION: ${logs[0].type.toUpperCase()} @ $${formatCurrency(logs[0].price)} (${new Date(logs[0].timestamp).toLocaleDateString()})`
    : "NO ACTIONS RECORDED";

  const isLoading = isLoadingSettings || isLoadingLogs || isLoadingPrice;

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center p-4">
      <div id="main-widget" className="relative border-2 border-primary p-4 bg-background max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg text-primary">BTC BONSAI</h1>
          <Link href="/settings">
            <button className="fallout-btn text-xs">SETTINGS</button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-primary animate-pulse">LOADING VAULT-TEC DATA...</p>
          </div>
        ) : (
          <>
            <BtcStats />

            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-64 border border-primary flex items-center justify-center">
                <BonsaiTree />
              </div>
            </div>

            <div className="flex justify-between">
              <button className="fallout-btn" onClick={handleWater}>WATER (BUY)</button>
              <button className="fallout-btn" onClick={handleHarvest}>HARVEST (SELL)</button>
            </div>

            <div className="mt-4 text-xs">
              <div>{lastAction}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
