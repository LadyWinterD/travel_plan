import { Activity, WeatherData } from '../types';
import { getRealActivitiesForCity, getWeatherBasedRecommendations } from './realActivityData';
import { OpenTripMapApiError } from '../services/openTripMapApi';

// Enhanced Mock Weather Data with more realistic patterns
export const getMockWeather = (destinationId: string, date: string): WeatherData => {
  const dateObj = new Date(date);
  const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Create seasonal temperature patterns
  const seasonalTemp = 15 + 10 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
  const dailyVariation = (Math.sin(dayOfYear * 0.1) * 5);
  const randomVariation = (Math.random() - 0.5) * 8;
  
  const temperature = Math.round(seasonalTemp + dailyVariation + randomVariation);
  
  // Weather patterns based on season and randomness
  const rainChance = 0.2 + 0.1 * Math.sin((dayOfYear - 120) * 2 * Math.PI / 365) + Math.random() * 0.3;
  const isRainy = rainChance > 0.6;
  
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'];
  let condition: string;
  let precipitation = 0;
  
  if (isRainy) {
    condition = Math.random() > 0.5 ? 'Light Rain' : 'Heavy Rain';
    precipitation = Math.random() * 15 + 2;
  } else if (temperature > 25) {
    condition = 'Sunny';
  } else if (temperature > 15) {
    condition = Math.random() > 0.5 ? 'Partly Cloudy' : 'Sunny';
  } else {
    condition = 'Cloudy';
  }
  
  return {
    date,
    temperature,
    condition,
    icon: isRainy ? '🌧️' : temperature > 25 ? '☀️' : temperature > 15 ? '⛅' : '☁️',
    precipitation,
    isRainy
  };
};

/**
 * UPDATED: Now uses real OpenTripMap API data instead of mock data
 * This function completely replaces the old mock data system
 */
export const getMockActivities = async (destinationId: string, cityName?: string): Promise<Activity[]> => {
  // If no city name provided, return empty array (no more fallback mock data)
  if (!cityName) {
    console.log('⚠️ No city name provided, cannot fetch real activities');
    return [];
  }

  try {
    console.log(`🚀 Fetching REAL activities for: ${cityName} using OpenTripMap API`);
    
    // Use the new real activity data function
    const realActivities = await getRealActivitiesForCity(cityName);
    
    if (!realActivities || realActivities.length === 0) {
      console.log(`❌ No real activities found for: ${cityName}`);
      return [];
    }

    console.log(`✅ Successfully fetched ${realActivities.length} REAL activities for ${cityName}`);
    return realActivities;

  } catch (error) {
    console.error(`❌ Error fetching real activities for ${cityName}:`, error);
    
    if (error instanceof OpenTripMapApiError) {
      console.log('🔄 OpenTripMap API error, returning empty array');
    }
    
    // No more fallback to mock data - return empty array
    return [];
  }
};

// Export the real weather-based recommendations function
export { getWeatherBasedRecommendations };