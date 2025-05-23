// BTC Price types
export interface BtcPriceResponse {
  bitcoin: {
    usd: number;
  };
}

// Growth states based on threshold percentages
export type GrowthState = 
  | "ath"  // All-Time High (above highest positive threshold)
  | "positive-30" 
  | "positive-20" 
  | "positive-10" 
  | "neutral" 
  | "negative-10" 
  | "negative-20" 
  | "negative-30" 
  | "atl"; // All-Time Low (below lowest negative threshold)

// Growth frequency options
export type GrowthFrequency = "day" | "week" | "month" | "year";

// Settings types
export interface BonsaiSettings {
  id?: number;
  userId?: string;
  positiveThresholds: number[];
  negativeThresholds: number[];
  useAverageBuyPrice: boolean;
  anchorPrice: number | null;
  growthFrequency: GrowthFrequency;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaveSettingsParams {
  positiveThresholds: number[];
  negativeThresholds: number[];
  useAverageBuyPrice: boolean;
  anchorPrice: number | null;
  growthFrequency: GrowthFrequency;
}

// Log types
export interface BonsaiLog {
  id?: number;
  userId?: string;
  type: "water" | "harvest";
  price: number;
  timestamp: string | Date;
  note?: string | null;
}

export interface AddLogParams {
  type: "water" | "harvest";
  price: number;
  note?: string;
}

// BTC data stored in the app
export interface BtcData {
  currentPrice: number | null;
  anchorPrice: number | null;
  previousClose: number | null;
  lastUpdated: Date | null;
}

export interface UpdateBtcDataParams {
  currentPrice?: number;
  anchorPrice?: number;
  previousClose?: number;
}

export interface HistoricalPriceData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}
