import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AppContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {});
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || []);

  // Fetch multi-day weather data from API
  const fetchWeatherForCity = async (cityName: string, days: number): Promise<WeatherData[] | null> => {
    try {
      const apiKey = 'f37afaba87034221b29110532250706';
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cityName)}&days=${days}&aqi=no`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const weatherArray: WeatherData[] = data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temperature: Math.round(day.day.avgtemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        precipitation: day.day.totalprecip_mm || 0,
        isRainy: (day.day.totalprecip_mm || 0) > 0.1
      }));
      
      // Update weather data in state
      setWeatherData(prev => ({
        ...prev,
        [cityName]: weatherArray
      }));
      
      return weatherArray;
    } catch (error) {
      console.error('Failed to fetch weather for', cityName, ':', error);
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
        if (cityWeather && cityWeather.length > 0) {
          const currentWeather = cityWeather[0];
          if (currentWeather.isRainy) {
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
          const dayWeather = cityWeather && cityWeather[i] ? cityWeather[i] : undefined;
          
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
            weatherData: dayWeather,
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
    // Fetch weather for new destination (default to 7 days)
    fetchWeatherForCity(destination.name, 7);
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
    preferences,
    
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