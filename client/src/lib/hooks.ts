import { useQuery } from "@tanstack/react-query";
import { BtcPriceResponse } from "./types";
import { fetchBtcPrice } from "./api";

// Fetch the BTC price from CoinGecko API
export function useBtcPrice(refetchInterval = 60000) { // Default to 1 minute
  return useQuery<BtcPriceResponse>({
    queryKey: ['btc-price'],
    queryFn: fetchBtcPrice,
    refetchInterval,
  });
}
