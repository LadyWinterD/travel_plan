// OpenTripMap API Service for real attraction data
// API Documentation: https://opentripmap.io/docs

const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY || '5ae2e3f221c38a28845f05b613c6bd060fbfa46746435156427f8f3d';
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

export interface AttractionPreview {
  xid: string;
  name: string;
  kinds: string;
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
 * Get raw attractions within radius using OpenTripMap
 */
export async function getRawAttractions(lat: number, lon: number, radiusKm: number = 30): Promise<OpenTripMapPlace[]> {
  try {
    console.log(`🎯 Getting raw attractions near: ${lat}, ${lon} (radius: ${radiusKm}km)`);
    
    const radiusMeters = radiusKm * 1000;
    const kinds = 'interesting_places,museums,architecture,historic,cultural,religion,sport,amusements,tourist_facilities,urban_environment,natural,gardens_and_parks';
    
    // Removed &rate=2 to allow attractions of all rating levels
    const url = `${BASE_URL}/radius?radius=${radiusMeters}&lon=${lon}&lat=${lat}&kinds=${kinds}&format=json&limit=100&apikey=${API_KEY}`;
    
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
      .filter((place: OpenTripMapPlace) => place.name && place.name !== 'Unnamed Attraction');
    
    console.log(`✅ Found ${places.length} raw attractions near: ${lat}, ${lon}`);
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
 * Step 1: Filter raw attractions based on kinds
 */
export function filterAttractionsByKinds(rawAttractions: OpenTripMapPlace[], cityName: string = 'Unknown'): AttractionPreview[] {
  console.log(`🔍 Filtering ${rawAttractions.length} raw attractions for ${cityName}...`);
  
  // Define expanded allowed and disallowed kinds
  const allowedKinds = [
    'architecture', 'historic', 'museums', 'cultural', 'religion', 'natural', 
    'gardens_and_parks', 'urban_environment', 'towers', 'castles', 'viewpoints', 'interesting_places'
  ];
  const disallowedKinds = ['foods', 'shops', 'banks', 'atm', 'supermarkets'];
  
  const filteredAttractions = rawAttractions.filter(attraction => {
    const kinds = attraction.kinds.toLowerCase();
    
    // Check if it contains any disallowed kinds
    const hasDisallowedKind = disallowedKinds.some(disallowed => kinds.includes(disallowed));
    if (hasDisallowedKind) {
      console.log(`❌ Filtering out "${attraction.name}" - contains disallowed kind: ${attraction.kinds}`);
      return false;
    }
    
    // Check if it contains any allowed kinds
    const hasAllowedKind = allowedKinds.some(allowed => kinds.includes(allowed));
    if (!hasAllowedKind) {
      console.log(`❌ Filtering out "${attraction.name}" - no allowed kinds: ${attraction.kinds}`);
      return false;
    }
    
    console.log(`✅ Keeping "${attraction.name}" - kinds: ${attraction.kinds}`);
    return true;
  });
  
  // Convert to AttractionPreview format
  let previews: AttractionPreview[] = filteredAttractions.map(attraction => ({
    xid: attraction.xid,
    name: attraction.name,
    kinds: attraction.kinds
  }));
  
  console.log(`Found ${previews.length} attractions after filtering for ${cityName}`);
  
  // Fallback mechanism: if fewer than 5 attractions, relax filter
  if (previews.length < 5) {
    console.log(`⚠️ Only ${previews.length} attractions found for ${cityName}, applying fallback filter...`);
    
    const fallbackAllowedKinds = [
      ...allowedKinds,
      'tourist_facilities', 'amusements'
    ];
    
    const fallbackFiltered = rawAttractions.filter(attraction => {
      const kinds = attraction.kinds.toLowerCase();
      
      // Check if it contains any disallowed kinds (excluding tourist_facilities and amusements now)
      const hasDisallowedKind = ['foods', 'shops', 'banks', 'atm', 'supermarkets'].some(disallowed => kinds.includes(disallowed));
      if (hasDisallowedKind) {
        return false;
      }
      
      // Check if it contains any fallback allowed kinds
      const hasAllowedKind = fallbackAllowedKinds.some(allowed => kinds.includes(allowed));
      return hasAllowedKind;
    });
    
    previews = fallbackFiltered.map(attraction => ({
      xid: attraction.xid,
      name: attraction.name,
      kinds: attraction.kinds
    }));
    
    console.log(`✅ Fallback filter applied: ${previews.length} attractions found for ${cityName}`);
  }
  
  return previews;
}

/**
 * Get top attractions within radius using OpenTripMap (legacy function - now uses new pipeline)
 */
export async function getTopAttractions(lat: number, lon: number, radiusKm: number = 30, cityName: string = 'Unknown'): Promise<OpenTripMapPlace[]> {
  try {
    // Step 1: Get raw attractions
    const rawAttractions = await getRawAttractions(lat, lon, radiusKm);
    
    // Step 2: Filter by kinds with city name for logging
    const filteredPreviews = filterAttractionsByKinds(rawAttractions, cityName);
    
    // Convert back to OpenTripMapPlace format for compatibility
    const filteredAttractions = rawAttractions.filter(attraction => 
      filteredPreviews.some(preview => preview.xid === attraction.xid)
    );
    
    // Sort by rating and return top results
    const sortedAttractions = filteredAttractions
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 30); // Limit to top 30
    
    console.log(`🏆 Returning ${sortedAttractions.length} top filtered attractions for ${cityName}`);
    return sortedAttractions;
    
  } catch (error) {
    console.error(`Error in getTopAttractions for ${cityName}:`, error);
    throw error;
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
      case 'gardens_and_parks':
        categories.push('Nature', 'Outdoor');
        break;
      case 'urban_environment':
      case 'towers':
      case 'castles':
      case 'viewpoints':
        categories.push('Entertainment', 'Cultural');
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
  
  if (kindsLower.includes('natural') || kindsLower.includes('outdoor') || kindsLower.includes('gardens_and_parks')) {
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