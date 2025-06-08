import { Activity, Destination, WeatherData } from '../types';
import { searchCityAttractions, getBestImageUrl, extractCategories, isLikelyIndoor, TripAdvisorApiError } from '../services/tripAdvisorApi';

// Enhanced Mock Weather Data with more realistic patterns
export const getMockWeather = (destinationId: string, date: string): WeatherData => {
  const dateObj = new Date(date);
  const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Create seasonal temperature patterns
  const seasonalTemp = 15 + 10 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
  const dailyVariation = (Math.sin(dayOfYear * 0.1) * 5);
  const randomVariation = (Math.random() - 0.5) * 8;
  
  const temperature = Math.round(seasonalTemp + dailyVariation + randomVariation);
  
  // Weather patterns based on season and randomness
  const rainChance = 0.2 + 0.1 * Math.sin((dayOfYear - 120) * 2 * Math.PI / 365) + Math.random() * 0.3;
  const isRainy = rainChance > 0.6;
  
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'];
  let condition: string;
  let precipitation = 0;
  
  if (isRainy) {
    condition = Math.random() > 0.5 ? 'Light Rain' : 'Heavy Rain';
    precipitation = Math.random() * 15 + 2;
  } else if (temperature > 25) {
    condition = 'Sunny';
  } else if (temperature > 15) {
    condition = Math.random() > 0.5 ? 'Partly Cloudy' : 'Sunny';
  } else {
    condition = 'Cloudy';
  }
  
  return {
    date,
    temperature,
    condition,
    icon: isRainy ? '🌧️' : temperature > 25 ? '☀️' : temperature > 15 ? '⛅' : '☁️',
    precipitation,
    isRainy
  };
};

/**
 * CORRECTED: Fetch real activities from TripAdvisor auto-complete API
 * Now uses the exact endpoint and mapping you specified
 */
export const getMockActivities = async (destinationId: string, cityName?: string): Promise<Activity[]> => {
  // If no city name provided, fall back to mock data
  if (!cityName) {
    console.log('⚠️ No city name provided, using fallback mock data');
    return generateFallbackMockActivities(destinationId);
  }

  try {
    console.log(`🚀 Fetching real attractions for: ${cityName} using auto-complete API`);
    
    // Use the auto-complete API as specified
    const attractions = await searchCityAttractions(cityName);
    
    if (!attractions || attractions.length === 0) {
      console.log(`❌ No attractions found for: ${cityName}, using fallback mock data`);
      return generateFallbackMockActivities(destinationId);
    }

    // CORRECTED: Map TripAdvisor data exactly as specified in requirements
    const activities: Activity[] = attractions.slice(0, 20).map((attraction, index) => {
      const categories = extractCategories(attraction);
      const isIndoor = isLikelyIndoor(attraction);
      
      return {
        // Use locationId as specified
        id: `tripadvisor-${attraction.detailsV2.locationId}`,
        
        // Use name from detailsV2.names.name as specified
        name: attraction.detailsV2.names.name,
        
        // Use longOnlyHierarchyTypeaheadV2 as description as specified
        description: attraction.detailsV2.names.longOnlyHierarchyTypeaheadV2 || `Experience ${attraction.detailsV2.names.name} in ${cityName}`,
        
        // Use urlTemplate with w=800 replacement as specified
        image: getBestImageUrl(attraction.image),
        
        // Default values as specified
        rating: 4.5,
        price: {
          amount: 25,
          currencyCode: 'USD'
        },
        duration: 120, // Default 120 minutes as specified
        
        categories: categories.length > 0 ? categories : ['Entertainment'],
        indoor: isIndoor,
        location: {
          lat: attraction.detailsV2.geocode?.latitude || 0,
          lng: attraction.detailsV2.geocode?.longitude || 0
        }
      };
    });

    console.log(`✅ Successfully fetched ${activities.length} real attractions for ${cityName}`);
    return activities;

  } catch (error) {
    console.error(`❌ Error fetching attractions for ${cityName}:`, error);
    
    if (error instanceof TripAdvisorApiError) {
      console.log('🔄 TripAdvisor API error, using fallback mock data');
    }
    
    return generateFallbackMockActivities(destinationId);
  }
};

/**
 * Fallback mock data generator (used when API fails or no city name provided)
 */
const generateFallbackMockActivities = (destinationId: string): Activity[] => {
  console.log(`🎭 Generating fallback mock activities for destination: ${destinationId}`);
  
  const categories = [
    'Museums',
    'Outdoor',
    'Food & Dining',
    'Shopping',
    'Historical Sites',
    'Adventure',
    'Nightlife',
    'Cultural',
    'Nature',
    'Entertainment'
  ];
  
  const activityNames = [
    'Local Museum', 'City Park', 'Food Market', 'Shopping Center', 'Historic Monument',
    'Adventure Tour', 'Nightlife District', 'Cultural Center', 'Nature Reserve', 'Entertainment Complex'
  ];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `fallback-${destinationId}-${String(i + 1).padStart(3, '0')}`,
    name: activityNames[i] || `Activity ${i + 1}`,
    description: `Experience the best of ${activityNames[i] || `Activity ${i + 1}`} with unique local insights`,
    image: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
    duration: 60 + (i * 30),
    rating: 4 + (Math.random() * 1),
    price: { amount: 10 + (i * 5), currencyCode: 'USD' },
    categories: [
      categories[i % categories.length],
      categories[(i + 1) % categories.length]
    ],
    indoor: i % 3 !== 0, // 2/3 indoor activities
    location: { lat: 0, lng: 0 }
  }));
};

// Get weather-appropriate activity recommendations
export const getWeatherBasedRecommendations = (
  activities: Activity[], 
  weather: WeatherData,
  preferences: string[] = []
): Activity[] => {
  console.log('🌤️ Weather-based filtering:', {
    totalActivities: activities.length,
    weather: weather.condition,
    temperature: weather.temperature,
    isRainy: weather.isRainy,
    preferences: preferences.length
  });

  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (weather.isRainy && !activity.indoor) {
      console.log(`❌ Filtering out outdoor activity "${activity.name}" due to rain`);
      return false; // Avoid outdoor activities when raining
    }
    if (weather.temperature < 5 && !activity.indoor) {
      console.log(`❌ Filtering out outdoor activity "${activity.name}" due to cold weather`);
      return false; // Avoid outdoor activities when very cold
    }
    return true;
  });

  console.log(`✅ Weather-appropriate activities: ${weatherAppropriate.length}`);

  // Apply preference filtering if preferences exist
  if (preferences.length > 0) {
    const beforePreferenceFilter = weatherAppropriate.length;
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
    console.log(`🎯 After preference filtering: ${weatherAppropriate.length} (was ${beforePreferenceFilter})`);
  }

  // Sort by rating and weather appropriateness
  const sortedActivities = weatherAppropriate.sort((a, b) => {
    // Prioritize indoor activities during bad weather
    if (weather.isRainy || weather.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Prioritize outdoor activities during good weather
    if (!weather.isRainy && weather.temperature > 20) {
      if (!a.indoor && b.indoor) return -1;
      if (a.indoor && !b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });

  console.log(`🏆 Final sorted activities: ${sortedActivities.length}`);
  
  return sortedActivities;
};