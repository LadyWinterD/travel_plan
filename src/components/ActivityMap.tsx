import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, DomEvent } from 'leaflet';
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

// Icon colors for different activity categories - matching category button colors
const categoryIcons = {
  museums_arts: createCustomIcon('#8B5CF6'), // purple-500
  historical_sites: createCustomIcon('#F59E0B'), // amber-500
  religious_sites: createCustomIcon('#3B82F6'), // blue-500
  castles_palaces: createCustomIcon('#EF4444'), // red-500
  architectural_landmarks: createCustomIcon('#6B7280'), // gray-500
  natural_landscapes: createCustomIcon('#10B981'), // emerald-500
  parks_gardens: createCustomIcon('#22C55E'), // green-500
  outdoor_sports: createCustomIcon('#F97316'), // orange-500
  city_centers: createCustomIcon('#6366F1'), // indigo-500
  viewpoints_towers: createCustomIcon('#EC4899'), // pink-500
  theme_parks_zoos: createCustomIcon('#84CC16'), // lime-500
  nightlife: createCustomIcon('#7C3AED'), // violet-500
  shows_cinema: createCustomIcon('#DC2626'), // red-600
  shopping: createCustomIcon('#059669'), // emerald-600
  interesting_places: createCustomIcon('#14B8A6'), // teal-500
  food_dining: createCustomIcon('#D97706') // amber-600
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

// Custom tooltip component for hover details
const ActivityTooltip: React.FC<{
  activity: Activity;
  weather?: WeatherData;
  isVisible: boolean;
  position: { x: number; y: number };
}> = ({ activity, weather, isVisible, position }) => {
  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim() || '0m';
  };

  const formatPrice = () => {
    if (!activity.price || activity.price.amount === 0) return 'Free';
    return `$${activity.price.amount}`;
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      {/* Activity Image */}
      <div className="mb-2">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-20 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getFallbackImageUrl(activity.categories);
          }}
        />
      </div>

      {/* Activity Info */}
      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{activity.name}</h4>
      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{activity.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-700">
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{formatDuration(activity.duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={10} className="text-yellow-500" />
          <span>{activity.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={10} />
          <span className={activity.price?.amount === 0 ? 'text-green-600 font-bold' : ''}>
            {formatPrice()}
          </span>
        </div>
      </div>

      {/* Weather info */}
      {weather && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Thermometer size={10} />
          <span>{Math.round(weather.temperature)}°C, {weather.condition}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mt-2">
        {activity.categories.slice(0, 2).map((category) => (
          <span 
            key={category}
            className="px-1.5 py-0.5 text-xs rounded-full font-medium bg-teal-100 text-teal-800"
          >
            {activityCategoryLabels[category] || category}
          </span>
        ))}
      </div>

      {/* Hint */}
      <div className="text-xs text-gray-400 mt-2 italic">
        Click for details
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
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    activity: Activity | null;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    activity: null,
    position: { x: 0, y: 0 }
  });

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

  const handleMarkerMouseOver = (activity: Activity, event: any) => {
    const markerElement = event.target.getElement();
    const markerRect = markerElement.getBoundingClientRect();
    
    setTooltipState({
      isVisible: true,
      activity,
      position: {
        x: markerRect.left + markerRect.width / 2,
        y: markerRect.top
      }
    });
  };

  const handleMarkerMouseOut = () => {
    setTooltipState(prev => ({ ...prev, isVisible: false }));
  };

  const handleMarkerClick = (activity: Activity, event: any) => {
    // Prevent default click behavior
    DomEvent.stopPropagation(event);
    console.log('Click detected for activity:', activity.name);
    onActivityClick(activity);
  };

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
              eventHandlers={{
                mouseover: (e) => handleMarkerMouseOver(activity, e),
                mouseout: handleMarkerMouseOut,
                click: (e) => handleMarkerClick(activity, e)
              }}
            />
          );
        })}
      </MapContainer>

      {/* Custom Tooltip */}
      {tooltipState.activity && (
        <ActivityTooltip
          activity={tooltipState.activity}
          weather={weather}
          isVisible={tooltipState.isVisible}
          position={tooltipState.position}
        />
      )}
    </div>
  );
};

export default ActivityMap;