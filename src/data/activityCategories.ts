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

// Enhanced mapping from OpenTripMap kinds to our ActivityCategory types
export const detailedCategoryMappings: Record<string, ActivityCategory> = {
  // Museums & Arts
  "museums": "museums_arts",
  "museum": "museums_arts",
  "art_galleries": "museums_arts",
  "galleries": "museums_arts",
  "gallery": "museums_arts",
  "expositions": "museums_arts",
  "exhibition": "museums_arts",
  "cultural": "museums_arts",
  "heritage_center": "museums_arts",
  "visitor_center": "museums_arts",
  "art": "museums_arts",
  "artwork": "museums_arts",
  
  // Historical Sites & Monuments
  "historic": "historical_sites",
  "historical": "historical_sites",
  "ancient": "historical_sites",
  "archaeological_sites": "historical_sites",
  "archaeological": "historical_sites",
  "ruins": "historical_sites",
  "monuments_and_memorials": "historical_sites",
  "monuments": "historical_sites",
  "monument": "historical_sites",
  "memorial": "historical_sites",
  "memorials": "historical_sites",
  "statues": "historical_sites",
  "statue": "historical_sites",
  "sculpture": "historical_sites",
  "sculptures": "historical_sites",
  "heritage": "historical_sites",
  "settlement": "historical_sites",
  "village": "historical_sites",
  "battlefield": "historical_sites",
  
  // Religious & Spiritual Sites
  "religion": "religious_sites",
  "religious": "religious_sites",
  "churches": "religious_sites",
  "church": "religious_sites",
  "cathedrals": "religious_sites",
  "cathedral": "religious_sites",
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
  "cemetery": "religious_sites",
  "cemeteries": "religious_sites",
  "graveyard": "religious_sites",
  "burial": "religious_sites",
  "tomb": "religious_sites",
  "tombs": "religious_sites",
  "mausoleum": "religious_sites",
  
  // Castles & Palaces
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
  
  // Architectural Landmarks
  "architecture": "architectural_landmarks",
  "historic_architecture": "architectural_landmarks",
  "towers": "architectural_landmarks",
  "tower": "architectural_landmarks",
  "bridges": "architectural_landmarks",
  "bridge": "architectural_landmarks",
  "suspension": "architectural_landmarks",
  "drawbridge": "architectural_landmarks",
  "viaduct": "architectural_landmarks",
  "aqueduct": "architectural_landmarks",
  "amphitheatre": "architectural_landmarks",
  "theatre": "architectural_landmarks",
  "opera": "architectural_landmarks",
  "arch": "architectural_landmarks",
  "triumphal": "architectural_landmarks",
  "skyscrapers": "architectural_landmarks",
  "skyscraper": "architectural_landmarks",
  "modern": "architectural_landmarks",
  "contemporary": "architectural_landmarks",
  "lighthouse": "architectural_landmarks",
  "lighthouses": "architectural_landmarks",
  "bell_tower": "architectural_landmarks",
  "clock_tower": "architectural_landmarks",
  "spire": "architectural_landmarks",
  
  // Natural Landscapes
  "natural": "natural_landscapes",
  "nature": "natural_landscapes",
  "mountains": "natural_landscapes",
  "peaks": "natural_landscapes",
  "volcanoes": "natural_landscapes",
  "caves": "natural_landscapes",
  "canyons": "natural_landscapes",
  "cliffs": "natural_landscapes",
  "rocks": "natural_landscapes",
  "geological": "natural_landscapes",
  "geological_formations": "natural_landscapes",
  "lakes": "natural_landscapes",
  "rivers": "natural_landscapes",
  "waterfalls": "natural_landscapes",
  "springs": "natural_landscapes",
  "beaches": "natural_landscapes",
  "beach": "natural_landscapes",
  "sand": "natural_landscapes",
  "shore": "natural_landscapes",
  "seaside": "natural_landscapes",
  "coastal": "natural_landscapes",
  "marine": "natural_landscapes",
  "islands": "natural_landscapes",
  "forests": "natural_landscapes",
  
  // Parks & Gardens
  "gardens_and_parks": "parks_gardens",
  "gardens": "parks_gardens",
  "garden": "parks_gardens",
  "parks": "parks_gardens",
  "park": "parks_gardens",
  "botanical_gardens": "parks_gardens",
  "botanical": "parks_gardens",
  "national_parks": "parks_gardens",
  "nature_reserves": "parks_gardens",
  "wildlife": "parks_gardens",
  "conservation": "parks_gardens",
  "arboretum": "parks_gardens",
  "green_space": "parks_gardens",
  "fountains": "parks_gardens",
  "fountain": "parks_gardens",
  "water_feature": "parks_gardens",
  
  // Outdoor Adventures & Sports
  "sport": "outdoor_sports",
  "sports": "outdoor_sports",
  "stadium": "outdoor_sports",
  "stadiums": "outdoor_sports",
  "skiing": "outdoor_sports",
  "ski_resorts": "outdoor_sports",
  "diving": "outdoor_sports",
  "surfing": "outdoor_sports",
  "climbing": "outdoor_sports",
  "golf_courses": "outdoor_sports",
  "golf": "outdoor_sports",
  "swimming": "outdoor_sports",
  "pool": "outdoor_sports",
  "recreation": "outdoor_sports",
  "sports_centres": "outdoor_sports",
  "swimming_pools": "outdoor_sports",
  
  // City Centers & Squares
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
  
  // Viewpoints & Landmark Towers
  "viewpoints": "viewpoints_towers",
  "viewpoint": "viewpoints_towers",
  "view_point": "viewpoints_towers",
  "observation_decks": "viewpoints_towers",
  "observation": "viewpoints_towers",
  "lookouts": "viewpoints_towers",
  "lookout": "viewpoints_towers",
  "scenic": "viewpoints_towers",
  "panoramic": "viewpoints_towers",
  "overlook": "viewpoints_towers",
  "vista": "viewpoints_towers",
  
  // Theme Parks & Zoos
  "amusements": "theme_parks_zoos",
  "amusement": "theme_parks_zoos",
  "theme_parks": "theme_parks_zoos",
  "theme_park": "theme_parks_zoos",
  "amusement_park": "theme_parks_zoos",
  "water_park": "theme_parks_zoos",
  "zoos": "theme_parks_zoos",
  "zoo": "theme_parks_zoos",
  "aquariums": "theme_parks_zoos",
  "aquarium": "theme_parks_zoos",
  "miniature_park": "theme_parks_zoos",
  "roller_coaster": "theme_parks_zoos",
  "ferris_wheel": "theme_parks_zoos",
  
  // Nightlife
  "nightlife": "nightlife",
  "nightclubs": "nightlife",
  "bars": "nightlife",
  "bar": "nightlife",
  "clubs": "nightlife",
  "club": "nightlife",
  "casinos": "nightlife",
  "casino": "nightlife",
  "entertainment": "nightlife",
  
  // Shows & Cinema
  "theaters": "shows_cinema",
  "theater": "shows_cinema",
  "theatres": "shows_cinema",
  "cinemas": "shows_cinema",
  "cinema": "shows_cinema",
  
  // Shopping (if OpenTripMap provides these)
  "shopping": "shopping",
  "mall": "shopping",
  "market": "shopping",
  "shops": "shopping",
  
  // Interesting Places
  "interesting_places": "interesting_places",
  "tourist_facilities": "interesting_places",
  "tourist_attraction": "interesting_places",
  "attraction": "interesting_places",
  "other": "interesting_places",
  "unspecified": "interesting_places",
  
  // Food & Dining (if OpenTripMap provides these)
  "restaurants": "food_dining",
  "restaurant": "food_dining",
  "cafes": "food_dining",
  "cafe": "food_dining",
  "food": "food_dining",
  "dining": "food_dining"
};