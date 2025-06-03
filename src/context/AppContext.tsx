import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination, Activity, TripDay, WeatherData } from '../types';
import { getStoredTrip, storeTrip } from '../utils/storage';

interface AppContextType {
  destinations: Destination[];
  startDate: Date | null;
  endDate: Date | null;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  weatherData: Record<string, WeatherData[]>;
  
  // Actions
  addDestination: (destination: Destination) => void;
  removeDestination: (destinationId: string) => void;
  updateDestination: (destinationId: string, updates: Partial<Destination>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  toggleActivity: (destinationId: string, activity: Activity) => void;
  updateItinerary: (newItinerary: TripDay[]) => void;
  resetTrip: () => void;
}

const defaultContext: AppContextType = {
  destinations: [],
  startDate: null,
  endDate: null,
  selectedActivities: {},
  dailyItinerary: [],
  weatherData: {},
  
  addDestination: () => {},
  removeDestination: () => {},
  updateDestination: () => {},
  setDates: () => {},
  toggleActivity: () => {},
  updateItinerary: () => {},
  resetTrip: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

const generateTimeSlots = (activities: Activity[], daysAvailable: number): ScheduledActivity[] => {
  const MINUTES_PER_DAY = 720; // 12 hours per day (8 AM - 8 PM)
  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
  const averageDailyDuration = Math.ceil(totalDuration / daysAvailable);
  
  let currentTime = 480; // Start at 8 AM (in minutes from midnight)
  let currentDay = 0;
  
  return activities.map(activity => {
    // If adding this activity would exceed 6 hours and we have more days available
    if (currentTime + activity.duration > 480 + MINUTES_PER_DAY / 2 && currentDay < daysAvailable - 1) {
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

export const AppContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load stored trip data or use defaults
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {});

  // Update itinerary when activities or dates change
  useEffect(() => {
    if (!startDate || !endDate || Object.keys(selectedActivities).length === 0) return;

    const newItinerary: TripDay[] = [];
    let currentDate = new Date(startDate);

    destinations.forEach(destination => {
      const activities = selectedActivities[destination.id] || [];
      if (activities.length === 0) return;

      const scheduledActivities = generateTimeSlots(activities, destination.days);
      const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
      const isOverloaded = totalDuration > destination.days * 360; // 6 hours per day

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
          newItinerary.push({
            id: `day-${currentDate.toISOString()}`,
            date: currentDate.toISOString(),
            destinationId: destination.id,
            activities: dayActivities,
            warning: isOverloaded ? `This schedule might be tight. Consider spreading activities across ${Math.ceil(totalDuration / 360)} days.` : undefined
          });
        }

        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    setDailyItinerary(newItinerary);
  }, [startDate, endDate, selectedActivities, destinations]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (destinations.length > 0 || startDate || endDate) {
      storeTrip({
        destinations,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        selectedActivities,
        dailyItinerary,
        weatherData
      });
    }
  }, [destinations, startDate, endDate, selectedActivities, dailyItinerary, weatherData]);

  const addDestination = (destination: Destination) => {
    setDestinations(prev => [...prev, destination]);
    setSelectedActivities(prev => ({
      ...prev,
      [destination.id]: []
    }));
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

  const resetTrip = () => {
    setDestinations([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedActivities({});
    setDailyItinerary([]);
    setWeatherData({});
    localStorage.removeItem('travelPlanner');
  };

  const contextValue: AppContextType = {
    destinations,
    startDate,
    endDate,
    selectedActivities,
    dailyItinerary,
    weatherData,
    
    addDestination,
    removeDestination,
    updateDestination,
    setDates,
    toggleActivity,
    updateItinerary,
    resetTrip
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};