import { Activity, Destination, WeatherData } from '../types';

// Mock Activities by destination with enhanced data
const generateMockActivities = (destinationId: string): Activity[] => {
  const activitySets: Record<string, Activity[]> = {
    'dest-001': [ // Paris
      {
        id: 'act-paris-001',
        name: '埃菲尔铁塔',
        description: '标志性的铁塔，可俯瞰整个巴黎城市美景',
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
        name: '卢浮宫博物馆',
        description: '世界著名的艺术博物馆，收藏蒙娜丽莎等珍品',
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
        name: '塞纳河游船',
        description: '乘船游览塞纳河，欣赏巴黎两岸美景',
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
        name: '香榭丽舍大街购物',
        description: '在世界著名的购物街享受购物乐趣',
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
        name: '蒙马特高地',
        description: '艺术家聚集地，可欣赏巴黎全景',
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
        name: '法式料理体验',
        description: '品尝正宗法式美食和葡萄酒',
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
        name: '凡尔赛宫',
        description: '法国皇室宫殿，华丽的建筑和花园',
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
        name: '巴黎圣母院',
        description: '哥特式建筑杰作，历史悠久的大教堂',
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
      '当地博物馆', '城市公园', '美食街', '购物中心', '历史古迹',
      '冒险活动', '夜生活区', '文化中心', '自然景观', '娱乐场所'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `act-${destinationId}-${String(i + 1).padStart(3, '0')}`,
      name: activityNames[i] || `活动 ${i + 1}`,
      description: `${activityNames[i] || `活动 ${i + 1}`}的详细描述，提供独特的体验`,
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
  
  const conditions = ['晴朗', '多云', '阴天', '小雨', '中雨'];
  let condition: string;
  let precipitation = 0;
  
  if (isRainy) {
    condition = Math.random() > 0.5 ? '小雨' : '中雨';
    precipitation = Math.random() * 15 + 2;
  } else if (temperature > 25) {
    condition = '晴朗';
  } else if (temperature > 15) {
    condition = Math.random() > 0.5 ? '多云' : '晴朗';
  } else {
    condition = '阴天';
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
  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (weather.isRainy && !activity.indoor) {
      return false; // Avoid outdoor activities when raining
    }
    if (weather.temperature < 5 && !activity.indoor) {
      return false; // Avoid outdoor activities when very cold
    }
    return true;
  });

  // Apply preference filtering if preferences exist
  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  // Sort by rating and weather appropriateness
  return weatherAppropriate.sort((a, b) => {
    // Prioritize indoor activities during bad weather
    if (weather.isRainy || weather.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });
};