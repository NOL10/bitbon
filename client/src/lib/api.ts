
import { BtcPriceResponse, BonsaiSettings, BonsaiLog, SaveSettingsParams, AddLogParams, HistoricalPriceData } from "./types";

// Fetch BTC price from CoinGecko API
export async function fetchBtcPrice(): Promise<BtcPriceResponse> {
  // Only use web fetch
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  if (!response.ok) {
    throw new Error("Failed to fetch BTC price");
  }
  return response.json();
}

// Add rate limiting for API calls
const RATE_LIMIT_DELAY = 60000; // 1 minute between calls
let lastApiCall = 0;

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall));
  }
  lastApiCall = Date.now();
};

// Cache duration (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const fetchHistoricalBtcPrices = async (days: number): Promise<HistoricalPriceData> => {
  try {
    // Check cache first using a per-frequency cache key
    const cacheKey = `cachedHistoricalPrices_${days}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      const now = Date.now();
      
      // If cache is less than 24 hours old, use it
      if (now - timestamp < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }
    }

    // If no valid cache, fetch new data
    await waitForRateLimit();
    
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`);
    
  if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the new data with the per-frequency key
    cacheHistoricalPrices(data, days);
    
    return data;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    
    // Return cached data if available, even if expired
    const cacheKey = `cachedHistoricalPrices_${days}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // If no cache available, throw error
    throw error;
  }
};

// Add caching mechanism with timestamp and per-frequency key
const cacheHistoricalPrices = (data: HistoricalPriceData, days: number) => {
  const cacheKey = `cachedHistoricalPrices_${days}`;
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
};

// Use localStorage for bonsai settings
const SETTINGS_KEY = "bonsai_settings";
const LOGS_KEY = "bonsai_logs";

const DEFAULT_SETTINGS: BonsaiSettings = {
  positiveThresholds: [2, 5, 10],
  negativeThresholds: [-10, -5, -2],
  useAverageBuyPrice: false,
  anchorPrice: null,
  growthFrequency: "day"
};

export async function fetchSettings(): Promise<BonsaiSettings> {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
}

export async function saveSettings(settings: SaveSettingsParams): Promise<BonsaiSettings> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings as BonsaiSettings;
}

export async function fetchLogs(): Promise<BonsaiLog[]> {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
}

export async function addLog(log: AddLogParams): Promise<BonsaiLog> {
  const logs = await fetchLogs();
  const newLog = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
  const updatedLogs = [...logs, newLog];
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  return newLog;
}

export async function clearBonsaiLogs(): Promise<void> {
  localStorage.removeItem(LOGS_KEY);
}
