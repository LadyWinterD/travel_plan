// src/context/AppContext.tsx - 最终完整修正版

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Destination, Activity, TripDay, WeatherData, ScheduledActivity } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';

// 1. 更新 Context 的类型定义
interface AppContextType {
  destinations: Destination[];
  startDate: Date | null;
  endDate: Date | null;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  preferences: string[];
  
  // 新增的天气状态
  weather: Record<string, WeatherData>; // 从 weatherData 改为 weather，类型也变了
  isWeatherLoading: boolean;
  weatherError: string | null;

  // Actions
  addDestination: (destination: Destination) => void;
  removeDestination: (destinationId: string) => void;
  updateDestination: (destinationId: string, updates: Partial<Destination>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  toggleActivity: (destinationId: string, activity: Activity) => void;
  updateItinerary: (newItinerary: TripDay[]) => void;
  resetTrip: () => void;
  updatePreferences: (newPreferences: string[]) => void;
  fetchWeatherForCity: (cityName: string) => Promise<void>; // 新增的获取天气的方法
}

// 这里只是一个默认结构，实际值由 Provider 提供
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// ... (generateTimeSlots 函数保持不变)
const generateTimeSlots = (activities: Activity[], daysAvailable: number): ScheduledActivity[] => { /* ... */ };


export const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);
  
  // ==================== 2. 全新的天气管理逻辑 ====================
  const [weather, setWeather] = useState<Record<string, WeatherData>>(initialData?.weather || {});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeatherForCity = useCallback(async (cityName: string) => {
    if (weather[cityName]) return; // 如果已有数据，则不重复获取

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
      const message = err instanceof Error ? err.message : 'Unknown weather error';
      setWeatherError(message);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weather]);
  // ==============================================================

  // 3. 改造主要的 useEffect，让它使用真实天气数据
  useEffect(() => {
    if (!startDate || !endDate || Object.keys(selectedActivities).length === 0) return;

    const newItinerary: TripDay[] = [];
    let currentDate = new Date(startDate);

    destinations.forEach(destination => {
      const activities = selectedActivities[destination.id] || [];
      if (activities.length === 0) return;

      // 从中央 state 获取当前城市的真实天气
      const currentCityWeather = weather[destination.name];

      // 排序时使用真实天气（如果存在）
      const sortedActivities = [...activities].sort((a, b) => {
        let weatherScoreA = 0;
        let weatherScoreB = 0;
        if (currentCityWeather?.isRainy) {
          if (a.indoor && !b.indoor) weatherScoreA = 1;
          if (!a.indoor && b.indoor) weatherScoreB = 1;
        }
        
        const aMatches = (a.categories || []).filter(cat => preferences.includes(cat)).length;
        const bMatches = (b.categories || []).filter(cat => preferences.includes(cat)).length;
        
        // 优先考虑天气匹配，其次是偏好匹配
        if(weatherScoreB !== weatherScoreA) return weatherScoreB - weatherScoreA;
        return bMatches - aMatches;
      });

      const scheduledActivities = generateTimeSlots(sortedActivities, destination.days);

      for (let i = 0; i < destination.days; i++) {
        const dayActivities = scheduledActivities.filter(act => act.day === i).map(/*...*/);

        if (dayActivities.length > 0) {
          const dateStr = currentDate.toISOString();
          // 生成行程和警告时，也使用真实天气数据
          const dayWeather = currentCityWeather || null; 

          let warning = undefined;
          if (dayWeather?.isRainy && dayActivities.some(act => !act.activity.indoor)) {
            warning = `Outdoor activities scheduled on a rainy day.`;
          }
          
          newItinerary.push({
            id: `day-${dateStr}`,
            date: dateStr,
            destinationId: destination.id,
            activities: dayActivities,
            weatherData: dayWeather, // <-- 使用真实天气或 null
            warning,
          });
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    setDailyItinerary(newItinerary);
  }, [startDate, endDate, selectedActivities, destinations, preferences, weather]); // <-- weather 现在是依赖项

  // ... (你其他的函数 addDestination, removeDestination 等保持不变) ...

  const contextValue: AppContextType = {
    destinations,
    startDate,
    endDate,
    selectedActivities,
    dailyItinerary,
    preferences,
    // 4. 暴露新的天气状态和方法
    weather,
    isWeatherLoading,
    weatherError,
    fetchWeatherForCity,
    // ... 其他方法 ...
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