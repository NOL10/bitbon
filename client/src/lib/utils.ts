import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GrowthState, GrowthFrequency, BonsaiLog, BonsaiSettings } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a number as currency without using Intl.NumberFormat
// This is more compatible with older browsers
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  
  const numStr = value.toFixed(2);
  
  // Add commas for thousands
  const parts = numStr.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "00";
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  return `${formattedInteger}.${decimalPart}`;
}

// Calculate percentage change between current and historical price
export function calculateGrowthPercent(
  currentPrice: number | null,
  historicalPrice: number | null
): number {
  if (!currentPrice || !historicalPrice || historicalPrice === 0) return 0;
  
  return ((currentPrice - historicalPrice) / historicalPrice) * 100;
}

// Calculate the adjusted growth percentage based on the chosen frequency
export function calculateAdjustedGrowthPercent(
  percentChange: number,
  growthFrequency: GrowthFrequency = "day"
): number {
  // No need for multipliers anymore since we're using actual time-based data
  return percentChange;
}

// Add new function to get market ATH/ATL
export async function getMarketATHATL(): Promise<{ ath: number; atl: number }> {
  try {
    // Fetch historical BTC prices for the last year to determine ATH/ATL
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365');
    const data = await response.json();
    
    const prices = data.prices.map((p: [number, number]) => p[1]);
    const ath = Math.max(...prices);
    const atl = Math.min(...prices);
    
    return { ath, atl };
  } catch (error) {
    console.error('Error fetching market ATH/ATL:', error);
    // Return null values if fetch fails
    return { ath: 0, atl: 0 };
  }
}

// Modify the growth stage calculation
export function calculateGrowthStage(
  percentChange: number,
  currentPrice: number,
  marketATH: number,
  marketATL: number,
  positiveThresholds: number[],
  negativeThresholds: number[],
  growthFrequency: GrowthFrequency
): GrowthState {
  // Check if price is within 5% of ATH or ATL
  const isNearATH = marketATH > 0 && Math.abs((currentPrice - marketATH) / marketATH) <= 0.05;
  const isNearATL = marketATL > 0 && Math.abs((currentPrice - marketATL) / marketATL) <= 0.05;

  if (isNearATH) {
    return "ath";
  }
  if (isNearATL) {
    return "atl";
  }

  // If not near ATH/ATL, use the regular threshold logic
  if (percentChange > 0) {
    if (percentChange >= positiveThresholds[2]) return "positive-30";
    if (percentChange >= positiveThresholds[1]) return "positive-20";
    if (percentChange >= positiveThresholds[0]) return "positive-10";
  } else if (percentChange < 0) {
    if (percentChange <= negativeThresholds[0]) return "negative-30";
    if (percentChange <= negativeThresholds[1]) return "negative-20";
    if (percentChange <= negativeThresholds[2]) return "negative-10";
  }
  
  return "neutral";
}

// Calculate average buy price from water logs
export function calculateAverageBuyPrice(logs: BonsaiLog[]): number | null {
  if (!logs || logs.length === 0) return null;

  // Filter only water (buy) logs and sort by timestamp
  const buyLogs = logs
    .filter(log => log.type === 'water')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (buyLogs.length === 0) return null;

  // Filter and sort sell logs
  const sellLogs = logs
    .filter(log => log.type === 'harvest')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Track remaining BTC from each buy
  const remainingBuys = buyLogs.map(log => ({
    price: log.price,
    amount: 1, // Assuming 1 BTC per buy
    timestamp: new Date(log.timestamp).getTime()
  }));

  // Process sells
  for (const sell of sellLogs) {
    const sellAmount = 1; // Assuming 1 BTC per sell
    let remainingSellAmount = sellAmount;

    // Process sells using FIFO (First In, First Out)
    while (remainingSellAmount > 0 && remainingBuys.length > 0) {
      const oldestBuy = remainingBuys[0];
      
      if (oldestBuy.amount <= remainingSellAmount) {
        // This buy is completely sold
        remainingSellAmount -= oldestBuy.amount;
        remainingBuys.shift();
      } else {
        // Partial sell of this buy
        oldestBuy.amount -= remainingSellAmount;
        remainingSellAmount = 0;
      }
    }
  }

  // Calculate weighted average of remaining buys
  let totalInvestment = 0;
  let totalAmount = 0;

  for (const buy of remainingBuys) {
    totalInvestment += buy.price * buy.amount;
    totalAmount += buy.amount;
  }

  // Handle edge cases
  if (totalAmount <= 0) return null;
  if (totalInvestment <= 0) return null;

  // Calculate final average
  return totalInvestment / totalAmount;
}

export function exportData(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLogs(logs: BonsaiLog[]) {
  // Format the logs into a readable text format
  const formattedLogs = logs.map(log => {
    const date = new Date(log.timestamp).toLocaleString();
    const type = log.type.toUpperCase();
    const price = formatCurrency(log.price);
    const note = log.note ? `\nNote: ${log.note}` : '';
    return `Date: ${date}\nAction: ${type}\nPrice: ${price}${note}\n${'-'.repeat(50)}`;
  }).join('\n\n');

  const exportDate = new Date().toLocaleString();
  const content = `Bitcoin Bonsai Logs
Exported on: ${exportDate}
Total Entries: ${logs.length}

${formattedLogs}`;

  // Create and download the text file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `bonsai-logs-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSettings(settings: BonsaiSettings) {
  const dataToExport = {
    exportDate: new Date().toISOString(),
    settings: {
      ...settings,
      createdAt: settings.createdAt?.toISOString(),
      updatedAt: settings.updatedAt?.toISOString()
    }
  };
  
  exportData(dataToExport, `bonsai-settings-${new Date().toISOString().split('T')[0]}.json`);
}

// --- Price Threshold Glow Utilities ---
export const PRICE_THRESHOLDS = [100000, 125000, 150000, 200000];

/**
 * Returns true if price is within ±percent% of any threshold.
 * @param price The current price
 * @param thresholds Array of threshold numbers
 * @param percent Percentage window (default 1)
 */
export function isNearThreshold(price: number, thresholds: number[] = PRICE_THRESHOLDS, percent = 1): boolean {
  return thresholds.some(threshold => {
    const lower = threshold * (1 - percent / 100);
    const upper = threshold * (1 + percent / 100);
    return price >= lower && price <= upper;
  });
}
