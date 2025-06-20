import { Activity } from '../types';
import { 
  getCoordinatesForCity, 
  getTopAttractions, 
  getPlaceDetails,
  extractCategoriesFromKinds,
  isLikelyIndoorFromKinds,
  getFallbackImageUrl,
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
    
    const cacheKey = `activities_${cityName.toLowerCase().replace(/\s+/g, '_')}`;
    const cachedActivities = getCachedApiResponse(cacheKey);
    if (cachedActivities) {
      console.log(`💾 Using cached activities for: ${cityName}`);
      return cachedActivities;
    }

    const coordinates = await getCoordinatesForCity(cityName);
    if (!coordinates) {
      console.warn(`🟡 Could not find coordinates for city: ${cityName}`);
      return [];
    }

    const attractions = await getTopAttractions(coordinates.lat, coordinates.lon, 30, cityName);
    if (attractions.length === 0) {
      console.warn(`🟡 No quality attractions found near: ${cityName}`);
      return [];
    }

    const activitiesPromises = attractions.map(async (attraction) => {
      try {
        const details = await getPlaceDetails(attraction.xid);
        const categories = extractCategoriesFromKinds(attraction.kinds);
        const isIndoor = isLikelyIndoorFromKinds(attraction.kinds, attraction.name);
        
        let imageUrl = getFallbackImageUrl(categories);
        if (details?.preview?.source) {
          imageUrl = details.preview.source;
        } else if (details?.image) {
          imageUrl = details.image;
        }

        const description = details?.wikipedia_extracts?.text 
          ? details.wikipedia_extracts.text.substring(0, 120) + '...'
          : 'No detailed description available.';

        return {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description,
          image: imageUrl,
          duration: getDurationFromCategories(categories),
          rating: Math.max(attraction.rate || 4.0, 3.5),
          price: getPriceFromCategories(categories),
          categories,
          indoor: isIndoor,
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          }
        };
      } catch {
        const categories = extractCategoriesFromKinds(attraction.kinds);
        return {
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
      }
    });

    const activities = await Promise.all(activitiesPromises);
    const validActivities = activities
      .filter(Boolean)
      .sort((a, b) => b.rating - a.rating);

    if (validActivities.length === 0) return [];

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

  let maxDuration = 60;
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
  let weatherAppropriate = activities.filter(activity => {
    if (weather?.isRainy && !activity.indoor) return false;
    if (weather?.temperature < 5 && !activity.indoor) return false;
    return true;
  });

  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  return weatherAppropriate.sort((a, b) => {
    if (weather?.isRainy || weather?.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    if (!weather?.isRainy && weather?.temperature > 20) {
      if (!a.indoor && b.indoor) return -1;
      if (a.indoor && !b.indoor) return 1;
    }
    return b.rating - a.rating;
  });
}
