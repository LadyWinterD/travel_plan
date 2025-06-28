export const activityCategories = [
  // Culture & History
  "museums_arts",
  "historical_sites", 
  "religious_sites",
  "castles_palaces",
  "architectural_landmarks",
  
  // Nature & Outdoors
  "natural_landscapes",
  "parks_gardens", 
  "outdoor_sports",
  
  // Urban Exploration
  "city_centers",
  "viewpoints_towers",
  
  // Leisure & Entertainment
  "theme_parks_zoos",
  "nightlife",
  "shows_cinema",
  "shopping",
  
  // Unique Experiences
  "interesting_places",
  "food_dining"
] as const;

export type ActivityCategory = typeof activityCategories[number];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  // Culture & History
  museums_arts: "Museums & Arts",
  historical_sites: "Historical Sites & Monuments", 
  religious_sites: "Religious & Spiritual Sites",
  castles_palaces: "Castles & Palaces",
  architectural_landmarks: "Architectural Landmarks",
  
  // Nature & Outdoors
  natural_landscapes: "Natural Landscapes",
  parks_gardens: "Parks & Gardens", 
  outdoor_sports: "Outdoor Adventures & Sports",
  
  // Urban Exploration
  city_centers: "City Centers & Squares",
  viewpoints_towers: "Viewpoints & Landmark Towers",
  
  // Leisure & Entertainment
  theme_parks_zoos: "Theme Parks & Zoos",
  nightlife: "Nightlife",
  shows_cinema: "Shows & Cinema",
  shopping: "Shopping",
  
  // Unique Experiences
  interesting_places: "Interesting Places",
  food_dining: "Food & Dining"
};

// 🚀 ENHANCED: Comprehensive mapping from OpenTripMap kinds to our ActivityCategory types
// Based on the three-tier system: Core Recommendations, Key Recommendations, and Supplementary Categories
export const detailedCategoryMappings: Record<string, ActivityCategory> = {
  // ===== TIER 1: CORE RECOMMENDATIONS (核心推荐) =====
  
  // 🍽️ FOODS (美食) - Highest frequency need
  "foods": "food_dining",
  "food": "food_dining",
  "restaurants": "food_dining",
  "restaurant": "food_dining",
  "cafes": "food_dining",
  "cafe": "food_dining",
  "coffee": "food_dining",
  "pubs": "nightlife", // Can be nightlife or food_dining depending on context
  "pub": "nightlife",
  "bakeries": "food_dining",
  "bakery": "food_dining",
  "fast_food": "food_dining",
  "bars": "nightlife",
  "bar": "nightlife",
  
  // 🏙️ URBAN_ENVIRONMENT (城市环境) - Perfect for Christchurch
  "urban_environment": "city_centers",
  "urban": "city_centers",
  "city_center": "city_centers",
  "city": "city_centers",
  "squares": "city_centers",
  "square": "city_centers",
  "plaza": "city_centers",
  "streets": "city_centers",
  "street": "city_centers",
  "district": "city_centers",
  "quarter": "city_centers",
  "neighborhood": "city_centers",
  
  // 🌸 GARDENS_AND_PARKS (花园与公园) - "Garden City" core feature
  "gardens_and_parks": "parks_gardens",
  "gardens": "parks_gardens",
  "garden": "parks_gardens",
  "parks": "parks_gardens",
  "park": "parks_gardens",
  "botanical_gardens": "parks_gardens",
  "botanical": "parks_gardens",
  "public_garden": "parks_gardens",
  "rose_garden": "parks_gardens",
  
  // 🎨 WALL_PAINTING (墙绘/街头艺术) - Post-earthquake reconstruction highlight
  "wall_painting": "museums_arts",
  "street_art": "museums_arts",
  "murals": "museums_arts",
  "mural": "museums_arts",
  "graffiti": "museums_arts",
  "public_art": "museums_arts",
  
  // 🗿 SCULPTURES (雕塑)
  "sculptures": "museums_arts",
  "sculpture": "museums_arts",
  "statues": "museums_arts",
  "statue": "museums_arts",
  "artwork": "museums_arts",
  "art_installation": "museums_arts",
  
  // 🏛️ MUSEUMS (博物馆) - Perfect winter indoor activities
  "museums": "museums_arts",
  "museum": "museums_arts",
  "art_galleries": "museums_arts",
  "galleries": "museums_arts",
  "gallery": "museums_arts",
  "art_gallery": "museums_arts",
  "local_museums": "museums_arts",
  "local_museum": "museums_arts",
  "history_museums": "museums_arts",
  "history_museum": "museums_arts",
  "cultural_center": "museums_arts",
  "cultural_centre": "museums_arts",
  "exhibition": "museums_arts",
  "expositions": "museums_arts",
  
  // 🛍️ SHOPS (商店)
  "shops": "shopping",
  "shop": "shopping",
  "shopping": "shopping",
  "malls": "shopping",
  "mall": "shopping",
  "shopping_center": "shopping",
  "shopping_centre": "shopping",
  "marketplaces": "shopping",
  "marketplace": "shopping",
  "market": "shopping",
  "markets": "shopping",
  "supermarkets": "shopping",
  "supermarket": "shopping",
  "retail": "shopping",
  "boutique": "shopping",
  "department_store": "shopping",
  
  // ===== TIER 2: KEY RECOMMENDATIONS (重点推荐) - Outdoor & Nature =====
  
  // 🌊 NATURAL (自然景观)
  "natural": "natural_landscapes",
  "nature": "natural_landscapes",
  "beaches": "natural_landscapes",
  "beach": "natural_landscapes",
  "seaside": "natural_landscapes",
  "coastal": "natural_landscapes",
  "shore": "natural_landscapes",
  "sand": "natural_landscapes",
  "nature_reserves": "natural_landscapes",
  "nature_reserve": "natural_landscapes",
  "national_parks": "natural_landscapes",
  "national_park": "natural_landscapes",
  "waterfalls": "natural_landscapes",
  "waterfall": "natural_landscapes",
  "rivers": "natural_landscapes",
  "river": "natural_landscapes",
  "lakes": "natural_landscapes",
  "lake": "natural_landscapes",
  "marine": "natural_landscapes",
  "islands": "natural_landscapes",
  "island": "natural_landscapes",
  "forests": "natural_landscapes",
  "forest": "natural_landscapes",
  "wilderness": "natural_landscapes",
  "conservation": "natural_landscapes",
  "wildlife": "natural_landscapes",
  "scenic": "natural_landscapes",
  
  // ⛰️ GEOLOGICAL_FORMATIONS (地质构造)
  "geological_formations": "natural_landscapes",
  "geological": "natural_landscapes",
  "mountain_peaks": "natural_landscapes",
  "mountains": "natural_landscapes",
  "peaks": "natural_landscapes",
  "rock_formations": "natural_landscapes",
  "rocks": "natural_landscapes",
  "cliffs": "natural_landscapes",
  "caves": "natural_landscapes",
  "cave": "natural_landscapes",
  "canyons": "natural_landscapes",
  "canyon": "natural_landscapes",
  "volcanoes": "natural_landscapes",
  "volcano": "natural_landscapes",
  "springs": "natural_landscapes",
  "hot_springs": "natural_landscapes",
  
  // ⛷️ SPORT (体育活动)
  "sport": "outdoor_sports",
  "sports": "outdoor_sports",
  "winter_sports": "outdoor_sports", // Winter core activity!
  "skiing": "outdoor_sports", // Mt Hutt ski field essential
  "ski_resorts": "outdoor_sports",
  "ski_resort": "outdoor_sports",
  "climbing": "outdoor_sports",
  "rock_climbing": "outdoor_sports",
  "hiking": "outdoor_sports",
  "walking": "outdoor_sports",
  "cycling": "outdoor_sports",
  "biking": "outdoor_sports",
  "recreation": "outdoor_sports",
  "sports_centres": "outdoor_sports",
  "sports_center": "outdoor_sports",
  "stadium": "outdoor_sports",
  "stadiums": "outdoor_sports",
  "golf_courses": "outdoor_sports",
  "golf": "outdoor_sports",
  "swimming": "outdoor_sports",
  "pool": "outdoor_sports",
  "swimming_pools": "outdoor_sports",
  "diving": "outdoor_sports",
  "surfing": "outdoor_sports",
  
  // 👁️ VIEW_POINTS (观景点) - Very practical, especially Port Hills
  "view_points": "viewpoints_towers",
  "viewpoints": "viewpoints_towers",
  "viewpoint": "viewpoints_towers",
  "view_point": "viewpoints_towers",
  "observation_decks": "viewpoints_towers",
  "observation": "viewpoints_towers",
  "lookouts": "viewpoints_towers",
  "lookout": "viewpoints_towers",
  "panoramic": "viewpoints_towers",
  "overlook": "viewpoints_towers",
  "vista": "viewpoints_towers",
  
  // ===== TIER 3: SUPPLEMENTARY & SPECIFIC INTERESTS (补充与特定兴趣) =====
  
  // 🏛️ HISTORIC (历史遗迹)
  "historic": "historical_sites",
  "historical": "historical_sites",
  "ancient": "historical_sites",
  "heritage": "historical_sites",
  "historic_districts": "historical_sites",
  "historic_district": "historical_sites",
  "archaeological_sites": "historical_sites",
  "archaeological": "historical_sites",
  "ruins": "historical_sites",
  "monuments_and_memorials": "historical_sites",
  "monuments": "historical_sites",
  "monument": "historical_sites",
  "memorial": "historical_sites",
  "memorials": "historical_sites",
  "war_memorials": "historical_sites", // Bridge of Remembrance
  "war_memorial": "historical_sites",
  "burial_places": "historical_sites",
  "cemetery": "historical_sites",
  "cemeteries": "historical_sites",
  "graveyard": "historical_sites",
  "burial": "historical_sites",
  "tomb": "historical_sites",
  "tombs": "historical_sites",
  "mausoleum": "historical_sites",
  "settlement": "historical_sites",
  "village": "historical_sites",
  "battlefield": "historical_sites",
  
  // ⛪ RELIGION (宗教建筑)
  "religion": "religious_sites",
  "religious": "religious_sites",
  "cathedrals": "religious_sites", // Cardboard Cathedral
  "cathedral": "religious_sites",
  "churches": "religious_sites",
  "church": "religious_sites",
  "temples": "religious_sites",
  "temple": "religious_sites",
  "mosques": "religious_sites",
  "mosque": "religious_sites",
  "synagogues": "religious_sites",
  "synagogue": "religious_sites",
  "monasteries": "religious_sites",
  "monastery": "religious_sites",
  "shrine": "religious_sites",
  "chapel": "religious_sites",
  "spiritual": "religious_sites",
  
  // 🏗️ ARCHITECTURE (建筑)
  "architecture": "architectural_landmarks",
  "historic_architecture": "architectural_landmarks",
  "modern_architecture": "architectural_landmarks",
  "contemporary": "architectural_landmarks",
  "modern": "architectural_landmarks",
  "towers": "architectural_landmarks",
  "tower": "architectural_landmarks",
  "bell_tower": "architectural_landmarks",
  "clock_tower": "architectural_landmarks",
  "spire": "architectural_landmarks",
  "bridges": "architectural_landmarks",
  "bridge": "architectural_landmarks",
  "suspension": "architectural_landmarks",
  "drawbridge": "architectural_landmarks",
  "viaduct": "architectural_landmarks",
  "aqueduct": "architectural_landmarks",
  "lighthouse": "architectural_landmarks",
  "lighthouses": "architectural_landmarks",
  "skyscrapers": "architectural_landmarks",
  "skyscraper": "architectural_landmarks",
  "amphitheatre": "architectural_landmarks",
  "arch": "architectural_landmarks",
  "triumphal": "architectural_landmarks",
  
  // 🎭 THEATRES_AND_ENTERTAINMENTS (剧院与娱乐)
  "theatres_and_entertainments": "shows_cinema",
  "theaters": "shows_cinema",
  "theater": "shows_cinema",
  "theatres": "shows_cinema",
  "theatre": "shows_cinema",
  "cinemas": "shows_cinema",
  "cinema": "shows_cinema",
  "movie_theater": "shows_cinema",
  "music_venues": "shows_cinema", // Can also be nightlife
  "music_venue": "shows_cinema",
  "concert_hall": "shows_cinema",
  "opera": "shows_cinema",
  "opera_house": "shows_cinema",
  "performance": "shows_cinema",
  "entertainment": "shows_cinema",
  
  // 🎢 AMUSEMENTS (娱乐)
  "amusements": "theme_parks_zoos",
  "amusement": "theme_parks_zoos",
  "theme_parks": "theme_parks_zoos",
  "theme_park": "theme_parks_zoos",
  "amusement_park": "theme_parks_zoos",
  "amusement_parks": "theme_parks_zoos",
  "water_park": "theme_parks_zoos",
  "miniature_park": "theme_parks_zoos",
  "roller_coaster": "theme_parks_zoos",
  "ferris_wheel": "theme_parks_zoos",
  "zoos": "theme_parks_zoos",
  "zoo": "theme_parks_zoos",
  "aquariums": "theme_parks_zoos",
  "aquarium": "theme_parks_zoos",
  "safari": "theme_parks_zoos",
  "wildlife_park": "theme_parks_zoos",
  
  // 🛁 BATHS_AND_SAUNAS (浴场与桑拿) - Winter specialty
  "baths_and_saunas": "interesting_places", // Could be wellness category if expanded
  "baths": "interesting_places",
  "sauna": "interesting_places",
  "saunas": "interesting_places",
  "spa": "interesting_places",
  "thermal_baths": "interesting_places",
  "wellness": "interesting_places",
  
  // 🏰 CASTLES & PALACES (existing mappings maintained)
  "castles": "castles_palaces",
  "castle": "castles_palaces",
  "palaces": "castles_palaces",
  "palace": "castles_palaces",
  "fortifications": "castles_palaces",
  "fortress": "castles_palaces",
  "fort": "castles_palaces",
  "fortification": "castles_palaces",
  "citadel": "castles_palaces",
  "kremlin": "castles_palaces",
  "walls": "castles_palaces",
  "defensive": "castles_palaces",
  "manor": "castles_palaces",
  "mansion": "castles_palaces",
  "villa": "castles_palaces",
  "estate": "castles_palaces",
  
  // 🌃 NIGHTLIFE (existing mappings maintained)
  "nightlife": "nightlife",
  "nightclubs": "nightlife",
  "clubs": "nightlife",
  "club": "nightlife",
  "casinos": "nightlife",
  "casino": "nightlife",
  "night": "nightlife",
  
  // 🎯 INTERESTING_PLACES (catch-all and unique experiences)
  "interesting_places": "interesting_places",
  "tourist_facilities": "interesting_places",
  "tourist_attraction": "interesting_places",
  "attraction": "interesting_places",
  "tourist": "interesting_places",
  "visitor_center": "interesting_places",
  "heritage_center": "interesting_places",
  "cultural": "interesting_places",
  "other": "interesting_places",
  "unspecified": "interesting_places",
  "unique": "interesting_places",
  "specialty": "interesting_places",
  
  // 🏞️ Additional nature and outdoor mappings
  "arboretum": "parks_gardens",
  "green_space": "parks_gardens",
  "fountains": "parks_gardens",
  "fountain": "parks_gardens",
  "water_feature": "parks_gardens"
};