// WeatherDisplay.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Cloud, Sun, CloudRain, Thermometer, Wind, Droplets, AlertTriangle } from 'lucide-react';

// Interface for our component's state
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  isRainy: boolean;
}

// Props for the component
interface WeatherDisplayProps {
  destinationId: string;
  date: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ destinationId, date }) => {
  const { destinations } = useAppContext();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  // Helper to get a weather icon based on the condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return <CloudRain className="text-blue-500" size={24} />;
    }
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="text-yellow-500" size={24} />;
    }
    return <Cloud className="text-gray-500" size={24} />;
  };

  // Helper to get travel advice based on the weather
  const getWeatherAdvice = (data: WeatherData) => {
    if (data.isRainy) {
      return "Indoor activities or an umbrella are recommended.";
    }
    if (data.temperature > 30) {
      return "Hot weather! Consider air-conditioned indoor activities.";
    }
    if (data.temperature < 5) {
      return "Cold weather! Best to choose warm indoor activities.";
    }
    if (data.temperature > 20) {
      return "Pleasant weather, great for outdoor activities.";
    }
    return "Moderate weather, suitable for both indoor and outdoor plans.";
  };

  useEffect(() => {
    if (!destinationId || !date || destinations.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      setIsMockData(false);

      const destination = destinations.find(d => d.id === destinationId);
      const cityName = destination?.name;

      if (!cityName) {
        setError("Destination city not found.");
        setIsLoading(false);
        return;
      }

      try {
        const apiKey = 'f37afaba87034221b29110532250706';
        // The one and only correct, direct URL
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Network response was not ok.');
        }

        const processedData: WeatherData = {
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          isRainy: data.current.precip_mm > 0.1,
        };
        
        setWeatherData(processedData);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        console.error("Weather fetch error:", err);
        
        // Fallback to mock data only if the API call fails
        setIsMockData(true);
        setWeatherData({
          temperature: 20,
          condition: 'Unavailable',
          humidity: 65,
          windSpeed: 10,
          isRainy: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [destinationId, date, destinations]);

  const destination = destinations.find(d => d.id === destinationId);
  const location = destination ? `${destination.name}, ${destination.country}` : 'Loading...';

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-600">Loading weather for {destination?.name}...</span>
        </div>
      </div>
    );
  }
  
  if (!weatherData) {
    return null; 
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Weather details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Weather Today in {location}</h3>
          <div className="flex items-center gap-3 mt-2">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-red-500" />
                <span className="text-xl font-bold">{weatherData.temperature}°C</span>
                <span className="text-gray-600">{weatherData.condition}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Droplets size={14} />
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind size={14} />
                  <span>Wind: {weatherData.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Travel advice */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-gray-600 mb-1">Travel Advice</div>
          <div className="text-sm font-medium text-gray-800 max-w-xs">
            {getWeatherAdvice(weatherData)}
          </div>
        </div>
      </div>

      {/* Error/Fallback Notice */}
      {error && (
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-md flex items-center">
          <AlertTriangle size={14} className="mr-2"/>
          {isMockData 
            ? `Could not fetch real weather (${error}). Showing estimated data.`
            : `An error occurred: ${error}`
          }
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;