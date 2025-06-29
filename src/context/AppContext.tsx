import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Destination, Activity, TripDay, WeatherData, ScheduledActivity, UserPreferences } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';

interface AppContextType {
  destinations: Destination[];
  startDate: Date | null;
  endDate: Date | null;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  weatherData: Record<string, WeatherData>;
  forecasts: Record<string, WeatherData[]>;
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
  fetchWeatherForCity: (cityName: string) => Promise<WeatherData | null>;
  fetchForecastForCity: (cityName: string, days: number) => Promise<WeatherData[] | null>;
  fetchWeatherForDate: (cityName: string, date: Date) => Promise<WeatherData | null>;
}

const defaultContext: AppContextType = {
  destinations: [],
  startDate: null,
  endDate: null,
  selectedActivities: {},
  dailyItinerary: [],
  weatherData: {},
  forecasts: {},
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
  fetchForecastForCity: async () => null,
  fetchWeatherForDate: async () => null,
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
  weather: WeatherData,
  preferences: string[] = []
): Activity[] => {
  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (weather.isRainy && !activity.indoor) {
      return false; // Avoid outdoor activities when raining
    }
    if (weather.temperature < 5 && !activity.indoor) {
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
    if (weather.isRainy || weather.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });
};

export const AppContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>(initialData?.weatherData || {});
  const [forecasts, setForecasts] = useState<Record<string, WeatherData[]>>({});
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);

  // Track which cities we've already fetched weather for to prevent loops
  const [fetchedWeatherCities, setFetchedWeatherCities] = useState<Set<string>>(new Set());

  // Calculate days between two dates
  const getDaysBetween = (date1: Date, date2: Date): number => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if date is in the future (within 14 days for forecast)
  const isWithinForecastRange = (date: Date): boolean => {
    const today = new Date();
    const daysDiff = getDaysBetween(today, date);
    return date >= today && daysDiff <= 14;
  };

  // Check if date is in the past (for historical weather)
  const isHistoricalDate = (date: Date): boolean => {
    const today = new Date();
    return date < today;
  };

  // Fetch weather for a specific date
  const fetchWeatherForDate = useCallback(async (cityName: string, date: Date): Promise<WeatherData | null> => {
    try {
      const apiKey = '37781fb79e564cf493f112949250706';
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      let url: string;
      let isHistorical = false;
      
      if (isWithinForecastRange(date)) {
        // Use forecast API for future dates within 14 days
        const daysFromNow = getDaysBetween(new Date(), date);
        url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${Math.max(1, daysFromNow + 1)}`;
        console.log(`🌤️ Fetching forecast weather for ${cityName} on ${dateStr}...`);
      } else if (isHistoricalDate(date)) {
        // Use history API for past dates
        url = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&dt=${dateStr}`;
        isHistorical = true;
        console.log(`🌤️ Fetching historical weather for ${cityName} on ${dateStr}...`);
      } else {
        // For dates beyond 14 days in the future, use current weather as approximation
        url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&aqi=no`;
        console.log(`🌤️ Fetching current weather for ${cityName} (date beyond forecast range: ${dateStr})...`);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      let weatherInfo: WeatherData;
      
      if (isHistorical) {
        // Historical weather data structure
        const dayData = data.forecast.forecastday[0].day;
        weatherInfo = {
          date: dateStr,
          temperature: Math.round(dayData.avgtemp_c),
          condition: dayData.condition.text,
          icon: dayData.condition.icon,
          precipitation: dayData.totalprecip_mm || 0,
          isRainy: (dayData.totalprecip_mm || 0) > 0.1
        };
      } else if (isWithinForecastRange(date)) {
        // Forecast weather data structure
        const targetDay = data.forecast.forecastday.find((day: any) => day.date === dateStr);
        if (targetDay) {
          weatherInfo = {
            date: dateStr,
            temperature: Math.round(targetDay.day.avgtemp_c),
            condition: targetDay.day.condition.text,
            icon: targetDay.day.condition.icon,
            precipitation: targetDay.day.totalprecip_mm || 0,
            isRainy: (targetDay.day.totalprecip_mm || 0) > 0.1
          };
        } else {
          // Fallback to current weather if specific day not found
          weatherInfo = {
            date: dateStr,
            temperature: Math.round(data.current.temp_c),
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            precipitation: data.current.precip_mm || 0,
            isRainy: (data.current.precip_mm || 0) > 0.1
          };
        }
      } else {
        // Current weather as approximation for far future dates
        weatherInfo = {
          date: dateStr,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text + ' (estimated)',
          icon: data.current.condition.icon,
          precipitation: data.current.precip_mm || 0,
          isRainy: (data.current.precip_mm || 0) > 0.1
        };
      }
      
      console.log(`✅ Weather fetched for ${cityName} on ${dateStr}:`, weatherInfo);
      
      // Cache the weather data with date-specific key
      const cacheKey = `${cityName}_${dateStr}`;
      setWeatherData(prev => ({
        ...prev,
        [cacheKey]: weatherInfo
      }));
      
      return weatherInfo;
    } catch (error) {
      console.error(`Failed to fetch weather for ${cityName} on ${date.toISOString().split('T')[0]}:`, error);
      return null;
    }
  }, []);

  // Fetch real weather data from API (current weather)
  const fetchWeatherForCity = useCallback(async (cityName: string): Promise<WeatherData | null> => {
    // If we have travel dates, fetch weather for the start date instead of current weather
    if (startDate) {
      return fetchWeatherForDate(cityName, startDate);
    }

    // Prevent duplicate requests
    if (fetchedWeatherCities.has(cityName)) {
      return weatherData[cityName] || null;
    }

    try {
      const apiKey = '37781fb79e564cf493f112949250706';
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&aqi=no`;
      
      console.log(`🌤️ Fetching current weather for ${cityName}...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const weatherInfo: WeatherData = {
        date: new Date().toISOString(),
        temperature: Math.round(data.current.temp_c),
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        precipitation: data.current.precip_mm || 0,
        isRainy: (data.current.precip_mm || 0) > 0.1
      };
      
      console.log(`✅ Current weather fetched for ${cityName}:`, weatherInfo);
      
      // Update weather data in state
      setWeatherData(prev => ({
        ...prev,
        [cityName]: weatherInfo
      }));

      // Mark this city as fetched
      setFetchedWeatherCities(prev => new Set([...prev, cityName]));
      
      return weatherInfo;
    } catch (error) {
      console.error('Failed to fetch current weather for', cityName, ':', error);
      // Mark as fetched even on error to prevent retry loops
      setFetchedWeatherCities(prev => new Set([...prev, cityName]));
      return null;
    }
  }, [weatherData, fetchedWeatherCities, startDate, fetchWeatherForDate]);

  // Fetch multi-day forecast data from API
  const fetchForecastForCity = useCallback(async (cityName: string, days: number): Promise<WeatherData[] | null> => {
    try {
      const apiKey = '37781fb79e564cf493f112949250706';
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}`;
      
      console.log(`🌤️ Fetching ${days}-day forecast for ${cityName}...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const forecastArray: WeatherData[] = data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temperature: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        precipitation: day.day.totalprecip_mm || 0,
        isRainy: (day.day.totalprecip_mm || 0) > 0.1
      }));
      
      console.log(`✅ Forecast fetched for ${cityName}:`, forecastArray);
      
      // Update forecasts state
      setForecasts(prev => ({
        ...prev,
        [cityName]: forecastArray
      }));
      
      return forecastArray;
    } catch (error) {
      console.error('Failed to fetch forecast for', cityName, ':', error);
      return null;
    }
  }, []);

  // Update itinerary when activities or dates change
  useEffect(() => {
    if (!startDate || !endDate || Object.keys(selectedActivities).length === 0) return;

    const updateItineraryWithWeather = async () => {
      const newItinerary: TripDay[] = [];
      let currentDate = new Date(startDate);

      for (const destination of destinations) {
        const activities = selectedActivities[destination.id] || [];
        if (activities.length === 0) continue;

        // Sort activities by preference match
        const sortedActivities = [...activities].sort((a, b) => {
          const aCategories = a.categories || [];
          const bCategories = b.categories || [];
          const aMatches = aCategories.filter(cat => preferences.includes(cat)).length;
          const bMatches = bCategories.filter(cat => preferences.includes(cat)).length;
          return bMatches - aMatches;
        });

        const scheduledActivities = generateTimeSlots(sortedActivities, destination.days);

        // Create days for this destination
        for (let i = 0; i < destination.days; i++) {
          const dayActivities = scheduledActivities
            .filter(act => act.day === i)
            .map(({ activityId, startTime, endTime, activity }) => ({
              activityId,
              startTime,
              endTime,
              activity
            }));

          if (dayActivities.length > 0) {
            const dailyDuration = dayActivities.reduce((sum, act) => sum + act.activity.duration, 0);
            
            // Fetch weather for this specific date
            const dayWeather = await fetchWeatherForDate(destination.name, currentDate);
            
            // Check for weather warnings
            const hasOutdoorActivitiesInRain = dayWeather?.isRainy && 
              dayActivities.some(act => !act.activity.indoor);
            
            let warning = undefined;
            if (dailyDuration > 360) {
              warning = `This day's schedule exceeds 6 hours. Consider spreading activities across multiple days.`;
            } else if (hasOutdoorActivitiesInRain) {
              warning = `There are outdoor activities scheduled on a rainy day. Consider rearranging if possible.`;
            }
            
            newItinerary.push({
              id: `day-${currentDate.toISOString()}`,
              date: currentDate.toISOString(),
              destinationId: destination.id,
              activities: dayActivities,
              weatherData: dayWeather || undefined,
              warning
            });
          }

          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      }

      setDailyItinerary(newItinerary);
    };

    updateItineraryWithWeather();
  }, [startDate, endDate, selectedActivities, destinations, preferences, fetchWeatherForDate]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (destinations.length > 0 || startDate || endDate || preferences.length > 0) {
      storeTrip({
        destinations,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        selectedActivities,
        dailyItinerary,
        weatherData,
        preferences
      });
    }
  }, [destinations, startDate, endDate, selectedActivities, dailyItinerary, weatherData, preferences]);

  const addDestination = (destination: Destination) => {
    setDestinations(prev => [...prev, destination]);
    setSelectedActivities(prev => ({
      ...prev,
      [destination.id]: []
    }));
    // Fetch weather for travel dates if available, otherwise current weather
    if (startDate) {
      fetchWeatherForDate(destination.name, startDate);
    } else if (!fetchedWeatherCities.has(destination.name)) {
      fetchWeatherForCity(destination.name);
    }
  };

  const removeDestination = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    if (destination) {
      // Remove from fetched cities set when destination is removed
      setFetchedWeatherCities(prev => {
        const newSet = new Set(prev);
        newSet.delete(destination.name);
        return newSet;
      });
    }
    
    setDestinations(prev => prev.filter(d => d.id !== destinationId));
    setSelectedActivities(prev => {
      const updated = { ...prev };
      delete updated[destinationId];
      return updated;
    });
    setDailyItinerary(prev => prev.filter(day => day.destinationId !== destinationId));
  };

  const updateDestination = (destinationId: string, updates: Partial<Destination>) => {
    setDestinations(prev => 
      prev.map(d => d.id === destinationId ? { ...d, ...updates } : d)
    );
  };

  const setDates = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    
    // When dates change, refresh weather data for all destinations
    if (start) {
      destinations.forEach(destination => {
        fetchWeatherForDate(destination.name, start);
      });
    }
  };

  const toggleActivity = (destinationId: string, activity: Activity) => {
    setSelectedActivities(prev => {
      const destinationActivities = prev[destinationId] || [];
      const activityExists = destinationActivities.some(a => a.id === activity.id);
      
      const updatedActivities = activityExists
        ? destinationActivities.filter(a => a.id !== activity.id)
        : [...destinationActivities, activity];
        
      return {
        ...prev,
        [destinationId]: updatedActivities
      };
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
    setWeatherData({});
    setForecasts({});
    setPreferences([]);
    setFetchedWeatherCities(new Set());
    localStorage.removeItem('travelPlanner');
  };

  const contextValue: AppContextType = {
    destinations,
    startDate,
    endDate,
    selectedActivities,
    dailyItinerary,
    weatherData,
    forecasts,
    preferences,
    
    addDestination,
    removeDestination,
    updateDestination,
    setDates,
    toggleActivity,
    updateItinerary,
    resetTrip,
    updatePreferences,
    fetchWeatherForCity,
    fetchForecastForCity,
    fetchWeatherForDate
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};