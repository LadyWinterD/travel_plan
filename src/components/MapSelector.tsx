import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { LatLng, Icon, DivIcon } from 'leaflet';
import { MapPin, Loader2, Search, Globe } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  onLocationSelect: (cityName: string, country: string, coordinates: { lat: number; lng: number }) => void;
  className?: string;
}

interface LocationInfo {
  cityName: string;
  country: string;
  coordinates: { lat: number; lng: number };
  fullAddress: string;
}

// Custom marker icon
const createCustomIcon = (isSelected: boolean = false) => {
  return new DivIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; 
      height: 24px; 
      background-color: ${isSelected ? '#0d9488' : '#14b8a6'}; 
      border: 3px solid white; 
      border-radius: 50%; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: all 0.2s ease-in-out;
    ">
      <div style="
        width: 8px; 
        height: 8px; 
        background-color: white; 
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map click events
const MapClickHandler: React.FC<{
  onLocationSelect: (location: LocationInfo) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}> = ({ onLocationSelect, isLoading, setIsLoading }) => {
  useMapEvents({
    click: async (e) => {
      if (isLoading) return;
      
      const { lat, lng } = e.latlng;
      setIsLoading(true);
      
      try {
        console.log(`🗺️ Map clicked at: ${lat}, ${lng}`);
        
        // Use Nominatim for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        console.log('🌍 Nominatim response:', data);
        
        if (!data || !data.address) {
          throw new Error('No address data found');
        }
        
        // Extract city name with fallback options
        const address = data.address;
        const cityName = address.city || 
                        address.town || 
                        address.village || 
                        address.municipality || 
                        address.county ||
                        address.state ||
                        'Unknown Location';
        
        const country = address.country || 'Unknown Country';
        const fullAddress = data.display_name || `${cityName}, ${country}`;
        
        console.log(`✅ Location found: ${cityName}, ${country}`);
        
        const locationInfo: LocationInfo = {
          cityName,
          country,
          coordinates: { lat, lng },
          fullAddress
        };
        
        onLocationSelect(locationInfo);
      } catch (error) {
        console.error('❌ Error fetching location:', error);
        // Still allow selection with coordinates
        const locationInfo: LocationInfo = {
          cityName: `Location ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
          country: 'Unknown',
          coordinates: { lat, lng },
          fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        };
        onLocationSelect(locationInfo);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect, className = "" }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]); // World view
  const [mapZoom, setMapZoom] = useState(2);

  const handleLocationSelect = useCallback((location: LocationInfo) => {
    setSelectedLocation(location);
    onLocationSelect(location.cityName, location.country, location.coordinates);
  }, [onLocationSelect]);

  const handleUseLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.cityName, selectedLocation.country, selectedLocation.coordinates);
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(10);
        
        // Reverse geocode current location
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            const cityName = address.city || address.town || address.village || 'Current Location';
            const country = address.country || 'Unknown';
            
            const locationInfo: LocationInfo = {
              cityName,
              country,
              coordinates: { lat: latitude, lng: longitude },
              fullAddress: data.display_name || `${cityName}, ${country}`
            };
            
            setSelectedLocation(locationInfo);
          }
        } catch (error) {
          console.error('Error getting current location details:', error);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        setIsLoading(false);
        alert('Unable to get your current location. Please click on the map to select a destination.');
      }
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Globe className="text-teal-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Select on Map</h3>
              <p className="text-sm text-gray-600">Click anywhere on the map to select a destination</p>
            </div>
          </div>
          
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">Find My Location</span>
            <span className="sm:hidden">My Location</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-64 sm:h-80 lg:h-96 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
              <Loader2 size={20} className="animate-spin text-teal-600" />
              <span className="text-gray-700 font-medium">Getting location...</span>
            </div>
          </div>
        )}
        
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler
            onLocationSelect={handleLocationSelect}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          
          {selectedLocation && (
            <Marker
              position={[selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]}
              icon={createCustomIcon(true)}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-teal-600" />
                    <span className="font-semibold text-gray-900">{selectedLocation.cityName}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {selectedLocation.country}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {selectedLocation.fullAddress}
                  </div>
                  <button
                    onClick={handleUseLocation}
                    className="w-full px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm font-medium"
                  >
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MapPin className="text-teal-600" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedLocation.cityName}</div>
                <div className="text-sm text-gray-600">{selectedLocation.country}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleUseLocation}
              className="w-full sm:w-auto px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Add This Destination
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;