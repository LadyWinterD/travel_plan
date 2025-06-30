import { ActivityCategory } from '../data/activityCategories';

export interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: ActivityCategory[]; 
  duration: number;
  rating: number;
  // 🚫 REMOVED: indoor property - no longer needed
  price?: {
    amount: number;
    currencyCode: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  // Enhanced fields for detailed information
  wikipediaExtracts?: {
    title: string;
    text: string;
    html?: string;
  };
  address?: {
    city?: string;
    country?: string;
    road?: string;
    houseNumber?: string;
  };
  wikipediaUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  days: number;
  image: string;
}

export interface ScheduledActivity {
  activityId: string;
  startTime: string;
  endTime: string;
  activity: Activity;
  day?: number;
}

export interface TripDay {
  id: string;
  date: string;
  destinationId: string;
  activities: ScheduledActivity[];
  weatherData?: WeatherData;
  warning?: string;
}

export interface WeatherData {
  date: string;
  temperature: number;
  condition: string;
  icon?: string;
  precipitation: number;
  isRainy: boolean;
}

export interface UserPreferences {
  city: string;
  date: string;
  categories: ActivityCategory[]; 
}

export interface StoredTripData {
  destinations?: Destination[];
  startDate?: string;
  endDate?: string;
  selectedActivities?: Record<string, Activity[]>;
  dailyItinerary?: TripDay[];
  weatherData?: Record<string, WeatherData>;
  preferences?: ActivityCategory[];
}