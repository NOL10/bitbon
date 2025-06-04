import { GrowthState } from "@/lib/types";
import { BonsaiTree } from "@/components/BonsaiTree";
import { Link } from "wouter";

// All possible growth states
const growthStates: GrowthState[] = [
  "neutral",
  "positive-10",
  "positive-20",
  "positive-30",
  "negative-10",
  "negative-20",
  "negative-30",
  "ath",
  "atl"
];

// Descriptions for each state
const stateDescriptions: Record<GrowthState, string> = {
  "neutral": "Default state when no significant price movement",
  "positive-10": "Price increase ≥ 2% (first positive threshold)",
  "positive-20": "Price increase ≥ 5% (second positive threshold)",
  "positive-30": "Price increase ≥ 10% (third positive threshold)",
  "negative-10": "Price decrease ≤ -2% (first negative threshold)",
  "negative-20": "Price decrease ≤ -5% (second negative threshold)",
  "negative-30": "Price decrease ≤ -10% (third negative threshold)",
  "ath": "Price within 1% of market ATH",
  "atl": "Price within 1% of market ATL"
};

export default function StagesPreview() {
  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Fixed header with back button */}
      <div className="flex-none bg-black/95 backdrop-blur-sm border-b-2 border-[#22ff33]/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="px-4 py-2 border-2 border-[#22ff33] text-[#22ff33] font-['VT323'] rounded hover:bg-[#22ff33]/10 transition-colors">
              ← Back to App
            </button>
          </Link>
          <h1 className="text-[#22ff33] font-['VT323'] text-4xl">Bonsai Growth Stages Preview</h1>
          <div className="w-[100px]"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Grid of stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {growthStates.map((state) => (
              <div 
                key={state}
                className="border-4 border-[#22ff33] bg-[#051405] p-6 rounded-lg flex flex-col items-center hover:shadow-[0_0_15px_#22ff33] transition-shadow"
              >
                <h2 className="text-[#22ff33] font-['VT323'] text-2xl mb-4 capitalize">
                  {state.replace(/-/g, ' ')}
                </h2>
                
                <div className="w-[200px] h-[200px] mb-4">
                  <BonsaiTree 
                    growthState={state} 
                    percentChange={
                      state.includes('positive') ? 15 :
                      state.includes('negative') ? -15 :
                      state === 'ath' ? 0 :
                      state === 'atl' ? 0 : 0
                    }
                  />
                </div>
                
                <p className="text-[#22ff33]/80 font-['VT323'] text-center">
                  {stateDescriptions[state]}
                </p>
              </div>
            ))}
          </div>

          {/* Delete instructions */}
          <div className="mt-12 p-6 border-4 border-[#22ff33] bg-[#051405] rounded-lg max-w-3xl mx-auto">
            <h2 className="text-[#22ff33] font-['VT323'] text-2xl mb-4">How to Delete This Page</h2>
            <p className="text-[#22ff33]/80 font-['VT323'] mb-4">
              To remove this preview page:
            </p>
            <ol className="list-decimal list-inside text-[#22ff33]/80 font-['VT323'] space-y-2">
              <li>Delete the file: <code className="bg-black px-2 py-1 rounded">client/src/pages/stages-preview.tsx</code></li>
              <li>Remove any imports of this page from your router configuration</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="w-full h-full bg-scanlines"></div>
      </div>
    </div>
  );
} 