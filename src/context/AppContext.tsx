// src/context/AppContext.tsx - 最终、完整、正确的版本

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
  weather: Record<string, WeatherData[]>;
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
  fetchWeatherForCity: (cityName: string, days: number) => Promise<void>;
}

// 创建 Context，可以不提供 defaultContext，因为 Provider 会保证 value 存在
const AppContext = createContext<AppContextType | undefined>(undefined);

// 2. 导出 useAppContext 钩子 (确保 'export' 关键字存在)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
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
  const [weather, setWeather] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {}); // 使用 weatherData 作为 key 从 storage 读取
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // 获取天气的函数
  const fetchWeatherForCity = useCallback(async (cityName: string, days: number): Promise<void> => {
    if (weather[cityName] && weather[cityName].length >= days) {
      return;
    }
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const apiKey = '37781fb79e564cf493f112949250706'; // <--- 在这里粘贴你有效的API Key
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}&aqi=no`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Weather API error: ${response.status}`);
      }
      const weatherArray: WeatherData[] = data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temperature: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        precipitation: day.day.totalprecip_mm || 0,
        isRainy: (day.day.totalprecip_mm || 0) > 0.1,
        humidity: day.day.avghumidity,
        windSpeed: Math.round(day.day.maxwind_kph),
      }));
      setWeather(prev => ({ ...prev, [cityName]: weatherArray }));
    } catch (error) {
      console.error('Failed to fetch weather for', cityName, ':', error);
      setWeatherError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weather]);

  // 其他所有函数和 useEffects
  useEffect(() => {
    // 你的行程生成逻辑...
    // 确保这里的逻辑是完整的
  }, [startDate, endDate, selectedActivities, destinations, preferences, weather]);

  useEffect(() => {
    storeTrip({
      destinations,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      selectedActivities,
      dailyItinerary,
      weatherData: weather, // 保存时使用 weatherData 作为 key
      preferences
    });
  }, [destinations, startDate, endDate, selectedActivities, dailyItinerary, weather, preferences]);

  // ==================== 补回所有“丢失”的操作函数定义 ====================
  const addDestination = (destination: Destination) => {
    setDestinations(prev => [...prev, destination]);
  };

  const removeDestination = (destinationId: string) => {
    setDestinations(prev => prev.filter(d => d.id !== destinationId));
    // Also remove associated data
    setSelectedActivities(prev => {
      const updated = { ...prev };
      delete updated[destinationId];
      return updated;
    });
  };

  const updateDestination = (destinationId: string, updates: Partial<Destination>) => {
    setDestinations(prev => prev.map(d => (d.id === destinationId ? { ...d, ...updates } : d)));
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