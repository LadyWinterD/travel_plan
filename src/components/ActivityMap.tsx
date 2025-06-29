import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { Activity, WeatherData } from '../types';
import { Clock, Star, DollarSign, MapPin, Thermometer } from 'lucide-react';
import { activityCategoryLabels } from '../data/activityCategories';
import { getFallbackImageUrl } from '../services/openTripMapApi';

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons for different activity types
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41]
});

// Default Leaflet icon fix
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icon colors for different activity categories
const categoryIcons = {
  museums_arts: createCustomIcon('#8B5CF6'),
  historical_sites: createCustomIcon('#F59E0B'),
  religious_sites: createCustomIcon('#3B82F6'),
  castles_palaces: createCustomIcon('#EF4444'),
  architectural_landmarks: createCustomIcon('#6B7280'),
  natural_landscapes: createCustomIcon('#10B981'),
  parks_gardens: createCustomIcon('#22C55E'),
  outdoor_sports: createCustomIcon('#F97316'),
  city_centers: createCustomIcon('#6366F1'),
  viewpoints_towers: createCustomIcon('#EC4899'),
  theme_parks_zoos: createCustomIcon('#84CC16'),
  nightlife: createCustomIcon('#7C3AED'),
  shows_cinema: createCustomIcon('#DC2626'),
  shopping: createCustomIcon('#059669'),
  interesting_places: createCustomIcon('#14B8A6'),
  food_dining: createCustomIcon('#D97706')
};

interface ActivityMapProps {
  activities: Activity[];
  selectedActivities: Activity[];
  onActivityToggle: (activity: Activity) => void;
  onActivityClick: (activity: Activity) => void;
  centerCoordinates?: { lat: number; lng: number };
  weather?: WeatherData;
  location?: string;
}

// Component to fit map bounds to markers
const FitBounds: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const map = useMap();

  useEffect(() => {
    if (activities.length === 0) return;

    const validActivities = activities.filter(activity => 
      activity.location && 
      typeof activity.location.lat === 'number' && 
      typeof activity.location.lng === 'number'
    );

    if (validActivities.length === 0) return;

    if (validActivities.length === 1) {
      // Single marker - center on it
      const activity = validActivities[0];
      map.setView([activity.location!.lat, activity.location!.lng], 14);
    } else {
      // Multiple markers - fit bounds
      const bounds = new LatLngBounds(
        validActivities.map(activity => [activity.location!.lat, activity.location!.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [activities, map]);

  return null;
};

// Activity popup component
const ActivityPopup: React.FC<{
  activity: Activity;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
  weather?: WeatherData;
}> = ({ activity, isSelected, onToggle, onClick, weather }) => {
  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m';
  };

  const formatPrice = () => {
    if (!activity.price || activity.price.amount === 0) return 'Free';
    return `$${activity.price.amount}`;
  };

  return (
    <div className="map-popup">
      {/* Activity Image */}
      <div className="mb-3">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-32 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getFallbackImageUrl(activity.categories);
          }}
        />
      </div>

      {/* Activity Info */}
      <h3>{activity.name}</h3>
      <p className="line-clamp-2">{activity.description}</p>

      {/* Stats */}
      <div className="popup-stats">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatDuration(activity.duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" />
          <span>{activity.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={12} />
          <span className={activity.price?.amount === 0 ? 'text-green-600 font-bold' : ''}>
            {formatPrice()}
          </span>
        </div>
      </div>

      {/* Weather info */}
      {weather && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Thermometer size={12} />
          <span>{Math.round(weather.temperature)}°C, {weather.condition}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mb-3">
        {activity.categories.slice(0, 2).map((category) => (
          <span 
            key={category}
            className="px-2 py-1 text-xs rounded-full font-medium bg-teal-100 text-teal-800"
          >
            {activityCategoryLabels[category] || category}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {isSelected ? '✓ Added' : 'Add to Trip'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Details
        </button>
      </div>
    </div>
  );
};

const ActivityMap: React.FC<ActivityMapProps> = ({
  activities,
  selectedActivities,
  onActivityToggle,
  onActivityClick,
  centerCoordinates,
  weather,
  location
}) => {
  // Filter activities with valid coordinates
  const validActivities = useMemo(() => {
    return activities.filter(activity => 
      activity.location && 
      typeof activity.location.lat === 'number' && 
      typeof activity.location.lng === 'number' &&
      !isNaN(activity.location.lat) &&
      !isNaN(activity.location.lng)
    );
  }, [activities]);

  // Default center (fallback to London if no coordinates provided)
  const defaultCenter = centerCoordinates || { lat: 51.505, lng: -0.09 };

  if (validActivities.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No activities with location data found</p>
          <p className="text-sm text-gray-500">Activities need coordinate information to be displayed on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 sm:h-[500px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds activities={validActivities} />
        
        {validActivities.map((activity) => {
          const isSelected = selectedActivities.some(selected => selected.id === activity.id);
          const primaryCategory = activity.categories[0] || 'interesting_places';
          const icon = categoryIcons[primaryCategory] || defaultIcon;
          
          return (
            <Marker
              key={activity.id}
              position={[activity.location!.lat, activity.location!.lng]}
              icon={icon}
            >
              <Popup
                closeButton={true}
                className="activity-popup"
                maxWidth={280}
                minWidth={250}
              >
                <ActivityPopup
                  activity={activity}
                  isSelected={isSelected}
                  onToggle={() => onActivityToggle(activity)}
                  onClick={() => onActivityClick(activity)}
                  weather={weather}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ActivityMap;