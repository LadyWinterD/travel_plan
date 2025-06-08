import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Destination, Activity, TripDay, WeatherData, ScheduledActivity } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);
  const [weather, setWeather] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeatherForCity = useCallback(async (cityName: string, days: number): Promise<void> => {
    if (weather[cityName] && weather[cityName].length >= days) return;
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const apiKey = '37781fb79e564cf493f112949250706'; // <--- 在这里粘贴你有效的API Key
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}&aqi=no`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Weather API error: ${response.status}`);
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
      setWeatherError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weather]);

  // ... (其他 useEffects 和 action functions)
  useEffect(() => { /* ... itinerary generation logic ... */ }, [/* ... a-z ... */]);
  useEffect(() => { /* ... localStorage saving logic ... */ }, [/* ... a-z ... */]);

  const addDestination = (destination: Destination) => { setDestinations(prev => [...prev, destination]); };
  const removeDestination = (destinationId: string) => { setDestinations(prev => prev.filter(d => d.id !== destinationId)); };
  const updateDestination = (destinationId: string, updates: Partial<Destination>) => { setDestinations(prev => prev.map(d => (d.id === destinationId ? { ...d, ...updates } : d))); };
  const setDates = (start: Date | null, end: Date | null) => { setStartDate(start); setEndDate(end); };
  const toggleActivity = (destinationId: string, activity: Activity) => { setSelectedActivities(prev => { const acts = prev[destinationId] || []; const exists = acts.some(a => a.id === activity.id); const newActs = exists ? acts.filter(a => a.id !== activity.id) : [...acts, activity]; return { ...prev, [destinationId]: newActs }; }); };
  const updateItinerary = (newItinerary: TripDay[]) => { setDailyItinerary(newItinerary); };
  const updatePreferences = (newPreferences: string[]) => { setPreferences(newPreferences); };
  const resetTrip = () => { /*... reset all states ...*/ };

  const contextValue = { destinations, startDate, endDate, selectedActivities, dailyItinerary, preferences, weather, isWeatherLoading, weatherError, fetchWeatherForCity, addDestination, removeDestination, updateDestination, setDates, toggleActivity, updateItinerary, resetTrip, updatePreferences };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};