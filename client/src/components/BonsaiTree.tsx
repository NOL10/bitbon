import { memo } from "react";
import { useBonsaiStore } from "@/lib/store";
import { calculateGrowthStage, calculateGrowthPercent } from "@/lib/utils";
import { GrowthState } from "@/lib/types";

const BonsaiTree = memo(() => {
  const { btcData, settings } = useBonsaiStore();
  
  // If data isn't loaded yet, show an empty pot
  if (!btcData.currentPrice || !btcData.anchorPrice || !settings) {
    return (
      <div className="w-48 h-48 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  const percentChange = calculateGrowthPercent(btcData.currentPrice, btcData.anchorPrice);
  const growthState = calculateGrowthStage(
    percentChange, 
    settings.positiveThresholds,
    settings.negativeThresholds
  );

  // Get the appropriate SVG based on growth state
  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <BonsaiSvg growthState={growthState} />
    </div>
  );
});

BonsaiTree.displayName = "BonsaiTree";

function BonsaiSvg({ growthState }: { growthState: GrowthState }) {
  // Different SVG paths for each growth state
  switch (growthState) {
    case "ath":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="50" width="4" height="20" fill="currentColor" />
          <path d="M50 10 C30 30 30 50 50 60 C70 50 70 30 50 10" fill="currentColor" />
          <circle cx="40" cy="40" r="3" fill="#FFCC00" />
          <circle cx="60" cy="30" r="3" fill="#FFCC00" />
          <circle cx="45" cy="20" r="3" fill="#FFCC00" />
          <circle cx="55" cy="45" r="3" fill="#FFCC00" />
        </svg>
      );
    case "positive-30":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="50" width="4" height="20" fill="currentColor" />
          <path d="M50 15 C35 35 35 50 50 60 C65 50 65 35 50 15" fill="currentColor" />
        </svg>
      );
    case "positive-20":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="55" width="4" height="15" fill="currentColor" />
          <path d="M50 25 C40 40 40 50 50 55 C60 50 60 40 50 25" fill="currentColor" />
        </svg>
      );
    case "positive-10":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="60" width="4" height="10" fill="currentColor" />
          <path d="M50 40 C45 50 45 55 50 60 C55 55 55 50 50 40" fill="currentColor" />
        </svg>
      );
    case "neutral":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
        </svg>
      );
    case "negative-10":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary text-opacity-70">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="60" width="4" height="10" fill="currentColor" />
          <path d="M50 40 C45 50 45 55 50 60 C55 55 55 50 50 40" fill="#FF3333" fillOpacity="0.7" />
        </svg>
      );
    case "negative-20":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary text-opacity-60">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="55" width="4" height="15" fill="currentColor" />
          <path d="M50 25 C40 40 40 50 50 55 C60 50 60 40 50 25" fill="#FF3333" fillOpacity="0.8" />
        </svg>
      );
    case "negative-30":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary text-opacity-50">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
          <rect x="48" y="50" width="4" height="20" fill="currentColor" />
          <path d="M50 15 C35 35 35 50 50 60 C65 50 65 35 50 15" fill="#FF3333" fillOpacity="0.9" />
        </svg>
      );
    case "atl":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary text-opacity-40">
          <path d="M40 70 L38 85 L35 85 L37 70 Z" fill="currentColor" />
          <path d="M60 70 L62 85 L65 85 L63 70 Z" fill="currentColor" />
          <path d="M35 85 L65 85 L62 90 L38 90 Z" fill="currentColor" />
          <path d="M40 70 L60 70 L65 85 L35 85 Z" fill="currentColor" />
          <path d="M45 70 L50 65 L55 70 Z" fill="currentColor" />
          <path d="M40 75 L60 75" stroke="#FF3333" strokeWidth="1" />
          <path d="M38 80 L62 80" stroke="#FF3333" strokeWidth="1" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="text-primary">
          <rect x="40" y="70" width="20" height="15" fill="currentColor" />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" />
        </svg>
      );
  }
}

export default BonsaiTree;
