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

  // Fetch real weather data from API
  const fetchWeatherForCity = async (cityName: string): Promise<WeatherData | null> => {
    try {
      const apiKey = '37781fb79e564cf493f112949250706';
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&aqi=no`;
      
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
      
      // Update weather data in state
      setWeatherData(prev => ({
        ...prev,
        [cityName]: weatherInfo
      }));
      
      return weatherInfo;
    } catch (error) {
      console.error('Failed to fetch weather for', cityName, ':', error);
      return null;
    }
  };

  // Fetch multi-day forecast data from API
  const fetchForecastForCity = async (cityName: string, days: number): Promise<WeatherData[] | null> => {
    try {
      const apiKey = '37781fb79e564cf493f112949250706';
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}`;
      
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
  };

  // Update itinerary when activities or dates change
  useEffect(() => {
    if (!startDate || !endDate || Object.keys(selectedActivities).length === 0) return;

    const newItinerary: TripDay[] = [];
    let currentDate = new Date(startDate);

    destinations.forEach(destination => {
      const activities = selectedActivities[destination.id] || [];
      if (activities.length === 0) return;

      // Sort activities by preference match
      const sortedActivities = [...activities].sort((a, b) => {
        const aCategories = a.categories || [];
        const bCategories = b.categories || [];
        const aMatches = aCategories.filter(cat => preferences.includes(cat)).length;
        const bMatches = bCategories.filter(cat => preferences.includes(cat)).length;
        
        // Also consider weather appropriateness if weather data is available
        const cityWeather = weatherData[destination.name];
        if (cityWeather) {
          if (cityWeather.isRainy) {
            // Prioritize indoor activities when raining
            if (a.indoor && !b.indoor) return -1;
            if (!a.indoor && b.indoor) return 1;
          }
        }
        
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
          const cityWeather = weatherData[destination.name];
          
          // Check for weather warnings
          const hasOutdoorActivitiesInRain = cityWeather?.isRainy && 
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
            weatherData: cityWeather,
            warning
          });
        }

        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    setDailyItinerary(newItinerary);
  }, [startDate, endDate, selectedActivities, destinations, preferences, weatherData]);

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
    // Fetch weather for new destination
    fetchWeatherForCity(destination.name);
  };

  const removeDestination = (destinationId: string) => {
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
    fetchForecastForCity
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};