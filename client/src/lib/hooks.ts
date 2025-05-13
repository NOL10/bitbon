import { useQuery } from "@tanstack/react-query";
import { BtcPriceResponse } from "./types";
import { fetchBtcPrice } from "./api";

// Fetch the BTC price from CoinGecko API
export function useBtcPrice(refetchInterval = 5 * 60 * 1000) { // Default to 5 minutes
  return useQuery<BtcPriceResponse>({
    queryKey: ['/api/btc/price'],
    refetchInterval,
  });
}
