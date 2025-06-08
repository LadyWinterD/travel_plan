import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity } from '../types';
import { Clock, Star, DollarSign, Check, MapPin } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, selectedActivities, toggleActivity, preferences, weather, isWeatherLoading, fetchWeatherForCity } = useAppContext();
  const [activeDestination, setActiveDestination] = useState<string | null>(destinations.length > 0 ? destinations[0].id : null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [showWeatherRecommendations, setShowWeatherRecommendations] = useState<boolean>(true);

  useEffect(() => {
    if (!activeDestination) return;
    const destination = destinations.find(d => d.id === activeDestination);
    if (destination?.name) {
      // 获取7天天气预报
      fetchWeatherForCity(destination.name, 7);
    }
  }, [activeDestination, destinations, fetchWeatherForCity]);

  useEffect(() => {
    if (!activeDestination) return;
    setLoadingActivities(true);
    const destination = destinations.find(d => d.id === activeDestination);
    const allDestinationActivities = getMockActivities(activeDestination);
    const currentCityWeather = destination ? weather[destination.name] : null;
    let finalActivities = allDestinationActivities;

    if (currentCityWeather && showWeatherRecommendations) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, currentCityWeather, preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity => (activity.categories || []).some(category => preferences.includes(category)));
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
  }, [activeDestination, preferences, showWeatherRecommendations, weather]);

  useEffect(() => { if (destinations.length === 0) { navigate('/destinations'); } }, [destinations, navigate]);

  const isActivitySelected = (activityId: string): boolean => { return activeDestination ? selectedActivities[activeDestination]?.some(a => a.id === activityId) || false : false; };
  const formatDuration = (minutes: number): string => { const h = Math.floor(minutes / 60); const m = minutes % 60; return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m'; };

  const currentDestination = destinations.find(d => d.id === activeDestination);

  if (!currentDestination) { return <div className="text-center p-8">Please select a destination first.</div>; }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... JSX for Destination Tabs, Toggle Switch, etc. ... */}
      <h1 className="text-3xl font-bold mb-8 text-center">Select Activities for {currentDestination.name}</h1>
      {/* ... a-z ... */}
      {loadingActivities || isWeatherLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${isActivitySelected(activity.id) ? 'ring-2 ring-teal-500' : ''}`}>
              {/* ... JSX for activity card ... */}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{activity.name}</h3>
                <button onClick={() => toggleActivity(activeDestination!, activity)} className="w-full mt-4 py-2 bg-teal-500 text-white rounded-md">
                  {isActivitySelected(activity.id) ? 'Remove' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ... JSX for Navigation Buttons ... */}
    </div>
  );
};

export default ActivitiesPage;