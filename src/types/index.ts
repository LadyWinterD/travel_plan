import { ActivityCategory } from '../data/activityCategories';

export interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: ActivityCategory[]; 
  duration: number;
  rating: number;
  isOutdoor: boolean;
}

export interface UserPreferences {
  city: string;
  date: string;
  categories: ActivityCategory[]; 
}

export interface StoredTripData {
  preferences: ActivityCategory[]; 
  itinerary: Record<string, Activity[]>;
}
