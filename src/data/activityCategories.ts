export const activityCategories = [
  // 1. 自然风光 (Nature & Outdoors)
  "nature_landscapes",
  "water_features", 
  "beaches",
  "protected_areas",
  
  // 2. 文化与历史 (Culture & History)
  "historical_sites",
  "fortifications",
  "monuments_archaeology", 
  "religious_sites",
  "burial_sites",
  
  // 3. 建筑与城市 (Architecture & Urban)
  "historical_buildings",
  "modern_architecture",
  "bridges",
  "towers_lighthouses",
  "urban_features",
  
  // 4. 博物馆与艺术 (Museums & Art)
  "museums",
  "public_art",
  "gardens_parks",
  "fountains",
  
  // 5. 娱乐与休闲 (Entertainment & Leisure)
  "amusement_facilities",
  "spa_wellness",
  "sports_activities",
  "nightlife",
  
  // 6. 其他兴趣点 (Other Points of Interest)
  "viewpoints",
  "uncategorized_attractions"
] as const;

export type ActivityCategory = typeof activityCategories[number];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  // 1. 自然风光 (Nature & Outdoors)
  nature_landscapes: "自然地貌",
  water_features: "水域风光", 
  beaches: "海滩类型",
  protected_areas: "保护区与公园",
  
  // 2. 文化与历史 (Culture & History)
  historical_sites: "历史遗址",
  fortifications: "防御工事",
  monuments_archaeology: "纪念碑与考古", 
  religious_sites: "宗教场所",
  burial_sites: "墓葬地",
  
  // 3. 建筑与城市 (Architecture & Urban)
  historical_buildings: "历史建筑",
  modern_architecture: "现代建筑",
  bridges: "桥梁",
  towers_lighthouses: "塔楼与灯塔",
  urban_features: "城市特色",
  
  // 4. 博物馆与艺术 (Museums & Art)
  museums: "各类博物馆",
  public_art: "公共艺术",
  gardens_parks: "花园与公园",
  fountains: "喷泉",
  
  // 5. 娱乐与休闲 (Entertainment & Leisure)
  amusement_facilities: "游乐设施",
  spa_wellness: "水疗与浴场",
  sports_activities: "体育活动",
  nightlife: "夜生活",
  
  // 6. 其他兴趣点 (Other Points of Interest)
  viewpoints: "观景点",
  uncategorized_attractions: "未分类景点"
};

// Detailed subcategory mappings for enhanced categorization
export const detailedCategoryMappings: Record<string, ActivityCategory> = {
  // 自然地貌 (Nature Landscapes)
  "mountains": "nature_landscapes",
  "peaks": "nature_landscapes", 
  "volcanoes": "nature_landscapes",
  "caves": "nature_landscapes",
  "canyons": "nature_landscapes",
  "cliffs": "nature_landscapes",
  "rocks": "nature_landscapes",
  "geological": "nature_landscapes",
  "natural": "nature_landscapes",
  
  // 水域风光 (Water Features)
  "islands": "water_features",
  "lakes": "water_features",
  "rivers": "water_features", 
  "waterfalls": "water_features",
  "springs": "water_features",
  "coastal": "water_features",
  "marine": "water_features",
  
  // 海滩类型 (Beaches)
  "beaches": "beaches",
  "beach": "beaches",
  "sand": "beaches",
  "shore": "beaches",
  "seaside": "beaches",
  
  // 保护区与公园 (Protected Areas)
  "national_parks": "protected_areas",
  "nature_reserves": "protected_areas",
  "wildlife": "protected_areas",
  "conservation": "protected_areas",
  "botanical": "protected_areas",
  "parks": "protected_areas",
  
  // 历史遗址 (Historical Sites)
  "historic": "historical_sites",
  "historical": "historical_sites",
  "ancient": "historical_sites",
  "archaeological": "historical_sites",
  "ruins": "historical_sites",
  "heritage": "historical_sites",
  "settlement": "historical_sites",
  "village": "historical_sites",
  "battlefield": "historical_sites",
  
  // 防御工事 (Fortifications)
  "castles": "fortifications",
  "castle": "fortifications",
  "fortress": "fortifications",
  "fort": "fortifications",
  "fortification": "fortifications",
  "citadel": "fortifications",
  "kremlin": "fortifications",
  "walls": "fortifications",
  "defensive": "fortifications",
  
  // 纪念碑与考古 (Monuments & Archaeology)
  "monuments": "monuments_archaeology",
  "monument": "monuments_archaeology",
  "memorial": "monuments_archaeology",
  "memorials": "monuments_archaeology",
  "statues": "monuments_archaeology",
  "sculpture": "monuments_archaeology",
  "archaeological": "monuments_archaeology",
  "stone_circles": "monuments_archaeology",
  "megaliths": "monuments_archaeology",
  "petroglyphs": "monuments_archaeology",
  
  // 宗教场所 (Religious Sites)
  "religion": "religious_sites",
  "religious": "religious_sites",
  "churches": "religious_sites",
  "church": "religious_sites",
  "cathedrals": "religious_sites",
  "cathedral": "religious_sites",
  "temples": "religious_sites",
  "temple": "religious_sites",
  "monasteries": "religious_sites",
  "monastery": "religious_sites",
  "mosques": "religious_sites",
  "mosque": "religious_sites",
  "synagogues": "religious_sites",
  "synagogue": "religious_sites",
  "shrine": "religious_sites",
  "chapel": "religious_sites",
  
  // 墓葬地 (Burial Sites)
  "cemetery": "burial_sites",
  "cemeteries": "burial_sites",
  "graveyard": "burial_sites",
  "burial": "burial_sites",
  "tomb": "burial_sites",
  "tombs": "burial_sites",
  "mausoleum": "burial_sites",
  "crypt": "burial_sites",
  "war_memorial": "burial_sites",
  
  // 历史建筑 (Historical Buildings)
  "palaces": "historical_buildings",
  "palace": "historical_buildings",
  "manor": "historical_buildings",
  "mansion": "historical_buildings",
  "amphitheatre": "historical_buildings",
  "theatre": "historical_buildings",
  "opera": "historical_buildings",
  "arch": "historical_buildings",
  "triumphal": "historical_buildings",
  "villa": "historical_buildings",
  "estate": "historical_buildings",
  
  // 现代建筑 (Modern Architecture)
  "skyscrapers": "modern_architecture",
  "skyscraper": "modern_architecture",
  "modern": "modern_architecture",
  "contemporary": "modern_architecture",
  "architecture": "modern_architecture",
  
  // 桥梁 (Bridges)
  "bridges": "bridges",
  "bridge": "bridges",
  "suspension": "bridges",
  "drawbridge": "bridges",
  "viaduct": "bridges",
  "aqueduct": "bridges",
  
  // 塔楼与灯塔 (Towers & Lighthouses)
  "towers": "towers_lighthouses",
  "tower": "towers_lighthouses",
  "lighthouse": "towers_lighthouses",
  "lighthouses": "towers_lighthouses",
  "bell_tower": "towers_lighthouses",
  "clock_tower": "towers_lighthouses",
  "observation": "towers_lighthouses",
  "lookout": "towers_lighthouses",
  "spire": "towers_lighthouses",
  
  // 城市特色 (Urban Features)
  "squares": "urban_features",
  "square": "urban_features",
  "plaza": "urban_features",
  "streets": "urban_features",
  "street": "urban_features",
  "district": "urban_features",
  "quarter": "urban_features",
  "neighborhood": "urban_features",
  "urban": "urban_features",
  "city": "urban_features",
  
  // 各类博物馆 (Museums)
  "museums": "museums",
  "museum": "museums",
  "gallery": "museums",
  "galleries": "museums",
  "exhibition": "museums",
  "cultural": "museums",
  "heritage_center": "museums",
  "visitor_center": "museums",
  
  // 公共艺术 (Public Art)
  "art": "public_art",
  "artwork": "public_art",
  "mural": "public_art",
  "murals": "public_art",
  "installation": "public_art",
  "sculptures": "public_art",
  "public_art": "public_art",
  
  // 花园与公园 (Gardens & Parks)
  "gardens": "gardens_parks",
  "garden": "gardens_parks",
  "park": "gardens_parks",
  "botanical_garden": "gardens_parks",
  "arboretum": "gardens_parks",
  "green_space": "gardens_parks",
  
  // 喷泉 (Fountains)
  "fountains": "fountains",
  "fountain": "fountains",
  "water_feature": "fountains",
  
  // 游乐设施 (Amusement Facilities)
  "amusements": "amusement_facilities",
  "amusement": "amusement_facilities",
  "theme_park": "amusement_facilities",
  "amusement_park": "amusement_facilities",
  "water_park": "amusement_facilities",
  "zoo": "amusement_facilities",
  "zoos": "amusement_facilities",
  "aquarium": "amusement_facilities",
  "aquariums": "amusement_facilities",
  "miniature_park": "amusement_facilities",
  "roller_coaster": "amusement_facilities",
  "ferris_wheel": "amusement_facilities",
  
  // 水疗与浴场 (Spa & Wellness)
  "spa": "spa_wellness",
  "sauna": "spa_wellness",
  "hot_springs": "spa_wellness",
  "thermal": "spa_wellness",
  "wellness": "spa_wellness",
  "bath": "spa_wellness",
  "baths": "spa_wellness",
  
  // 体育活动 (Sports Activities)
  "sport": "sports_activities",
  "sports": "sports_activities",
  "stadium": "sports_activities",
  "stadiums": "sports_activities",
  "skiing": "sports_activities",
  "diving": "sports_activities",
  "surfing": "sports_activities",
  "climbing": "sports_activities",
  "golf": "sports_activities",
  "swimming": "sports_activities",
  "pool": "sports_activities",
  "recreation": "sports_activities",
  
  // 夜生活 (Nightlife)
  "nightlife": "nightlife",
  "bar": "nightlife",
  "bars": "nightlife",
  "club": "nightlife",
  "clubs": "nightlife",
  "casino": "nightlife",
  "casinos": "nightlife",
  "entertainment": "nightlife",
  
  // 观景点 (Viewpoints)
  "viewpoints": "viewpoints",
  "viewpoint": "viewpoints",
  "view_point": "viewpoints",
  "scenic": "viewpoints",
  "panoramic": "viewpoints",
  "overlook": "viewpoints",
  "vista": "viewpoints",
  
  // 未分类景点 (Uncategorized Attractions)
  "interesting_places": "uncategorized_attractions",
  "tourist_attraction": "uncategorized_attractions",
  "attraction": "uncategorized_attractions",
  "tourist_facilities": "uncategorized_attractions",
  "other": "uncategorized_attractions"
};