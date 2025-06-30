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
 * NEW: Fetch full Wikipedia extract using Wikipedia API
 * This function gets comprehensive descriptions directly from Wikipedia
 */
export async function fetchWikipediaFullExtract(pageTitle: string): Promise<{
  title: string;
  text: string;
  html?: string;
} | null> {
  if (!pageTitle || pageTitle.trim() === '') {
    return null;
  }

  try {
    console.log(`📖 Fetching full Wikipedia extract for: ${pageTitle}`);
    
    // Clean the page title - remove URL parts if it's a full URL
    let cleanTitle = pageTitle;
    if (pageTitle.includes('wikipedia.org/wiki/')) {
      cleanTitle = pageTitle.split('/wiki/')[1];
    }
    
    // Decode URL encoding
    cleanTitle = decodeURIComponent(cleanTitle);
    
    // Wikipedia API endpoint for extracts
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=extracts&exintro=&explaintext=&exsectionformat=plain&origin=*`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch Wikipedia extract for ${cleanTitle}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (!data.query || !data.query.pages) {
      console.log(`❌ No Wikipedia data found for: ${cleanTitle}`);
      return null;
    }
    
    // Get the first (and usually only) page from the results
    const pages = Object.values(data.query.pages) as any[];
    const page = pages[0];
    
    if (!page || page.missing !== undefined) {
      console.log(`❌ Wikipedia page not found for: ${cleanTitle}`);
      return null;
    }
    
    if (!page.extract || page.extract.trim() === '') {
      console.log(`❌ No extract content found for: ${cleanTitle}`);
      return null;
    }
    
    const extract = {
      title: page.title || cleanTitle,
      text: page.extract.trim(),
      html: undefined // We're using plain text for now
    };
    
    console.log(`✅ Successfully fetched Wikipedia extract for ${cleanTitle} (${extract.text.length} characters)`);
    return extract;
    
  } catch (error) {
    console.error(`Error fetching Wikipedia extract for ${pageTitle}:`, error);
    return null;
  }
}

/**
 * Extract Wikipedia page title from a Wikipedia URL
 */
export function extractWikipediaTitle(wikipediaUrl: string): string | null {
  if (!wikipediaUrl) return null;
  
  try {
    // Handle different Wikipedia URL formats
    const patterns = [
      /\/wiki\/([^#?]+)/,  // Standard /wiki/Title format
      /\/([^\/]+)$/        // Just the title at the end
    ];
    
    for (const pattern of patterns) {
      const match = wikipediaUrl.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Wikipedia title:', error);
    return null;
  }
}

/**
 * Check if a URL is a direct Wikimedia image URL
 * Enhanced to accept both upload.wikimedia.org and commons.wikimedia.org/static/images/ URLs
 */
export function isDirectWikimediaUrl(url: string): boolean {
  return (
    url.includes('upload.wikimedia.org') || 
    (url.includes('commons.wikimedia.org') && url.includes('/static/images/'))
  ) && !url.includes('Special:FilePath');
}

/**
 * Check if URL has a valid image file extension
 */
function hasImageExtension(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
}

/**
 * Enhanced processImageUrl function - validates and returns the URL or null if invalid
 * This function implements robust validation logic to maximize use of original images
 */
export async function processImageUrl(url: string): Promise<string | null> {
  if (!url || url.trim() === '') {
    console.warn('🚫 processImageUrl: Empty or null URL provided');
    return null;
  }

  const trimmedUrl = url.trim();
  
  // Priority 1: Wikimedia Special:FilePath URLs are designed to redirect to actual images
  if (trimmedUrl.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
    console.log(`✅ processImageUrl: Accepting Wikimedia Special:FilePath URL: ${trimmedUrl}`);
    return trimmedUrl;
  }
  
  // Priority 2: Direct Wikimedia image URLs (upload.wikimedia.org or commons.wikimedia.org/static/images/)
  if (isDirectWikimediaUrl(trimmedUrl)) {
    console.log(`✅ processImageUrl: Accepting direct Wikimedia URL: ${trimmedUrl}`);
    return trimmedUrl;
  }
  
  // Priority 3: URLs with valid image file extensions
  if (hasImageExtension(trimmedUrl)) {
    console.log(`✅ processImageUrl: Accepting URL with image extension: ${trimmedUrl}`);
    return trimmedUrl;
  }
  
  // Priority 4: URLs from trusted image domains (even without extensions)
  const trustedDomains = [
    'images.pexels.com',
    'unsplash.com',
    'pixabay.com',
    'flickr.com',
    'imgur.com'
  ];
  
  const urlDomain = trimmedUrl.toLowerCase();
  if (trustedDomains.some(domain => urlDomain.includes(domain))) {
    console.log(`✅ processImageUrl: Accepting trusted domain URL: ${trimmedUrl}`);
    return trimmedUrl;
  }
  
  // Reject URLs that don't meet our criteria
  console.warn(`🚫 processImageUrl: Rejecting URL (no image extension or trusted domain): ${trimmedUrl}`);
  return null;
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
 * 🚀 ENHANCED: Get raw attractions within radius using OpenTripMap (Step 1)
 * 🌍 ENHANCED: Increased default radius to 100km for maximum coverage
 */
export async function getRawAttractions(lat: number, lon: number, radiusKm: number = 100): Promise<OpenTripMapPlace[]> {
  try {
    console.log(`🎯 Getting raw attractions near: ${lat}, ${lon} (radius: ${radiusKm}km)`);
    
    const radiusMeters = radiusKm * 1000;
    const kinds = 'interesting_places,natural,cultural,architecture,historic,religion,museums,amusements,sport';
    
    // 🚀 ENHANCED: 增加限制到1000，获取更多景点
    const url = `${BASE_URL}/radius?radius=${radiusMeters}&lon=${lon}&lat=${lat}&kinds=${kinds}&limit=1000&format=json&apikey=${API_KEY}`;
    
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
    
    console.log(`✅ Found ${namedPlaces.length} raw attractions near: ${lat}, ${lon} within ${radiusKm}km`);
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
 * 🚀 ENHANCED: Main function to get top attractions (combines all steps)
 * 🌍 ENHANCED: Increased default radius to 100km and returns 250 attractions for maximum variety!
 */
export async function getTopAttractions(lat: number, lon: number, radiusKm: number = 100, cityName: string = 'Unknown'): Promise<OpenTripMapPlace[]> {
  try {
    // Step 1: Get raw attractions with larger radius
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
    
    // 🚀 ENHANCED: Return top 250 instead of 50 for maximum variety!
    const topAttractions = filteredAttractions.slice(0, 250);
    
    console.log(`🏆 Returning ${topAttractions.length} top filtered attractions for ${cityName} within ${radiusKm}km (INCREASED TO 250!)`);
    return topAttractions;
    
  } catch (error) {
    console.error(`Error in getTopAttractions for ${cityName}:`, error);
    return [];
  }
}

/**
 * 🎯 ENHANCED: Refined function to determine if attraction is likely indoor
 * This function now uses a sophisticated scoring system with detailed keyword analysis
 */
export function isLikelyIndoorFromKinds(kinds: string, name: string): boolean {
  const kindsLower = kinds.toLowerCase();
  const nameLower = name.toLowerCase();
  
  console.log(`🏠 Analyzing indoor/outdoor for "${name}" with kinds: "${kinds}"`);
  
  // PHASE 1: Strong Indoor Indicators (High Priority)
  const strongIndoorKeywords = [
    // Museums & Cultural
    'museum', 'museums', 'gallery', 'galleries', 'exhibition', 'cultural_center', 'cultural_centre',
    'art_gallery', 'local_museum', 'history_museum', 'science_museum', 'art_museum',
    
    // Religious Buildings (Indoor spaces)
    'church', 'churches', 'cathedral', 'cathedrals', 'temple', 'temples', 'mosque', 'mosques',
    'synagogue', 'synagogues', 'monastery', 'monasteries', 'chapel', 'shrine', 'basilica',
    
    // Entertainment & Shopping
    'theater', 'theatre', 'theaters', 'theatres', 'cinema', 'cinemas', 'movie_theater',
    'shopping', 'shops', 'shop', 'mall', 'malls', 'shopping_center', 'shopping_centre',
    'market', 'markets', 'marketplace', 'marketplaces', 'department_store', 'boutique',
    
    // Hospitality & Dining
    'restaurant', 'restaurants', 'cafe', 'cafes', 'coffee', 'bar', 'bars', 'pub', 'pubs',
    'hotel', 'hotels', 'library', 'libraries',
    
    // Indoor Sports & Recreation
    'aquarium', 'aquariums', 'casino', 'casinos', 'spa', 'wellness', 'gym', 'fitness',
    'bowling', 'arcade', 'indoor_pool', 'swimming_pool',
    
    // Buildings & Architecture (when referring to interior spaces)
    'palace', 'palaces', 'castle', 'castles', 'mansion', 'manor', 'villa', 'hall',
    'center', 'centre', 'building', 'complex', 'facility', 'station'
  ];
  
  // PHASE 2: Strong Outdoor Indicators (High Priority)
  const strongOutdoorKeywords = [
    // Natural Features
    'park', 'parks', 'garden', 'gardens', 'botanical_garden', 'botanical_gardens',
    'nature_reserve', 'nature_reserves', 'national_park', 'national_parks',
    'beach', 'beaches', 'lake', 'lakes', 'river', 'rivers', 'waterfall', 'waterfalls',
    'mountain', 'mountains', 'hill', 'hills', 'forest', 'forests', 'woods', 'woodland',
    'island', 'islands', 'peninsula', 'coast', 'coastal', 'seaside', 'shore',
    'cliff', 'cliffs', 'canyon', 'canyons', 'valley', 'valleys', 'cave', 'caves',
    'volcano', 'volcanoes', 'geyser', 'geysers', 'spring', 'springs', 'hot_springs',
    
    // Outdoor Structures & Viewpoints
    'bridge', 'bridges', 'tower', 'towers', 'lighthouse', 'lighthouses',
    'viewpoint', 'viewpoints', 'view_point', 'view_points', 'lookout', 'lookouts',
    'observation_deck', 'observation_decks', 'scenic', 'panoramic', 'overlook',
    
    // Urban Outdoor Spaces
    'square', 'squares', 'plaza', 'plazas', 'street', 'streets', 'avenue', 'boulevard',
    'promenade', 'boardwalk', 'pier', 'wharf', 'harbor', 'harbour', 'port',
    'city_center', 'city_centre', 'downtown', 'district', 'quarter', 'neighborhood',
    
    // Outdoor Sports & Recreation
    'stadium', 'stadiums', 'arena', 'golf_course', 'golf_courses', 'golf',
    'ski_resort', 'ski_resorts', 'skiing', 'hiking', 'trail', 'trails', 'path', 'paths',
    'cycling', 'biking', 'climbing', 'rock_climbing', 'surfing', 'diving',
    'outdoor_sports', 'recreation', 'playground', 'playgrounds',
    
    // Monuments & Memorials (typically outdoor)
    'monument', 'monuments', 'memorial', 'memorials', 'statue', 'statues',
    'sculpture', 'sculptures', 'fountain', 'fountains', 'obelisk', 'arch',
    'war_memorial', 'war_memorials', 'cemetery', 'cemeteries', 'graveyard'
  ];
  
  // PHASE 3: Scoring System
  let indoorScore = 0;
  let outdoorScore = 0;
  
  // Check kinds (higher weight - more reliable)
  const kindsArray = kindsLower.split(',').map(k => k.trim());
  
  for (const kind of kindsArray) {
    // Strong indoor matches in kinds (weight: 3)
    if (strongIndoorKeywords.some(keyword => kind.includes(keyword))) {
      indoorScore += 3;
      console.log(`🏠 Strong indoor match in kinds: "${kind}" (+3 indoor)`);
    }
    
    // Strong outdoor matches in kinds (weight: 3)
    if (strongOutdoorKeywords.some(keyword => kind.includes(keyword))) {
      outdoorScore += 3;
      console.log(`🌳 Strong outdoor match in kinds: "${kind}" (+3 outdoor)`);
    }
  }
  
  // Check name (lower weight - less reliable)
  // Strong indoor matches in name (weight: 2)
  for (const keyword of strongIndoorKeywords) {
    if (nameLower.includes(keyword)) {
      indoorScore += 2;
      console.log(`🏠 Indoor match in name: "${keyword}" (+2 indoor)`);
      break; // Only count one match per category to avoid over-weighting
    }
  }
  
  // Strong outdoor matches in name (weight: 2)
  for (const keyword of strongOutdoorKeywords) {
    if (nameLower.includes(keyword)) {
      outdoorScore += 2;
      console.log(`🌳 Outdoor match in name: "${keyword}" (+2 outdoor)`);
      break; // Only count one match per category to avoid over-weighting
    }
  }
  
  // PHASE 4: Special Cases and Context-Aware Adjustments
  
  // Religious sites: Most are indoor worship spaces
  if (kindsLower.includes('religion') || kindsLower.includes('religious')) {
    indoorScore += 2;
    console.log(`⛪ Religious site bonus (+2 indoor)`);
  }
  
  // Natural landscapes: Almost always outdoor
  if (kindsLower.includes('natural') || kindsLower.includes('geological')) {
    outdoorScore += 3;
    console.log(`🏞️ Natural landscape bonus (+3 outdoor)`);
  }
  
  // Gardens and parks: Always outdoor
  if (kindsLower.includes('gardens_and_parks') || kindsLower.includes('parks')) {
    outdoorScore += 3;
    console.log(`🌳 Parks/gardens bonus (+3 outdoor)`);
  }
  
  // Urban environment: Usually outdoor public spaces
  if (kindsLower.includes('urban_environment')) {
    outdoorScore += 2;
    console.log(`🏙️ Urban environment bonus (+2 outdoor)`);
  }
  
  // Museums: Almost always indoor
  if (kindsLower.includes('museums')) {
    indoorScore += 3;
    console.log(`🏛️ Museum bonus (+3 indoor)`);
  }
  
  // Sports: Context-dependent
  if (kindsLower.includes('sport')) {
    // Check for specific outdoor sports
    if (nameLower.includes('golf') || nameLower.includes('ski') || nameLower.includes('stadium')) {
      outdoorScore += 2;
      console.log(`⚽ Outdoor sport bonus (+2 outdoor)`);
    } else {
      // Default sports facilities are often indoor
      indoorScore += 1;
      console.log(`🏃 General sport facility (+1 indoor)`);
    }
  }
  
  // PHASE 5: Decision Logic
  console.log(`📊 Final scores for "${name}": Indoor=${indoorScore}, Outdoor=${outdoorScore}`);
  
  // Clear winner
  if (indoorScore > outdoorScore) {
    console.log(`✅ Classification: INDOOR (score: ${indoorScore} vs ${outdoorScore})`);
    return true;
  } else if (outdoorScore > indoorScore) {
    console.log(`✅ Classification: OUTDOOR (score: ${outdoorScore} vs ${indoorScore})`);
    return false;
  }
  
  // Tie or no matches - use contextual defaults
  if (indoorScore === 0 && outdoorScore === 0) {
    // No strong indicators - use conservative default based on common patterns
    if (nameLower.includes('center') || nameLower.includes('centre') || 
        nameLower.includes('building') || nameLower.includes('house')) {
      console.log(`🏢 Default: INDOOR (building-related name)`);
      return true;
    } else {
      console.log(`🌳 Default: OUTDOOR (no clear indoor indicators)`);
      return false;
    }
  }
  
  // Tie - default to indoor for safety (weather protection)
  console.log(`⚖️ Tie score - Default: INDOOR (weather safety)`);
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