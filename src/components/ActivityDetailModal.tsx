import React from 'react';
import { Activity, WeatherData } from '../types';
import { X, Clock, Star, DollarSign, MapPin, Calendar, Thermometer, Umbrella, ExternalLink, Info, Globe } from 'lucide-react';
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

  // Add error handling for missing activity data
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
    if (!activity.price || activity.price.amount === 0) return 'Free Entry';
    return `$${activity.price.amount} ${activity.price.currencyCode || 'USD'}`;
  };

  const getWeatherRecommendation = () => {
    if (!weather) return null;
    
    if (weather.isRainy && !activity.indoor) {
      return {
        type: 'warning',
        message: 'This outdoor activity may be affected by rain. Consider rescheduling or bringing rain gear.',
        icon: '⚠️'
      };
    }
    
    if (!weather.isRainy && weather.temperature > 20 && !activity.indoor) {
      return {
        type: 'good',
        message: 'Perfect weather for this outdoor activity!',
        icon: '☀️'
      };
    }
    
    if (weather.isRainy && activity.indoor) {
      return {
        type: 'good',
        message: 'Great choice for a rainy day - this indoor activity is perfect!',
        icon: '🏢'
      };
    }
    
    return null;
  };

  const weatherRec = getWeatherRecommendation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header with Image */}
        <div className="relative h-64 sm:h-80">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
          
          {/* Free Badge */}
          {(!activity.price || activity.price.amount === 0) && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              FREE
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          
          {/* Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {activity.name}
            </h2>
            {location && (
              <div className="flex items-center text-white/90 text-sm">
                <MapPin size={16} className="mr-1" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-20rem)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock size={18} className="text-teal-600" />
              </div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">{formatDuration(activity.duration)}</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Star size={18} className="text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600">Rating</div>
              <div className="font-semibold text-gray-900">{activity.rating.toFixed(1)}/5</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <DollarSign size={18} className="text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Price</div>
              <div className={`font-semibold ${activity.price?.amount === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatPrice()}
              </div>
            </div>
          </div>

          {/* Weather Information */}
          {weather && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Thermometer size={18} className="mr-2 text-blue-600" />
                  Weather Information
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-1" />
                  <span>{new Date(weather.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</span>
                  <span className="text-gray-600">{weather.condition}</span>
                  {weather.isRainy && (
                    <div className="flex items-center text-blue-600">
                      <Umbrella size={14} className="mr-1" />
                      <span className="text-sm">{Math.round(weather.precipitation)}mm</span>
                    </div>
                  )}
                </div>
              </div>
              
              {weatherRec && (
                <div className={`mt-3 p-3 rounded-md flex items-start ${
                  weatherRec.type === 'good' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <span className="mr-2 text-lg">{weatherRec.icon}</span>
                  <span className="text-sm">{weatherRec.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Description - ENHANCED: Show Wikipedia content directly without "About This Activity" title */}
          <div className="mb-6">
            {/* Show Wikipedia content if available, otherwise show basic description */}
            {activity.wikipediaExtracts ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {activity.wikipediaExtracts.text}
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {activity.description}
                </p>
              </div>
            )}
          </div>

          {/* Address Information */}
          {activity.address && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin size={18} className="mr-2 text-gray-600" />
                Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
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

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {activity.categories.map((category) => (
                <span 
                  key={category}
                  className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full font-medium"
                >
                  {activityCategoryLabels[category] || category}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Type */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Activity Type</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Type</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  activity.indoor 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {activity.indoor ? '🏢 Indoor Activity' : '🌳 Outdoor Activity'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onToggle}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {isSelected ? '✓ Added to Trip' : 'Add to Trip'}
            </button>
            
            {activity.location && (
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${activity.location!.lat},${activity.location!.lng}`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={18} />
                <span className="hidden sm:inline">View on Map</span>
              </button>
            )}
            
            {activity.wikipediaUrl && (
              <button
                onClick={() => {
                  window.open(activity.wikipediaUrl, '_blank');
                }}
                className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Globe size={18} />
                <span className="hidden sm:inline">Wikipedia</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal;