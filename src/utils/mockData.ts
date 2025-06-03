import { Activity, Destination, WeatherData } from '../types';

// Mock Activities by destination
const generateMockActivities = (destinationId: string): Activity[] => {
  const activitySets: Record<string, Activity[]> = {
    'dest-001': [ // Paris
      {
        id: 'act-paris-001',
        name: 'Eiffel Tower',
        description: 'Iconic iron tower offering city views',
        image: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
        duration: 180,
        rating: 4.5,
        price: { amount: 25, currencyCode: 'EUR' },
        categories: ['Historical Sites', 'Cultural', 'Entertainment'],
        indoor: false,
        location: { lat: 48.8584, lng: 2.2945 }
      },
      // ... other Paris activities
    ],
    'dest-002': [ // Rome
      {
        id: 'act-rome-001',
        name: 'Colosseum',
        description: 'Iconic ancient Roman gladiatorial arena',
        image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg',
        duration: 180,
        rating: 4.7,
        price: { amount: 16, currencyCode: 'EUR' },
        categories: ['Historical Sites', 'Cultural'],
        indoor: false,
        location: { lat: 41.8902, lng: 12.4922 }
      },
      // ... other Rome activities
    ],
  };
  
  // Generate 10 activities for any destination not in our predefined sets
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
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `act-${destinationId}-${i + 1}`,
      name: `Activity ${i + 1}`,
      description: `Description for Activity ${i + 1}`,
      image: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg',
      duration: 60 + (i * 30),
      rating: 4 + (Math.random() * 1),
      price: { amount: 10 + (i * 5), currencyCode: 'EUR' },
      categories: [
        categories[Math.floor(Math.random() * categories.length)],
        categories[Math.floor(Math.random() * categories.length)]
      ],
      indoor: i % 2 === 0,
      location: { lat: 0, lng: 0 }
    }));
  }
  
  return activitySets[destinationId] || [];
};

export const getMockActivities = (destinationId: string): Activity[] => {
  return generateMockActivities(destinationId);
};

// Mock Weather Data
export const getMockWeather = (destinationId: string, date: string): WeatherData => {
  const dateObj = new Date(date);
  const dateSeed = dateObj.getDate() + dateObj.getMonth();
  const randomVariation = (dateSeed % 10) - 5;
  
  const baseTemp = 22;
  const finalTemp = baseTemp + randomVariation;
  const isRainy = Math.random() < 0.3;
  
  return {
    date,
    temperature: finalTemp,
    condition: isRainy ? 'Rainy' : finalTemp > 25 ? 'Sunny' : 'Partly Cloudy',
    icon: isRainy ? '🌧️' : finalTemp > 25 ? '☀️' : '⛅',
    precipitation: isRainy ? Math.random() * 10 : 0,
    isRainy
  };
};