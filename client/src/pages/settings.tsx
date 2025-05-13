import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { calculateAverageBuyPrice } from "@/lib/utils";

export default function Settings() {
  const { toast } = useToast();
  const { settings, logs, saveSettings, isLoadingSettings, isLoadingLogs } = useBonsaiStore();
  
  const [positiveThresholds, setPositiveThresholds] = useState<number[]>([10, 20, 30]);
  const [negativeThresholds, setNegativeThresholds] = useState<number[]>([-10, -20, -30]);
  const [useAverageBuyPrice, setUseAverageBuyPrice] = useState(true);
  const [anchorPrice, setAnchorPrice] = useState<number | null>(null);
  const [showWateringLog, setShowWateringLog] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate the average buy price from water logs
  const waterLogs = logs?.filter(log => log.type === "water") || [];
  const averageBuyPrice = calculateAverageBuyPrice(waterLogs);

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

  const handleResetBonsai = () => {
    toast({
      title: "Bonsai Reset",
      description: "Your bonsai plant has been reset to its initial state.",
    });
  };

  const isLoading = isLoadingSettings || isLoadingLogs;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-0 m-0 bg-[#001205]">
      <div className="relative border-4 border-[#22ff33] p-6 bg-[#051405] max-w-md w-full text-[#22ff33] rounded-none">
        {/* Widget border effect */}
        <div className="absolute inset-0 border-2 border-[#22ff33]/20 m-2 pointer-events-none"></div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[520px]">
            <p className="text-[#22ff33] animate-pulse font-['VT323'] text-xl">LOADING SETTINGS...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-[26px] font-['VT323'] mb-6 text-center">SETTINGS</h1>
            
            {/* Average Buy Price Display */}
            <div className="w-full mb-6 text-center">
              <div className="text-[18px] font-['VT323'] mb-1">BONSAI WATERED</div>
              <div className="text-[18px] font-['VT323'] mb-4">AVERAGE BUY PRICE:</div>
              <div className="text-[28px] font-['VT323'] mb-2">${formatCurrency(averageBuyPrice || 0)}</div>
            </div>
            
            {/* Percentage Change Button */}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg mb-4 hover:bg-[#22ff33] hover:text-[#051405] transition-colors"
            >
              SET PERCENTAGE CHANGE
            </button>
            
            {/* Reset Bonsai Plant Button */}
            <button 
              onClick={handleResetBonsai}
              className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg mb-4 hover:bg-[#22ff33] hover:text-[#051405] transition-colors"
            >
              RESET BONSAI PLANT
            </button>
            
            {/* Check Watering Log Button */}
            <button 
              onClick={() => setShowWateringLog(!showWateringLog)}
              className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg mb-6 hover:bg-[#22ff33] hover:text-[#051405] transition-colors"
            >
              CHECK WATERING LOG
            </button>
            
            {/* Advanced Settings Button with Small Icon */}
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 mr-2 text-[#22ff33]">🌱</div>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex-1 py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33] hover:text-[#051405] transition-colors"
              >
                ADVANCED SETTINGS
              </button>
            </div>
            
            {/* Back Button */}
            <Link href="/">
              <button className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33] hover:text-[#051405] transition-colors">
                BACK TO MAIN
              </button>
            </Link>
            
            {/* Advanced Settings Panel (Hidden by Default) */}
            {showAdvanced && (
              <div className="mt-6 w-full border-2 border-[#22ff33] p-4">
                <h2 className="text-[20px] font-['VT323'] mb-4">Advanced Configuration</h2>
                
                {/* Positive Thresholds */}
                <div className="mb-4">
                  <h3 className="text-[16px] font-['VT323'] mb-2">POSITIVE THRESHOLDS (%)</h3>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {positiveThresholds.map((threshold, index) => (
                      <input 
                        key={`pos-${index}`}
                        type="number" 
                        className="border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] p-1 w-full" 
                        value={threshold} 
                        onChange={(e) => handlePositiveThresholdChange(index, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Negative Thresholds */}
                <div className="mb-4">
                  <h3 className="text-[16px] font-['VT323'] mb-2">NEGATIVE THRESHOLDS (%)</h3>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {negativeThresholds.map((threshold, index) => (
                      <input 
                        key={`neg-${index}`}
                        type="number" 
                        className="border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] p-1 w-full" 
                        value={threshold} 
                        onChange={(e) => handleNegativeThresholdChange(index, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Anchor Price Settings */}
                <div className="mb-4">
                  <h3 className="text-[16px] font-['VT323'] mb-2">ANCHOR PRICE</h3>
                  <div className="flex items-center mb-2">
                    <input 
                      type="radio" 
                      id="use-avg-buy" 
                      name="anchor-type" 
                      className="mr-2" 
                      checked={useAverageBuyPrice} 
                      onChange={() => setUseAverageBuyPrice(true)}
                    />
                    <label htmlFor="use-avg-buy" className="font-['VT323']">USE AVERAGE BUY PRICE</label>
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
                    <label htmlFor="use-custom" className="font-['VT323']">USE CUSTOM PRICE</label>
                  </div>
                  <div className="flex items-center">
                    <label className="block font-['VT323'] mr-2">$ </label>
                    <input 
                      type="number" 
                      className="border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] p-1 w-full" 
                      value={anchorPrice || ''} 
                      onChange={(e) => setAnchorPrice(Number(e.target.value))}
                      disabled={useAverageBuyPrice}
                    />
                  </div>
                </div>
                
                <button 
                  className="w-full py-2 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg mt-4 hover:bg-[#22ff33] hover:text-[#051405] transition-colors"
                  onClick={handleSaveSettings}
                >
                  SAVE SETTINGS
                </button>
              </div>
            )}
            
            {/* Watering Log Panel (Hidden by Default) */}
            {showWateringLog && (
              <div className="mt-6 w-full border-2 border-[#22ff33] p-4">
                <h2 className="text-[20px] font-['VT323'] mb-4">Watering Log</h2>
                
                {waterLogs.length === 0 ? (
                  <p className="font-['VT323'] text-center">No watering records found.</p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {waterLogs.map((log, index) => (
                      <div key={`log-${index}`} className="mb-2 pb-2 border-b border-[#22ff33]/30">
                        <div className="font-['VT323']">DATE: {new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="font-['VT323']">PRICE: ${formatCurrency(log.price)}</div>
                        {log.note && <div className="font-['VT323'] text-sm">{log.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
