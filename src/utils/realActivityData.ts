import { Activity } from '../types';
import { 
  getCoordinatesForCity, 
  getTopAttractions, 
  getPlaceDetails,
  extractCategoriesFromKinds,
  isLikelyIndoorFromKinds,
  getFallbackImageUrl,
  fetchWikimediaImage,
  fetchOpenTripMapImage,
  processImageUrl,
} from '../services/openTripMapApi';
import { getCachedApiResponse, cacheApiResponse } from './storage';
import { ActivityCategory, detailedCategoryMappings } from '../data/activityCategories';

/**
 * Enhanced category extraction with new English category system
 * FIXED: Removed conditional checks to allow all matching passes to run
 */
function extractCategoriesFromKindsEnhanced(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.toLowerCase().split(',').map(k => k.trim());
  const matchedCategories = new Set<ActivityCategory>();

  // First pass: exact matches using detailed mappings
  for (const kind of kindsArray) {
    if (detailedCategoryMappings[kind]) {
      matchedCategories.add(detailedCategoryMappings[kind]);
    }
  }

  // Second pass: partial matches for compound kinds (ALWAYS RUN)
  for (const kind of kindsArray) {
    for (const [mappedKind, category] of Object.entries(detailedCategoryMappings)) {
      if (kind.includes(mappedKind) || mappedKind.includes(kind)) {
        matchedCategories.add(category);
      }
    }
  }

  // Third pass: keyword-based fallbacks with English categories (ALWAYS RUN)
  for (const kind of kindsArray) {
    // Culture & History
    if (kind.includes('museum') || kind.includes('gallery') || kind.includes('art') || kind.includes('cultural')) {
      matchedCategories.add('museums_arts');
    }
    if (kind.includes('historic') || kind.includes('ancient') || kind.includes('archaeological') || kind.includes('heritage')) {
      matchedCategories.add('historical_sites');
    }
    if (kind.includes('church') || kind.includes('cathedral') || kind.includes('temple') || kind.includes('mosque') || kind.includes('religious')) {
      matchedCategories.add('religious_sites');
    }
    if (kind.includes('castle') || kind.includes('palace') || kind.includes('fort') || kind.includes('fortress')) {
      matchedCategories.add('castles_palaces');
    }
    if (kind.includes('tower') || kind.includes('bridge') || kind.includes('architecture') || kind.includes('building')) {
      matchedCategories.add('architectural_landmarks');
    }
    
    // Nature & Outdoors
    if (kind.includes('natural') || kind.includes('mountain') || kind.includes('lake') || kind.includes('beach') || kind.includes('cave')) {
      matchedCategories.add('natural_landscapes');
    }
    if (kind.includes('park') || kind.includes('garden') || kind.includes('botanical') || kind.includes('fountain')) {
      matchedCategories.add('parks_gardens');
    }
    if (kind.includes('sport') || kind.includes('skiing') || kind.includes('diving') || kind.includes('golf') || kind.includes('stadium')) {
      matchedCategories.add('outdoor_sports');
    }
    
    // Urban Exploration
    if (kind.includes('urban') || kind.includes('square') || kind.includes('street') || kind.includes('city')) {
      matchedCategories.add('city_centers');
    }
    if (kind.includes('viewpoint') || kind.includes('scenic') || kind.includes('observation') || kind.includes('overlook')) {
      matchedCategories.add('viewpoints_towers');
    }
    
    // Leisure & Entertainment
    if (kind.includes('amusement') || kind.includes('theme') || kind.includes('zoo') || kind.includes('aquarium')) {
      matchedCategories.add('theme_parks_zoos');
    }
    if (kind.includes('bar') || kind.includes('club') || kind.includes('casino') || kind.includes('nightlife')) {
      matchedCategories.add('nightlife');
    }
    if (kind.includes('theater') || kind.includes('theatre') || kind.includes('cinema')) {
      matchedCategories.add('shows_cinema');
    }
    if (kind.includes('shopping') || kind.includes('mall') || kind.includes('market')) {
      matchedCategories.add('shopping');
    }
    if (kind.includes('restaurant') || kind.includes('cafe') || kind.includes('food') || kind.includes('dining')) {
      matchedCategories.add('food_dining');
    }
  }

  // Final fallback
  if (matchedCategories.size === 0) {
    matchedCategories.add('interesting_places');
  }

  return Array.from(matchedCategories);
}

/**
 * 🚀 ENHANCED: Fetch 50 real activities for a city using OpenTripMap API
 * 增加了更多活动选择，提高免费景点的数量和质量
 */
export async function getRealActivitiesForCity(cityName: string): Promise<Activity[]> {
  try {
    console.log(`🚀 Fetching 50 real activities for: ${cityName}`);
    
    const cacheKey = `activities_${cityName.toLowerCase().replace(/\s+/g, '_')}`;
    const cachedActivities = getCachedApiResponse(cacheKey);
    if (cachedActivities) {
      console.log(`💾 Using cached activities for: ${cityName}`);
      return cachedActivities;
    }

    const coordinates = await getCoordinatesForCity(cityName);
    if (!coordinates) {
      console.warn(`🟡 Could not find coordinates for city: ${cityName}`);
      return [];
    }

    // 🎯 ENHANCED: 增加搜索半径和数量，获取更多景点
    const attractions = await getTopAttractions(coordinates.lat, coordinates.lon, 50, cityName); // 增加半径到50km
    if (attractions.length === 0) {
      console.warn(`🟡 No quality attractions found near: ${cityName}`);
      return [];
    }

    // 🎯 ENHANCED: 处理更多景点，确保有足够的免费选项
    const activitiesPromises = attractions.slice(0, 50).map(async (attraction) => { // 处理前50个
      try {
        const details = await getPlaceDetails(attraction.xid);
        const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
        const isIndoor = isLikelyIndoorFromKinds(attraction.kinds, attraction.name);
        
        // Enhanced image fetching with priority order and proper URL processing:
        // 1. Wikimedia Commons (from wikidata ID) - processed for direct URLs
        // 2. OpenTripMap preview image - processed for direct URLs
        // 3. OpenTripMap image field - processed for direct URLs
        // 4. Fallback Pexels image
        let imageUrl = getFallbackImageUrl(categories); // Default fallback
        
        // Priority 1: Try Wikimedia Commons if wikidata ID exists
        if (attraction.wikidata) {
          console.log(`🔍 Trying Wikimedia for ${attraction.name} (Wikidata: ${attraction.wikidata})`);
          const wikimediaImageUrl = await fetchWikimediaImage(attraction.wikidata);
          if (wikimediaImageUrl) {
            const processedUrl = await processImageUrl(wikimediaImageUrl);
            if (processedUrl) {
              imageUrl = processedUrl;
              console.log(`✅ Using processed Wikimedia image for ${attraction.name}: ${imageUrl}`);
            }
          }
        }
        
        // Priority 2: Try OpenTripMap preview if no Wikimedia image found
        if (imageUrl === getFallbackImageUrl(categories) && details?.preview?.source) {
          console.log(`🔍 Trying OpenTripMap preview for ${attraction.name}: ${details.preview.source}`);
          const processedUrl = await processImageUrl(details.preview.source);
          if (processedUrl) {
            imageUrl = processedUrl;
            console.log(`✅ Using processed OpenTripMap preview for ${attraction.name}: ${imageUrl}`);
          }
        }
        
        // Priority 3: Try OpenTripMap image field
        if (imageUrl === getFallbackImageUrl(categories) && details?.image) {
          console.log(`🔍 Trying OpenTripMap image field for ${attraction.name} (${details.image})`);
          const openTripMapImageUrl = await fetchOpenTripMapImage(details.image);
          if (openTripMapImageUrl) {
            const processedUrl = await processImageUrl(openTripMapImageUrl);
            if (processedUrl) {
              imageUrl = processedUrl;
              console.log(`✅ Using processed OpenTripMap image field for ${attraction.name}: ${imageUrl}`);
            }
          }
        }
        
        // If still using fallback, log it
        if (imageUrl === getFallbackImageUrl(categories)) {
          console.log(`⚠️ Using fallback image for ${attraction.name}`);
        }

        const description = details?.wikipedia_extracts?.text 
          ? details.wikipedia_extracts.text.substring(0, 120) + '...'
          : `Explore this ${categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction'} in ${cityName}`;

        console.log(`📋 ${attraction.name} categories:`, categories);

        // 🌟 评分处理逻辑 - 这里是评分的来源！
        const rawRating = attraction.rate || 0; // OpenTripMap 原始评分 (0-10 scale)
        
        // 将 OpenTripMap 的 0-10 评分转换为 1-5 星级评分
        let processedRating: number;
        if (rawRating === 0) {
          // 如果没有评分，根据景点类型给予合理的默认评分
          processedRating = getDefaultRatingByCategory(categories);
        } else {
          // 将 0-10 转换为 1-5，并确保最低 3.5 分（保证用户体验）
          processedRating = Math.max(3.5, (rawRating / 10) * 5);
        }

        console.log(`⭐ ${attraction.name} - 原始评分: ${rawRating}, 处理后评分: ${processedRating.toFixed(1)}`);

        return {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description,
          image: imageUrl,
          duration: getDurationFromCategories(categories),
          rating: Math.round(processedRating * 10) / 10, // 保留一位小数
          price: getPriceFromCategories(categories),
          categories,
          indoor: isIndoor,
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          }
        };
      } catch (error) {
        console.error(`Error processing attraction ${attraction.name}:`, error);
        const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
        return {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description: `Explore this ${categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction'} in ${cityName}`,
          image: getFallbackImageUrl(categories),
          duration: getDurationFromCategories(categories),
          rating: getDefaultRatingByCategory(categories),
          price: getPriceFromCategories(categories),
          categories,
          indoor: isLikelyIndoorFromKinds(attraction.kinds, attraction.name),
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          }
        };
      }
    });

    const activities = await Promise.all(activitiesPromises);
    const validActivities = activities
      .filter(Boolean)
      .sort((a, b) => b.rating - a.rating);

    if (validActivities.length === 0) return [];

    console.log(`🎉 Successfully processed ${validActivities.length} activities for ${cityName}`);
    
    // 📊 统计免费景点数量
    const freeActivitiesCount = validActivities.filter(activity => 
      !activity.price || activity.price.amount === 0
    ).length;
    console.log(`💰 Free activities found: ${freeActivitiesCount}/${validActivities.length} (${Math.round(freeActivitiesCount/validActivities.length*100)}%)`);
    
    cacheApiResponse(cacheKey, validActivities, 7);
    return validActivities;
  } catch (error) {
    console.error(`❌ Error fetching real activities for ${cityName}:`, error);
    return [];
  }
}

/**
 * 💰 根据活动类型获取默认评分
 * 这个函数为没有评分的景点提供合理的默认评分
 */
function getDefaultRatingByCategory(categories: ActivityCategory[]): number {
  const categoryRatings: Record<ActivityCategory, number> = {
    // 文化历史类 - 通常评分较高
    museums_arts: 4.2,
    historical_sites: 4.3, 
    religious_sites: 4.1,
    castles_palaces: 4.4,
    architectural_landmarks: 4.0,
    
    // 自然户外类 - 评分很高
    natural_landscapes: 4.5,
    parks_gardens: 4.2, 
    outdoor_sports: 4.0,
    
    // 城市探索类 - 中等评分
    city_centers: 3.8,
    viewpoints_towers: 4.1,
    
    // 娱乐休闲类 - 评分差异较大
    theme_parks_zoos: 4.3,
    nightlife: 3.7,
    shows_cinema: 3.9,
    shopping: 3.6,
    
    // 特色体验类
    interesting_places: 3.8,
    food_dining: 4.0
  };

  // 取最高评分的类别作为默认评分
  let maxRating = 3.8; // 基础默认评分
  for (const category of categories) {
    if (categoryRatings[category] && categoryRatings[category] > maxRating) {
      maxRating = categoryRatings[category];
    }
  }

  return maxRating;
}

/**
 * Get estimated duration based on English activity categories
 */
function getDurationFromCategories(categories: ActivityCategory[]): number {
  const durationMap: Record<ActivityCategory, number> = {
    // Culture & History - moderate to long visits
    museums_arts: 150,
    historical_sites: 90,
    religious_sites: 60,
    castles_palaces: 120,
    architectural_landmarks: 60,
    
    // Nature & Outdoors - typically longer outdoor experiences
    natural_landscapes: 180,
    parks_gardens: 120,
    outdoor_sports: 120,
    
    // Urban Exploration - quick to moderate visits
    city_centers: 90,
    viewpoints_towers: 45,
    
    // Leisure & Entertainment - varies widely
    theme_parks_zoos: 240,
    nightlife: 180,
    shows_cinema: 120,
    shopping: 120,
    
    // Unique Experiences
    interesting_places: 90,
    food_dining: 90
  };

  let maxDuration = 90; // Default duration
  for (const category of categories) {
    if (durationMap[category] && durationMap[category] > maxDuration) {
      maxDuration = durationMap[category];
    }
  }

  return maxDuration;
}

/**
 * 💰 根据活动类型获取估算价格 - ENHANCED 提高免费景点比例
 * 这个函数根据景点类型提供合理的价格估算，增加了更多免费选项
 */
function getPriceFromCategories(categories: ActivityCategory[]): { amount: number; currencyCode: string } {
  const priceMap: Record<ActivityCategory, number> = {
    // 文化历史类 - 增加免费选项
    museums_arts: 15,        // 降低博物馆价格，很多有免费时段
    historical_sites: 0,     // 大多数历史遗迹免费
    religious_sites: 0,      // 宗教场所通常免费
    castles_palaces: 12,     // 降低城堡宫殿价格
    architectural_landmarks: 0, // 建筑地标大多免费
    
    // 自然户外类 - 大多免费
    natural_landscapes: 0,   // 自然景观通常免费
    parks_gardens: 0,        // 大多数公园花园免费
    outdoor_sports: 15,      // 降低户外运动价格
    
    // 城市探索类 - 全部免费
    city_centers: 0,         // 市中心广场免费
    viewpoints_towers: 5,    // 降低观景台价格，很多免费
    
    // 娱乐休闲类 - 部分免费
    theme_parks_zoos: 25,    // 降低主题公园价格
    nightlife: 20,           // 降低夜生活消费
    shows_cinema: 12,        // 降低演出票价
    shopping: 0,             // 购物场所免费进入
    
    // 特色体验类 - 增加免费选项
    interesting_places: 0,   // 大多数特色景点免费
    food_dining: 20          // 降低餐饮消费
  };

  // 🎯 ENHANCED: 随机化价格，增加免费景点的概率
  let basePrice = 10; // 默认价格
  for (const category of categories) {
    if (priceMap[category] !== undefined && priceMap[category] > basePrice) {
      basePrice = priceMap[category];
    }
  }

  // 🎲 增加随机性：30% 的景点变为免费
  const randomFactor = Math.random();
  if (randomFactor < 0.3) {
    basePrice = 0; // 30% 概率变为免费
  } else if (randomFactor < 0.5 && basePrice > 0) {
    basePrice = Math.max(0, basePrice - 5); // 20% 概率降价
  }

  console.log(`💰 价格计算 - 类别: ${categories.join(', ')}, 估算价格: $${basePrice}`);

  return {
    amount: basePrice,
    currencyCode: 'USD'
  };
}

/**
 * Get weather-appropriate activity recommendations using real data
 */
export function getWeatherBasedRecommendations(
  activities: Activity[],
  weather: any,
  preferences: ActivityCategory[] = []
): Activity[] {
  let weatherAppropriate = activities.filter(activity => {
    if (weather?.isRainy && !activity.indoor) return false;
    if (weather?.temperature < 5 && !activity.indoor) return false;
    return true;
  });

  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  return weatherAppropriate.sort((a, b) => {
    if (weather?.isRainy || weather?.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    if (!weather?.isRainy && weather?.temperature > 20) {
      if (!a.indoor && b.indoor) return -1;
      if (a.indoor && !b.indoor) return 1;
    }
    return b.rating - a.rating;
  });
}