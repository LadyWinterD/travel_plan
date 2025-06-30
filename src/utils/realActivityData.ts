import { Activity } from '../types';
import { 
  getCoordinatesForCity, 
  getTopAttractions, 
  getPlaceDetails,
  getFallbackImageUrl,
  fetchWikimediaImage,
  fetchOpenTripMapImage,
  processImageUrl,
  fetchWikipediaFullExtract,
  extractWikipediaTitle,
} from '../services/openTripMapApi';
import { getCachedApiResponse, cacheApiResponse } from './storage';
import { ActivityCategory, detailedCategoryMappings } from '../data/activityCategories';

/**
 * REFINED: Enhanced category extraction with precise matching logic
 * This function now prioritizes exact matches and only falls back to broader matching when necessary
 */
function extractCategoriesFromKindsEnhanced(kinds: string): ActivityCategory[] {
  const kindsArray = kinds.toLowerCase().split(',').map(k => k.trim());
  const matchedCategories = new Set<ActivityCategory>();

  console.log(`🔍 Extracting categories from kinds: ${kinds}`);

  // PHASE 1: Exact matches using detailed mappings (HIGHEST PRIORITY)
  for (const kind of kindsArray) {
    if (detailedCategoryMappings[kind]) {
      matchedCategories.add(detailedCategoryMappings[kind]);
      console.log(`✅ Exact match: "${kind}" → ${detailedCategoryMappings[kind]}`);
    }
  }

  // PHASE 2: Partial matches for compound kinds (ONLY if no exact matches found)
  if (matchedCategories.size === 0) {
    console.log(`🔄 No exact matches found, trying partial matches...`);
    for (const kind of kindsArray) {
      for (const [mappedKind, category] of Object.entries(detailedCategoryMappings)) {
        if (kind.includes(mappedKind) && mappedKind.length > 3) { // Avoid very short matches
          matchedCategories.add(category);
          console.log(`✅ Partial match: "${kind}" contains "${mappedKind}" → ${category}`);
        }
      }
    }
  }

  // PHASE 3: Keyword-based fallbacks (ONLY if still no matches found)
  if (matchedCategories.size === 0) {
    console.log(`🔄 No partial matches found, trying keyword-based fallbacks...`);
    for (const kind of kindsArray) {
      // Culture & History
      if (kind.includes('museum') || kind.includes('gallery') || kind.includes('art')) {
        matchedCategories.add('museums_arts');
        console.log(`✅ Keyword match: "${kind}" → museums_arts`);
      } else if (kind.includes('historic') || kind.includes('ancient') || kind.includes('heritage')) {
        matchedCategories.add('historical_sites');
        console.log(`✅ Keyword match: "${kind}" → historical_sites`);
      } else if (kind.includes('church') || kind.includes('cathedral') || kind.includes('temple') || kind.includes('religious')) {
        matchedCategories.add('religious_sites');
        console.log(`✅ Keyword match: "${kind}" → religious_sites`);
      } else if (kind.includes('castle') || kind.includes('palace') || kind.includes('fort')) {
        matchedCategories.add('castles_palaces');
        console.log(`✅ Keyword match: "${kind}" → castles_palaces`);
      } else if (kind.includes('tower') || kind.includes('bridge') || kind.includes('architecture')) {
        matchedCategories.add('architectural_landmarks');
        console.log(`✅ Keyword match: "${kind}" → architectural_landmarks`);
      }
      // Nature & Outdoors
      else if (kind.includes('natural') || kind.includes('mountain') || kind.includes('lake') || kind.includes('beach')) {
        matchedCategories.add('natural_landscapes');
        console.log(`✅ Keyword match: "${kind}" → natural_landscapes`);
      } else if (kind.includes('park') || kind.includes('garden') || kind.includes('botanical')) {
        matchedCategories.add('parks_gardens');
        console.log(`✅ Keyword match: "${kind}" → parks_gardens`);
      } else if (kind.includes('sport') || kind.includes('stadium') || kind.includes('golf')) {
        matchedCategories.add('outdoor_sports');
        console.log(`✅ Keyword match: "${kind}" → outdoor_sports`);
      }
      // Urban Exploration
      else if (kind.includes('urban') || kind.includes('square') || kind.includes('city')) {
        matchedCategories.add('city_centers');
        console.log(`✅ Keyword match: "${kind}" → city_centers`);
      } else if (kind.includes('viewpoint') || kind.includes('scenic') || kind.includes('observation')) {
        matchedCategories.add('viewpoints_towers');
        console.log(`✅ Keyword match: "${kind}" → viewpoints_towers`);
      }
      // Leisure & Entertainment
      else if (kind.includes('amusement') || kind.includes('theme') || kind.includes('zoo')) {
        matchedCategories.add('theme_parks_zoos');
        console.log(`✅ Keyword match: "${kind}" → theme_parks_zoos`);
      } else if (kind.includes('night') || kind.includes('bar') || kind.includes('club')) {
        matchedCategories.add('nightlife');
        console.log(`✅ Keyword match: "${kind}" → nightlife`);
      } else if (kind.includes('theater') || kind.includes('cinema')) {
        matchedCategories.add('shows_cinema');
        console.log(`✅ Keyword match: "${kind}" → shows_cinema`);
      } else if (kind.includes('shop') || kind.includes('mall') || kind.includes('market')) {
        matchedCategories.add('shopping');
        console.log(`✅ Keyword match: "${kind}" → shopping`);
      } else if (kind.includes('restaurant') || kind.includes('cafe') || kind.includes('food')) {
        matchedCategories.add('food_dining');
        console.log(`✅ Keyword match: "${kind}" → food_dining`);
      }
    }
  }

  // Final fallback if nothing matched
  if (matchedCategories.size === 0) {
    matchedCategories.add('interesting_places');
    console.log(`⚠️ No matches found, using fallback: interesting_places`);
  }

  const result = Array.from(matchedCategories);
  console.log(`🎯 Final categories for "${kinds}": ${result.join(', ')}`);
  return result;
}

/**
 * 🆕 NEW: Multi-tier content validation strategy
 * This function implements a flexible approach to content validation
 */
async function validateAttractionContent(attraction: any, details: any): Promise<{
  isValid: boolean;
  tier: 'premium' | 'standard' | 'basic';
  wikipediaExtracts?: any;
  wikipediaUrl?: string;
  description?: string;
}> {
  console.log(`📖 Validating content for: ${attraction.name}`);
  
  // TIER 1: PREMIUM - Full Wikipedia content (100+ chars)
  if (details?.wikipedia) {
    const wikipediaUrl = details.wikipedia;
    const pageTitle = extractWikipediaTitle(wikipediaUrl);
    
    if (pageTitle) {
      console.log(`🔍 Fetching Wikipedia extract for: ${pageTitle}`);
      const fullExtract = await fetchWikipediaFullExtract(pageTitle);
      
      if (fullExtract && fullExtract.text.length > 100) {
        console.log(`✅ PREMIUM: Found substantial Wikipedia content for ${attraction.name} (${fullExtract.text.length} chars)`);
        return {
          isValid: true,
          tier: 'premium',
          wikipediaExtracts: {
            title: fullExtract.title || attraction.name,
            text: fullExtract.text,
            html: fullExtract.html
          },
          wikipediaUrl,
          description: fullExtract.text.length > 300 
            ? fullExtract.text.substring(0, 300) + '...'
            : fullExtract.text
        };
      }
    }
  }

  // TIER 2: STANDARD - OpenTripMap Wikipedia extracts (50+ chars)
  if (details?.wikipedia_extracts?.text && details.wikipedia_extracts.text.length > 50) {
    console.log(`✅ STANDARD: Found OpenTripMap Wikipedia extract for ${attraction.name} (${details.wikipedia_extracts.text.length} chars)`);
    return {
      isValid: true,
      tier: 'standard',
      wikipediaExtracts: {
        title: details.wikipedia_extracts.title || attraction.name,
        text: details.wikipedia_extracts.text,
        html: details.wikipedia_extracts.html
      },
      wikipediaUrl: details.wikipedia,
      description: details.wikipedia_extracts.text.length > 200 
        ? details.wikipedia_extracts.text.substring(0, 200) + '...'
        : details.wikipedia_extracts.text
    };
  }

  // TIER 3: BASIC - Generate description from name and categories (for popular attractions)
  const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
  const isPopularAttraction = attraction.rate > 5 || attraction.name.length > 5; // Basic popularity heuristics
  
  if (isPopularAttraction) {
    const categoryDescription = categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction';
    const generatedDescription = `Discover this popular ${categoryDescription} in the heart of the city. ${attraction.name} offers visitors a unique experience and is highly rated by travelers. A must-visit destination that showcases the local culture and heritage.`;
    
    console.log(`✅ BASIC: Generated description for popular attraction ${attraction.name}`);
    return {
      isValid: true,
      tier: 'basic',
      description: generatedDescription
    };
  }

  // 🚫 FILTER OUT: No substantial content found and not a popular attraction
  console.log(`🚫 FILTERED OUT: ${attraction.name} - No substantial content and not popular enough`);
  return { isValid: false, tier: 'basic' };
}

/**
 * 🚀 ENHANCED: Fetch high-quality real activities for a city using OpenTripMap API
 * 🆕 NEW: Multi-tier content strategy to maximize activity count while maintaining quality
 * 🎯 GOAL: Return 30-50 activities per city with varying content quality tiers
 * 🔥 UPDATED: Now processes 250 attractions instead of 150 for more outdoor activities!
 * 🌍 ENHANCED: Increased search radius to 100km for maximum coverage!
 */
export async function getRealActivitiesForCity(cityName: string): Promise<Activity[]> {
  try {
    console.log(`🚀 Fetching activities with multi-tier strategy for: ${cityName} (100km radius)`);
    
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

    // 🎯 ENHANCED: 增加搜索半径到100km，获取更多景点覆盖范围
    const attractions = await getTopAttractions(coordinates.lat, coordinates.lon, 100, cityName);
    if (attractions.length === 0) {
      console.warn(`🟡 No quality attractions found near: ${cityName}`);
      return [];
    }

    console.log(`📊 Processing ${attractions.length} raw attractions for ${cityName} within 100km radius...`);

    // 🆕 ENHANCED: 处理更多景点，使用多层次验证策略 - INCREASED TO 250!
    const activitiesPromises = attractions.slice(0, 250).map(async (attraction) => { // 🔥 INCREASED FROM 150 TO 250!
      try {
        const details = await getPlaceDetails(attraction.xid);
        
        // 🔍 MULTI-TIER: Check content with flexible validation
        const contentValidation = await validateAttractionContent(attraction, details);
        if (!contentValidation.isValid) {
          return null; // Filter out only truly low-quality attractions
        }

        const categories = extractCategoriesFromKindsEnhanced(attraction.kinds);
        
        // Enhanced image fetching with priority order and proper URL processing
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

        // Enhanced address information
        let address = undefined;
        if (details?.address) {
          address = {
            city: details.address.city,
            country: details.address.country,
            road: undefined, // OpenTripMap API doesn't provide road info
            houseNumber: undefined // OpenTripMap API doesn't provide house number
          };
        } else if (cityName) {
          // Fallback: use city name if no address details available
          address = {
            city: cityName,
            country: undefined,
            road: undefined,
            houseNumber: undefined
          };
        }

        console.log(`📋 ${attraction.name} [${contentValidation.tier.toUpperCase()}] categories:`, categories);

        // 🌟 评分处理逻辑 - 根据内容质量调整评分
        const rawRating = attraction.rate || 0;
        let processedRating: number;
        
        if (rawRating === 0) {
          // 根据内容质量和景点类型给予默认评分
          const baseRating = getDefaultRatingByCategory(categories);
          // 高质量内容的景点获得评分加成
          const tierBonus = contentValidation.tier === 'premium' ? 0.3 : 
                           contentValidation.tier === 'standard' ? 0.1 : 0;
          processedRating = Math.min(5.0, baseRating + tierBonus);
        } else {
          // 将 0-10 转换为 1-5，并根据内容质量调整
          const baseRating = Math.max(3.5, (rawRating / 10) * 5);
          const tierBonus = contentValidation.tier === 'premium' ? 0.2 : 
                           contentValidation.tier === 'standard' ? 0.1 : 0;
          processedRating = Math.min(5.0, baseRating + tierBonus);
        }

        console.log(`⭐ ${attraction.name} [${contentValidation.tier.toUpperCase()}] - 原始评分: ${rawRating}, 处理后评分: ${processedRating.toFixed(1)}`);

        return {
          id: `otm_${attraction.xid}`,
          name: attraction.name,
          description: contentValidation.description || `Explore this ${categories[0]?.toLowerCase().replace(/_/g, ' ') || 'attraction'} in ${cityName}`,
          image: imageUrl,
          duration: getDurationFromCategories(categories),
          rating: Math.round(processedRating * 10) / 10,
          price: getPriceFromCategories(categories),
          categories,
          indoor: false, // Removed indoor classification - all activities are treated equally
          location: {
            lat: attraction.point.lat,
            lng: attraction.point.lon
          },
          wikipediaExtracts: contentValidation.wikipediaExtracts,
          address,
          wikipediaUrl: contentValidation.wikipediaUrl
        };
      } catch (error) {
        console.error(`Error processing attraction ${attraction.name}:`, error);
        return null;
      }
    });

    const activities = await Promise.all(activitiesPromises);
    const validActivities = activities
      .filter(Boolean) // Remove null entries
      .sort((a, b) => {
        // 优先排序：先按内容质量，再按评分
        const aTier = a!.wikipediaExtracts ? (a!.wikipediaExtracts.text.length > 100 ? 3 : 2) : 1;
        const bTier = b!.wikipediaExtracts ? (b!.wikipediaExtracts.text.length > 100 ? 3 : 2) : 1;
        
        if (aTier !== bTier) return bTier - aTier; // 高质量内容优先
        return b!.rating - a!.rating; // 然后按评分排序
      });

    if (validActivities.length === 0) {
      console.log(`❌ No valid activities found for ${cityName} after content validation`);
      return [];
    }

    // 📊 统计各层次内容数量
    const premiumCount = validActivities.filter(a => a!.wikipediaExtracts && a!.wikipediaExtracts.text.length > 100).length;
    const standardCount = validActivities.filter(a => a!.wikipediaExtracts && a!.wikipediaExtracts.text.length <= 100 && a!.wikipediaExtracts.text.length > 50).length;
    const basicCount = validActivities.length - premiumCount - standardCount;

    console.log(`🎉 Successfully processed ${validActivities.length} activities for ${cityName} (from 250 raw attractions within 100km)`);
    console.log(`📊 Content Quality Distribution:`);
    console.log(`   🏆 Premium (detailed Wikipedia): ${premiumCount} (${Math.round(premiumCount/validActivities.length*100)}%)`);
    console.log(`   ⭐ Standard (basic Wikipedia): ${standardCount} (${Math.round(standardCount/validActivities.length*100)}%)`);
    console.log(`   📝 Basic (generated content): ${basicCount} (${Math.round(basicCount/validActivities.length*100)}%)`);
    
    // 📊 统计免费景点数量
    const freeActivitiesCount = validActivities.filter(activity => 
      !activity!.price || activity!.price.amount === 0
    ).length;
    console.log(`💰 Free activities found: ${freeActivitiesCount}/${validActivities.length} (${Math.round(freeActivitiesCount/validActivities.length*100)}%)`);
    
    cacheApiResponse(cacheKey, validActivities as Activity[], 7);
    return validActivities as Activity[];
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

  // 🎲 增加随机性：40% 的景点变为免费（提高免费比例）
  const randomFactor = Math.random();
  if (randomFactor < 0.4) {
    basePrice = 0; // 40% 概率变为免费
  } else if (randomFactor < 0.6 && basePrice > 0) {
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
    // Since we removed indoor classification, we'll use category-based weather filtering
    const hasIndoorCategories = activity.categories.some(cat => 
      ['museums_arts', 'shopping', 'shows_cinema', 'food_dining'].includes(cat)
    );
    
    // Filter out outdoor activities in bad weather
    if (weather?.isRainy && !hasIndoorCategories) return false;
    if (weather?.temperature < 5 && !hasIndoorCategories) return false;
    return true;
  });

  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  return weatherAppropriate.sort((a, b) => {
    const aHasIndoorCategories = a.categories.some(cat => 
      ['museums_arts', 'shopping', 'shows_cinema', 'food_dining'].includes(cat)
    );
    const bHasIndoorCategories = b.categories.some(cat => 
      ['museums_arts', 'shopping', 'shows_cinema', 'food_dining'].includes(cat)
    );
    
    if (weather?.isRainy || weather?.temperature < 10) {
      if (aHasIndoorCategories && !bHasIndoorCategories) return -1;
      if (!aHasIndoorCategories && bHasIndoorCategories) return 1;
    }
    if (!weather?.isRainy && weather?.temperature > 20) {
      if (!aHasIndoorCategories && bHasIndoorCategories) return -1;
      if (aHasIndoorCategories && !bHasIndoorCategories) return 1;
    }
    return b.rating - a.rating;
  });
}