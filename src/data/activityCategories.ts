export const activityCategories = [
  "interesting_places",
  "architecture",
  "historic",
  "historic_architecture",
  "museums",
  "cultural",
  "religion",
  "churches",
  "cathedrals",
  "castles",
  "towers",
  "viewpoints",
  "monuments_and_memorials",
  "natural",
  "gardens_and_parks",
  "urban_environment",
  "amusements",
  "sport"
] as const;

export type ActivityCategory = typeof activityCategories[number];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  interesting_places: "Interesting Places",
  architecture: "Architecture",
  historic: "Historic",
  historic_architecture: "Historic Architecture",
  museums: "Museums",
  cultural: "Cultural",
  religion: "Religious Sites",
  churches: "Churches",
  cathedrals: "Cathedrals",
  castles: "Castles",
  towers: "Towers",
  viewpoints: "Viewpoints",
  monuments_and_memorials: "Monuments & Memorials",
  natural: "Natural Attractions",
  gardens_and_parks: "Parks & Gardens",
  urban_environment: "Urban Areas",
  amusements: "Amusements",
  sport: "Sports"
};
