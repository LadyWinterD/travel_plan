// Destination Types
export interface Destination {
  id: string;
  name: string;
  country: string;
  image?: string;
  locationId?: string; // For API integration
  days: number;
}

// Activity Types
export interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: number; // in minutes
  rating: number;
  price?: {
    amount: number;
    currencyCode: string;
  };
  category: string;
  indoor: boolean; // Used for weather optimization
  location?: {
    lat: number;
    lng: number;
  };
}

// Weather Types
export interface WeatherData {
  date: string;
  temperature: number;
  condition: string;
  icon: string;
  precipitation: number;
  isRainy: boolean;
}

// Itinerary Types
export interface TripDay {
  id: string;
  date: string;
  destinationId: string;
  activities: ScheduledActivity[];
  weatherData?: WeatherData;
}

export interface ScheduledActivity {
  activityId: string;
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  activity: Activity;
}

// Storage Types
export interface StoredTripData {
  destinations: Destination[];
  startDate: string | undefined;
  endDate: string | undefined;
  selectedActivities: Record<string, Activity[]>;
  dailyItinerary: TripDay[];
  weatherData: Record<string, WeatherData[]>;
}