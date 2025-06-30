import React from 'react';
import { Activity, WeatherData } from '../types';
import { X, Clock, Star, DollarSign, MapPin, Calendar, Thermometer, Umbrella, ExternalLink, Globe, Navigation, Heart, Share2, Bookmark } from 'lucide-react';
import { activityCategoryLabels } from '../data/activityCategories';
import { getFallbackImageUrl } from '../services/openTripMapApi';

interface ActivityDetailModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  weather?: WeatherData;
  location?: string;
  isSelected: boolean;
  onToggle: () => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  weather,
  location,
  isSelected,
  onToggle
}) => {
  if (!isOpen) return null;

  if (!activity) {
    console.error('ActivityDetailModal: No activity data provided');
    return null;
  }

  const formatDuration = (minutes: number): string => {
    if (!minutes || isNaN(minutes)) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m';
  };

  const formatPrice = () => {
    if (!activity.price || activity.price.amount === 0) return 'Free';
    return `$${activity.price.amount}`;
  };

  const getWeatherRecommendation = () => {
    if (!weather) return null;
    
    const hasIndoorCategories = activity.categories.some(cat => 
      ['museums_arts', 'shopping', 'shows_cinema', 'food_dining'].includes(cat)
    );
    
    if (weather.isRainy && !hasIndoorCategories) {
      return {
        type: 'warning',
        message: 'Consider bringing rain gear for this outdoor activity',
        icon: '🌧️'
      };
    }
    
    if (!weather.isRainy && weather.temperature > 20 && !hasIndoorCategories) {
      return {
        type: 'good',
        message: 'Perfect weather for outdoor exploration!',
        icon: '☀️'
      };
    }
    
    if (weather.isRainy && hasIndoorCategories) {
      return {
        type: 'good',
        message: 'Great indoor choice for a rainy day',
        icon: '🏢'
      };
    }
    
    return null;
  };

  const weatherRec = getWeatherRecommendation();
  const hasLocationData = activity.location && activity.location.lat && activity.location.lng;
  const hasWikipediaData = activity.wikipediaUrl;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-scale-in">
        
        {/* Hero Section with Improved Layout */}
        <div className="relative">
          {/* Hero Image */}
          <div className="relative h-72 sm:h-96">
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = getFallbackImageUrl(activity.categories);
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Top Bar with Actions */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {/* Price Badge */}
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
                (!activity.price || activity.price.amount === 0) 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-white/90 text-gray-900'
              }`}>
                {formatPrice()}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors">
                  <Bookmark size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Title and Location */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                    {activity.name}
                  </h1>
                  {location && (
                    <div className="flex items-center text-white/90 text-lg mb-4">
                      <MapPin size={18} className="mr-2 flex-shrink-0" />
                      <span>{location}</span>
                    </div>
                  )}
                  
                  {/* Quick Stats Bar */}
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" />
                      <span className="font-semibold">{activity.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatDuration(activity.duration)}</span>
                    </div>
                    {weather && (
                      <div className="flex items-center gap-2">
                        <Thermometer size={16} />
                        <span>{Math.round(weather.temperature)}°C</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section with Better Organization */}
        <div className="max-h-[calc(95vh-24rem)] overflow-y-auto">
          <div className="p-6 sm:p-8">
            
            {/* Weather Alert (if applicable) */}
            {weatherRec && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                weatherRec.type === 'good' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}>
                <span className="text-2xl">{weatherRec.icon}</span>
                <div>
                  <div className="font-semibold">Weather Tip</div>
                  <div className="text-sm">{weatherRec.message}</div>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Description & Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About This Experience</h2>
                  <div className="prose prose-gray max-w-none">
                    {activity.wikipediaExtracts ? (
                      <p className="text-gray-700 leading-relaxed text-base">
                        {activity.wikipediaExtracts.text}
                      </p>
                    ) : (
                      <p className="text-gray-700 leading-relaxed text-base">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">What You'll Experience</h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.categories.map((category) => (
                      <span 
                        key={category}
                        className="px-3 py-2 bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 text-sm rounded-full font-medium border border-teal-200"
                      >
                        {activityCategoryLabels[category] || category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location Details */}
                {activity.address && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Location Details</h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="space-y-1 text-sm">
                        {activity.address.road && activity.address.houseNumber && (
                          <div className="text-gray-900 font-medium">
                            {activity.address.houseNumber} {activity.address.road}
                          </div>
                        )}
                        {activity.address.city && (
                          <div className="text-gray-700">{activity.address.city}</div>
                        )}
                        {activity.address.country && (
                          <div className="text-gray-600">{activity.address.country}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Actions & Info */}
              <div className="space-y-6">
                
                {/* Weather Card */}
                {weather && (
                  <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Thermometer size={18} className="mr-2 text-blue-600" />
                      Weather Forecast
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round(weather.temperature)}°C
                        </span>
                        <span className="text-gray-600">{weather.condition}</span>
                      </div>
                      {weather.isRainy && (
                        <div className="flex items-center text-blue-600">
                          <Umbrella size={14} className="mr-1" />
                          <span className="text-sm">{Math.round(weather.precipitation)}mm expected</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {new Date(weather.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Primary Action */}
                  <button
                    onClick={onToggle}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <Heart size={20} className="fill-current" />
                        Added to Your Trip
                      </span>
                    ) : (
                      'Add to Trip'
                    )}
                  </button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-1 gap-3">
                    {hasLocationData && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${activity.location!.lat},${activity.location!.lng}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                      >
                        <Navigation size={18} />
                        Get Directions
                        <ExternalLink size={14} />
                      </button>
                    )}

                    {hasWikipediaData && (
                      <button
                        onClick={() => {
                          window.open(activity.wikipediaUrl, '_blank');
                        }}
                        className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                      >
                        <Globe size={18} />
                        Learn More
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{formatDuration(activity.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-medium">{activity.rating.toFixed(1)}/5 ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className={`font-medium ${activity.price?.amount === 0 ? 'text-green-600' : ''}`}>
                        {formatPrice()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;