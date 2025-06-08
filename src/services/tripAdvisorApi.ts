// TripAdvisor API Service
// TODO: Move API key to a secure backend environment before production.

const RAPIDAPI_KEY = '9323e05fecmshc98dba18ad16b1bp146d4djsn03a73453f743';
const RAPIDAPI_HOST = 'travel-advisor.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface TripAdvisorLocation {
  __typename: string;
  documentId: string;
  detailsV2: {
    locationId: number;
    isGeo: boolean;
    placeType: string;
    names: {
      name: string;
      longOnlyHierarchyTypeaheadV2: string;
    };
    geocode?: {
      latitude: number;
      longitude: number;
    };
  };
  image?: {
    photo?: {
      photoSizeDynamic?: {
        urlTemplate: string;
      };
      photoSizes?: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    };
  };
}

interface TripAdvisorSearchResponse {
  data: {
    Typeahead_autocomplete: {
      results: TripAdvisorLocation[];
    };
  };
}

interface TripAdvisorAttraction {
  locationId: number;
  name: string;
  description?: string;
  rating?: number;
  photo?: {
    images?: {
      large?: {
        url: string;
      };
      medium?: {
        url: string;
      };
      small?: {
        url: string;
      };
    };
  };
  category?: {
    name: string;
  };
  subcategory?: Array<{
    name: string;
  }>;
  location_string?: string;
  ranking?: string;
  price_level?: string;
  address?: string;
}

interface TripAdvisorAttractionsResponse {
  data: TripAdvisorAttraction[];
}

export class TripAdvisorApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'TripAdvisorApiError';
  }
}

/**
 * Step A: Search for a city and get its geoId
 */
export async function searchCityLocation(cityName: string): Promise<number | null> {
  try {
    console.log(`🔍 Searching for city: ${cityName}`);
    
    const response = await fetch(`${BASE_URL}/locations/v2/search?currency=USD&units=km&lang=en_US`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({
        query: cityName,
        updateToken: ""
      })
    });

    if (!response.ok) {
      throw new TripAdvisorApiError(
        `Failed to search for city: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: TripAdvisorSearchResponse = await response.json();
    console.log('🏙️ City search response:', data);

    // Find the best matching location (preferably a city/geo location)
    const results = data.data?.Typeahead_autocomplete?.results || [];
    
    // Filter for geographic locations (cities, regions) and attractions
    const geoLocations = results.filter(result => 
      result.detailsV2?.isGeo === true || 
      result.detailsV2?.placeType === 'GEO' ||
      result.detailsV2?.placeType === 'CITY' ||
      result.detailsV2?.placeType === 'ATTRACTION'
    );

    if (geoLocations.length === 0) {
      // If no geo locations, try any location
      const anyLocation = results.find(result => 
        result.detailsV2?.locationId && 
        result.__typename === 'Typeahead_LocationItem'
      );
      
      if (anyLocation) {
        console.log(`✅ Found location ID: ${anyLocation.detailsV2.locationId} for ${cityName}`);
        return anyLocation.detailsV2.locationId;
      }
      
      console.log(`❌ No location found for: ${cityName}`);
      return null;
    }

    // Return the first geo location's ID
    const locationId = geoLocations[0].detailsV2.locationId;
    console.log(`✅ Found geo location ID: ${locationId} for ${cityName}`);
    return locationId;

  } catch (error) {
    console.error('Error searching for city:', error);
    if (error instanceof TripAdvisorApiError) {
      throw error;
    }
    throw new TripAdvisorApiError(`Failed to search for city: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Step B: Fetch attractions using geoId
 */
export async function fetchAttractionsByGeoId(geoId: number): Promise<TripAdvisorAttraction[]> {
  try {
    console.log(`🎯 Fetching attractions for geoId: ${geoId}`);
    
    const response = await fetch(`${BASE_URL}/attraction-product-filters/v2/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({
        geoId: geoId
      })
    });

    if (!response.ok) {
      throw new TripAdvisorApiError(
        `Failed to fetch attractions: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: TripAdvisorAttractionsResponse = await response.json();
    console.log('🎪 Attractions response:', data);

    return data.data || [];

  } catch (error) {
    console.error('Error fetching attractions:', error);
    if (error instanceof TripAdvisorApiError) {
      throw error;
    }
    throw new TripAdvisorApiError(`Failed to fetch attractions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to get the best image URL from TripAdvisor photo data
 */
export function getBestImageUrl(photo?: TripAdvisorAttraction['photo']): string {
  const fallbackImage = 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg';
  
  if (!photo?.images) {
    return fallbackImage;
  }

  // Prefer large, then medium, then small images
  return photo.images.large?.url || 
         photo.images.medium?.url || 
         photo.images.small?.url || 
         fallbackImage;
}

/**
 * Helper function to extract categories from TripAdvisor data
 */
export function extractCategories(attraction: TripAdvisorAttraction): string[] {
  const categories: string[] = [];
  
  if (attraction.category?.name) {
    categories.push(attraction.category.name);
  }
  
  if (attraction.subcategory) {
    attraction.subcategory.forEach(sub => {
      if (sub.name) {
        categories.push(sub.name);
      }
    });
  }

  // If no categories found, provide default based on common attraction types
  if (categories.length === 0) {
    categories.push('Entertainment');
  }

  return categories;
}

/**
 * Helper function to determine if an attraction is likely indoor
 */
export function isLikelyIndoor(attraction: TripAdvisorAttraction): boolean {
  const name = attraction.name?.toLowerCase() || '';
  const description = attraction.description?.toLowerCase() || '';
  const category = attraction.category?.name?.toLowerCase() || '';
  
  const indoorKeywords = [
    'museum', 'gallery', 'theater', 'theatre', 'mall', 'shopping', 'restaurant',
    'cafe', 'bar', 'club', 'cinema', 'aquarium', 'indoor', 'exhibition',
    'library', 'cathedral', 'church', 'temple', 'palace', 'castle'
  ];
  
  const outdoorKeywords = [
    'park', 'garden', 'beach', 'mountain', 'trail', 'outdoor', 'bridge',
    'tower', 'monument', 'square', 'market', 'street', 'viewpoint'
  ];
  
  const text = `${name} ${description} ${category}`;
  
  const hasIndoorKeyword = indoorKeywords.some(keyword => text.includes(keyword));
  const hasOutdoorKeyword = outdoorKeywords.some(keyword => text.includes(keyword));
  
  // If both or neither, default to indoor (safer for weather)
  if (hasIndoorKeyword && !hasOutdoorKeyword) return true;
  if (hasOutdoorKeyword && !hasIndoorKeyword) return false;
  
  return true; // Default to indoor
}