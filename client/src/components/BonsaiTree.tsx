import { GrowthState } from "@/lib/types";

interface BonsaiTreeProps {
  growthState: GrowthState;
  percentChange: number;
}

export function BonsaiTree({ growthState }: BonsaiTreeProps) {
  // Choose the correct SVG based on growth state
  let svgPath = "/assets/just_pot.svg";
  
  switch (growthState) {
    case "positive-10":
      svgPath = "/assets/pos_10.svg";
      break;
    case "positive-20":
      svgPath = "/assets/pos_20.svg";
      break;
    case "positive-30":
      svgPath = "/assets/pos_30.svg";
      break;
    case "negative-10":
      svgPath = "/assets/neg_10.svg";
      break;
    case "negative-20":
      svgPath = "/assets/neg_20.svg";
      break;
    case "negative-30":
      svgPath = "/assets/neg_30.svg";
      break;
    case "ath":
      svgPath = "/assets/ath.svg";
      break;
    case "atl":
      svgPath = "/assets/atl.svg";
      break;
    default:
      svgPath = "/assets/just_pot.svg";
  }
  
  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
      <img 
        src={svgPath} 
        alt={`Bitcoin bonsai ${growthState} state`}
        className="w-full h-full object-contain"
      />
      
      {/* Display percentage visually as text */}
      <div className="absolute bottom-2 left-0 right-0 text-center font-['VT323'] text-[18px] text-[#22ff33]">
        {growthState === "ath" ? (
          <span className="animate-pulse">ALL TIME HIGH</span>
        ) : growthState === "atl" ? (
          <span className="animate-pulse">ALL TIME LOW</span>
        ) : growthState === "neutral" ? (
          <span>0%</span>
        ) : (
          <span>{growthState.includes("positive") ? "+" : ""}{growthState.replace("positive-", "").replace("negative-", "-")}%</span>
        )}
      </div>
    </div>
  );
}