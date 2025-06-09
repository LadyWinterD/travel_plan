// OpenTripMap API Service for real attraction data
// API Documentation: https://opentripmap.io/docs

const API_KEY = '5ae2e3f221c38a28845f05b613c6bd060fbfa46746435156427f8f3d';
const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';

export interface OpenTripMapPlace {
  xid: string;
  name: string;
  dist: number;
  rate: number;
  osm: string;
  wikidata: string;
  kinds: string;
  point: {
    lon: number;
    lat: number;
  };
}

export interface OpenTripMapDetails {
  xid: string;
  name: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    country_code?: string;
  };
  rate: number;
  kinds: string;
  sources: {
    geometry: string;
    attributes: string[];
  };
  otm: string;
  wikipedia?: string;
  image?: string;
  preview?: {
    source: string;
    height: number;
    width: number;
  };
  wikipedia_extracts?: {
    title: string;
    text: string;
    html: string;
  };
  point: {
    lon: number;
    lat: number;
  };
}

export interface CityCoordinates {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

export class OpenTripMapApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'OpenTripMapApiError';
  }
}

/**
 * Get coordinates for a city using OpenTripMap geoname endpoint
 */
export async function getCoordinatesForCity(cityName: string): Promise<CityCoordinates | null> {
  try {
    console.log(`🌍 Getting coordinates for: ${cityName}`);
    
    const url = `${BASE_URL}/geoname?name=${encodeURIComponent(cityName)}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new OpenTripMapApiError(
        `Failed to get coordinates: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const data = await response.json();
    
    if (!data.lat || !data.lon) {
      console.log(`❌ No coordinates found for: ${cityName}`);
      return null;
    }
    
    const coordinates: CityCoordinates = {
      lat: data.lat,
      lon: data.lon,
      name: data.name || cityName,
      country: data.country || 'Unknown'
    };
    
    console.log(`✅ Coordinates found for ${cityName}:`, coordinates);
    return coordinates;
    
  } catch (error) {
    console.error(`Error getting coordinates for ${cityName}:`, error);
    if (error instanceof OpenTripMapApiError) {
      throw error;
    }
    throw new OpenTripMapApiError(`Failed to get coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get top attractions within radius using OpenTripMap
 */
export async function getTopAttractions(lat: number, lon: number, radiusKm: number = 10): Promise<OpenTripMapPlace[]> {
  try {
    console.log(`🎯 Getting attractions near: ${lat}, ${lon} (radius: ${radiusKm}km)`);
    
    const radiusMeters = radiusKm * 1000;
    const kinds = 'interesting_places,museums,architecture,historic,cultural,religion,sport,amusements,tourist_facilities';
    
    const url = `${BASE_URL}/radius?radius=${radiusMeters}&lon=${lon}&lat=${lat}&kinds=${kinds}&format=json&limit=50&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new OpenTripMapApiError(
        `Failed to get attractions: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data.features)) {
      console.log(`❌ No attractions found near: ${lat}, ${lon}`);
      return [];
    }
    
    // Convert GeoJSON features to our format
    const places: OpenTripMapPlace[] = data.features
      .map((feature: any) => ({
        xid: feature.properties.xid,
        name: feature.properties.name || 'Unnamed Attraction',
        dist: feature.properties.dist || 0,
        rate: feature.properties.rate || 0,
        osm: feature.properties.osm || '',
        wikidata: feature.properties.wikidata || '',
        kinds: feature.properties.kinds || '',
        point: {
          lon: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1]
        }
      }))
      .filter((place: OpenTripMapPlace) => place.name && place.name !== 'Unnamed Attraction')
      .sort((a: OpenTripMapPlace, b: OpenTripMapPlace) => b.rate - a.rate) // Sort by rating
      .slice(0, 30); // Limit to top 30
    
    console.log(`✅ Found ${places.length} attractions near: ${lat}, ${lon}`);
    return places;
    
  } catch (error) {
    console.error(`Error getting attractions near ${lat}, ${lon}:`, error);
    if (error instanceof OpenTripMapApiError) {
      throw error;
    }
    throw new OpenTripMapApiError(`Failed to get attractions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(xid: string): Promise<OpenTripMapDetails | null> {
  try {
    console.log(`📋 Getting details for place: ${xid}`);
    
    const url = `${BASE_URL}/xid/${xid}?apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new OpenTripMapApiError(
        `Failed to get place details: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const data: OpenTripMapDetails = await response.json();
    
    console.log(`✅ Got details for: ${data.name}`);
    return data;
    
  } catch (error) {
    console.error(`Error getting details for ${xid}:`, error);
    if (error instanceof OpenTripMapApiError) {
      throw error;
    }
    throw new OpenTripMapApiError(`Failed to get place details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to extract categories from OpenTripMap kinds
 */
export function extractCategoriesFromKinds(kinds: string): string[] {
  const categories: string[] = [];
  const kindsArray = kinds.split(',');
  
  kindsArray.forEach(kind => {
    switch (kind.toLowerCase()) {
      case 'museums':
        categories.push('Museums');
        break;
      case 'architecture':
      case 'historic':
        categories.push('Historical Sites');
        break;
      case 'cultural':
      case 'religion':
        categories.push('Cultural');
        break;
      case 'sport':
      case 'amusements':
        categories.push('Adventure', 'Entertainment');
        break;
      case 'tourist_facilities':
        categories.push('Entertainment');
        break;
      case 'natural':
      case 'geological_formations':
        categories.push('Nature', 'Outdoor');
        break;
      default:
        if (kind.includes('outdoor') || kind.includes('natural')) {
          categories.push('Outdoor', 'Nature');
        } else {
          categories.push('Entertainment');
        }
    }
  });
  
  // Remove duplicates and ensure at least one category
  const uniqueCategories = [...new Set(categories)];
  return uniqueCategories.length > 0 ? uniqueCategories : ['Entertainment'];
}

/**
 * Helper function to determine if attraction is likely indoor
 */
export function isLikelyIndoorFromKinds(kinds: string, name: string): boolean {
  const kindsLower = kinds.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Indoor indicators
  const indoorKeywords = ['museum', 'gallery', 'theater', 'theatre', 'church', 'cathedral', 'temple', 'palace', 'castle', 'library', 'aquarium', 'shopping', 'mall'];
  const outdoorKeywords = ['park', 'garden', 'bridge', 'monument', 'square', 'tower', 'viewpoint', 'beach', 'mountain', 'trail'];
  
  // Check kinds
  if (kindsLower.includes('museums') || kindsLower.includes('religion') || kindsLower.includes('cultural')) {
    return true;
  }
  
  if (kindsLower.includes('natural') || kindsLower.includes('outdoor')) {
    return false;
  }
  
  // Check name
  const hasIndoorKeyword = indoorKeywords.some(keyword => nameLower.includes(keyword));
  const hasOutdoorKeyword = outdoorKeywords.some(keyword => nameLower.includes(keyword));
  
  if (hasIndoorKeyword && !hasOutdoorKeyword) return true;
  if (hasOutdoorKeyword && !hasIndoorKeyword) return false;
  
  // Default to indoor for safety (weather protection)
  return true;
}

/**
 * Get fallback image URL based on category
 */
export function getFallbackImageUrl(categories: string[]): string {
  const imageMap: Record<string, string> = {
    'Museums': 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg',
    'Historical Sites': 'https://images.pexels.com/photos/161758/governor-s-mansion-montgomery-alabama-grand-staircase-161758.jpeg',
    'Cultural': 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    'Nature': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    'Outdoor': 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    'Adventure': 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
    'Entertainment': 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg'
  };
  
  // Use the first matching category or default
  for (const category of categories) {
    if (imageMap[category]) {
      return imageMap[category];
    }
  }
  
  return 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg';
}