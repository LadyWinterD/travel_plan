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
        maxHeight: number;
        maxWidth: number;
      };
      photoSizes?: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    };
  };
}

interface TripAdvisorAutoCompleteResponse {
  data: {
    Typeahead_autocomplete: {
      results: TripAdvisorLocation[];
    };
  };
}

export class TripAdvisorApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'TripAdvisorApiError';
  }
}

/**
 * CORRECTED: Search for attractions using the search endpoint
 * Uses /locations/v2/search with the exact request format you provided
 */
export async function searchCityAttractions(cityName: string): Promise<TripAdvisorLocation[]> {
  try {
    console.log(`🔍 Searching for attractions in: ${cityName} using search API`);
    
    const response = await fetch(`${BASE_URL}/locations/v2/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({
        query: cityName,
        lang: "en_US",
        units: "km"
      })
    });

    if (!response.ok) {
      throw new TripAdvisorApiError(
        `Failed to search for attractions: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: TripAdvisorAutoCompleteResponse = await response.json();
    console.log('🎪 TripAdvisor search response:', data);

    const results = data.data?.Typeahead_autocomplete?.results || [];
    
    // CRITICAL FILTERING: Only include ATTRACTION or ACTIVITY items as specified
    const attractions = results.filter(result => 
      result.__typename === 'Typeahead_LocationItem' &&
      result.detailsV2?.placeType &&
      (result.detailsV2.placeType === 'ATTRACTION' || result.detailsV2.placeType === 'ACTIVITY') &&
      result.detailsV2?.names?.name
    );

    console.log(`✅ Found ${attractions.length} attractions/activities for ${cityName}`);
    return attractions;

  } catch (error) {
    console.error('Error searching for attractions:', error);
    if (error instanceof TripAdvisorApiError) {
      throw error;
    }
    throw new TripAdvisorApiError(`Failed to search for attractions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to get the best image URL from TripAdvisor photo data
 * Replaces {width} and {height} placeholders with 800px as specified
 */
export function getBestImageUrl(photo?: TripAdvisorLocation['image']): string {
  const fallbackImage = 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg';
  
  if (!photo?.photo) {
    return fallbackImage;
  }

  // CORRECTED: Use urlTemplate and replace placeholders with w=800 as specified
  if (photo.photo.photoSizeDynamic?.urlTemplate) {
    return photo.photo.photoSizeDynamic.urlTemplate
      .replace('{width}', '800')
      .replace('{height}', '600');
  }

  // Fallback to photoSizes array if urlTemplate not available
  if (photo.photo.photoSizes && photo.photo.photoSizes.length > 0) {
    const sortedSizes = photo.photo.photoSizes
      .filter(size => size.width > 200)
      .sort((a, b) => b.width - a.width);
    
    if (sortedSizes.length > 0) {
      return sortedSizes[0].url;
    }
  }

  return fallbackImage;
}

/**
 * Helper function to extract categories from TripAdvisor data
 */
export function extractCategories(attraction: TripAdvisorLocation): string[] {
  const categories: string[] = [];
  const placeType = attraction.detailsV2?.placeType?.toLowerCase();
  
  // Map TripAdvisor place types to our categories
  switch (placeType) {
    case 'attraction':
      categories.push('Entertainment', 'Cultural');
      break;
    case 'activity':
      categories.push('Adventure', 'Entertainment');
      break;
    default:
      categories.push('Entertainment');
  }

  // Add category based on name keywords
  const name = attraction.detailsV2?.names?.name?.toLowerCase() || '';
  
  if (name.includes('museum')) categories.push('Museums');
  if (name.includes('park') || name.includes('garden')) categories.push('Outdoor', 'Nature');
  if (name.includes('tower') || name.includes('bridge')) categories.push('Historical Sites');
  if (name.includes('market') || name.includes('shopping')) categories.push('Shopping');
  if (name.includes('church') || name.includes('cathedral') || name.includes('temple')) categories.push('Cultural', 'Historical Sites');
  if (name.includes('palace') || name.includes('castle')) categories.push('Historical Sites', 'Cultural');

  // Remove duplicates
  return [...new Set(categories)];
}

/**
 * Helper function to determine if an attraction is likely indoor
 */
export function isLikelyIndoor(attraction: TripAdvisorLocation): boolean {
  const name = attraction.detailsV2?.names?.name?.toLowerCase() || '';
  
  const indoorKeywords = [
    'museum', 'gallery', 'theater', 'theatre', 'mall', 'shopping', 'restaurant',
    'cafe', 'bar', 'club', 'cinema', 'aquarium', 'indoor', 'exhibition',
    'library', 'cathedral', 'church', 'temple', 'palace', 'castle'
  ];
  
  const outdoorKeywords = [
    'park', 'garden', 'beach', 'mountain', 'trail', 'outdoor', 'bridge',
    'tower', 'monument', 'square', 'market', 'street', 'viewpoint'
  ];
  
  const hasIndoorKeyword = indoorKeywords.some(keyword => name.includes(keyword));
  const hasOutdoorKeyword = outdoorKeywords.some(keyword => name.includes(keyword));
  
  // If both or neither, default to indoor (safer for weather)
  if (hasIndoorKeyword && !hasOutdoorKeyword) return true;
  if (hasOutdoorKeyword && !hasIndoorKeyword) return false;
  
  return true; // Default to indoor
}