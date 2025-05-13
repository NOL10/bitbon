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
    <div className="h-screen w-screen flex flex-col items-center justify-center p-0 m-0 bg-black overflow-hidden">
      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-10">
        <div className="w-full h-full bg-scanlines"></div>
      </div>
      
      {/* Main settings panel - styled to exactly match app settings.png */}
      <div className="relative w-[330px] h-[550px] border-4 border-[#22ff33] bg-[#051405] text-[#22ff33] overflow-hidden">
        {/* Widget border effect - double border as seen in the mockup */}
        <div className="absolute inset-0 border-2 border-[#22ff33]/20 m-2 pointer-events-none"></div>
        
        {/* Content with subtle grid effect */}
        <div className="grid-lines h-full w-full p-6 flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#22ff33] animate-pulse font-['VT323'] text-xl">LOADING SETTINGS...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Header exact match to the design */}
              <h1 className="text-[26px] font-['VT323'] mb-6 tracking-wider">SETTINGS</h1>
              
              {/* Average Buy Price Display - styled to match app settings.png */}
              <div className="w-full mb-6 text-center">
                <div className="text-[18px] font-['VT323'] mb-1 text-[#22ff33]/80">BONSAI WATERED</div>
                <div className="text-[18px] font-['VT323'] mb-4 text-[#22ff33]/80">AVERAGE BUY PRICE:</div>
                <div className="text-[28px] font-['VT323'] mb-8 text-[#22ff33]">${formatCurrency(averageBuyPrice || 0)}</div>
              </div>
              
              {/* Action buttons - exactly matching the mockup layout and style */}
              <div className="flex flex-col w-full space-y-4">
                {/* Set Percentage Change Button */}
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                >
                  SET PERCENTAGE CHANGE
                </button>
                
                {/* Reset Bonsai Plant Button */}
                <button 
                  onClick={handleResetBonsai}
                  className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                >
                  RESET BONSAI PLANT
                </button>
                
                {/* Check Watering Log Button */}
                <button 
                  onClick={() => setShowWateringLog(!showWateringLog)}
                  className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                >
                  CHECK WATERING LOG
                </button>
                
                {/* Advanced Settings Button with Small Icon */}
                <div className="flex items-center mt-2">
                  <div className="w-6 h-6 mr-2 text-[#22ff33]">🌱</div>
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex-1 py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                  >
                    ADVANCED SETTINGS
                  </button>
                </div>
              </div>
              
              {/* Back Button */}
              <Link href="/" className="mt-8 w-full">
                <button className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors">
                  BACK TO MAIN
                </button>
              </Link>
              
              {/* Advanced Settings Panel (Hidden by Default) */}
              {showAdvanced && (
                <div className="absolute top-0 left-0 w-full h-full bg-[#051405] border-2 border-[#22ff33] p-4 z-20 overflow-y-auto">
                  <h2 className="text-[24px] font-['VT323'] mb-6 text-center">ADVANCED SETTINGS</h2>
                  
                  {/* Positive Thresholds */}
                  <div className="mb-6">
                    <h3 className="text-[18px] font-['VT323'] mb-2">POSITIVE THRESHOLDS (%)</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {positiveThresholds.map((threshold, index) => (
                        <input 
                          key={`pos-${index}`}
                          type="number" 
                          className="border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2 w-full" 
                          value={threshold} 
                          onChange={(e) => handlePositiveThresholdChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Negative Thresholds */}
                  <div className="mb-6">
                    <h3 className="text-[18px] font-['VT323'] mb-2">NEGATIVE THRESHOLDS (%)</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {negativeThresholds.map((threshold, index) => (
                        <input 
                          key={`neg-${index}`}
                          type="number" 
                          className="border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2 w-full" 
                          value={threshold} 
                          onChange={(e) => handleNegativeThresholdChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Anchor Price Settings */}
                  <div className="mb-6">
                    <h3 className="text-[18px] font-['VT323'] mb-2">ANCHOR PRICE</h3>
                    <div className="flex items-center mb-3">
                      <input 
                        type="radio" 
                        id="use-avg-buy" 
                        name="anchor-type" 
                        className="mr-3 h-4 w-4 accent-[#22ff33]" 
                        checked={useAverageBuyPrice} 
                        onChange={() => setUseAverageBuyPrice(true)}
                      />
                      <label htmlFor="use-avg-buy" className="font-['VT323'] text-[16px]">USE AVERAGE BUY PRICE</label>
                    </div>
                    <div className="flex items-center mb-4">
                      <input 
                        type="radio" 
                        id="use-custom" 
                        name="anchor-type" 
                        className="mr-3 h-4 w-4 accent-[#22ff33]" 
                        checked={!useAverageBuyPrice} 
                        onChange={() => setUseAverageBuyPrice(false)}
                      />
                      <label htmlFor="use-custom" className="font-['VT323'] text-[16px]">USE CUSTOM PRICE</label>
                    </div>
                    <div className="flex items-center">
                      <label className="block font-['VT323'] text-[16px] mr-2">$ </label>
                      <input 
                        type="number" 
                        className="border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2 w-full" 
                        value={anchorPrice || ''} 
                        onChange={(e) => setAnchorPrice(Number(e.target.value))}
                        disabled={useAverageBuyPrice}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-8">
                    <button 
                      className="flex-1 py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                      onClick={handleSaveSettings}
                    >
                      SAVE
                    </button>
                    
                    <button 
                      className="flex-1 py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                      onClick={() => setShowAdvanced(false)}
                    >
                      BACK
                    </button>
                  </div>
                </div>
              )}
              
              {/* Watering Log Panel (Hidden by Default) */}
              {showWateringLog && (
                <div className="absolute top-0 left-0 w-full h-full bg-[#051405] border-2 border-[#22ff33] p-4 z-20 overflow-y-auto">
                  <h2 className="text-[24px] font-['VT323'] mb-6 text-center">WATERING LOG</h2>
                  
                  {waterLogs.length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-center my-8">No watering records found.</p>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto mb-4">
                      {waterLogs.map((log, index) => (
                        <div key={`log-${index}`} className="mb-4 pb-2 border-b border-[#22ff33]/30">
                          <div className="font-['VT323'] text-[16px]">DATE: {new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="font-['VT323'] text-[16px]">PRICE: ${formatCurrency(log.price)}</div>
                          {log.note && <div className="font-['VT323'] text-[16px] text-[#22ff33]/70">{log.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors mt-auto"
                    onClick={() => setShowWateringLog(false)}
                  >
                    BACK
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
