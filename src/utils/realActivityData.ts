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
import { ActivityCategory } from '../data/activityCategories';

// Enhanced mapping from OpenTripMap kinds to our ActivityCategory types
const kindsToCategories: Record<string, ActivityCategory[]> = {
  // Museums and cultural
  'museums': ['museums'],
  'museum': ['museums'],
  'cultural': ['cultural'],
  'galleries': ['cultural', 'museums'],
  'art_galleries': ['cultural', 'museums'],
  
  // Historic and architecture
  'historic': ['historic'],
  'historical': ['historic'],
  'architecture': ['architecture'],
  'historic_architecture': ['historic_architecture'],
  'archaeological_sites': ['historic'],
  'fortifications': ['historic', 'castles'],
  
  // Religious sites
  'religion': ['religion'],
  'religious': ['religion'],
  'churches': ['churches', 'religion'],
  'cathedrals': ['cathedrals', 'religion'],
  'temples': ['religion'],
  'monasteries': ['religion'],
  'synagogues': ['religion'],
  'mosques': ['religion'],
  
  // Castles and towers
  'castles': ['castles', 'historic'],
  'castle': ['castles', 'historic'],
  'towers': ['towers', 'architecture'],
  'tower': ['towers', 'architecture'],
  'palaces': ['historic_architecture', 'historic'],
  'palace': ['historic_architecture', 'historic'],
  
  // Natural and parks
  'natural': ['natural'],
  'nature': ['natural'],
  'gardens': ['gardens_and_parks'],
  'parks': ['gardens_and_parks'],
  'gardens_and_parks': ['gardens_and_parks'],
  'botanical_gardens': ['gardens_and_parks', 'natural'],
  'national_parks': ['natural', 'gardens_and_parks'],
  'beaches': ['natural'],
  'mountains': ['natural'],
  'lakes': ['natural'],
  'rivers': ['natural'],
  'forests': ['natural'],
  
  // Monuments and memorials
  'monuments_and_memorials': ['monuments_and_memorials'],
  'monuments': ['monuments_and_memorials'],
  'memorials': ['monuments_and_memorials'],
  'statues': ['monuments_and_memorials'],
  'sculptures': ['monuments_and_memorials'],
  
  // Viewpoints and observation
  'viewpoints': ['viewpoints'],
  'view_points': ['viewpoints'],
  'observation_decks': ['viewpoints'],
  'lookouts': ['viewpoints'],
  
  // Urban and interesting places
  'urban_environment': ['urban_environment'],
  'urban': ['urban_environment'],
  'city_center': ['urban_environment'],
  'squares': ['urban_environment'],
  'streets': ['urban_environment'],
  'bridges': ['architecture', 'urban_environment'],
  'interesting_places': ['interesting_places'],
  'tourist_facilities': ['interesting_places'],
  'tourist_attraction': ['interesting_places'],
  
  // Amusements and entertainment
  'amusements': ['amusements'],
  'entertainment': ['amusements'],
  'theme_parks': ['amusements'],
  'zoos': ['amusements'],
  'aquariums': ['amusements'],
  'cinemas': ['amusements'],
  'theaters': ['cultural', 'amusements'],
  'theatres': ['cultural', 'amusements'],
  
  // Sports
  'sport': ['sport'],
  'sports': ['sport'],
  'stadiums': ['sport'],
  'sports_centres': ['sport'],
  'golf_courses': ['sport'],
  'swimming_pools': ['sport'],
  
  // Fallback categories
  'other': ['interesting_places'],
  'unspecified': ['interesting_places']
};

/**
 * Enhanced category extraction with comprehensive mapping
 */
function extractCategoriesFromKindsEnhanced(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.toLowerCase().split(',').map(k => k.trim());
  const matchedCategories = new Set<ActivityCategory>();

  // First pass: exact matches
  for (const kind of kindsArray) {
    if (kindsToCategories[kind]) {
      kindsToCategories[kind].forEach(cat => matchedCategories.add(cat));
    }
  }

  // Second pass: partial matches for compound kinds
  if (matchedCategories.size === 0) {
    for (const kind of kindsArray) {
      for (const [mappedKind, categories] of Object.entries(kindsToCategories)) {
        if (kind.includes(mappedKind) || mappedKind.includes(kind)) {
          categories.forEach(cat => matchedCategories.add(cat));
        }
      }
    }
  }

  // Third pass: keyword-based fallbacks
  if (matchedCategories.size === 0) {
    for (const kind of kindsArray) {
      if (kind.includes('museum') || kind.includes('gallery')) {
        matchedCategories.add('museums');
      } else if (kind.includes('church') || kind.includes('cathedral')) {
        matchedCategories.add('churches');
      } else if (kind.includes('castle') || kind.includes('fort')) {
        matchedCategories.add('castles');
      } else if (kind.includes('park') || kind.includes('garden')) {
        matchedCategories.add('gardens_and_parks');
      } else if (kind.includes('historic') || kind.includes('ancient')) {
        matchedCategories.add('historic');
      } else if (kind.includes('tower') || kind.includes('building')) {
        matchedCategories.add('architecture');
      } else if (kind.includes('natural') || kind.includes('nature')) {
        matchedCategories.add('natural');
      }
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