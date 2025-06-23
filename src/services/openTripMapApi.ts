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

// Enhanced mapping from OpenTripMap kinds to our ActivityCategory types
// This mapping object will be used by extractCategoriesFromKinds
export const detailedCategoryMappings: Record<string, ActivityCategory> = {
  // Museums & Arts
  "museums": "museums_arts",
  "museum": "museums_arts",
  "art_galleries": "museums_arts",
  "galleries": "museums_arts",
  "gallery": "museums_arts",
  "expositions": "museums_arts",
  "exhibition": "museums_arts",
  "cultural": "museums_arts",
  "heritage_center": "museums_arts",
  "visitor_center": "museums_arts",
  "art": "museums_arts",
  "artwork": "museums_arts",
  
  // Historical Sites & Monuments
  "historic": "historical_sites",
  "historical": "historical_sites",
  "ancient": "historical_sites",
  "archaeological_sites": "historical_sites",
  "archaeological": "historical_sites",
  "ruins": "historical_sites",
  "monuments_and_memorials": "historical_sites",
  "monuments": "historical_sites",
  "monument": "historical_sites",
  "memorial": "historical_sites",
  "memorials": "historical_sites",
  "statues": "historical_sites",
  "statue": "historical_sites",
  "sculpture": "historical_sites",
  "sculptures": "historical_sites",
  "heritage": "historical_sites",
  "settlement": "historical_sites",
  "village": "historical_sites",
  "battlefield": "historical_sites",
  
  // Religious & Spiritual Sites
  "religion": "religious_sites",
  "religious": "religious_sites",
  "churches": "religious_sites",
  "church": "religious_sites",
  "cathedrals": "religious_sites",
  "cathedral": "religious_sites",
  "temples": "religious_sites",
  "temple": "religious_sites",
  "mosques": "religious_sites",
  "mosque": "religious_sites",
  "synagogues": "religious_sites",
  "synagogue": "religious_sites",
  "monasteries": "religious_sites",
  "monastery": "religious_sites",
  "shrine": "religious_sites",
  "chapel": "religious_sites",
  "cemetery": "religious_sites",
  "cemeteries": "religious_sites",
  "graveyard": "religious_sites",
  "burial": "religious_sites",
  "tomb": "religious_sites",
  "tombs": "religious_sites",
  "mausoleum": "religious_sites",
  
  // Castles & Palaces
  "castles": "castles_palaces",
  "castle": "castles_palaces",
  "palaces": "castles_palaces",
  "palace": "castles_palaces",
  "fortifications": "castles_palaces",
  "fortress": "castles_palaces",
  "fort": "castles_palaces",
  "fortification": "castles_palaces",
  "citadel": "castles_palaces",
  "kremlin": "castles_palaces",
  "walls": "castles_palaces",
  "defensive": "castles_palaces",
  "manor": "castles_palaces",
  "mansion": "castles_palaces",
  "villa": "castles_palaces",
  "estate": "castles_palaces",
  
  // Architectural Landmarks
  "architecture": "architectural_landmarks",
  "historic_architecture": "architectural_landmarks",
  "towers": "architectural_landmarks",
  "tower": "architectural_landmarks",
  "bridges": "architectural_landmarks",
  "bridge": "architectural_landmarks",
  "suspension": "architectural_landmarks",
  "drawbridge": "architectural_landmarks",
  "viaduct": "architectural_landmarks",
  "aqueduct": "architectural_landmarks",
  "amphitheatre": "architectural_landmarks",
  "theatre": "architectural_landmarks",
  "opera": "architectural_landmarks",
  "arch": "architectural_landmarks",
  "triumphal": "architectural_landmarks",
  "skyscrapers": "architectural_landmarks",
  "skyscraper": "architectural_landmarks",
  "modern": "architectural_landmarks",
  "contemporary": "architectural_landmarks",
  "lighthouse": "architectural_landmarks",
  "lighthouses": "architectural_landmarks",
  "bell_tower": "architectural_landmarks",
  "clock_tower": "architectural_landmarks",
  "spire": "architectural_landmarks",
  
  // Natural Landscapes
  "natural": "natural_landscapes",
  "nature": "natural_landscapes",
  "mountains": "natural_landscapes",
  "peaks": "natural_landscapes",
  "volcanoes": "natural_landscapes",
  "caves": "natural_landscapes",
  "canyons": "natural_landscapes",
  "cliffs": "natural_landscapes",
  "rocks": "natural_landscapes",
  "geological": "natural_landscapes",
  "geological_formations": "natural_landscapes",
  "lakes": "natural_landscapes",
  "rivers": "natural_landscapes",
  "waterfalls": "natural_landscapes",
  "springs": "natural_landscapes",
  "beaches": "natural_landscapes",
  "beach": "natural_landscapes",
  "sand": "natural_landscapes",
  "shore": "natural_landscapes",
  "seaside": "natural_landscapes",
  "coastal": "natural_landscapes",
  "marine": "natural_landscapes",
  "islands": "natural_landscapes",
  "forests": "natural_landscapes",
  
  // Parks & Gardens
  "gardens_and_parks": "parks_gardens",
  "gardens": "parks_gardens",
  "garden": "parks_gardens",
  "parks": "parks_gardens",
  "park": "parks_gardens",
  "botanical_gardens": "parks_gardens",
  "botanical": "parks_gardens",
  "national_parks": "parks_gardens",
  "nature_reserves": "parks_gardens",
  "wildlife": "parks_gardens",
  "conservation": "parks_gardens",
  "arboretum": "parks_gardens",
  "green_space": "parks_gardens",
  "fountains": "parks_gardens",
  "fountain": "parks_gardens",
  "water_feature": "parks_gardens",
  
  // Outdoor Adventures & Sports
  "sport": "outdoor_sports",
  "sports": "outdoor_sports",
  "stadium": "outdoor_sports",
  "stadiums": "outdoor_sports",
  "skiing": "outdoor_sports",
  "ski_resorts": "outdoor_sports",
  "diving": "outdoor_sports",
  "surfing": "outdoor_sports",
  "climbing": "outdoor_sports",
  "golf_courses": "outdoor_sports",
  "golf": "outdoor_sports",
  "swimming": "outdoor_sports",
  "pool": "outdoor_sports",
  "recreation": "outdoor_sports",
  "sports_centres": "outdoor_sports",
  "swimming_pools": "outdoor_sports",
  
  // City Centers & Squares
  "urban_environment": "city_centers",
  "urban": "city_centers",
  "city_center": "city_centers",
  "city": "city_centers",
  "squares": "city_centers",
  "square": "city_centers",
  "plaza": "city_centers",
  "streets": "city_centers",
  "street": "city_centers",
  "district": "city_centers",
  "quarter": "city_centers",
  "neighborhood": "city_centers",
  
  // Viewpoints & Landmark Towers
  "viewpoints": "viewpoints_towers",
  "viewpoint": "viewpoints_towers",
  "view_point": "viewpoints_towers",
  "observation_decks": "viewpoints_towers",
  "observation": "viewpoints_towers",
  "lookouts": "viewpoints_towers",
  "lookout": "viewpoints_towers",
  "scenic": "viewpoints_towers",
  "panoramic": "viewpoints_towers",
  "overlook": "viewpoints_towers",
  "vista": "viewpoints_towers",
  
  // Theme Parks & Zoos
  "amusements": "theme_parks_zoos",
  "amusement": "theme_parks_zoos",
  "theme_parks": "theme_parks_zoos",
  "theme_park": "theme_parks_zoos",
  "amusement_park": "theme_parks_zoos",
  "water_park": "theme_parks_zoos",
  "zoos": "theme_parks_zoos",
  "zoo": "theme_parks_zoos",
  "aquariums": "theme_parks_zoos",
  "aquarium": "theme_parks_zoos",
  "miniature_park": "theme_parks_zoos",
  "roller_coaster": "theme_parks_zoos",
  "ferris_wheel": "theme_parks_zoos",
  
  // Nightlife
  "nightlife": "nightlife",
  "nightclubs": "nightlife",
  "bars": "nightlife",
  "bar": "nightlife",
  "clubs": "nightlife",
  "club": "nightlife",
  "casinos": "nightlife",
  "casino": "nightlife",
  "entertainment": "nightlife",
  
  // Shows & Cinema
  "theaters": "shows_cinema",
  "theater": "shows_cinema",
  "theatres": "shows_cinema",
  "cinemas": "shows_cinema",
  "cinema": "shows_cinema", // Corrected typo here
  
  // Shopping (if OpenTripMap provides these)
  "shopping": "shopping",
  "mall": "shopping",
  "market": "shopping",
  "shops": "shopping",
  
  // Interesting Places
  "interesting_places": "interesting_places",
  "tourist_facilities": "interesting_places",
  "tourist_attraction": "interesting_places",
  "attraction": "interesting_places",
  "other": "interesting_places",
  "unspecified": "interesting_places",
  
  // Food & Dining (if OpenTripMap provides these)
  "restaurants": "food_dining",
  "restaurant": "food_dining",
  "cafes": "food_dining",
  "cafe": "food_dining",
  "food": "food_dining",
  "dining": "food_dining"
};

/**
 * Extract categories from OpenTripMap kinds that match our defined ActivityCategory
 * Uses an enhanced mapping logic.
 */
export function extractCategoriesFromKinds(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.toLowerCase().split(',').map(k => k.trim());
  const matchedCategories = new Set<ActivityCategory>();

  // First pass: direct and specific keyword matches
  for (const kind of kindsArray) {
    if (detailedCategoryMappings[kind]) { // Use detailedCategoryMappings here
      matchedCategories.add(detailedCategoryMappings[kind]); // Add the mapped category
    }
  }

  // Second pass: general keyword matches for broader categories if no specific match
  if (matchedCategories.size === 0) { // Only run second pass if no matches found in first pass
    for (const kind of kindsArray) {
      // General keywords that might indicate a category
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

  // Final fallback if no specific or general keyword match
  if (matchedCategories.size === 0) {
    matchedCategories.add('interesting_places');
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
 * Get fallback image URL based on category
 */
export function getFallbackImageUrl(categories: ActivityCategory[]): string {
  const imageMap: Record<ActivityCategory, string> = {
    interesting_places: 'https://...',
    architecture: 'https://...',
    historic: 'https://...',
    historic_architecture: 'https://...',
    museums: 'https://...',
    cultural: 'https://...',
    religion: 'https://...',
    churches: 'https://...',
    cathedrals: 'https://...',
    castles: 'https://...',
    towers: 'https://...',
    viewpoints: 'https://...',
    monuments_and_memorials: 'https://...',
    natural: 'https://...',
    gardens_and_parks: 'https://...',
    urban_environment: 'https://...',
    amusements: 'https://...',
    sport: 'https://...'
  };

  for (const category of categories) {
    if (imageMap[category]) return imageMap[category];
  }

  return 'https://default-image-url.com';
}