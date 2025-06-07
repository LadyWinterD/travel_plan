import { Activity, Destination, WeatherData } from '../types';

// Mock Activities by destination with enhanced data
const generateMockActivities = (destinationId: string): Activity[] => {
  const activitySets: Record<string, Activity[]> = {
    'dest-001': [ // Paris
      {
        id: 'act-paris-001',
        name: 'Eiffel Tower',
        description: 'Iconic iron tower offering panoramic views of Paris',
        image: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
        duration: 180,
        rating: 4.5,
        price: { amount: 25, currencyCode: 'EUR' },
        categories: ['Historical Sites', 'Cultural', 'Entertainment'],
        indoor: false,
        location: { lat: 48.8584, lng: 2.2945 }
      },
      {
        id: 'act-paris-002',
        name: 'Louvre Museum',
        description: 'World-famous art museum housing the Mona Lisa and countless masterpieces',
        image: 'https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg',
        duration: 240,
        rating: 4.7,
        price: { amount: 17, currencyCode: 'EUR' },
        categories: ['Museums', 'Cultural', 'Historical Sites'],
        indoor: true,
        location: { lat: 48.8606, lng: 2.3376 }
      },
      {
        id: 'act-paris-003',
        name: 'Seine River Cruise',
        description: 'Scenic boat tour along the Seine River with beautiful city views',
        image: 'https://images.pexels.com/photos/1530259/pexels-photo-1530259.jpeg',
        duration: 90,
        rating: 4.3,
        price: { amount: 15, currencyCode: 'EUR' },
        categories: ['Outdoor', 'Entertainment', 'Nature'],
        indoor: false,
        location: { lat: 48.8566, lng: 2.3522 }
      },
      {
        id: 'act-paris-004',
        name: 'Champs-Élysées Shopping',
        description: 'Shop along the world-famous avenue with luxury boutiques and cafes',
        image: 'https://images.pexels.com/photos/1461974/pexels-photo-1461974.jpeg',
        duration: 120,
        rating: 4.2,
        price: { amount: 0, currencyCode: 'EUR' },
        categories: ['Shopping', 'Cultural'],
        indoor: true,
        location: { lat: 48.8698, lng: 2.3076 }
      },
      {
        id: 'act-paris-005',
        name: 'Montmartre District',
        description: 'Historic artist quarter with stunning views and charming streets',
        image: 'https://images.pexels.com/photos/1461974/pexels-photo-1461974.jpeg',
        duration: 150,
        rating: 4.4,
        price: { amount: 0, currencyCode: 'EUR' },
        categories: ['Cultural', 'Outdoor', 'Historical Sites'],
        indoor: false,
        location: { lat: 48.8867, lng: 2.3431 }
      },
      {
        id: 'act-paris-006',
        name: 'French Cuisine Experience',
        description: 'Authentic French dining experience with wine tasting',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        duration: 120,
        rating: 4.6,
        price: { amount: 45, currencyCode: 'EUR' },
        categories: ['Food & Dining', 'Cultural'],
        indoor: true,
        location: { lat: 48.8566, lng: 2.3522 }
      },
      {
        id: 'act-paris-007',
        name: 'Palace of Versailles',
        description: 'Magnificent royal palace with stunning gardens and opulent rooms',
        image: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg',
        duration: 300,
        rating: 4.8,
        price: { amount: 20, currencyCode: 'EUR' },
        categories: ['Historical Sites', 'Cultural', 'Outdoor'],
        indoor: false,
        location: { lat: 48.8049, lng: 2.1204 }
      },
      {
        id: 'act-paris-008',
        name: 'Notre-Dame Cathedral',
        description: 'Gothic architectural masterpiece and historic cathedral',
        image: 'https://images.pexels.com/photos/1850619/pexels-photo-1850619.jpeg',
        duration: 90,
        rating: 4.5,
        price: { amount: 0, currencyCode: 'EUR' },
        categories: ['Historical Sites', 'Cultural'],
        indoor: true,
        location: { lat: 48.8530, lng: 2.3499 }
      }
    ]
  };
  
  // Generate activities for any destination not in our predefined sets
  if (!activitySets[destinationId]) {
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
      id: `act-${destinationId}-${String(i + 1).padStart(3, '0')}`,
      name: activityNames[i] || `Activity ${i + 1}`,
      description: `Experience the best of ${activityNames[i] || `Activity ${i + 1}`} with unique local insights`,
      image: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
      duration: 60 + (i * 30),
      rating: 4 + (Math.random() * 1),
      price: { amount: 10 + (i * 5), currencyCode: 'EUR' },
      categories: [
        categories[i % categories.length],
        categories[(i + 1) % categories.length]
      ],
      indoor: i % 3 !== 0, // 2/3 indoor activities
      location: { lat: 0, lng: 0 }
    }));
  }
  
  return activitySets[destinationId] || [];
};

export const getMockActivities = (destinationId: string): Activity[] => {
  return generateMockActivities(destinationId);
};

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