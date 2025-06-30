import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer, Filter, Calendar, ImageIcon, Map, Grid, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getRealActivitiesForCity, getWeatherBasedRecommendations } from '../utils/realActivityData';
import { getFallbackImageUrl, getCoordinatesForCity } from '../services/openTripMapApi';
import { activityCategories, activityCategoryLabels } from '../data/activityCategories';
import type { ActivityCategory } from '../data/activityCategories';
import ActivityDetailModal from '../components/ActivityDetailModal';
import ActivityMap from '../components/ActivityMap';

// Enhanced category style classes for beautiful filter buttons
const categoryStyleClasses = {
  museums_arts: {
    selected: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white ring-2 ring-purple-300 scale-105 shadow-lg border-purple-500',
    unselected: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md'
  },
  historical_sites: {
    selected: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-300 scale-105 shadow-lg border-amber-500',
    unselected: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md'
  },
  religious_sites: {
    selected: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-blue-300 scale-105 shadow-lg border-blue-500',
    unselected: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md'
  },
  castles_palaces: {
    selected: 'bg-gradient-to-r from-red-500 to-red-600 text-white ring-2 ring-red-300 scale-105 shadow-lg border-red-500',
    unselected: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 shadow-sm hover:shadow-md'
  },
  architectural_landmarks: {
    selected: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white ring-2 ring-gray-300 scale-105 shadow-lg border-gray-500',
    unselected: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
  },
  natural_landscapes: {
    selected: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-2 ring-emerald-300 scale-105 shadow-lg border-emerald-500',
    unselected: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
  },
  parks_gardens: {
    selected: 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-300 scale-105 shadow-lg border-green-500',
    unselected: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
  },
  outdoor_sports: {
    selected: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white ring-2 ring-orange-300 scale-105 shadow-lg border-orange-500',
    unselected: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 shadow-sm hover:shadow-md'
  },
  city_centers: {
    selected: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white ring-2 ring-indigo-300 scale-105 shadow-lg border-indigo-500',
    unselected: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md'
  },
  viewpoints_towers: {
    selected: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white ring-2 ring-pink-300 scale-105 shadow-lg border-pink-500',
    unselected: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-pink-200 hover:from-pink-100 hover:to-pink-200 hover:border-pink-300 shadow-sm hover:shadow-md'
  },
  theme_parks_zoos: {
    selected: 'bg-gradient-to-r from-lime-500 to-lime-600 text-white ring-2 ring-lime-300 scale-105 shadow-lg border-lime-500',
    unselected: 'bg-gradient-to-r from-lime-50 to-lime-100 text-lime-700 border-lime-200 hover:from-lime-100 hover:to-lime-200 hover:border-lime-300 shadow-sm hover:shadow-md'
  },
  nightlife: {
    selected: 'bg-gradient-to-r from-violet-500 to-violet-600 text-white ring-2 ring-violet-300 scale-105 shadow-lg border-violet-500',
    unselected: 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-200 hover:from-violet-100 hover:to-violet-200 hover:border-violet-300 shadow-sm hover:shadow-md'
  },
  shows_cinema: {
    selected: 'bg-gradient-to-r from-red-600 to-red-700 text-white ring-2 ring-red-300 scale-105 shadow-lg border-red-600',
    unselected: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 shadow-sm hover:shadow-md'
  },
  shopping: {
    selected: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white ring-2 ring-emerald-300 scale-105 shadow-lg border-emerald-600',
    unselected: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
  },
  interesting_places: {
    selected: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white ring-2 ring-teal-300 scale-105 shadow-lg border-teal-500',
    unselected: 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border-teal-200 hover:from-teal-100 hover:to-teal-200 hover:border-teal-300 shadow-sm hover:shadow-md'
  },
  food_dining: {
    selected: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white ring-2 ring-amber-300 scale-105 shadow-lg border-amber-600',
    unselected: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md'
  }
};

// Utility function for category validation
const validateCategory = (cat: string): ActivityCategory => {
  return activityCategories.includes(cat as ActivityCategory) 
    ? cat as ActivityCategory 
    : 'interesting_places';
};

// Loading skeleton component for categories
const CategorySkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {Array.from({ length: 10 }).map((_, index) => (
      <div
        key={index}
        className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"
      />
    ))}
  </div>
);

const WeatherForecastCard: React.FC<{ weather: WeatherData; location: string; isForTravelDate?: boolean }> = ({ weather, location, isForTravelDate = false }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" size={24} />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" size={24} />;
    return <Cloud className="text-gray-500" size={24} />;
  };

  const getWeatherAdvice = () => {
    if (weather.isRainy) return "Great weather for indoor activities";
    if (weather.temperature > 30) return "Perfect for air-conditioned venues";
    if (weather.temperature < 5) return "Indoor activities recommended";
    if (weather.temperature > 20) return "Ideal weather for outdoor adventures";
    return "Good weather for both indoor and outdoor activities";       
  };

  const getWeatherTypeLabel = () => {
    if (isForTravelDate) {
      const weatherDate = new Date(weather.date);
      const today = new Date();
      const isHistorical = weatherDate < today;
      const daysDiff = Math.abs(weatherDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      
      if (isHistorical) {
        return "Historical Weather";
      } else if (daysDiff <= 14) {
        return "Weather Forecast";
      } else {
        return "Weather Estimate";
      }
    }
    return "Current Weather";
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {getWeatherIcon()}
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{location}</h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Thermometer size={14} className="text-red-500 flex-shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</span>
              </div>
              <span className="text-gray-600 text-sm sm:text-base">{weather.condition}</span>
              {weather.isRainy && weather.precipitation != null && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Umbrella size={14} />
                  <span className="text-sm">{Math.round(weather.precipitation)}mm</span>
                </div>
              )}
            </div>
            {isForTravelDate && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>{getWeatherTypeLabel()} for {new Date(weather.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500 mb-1">Weather Recommendation</div>
          <div className="text-sm font-medium text-gray-800">
            {getWeatherAdvice()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityCard: React.FC<{ 
  activity: Activity; 
  isSelected: boolean; 
  onToggle: () => void;
  onClick: () => void;
  weather?: WeatherData;
}> = ({ activity, isSelected, onToggle, onClick, weather }) => {
  
  const getWeatherBadge = () => {
    if (!weather) return null;
    
    if (!activity.indoor && !weather.isRainy && weather.temperature > 15) {
      return (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          ☀️ <span className="hidden sm:inline">Perfect Weather Activity</span>
        </div>
      );
    }
    
    if (activity.indoor && weather.isRainy) {
      return (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          ☂️ <span className="hidden sm:inline">Rainy Day Recommended</span>
        </div>
      );
    }
    
    return null;
  };

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m';
  };

  const formatPrice = () => {
    if (!activity.price || activity.price.amount === 0) return 'Free';
    return `$${activity.price.amount}`;
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col cursor-pointer ${
        isSelected 
          ? 'border-teal-500 ring-2 ring-teal-200 transform scale-105' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {/* Weather Badge */}
      {getWeatherBadge()}
      
      {/* Free Badge */}
      {(!activity.price || activity.price.amount === 0) && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          FREE
        </div>
      )}
      
      {/* Activity Image */}
      <div className="h-40 sm:h-48 relative">
        <img
          src={activity.image}
          alt={`Photo of ${activity.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getFallbackImageUrl(activity.categories);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* Activity Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {activity.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
          {activity.description}
        </p>
        
        {/* Info Row */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 gap-2">
          <div className="flex items-center gap-1">
            <Clock size={12} className="flex-shrink-0" />
            <span>{formatDuration(activity.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500 flex-shrink-0" />
            <span>{activity.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} className="flex-shrink-0" />
            <span className={activity.price?.amount === 0 ? 'text-green-600 font-bold' : ''}>
              {formatPrice()}
            </span>
          </div>
        </div>
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {activity.categories.slice(0, 2).map((category) => (
            <span 
              key={category}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {activityCategoryLabels[category] || category}
            </span>
          ))}
          {activity.categories.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{activity.categories.length - 2}
            </span>
          )}
        </div>
        
        {/* Indoor/Outdoor Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className={`text-xs px-2 py-1 rounded-full ${
            activity.indoor 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {activity.indoor ? '🏢 Indoor' : '🌳 Outdoor'}
          </span>
        </div>
        
        {/* Add to Trip Button */}
        <div className="mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent modal opening when clicking button
              onToggle();
            }}
            className={`w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              isSelected
                ? 'bg-teal-500 text-white shadow-lg hover:bg-teal-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={16} />
                <span className="hidden sm:inline">Added to Trip</span>
                <span className="sm:hidden">Added</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Add to Trip</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    destinations, 
    selectedActivities, 
    toggleActivity, 
    preferences,
    startDate,
    endDate,
    fetchWeatherForDate
  } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allActivitiesForCity, setAllActivitiesForCity] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [smartWeatherFiltering, setSmartWeatherFiltering] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // View state - map or grid
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Filter states
  const [selectedInterests, setSelectedInterests] = useState<ActivityCategory[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  
  // Modal state
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Memoized available categories - performance optimized
  const availableCategories = useMemo(() => {
    if (allActivitiesForCity.length === 0) return [];
    
    // Apply the same filters as the main filtering logic, but without selectedInterests
    let filteredActivities = [...allActivitiesForCity];

    // Filter out activities with fallback images (BACKIMAGE)
    filteredActivities = filteredActivities.filter(activity => {
      const fallbackUrl = getFallbackImageUrl(activity.categories);
      return activity.image !== fallbackUrl;
    });

    // Apply free filter
    if (showFreeOnly) {
      filteredActivities = filteredActivities.filter(activity =>
        !activity.price || activity.price.amount === 0
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredActivities = filteredActivities.filter(activity =>
        activity.name.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.categories.some(category => 
          activityCategoryLabels[category]?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply interest category filters
    if (selectedInterests.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.categories.some(category => selectedInterests.includes(category))
      );
    }

    // Apply weather-based filtering if enabled and weather data is available
    if (smartWeatherFiltering && weatherData) {
      filteredActivities = getWeatherBasedRecommendations(filteredActivities, weatherData, preferences as ActivityCategory[]);
    } else if (preferences.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }
    
    const uniqueCategories = new Set<ActivityCategory>();
    filteredActivities.forEach(activity => {
      activity.categories.forEach(category => {
        const validatedCategory = validateCategory(category);
        uniqueCategories.add(validatedCategory);
      });
    });
    
    // Convert Set to Array and sort alphabetically by display name
    return Array.from(uniqueCategories).sort((a, b) => {
      const labelA = activityCategoryLabels[a] || a;
      const labelB = activityCategoryLabels[b] || b;
      return labelA.localeCompare(labelB);
    });
  }, [allActivitiesForCity, showFreeOnly, smartWeatherFiltering, weatherData, preferences, searchTerm]);

  // Clear selected interests when switching destinations
  useEffect(() => {
    setSelectedInterests([]);
  }, [activeDestination]);

  // Clean up selected interests that are no longer available in current results
  useEffect(() => {
    if (selectedInterests.length > 0) {
      const availableCategorySet = new Set(availableCategories);
      const validSelectedInterests = selectedInterests.filter(interest => 
        availableCategorySet.has(interest)
      );
      
      if (validSelectedInterests.length !== selectedInterests.length) {
        setSelectedInterests(validSelectedInterests);
      }
    }
  }, [availableCategories, selectedInterests]);
  
  // Fetch weather data for travel dates when destination changes
  useEffect(() => {
    if (!activeDestination || !startDate) return;

    const destination = destinations.find(d => d.id === activeDestination);
    if (destination?.name) {
      setIsWeatherLoading(true);
      fetchWeatherForDate(destination.name, startDate)
        .then((weather) => {
          if (weather) {
            setWeatherData(weather);
          }
        })
        .finally(() => {
          setIsWeatherLoading(false);
        });
    }
  }, [activeDestination, destinations, startDate, fetchWeatherForDate]);

  // Fetch city coordinates for map view
  useEffect(() => {
    if (!activeDestination) return;

    const destination = destinations.find(d => d.id === activeDestination);
    if (destination?.name) {
      getCoordinatesForCity(destination.name)
        .then((coordinates) => {
          if (coordinates) {
            setCityCoordinates({ lat: coordinates.lat, lng: coordinates.lon });
          }
        })
        .catch((error) => {
          console.error('Failed to get city coordinates:', error);
        });
    }
  }, [activeDestination, destinations]);

  // Load activities from API - ENHANCED to get 50 activities
  useEffect(() => {
    if (!activeDestination) return;

    const loadActivities = async () => {
      setLoadingActivities(true);
      setApiError(null);

      try {
        const destination = destinations.find(d => d.id === activeDestination);
        
        console.log(`🚀 Loading 50 activities for ${destination?.name}...`);
        const allDestinationActivities = await getRealActivitiesForCity(destination?.name || '');
        
        if (allDestinationActivities.length === 0) {
          setApiError(`No attractions found for ${destination?.name}. This could be due to API limits, the city not being in the OpenTripMap database, or no activities matching your current filters.`);
          setAllActivitiesForCity([]);
          setActivities([]);
          return;
        }
        
        setApiError(null);
        setAllActivitiesForCity(allDestinationActivities);
        
        // 📊 统计并显示免费景点信息
        const freeCount = allDestinationActivities.filter(activity => 
          !activity.price || activity.price.amount === 0
        ).length;
        
        console.log(`✅ Successfully loaded ${allDestinationActivities.length} real activities for ${destination?.name}`);
        console.log(`💰 Free activities: ${freeCount}/${allDestinationActivities.length} (${Math.round(freeCount/allDestinationActivities.length*100)}%)`);
        
      } catch (error) {
        console.error('Error loading activities:', error);
        setApiError('Failed to load attractions from OpenTripMap. Please try again or select a different city.');
        setAllActivitiesForCity([]);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
        setIsInitialLoad(false);
      }
    };

    loadActivities();
  }, [activeDestination, destinations]);

  // Apply filters to activities
  useEffect(() => {
    let filteredActivities = [...allActivitiesForCity];

    // Filter out activities with fallback images (BACKIMAGE)
    filteredActivities = filteredActivities.filter(activity => {
      const fallbackUrl = getFallbackImageUrl(activity.categories);
      return activity.image !== fallbackUrl;
    });

    // Apply free filter
    if (showFreeOnly) {
      filteredActivities = filteredActivities.filter(activity =>
        !activity.price || activity.price.amount === 0
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredActivities = filteredActivities.filter(activity =>
        activity.name.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.categories.some(category => 
          activityCategoryLabels[category]?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply interest category filters
    if (selectedInterests.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.categories.some(category => selectedInterests.includes(category))
      );
    }

    // Apply weather-based filtering if enabled and weather data is available
    if (smartWeatherFiltering && weatherData) {
      filteredActivities = getWeatherBasedRecommendations(filteredActivities, weatherData, preferences as ActivityCategory[]);
    } else if (preferences.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }

    setActivities(filteredActivities);
  }, [allActivitiesForCity, selectedInterests, smartWeatherFiltering, weatherData, preferences, showFreeOnly, searchTerm]);
  
  // Redirect if no destinations
  useEffect(() => { 
    if (destinations.length === 0) navigate('/destinations'); 
  }, [destinations, navigate]);

  const isActivitySelected = (activityId: string): boolean => {
    return activeDestination ? selectedActivities[activeDestination]?.some(a => a.id === activityId) || false : false;
  };
  
  const handleInterestToggle = (interest: ActivityCategory) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const clearAllFilters = () => {
    setSelectedInterests([]);
    setSmartWeatherFiltering(false);
    setShowFreeOnly(false);
    setSearchTerm('');
  };

  const handleClick = (activity: Activity) => {
    console.log('handleClick called for activity:', activity.name);
    setSelectedActivityForModal(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityForModal(null);
  };

  // Count free activities
  const freeActivitiesCount = allActivitiesForCity.filter(activity => 
    !activity.price || activity.price.amount === 0
  ).length;

  // Get selected activities for current destination
  const currentSelectedActivities = activeDestination ? selectedActivities[activeDestination] || [] : [];

  // Determine empty state message
  const getEmptyStateMessage = () => {
    if (loadingActivities) return null;
    if (allActivitiesForCity.length === 0) return apiError || 'No attractions found for this city.';
    
    // Count activities with real images vs fallback images
    const activitiesWithRealImages = allActivitiesForCity.filter(activity => {
      const fallbackUrl = getFallbackImageUrl(activity.categories);
      return activity.image !== fallbackUrl;
    });
    
    if (activitiesWithRealImages.length === 0) {
      return 'No attractions with real photos found for this city. Only attractions with authentic images are shown.';
    }
    
    if (searchTerm.trim() && activities.length === 0) {
      return `No attractions found matching "${searchTerm}". Try different keywords or check your spelling.`;
    }
    
    if (showFreeOnly && activities.length === 0) {
      return 'No free activities with real photos found for this destination. Try adjusting your filters or explore paid activities.';
    }
    if (selectedInterests.length > 0 && activities.length === 0) {
      return `No activities with real photos found matching your selected interests: ${selectedInterests.map(cat => activityCategoryLabels[cat]).join(', ')}.`;
    }
    if (activities.length === 0) return 'No activities with real photos found for your current filters.';
    return null;
  };
  
  const currentDestination = destinations.find(d => d.id === activeDestination);

  if (!currentDestination) { 
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Please select a destination to see activities.</p>
      </div>
    ); 
  }
  
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Page Title */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Discover Real Attractions</h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          Powered by OpenTripMap - Only attractions with authentic photos are shown!
        </p>
      </div>
      
      {/* API Error Message */}
      {apiError && (
        <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        </div>
      )}
      
      {/* Travel Dates Warning */}
      {!startDate && (
        <div className="mb-4 sm:mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="text-sm sm:text-base">Set your travel dates to see weather forecasts for your trip!</span>
          </div>
        </div>
      )}
      
      {/* Destination Tabs */}
      <div className="mb-4 sm:mb-6">
        <div className="flex overflow-x-auto pb-2 space-x-2 sm:space-x-3 scrollbar-hide">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              onClick={() => setActiveDestination(destination.id)}
              className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                activeDestination === destination.id
                  ? 'bg-teal-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeDestination === destination.id ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{destination.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Destination Information with View Toggle */}
      <div className="mb-4 sm:mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="text-teal-600 flex-shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-teal-800 truncate">
                {currentDestination.name}, {currentDestination.country}
              </h2>
              <p className="text-teal-700 text-xs sm:text-sm">
                Duration: {currentDestination.days} day{currentDestination.days > 1 ? 's' : ''} • 
                Selected: {selectedActivities[currentDestination.id]?.length || 0} • 
                Available: {activities.length}
                {selectedInterests.length > 0 && (
                  <span className="block sm:inline sm:ml-2">
                    Filtered by: {selectedInterests.map(cat => activityCategoryLabels[cat]).join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'active' : ''}
              >
                <Grid size={16} className="mr-1" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'active' : ''}
              >
                <Map size={16} className="mr-1" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Filter Section - Smart Weather, Free Activities, and Search in one row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Activities</h3>
          </div>
          {(selectedInterests.length > 0 || showFreeOnly || searchTerm.trim() || smartWeatherFiltering) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-teal-600 hover:text-teal-800 underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        {/* Combined Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Search Box */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search attractions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm.trim() && (
              <div className="mt-2 text-sm text-gray-600">
                Found {activities.length} result{activities.length !== 1 ? 's' : ''} for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Free Activities Filter */}
          <div className="lg:col-span-1">
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-green-600 bg-green-100 p-1.5 rounded-full">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-sm">Free Activities</h4>
                    <p className="text-xs text-green-700">
                      {freeActivitiesCount} available
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Smart Weather Filtering */}
          {weatherData && !isWeatherLoading && (
            <div className="lg:col-span-1">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-lg h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600 bg-blue-100 p-1.5 rounded-full">
                      {weatherData.isRainy ? <CloudRain size={16} /> : 
                       weatherData.temperature > 25 ? <Sun size={16} /> : 
                       <Cloud size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800 text-sm">Weather Filter</h4>
                      <p className="text-xs text-blue-700">
                        {Math.round(weatherData.temperature)}°C
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartWeatherFiltering}
                      onChange={(e) => setSmartWeatherFiltering(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Interest Categories Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Filter size={20} className="text-teal-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Activity Categories</h4>
                <p className="text-sm text-gray-600">
                  {availableCategories.length > 0 
                    ? `${availableCategories.length} categories available` 
                    : 'Loading categories...'
                  }
                </p>
              </div>
            </div>
            
            {availableCategories.length > 8 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                {showAllCategories ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show All ({availableCategories.length})
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Loading state for categories */}
          {(loadingActivities || isInitialLoad) && <CategorySkeleton />}
          
          {/* Enhanced categories grid with beautiful styling */}
          {!loadingActivities && !isInitialLoad && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {(showAllCategories ? availableCategories : availableCategories.slice(0, 8)).map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                const selectedColor = categoryStyleClasses[interest].selected;
                const unselectedColor = categoryStyleClasses[interest].unselected;
                
                return (
                  <label
                    key={interest}
                    className={`group relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-sm font-semibold transform hover:scale-105 ${
                      isSelected 
                        ? selectedColor 
                        : unselectedColor
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleInterestToggle(interest)}
                      className="sr-only"
                    />
                    <span className="text-center leading-tight relative z-10">
                      {activityCategoryLabels[interest] || interest}
                    </span>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </label>
                );
              })}
              
              {availableCategories.length === 0 && !loadingActivities && (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Filter size={32} className="mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No categories available for this city.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Selected categories summary */}
          {selectedInterests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Selected: {selectedInterests.length} categor{selectedInterests.length === 1 ? 'y' : 'ies'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInterests([])}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Weather Loading State */}
      {isWeatherLoading && (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm sm:text-base">Loading weather data for your travel dates...</p>
        </div>
      )}
      
      {/* Content Area - Map or Grid */}
      {loadingActivities ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm sm:text-base">Loading real attractions from OpenTripMap...</p>
        </div>
      ) : (
        <>
          {viewMode === 'map' ? (
            /* Map View */
            <div className="mb-6">
              <ActivityMap
                activities={activities}
                selectedActivities={currentSelectedActivities}
                onActivityToggle={(activity) => toggleActivity(activeDestination!, activity)}
                onActivityClick={handleClick}
                centerCoordinates={cityCoordinates || undefined}
                weather={weatherData || undefined}
                location={`${currentDestination.name}, ${currentDestination.country}`}
              />
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isSelected={isActivitySelected(activity.id)}
                  onToggle={() => toggleActivity(activeDestination!, activity)}
                  onClick={() => handleClick(activity)}
                  weather={weatherData || undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Enhanced No Activities Message */}
      {getEmptyStateMessage() && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Sun size={32} className="mx-auto" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No attractions found</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm sm:text-base px-4">
            {getEmptyStateMessage()}
          </p>
          <div className="space-y-2">
            {searchTerm.trim() && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto text-sm sm:text-base"
              >
                Clear search
              </button>
            )}
            {selectedInterests.length > 0 && (
              <button
                onClick={() => setSelectedInterests([])}
                className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto text-sm sm:text-base"
              >
                Clear interest filters
              </button>
            )}
            {(selectedInterests.length > 0 || smartWeatherFiltering || showFreeOnly || searchTerm.trim()) && (
              <button
                onClick={clearAllFilters}
                className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto text-sm sm:text-base"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-6 border-t border-gray-200 gap-4">
        <button
          onClick={() => navigate('/destinations')}
          className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
        >
          ← Back to Destinations
        </button>
        <button
          onClick={() => navigate('/itinerary')}
          className="px-4 sm:px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-lg text-sm sm:text-base"
          disabled={Object.values(selectedActivities).every(acts => acts.length === 0)}
        >
          View Itinerary →
        </button>
      </div>

      {/* Activity Detail Modal */}
      {isModalOpen && selectedActivityForModal && (
        <ActivityDetailModal
          activity={selectedActivityForModal}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          weather={weatherData || undefined}
          location={`${currentDestination.name}, ${currentDestination.country}`}
          isSelected={isActivitySelected(selectedActivityForModal.id)}
          onToggle={() => {
            toggleActivity(activeDestination!, selectedActivityForModal);
          }}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;