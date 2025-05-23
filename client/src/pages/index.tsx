import React, { useState, useEffect } from 'react';
import { GrowthState, GrowthFrequency } from '@/lib/types';
import { BonsaiSettings } from '@/lib/types';
import { fetchSettings, fetchBtcPrice, fetchHistoricalBtcPrices } from '@/lib/api';
import { calculateGrowthPercent, calculateGrowthStage } from '@/lib/utils';
import { BonsaiTree } from '@/components/BonsaiTree';
import { formatCurrency } from '@/lib/utils';

const Index: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [historicalPrice, setHistoricalPrice] = useState<number | null>(null);
  const [growthStage, setGrowthStage] = useState<GrowthState>("neutral");
  const [settings, setSettings] = useState<BonsaiSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings and initial prices
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [settingsData, btcData] = await Promise.all([
          fetchSettings(),
          fetchBtcPrice()
        ]);
        
        setSettings(settingsData);
        setCurrentPrice(btcData.bitcoin.usd);
        
        // Fetch historical price based on growth frequency
        const daysMap: Record<GrowthFrequency, number> = {
          day: 1,
          week: 7,
          month: 30,
          year: 365
        };
        const days = daysMap[settingsData.growthFrequency as GrowthFrequency];
        
        const historicalData = await fetchHistoricalBtcPrices(days);
        const oldestPrice = historicalData.prices[0][1];
        setHistoricalPrice(oldestPrice);
        
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load initial data. Please refresh the page or try again later.");
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Update price and growth stage periodically
  useEffect(() => {
    if (!settings) return;
    
    const updatePrice = async () => {
      try {
        const btcData = await fetchBtcPrice();
        setCurrentPrice(btcData.bitcoin.usd);
        
        // Fetch historical price based on growth frequency
        const daysMap: Record<GrowthFrequency, number> = {
          day: 1,
          week: 7,
          month: 30,
          year: 365
        };
        const days = daysMap[settings.growthFrequency as GrowthFrequency];
        
        const historicalData = await fetchHistoricalBtcPrices(days);
        const oldestPrice = historicalData.prices[0][1];
        setHistoricalPrice(oldestPrice);
      } catch (err) {
        setError("Failed to update price. Please refresh the page or try again later.");
      }
    };
    
    const interval = setInterval(updatePrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [settings]);

  // Immediately update historical price and growth state when growth frequency changes
  useEffect(() => {
    if (!settings) return;
    
    const updateHistoricalPrice = async () => {
      try {
        const daysMap: Record<GrowthFrequency, number> = {
          day: 1,
          week: 7,
          month: 30,
          year: 365
        };
        const days = daysMap[settings.growthFrequency as GrowthFrequency];
        
        const historicalData = await fetchHistoricalBtcPrices(days);
        const oldestPrice = historicalData.prices[0][1];
        setHistoricalPrice(oldestPrice);
      } catch (err) {
        setError("Failed to update historical price. Please try again later.");
      }
    };
    
    updateHistoricalPrice();
  }, [settings?.growthFrequency]);

  // Calculate growth stage whenever prices or settings change
  useEffect(() => {
    if (!currentPrice || !historicalPrice || !settings) return;
    
    const percentChange = calculateGrowthPercent(currentPrice, historicalPrice);
    const newStage = calculateGrowthStage(
      percentChange,
      settings.positiveThresholds,
      settings.negativeThresholds,
      settings.growthFrequency
    );
    
    setGrowthStage(newStage);
  }, [currentPrice, historicalPrice, settings]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Calculate percentChange for the BonsaiTree component
  const percentChange = calculateGrowthPercent(currentPrice, historicalPrice);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <BonsaiTree growthState={growthStage} percentChange={percentChange} />
        {currentPrice && (
          <div className="text-center mt-4">
            <p className="text-lg">Current BTC Price: {formatCurrency(currentPrice)}</p>
            {historicalPrice && (
              <p className="text-sm text-gray-600">
                {settings?.growthFrequency} Change: {formatCurrency(currentPrice - historicalPrice)} 
                ({((currentPrice - historicalPrice) / historicalPrice * 100).toFixed(2)}%)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index; 