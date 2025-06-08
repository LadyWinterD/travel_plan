// src/pages/ActivitiesPage.tsx - 最终完整修正版 v2 (保留你的布局)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';

// 你的 WeatherCard 组件，现在它的数据源将是正确的
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
  // 1. 【修正】从 Context 获取正确的 state 和函数
  const { 
    destinations, 
    selectedActivities, 
    toggleActivity, 
    preferences,
    weather, // 使用 'weather' 而不是 'weatherData'
    isWeatherLoading,
    fetchWeatherForCity 
  } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState<boolean>(true);
  
  // 2. 【修正】useEffect 的逻辑现在是干净和正确的
  useEffect(() => {
    if (!activeDestination) return;

    const destination = destinations.find(d => d.id === activeDestination);
    
    // 当城市改变时，调用中央方法获取真实天气 (获取未来7天预报)
    if (destination?.name) {
      fetchWeatherForCity(destination.name, 7);
    }
  }, [activeDestination, destinations, fetchWeatherForCity]); // 这个 useEffect 只负责触发天气获取

  // 这个新的 useEffect 负责在天气或推荐选项变化时，更新活动列表
  useEffect(() => {
    if (!activeDestination) return;

    setLoadingActivities(true);

    const destination = destinations.find(d => d.id === activeDestination);
    const allDestinationActivities = getMockActivities(activeDestination);
    
    // 从中央 'weather' state 中获取当前城市的真实天气数据数组
    const cityForecast = destination ? weather[destination.name] : null;
    // 我们用预报的第一天作为当前天气来做推荐
    const currentDayWeather = cityForecast?.[0]; 

    let finalActivities = allDestinationActivities;

    if (currentDayWeather && showWeatherRecommendations) {
      // 使用真实天气数据来过滤和推荐活动
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, [currentDayWeather], preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
    
  }, [activeDestination, preferences, showWeatherRecommendations, weather]); // 依赖 'weather' 对象的变化
  
  // 重定向逻辑
  useEffect(() => { if (destinations.length === 0) navigate('/destinations'); }, [destinations, navigate]);

  // 辅助函数
  const isActivitySelected = (activityId: string): boolean => { return activeDestination ? selectedActivities[activeDestination]?.some(a => a.id === activityId) || false : false; };
  const formatDuration = (minutes: number): string => { const h = Math.floor(minutes / 60); const m = minutes % 60; return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m'; };
  
  const currentDestination = destinations.find(d => d.id === activeDestination);
  // 3. 【修正】这里也从中央 'weather' state 获取数据
  const currentCityWeather = currentDestination ? weather[currentDestination.name]?.[0] : null;

  if (!currentDestination) { return <div className="p-8 text-center">Please select a destination to see activities.</div>; }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 你的所有 JSX 布局都保持原样 */}
      <h1 className="text-3xl font-bold mb-8 text-center">Select Activities</h1>
      
      <div className="mb-8">
        <div className="flex overflow-x-auto pb-2 space-x-2">
            {/* ... Destination Tabs JSX ... */}
        </div>
      </div>
      
      {/* 4. 【修正】WeatherCard 现在总是接收到真实数据（如果存在） */}
      {isWeatherLoading && <div className="text-center p-4">Loading Weather...</div>}
      {currentDestination && currentCityWeather && (
        <WeatherCard 
          weather={currentCityWeather} 
          location={`${currentDestination.name}, ${currentDestination.country}`}
        />
      )}
      
      {/* ... Weather Recommendations Toggle JSX ... */}
      {/* ... Current Destination Info Banner JSX ... */}
      
      {loadingActivities ? (
        <div className="text-center py-12">Loading activities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className={`...`}>
              {/* ... 你的 Activity Card JSX 保持不变 ... */}
              {/* 它内部的天气徽章逻辑现在也会使用正确的 currentCityWeather */}
              {!activity.indoor && currentCityWeather && !currentCityWeather.isRainy && currentCityWeather.temperature > 15 && (
                <div className="mt-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                  ☀️ Perfect Weather Activity
                </div>
              )}
              {/* ... */}
            </div>
          ))}
        </div>
      )}

      {/* ... No activities & Navigation Buttons JSX ... */}
    </div>
  );
};

export default ActivitiesPage;