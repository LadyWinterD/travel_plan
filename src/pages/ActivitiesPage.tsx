import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, Check, MapPin, Cloud, Sun, CloudRain, Umbrella, Thermometer, Users, Filter } from 'lucide-react';
import { getMockActivities, getWeatherBasedRecommendations } from '../utils/mockData';

// Interest categories for filtering
const interestCategories = [
  'Museums',
  'Outdoor', 
  'Food & Dining',
  'Shopping',
  'History',
  'Nightlife',
  'Adventure'
];

// Budget options
const budgetOptions = [
  { id: 'economic', label: 'Economic', icon: '💲', range: [0, 25] },
  { id: 'standard', label: 'Standard', icon: '💲💲', range: [25, 75] },
  { id: 'luxury', label: 'Luxury', icon: '💲💲💲', range: [75, 999] }
];

// Traveler options
const travelerOptions = [
  { id: 'solo', label: 'Solo Traveler' },
  { id: 'couple', label: 'Couple / Duo' },
  { id: 'group', label: 'Group (3+)' }
];

const WeatherForecastCard: React.FC<{ weather: WeatherData; location: string }> = ({ weather, location }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500\" size={32} />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" size={32} />;
    return <Cloud className="text-gray-500" size={32} />;
  };

  const getWeatherAdvice = () => {
    if (weather.isRainy) return "Great weather for indoor activities";
    if (weather.temperature > 30) return "Perfect for air-conditioned venues";
    if (weather.temperature < 5) return "Indoor activities recommended";
    if (weather.temperature > 20) return "Ideal weather for outdoor adventures";
    return "Good weather for both indoor and outdoor activities";
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 mb-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getWeatherIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{location}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Thermometer size={16} className="text-red-500" />
                <span className="text-2xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</span>
              </div>
              <span className="text-gray-600">{weather.condition}</span>
              {weather.isRainy && weather.precipitation != null && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Umbrella size={14} />
                  <span className="text-sm">{Math.round(weather.precipitation)}mm</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Weather Recommendation</div>
          <div className="text-sm font-medium text-gray-800 max-w-48">
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
  weather?: WeatherData;
}> = ({ activity, isSelected, onToggle, weather }) => {
  
  const getWeatherBadge = () => {
    if (!weather) return null;
    
    if (!activity.indoor && !weather.isRainy && weather.temperature > 15) {
      return (
        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          ☀️ Perfect Weather Activity
        </div>
      );
    }
    
    if (activity.indoor && weather.isRainy) {
      return (
        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          ☂️ Rainy Day Recommended
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
    return `${activity.price.amount} ${activity.price.currencyCode}`;
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isSelected 
          ? 'border-teal-500 ring-2 ring-teal-200 transform scale-105' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      {/* Weather Badge */}
      {getWeatherBadge()}
      
      {/* Activity Image */}
      <div 
        className="h-48 bg-center bg-cover relative"
        style={{ backgroundImage: `url(${activity.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Add to Trip Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`absolute bottom-3 right-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isSelected
              ? 'bg-teal-500 text-white shadow-lg'
              : 'bg-white/90 text-gray-800 hover:bg-white'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center gap-2">
              <Check size={16} />
              Added
            </span>
          ) : (
            'Add to Trip'
          )}
        </button>
      </div>
      
      {/* Activity Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {activity.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {activity.description}
        </p>
        
        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
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
            <span>{formatPrice()}</span>
          </div>
        </div>
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {activity.categories.slice(0, 3).map((category) => (
            <span 
              key={category}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {category}
            </span>
          ))}
          {activity.categories.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{activity.categories.length - 3}
            </span>
          )}
        </div>
        
        {/* Indoor/Outdoor Badge */}
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${
            activity.indoor 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {activity.indoor ? '🏢 Indoor' : '🌳 Outdoor'}
          </span>
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
    fetchWeatherForCity
  } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [smartWeatherFiltering, setSmartWeatherFiltering] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  
  // Filter states
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>('standard');
  const [selectedTravelerType, setSelectedTravelerType] = useState<string>('couple');
  const [showGroupActivitiesOnly, setShowGroupActivitiesOnly] = useState<boolean>(false);
  
  // Fetch real weather data when destination changes
  useEffect(() => {
    if (!activeDestination) return;

    const destination = destinations.find(d => d.id === activeDestination);
    if (destination?.name) {
      setIsWeatherLoading(true);
      fetchWeatherForCity(destination.name)
        .then((weather) => {
          if (weather) {
            setWeatherData(weather);
          }
        })
        .finally(() => {
          setIsWeatherLoading(false);
        });
    }
  }, [activeDestination, destinations, fetchWeatherForCity]);

  // Load and filter activities
  useEffect(() => {
    if (!activeDestination) return;

    setLoadingActivities(true);

    const destination = destinations.find(d => d.id === activeDestination);
    let allDestinationActivities = getMockActivities(activeDestination);
    
    // Apply interest category filters
    if (selectedInterests.length > 0) {
      allDestinationActivities = allDestinationActivities.filter(activity =>
        activity.categories.some(category => selectedInterests.includes(category))
      );
    }
    
    // Apply budget filters
    const budgetRange = budgetOptions.find(b => b.id === selectedBudget)?.range || [0, 999];
    allDestinationActivities = allDestinationActivities.filter(activity => {
      const price = activity.price?.amount || 0;
      return price >= budgetRange[0] && price <= budgetRange[1];
    });
    
    // Apply group activity filter
    if (showGroupActivitiesOnly) {
      // Filter for activities suitable for groups (this is a mock implementation)
      allDestinationActivities = allDestinationActivities.filter(activity =>
        activity.categories.includes('Adventure') || 
        activity.categories.includes('Food & Dining') ||
        activity.categories.includes('Entertainment') ||
        activity.categories.includes('Cultural')
      );
    }
    
    let finalActivities = allDestinationActivities;

    // Apply weather-based filtering if enabled and weather data is available
    if (smartWeatherFiltering && weatherData) {
      finalActivities = getWeatherBasedRecommendations(allDestinationActivities, weatherData, preferences);
    } else if (preferences.length > 0) {
      finalActivities = allDestinationActivities.filter(activity =>
        (activity.categories || []).some(category => preferences.includes(category))
      );
    }
    
    setActivities(finalActivities);
    setLoadingActivities(false);
  }, [activeDestination, preferences, smartWeatherFiltering, weatherData, selectedInterests, selectedBudget, selectedTravelerType, showGroupActivitiesOnly, destinations]);
  
  // Redirect if no destinations
  useEffect(() => { 
    if (destinations.length === 0) navigate('/destinations'); 
  }, [destinations, navigate]);

  const isActivitySelected = (activityId: string): boolean => { 
    return activeDestination ? selectedActivities[activeDestination]?.some(a => a.id === activityId) || false : false; 
  };
  
  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell Us Your Interests</h1>
        <p className="text-gray-600">Select activities that match your travel style and preferences</p>
      </div>
      
      {/* Destination Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              onClick={() => setActiveDestination(destination.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeDestination === destination.id
                  ? 'bg-teal-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
      
      {/* Filter Sections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={20} className="text-teal-600" />
          <h2 className="text-xl font-semibold text-gray-900">Customize Your Experience</h2>
        </div>
        
        {/* Section A: Interest Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interest Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {interestCategories.map((interest) => (
              <label
                key={interest}
                className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
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
                <span className="text-sm font-medium text-center">{interest}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Section B: Daily Budget Per Person */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Budget Per Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgetOptions.map((budget) => (
              <button
                key={budget.id}
                onClick={() => setSelectedBudget(budget.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedBudget === budget.id
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-2xl">{budget.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{budget.label}</div>
                  <div className="text-sm opacity-75">
                    ${budget.range[0]}-{budget.range[1] === 999 ? '200+' : budget.range[1]} per day
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Section C: Traveler Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traveler Information</h3>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Number of Travelers Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Travelers
              </label>
              <div className="relative">
                <select
                  value={selectedTravelerType}
                  onChange={(e) => setSelectedTravelerType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                >
                  {travelerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Users size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Group Activities Checkbox */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showGroupActivitiesOnly}
                  onChange={(e) => setShowGroupActivitiesOnly(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Show group activities only</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weather Forecast Card */}
      {isWeatherLoading && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading weather data...</p>
        </div>
      )}
      
      {weatherData && !isWeatherLoading && (
        <WeatherForecastCard 
          weather={weatherData} 
          location={`${currentDestination.name}, ${currentDestination.country}`}
        />
      )}
      
      {/* Smart Recommendations Toggle */}
      <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Smart Weather Filtering</h3>
            <p className="text-sm text-gray-600">Show activities optimized for current weather conditions</p>
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
      
      {/* Activity Cards Grid */}
      {loadingActivities ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading activities...</p>
        </div>
      ) : (
        <>
          {/* Selected Activities Summary */}
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-teal-600" size={20} />
              <h2 className="text-lg font-semibold text-teal-800">
                {currentDestination.name}, {currentDestination.country}
              </h2>
            </div>
            <p className="text-teal-700 text-sm">
              Duration: {currentDestination.days} day{currentDestination.days > 1 ? 's' : ''} • 
              Selected Activities: {selectedActivities[currentDestination.id]?.length || 0} • 
              Available Activities: {activities.length}
              {selectedInterests.length > 0 && ` • Filtered by: ${selectedInterests.join(', ')}`}
            </p>
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={isActivitySelected(activity.id)}
                onToggle={() => toggleActivity(activeDestination!, activity)}
                weather={weatherData || undefined}
              />
            ))}
          </div>
        </>
      )}

      {/* No Activities Message */}
      {activities.length === 0 && !loadingActivities && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Sun size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500 mb-4">No activities found for your current filters.</p>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedInterests([])}
              className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto"
            >
              Clear interest filters
            </button>
            <button
              onClick={() => setSmartWeatherFiltering(false)}
              className="text-teal-600 hover:text-teal-800 underline font-medium block mx-auto"
            >
              Disable weather filtering
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate('/destinations')}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Destinations
        </button>
        <button
          onClick={() => navigate('/itinerary')}
          className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-lg"
          disabled={Object.values(selectedActivities).every(acts => acts.length === 0)}
        >
          View Itinerary →
        </button>
      </div>
    </div>
  );
};

export default ActivitiesPage;