import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Destination, Activity, TripDay, WeatherData, ScheduledActivity, UserPreferences } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';
import { getMockActivities } from '../utils/mockData';

interface AppContextType {
  destinations: Destination[];
  startDate: Date | null;
  endDate: Date | null;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  weatherData: Record<string, WeatherData[]>;
  preferences: string[];
  
  // Actions
  addDestination: (destination: Destination) => void;
  removeDestination: (destinationId: string) => void;
  updateDestination: (destinationId: string, updates: Partial<Destination>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  toggleActivity: (destinationId: string, activity: Activity) => void;
  updateItinerary: (newItinerary: TripDay[]) => void;
  resetTrip: () => void;
  updatePreferences: (newPreferences: string[]) => void;
  fetchWeatherForCity: (cityName: string, days: number) => Promise<WeatherData[] | null>;
}

const defaultContext: AppContextType = {
  destinations: [],
  startDate: null,
  endDate: null,
  selectedActivities: {},
  dailyItinerary: [],
  weatherData: {},
  preferences: [],
  
  addDestination: () => {},
  removeDestination: () => {},
  updateDestination: () => {},
  setDates: () => {},
  toggleActivity: () => {},
  updateItinerary: () => {},
  resetTrip: () => {},
  updatePreferences: () => {},
  fetchWeatherForCity: async () => null,
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

const generateTimeSlots = (activities: Activity[], daysAvailable: number): ScheduledActivity[] => {
  const MINUTES_PER_DAY = 720; // 12 hours per day (8 AM - 8 PM)
  let currentTime = 480; // Start at 8 AM (in minutes from midnight)
  let currentDay = 0;
  
  return activities.map(activity => {
    // If adding this activity would exceed 6 hours and we have more days available
    if (currentTime - 480 + activity.duration > 360 && currentDay < daysAvailable - 1) {
      currentTime = 480; // Reset to 8 AM
      currentDay++;
    }
    
    const startTime = `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`;
    currentTime += activity.duration;
    const endTime = `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`;
    
    return {
      activityId: activity.id,
      startTime,
      endTime,
      activity,
      day: currentDay
    };
  });
};

const getWeatherBasedRecommendations = (
  activities: Activity[], 
  weather: WeatherData[],
  preferences: string[] = []
): Activity[] => {
  // Use the first day's weather for filtering (can be enhanced later)
  const currentWeather = weather[0];
  if (!currentWeather) return activities;

  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (currentWeather.isRainy && !activity.indoor) {
      return false; // Avoid outdoor activities when raining
    }
    if (currentWeather.temperature < 5 && !activity.indoor) {
      return false; // Avoid outdoor activities when very cold
    }
    return true;
  });

  // Apply preference filtering if preferences exist
  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  // Sort by rating and weather appropriateness
  return weatherAppropriate.sort((a, b) => {
    // Prioritize indoor activities during bad weather
    if (currentWeather.isRainy || currentWeather.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });
};

export const AppContextProvider: React.FC<{children: React.Node}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  // **修正 1: 将 weatherData 改名为 weather，保持一致性**
  const [weather, setWeather] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {});
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);


  const fetchWeatherForCity = useCallback(async (cityName: string, days: number): Promise<WeatherData[] | null> => {
    // 如果已有数据，则不重复获取，提高效率
    if (weather[cityName] && weather[cityName].length >= days) {
      return weather[cityName];
    }
    
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const apiKey = 'YOUR_VALID_API_KEY'; // <--- 请确保这里是你的有效 API Key
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}&aqi=no`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const weatherArray: WeatherData[] = data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temperature: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        precipitation: day.day.totalprecip_mm || 0,
        isRainy: (day.day.totalprecip_mm || 0) > 0.1
      }));
      
      setWeather(prev => ({ ...prev, [cityName]: weatherArray }));
      
      return weatherArray;
    } catch (error) {
      console.error('Failed to fetch weather for', cityName, ':', error);
      setWeatherError(error instanceof Error ? error.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weather]);


  const contextValue: AppContextType = {
    destinations,
    startDate,
    endDate,
    selectedActivities,
    dailyItinerary,
    weather,
    preferences,
    isWeatherLoading,
    weatherError,
    
    addDestination,
    removeDestination,
    updateDestination,
    setDates,
    toggleActivity,
    updateItinerary,
    resetTrip,
    updatePreferences,
    fetchWeatherForCity
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};