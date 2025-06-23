import { Activity } from '../types';
import { 
  getCoordinatesForCity, 
  getTopAttractions, 
  getPlaceDetails,
  extractCategoriesFromKinds,
  isLikelyIndoorFromKinds,
  getFallbackImageUrl,
  fetchWikimediaImage,
  fetchOpenTripMapImage,
} from '../services/openTripMapApi';
import { getCachedApiResponse, cacheApiResponse } from './storage';
import { ActivityCategory, detailedCategoryMappings } from '../data/activityCategories';

/**
 * Enhanced category extraction with new English category system
 * FIXED: Removed conditional checks to allow all matching passes to run
 */
function extractCategoriesFromKindsEnhanced(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.toLowerCase().split(',').map(k => k.trim());
  const matchedCategories = new Set<ActivityCategory>();

  // First pass: exact matches using detailed mappings
  for (const kind of kindsArray) {
    if (detailedCategoryMappings[kind]) {
      matchedCategories.add(detailedCategoryMappings[kind]);
    }
  }

  // Second pass: partial matches for compound kinds (ALWAYS RUN)
  for (const kind of kindsArray) {
    for (const [mappedKind, category] of Object.entries(detailedCategoryMappings)) {
      if (kind.includes(mappedKind) || mappedKind.includes(kind)) {
        matchedCategories.add(category);
      }
    }
  }

  // Third pass: keyword-based fallbacks with English categories (ALWAYS RUN)
  for (const kind of kindsArray) {
    // Culture & History
    if (kind.includes('museum') || kind.includes('gallery') || kind.includes('art') || kind.includes('cultural')) {
      matchedCategories.add('museums_arts');
    }
    if (kind.includes('historic') || kind.includes('ancient') || kind.includes('archaeological') || kind.includes('heritage')) {
      matchedCategories.add('historical_sites');
    }
    if (kind.includes('church') || kind.includes('cathedral') || kind.includes('temple') || kind.includes('mosque') || kind.includes('religious')) {
      matchedCategories.add('religious_sites');
    }
    if (kind.includes('castle') || kind.includes('palace') || kind.includes('fort') || kind.includes('fortress')) {
      matchedCategories.add('castles_palaces');
    }
    if (kind.includes('tower') || kind.includes('bridge') || kind.includes('architecture') || kind.includes('building')) {
      matchedCategories.add('architectural_landmarks');
    }
    
    // Nature & Outdoors
    if (kind.includes('natural') || kind.includes('mountain') || kind.includes('lake') || kind.includes('beach') || kind.includes('cave')) {
      matchedCategories.add('natural_landscapes');
    }
    if (kind.includes('park') || kind.includes('garden') || kind.includes('botanical') || kind.includes('fountain')) {
      matchedCategories.add('parks_gardens');
    }
    if (kind.includes('sport') || kind.includes('skiing') || kind.includes('diving') || kind.includes('golf') || kind.includes('stadium')) {
      matchedCategories.add('outdoor_sports');
    }
    
    // Urban Exploration
    if (kind.includes('urban') || kind.includes('square') || kind.includes('street') || kind.includes('city')) {
      matchedCategories.add('city_centers');
    }
    if (kind.includes('viewpoint') || kind.includes('scenic') || kind.includes('observation') || kind.includes('overlook')) {
      matchedCategories.add('viewpoints_towers');
    }
    
    // Leisure & Entertainment
    if (kind.includes('amusement') || kind.includes('theme') || kind.includes('zoo') || kind.includes('aquarium')) {
      matchedCategories.add('theme_parks_zoos');
    }
    if (kind.includes('bar') || kind.includes('club') || kind.includes('casino') || kind.includes('nightlife')) {
      matchedCategories.add('nightlife');
    }
    if (kind.includes('theater') || kind.includes('theatre') || kind.includes('cinema')) {
      matchedCategories.add('shows_cinema');
    }
    if (kind.includes('shopping') || kind.includes('mall') || kind.includes('market')) {
      matchedCategories.add('shopping');
    }
    if (kind.includes('restaurant') || kind.includes('cafe') || kind.includes('food') || kind.includes('dining')) {
      matchedCategories.add('food_dining');
    }
  }

  // Final fallback
  if (matchedCategories.size === 0) {
    matchedCategories.add('interesting_places');
  }

  return Array.from(matchedCategories);
}

/**
 * Fetch real activities for a city using OpenTripMap API - Enhanced version with Wikimedia images
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
        const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
        const isIndoor = isLikelyIndoorFromKinds(attraction.kinds, attraction.name);
        
        // Enhanced image fetching with priority order:
        // 1. Wikimedia Commons (from wikidata ID)
        // 2. OpenTripMap preview image
        // 3. OpenTripMap image field (construct Wikimedia URL)
        // 4. Fallback Pexels image
        let imageUrl = getFallbackImageUrl(categories); // Default fallback
        
        // Priority 1: Try Wikimedia Commons if wikidata ID exists
        if (attraction.wikidata) {
          console.log(`🔍 Trying Wikimedia for ${attraction.name} (Wikidata: ${attraction.wikidata})`);
          const wikimediaImageUrl = await fetchWikimediaImage(attraction.wikidata);
          if (wikimediaImageUrl) {
            imageUrl = wikimediaImageUrl;
            console.log(`✅ Using Wikimedia image for ${attraction.name}`);
          }
        }
        
        // Priority 2: Try OpenTripMap preview if no Wikimedia image found
        if (imageUrl === getFallbackImageUrl(categories) && details?.preview?.source) {
          imageUrl = details.preview.source;
          console.log(`✅ Using OpenTripMap preview for ${attraction.name}`);
        }
        
        // Priority 3: Try OpenTripMap image field (construct Wikimedia URL)
        if (imageUrl === getFallbackImageUrl(categories) && details?.image) {
          console.log(`🔍 Trying OpenTripMap image field for ${attraction.name} (${details.image})`);
          const openTripMapImageUrl = await fetchOpenTripMapImage(details.image);
          if (openTripMapImageUrl) {
            imageUrl = openTripMapImageUrl;
            console.log(`✅ Using OpenTripMap image field for ${attraction.name}`);
          }
        }
        
        // If still using fallback, log it
        if (imageUrl === getFallbackImageUrl(categories)) {
          console.log(`⚠️ Using fallback image for ${attraction.name}`);
        }

        const description = details?.wikipedia_extracts?.text 
          ? details.wikipedia_extracts.text.substring(0, 120) + '...'
          : `Explore this ${categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction'} in ${cityName}`;

        console.log(`📋 ${attraction.name} categories:`, categories);

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
      } catch (error) {
        console.error(`Error processing attraction ${attraction.name}:`, error);
        const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
        return {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description: `Explore this ${categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction'} in ${cityName}`,
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

    console.log(`🎉 Successfully processed ${validActivities.length} activities for ${cityName}`);
    cacheApiResponse(cacheKey, validActivities, 7);
    return validActivities;
  } catch (error) {
    console.error(`❌ Error fetching real activities for ${cityName}:`, error);
    return [];
  }
}

/**
 * Get estimated duration based on English activity categories
 */
function getDurationFromCategories(categories: ActivityCategory[]): number {
  const durationMap: Record<ActivityCategory, number> = {
    // Culture & History - moderate to long visits
    museums_arts: 150,
    historical_sites: 90,
    religious_sites: 60,
    castles_palaces: 120,
    architectural_landmarks: 60,
    
    // Nature & Outdoors - typically longer outdoor experiences
    natural_landscapes: 180,
    parks_gardens: 120,
    outdoor_sports: 120,
    
    // Urban Exploration - quick to moderate visits
    city_centers: 90,
    viewpoints_towers: 45,
    
    // Leisure & Entertainment - varies widely
    theme_parks_zoos: 240,
    nightlife: 180,
    shows_cinema: 120,
    shopping: 120,
    
    // Unique Experiences
    interesting_places: 90,
    food_dining: 90
  };

  let maxDuration = 90; // Default duration
  for (const category of categories) {
    if (durationMap[category] && durationMap[category] > maxDuration) {
      maxDuration = durationMap[category];
    }
  }

  return maxDuration;
}

/**
 * Get estimated price based on English activity categories
 */
function getPriceFromCategories(categories: ActivityCategory[]): { amount: number; currencyCode: string } {
  const priceMap: Record<ActivityCategory, number> = {
    // Culture & History - varies, some free, some paid
    museums_arts: 25,
    historical_sites: 10,
    religious_sites: 0,
    castles_palaces: 15,
    architectural_landmarks: 5,
    
    // Nature & Outdoors - mostly free or low cost
    natural_landscapes: 0,
    parks_gardens: 5,
    outdoor_sports: 20,
    
    // Urban Exploration - mostly free
    city_centers: 0,
    viewpoints_towers: 8,
    
    // Leisure & Entertainment - typically paid
    theme_parks_zoos: 35,
    nightlife: 30,
    shows_cinema: 15,
    shopping: 0,
    
    // Unique Experiences
    interesting_places: 10,
    food_dining: 25
  };

  let maxPrice = 10; // Default price
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