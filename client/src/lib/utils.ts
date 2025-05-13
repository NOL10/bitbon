import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GrowthState, GrowthFrequency } from "./types";

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

// Calculate percentage change between current and anchor price
export function calculateGrowthPercent(
  currentPrice: number | null, 
  anchorPrice: number | null
): number {
  if (!currentPrice || !anchorPrice || anchorPrice === 0) return 0;
  
  return ((currentPrice - anchorPrice) / anchorPrice) * 100;
}

// Calculate the adjusted growth percentage based on the chosen frequency
export function calculateAdjustedGrowthPercent(
  percentChange: number,
  growthFrequency: GrowthFrequency = "day"
): number {
  // Apply frequency multipliers to adjust growth rate based on selected timeframe
  const multipliers = {
    day: 1,
    week: 0.7,   // Slower growth over a week
    month: 0.5,  // Even slower over a month
    year: 0.25   // Slowest over a year
  };
  
  return percentChange * multipliers[growthFrequency];
}

// Determine the growth state based on percentage change and thresholds
export function calculateGrowthStage(
  percentChange: number,
  positiveThresholds: number[] = [10, 20, 30],
  negativeThresholds: number[] = [-10, -20, -30],
  growthFrequency: GrowthFrequency = "day"
): GrowthState {
  // Adjust growth percentage based on frequency
  const adjustedPercent = calculateAdjustedGrowthPercent(percentChange, growthFrequency);
  
  // Sort thresholds in ascending order
  const sortedPositive = [...positiveThresholds].sort((a, b) => a - b);
  const sortedNegative = [...negativeThresholds].sort((a, b) => a - b);
  
  // Find the highest and lowest thresholds
  const highestPositive = sortedPositive[sortedPositive.length - 1];
  const lowestNegative = sortedNegative[0];
  
  // All time high case
  if (adjustedPercent > highestPositive) {
    return "ath";
  }
  
  // All time low case
  if (adjustedPercent < lowestNegative) {
    return "atl";
  }
  
  // Positive cases
  if (adjustedPercent >= sortedPositive[2]) {
    return "positive-30";
  } else if (adjustedPercent >= sortedPositive[1]) {
    return "positive-20";
  } else if (adjustedPercent >= sortedPositive[0]) {
    return "positive-10";
  }
  
  // Negative cases
  if (adjustedPercent <= sortedNegative[0]) {
    return "negative-30";
  } else if (adjustedPercent <= sortedNegative[1]) {
    return "negative-20";
  } else if (adjustedPercent <= sortedNegative[2]) {
    return "negative-10";
  }
  
  // Default neutral case
  return "neutral";
}

// Calculate average buy price from water logs
export function calculateAverageBuyPrice(waterLogs: { price: number }[]): number | null {
  if (!waterLogs || waterLogs.length === 0) return null;
  
  const total = waterLogs.reduce((sum, log) => sum + log.price, 0);
  return total / waterLogs.length;
}
