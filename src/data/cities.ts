export const popularCities = [
  // Europe
  { name: 'Paris', country: 'France' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Vienna', country: 'Austria' },
  { name: 'Prague', country: 'Czech Republic' },
  { name: 'Budapest', country: 'Hungary' },
  { name: 'Athens', country: 'Greece' },
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Stockholm', country: 'Sweden' },
  { name: 'Copenhagen', country: 'Denmark' },
  { name: 'Oslo', country: 'Norway' },
  { name: 'Helsinki', country: 'Finland' },
  { name: 'Zurich', country: 'Switzerland' },
  { name: 'Brussels', country: 'Belgium' },
  { name: 'Dublin', country: 'Ireland' },
  { name: 'Edinburgh', country: 'Scotland' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Venice', country: 'Italy' },
  { name: 'Milan', country: 'Italy' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Seville', country: 'Spain' },
  { name: 'Porto', country: 'Portugal' },
  
  // Asia
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Kyoto', country: 'Japan' },
  { name: 'Osaka', country: 'Japan' },
  { name: 'Seoul', country: 'South Korea' },
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Hong Kong', country: 'Hong Kong' },
  { name: 'Shanghai', country: 'China' },
  { name: 'Beijing', country: 'China' },
  { name: 'Mumbai', country: 'India' },
  { name: 'Delhi', country: 'India' },
  { name: 'Bangalore', country: 'India' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Istanbul', country: 'Turkey' },
  { name: 'Kuala Lumpur', country: 'Malaysia' },
  { name: 'Manila', country: 'Philippines' },
  { name: 'Jakarta', country: 'Indonesia' },
  { name: 'Ho Chi Minh City', country: 'Vietnam' },
  { name: 'Hanoi', country: 'Vietnam' },
  { name: 'Taipei', country: 'Taiwan' },
  
  // North America
  { name: 'New York', country: 'United States' },
  { name: 'Los Angeles', country: 'United States' },
  { name: 'San Francisco', country: 'United States' },
  { name: 'Chicago', country: 'United States' },
  { name: 'Las Vegas', country: 'United States' },
  { name: 'Miami', country: 'United States' },
  { name: 'Boston', country: 'United States' },
  { name: 'Washington DC', country: 'United States' },
  { name: 'Seattle', country: 'United States' },
  { name: 'San Diego', country: 'United States' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'Montreal', country: 'Canada' },
  { name: 'Mexico City', country: 'Mexico' },
  { name: 'Cancun', country: 'Mexico' },
  
  // South America
  { name: 'Rio de Janeiro', country: 'Brazil' },
  { name: 'São Paulo', country: 'Brazil' },
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Lima', country: 'Peru' },
  { name: 'Santiago', country: 'Chile' },
  { name: 'Bogotá', country: 'Colombia' },
  { name: 'Quito', country: 'Ecuador' },
  { name: 'Montevideo', country: 'Uruguay' },
  
  // Africa
  { name: 'Cairo', country: 'Egypt' },
  { name: 'Cape Town', country: 'South Africa' },
  { name: 'Johannesburg', country: 'South Africa' },
  { name: 'Marrakech', country: 'Morocco' },
  { name: 'Casablanca', country: 'Morocco' },
  { name: 'Nairobi', country: 'Kenya' },
  { name: 'Lagos', country: 'Nigeria' },
  { name: 'Tunis', country: 'Tunisia' },
  
  // Oceania
  { name: 'Sydney', country: 'Australia' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Brisbane', country: 'Australia' },
  { name: 'Perth', country: 'Australia' },
  { name: 'Auckland', country: 'New Zealand' },
  { name: 'Wellington', country: 'New Zealand' },
  { name: 'Christchurch', country: 'New Zealand' },
  { name: 'Fiji', country: 'Fiji' },
];

export const searchCities = (query: string) => {
  if (!query || query.length < 1) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return popularCities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, 8) // Limit to 8 results for better UX
    .sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
};