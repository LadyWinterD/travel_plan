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
 * Fetch image from Wikimedia Commons using Wikidata ID
 */
export async function fetchWikimediaImage(wikidataId: string): Promise<string | null> {
  if (!wikidataId || wikidataId.trim() === '') {
    return null;
  }

  try {
    console.log(`🖼️ Fetching Wikimedia image for Wikidata ID: ${wikidataId}`);
    
    // Step 1: Query Wikidata API to get the P18 (image) property
    const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&languages=en&languagefallback=1&origin=*`;
    
    const response = await fetch(wikidataUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch Wikidata for ${wikidataId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Check if the entity exists
    if (!data.entities || !data.entities[wikidataId]) {
      console.log(`❌ No Wikidata entity found for ID: ${wikidataId}`);
      return null;
    }
    
    const entity = data.entities[wikidataId];
    
    // Check if P18 (image) property exists
    if (!entity.claims || !entity.claims.P18) {
      console.log(`❌ No image (P18) property found for Wikidata ID: ${wikidataId}`);
      return null;
    }
    
    // Get the first image from P18 claims
    const imageClaims = entity.claims.P18;
    if (!imageClaims || imageClaims.length === 0) {
      console.log(`❌ No image claims found for Wikidata ID: ${wikidataId}`);
      return null;
    }
    
    const firstImageClaim = imageClaims[0];
    if (!firstImageClaim.mainsnak || !firstImageClaim.mainsnak.datavalue) {
      console.log(`❌ Invalid image claim structure for Wikidata ID: ${wikidataId}`);
      return null;
    }
    
    // Extract the filename
    const filename = firstImageClaim.mainsnak.datavalue.value;
    if (!filename || typeof filename !== 'string') {
      console.log(`❌ Invalid filename for Wikidata ID: ${wikidataId}`);
      return null;
    }
    
    // Step 2: Construct Wikimedia Commons Special:FilePath URL
    // This automatically serves the image at the requested size
    const encodedFilename = encodeURIComponent(filename);
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=800`;
    
    console.log(`✅ Found Wikimedia image for ${wikidataId}: ${filename}`);
    return imageUrl;
    
  } catch (error) {
    console.error(`Error fetching Wikimedia image for ${wikidataId}:`, error);
    return null;
  }
}

/**
 * Alternative method: Fetch image from OpenTripMap details.image field
 */
export async function fetchOpenTripMapImage(imageFilename: string): Promise<string | null> {
  if (!imageFilename || imageFilename.trim() === '') {
    return null;
  }

  try {
    // OpenTripMap sometimes provides just the filename, we need to construct the full URL
    const encodedFilename = encodeURIComponent(imageFilename);
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=800`;
    
    console.log(`🖼️ Constructed OpenTripMap image URL: ${imageUrl}`);
    return imageUrl;
    
  } catch (error) {
    console.error(`Error constructing OpenTripMap image URL for ${imageFilename}:`, error);
    return null;
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
 * Filter raw attractions based on kinds (Step 2) - Updated for English categories
 */
export function filterAttractionsByKinds(rawAttractions: OpenTripMapPlace[], cityName: string = 'Unknown'): AttractionPreview[] {
  console.log(`🔍 Filtering ${rawAttractions.length} raw attractions for ${cityName}...`);
  
  // Updated allowed kinds based on English category system
  const allowedKinds = [
    // Culture & History
    'museums', 'galleries', 'cultural', 'historic', 'historical', 'ancient', 'archaeological',
    'heritage', 'monuments', 'memorials', 'religion', 'churches', 'cathedrals', 'temples',
    'monasteries', 'castles', 'palaces', 'fortifications', 'architecture', 'towers', 'bridges',
    
    // Nature & Outdoors
    'natural', 'mountains', 'lakes', 'rivers', 'beaches', 'islands', 'parks', 'gardens',
    'national_parks', 'nature_reserves', 'wildlife', 'botanical_gardens', 'sport', 'recreation',
    
    // Urban Exploration
    'urban_environment', 'city_center', 'squares', 'streets', 'viewpoints', 'observation_decks',
    'lookouts', 'scenic',
    
    // Entertainment & Leisure
    'amusements', 'entertainment', 'theme_parks', 'zoos', 'aquariums', 'nightlife', 'theaters',
    'cinemas', 'shopping',
    
    // Other
    'interesting_places', 'tourist_attraction', 'tourist_facilities'
  ];
  
  const filteredAttractions = rawAttractions.filter(place => {
    if (!place.name) return false; // Filter out places without names
    
    const placeKinds = place.kinds.split(',');
    return placeKinds.some(kind => allowedKinds.includes(kind));
  }).sort((a, b) => b.rate - a.rate); // Sort by rating
  
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
 * Extract categories from OpenTripMap kinds that match our English ActivityCategory system
 */
export function extractCategoriesFromKinds(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.split(',').map(k => k.trim().toLowerCase());
  const matchedCategories = new Set<ActivityCategory>();

  // First pass: direct and specific keyword matches
  for (const kind of kindsArray) {
    if (detailedCategoryMappings[kind]) { 
      const category = detailedCategoryMappings[kind];
      if (!matchedCategories.has(category)) {
        matchedCategories.add(category);
      }
    }
  }

  // Second pass: general keyword matches for broader categories if no specific match
  if (matchedCategories.size === 0) {
    for (const kind of kindsArray) {
      if (kind.includes('museum') || kind.includes('gallery')) {
        matchedCategories.add('museums_arts');
      } else if (kind.includes('church') || kind.includes('cathedral') || kind.includes('temple') || kind.includes('mosque') || kind.includes('religion') || kind.includes('shrine')) {
        matchedCategories.add('religious_sites');
      } else if (kind.includes('castle') || kind.includes('fort') || kind.includes('palace')) {
        matchedCategories.add('castles_palaces');
      } else if (kind.includes('park') || kind.includes('garden') || kind.includes('reserve')) {
        matchedCategories.add('parks_gardens');
      } else if (kind.includes('historic') || kind.includes('ancient') || kind.includes('ruin') || kind.includes('monument') || kind.includes('memorial') || kind.includes('battlefield')) {
        matchedCategories.add('historical_sites');
      } else if (kind.includes('tower') || kind.includes('bridge') || kind.includes('building') || kind.includes('architecture')) {
        matchedCategories.add('architectural_landmarks');
      } else if (kind.includes('natural') || kind.includes('nature') || kind.includes('lake') || kind.includes('river') || kind.includes('mountain') || kind.includes('beach') || kind.includes('forest') || kind.includes('geological')) {
        matchedCategories.add('natural_landscapes');
      } else if (kind.includes('amusement') || kind.includes('theme_park') || kind.includes('zoo') || kind.includes('aquarium') || kind.includes('water_park')) {
        matchedCategories.add('theme_parks_zoos');
      } else if (kind.includes('sport') || kind.includes('stadium') || kind.includes('golf') || kind.includes('ski') || kind.includes('diving') || kind.includes('surfing') || kind.includes('climbing') || kind.includes('swimming')) {
        matchedCategories.add('outdoor_sports');
      } else if (kind.includes('viewpoint') || kind.includes('lookout') || kind.includes('observation') || kind.includes('scenic')) {
        matchedCategories.add('viewpoints_towers');
      } else if (kind.includes('urban') || kind.includes('city') || kind.includes('square') || kind.includes('street') || kind.includes('district')) {
        matchedCategories.add('city_centers');
      } else if (kind.includes('night') || kind.includes('bar') || kind.includes('club') || kind.includes('casino') || kind.includes('entertainment')) {
        matchedCategories.add('nightlife');
      } else if (kind.includes('theater') || kind.includes('cinema') || kind.includes('show') || kind.includes('opera')) {
        matchedCategories.add('shows_cinema');
      } else if (kind.includes('shop') || kind.includes('mall') || kind.includes('market')) {
        matchedCategories.add('shopping');
      } else if (kind.includes('restaurant') || kind.includes('cafe') || kind.includes('food') || kind.includes('dining') || kind.includes('culinary')) {
        matchedCategories.add('food_dining');
      }
    }
  }

  // Final fallback if nothing matched
  if (matchedCategories.size === 0) {
    matchedCategories.add('interesting_places');
  }

  return Array.from(matchedCategories);
}

  // Ensure all matched categories are indeed present in the activityCategories master list
  // This is a safety net in case a mapping produces an invalid category string
  const validatedMatchedCategories: ActivityCategory[] = Array.from(matchedCategories).filter(cat =>
    activityCategories.includes(cat)
  );

  return validatedMatchedCategories.length > 0 ? validatedMatchedCategories : ['interesting_places'];
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
 * Get fallback image URL based on English categories - using real Pexels image links
 */
export function getFallbackImageUrl(categories: ActivityCategory[]): string {
  const imageMap: Record<ActivityCategory, string> = {
    // Culture & History
    museums_arts: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg',
    historical_sites: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
    religious_sites: 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg',
    castles_palaces: 'https://images.pexels.com/photos/1680247/pexels-photo-1680247.jpeg',
    architectural_landmarks: 'https://images.pexels.com/photos/161758/governor-s-mansion-montgomery-alabama-grand-staircase-161758.jpeg',
    
    // Nature & Outdoors
    natural_landscapes: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
    parks_gardens: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
    outdoor_sports: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    
    // Urban Exploration
    city_centers: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    viewpoints_towers: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
    
    // Leisure & Entertainment
    theme_parks_zoos: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    nightlife: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    shows_cinema: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg',
    shopping: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    
    // Unique Experiences
    interesting_places: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    food_dining: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg'
  };

  // Try to find matching category image
  for (const category of categories) {
    if (imageMap[category]) {
      return imageMap[category];
    }
  }

  // Default fallback image
  return 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg';
}
