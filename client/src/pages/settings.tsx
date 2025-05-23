import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useBonsaiStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { calculateAverageBuyPrice } from "@/lib/utils";
import { GrowthFrequency } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { clearBonsaiLogs } from "@/lib/api";
import { exportLogs, exportSettings } from '@/lib/utils';
import { useBtcPrice } from "@/lib/hooks";

export default function Settings() {
  const { toast } = useToast();
  const { settings, logs, saveSettings, isLoadingSettings, isLoadingLogs, resetState, updateBtcData } = useBonsaiStore();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: latestPrice } = useBtcPrice();
  
  const [positiveThresholds, setPositiveThresholds] = useState<number[]>([10, 20, 30]);
  const [negativeThresholds, setNegativeThresholds] = useState<number[]>([-30, -20, -10]);
  const [useAverageBuyPrice, setUseAverageBuyPrice] = useState(true);
  const [anchorPrice, setAnchorPrice] = useState<number | null>(null);
  const [growthFrequency, setGrowthFrequency] = useState<GrowthFrequency>("day");
  const [showWateringLog, setShowWateringLog] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPercentageChange, setShowPercentageChange] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'water' | 'harvest'>('all');
  const [logSort, setLogSort] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');

  // Calculate the average buy price from water logs AFTER the most recent harvest (oldest first order)
  let waterLogs: typeof logs = [];
  if (logs && logs.length > 0) {
    // Find the index of the last harvest log (oldest first)
    const lastHarvestIdx = logs.map(log => log.type).lastIndexOf("harvest");
    if (lastHarvestIdx === -1) {
      waterLogs = logs.filter(log => log.type === "water");
    } else {
      waterLogs = logs.slice(lastHarvestIdx + 1).filter(log => log.type === "water");
    }
  }
  const averageBuyPrice = calculateAverageBuyPrice(waterLogs);

  // Error state
  const hasError = (!settings && !isLoadingSettings) || (!logs && !isLoadingLogs);

  useEffect(() => {
    if (showPercentageChange && settings && !isLoadingSettings) {
      setPositiveThresholds(settings.positiveThresholds);
      setNegativeThresholds(settings.negativeThresholds);
      setUseAverageBuyPrice(settings.useAverageBuyPrice);
      setAnchorPrice(settings.anchorPrice);
      setGrowthFrequency(settings.growthFrequency || "day");
    }
  }, [showPercentageChange, settings, isLoadingSettings]);

  const validateThreshold = (value: string): number | null => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num < -100 || num > 100) return null;
    return num;
  };

  const handlePositiveThresholdChange = (index: number, value: string) => {
    const validatedValue = validateThreshold(value);
    if (validatedValue === null) {
      toast({
        title: "Invalid Input",
        description: "Please enter a number between -100 and 100",
        variant: "destructive"
      });
      return;
    }

    const newThresholds = [...positiveThresholds];
    newThresholds[index] = validatedValue;
    setPositiveThresholds(newThresholds);
  };

  const handleNegativeThresholdChange = (index: number, value: string) => {
    const validatedValue = validateThreshold(value);
    if (validatedValue === null) {
      toast({
        title: "Invalid Input",
        description: "Please enter a number between -100 and 100",
        variant: "destructive"
      });
      return;
    }

    const newThresholds = [...negativeThresholds];
    newThresholds[index] = validatedValue;
    setNegativeThresholds(newThresholds);
  };

  const validateSettings = (): boolean => {
    // Check if thresholds are in correct order
    const sortedPositive = [...positiveThresholds].sort((a, b) => a - b);
    const sortedNegative = [...negativeThresholds].sort((a, b) => a - b);

    if (JSON.stringify(sortedPositive) !== JSON.stringify(positiveThresholds)) {
      toast({
        title: "Invalid Thresholds",
        description: "Positive thresholds must be in ascending order",
        variant: "destructive"
      });
      return false;
    }

    if (JSON.stringify(sortedNegative) !== JSON.stringify(negativeThresholds)) {
      toast({
        title: "Invalid Thresholds",
        description: "Negative thresholds must be in ascending order",
        variant: "destructive"
      });
      return false;
    }

    // Check for overlapping thresholds
    if (Math.max(...negativeThresholds) >= Math.min(...positiveThresholds)) {
      toast({
        title: "Invalid Thresholds",
        description: "Negative and positive thresholds cannot overlap",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) return;

    try {
      console.log('Saving settings with growthFrequency:', growthFrequency);
      const response = await saveSettings({
        positiveThresholds,
        negativeThresholds,
        useAverageBuyPrice,
        anchorPrice,
        growthFrequency
      });
      console.log('Response from backend after saveSettings:', response);
      // Optimistically update local state for instant UI feedback
      setGrowthFrequency(growthFrequency);
      setPositiveThresholds([...positiveThresholds]);
      setNegativeThresholds([...negativeThresholds]);
      setUseAverageBuyPrice(useAverageBuyPrice);
      setAnchorPrice(anchorPrice);
      
      toast({
        title: "Settings Saved",
        description: "Your bonsai settings have been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetBonsai = async () => {
    if (!window.confirm("Are you sure you want to reset your bonsai? This will clear all logs and restore default settings.")) {
      return;
    }

    try {
      // Clear logs
      await clearBonsaiLogs();

      // Save default settings
      await saveSettings({
        positiveThresholds: [10, 20, 30],
        negativeThresholds: [-30, -20, -10],
        useAverageBuyPrice: false,
        anchorPrice: null,
        growthFrequency: "day"
      });

      // Reset local state
      setPositiveThresholds([10, 20, 30]);
      setNegativeThresholds([-30, -20, -10]);
      setUseAverageBuyPrice(false);
      setAnchorPrice(null);
      setGrowthFrequency("day");

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/bonsai/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bonsai/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/btc/price'] });

      // Set anchor price to latest BTC price so tree is neutral
      if (latestPrice && latestPrice.bitcoin && latestPrice.bitcoin.usd) {
        updateBtcData({ anchorPrice: latestPrice.bitcoin.usd });
      }

      toast({
        title: "Bonsai Reset",
        description: "Your bonsai plant has been reset to its initial state.",
      });

      // Navigate home
      setLocation("/");
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset bonsai. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFilteredAndSortedLogs = () => {
    if (!logs) return [];
    
    let filteredLogs = [...logs];
    
    // Apply filter
    if (logFilter !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.type === logFilter);
    }
    
    // Apply sorting
    switch (logSort) {
      case 'newest':
        filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'price-high':
        filteredLogs.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filteredLogs.sort((a, b) => a.price - b.price);
        break;
    }
    
    return filteredLogs;
  };

  const isLoading = isLoadingSettings || isLoadingLogs;

  // Add export handlers
  const handleExportLogs = () => {
    if (!logs) return;
    exportLogs(logs);
    toast({
      title: "Logs Exported",
      description: "Your bonsai logs have been exported successfully"
    });
  };

  const handleExportSettings = () => {
    if (!settings) return;
    exportSettings(settings);
    toast({
      title: "Settings Exported",
      description: "Your bonsai settings have been exported successfully"
    });
  };

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
        <div className="grid-lines h-full w-full p-6 flex flex-col items-center overflow-y-auto">
          {hasError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#ff3333] font-['VT323'] text-xl">FAILED TO LOAD SETTINGS OR LOGS</p>
              <p className="text-[#ff3333] font-['VT323'] text-md mt-2">Check your server/API and try refreshing.</p>
            </div>
          ) : isLoading ? (
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
                  onClick={() => setShowPercentageChange(true)}
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
                {/* Go Back to Plant Button - now above Advanced Settings */}
                <Link href="/" className="w-full">
                  <button className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors">
                    GO BACK TO PLANT
                  </button>
                </Link>
                {/* Advanced Settings Button with Small Icon */}
                <div className="flex items-center mt-2">
                  <div className="w-6 h-6 mr-2 text-[#22ff33]">🌱</div>
                  <button 
                    onClick={() => setShowAdvanced(true)}
                    className="flex-1 py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                  >
                    ADVANCED SETTINGS
                  </button>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              {/* Removed the lower 'GO BACK TO PLANT' button here */}
              
              {/* Advanced Settings Panel (Hidden by Default) */}
              {showAdvanced && (
                <div className="absolute top-0 left-0 w-full h-full bg-[#051405] border-2 border-[#22ff33] p-4 z-20 overflow-y-auto flex flex-col">
                  <h2 className="text-[24px] font-['VT323'] mb-6 text-center">ADVANCED SETTINGS</h2>
                  
                  {/* Coming Soon Message */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-[22px] font-['VT323'] text-[#22ff33] text-center mb-4">NEW FEATURES</p>
                    <p className="text-[18px] font-['VT323'] text-[#22ff33] text-center">COMING SOON</p>
                  </div>

                  {/* Credits */}
                  <div className="mt-auto text-center">
                    <p className="text-[16px] font-['VT323'] text-[#22ff33]/80 mb-2">Created by</p>
                    <p className="text-[18px] font-['VT323'] text-[#22ff33]">Mr_Meadow</p>
                    <p className="text-[18px] font-['VT323'] text-[#22ff33]">Noel George</p>
                  </div>

                  {/* Back Button */}
                    <button 
                    className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors mt-6"
                      onClick={() => setShowAdvanced(false)}
                    >
                      BACK
                    </button>
                </div>
              )}
              
              {/* Watering Log Panel (Hidden by Default) */}
              {showWateringLog && (
                <div className="absolute top-0 left-0 w-full h-full bg-[#051405] border-2 border-[#22ff33] p-4 z-20 overflow-y-auto">
                  <h2 className="text-[24px] font-['VT323'] mb-6 text-center">WATERING LOG</h2>
                  
                  {/* Filter and Sort Controls */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1">
                      <label className="block text-[16px] font-['VT323'] mb-2">Filter:</label>
                      <select 
                        className="w-full border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2"
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value as 'all' | 'water' | 'harvest')}
                      >
                        <option value="all">All Actions</option>
                        <option value="water">Water Only</option>
                        <option value="harvest">Harvest Only</option>
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-[16px] font-['VT323'] mb-2">Sort By:</label>
                      <select 
                        className="w-full border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2"
                        value={logSort}
                        onChange={(e) => setLogSort(e.target.value as 'newest' | 'oldest' | 'price-high' | 'price-low')}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="price-low">Price: Low to High</option>
                      </select>
                    </div>
                  </div>

                  {/* Export Logs Button */}
                  <button 
                    className="w-full py-3 px-4 border-2 border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-xl hover:bg-[#22ff33]/10 transition-colors flex items-center justify-center mb-6"
                    onClick={handleExportLogs}
                  >
                    <span className="mr-2">📥</span> EXPORT LOGS
                  </button>
                  
                  {/* Log List */}
                  {getFilteredAndSortedLogs().length === 0 ? (
                    <p className="font-['VT323'] text-[18px] text-center my-8">No records found.</p>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto mb-4">
                      {getFilteredAndSortedLogs().map((log, index) => (
                        <div key={`log-${index}`} className="mb-4 pb-2 border-b border-[#22ff33]/30">
                          <div className="font-['VT323'] text-[16px]">DATE: {new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="font-['VT323'] text-[16px]">PRICE: ${formatCurrency(log.price)}</div>
                          <div className="font-['VT323'] text-[16px]">ACTION: {log.type.toUpperCase()}</div>
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

              {/* Percentage Change Panel (Hidden by Default) */}
              {showPercentageChange && (
                <div className="absolute top-0 left-0 w-full h-full bg-[#051405] border-2 border-[#22ff33] p-4 z-20 overflow-y-auto flex flex-col">
                  <h2 className="text-[24px] font-['VT323'] mb-6 text-center">SET PERCENTAGE CHANGE</h2>
                  
                  {/* Growth Frequency Setting - Moved here */}
                  <div className="mb-6">
                    <h3 className="text-[18px] font-['VT323'] mb-2">GROWTH FREQUENCY</h3>
                    <select 
                      className="w-full border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] py-2 px-2 mb-4"
                      value={growthFrequency}
                      onChange={(e) => setGrowthFrequency(e.target.value as GrowthFrequency)}
                    >
                      <option value="day">DAY</option>
                      <option value="week">WEEK</option>
                      <option value="month">MONTH</option>
                      <option value="year">YEAR</option>
                    </select>
                  </div>

                  {/* Positive Thresholds */}
                  <div className="mb-6">
                    <h3 className="text-[18px] font-['VT323'] mb-2">POSITIVE THRESHOLDS (%)</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {positiveThresholds.slice(0, 3).map((threshold, index) => (
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
                    <h3 className="text-[18px] font-['VT323'] mb-2">NEGATIVE THRESHOLDS (%) <span className="text-[#ff3333]">(Enter from most negative to least negative)</span></h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {negativeThresholds.slice(0, 3).map((threshold, index) => (
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

                  {/* Add Save button */}
                  <button 
                    className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors mb-4"
                    onClick={handleSaveSettings}
                  >
                    SAVE CHANGES
                  </button>

                  <button 
                    className="w-full py-3 px-4 border border-[#22ff33] bg-[#051405] text-[#22ff33] font-['VT323'] text-lg hover:bg-[#22ff33]/10 transition-colors"
                    onClick={() => setShowPercentageChange(false)}
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
