import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';
import WeatherDisplay from '../components/WeatherDisplay'; 


const WeatherCard: React.FC<{ weather: WeatherData; location: string }> = ({ weather, location }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" size={24} />;
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
 
              {weather.isRainy && weather.precipitation && (
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


// 主要页面组件
const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  // 从中央 Context 获取所有需要的数据和方法
  const { 
    destinations, 
    selectedActivities, 
    toggleActivity, 
    preferences,
    weather, // 中央天气数据
    isWeatherLoading, // 中央加载状态
    fetchWeatherForCity // 中央获取天气的方法
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
    
    // 当城市改变时，调用中央方法获取真实天气
    if (destination?.name) {
      fetchWeatherForCity(destination.name);
    }

    setLoadingActivities(true);
    
    const allDestinationActivities = getMockActivities(activeDestination);
    
    // 从中央 weather state 中获取当前城市的真实天气
    const currentCityWeather = destination ? weather[destination.name] : null;
    
    let finalActivities = allDestinationActivities;

    // 如果真实天气存在，并且用户开启了天气推荐，则使用真实天气来过滤活动
    if (currentCityWeather && showWeatherRecommendations) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, currentCityWeather, preferences);
    } else if (preferences.length > 0) {
      // 否则，只根据用户偏好来过滤
      finalActivities = allDestinationActivities.filter(activity =>
        activity.categories.some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
    
  }, [activeDestination, preferences, showWeatherRecommendations, destinations, fetchWeatherForCity, weather]);
  
  // 如果没有选择目的地，则重定向
  useEffect(() => {
    if (destinations.length === 0) {
      navigate('/destinations');
    }
  }, [destinations, navigate]);

  // 其他辅助函数
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
  // 再次从中央 state 获取当前城市天气，用于传递给子组件
  const currentCityWeather = currentDestination ? weather[currentDestination.name] : null;

  if (destinations.length === 0) {
    return null; // 重定向中...
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
      
      {/* 真实天气组件，现在它也应该从 Context 中获取数据 */}
      {/* 为了简化，我们直接在这里显示天气信息，而不是用两个组件 */}
      
      {isWeatherLoading && <div className="text-center p-4">Loading weather...</div>}
      
      {currentDestination && currentCityWeather && (
        <WeatherCard 
          weather={currentCityWeather}
          location={`${currentDestination.name}, ${currentDestination.country}`}
        />
      )}
      
      {/* Weather Recommendations Toggle */}
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
      
      {/* Activities List */}
      {loadingActivities ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
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
                {/* ... (内部的 badge 和 checkmark JSX 保持不变) ... */}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900">{activity.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 h-10 mt-1">{activity.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* ... (内部的 duration, rating, price 等 JSX 保持不变) ... */}
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
      
      {activities.length === 0 && !loadingActivities && (
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