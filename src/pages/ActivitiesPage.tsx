import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer, Filter, Calendar } from 'lucide-react';
import { getRealActivitiesForCity, getWeatherBasedRecommendations } from '../utils/realActivityData';
import { getFallbackImageUrl } from '../services/openTripMapApi';
import { activityCategories, activityCategoryLabels } from '../data/activityCategories';
import type { ActivityCategory } from '../data/activityCategories';
import ActivityDetailModal from '../components/ActivityDetailModal';

// Utility function for category validation
const validateCategory = (cat: string): ActivityCategory => {
  return activityCategories.includes(cat as ActivityCategory) 
    ? cat as ActivityCategory 
    : 'interesting_places';
};

// Loading skeleton component for categories
const CategorySkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="h-10 bg-gray-200 rounded-lg animate-pulse"
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
  onDoubleClick: () => void;
  weather?: WeatherData;
}> = ({ activity, isSelected, onToggle, onDoubleClick, weather }) => {
  
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
      className={`relative bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 hover:shadow-lg flex flex-col cursor-pointer ${
        isSelected 
          ? 'border-teal-500 ring-2 ring-teal-200 transform scale-105' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onDoubleClick={onDoubleClick}
      title="Double-click to view details"
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
        
        {/* Double-click hint */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs opacity-75">
          Double-click for details
        </div>
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
              e.stopPropagation(); // Prevent double-click when clicking button
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
  
  // Filter states
  const [selectedInterests, setSelectedInterests] = useState<ActivityCategory[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState<boolean>(false);
  
  // Modal state
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Memoized available categories - performance optimized
  const availableCategories = useMemo(() => {
    if (allActivitiesForCity.length === 0) return [];
    
    const uniqueCategories = new Set<ActivityCategory>();
    allActivitiesForCity.forEach(activity => {
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
  }, [allActivitiesForCity]);

  // Clear selected interests when switching destinations
  useEffect(() => {
    setSelectedInterests([]);
  }, [activeDestination]);
  
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

    // Apply free filter
    if (showFreeOnly) {
      filteredActivities = filteredActivities.filter(activity =>
        !activity.price || activity.price.amount === 0
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
      filteredActivities = getWeatherBasedRecommendations(filteredActivities, weatherData, preferences);
    } else if (preferences.length > 0) {
      filteredActivities = filteredActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }

    setActivities(filteredActivities);
  }, [allActivitiesForCity, selectedInterests, smartWeatherFiltering, weatherData, preferences, showFreeOnly]);
  
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
  };

  const handleDoubleClick = (activity: Activity) => {
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

  // Determine empty state message
  const getEmptyStateMessage = () => {
    if (loadingActivities) return null;
    if (allActivitiesForCity.length === 0) return apiError || 'No attractions found for this city.';
    if (showFreeOnly && activities.length === 0) {
      return 'No free activities found for this destination. Try adjusting your filters or explore paid activities.';
    }
    if (selectedInterests.length > 0 && activities.length === 0) {
      return `No activities found matching your selected interests: ${selectedInterests.map(cat => activityCategoryLabels[cat]).join(', ')}.`;
    }
    if (activities.length === 0) return 'No activities found for your current filters.';
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Discover 50+ Real Attractions</h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          Powered by OpenTripMap - More choices, more free options!
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
      
      {/* Destination Information with Smart Weather Filtering */}
      <div className="mb-4 sm:mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          
          {/* Smart Weather Filtering Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-teal-800">Smart Weather Filtering</div>
              <div className="text-xs text-teal-600">Optimize for travel date weather</div>
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

      {/* Weather Recommendation */}
      {isWeatherLoading && (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm sm:text-base">Loading weather data for your travel dates...</p>
        </div>
      )}
      
      {weatherData && !isWeatherLoading && (
        <WeatherForecastCard 
          weather={weatherData} 
          location={`${currentDestination.name}, ${currentDestination.country}`}
          isForTravelDate={!!startDate}
        />
      )}
      
      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Activities</h3>
          </div>
          {(selectedInterests.length > 0 || showFreeOnly) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-teal-600 hover:text-teal-800 underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        {/* Enhanced Free Activities Filter */}
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-green-600 bg-green-100 p-2 rounded-full">
                <DollarSign size={20} />
              </div>
              <div>
                <h4 className="font-bold text-green-800 text-lg">💰 Free Activities Only</h4>
                <p className="text-sm text-green-700">
                  <span className="font-semibold">{freeActivitiesCount}</span> free activities available in {currentDestination.name}
                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    {Math.round(freeActivitiesCount/Math.max(allActivitiesForCity.length, 1)*100)}% FREE
                  </span>
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
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-lg"></div>
            </label>
          </div>
          {showFreeOnly && (
            <div className="mt-3 p-2 bg-green-100 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                🎉 Showing only FREE activities! Save money while exploring amazing places.
              </p>
            </div>
          )}
        </div>
        
        {/* Interest Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Filter by Interests</h4>
            {availableCategories.length > 0 && (
              <span className="text-sm text-gray-500">({availableCategories.length} available)</span>
            )}
          </div>
          
          {/* Loading state for categories */}
          {(loadingActivities || isInitialLoad) && <CategorySkeleton />}
          
          {/* Dynamic categories grid */}
          {!loadingActivities && !isInitialLoad && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableCategories.map((interest) => (
                <label
                  key={interest}
                  className={`flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 text-xs ${
                    selectedInterests.includes(interest)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInterests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="sr-only"
                  />
                  <span className="font-medium text-center">
                    {activityCategoryLabels[interest] || interest}
                  </span>
                </label>
              ))}
              {availableCategories.length === 0 && !loadingActivities && (
                <p className="text-gray-500 col-span-full text-center py-4 text-sm">
                  No categories available for this city.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Cards Grid */}
      {loadingActivities ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm sm:text-base">Loading 50+ real attractions from OpenTripMap...</p>
        </div>
      ) : (
        <>
          {/* Activity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={isActivitySelected(activity.id)}
                onToggle={() => toggleActivity(activeDestination!, activity)}
                onDoubleClick={() => handleDoubleClick(activity)}
                weather={weatherData || undefined}
              />
            ))}
          </div>
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
            {showFreeOnly && (
              <button
                onClick={() => setShowFreeOnly(false)}
                className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto text-sm sm:text-base"
              >
                Show all activities (including paid)
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
            {(selectedInterests.length > 0 || smartWeatherFiltering || showFreeOnly) && (
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
      {selectedActivityForModal && (
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