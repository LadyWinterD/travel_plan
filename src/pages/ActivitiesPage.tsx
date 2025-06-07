import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    destinations,
    selectedActivities,
    toggleActivity,
    preferences,
    weather,
    isWeatherLoading,
    fetchWeatherForCity
  } = useAppContext();

  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState<boolean>(true);

  // 主 useEffect，用于获取活动和天气
  useEffect(() => {
    if (!activeDestination) return;

    const destination = destinations.find(d => d.id === activeDestination);
    
    if (destination?.name) {
      fetchWeatherForCity(destination.name);
    }

    setLoadingActivities(true);
    
    const allDestinationActivities = getMockActivities(activeDestination);
    const currentCityWeather = destination ? weather[destination.name] : null;
    
    let finalActivities = allDestinationActivities;

    if (currentCityWeather && showWeatherRecommendations) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, currentCityWeather, preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity =>
        activity.categories.some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
    
  }, [activeDestination, preferences, showWeatherRecommendations, destinations, fetchWeatherForCity, weather]);
  
  // 重定向逻辑
  useEffect(() => {
    if (destinations.length === 0) {
      navigate('/destinations');
    }
  }, [destinations, navigate]);

  // 辅助函数
  const isActivitySelected = (destinationId: string, activityId: string): boolean => {
    return selectedActivities[destinationId]?.some(a => a.id === activityId) || false;
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };
  
  const currentDestination = destinations.find(d => d.id === activeDestination);
  // **关键修正**：我们在这里获取当前城市的天气，并把它传递给下面的渲染逻辑
  const currentCityWeather = currentDestination ? weather[currentDestination.name] : null;

  if (destinations.length === 0) return null;
  
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
              className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center transition-colors ${
                activeDestination === destination.id
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <MapPin size={16} className="mr-2" />
              {destination.name}
              {selectedActivities[destination.id]?.length > 0 && (
                <span className="ml-2 bg-white text-teal-600 text-xs font-semibold rounded-full px-2 py-0.5">
                  {selectedActivities[destination.id].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 天气推荐开关 */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <div>
          <h3 className="font-medium text-gray-800">Smart Weather Recommendations</h3>
          <p className="text-sm text-gray-600">Filter activities based on real-time weather conditions.</p>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showWeatherRecommendations}
            onChange={(e) => setShowWeatherRecommendations(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
        </label>
      </div>
      
      {/* 活动列表 */}
      {loadingActivities || isWeatherLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
                isActivitySelected(activeDestination!, activity.id) ? 'ring-2 ring-teal-500' : 'ring-1 ring-gray-200'
              }`}
            >
              <div 
                className="h-48 bg-center bg-cover relative"
                style={{ backgroundImage: `url(${activity.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-white font-semibold text-lg">{activity.name}</h3>
                  {/* **关键修正**：在这里使用 `currentCityWeather` 而不是不存在的 `weatherData` */}
                  {activity.indoor && currentCityWeather?.isRainy && (
                    <div className="mt-1 text-xs bg-green-500 text-white px-2 py-1 rounded">
                      ☂️ Rainy Day Recommended
                    </div>
                  )}
                  {!activity.indoor && currentCityWeather && !currentCityWeather.isRainy && currentCityWeather.temperature > 15 && (
                    <div className="mt-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                      ☀️ Perfect Weather Activity
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
                <p className="text-gray-600 text-sm line-clamp-2 h-10 mt-1">{activity.description}</p>
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
                    className={`w-full py-2 rounded-md font-semibold transition-colors ${
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
      
      {activities.length === 0 && !loadingActivities && !isWeatherLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No activities match your criteria. Try changing your preferences or disabling weather recommendations.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
          <button onClick={() => navigate('/destinations')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Back to Destinations
          </button>
          <button onClick={() => navigate('/itinerary')} className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors">
            Continue to Itinerary
          </button>
      </div>
    </div>
  );
};

export default ActivitiesPage;