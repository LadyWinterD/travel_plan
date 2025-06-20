// OpenTripMap API Service for real attraction data
// API Documentation: https://opentripmap.io/docs
import { activityCategories, ActivityCategory } from '../data/activityCategories';

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
      console.warn(`Failed to get coordinates: ${response.status} ${response.statusText}`);
      return null;
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
    return null;
  }
}

/**
 * Get raw attractions within radius using OpenTripMap (Step 1)
 * CORRECTED VERSION - Fixed API response parsing
 */
export async function getRawAttractions(lat: number, lon: number, radiusKm: number = 30): Promise<OpenTripMapPlace[]> {
  try {
    console.log(`🎯 Getting raw attractions near: ${lat}, ${lon} (radius: ${radiusKm}km)`);
    
    const radiusMeters = radiusKm * 1000;
    const kinds = 'interesting_places,natural,cultural,architecture,historic,religion,museums,amusements,sport';
    
    const url = `${BASE_URL}/radius?radius=${radiusMeters}&lon=${lon}&lat=${lat}&kinds=${kinds}&limit=500&format=json&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to get attractions: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // --- THIS IS THE FIX ---
    // The response itself is the array of places, not a GeoJSON object
    const places: OpenTripMapPlace[] = await response.json();
    
    if (!Array.isArray(places)) {
      console.log(`❌ API did not return an array for: ${lat}, ${lon}`);
      return [];
    }
    
    // Filter out unnamed places as good practice
    const namedPlaces = places.filter(p => p.name);
    
    console.log(`✅ Found ${namedPlaces.length} raw attractions near: ${lat}, ${lon}`);
    return namedPlaces;
    
  } catch (error) {
    console.error(`Error getting attractions near ${lat}, ${lon}:`, error);
    return [];
  }
}

/**
 * Filter raw attractions based on kinds (Step 2) - Based on your working logic
 */
export function filterAttractionsByKinds(rawAttractions: OpenTripMapPlace[], cityName: string = 'Unknown'): AttractionPreview[] {
  console.log(`🔍 Filtering ${rawAttractions.length} raw attractions for ${cityName}...`);
  
  // Use the same allowed kinds as your working code
  const allowedKinds = [
    'museums', 'historic', 'architecture', 'cultural', 'natural', 
    'gardens_and_parks', 'religion', 'monuments_and_memorials', 
    'towers', 'bridges', 'view_points', 'interesting_places', 
    'cathedrals', 'castles'
  ];
  
  const filteredAttractions = rawAttractions.filter(place => {
    if (!place.name) return false; // Filter out places without names
    
    const placeKinds = place.kinds.split(',');
    return placeKinds.some(kind => allowedKinds.includes(kind));
  }).sort((a, b) => b.rate - a.rate); // Sort by rating like your code
  
  // Convert to AttractionPreview format
  const previews: AttractionPreview[] = filteredAttractions.map(attraction => ({
    xid: attraction.xid,
    name: attraction.name,
    kinds: attraction.kinds
  }));
  
  console.log(`Found ${previews.length} attractions after filtering for ${cityName}`);
  
  return previews;
}

/**
 * Get detailed information about a specific place (Step 3)
 */
export async function getPlaceDetails(xid: string): Promise<OpenTripMapDetails | null> {
  try {
    const url = `${BASE_URL}/xid/${xid}?apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data: OpenTripMapDetails = await response.json();
    return data;
    
  } catch (error) {
    console.error(`Error getting details for ${xid}:`, error);
    return null;
  }
}

/**
 * Main function to get top attractions (combines all steps like your working code)
 */
export async function getTopAttractions(lat: number, lon: number, radiusKm: number = 30, cityName: string = 'Unknown'): Promise<OpenTripMapPlace[]> {
  try {
    // Step 1: Get raw attractions
    const rawAttractions = await getRawAttractions(lat, lon, radiusKm);
    if (rawAttractions.length === 0) {
      console.log(`No raw attractions found for ${cityName}`);
      return [];
    }
    
    // Step 2: Filter by kinds
    const filteredPreviews = filterAttractionsByKinds(rawAttractions, cityName);
    if (filteredPreviews.length === 0) {
      console.log(`No quality attractions found after filtering for ${cityName}`);
      return [];
    }
    
    // Convert back to OpenTripMapPlace format for compatibility
    const filteredAttractions = rawAttractions.filter(attraction => 
      filteredPreviews.some(preview => preview.xid === attraction.xid)
    );
    
    // Return top 20 like your working code
    const topAttractions = filteredAttractions.slice(0, 20);
    
    console.log(`🏆 Returning ${topAttractions.length} top filtered attractions for ${cityName}`);
    return topAttractions;
    
  } catch (error) {
    console.error(`Error in getTopAttractions for ${cityName}:`, error);
    return [];
  }
}

/**
 * Helper function to extract categories from OpenTripMap kinds
 */


/**
 * Extract categories from OpenTripMap kinds that match our defined ActivityCategory
 */
export function extractCategoriesFromKinds(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.split(',');
  const matchedCategories: ActivityCategory[] = [];

  kindsArray.forEach(kind => {
    if (activityCategories.includes(kind as ActivityCategory)) {
      matchedCategories.push(kind as ActivityCategory);
    }
  });

  return [...new Set(matchedCategories)];
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
export function getFallbackImageUrl(categories: ActivityCategory[]): string {
  const imageMap: Record<ActivityCategory, string> = {
    interesting_places: 'https://example.com/a.jpg',
    architecture: 'https://example.com/b.jpg',
    historic: 'https://example.com/c.jpg',
    historic_architecture: 'https://example.com/d.jpg',
    museums: 'https://example.com/e.jpg',
    cultural: 'https://example.com/f.jpg',
    religion: 'https://example.com/g.jpg',
    churches: 'https://example.com/h.jpg',
    cathedrals: 'https://example.com/i.jpg',
    castles: 'https://example.com/j.jpg',
    towers: 'https://example.com/k.jpg',
    viewpoints: 'https://example.com/l.jpg',
    monuments_and_memorials: 'https://example.com/m.jpg',
    natural: 'https://example.com/n.jpg',
    gardens_and_parks: 'https://example.com/o.jpg',
    urban_environment: 'https://example.com/p.jpg',
    amusements: 'https://example.com/q.jpg',
    sport: 'https://example.com/r.jpg'
  };

  for (const category of categories) {
    if (imageMap[category]) return imageMap[category];
  }

  return 'https://example.com/default.jpg';
}