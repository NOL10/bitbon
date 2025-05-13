import { BtcPriceResponse, BonsaiSettings, BonsaiLog, SaveSettingsParams, AddLogParams } from "./types";

// Fetch BTC price from API
export async function fetchBtcPrice(): Promise<BtcPriceResponse> {
  const response = await fetch("/api/btc/price");
  if (!response.ok) {
    throw new Error("Failed to fetch BTC price");
  }
  return response.json();
}

// Fetch bonsai settings
export async function fetchBonsaiSettings(): Promise<BonsaiSettings> {
  const response = await fetch("/api/bonsai/settings");
  if (!response.ok) {
    throw new Error("Failed to fetch bonsai settings");
  }
  return response.json();
}

// Save bonsai settings
export async function saveBonsaiSettings(settings: SaveSettingsParams): Promise<BonsaiSettings> {
  const response = await fetch("/api/bonsai/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error("Failed to save bonsai settings");
  }
  
  return response.json();
}

// Fetch bonsai logs
export async function fetchBonsaiLogs(): Promise<BonsaiLog[]> {
  const response = await fetch("/api/bonsai/logs");
  if (!response.ok) {
    throw new Error("Failed to fetch bonsai logs");
  }
  return response.json();
}

// Add bonsai log (water or harvest)
export async function addBonsaiLog(log: AddLogParams): Promise<BonsaiLog> {
  const response = await fetch("/api/bonsai/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(log),
  });
  
  if (!response.ok) {
    throw new Error("Failed to add bonsai log");
  }
  
  return response.json();
}
