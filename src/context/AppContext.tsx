// src/pages/ActivitiesPage.tsx - 最终完整修正版 (包含缺失的 import)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin } from 'lucide-react';
// ▼▼▼▼▼ 就是补上这一行 ▼▼▼▼▼
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

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
    
    // 现在 getMockActivities 函数可以被正确找到了
    const allDestinationActivities = getMockActivities(activeDestination);
    const currentCityWeather = destination ? weather[destination.name] : null;
    
    let finalActivities = allDestinationActivities;

    if (currentCityWeather && showWeatherRecommendations) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, currentCityWeather, preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
    
  }, [activeDestination, preferences, showWeatherRecommendations, destinations, fetchWeatherForCity, weather]);
  
  // ... (文件余下的部分都和上次一样，是正确的，这里为了简洁省略) ...
  // ... 你只需要确保文件顶部的 import 语句是完整的即可 ...

  const isActivitySelected = (destinationId: string, activityId: string): boolean => { /* ... */ };
  const formatDuration = (minutes: number): string => { /* ... */ };
  const currentDestination = destinations.find(d => d.id === activeDestination);
  const currentCityWeather = currentDestination ? weather[currentDestination.name] : null;

  // JSX return 部分也保持不变
  return (
    <div className="container mx-auto px-4 py-8">
        {/* ... */}
    </div>
  );
};

export default ActivitiesPage;