import { BonsaiTree } from "@/components/BonsaiTree";
import { GrowthState } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const allStages: GrowthState[] = [
  "ath",
  "positive-30",
  "positive-20",
  "positive-10",
  "neutral",
  "negative-10",
  "negative-20",
  "negative-30",
  "atl"
];

const priceThresholds = [100000, 125000, 150000, 200000];

function shouldPriceGlow(price: number | null): boolean {
  if (!price) return false;
  const thresholds = [100000, 125000, 150000, 200000];
  // Allow for a small range around thresholds (within 1%)
  return thresholds.some(threshold => Math.abs(price - threshold) / threshold < 0.01);
}

export default function TreeStagesDemo() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 p-8">
      <h1 className="text-3xl text-[#22ff33] font-['VT323'] mb-8">Bonsai Tree Stages (Demo)</h1>
      <div className="flex flex-row flex-wrap gap-12 justify-center">
        {allStages.map(stage => (
          <div key={stage} className="flex flex-col items-center">
            <BonsaiTree growthState={stage} percentChange={0} />
            <span className="mt-4 text-[#22ff33] font-['VT323'] text-xl">{stage.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div className="mt-16 w-full flex flex-col items-center">
        <h2 className="text-2xl text-[#22ff33] font-['VT323'] mb-4">Price Glow Demo</h2>
        <div className="flex flex-row flex-wrap gap-8 justify-center">
          {priceThresholds.map(price => {
            const glowClass = shouldPriceGlow(price)
              ? "animate-pulse text-[#ffcc33] shadow-glow"
              : "";
            return (
              <div key={price} className="flex flex-col items-center">
                <span className={`text-[22px] font-['VT323'] w-full text-center tracking-wider ${glowClass}`}>
                  BTC PRICE: {formatCurrency(price)}$
                </span>
                <span className="mt-2 text-[#22ff33] font-['VT323'] text-base opacity-60">{price.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-12 text-[#22ff33] font-['VT323'] opacity-60">Temporary page for visualization. Safe to delete later.</p>
    </div>
  );
} 