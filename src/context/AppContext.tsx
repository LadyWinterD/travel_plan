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

export const AppContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load stored trip data or use defaults
  const initialData = getStoredTrip();
  
  const [destinations, setDestinations] = useState<Destination[]>(initialData?.destinations || []);
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null);
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Activity[]>>(initialData?.selectedActivities || {});
  const [dailyItinerary, setDailyItinerary] = useState<TripDay[]>(initialData?.dailyItinerary || []);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData[]>>(initialData?.weatherData || {});

  // Save to localStorage when data changes
  useEffect(() => {
    if (destinations.length > 0 || startDate || endDate) {
      console.log('Saving trip data to localStorage:', {
        destinations,
        startDate,
        endDate,
        selectedActivities
      });
      
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
    console.log('Adding destination:', destination);
    setDestinations(prev => [...prev, destination]);
    setSelectedActivities(prev => ({
      ...prev,
      [destination.id]: []
    }));
  };

  const removeDestination = (destinationId: string) => {
    console.log('Removing destination:', destinationId);
    setDestinations(prev => prev.filter(d => d.id !== destinationId));
    
    setSelectedActivities(prev => {
      const updated = { ...prev };
      delete updated[destinationId];
      return updated;
    });
    
    setDailyItinerary(prev => prev.filter(day => day.destinationId !== destinationId));
  };

  const updateDestination = (destinationId: string, updates: Partial<Destination>) => {
    console.log('Updating destination:', destinationId, updates);
    setDestinations(prev => 
      prev.map(d => d.id === destinationId ? { ...d, ...updates } : d)
    );
  };

  const setDates = (start: Date | null, end: Date | null) => {
    console.log('Setting trip dates:', { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  const toggleActivity = (destinationId: string, activity: Activity) => {
    console.log('Toggling activity:', { destinationId, activity });
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
    console.log('Updating itinerary:', newItinerary);
    setDailyItinerary(newItinerary);
  };

  const resetTrip = () => {
    console.log('Resetting trip data');
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