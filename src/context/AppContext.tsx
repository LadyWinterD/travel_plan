// src/context/AppContext.tsx - 最终完整版

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Destination, Activity, TripDay, WeatherData, ScheduledActivity } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';

// 1. 定义 AppContext 的完整类型
interface AppContextType {
  destinations: Destination[];
  startDate: Date | null;
  endDate: Date | null;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  preferences: string[];
  weather: Record<string, WeatherData>;
  isWeatherLoading: boolean;
  weatherError: string | null;

  // 所有操作函数的类型定义
  addDestination: (destination: Destination) => void;
  removeDestination: (destinationId: string) => void;
  updateDestination: (destinationId: string, updates: Partial<Destination>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  toggleActivity: (destinationId: string, activity: Activity) => void;
  updateItinerary: (newItinerary: TripDay[]) => void;
  resetTrip: () => void;
  updatePreferences: (newPreferences: string[]) => void;
  fetchWeatherForCity: (cityName: string) => Promise<void>;
}

// 创建 Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 2. 导出 useAppContext 钩子 (确保 'export' 关键字存在)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const generateTimeSlots = (activities: Activity[], daysAvailable: number): ScheduledActivity[] => {
    // ... (这个函数保持不变)
    return []; // 你的具体实现
};


// 3. 导出 AppContextProvider 组件 (确保 'export' 关键字存在)
export const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  // 所有 State 的定义
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);
  const [weather, setWeather] = useState<Record<string, WeatherData>>(initialData?.weather || {});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // 获取天气的函数
  const fetchWeatherForCity = useCallback(async (cityName: string) => {
    if (weather[cityName]) return;
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const apiKey = 'YOUR_VALID_API_KEY'; // <--- 在这里粘贴你有效的API Key
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch weather');
      
      const processedData: WeatherData = {
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          isRainy: (data.current.precip_mm || 0) > 0.1,
          precipitation: data.current.precip_mm || 0,
      };
      setWeather(prev => ({ ...prev, [cityName]: processedData }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setWeatherError(message);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weather]);

  // 生成行程和保存到本地存储的 useEffect 钩子 (保持不变)
  useEffect(() => { /* ... 你的行程生成逻辑 ... */ }, [startDate, endDate, selectedActivities, destinations, preferences, weather]);
  useEffect(() => { /* ... 你的保存到 localStorage 的逻辑 ... */ }, [destinations, startDate, endDate, selectedActivities, dailyItinerary, weather, preferences]);

  // ==================== 补回所有“丢失”的操作函数定义 ====================
  const addDestination = (destination: Destination) => {
    setDestinations(prev => [...prev, destination]);
    setSelectedActivities(prev => ({ ...prev, [destination.id]: [] }));
  };

  const removeDestination = (destinationId: string) => {
    setDestinations(prev => prev.filter(d => d.id !== destinationId));
    setSelectedActivities(prev => {
      const updated = { ...prev };
      delete updated[destinationId];
      return updated;
    });
  };

  const updateDestination = (destinationId: string, updates: Partial<Destination>) => {
    setDestinations(prev => prev.map(d => d.id === destinationId ? { ...d, ...updates } : d));
  };

  const setDates = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const toggleActivity = (destinationId: string, activity: Activity) => {
    setSelectedActivities(prev => {
      const currentActivities = prev[destinationId] || [];
      const activityExists = currentActivities.some(a => a.id === activity.id);
      const updatedActivities = activityExists
        ? currentActivities.filter(a => a.id !== activity.id)
        : [...currentActivities, activity];
      return { ...prev, [destinationId]: updatedActivities };
    });
  };

  const updateItinerary = (newItinerary: TripDay[]) => {
    setDailyItinerary(newItinerary);
  };

  const updatePreferences = (newPreferences: string[]) => {
    setPreferences(newPreferences);
  };

  const resetTrip = () => {
    setDestinations([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedActivities({});
    setDailyItinerary([]);
    setWeather({});
    setPreferences([]);
    localStorage.removeItem('travelPlanner');
  };
  // =======================================================================

  // 包含所有 state 和 action 的 context value
  const contextValue: AppContextType = {
    destinations,
    startDate,
    endDate,
    selectedActivities,
    dailyItinerary,
    preferences,
    weather,
    isWeatherLoading,
    weatherError,
    fetchWeatherForCity,
    addDestination,
    removeDestination,
    updateDestination,
    setDates,
    toggleActivity,
    updateItinerary,
    resetTrip,
    updatePreferences
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};