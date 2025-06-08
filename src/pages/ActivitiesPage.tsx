import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';

const WeatherCard: React.FC<{ weather: WeatherData; location: string }> = ({ weather, location }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500\" size={24} />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" size={24} />;
    return <Cloud className="text-gray-500" size={24} />;
  };

  const getWeatherAdvice = () => {
    if (weather.isRainy) return "Recommended: Indoor activities or bring rain gear";
    if (weather.temperature > 30) return "Hot weather: Consider air-conditioned indoor activities";
    if (weather.temperature < 5) return "Cold weather: Indoor activities recommended for warmth";
    if (weather.temperature > 20) return "Perfect weather for outdoor activities";
    return "Moderate weather: Both indoor and outdoor activities are great";
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{location} Today's Weather</h3>
          <div className="flex items-center gap-3 mt-2">
            {getWeatherIcon()}
            <div>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-red-500" />
                <span className="text-xl font-bold">{Math.round(weather.temperature)}°C</span>
                <span className="text-gray-600">{weather.condition}</span>
              </div>
              {weather.isRainy && weather.precipitation != null && (
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

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    destinations, 
    selectedActivities, 
    toggleActivity, 
    preferences,
    weatherData,
    forecasts,
    fetchForecastForCity 
  } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState<boolean>(true);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (!activeDestination) return;

    const destination = destinations.find(d => d.id === activeDestination);
    
    if (destination?.name) {
      setIsWeatherLoading(true);
      fetchForecastForCity(destination.name, 7).finally(() => {
        setIsWeatherLoading(false);
      });
    }
  }, [activeDestination, destinations, fetchForecastForCity]);

  useEffect(() => {
    if (!activeDestination) return;

    setLoadingActivities(true);

    const destination = destinations.find(d => d.id === activeDestination);
    const allDestinationActivities = getMockActivities(activeDestination);
    
    const cityForecast = destination ? forecasts[destination.name] : null;
    const currentDayWeather = cityForecast?.[0]; 

    let finalActivities = allDestinationActivities;

    if (currentDayWeather && showWeatherRecommendations) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, currentDayWeather, preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
    
  }, [activeDestination, preferences, showWeatherRecommendations, forecasts]);
  
  useEffect(() => { 
    if (destinations.length === 0) navigate('/destinations'); 
  }, [destinations, navigate]);

  const isActivitySelected = (activityId: string): boolean => { 
    return activeDestination ? selectedActivities[activeDestination]?.some(a => a.id === activityId) || false : false; 
  };
  
  const formatDuration = (minutes: number): string => { 
    const h = Math.floor(minutes / 60); 
    const m = minutes % 60; 
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m'; 
  };
  
  const currentDestination = destinations.find(d => d.id === activeDestination);
  const currentCityWeather = currentDestination ? forecasts[currentDestination.name]?.[0] : null;

  if (!currentDestination) { 
    return <div className="p-8 text-center">Please select a destination to see activities.</div>; 
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Activities</h1>
      
      <div className="mb-8">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => setActiveDestination(destination.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeDestination === destination.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {destination.name}
            </button>
          ))}
        </div>
      </div>
      
      {isWeatherLoading && <div className="text-center p-4">Loading Weather...</div>}
      {currentDestination && currentCityWeather && (
        <WeatherCard 
          weather={currentCityWeather} 
          location={`${currentDestination.name}, ${currentDestination.country}`}
        />
      )}
      
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showWeatherRecommendations}
            onChange={(e) => setShowWeatherRecommendations(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Show weather-based recommendations</span>
        </label>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-blue-800">
            {currentDestination.name}, {currentDestination.country}
          </h2>
        </div>
        <p className="text-blue-700 text-sm">
          Duration: {currentDestination.days} day{currentDestination.days > 1 ? 's' : ''} • 
          Selected Activities: {selectedActivities[currentDestination.id]?.length || 0}
        </p>
      </div>
      
      {loadingActivities ? (
        <div className="text-center py-12">Loading activities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                isActivitySelected(activity.id) 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={activity.image} 
                alt={activity.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">
                    {activity.name}
                  </h3>
                  <button
                    onClick={() => toggleActivity(activeDestination!, activity)}
                    className={`ml-2 p-2 rounded-full transition-colors ${
                      isActivitySelected(activity.id)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Check size={16} />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span>{activity.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>
                      {activity.price.amount === 0 
                        ? 'Free' 
                        : `${activity.price.amount} ${activity.price.currencyCode}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {activity.categories.map((category) => (
                    <span 
                      key={category}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    activity.indoor 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {activity.indoor ? '🏢 Indoor' : '🌳 Outdoor'}
                  </span>
                  
                  {!activity.indoor && currentCityWeather && !currentCityWeather.isRainy && currentCityWeather.temperature > 15 && (
                    <div className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                      ☀️ Perfect Weather Activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length === 0 && !loadingActivities && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No activities found for your current preferences.</p>
          <button
            onClick={() => setShowWeatherRecommendations(false)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Show all activities
          </button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate('/destinations')}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Destinations
        </button>
        <button
          onClick={() => navigate('/itinerary')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={Object.values(selectedActivities).every(acts => acts.length === 0)}
        >
          View Itinerary
        </button>
      </div>
    </div>
  );
};

export default ActivitiesPage;