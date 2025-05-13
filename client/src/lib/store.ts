import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BtcData, BonsaiSettings, BonsaiLog, UpdateBtcDataParams, SaveSettingsParams, AddLogParams } from "./types";
import { fetchBonsaiSettings, saveBonsaiSettings, fetchBonsaiLogs, addBonsaiLog } from "./api";
import { calculateAverageBuyPrice } from "./utils";

// Define initial state
interface BonsaiState {
  btcData: BtcData;
  settings: BonsaiSettings | null;
  logs: BonsaiLog[] | null;
  isLoadingSettings: boolean;
  isLoadingLogs: boolean;
}

const initialState: BonsaiState = {
  btcData: {
    currentPrice: null,
    anchorPrice: null,
    previousClose: null,
    lastUpdated: null
  },
  settings: null,
  logs: null,
  isLoadingSettings: true,
  isLoadingLogs: true
};

// Define action types
type BonsaiAction = 
  | { type: 'UPDATE_BTC_DATA'; payload: UpdateBtcDataParams }
  | { type: 'SET_SETTINGS'; payload: BonsaiSettings }
  | { type: 'SET_LOGS'; payload: BonsaiLog[] }
  | { type: 'ADD_LOG'; payload: BonsaiLog }
  | { type: 'SET_LOADING_SETTINGS'; payload: boolean }
  | { type: 'SET_LOADING_LOGS'; payload: boolean };

// Create reducer
function bonsaiReducer(state: BonsaiState, action: BonsaiAction): BonsaiState {
  switch (action.type) {
    case 'UPDATE_BTC_DATA':
      return {
        ...state,
        btcData: {
          ...state.btcData,
          ...action.payload,
          lastUpdated: new Date()
        }
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload
      };
    case 'SET_LOGS':
      return {
        ...state,
        logs: action.payload
      };
    case 'ADD_LOG':
      return {
        ...state,
        logs: state.logs ? [action.payload, ...state.logs] : [action.payload]
      };
    case 'SET_LOADING_SETTINGS':
      return {
        ...state,
        isLoadingSettings: action.payload
      };
    case 'SET_LOADING_LOGS':
      return {
        ...state,
        isLoadingLogs: action.payload
      };
    default:
      return state;
  }
}

// Create context
interface BonsaiContextType extends BonsaiState {
  updateBtcData: (data: UpdateBtcDataParams) => void;
  saveSettings: (settings: SaveSettingsParams) => Promise<BonsaiSettings>;
  addLog: (log: AddLogParams) => Promise<BonsaiLog>;
}

const BonsaiContext = createContext<BonsaiContextType | undefined>(undefined);

// Create provider
export function BonsaiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bonsaiReducer, initialState);
  const queryClient = useQueryClient();

  // Query for fetching settings
  const { data: settingsData, isLoading: isLoadingSettingsData } = useQuery({
    queryKey: ['/api/bonsai/settings'],
    queryFn: fetchBonsaiSettings
  });

  // Query for fetching logs
  const { data: logsData, isLoading: isLoadingLogsData } = useQuery({
    queryKey: ['/api/bonsai/logs'],
    queryFn: fetchBonsaiLogs
  });

  // Set loading states
  useEffect(() => {
    dispatch({ type: 'SET_LOADING_SETTINGS', payload: isLoadingSettingsData });
  }, [isLoadingSettingsData]);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING_LOGS', payload: isLoadingLogsData });
  }, [isLoadingLogsData]);

  // Update settings when data is fetched
  useEffect(() => {
    if (settingsData) {
      dispatch({ type: 'SET_SETTINGS', payload: settingsData });
    }
  }, [settingsData]);

  // Update logs when data is fetched
  useEffect(() => {
    if (logsData) {
      dispatch({ type: 'SET_LOGS', payload: logsData });
    }
  }, [logsData]);

  // Calculate anchor price based on settings and logs
  useEffect(() => {
    if (!state.settings) return;

    if (state.settings.useAverageBuyPrice && state.logs) {
      // Filter water logs (buys) for average price calculation
      const waterLogs = state.logs.filter(log => log.type === 'water');
      const avgBuyPrice = calculateAverageBuyPrice(waterLogs);
      
      if (avgBuyPrice) {
        dispatch({ 
          type: 'UPDATE_BTC_DATA',
          payload: { anchorPrice: avgBuyPrice }
        });
      } else if (state.btcData.previousClose) {
        // Fall back to previous day close if no buys
        dispatch({ 
          type: 'UPDATE_BTC_DATA',
          payload: { anchorPrice: state.btcData.previousClose }
        });
      }
    } else if (!state.settings.useAverageBuyPrice && state.settings.anchorPrice) {
      // Use custom anchor price
      dispatch({ 
        type: 'UPDATE_BTC_DATA',
        payload: { anchorPrice: state.settings.anchorPrice }
      });
    }
  }, [state.settings, state.logs, state.btcData.previousClose]);

  // Mutations
  const saveSettingsMutation = useMutation({
    mutationFn: saveBonsaiSettings,
    onSuccess: (data) => {
      dispatch({ type: 'SET_SETTINGS', payload: data });
      queryClient.invalidateQueries({ queryKey: ['/api/bonsai/settings'] });
    }
  });

  const addLogMutation = useMutation({
    mutationFn: addBonsaiLog,
    onSuccess: (data) => {
      dispatch({ type: 'ADD_LOG', payload: data });
      queryClient.invalidateQueries({ queryKey: ['/api/bonsai/logs'] });
    }
  });

  // Action creators
  const updateBtcData = useCallback((data: UpdateBtcDataParams) => {
    dispatch({ type: 'UPDATE_BTC_DATA', payload: data });
  }, []);

  const saveSettings = useCallback(async (settings: SaveSettingsParams) => {
    return await saveSettingsMutation.mutateAsync(settings);
  }, [saveSettingsMutation]);

  const addLog = useCallback(async (log: AddLogParams) => {
    return await addLogMutation.mutateAsync(log);
  }, [addLogMutation]);

  // Create context value
  const contextValue = useMemo(() => ({
    ...state,
    updateBtcData,
    saveSettings,
    addLog
  }), [state, updateBtcData, saveSettings, addLog]);

  return React.createElement(BonsaiContext.Provider, { value: contextValue }, children);
}

// Create hook for using the context
export function useBonsaiStore() {
  const context = useContext(BonsaiContext);
  if (context === undefined) {
    throw new Error('useBonsaiStore must be used within a BonsaiProvider');
  }
  return context;
}