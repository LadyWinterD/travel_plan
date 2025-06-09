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

/**
 * Fetch real activities for a city using OpenTripMap API with two-step pipeline
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
    
    // Step 2: Get filtered attractions using the new pipeline (now passing cityName)
    const attractions = await getTopAttractions(coordinates.lat, coordinates.lon, 30, cityName);
    if (attractions.length === 0) {
      console.warn(`🟡 No quality attractions found near: ${cityName}`);
      return [];
    }
    
    console.log(`🎯 Processing ${attractions.length} filtered attractions for ${cityName}`);
    
    // Step 3: Get detailed information for attractions (limit to 25 for performance)
    const topAttractions = attractions.slice(0, 25);
    const activitiesPromises = topAttractions.map(async (attraction) => {
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
        
        // Create description from Wikipedia or address
        let description = `Discover this amazing attraction in ${cityName}`;
        if (details?.wikipedia_extracts?.text) {
          description = details.wikipedia_extracts.text.substring(0, 200) + '...';
        } else if (details?.address) {
          const addressParts = [];
          if (details.address.city && details.address.city !== cityName) {
            addressParts.push(details.address.city);
          }
          if (details.address.country) {
            addressParts.push(details.address.country);
          }
          if (addressParts.length > 0) {
            description = `Located in ${addressParts.join(', ')}`;
          }
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
    
    // Handle case where no valid activities could be processed
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
    return [];
  }
}

/**
 * Get estimated duration based on activity categories
 */
function getDurationFromCategories(categories: string[]): number {
  // Duration in minutes
  const durationMap: Record<string, number> = {
    'Museums': 120,
    'Historical Sites': 90,
    'Cultural': 90,
    'Nature': 180,
    'Outdoor': 180,
    'Adventure': 240,
    'Entertainment': 120,
    'Shopping': 90,
    'Food & Dining': 90
  };
  
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
function getPriceFromCategories(categories: string[]): { amount: number; currencyCode: string } {
  const priceMap: Record<string, number> = {
    'Museums': 15,
    'Historical Sites': 10,
    'Cultural': 12,
    'Nature': 0, // Often free
    'Outdoor': 5,
    'Adventure': 35,
    'Entertainment': 25,
    'Shopping': 0, // Window shopping is free
    'Food & Dining': 30
  };
  
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
  preferences: string[] = []
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