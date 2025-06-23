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
 * Enhanced category extraction with new tourism-focused categories
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

  // Second pass: partial matches for compound kinds
  if (matchedCategories.size === 0) {
    for (const kind of kindsArray) {
      for (const [mappedKind, category] of Object.entries(detailedCategoryMappings)) {
        if (kind.includes(mappedKind) || mappedKind.includes(kind)) {
          matchedCategories.add(category);
        }
      }
    }
  }

  // Third pass: keyword-based fallbacks with new categories
  if (matchedCategories.size === 0) {
    for (const kind of kindsArray) {
      // Nature & Outdoors
      if (kind.includes('mountain') || kind.includes('volcano') || kind.includes('cave') || kind.includes('canyon')) {
        matchedCategories.add('nature_landscapes');
      } else if (kind.includes('lake') || kind.includes('river') || kind.includes('waterfall') || kind.includes('island')) {
        matchedCategories.add('water_features');
      } else if (kind.includes('beach') || kind.includes('shore') || kind.includes('sand')) {
        matchedCategories.add('beaches');
      } else if (kind.includes('park') || kind.includes('reserve') || kind.includes('wildlife') || kind.includes('botanical')) {
        matchedCategories.add('protected_areas');
      }
      
      // Culture & History
      else if (kind.includes('historic') || kind.includes('ancient') || kind.includes('archaeological') || kind.includes('heritage')) {
        matchedCategories.add('historical_sites');
      } else if (kind.includes('castle') || kind.includes('fort') || kind.includes('fortress') || kind.includes('citadel')) {
        matchedCategories.add('fortifications');
      } else if (kind.includes('monument') || kind.includes('memorial') || kind.includes('statue') || kind.includes('sculpture')) {
        matchedCategories.add('monuments_archaeology');
      } else if (kind.includes('church') || kind.includes('cathedral') || kind.includes('temple') || kind.includes('mosque') || kind.includes('synagogue') || kind.includes('religious')) {
        matchedCategories.add('religious_sites');
      } else if (kind.includes('cemetery') || kind.includes('tomb') || kind.includes('burial') || kind.includes('mausoleum')) {
        matchedCategories.add('burial_sites');
      }
      
      // Architecture & Urban
      else if (kind.includes('palace') || kind.includes('manor') || kind.includes('villa') || kind.includes('amphitheatre')) {
        matchedCategories.add('historical_buildings');
      } else if (kind.includes('skyscraper') || kind.includes('modern') || kind.includes('contemporary')) {
        matchedCategories.add('modern_architecture');
      } else if (kind.includes('bridge') || kind.includes('viaduct') || kind.includes('aqueduct')) {
        matchedCategories.add('bridges');
      } else if (kind.includes('tower') || kind.includes('lighthouse') || kind.includes('spire') || kind.includes('observation')) {
        matchedCategories.add('towers_lighthouses');
      } else if (kind.includes('square') || kind.includes('plaza') || kind.includes('street') || kind.includes('district') || kind.includes('urban')) {
        matchedCategories.add('urban_features');
      }
      
      // Museums & Art
      else if (kind.includes('museum') || kind.includes('gallery') || kind.includes('exhibition') || kind.includes('cultural')) {
        matchedCategories.add('museums');
      } else if (kind.includes('art') || kind.includes('mural') || kind.includes('installation')) {
        matchedCategories.add('public_art');
      } else if (kind.includes('garden') || kind.includes('arboretum') || kind.includes('green')) {
        matchedCategories.add('gardens_parks');
      } else if (kind.includes('fountain') || kind.includes('water_feature')) {
        matchedCategories.add('fountains');
      }
      
      // Entertainment & Leisure
      else if (kind.includes('amusement') || kind.includes('theme') || kind.includes('zoo') || kind.includes('aquarium')) {
        matchedCategories.add('amusement_facilities');
      } else if (kind.includes('spa') || kind.includes('sauna') || kind.includes('thermal') || kind.includes('wellness')) {
        matchedCategories.add('spa_wellness');
      } else if (kind.includes('sport') || kind.includes('stadium') || kind.includes('skiing') || kind.includes('diving') || kind.includes('golf')) {
        matchedCategories.add('sports_activities');
      } else if (kind.includes('bar') || kind.includes('club') || kind.includes('casino') || kind.includes('nightlife')) {
        matchedCategories.add('nightlife');
      }
      
      // Other Points of Interest
      else if (kind.includes('viewpoint') || kind.includes('scenic') || kind.includes('panoramic') || kind.includes('overlook')) {
        matchedCategories.add('viewpoints');
      }
    }
  }

  // Final fallback
  if (matchedCategories.size === 0) {
    matchedCategories.add('uncategorized_attractions');
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
 * Get estimated duration based on new activity categories
 */
function getDurationFromCategories(categories: ActivityCategory[]): number {
  const durationMap: Record<ActivityCategory, number> = {
    // Nature & Outdoors - typically longer outdoor experiences
    nature_landscapes: 180,
    water_features: 120,
    beaches: 240,
    protected_areas: 180,
    
    // Culture & History - moderate to long visits
    historical_sites: 90,
    fortifications: 120,
    monuments_archaeology: 60,
    religious_sites: 60,
    burial_sites: 45,
    
    // Architecture & Urban - quick to moderate visits
    historical_buildings: 90,
    modern_architecture: 60,
    bridges: 30,
    towers_lighthouses: 60,
    urban_features: 90,
    
    // Museums & Art - longer indoor experiences
    museums: 150,
    public_art: 30,
    gardens_parks: 120,
    fountains: 20,
    
    // Entertainment & Leisure - varies widely
    amusement_facilities: 240,
    spa_wellness: 180,
    sports_activities: 120,
    nightlife: 180,
    
    // Other Points of Interest
    viewpoints: 45,
    uncategorized_attractions: 90
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
 * Get estimated price based on new activity categories
 */
function getPriceFromCategories(categories: ActivityCategory[]): { amount: number; currencyCode: string } {
  const priceMap: Record<ActivityCategory, number> = {
    // Nature & Outdoors - mostly free or low cost
    nature_landscapes: 0,
    water_features: 0,
    beaches: 0,
    protected_areas: 5,
    
    // Culture & History - varies, some free, some paid
    historical_sites: 10,
    fortifications: 15,
    monuments_archaeology: 5,
    religious_sites: 0,
    burial_sites: 0,
    
    // Architecture & Urban - mostly free
    historical_buildings: 12,
    modern_architecture: 0,
    bridges: 0,
    towers_lighthouses: 8,
    urban_features: 0,
    
    // Museums & Art - typically paid
    museums: 25,
    public_art: 0,
    gardens_parks: 5,
    fountains: 0,
    
    // Entertainment & Leisure - typically paid
    amusement_facilities: 35,
    spa_wellness: 50,
    sports_activities: 20,
    nightlife: 30,
    
    // Other Points of Interest
    viewpoints: 0,
    uncategorized_attractions: 10
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