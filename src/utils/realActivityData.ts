import { Activity } from '../types';
import { 
  getCoordinatesForCity, 
  getTopAttractions, 
  getPlaceDetails,
  extractCategoriesFromKinds,
  isLikelyIndoorFromKinds,
  getFallbackImageUrl,
  OpenTripMapApiError 
} from '../services/openTripMapApi';
import { getCachedApiResponse, cacheApiResponse } from './storage';
import { ActivityCategory } from '../data/activityCategories';

/**
 * Fetch real activities for a city using OpenTripMap API - Based on working HTML implementation
 * Includes 7-day caching to improve performance
 */
export async function getRealActivitiesForCity(cityName: string): Promise<Activity[]> {
  try {
    console.log(`🚀 Fetching real activities for: ${cityName}`);
    
    // Check cache first (7-day expiry)
    const cacheKey = `activities_${cityName.toLowerCase().replace(/\s+/g, '_')}`;
    const cachedActivities = getCachedApiResponse(cacheKey);
    
    if (cachedActivities) {
      console.log(`💾 Using cached activities for: ${cityName}`);
      return cachedActivities;
    }
    
    // Step 1: Get coordinates for the city
    const coordinates = await getCoordinatesForCity(cityName);
    if (!coordinates) {
      console.warn(`🟡 Could not find coordinates for city: ${cityName}`);
      return [];
    }
    
    // Step 2: Get filtered attractions using the working pipeline (30km radius)
    const attractions = await getTopAttractions(coordinates.lat, coordinates.lon, 30, cityName);
    if (attractions.length === 0) {
      console.warn(`🟡 No quality attractions found near: ${cityName}`);
      return [];
    }
    
    console.log(`🎯 Processing ${attractions.length} filtered attractions for ${cityName}`);
    
    // Step 3: Get detailed information for attractions (limit to 20 like working code)
    const activitiesPromises = attractions.map(async (attraction) => {
      try {
        // Get detailed info
        const details = await getPlaceDetails(attraction.xid);
        
        // Extract categories from kinds
        const categories = extractCategoriesFromKinds(attraction.kinds);
        const isIndoor = isLikelyIndoorFromKinds(attraction.kinds, attraction.name);
        
        // Determine image URL
        let imageUrl = getFallbackImageUrl(categories);
        if (details?.preview?.source) {
          imageUrl = details.preview.source;
        } else if (details?.image) {
          imageUrl = details.image;
        }
        
        // Create description from Wikipedia or fallback like working code
        let description = 'No detailed description available.';
        if (details?.wikipedia_extracts?.text) {
          description = details.wikipedia_extracts.text.substring(0, 120) + '...';
        }
        
        // Create activity object
        const activity: Activity = {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description,
          image: imageUrl,
          duration: getDurationFromCategories(categories),
          rating: Math.max(attraction.rate || 4.0, 3.5), // Ensure minimum 3.5 rating
          price: getPriceFromCategories(categories),
          categories,
          indoor: isIndoor,
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          }
        };
        
        console.log(`✅ Processed activity: ${activity.name} (${categories.join(', ')})`);
        return activity;
        
      } catch (error) {
        console.warn(`Failed to get details for ${attraction.name}:`, error);
        
        // Return basic activity without detailed info
        const categories = extractCategoriesFromKinds(attraction.kinds);
        const basicActivity: Activity = {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description: `Explore this ${categories[0]?.toLowerCase() || 'attraction'} in ${cityName}`,
          image: getFallbackImageUrl(categories),
          duration: getDurationFromCategories(categories),
          rating: Math.max(attraction.rate || 4.0, 3.5),
          price: getPriceFromCategories(categories),
          categories,
          indoor: isLikelyIndoorFromKinds(attraction.kinds, attraction.name),
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          }
        };
        
        console.log(`⚠️ Created basic activity: ${basicActivity.name}`);
        return basicActivity;
      }
    });
    
    // Wait for all activities to be processed
    const activities = await Promise.all(activitiesPromises);
    
    // Filter out any null results and sort by rating
    const validActivities = activities
      .filter(activity => activity !== null)
      .sort((a, b) => b.rating - a.rating);
    
    // Handle case where no valid activities could be processed - return empty array instead of throwing
    if (validActivities.length === 0) {
      console.warn(`🟡 No detailed activities could be fetched after filtering for ${cityName}. Possibly due to missing images or descriptions.`);
      return [];
    }
    
    console.log(`✅ Successfully fetched ${validActivities.length} real activities for ${cityName}`);
    
    // Cache the results for 7 days
    cacheApiResponse(cacheKey, validActivities, 7);
    
    return validActivities;
    
  } catch (error) {
    console.error(`❌ Error fetching real activities for ${cityName}:`, error);
    // Return empty array instead of throwing error
    return [];
  }
}

/**
 * Get estimated duration based on activity categories
 */
function getDurationFromCategories(categories: ActivityCategory[]): number {
  const durationMap: Record<ActivityCategory, number> = {
    interesting_places: 90,
    architecture: 60,
    historic: 90,
    historic_architecture: 90,
    museums: 120,
    cultural: 75,
    religion: 60,
    churches: 45,
    cathedrals: 60,
    castles: 90,
    towers: 45,
    viewpoints: 30,
    monuments_and_memorials: 30,
    natural: 120,
    gardens_and_parks: 90,
    urban_environment: 60,
    amusements: 120,
    sport: 90
  };

  for (const cat of categories) {
    if (durationMap[cat]) return durationMap[cat];
  }

  return 60; // default
}

  
  // Use the longest duration from categories, or default to 120 minutes
  let maxDuration = 120;
  for (const category of categories) {
    if (durationMap[category] && durationMap[category] > maxDuration) {
      maxDuration = durationMap[category];
    }
  }
  
  return maxDuration;
}

/**
 * Get estimated price based on activity categories
 */
function getPriceFromCategories(categories: ActivityCategory[]): { amount: number; currencyCode: string } {
  const priceMap: Record<ActivityCategory, number> = {
    interesting_places: 0,
    architecture: 5,
    historic: 10,
    historic_architecture: 10,
    museums: 20,
    cultural: 10,
    religion: 0,
    churches: 0,
    cathedrals: 5,
    castles: 15,
    towers: 5,
    viewpoints: 0,
    monuments_and_memorials: 0,
    natural: 0,
    gardens_and_parks: 0,
    urban_environment: 0,
    amusements: 25,
    sport: 15
  };

  for (const cat of categories) {
    if (priceMap[cat] !== undefined) return { amount: priceMap[cat], currencyCode: 'USD' };
  }

  return { amount: 10, currencyCode: 'USD' }; // default
}

  
  // Use the highest price from categories, or default to $10
  let maxPrice = 10;
  for (const category of categories) {
    if (priceMap[category] !== undefined && priceMap[category] > maxPrice) {
      maxPrice = priceMap[category];
    }
  }
  
  return {
    amount: maxPrice,
    currencyCode: 'USD'
  };
}

/**
 * Get weather-appropriate activity recommendations using real data
 */
export function getWeatherBasedRecommendations(
  activities: Activity[], 
  weather: any,
preferences: ActivityCategory[] = []

): Activity[] {
  console.log('🌤️ Weather-based filtering with real data:', {
    totalActivities: activities.length,
    weather: weather?.condition,
    temperature: weather?.temperature,
    isRainy: weather?.isRainy,
    preferences: preferences.length
  });

  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (weather?.isRainy && !activity.indoor) {
      console.log(`❌ Filtering out outdoor activity "${activity.name}" due to rain`);
      return false;
    }
    if (weather?.temperature < 5 && !activity.indoor) {
      console.log(`❌ Filtering out outdoor activity "${activity.name}" due to cold weather`);
      return false;
    }
    return true;
  });

  console.log(`✅ Weather-appropriate activities: ${weatherAppropriate.length}`);

  // Apply preference filtering if preferences exist
  if (preferences.length > 0) {
    const beforePreferenceFilter = weatherAppropriate.length;
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
    console.log(`🎯 After preference filtering: ${weatherAppropriate.length} (was ${beforePreferenceFilter})`);
  }

  // Sort by rating and weather appropriateness
  const sortedActivities = weatherAppropriate.sort((a, b) => {
    // Prioritize indoor activities during bad weather
    if (weather?.isRainy || weather?.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Prioritize outdoor activities during good weather
    if (!weather?.isRainy && weather?.temperature > 20) {
      if (!a.indoor && b.indoor) return -1;
      if (a.indoor && !b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });

  console.log(`🏆 Final sorted real activities: ${sortedActivities.length}`);
  
  return sortedActivities;
}