import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer } from 'lucide-react';
import { getMockActivities } from '../utils/mockData';

const WeatherCard: React.FC<{ weather: WeatherData; location: string }> = ({ weather, location }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" size={24} />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" size={24} />;
    return <Cloud className="text-gray-500" size={24} />;
  };

  const getWeatherAdvice = () => {
    if (weather.isRainy) {
      return "Indoor activities recommended, or bring an umbrella";
    }
    if (weather.temperature > 30) {
      return "Hot weather! Consider air-conditioned indoor activities";
    }
    if (weather.temperature < 5) {
      return "Cold weather! Indoor activities recommended";
    }
    if (weather.temperature > 20) {
      return "Perfect weather for outdoor activities";
    }
    return "Pleasant weather for both indoor and outdoor activities";
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{location} Current Weather</h3>
          <div className="flex items-center gap-3 mt-2">
            {getWeatherIcon()}
            <div>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-red-500" />
                <span className="text-xl font-bold">{Math.round(weather.temperature)}°C</span>
                <span className="text-gray-600">{weather.condition}</span>
              </div>
              {weather.isRainy && (
                <div className="flex items-center gap-1 text-blue-600 text-sm mt-1">
                  <Umbrella size={14} />
                  <span>Precipitation: {Math.round(weather.precipitation)}mm</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Travel Advice</div>
          <div className="text-sm font-medium text-gray-800 max-w-48">
            {getWeatherAdvice()}
          </div>
        </div>
      </div>
    </div>
  );
};

const getWeatherBasedRecommendations = (
  activities: Activity[], 
  weather: WeatherData,
  preferences: string[] = []
): Activity[] => {
  // Filter activities based on weather
  let weatherAppropriate = activities.filter(activity => {
    if (weather.isRainy && !activity.indoor) {
      return false; // Avoid outdoor activities when raining
    }
    if (weather.temperature < 5 && !activity.indoor) {
      return false; // Avoid outdoor activities when very cold
    }
    return true;
  });

  // Apply preference filtering if preferences exist
  if (preferences.length > 0) {
    weatherAppropriate = weatherAppropriate.filter(activity =>
      activity.categories.some(category => preferences.includes(category))
    );
  }

  // Sort by rating and weather appropriateness
  return weatherAppropriate.sort((a, b) => {
    // Prioritize indoor activities during bad weather
    if (weather.isRainy || weather.temperature < 10) {
      if (a.indoor && !b.indoor) return -1;
      if (!a.indoor && b.indoor) return 1;
    }
    
    // Prioritize outdoor activities during good weather
    if (!weather.isRainy && weather.temperature > 20) {
      if (!a.indoor && b.indoor) return -1;
      if (a.indoor && !b.indoor) return 1;
    }
    
    // Then sort by rating
    return b.rating - a.rating;
  });
};

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, selectedActivities, toggleActivity, preferences, weather, fetchWeatherForCity } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState<boolean>(true);
  
  // Load activities and weather for the selected destination
  useEffect(() => {
    if (!activeDestination) return;
    
    setLoading(true);
    console.log('Loading activities for destination:', activeDestination);
    
    const destination = destinations.find(d => d.id === activeDestination);
    if (!destination) {
      setLoading(false);
      return;
    }

    // Fetch weather data for the destination
    const loadWeatherAndActivities = async () => {
      // Get weather data (either from cache or fetch new)
      let currentWeather = weather[destination.name]?.[0]; // Get first day weather
      if (!currentWeather) {
        await fetchWeatherForCity(destination.name, 7);
        currentWeather = weather[destination.name]?.[0];
      }

      // Get all activities for destination
      const destinationActivities = getMockActivities(activeDestination);
      
      // Apply weather-based filtering if enabled and weather data is available
      let finalActivities: Activity[];
      if (showWeatherRecommendations && currentWeather) {
        finalActivities = getWeatherBasedRecommendations(destinationActivities, currentWeather, preferences);
      } else {
        // Apply only preference filtering
        finalActivities = preferences.length > 0 
          ? destinationActivities.filter(activity =>
              activity.categories.some(category => preferences.includes(category))
            )
          : destinationActivities;
      }
      
      setActivities(finalActivities);
      setLoading(false);
    };

    loadWeatherAndActivities();
    
  }, [activeDestination, preferences, showWeatherRecommendations, destinations, fetchWeatherForCity, weather]);
  
  // If no destinations are available, redirect to destinations page
  useEffect(() => {
    if (destinations.length === 0) {
      console.log('No destinations found, redirecting to destinations page');
      navigate('/destinations');
    }
  }, [destinations, navigate]);
  
  // Check if an activity is selected
  const isActivitySelected = (destinationId: string, activityId: string): boolean => {
    return selectedActivities[destinationId]?.some(a => a.id === activityId) || false;
  };
  
  // Format duration in hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };
  
  // Get the current destination object
  const currentDestination = destinations.find(d => d.id === activeDestination);
  const currentWeather = currentDestination ? weather[currentDestination.name]?.[0] : null;
  
  if (destinations.length === 0) {
    return null; // Redirect handled by useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Activities</h1>
      
      {/* Destination Tabs */}
      <div className="mb-8">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => setActiveDestination(destination.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
                activeDestination === destination.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <MapPin size={16} className="mr-1" />
              {destination.name}
              {selectedActivities[destination.id]?.length > 0 && (
                <span className="ml-2 bg-white text-teal-600 text-xs rounded-full px-2 py-0.5">
                  {selectedActivities[destination.id].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Weather Information */}
      {currentDestination && currentWeather && (
        <WeatherCard 
          weather={currentWeather} 
          location={`${currentDestination.name}, ${currentDestination.country}`}
        />
      )}
      
      {/* Weather Recommendations Toggle */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <div>
          <h3 className="font-medium text-gray-800">Smart Weather Recommendations</h3>
          <p className="text-sm text-gray-600">Filter activities based on real-time weather conditions</p>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showWeatherRecommendations}
            onChange={(e) => setShowWeatherRecommendations(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Enable Weather Filtering</span>
        </label>
      </div>
      
      {/* Current Destination Info */}
      {currentDestination && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentDestination.name}, {currentDestination.country}</h2>
              <p className="mt-1">Duration: {currentDestination.days} {currentDestination.days === 1 ? 'day' : 'days'}</p>
              {currentWeather && (
                <p className="mt-1 text-sm opacity-90">
                  {showWeatherRecommendations ? 'Activities optimized for current weather' : 'Showing all activities'}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 rounded-md px-4 py-2">
                <p className="text-sm">Selected activities: {selectedActivities[currentDestination.id]?.length || 0}</p>
                <p className="text-sm mt-1">Recommended: 2-4 activities per day</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Activities List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities and weather...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
                isActivitySelected(activeDestination!, activity.id) ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <div 
                className="h-48 bg-center bg-cover relative"
                style={{ backgroundImage: `url(${activity.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-white font-semibold text-lg">{activity.name}</h3>
                  {activity.indoor && currentWeather?.isRainy && (
                    <div className="mt-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                      ☂️ Perfect for rainy weather
                    </div>
                  )}
                  {!activity.indoor && currentWeather && !currentWeather.isRainy && currentWeather.temperature > 15 && (
                    <div className="mt-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                      ☀️ Great weather activity
                    </div>
                  )}
                </div>
                {isActivitySelected(activeDestination!, activity.id) && (
                  <div className="absolute top-2 right-2 bg-teal-500 text-white p-1 rounded-full">
                    <Check size={20} />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2 h-10">{activity.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    <Clock size={14} className="mr-1" />
                    {formatDuration(activity.duration)}
                  </div>
                  
                  <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                    <Star size={14} className="mr-1" />
                    {activity.rating.toFixed(1)}
                  </div>
                  
                  {activity.price && activity.price.amount > 0 && (
                    <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      <DollarSign size={14} className="mr-1" />
                      {activity.price.amount} {activity.price.currencyCode}
                    </div>
                  )}
                  
                  <div className={`text-xs px-2 py-1 rounded ${
                    activity.indoor ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {activity.indoor ? 'Indoor' : 'Outdoor'}
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => toggleActivity(activeDestination!, activity)}
                    className={`w-full py-2 rounded-md transition-colors ${
                      isActivitySelected(activeDestination!, activity.id)
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    {isActivitySelected(activeDestination!, activity.id) ? 'Remove from Trip' : 'Add to Trip'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activities.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {showWeatherRecommendations 
              ? 'No activities match current weather conditions and preferences. Try disabling weather recommendations.'
              : 'No activities available for this destination.'
            }
          </p>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/destinations')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Destinations
        </button>
        
        <button
          onClick={() => navigate('/itinerary')}
          className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
        >
          Continue to Itinerary
        </button>
      </div>
    </div>
  );
};

export default ActivitiesPage;