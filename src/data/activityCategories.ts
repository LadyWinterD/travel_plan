export const activityCategories = [
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
] as const;

export type ActivityCategory = typeof activityCategories[number];