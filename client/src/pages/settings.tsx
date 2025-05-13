import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function Settings() {
  const { toast } = useToast();
  const { settings, saveSettings, isLoadingSettings } = useBonsaiStore();
  
  const [positiveThresholds, setPositiveThresholds] = useState<number[]>([10, 20, 30]);
  const [negativeThresholds, setNegativeThresholds] = useState<number[]>([-10, -20, -30]);
  const [useAverageBuyPrice, setUseAverageBuyPrice] = useState(true);
  const [anchorPrice, setAnchorPrice] = useState<number | null>(null);

  useEffect(() => {
    if (settings && !isLoadingSettings) {
      setPositiveThresholds(settings.positiveThresholds);
      setNegativeThresholds(settings.negativeThresholds);
      setUseAverageBuyPrice(settings.useAverageBuyPrice);
      setAnchorPrice(settings.anchorPrice);
    }
  }, [settings, isLoadingSettings]);

  const handleSaveSettings = async () => {
    try {
      await saveSettings({
        positiveThresholds,
        negativeThresholds,
        useAverageBuyPrice,
        anchorPrice: useAverageBuyPrice ? null : anchorPrice
      });
      
      toast({
        title: "Settings Saved",
        description: "Your bonsai growth thresholds have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    }
  };

  const handlePositiveThresholdChange = (index: number, value: string) => {
    const newThresholds = [...positiveThresholds];
    newThresholds[index] = Number(value);
    setPositiveThresholds(newThresholds);
  };

  const handleNegativeThresholdChange = (index: number, value: string) => {
    const newThresholds = [...negativeThresholds];
    newThresholds[index] = Number(value);
    setNegativeThresholds(newThresholds);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div id="settings-panel" className="bg-background border-2 border-primary p-4 max-w-md w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg text-primary">SETTINGS</h2>
          <Link href="/">
            <button className="fallout-btn text-xs">BACK</button>
          </Link>
        </div>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-primary animate-pulse">LOADING SETTINGS...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-sm mb-4">POSITIVE THRESHOLDS</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1">LEVEL 1 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={positiveThresholds[0]} 
                    onChange={(e) => handlePositiveThresholdChange(0, e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">LEVEL 2 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={positiveThresholds[1]} 
                    onChange={(e) => handlePositiveThresholdChange(1, e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">LEVEL 3 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={positiveThresholds[2]} 
                    onChange={(e) => handlePositiveThresholdChange(2, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm mb-4">NEGATIVE THRESHOLDS</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1">LEVEL 1 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={negativeThresholds[0]} 
                    onChange={(e) => handleNegativeThresholdChange(0, e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">LEVEL 2 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={negativeThresholds[1]} 
                    onChange={(e) => handleNegativeThresholdChange(1, e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">LEVEL 3 (%)</label>
                  <input 
                    type="number" 
                    className="terminal-input w-full" 
                    value={negativeThresholds[2]} 
                    onChange={(e) => handleNegativeThresholdChange(2, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm mb-4">ANCHOR PRICE</h3>
              <div className="flex items-center mb-2">
                <input 
                  type="radio" 
                  id="use-avg-buy" 
                  name="anchor-type" 
                  className="mr-2" 
                  checked={useAverageBuyPrice} 
                  onChange={() => setUseAverageBuyPrice(true)}
                />
                <label htmlFor="use-avg-buy" className="text-xs">USE AVERAGE BUY PRICE</label>
              </div>
              <div className="flex items-center mb-4">
                <input 
                  type="radio" 
                  id="use-custom" 
                  name="anchor-type" 
                  className="mr-2" 
                  checked={!useAverageBuyPrice} 
                  onChange={() => setUseAverageBuyPrice(false)}
                />
                <label htmlFor="use-custom" className="text-xs">USE CUSTOM PRICE</label>
              </div>
              <div className="flex items-center">
                <label className="block text-xs mr-2">$ </label>
                <input 
                  type="number" 
                  className="terminal-input w-full" 
                  value={anchorPrice || ''} 
                  onChange={(e) => setAnchorPrice(Number(e.target.value))}
                  disabled={useAverageBuyPrice}
                />
              </div>
            </div>

            <button 
              className="fallout-btn w-full"
              onClick={handleSaveSettings}
            >
              SAVE SETTINGS
            </button>
          </>
        )}
      </div>
    </div>
  );
}
