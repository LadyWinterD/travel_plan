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
  const kindsArray = kinds.split(',').map(k => k.trim());

  const matchedCategories: ActivityCategory[] = [];

  for (const kind of kindsArray) {
    const match = activityCategories.find(cat => kind.includes(cat));
    if (match && !matchedCategories.includes(match)) {
      matchedCategories.push(match);
    }
  }

  return matchedCategories.length > 0 ? matchedCategories : ['interesting_places'];
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
 * Get fallback image URL based on category - 使用真实的 Pexels 图片链接
 */
export function getFallbackImageUrl(categories: ActivityCategory[]): string {
  const imageMap: Record<ActivityCategory, string> = {
    interesting_places: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    architecture: 'https://images.pexels.com/photos/161758/governor-s-mansion-montgomery-alabama-grand-staircase-161758.jpeg',
    historic: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
    historic_architecture: 'https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg',
    museums: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg',
    cultural: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg',
    religion: 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg',
    churches: 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg',
    cathedrals: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    castles: 'https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg',
    towers: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
    viewpoints: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    monuments_and_memorials: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
    natural: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
    gardens_and_parks: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
    urban_environment: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    amusements: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    sport: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg'
  };

  // 尝试找到匹配的类别图片
  for (const category of categories) {
    if (imageMap[category]) {
      return imageMap[category];
    }
  }

  // 默认回退图片
  return 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg';
}