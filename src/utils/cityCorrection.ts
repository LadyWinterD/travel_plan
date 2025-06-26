// City name auto-correction utilities
export interface CityMatch {
  name: string;
  country: string;
  confidence: number;
}

// Common misspellings and variations
const cityCorrections: Record<string, string> = {
  // New Zealand cities
  'auckland': 'Auckland',
  'welliton': 'Wellington',
  'wellington': 'Wellington',
  'christchurch': 'Christchurch',
  'christchurh': 'Christchurch',
  'christchruch': 'Christchurch',
  
  // Major world cities
  'paris': 'Paris',
  'london': 'London',
  'newyork': 'New York',
  'new york': 'New York',
  'losangeles': 'Los Angeles',
  'los angeles': 'Los Angeles',
  'sanfrancisco': 'San Francisco',
  'san francisco': 'San Francisco',
  'tokyo': 'Tokyo',
  'kyoto': 'Kyoto',
  'seoul': 'Seoul',
  'bangkok': 'Bangkok',
  'singapore': 'Singapore',
  'hongkong': 'Hong Kong',
  'hong kong': 'Hong Kong',
  'shanghai': 'Shanghai',
  'beijing': 'Beijing',
  'mumbai': 'Mumbai',
  'delhi': 'Delhi',
  'dubai': 'Dubai',
  'istanbul': 'Istanbul',
  'rome': 'Rome',
  'barcelona': 'Barcelona',
  'madrid': 'Madrid',
  'amsterdam': 'Amsterdam',
  'berlin': 'Berlin',
  'vienna': 'Vienna',
  'prague': 'Prague',
  'budapest': 'Budapest',
  'athens': 'Athens',
  'lisbon': 'Lisbon',
  'stockholm': 'Stockholm',
  'copenhagen': 'Copenhagen',
  'oslo': 'Oslo',
  'helsinki': 'Helsinki',
  'zurich': 'Zurich',
  'brussels': 'Brussels',
  'dublin': 'Dublin',
  'edinburgh': 'Edinburgh',
  'florence': 'Florence',
  'venice': 'Venice',
  'milan': 'Milan',
  'seville': 'Seville',
  'porto': 'Porto',
  'sydney': 'Sydney',
  'melbourne': 'Melbourne',
  'brisbane': 'Brisbane',
  'perth': 'Perth',
  'toronto': 'Toronto',
  'vancouver': 'Vancouver',
  'montreal': 'Montreal',
  'chicago': 'Chicago',
  'lasvegas': 'Las Vegas',
  'las vegas': 'Las Vegas',
  'miami': 'Miami',
  'boston': 'Boston',
  'seattle': 'Seattle',
  'sandiego': 'San Diego',
  'san diego': 'San Diego',
  'washingtondc': 'Washington DC',
  'washington dc': 'Washington DC',
  'mexicocity': 'Mexico City',
  'mexico city': 'Mexico City',
  'cancun': 'Cancun',
  'riodejaneiro': 'Rio de Janeiro',
  'rio de janeiro': 'Rio de Janeiro',
  'saopaulo': 'São Paulo',
  'são paulo': 'São Paulo',
  'buenosaires': 'Buenos Aires',
  'buenos aires': 'Buenos Aires',
  'lima': 'Lima',
  'santiago': 'Santiago',
  'bogota': 'Bogotá',
  'bogotá': 'Bogotá',
  'cairo': 'Cairo',
  'capetown': 'Cape Town',
  'cape town': 'Cape Town',
  'johannesburg': 'Johannesburg',
  'marrakech': 'Marrakech',
  'casablanca': 'Casablanca',
  'nairobi': 'Nairobi',
  'lagos': 'Lagos',
  'tunis': 'Tunis',
  'fiji': 'Fiji',
  
  // Common typos
  'wellinton': 'Wellington',
  'wellignton': 'Wellington',
  'wellingtn': 'Wellington',
  'aukland': 'Auckland',
  'aucklan': 'Auckland',
  'aucklad': 'Auckland',
  'christcurch': 'Christchurch',
  'parise': 'Paris',
  'paries': 'Paris',
  'londn': 'London',
  'londen': 'London',
  'tokio': 'Tokyo',
  'tokoyo': 'Tokyo',
  'sydny': 'Sydney',
  'sydeny': 'Sydney',
  'melbourn': 'Melbourne',
  'melbourme': 'Melbourne',
  'barcelon': 'Barcelona',
  'barcellona': 'Barcelona',
  'amsterdm': 'Amsterdam',
  'amsterdan': 'Amsterdam',
  'berln': 'Berlin',
  'berling': 'Berlin',
  'viena': 'Vienna',
  'vieena': 'Vienna',
  'praque': 'Prague',
  'prag': 'Prague',
  'budapst': 'Budapest',
  'budapesht': 'Budapest',
  'athen': 'Athens',
  'athenes': 'Athens',
  'lisbom': 'Lisbon',
  'lisboan': 'Lisbon',
  'stockhol': 'Stockholm',
  'stockholme': 'Stockholm',
  'copenhagn': 'Copenhagen',
  'copenhague': 'Copenhagen',
  'oslow': 'Oslo',
  'helsinky': 'Helsinki',
  'helsinkie': 'Helsinki',
  'zurih': 'Zurich',
  'brussel': 'Brussels',
  'bruxelles': 'Brussels',
  'dubln': 'Dublin',
  'dubline': 'Dublin',
  'edinburg': 'Edinburgh',
  'edimburgh': 'Edinburgh',
  'florenc': 'Florence',
  'florense': 'Florence',
  'venic': 'Venice',
  'venise': 'Venice',
  'miln': 'Milan',
  'milano': 'Milan',
  'sevill': 'Seville',
  'sevilla': 'Seville',
  'oporto': 'Porto',
  'sydey': 'Sydney',
  'sidney': 'Sydney',
  'melborn': 'Melbourne',
  'melbrun': 'Melbourne',
  'brisban': 'Brisbane',
  'brisbaine': 'Brisbane',
  'pert': 'Perth',
  'perthe': 'Perth',
  'toront': 'Toronto',
  'toronot': 'Toronto',
  'vancouvr': 'Vancouver',
  'vancouer': 'Vancouver',
  'montrel': 'Montreal',
  'chicag': 'Chicago',
  'chikago': 'Chicago',
  'vegass': 'Las Vegas',
  'vegas': 'Las Vegas',
  'miam': 'Miami',
  'miamy': 'Miami',
  'bostom': 'Boston',
  'bostun': 'Boston',
  'seatle': 'Seattle',
  'seattel': 'Seattle',
  'sandieg': 'San Diego',
  'san dieg': 'San Diego',
  'washingtn': 'Washington DC',
  'washington': 'Washington DC',
  'mexic': 'Mexico City',
  'mexico': 'Mexico City',
  'cancum': 'Cancun',
  'kankun': 'Cancun',
  'rio': 'Rio de Janeiro',
  'saopaul': 'São Paulo',
  'sao paul': 'São Paulo',
  'buenos': 'Buenos Aires',
  'lim': 'Lima',
  'santigo': 'Santiago',
  'santago': 'Santiago',
  'bogot': 'Bogotá',
  'cair': 'Cairo',
  'kayro': 'Cairo',
  'capetow': 'Cape Town',
  'cape': 'Cape Town',
  'johannesbur': 'Johannesburg',
  'joburg': 'Johannesburg',
  'marakech': 'Marrakech',
  'marakesh': 'Marrakech',
  'casablanc': 'Casablanca',
  'casablanka': 'Casablanca',
  'nairob': 'Nairobi',
  'nairoby': 'Nairobi',
  'lago': 'Lagos',
  'lagoss': 'Lagos',
  'tunys': 'Tunis',
  'fij': 'Fiji',
  'fijy': 'Fiji'
};

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Auto-correct city name with typo fixing
export function autoCorrectCityName(input: string): string {
  if (!input || input.trim().length === 0) return input;

  const normalized = input.toLowerCase().trim();
  
  // Direct correction lookup
  if (cityCorrections[normalized]) {
    return cityCorrections[normalized];
  }

  // Try to find close matches using fuzzy matching
  let bestMatch = input;
  let bestDistance = Infinity;
  const maxDistance = Math.floor(input.length * 0.3); // Allow up to 30% character differences

  for (const [typo, correction] of Object.entries(cityCorrections)) {
    const distance = levenshteinDistance(normalized, typo);
    
    // If it's a very close match (1-2 character difference), use it
    if (distance <= maxDistance && distance < bestDistance) {
      bestMatch = correction;
      bestDistance = distance;
    }
  }

  // If no close match found, at least capitalize properly
  if (bestMatch === input) {
    return input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return bestMatch;
}

// Get similarity score between two strings (0-1, where 1 is identical)
export function getSimilarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLength);
}

// Check if input is likely a typo of a known city
export function isLikelyTypo(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  
  // Check direct corrections
  if (cityCorrections[normalized]) return true;
  
  // Check fuzzy matches
  for (const typo of Object.keys(cityCorrections)) {
    const distance = levenshteinDistance(normalized, typo);
    const maxDistance = Math.floor(Math.max(input.length, typo.length) * 0.3);
    
    if (distance <= maxDistance && distance > 0) {
      return true;
    }
  }
  
  return false;
}