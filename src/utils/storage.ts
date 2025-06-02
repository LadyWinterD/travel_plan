import { StoredTripData } from '../types';

const STORAGE_KEY = 'travelPlanner';

export const storeTrip = (data: StoredTripData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save trip data to localStorage:', error);
  }
};

export const getStoredTrip = (): StoredTripData | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    return JSON.parse(storedData) as StoredTripData;
  } catch (error) {
    console.error('Failed to retrieve trip data from localStorage:', error);
    return null;
  }
};

export const clearStoredTrip = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear trip data from localStorage:', error);
  }
};

// Cache API responses
export const cacheApiResponse = (key: string, data: any, expiryDays = 7): void => {
  try {
    const expiryTime = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      `apiCache_${key}`,
      JSON.stringify({
        data,
        expiry: expiryTime
      })
    );
  } catch (error) {
    console.error('Failed to cache API response:', error);
  }
};

export const getCachedApiResponse = (key: string): any | null => {
  try {
    const cachedItem = localStorage.getItem(`apiCache_${key}`);
    if (!cachedItem) return null;
    
    const { data, expiry } = JSON.parse(cachedItem);
    
    // Check if cache has expired
    if (Date.now() > expiry) {
      localStorage.removeItem(`apiCache_${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve cached API response:', error);
    return null;
  }
};