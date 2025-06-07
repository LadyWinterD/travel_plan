import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

interface WeatherDisplayProps {
  destinationId: string;
  date: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
}

// Mock weather data generator
const generateMockWeatherData = (cityName: string): WeatherData => {
  // Use city name to generate consistent but varied weather data
  const hash = cityName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const baseTemp = 15 + (Math.abs(hash) % 20); // Temperature between 15-35°C
  const humidity = 40 + (Math.abs(hash * 2) % 40); // Humidity between 40-80%
  const windSpeed = 5 + (Math.abs(hash * 3) % 15); // Wind speed between 5-20 km/h
  const condition = conditions[Math.abs(hash) % conditions.length];
  
  return {
    temperature: baseTemp,
    condition,
    humidity,
    windSpeed
  };
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ destinationId, date }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { destinations } = useAppContext();

  useEffect(() => {
    if (!destinationId || !date) return;

    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the destination object and cityName variable
        const destination = destinations.find(d => d.id === destinationId);
        const cityName = destination ? destination.name : null;
        
        // If there is no cityName, simply return to stop the function
        if (!cityName) {
          return;
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock weather data instead of making real API call
        const mockData = generateMockWeatherData(cityName);
        
        // Finally, call setWeatherData to update the state
        setWeatherData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [destinationId, date, destinations]);

  // Get city name for display
  const destination = destinations.find(d => d.id === destinationId);
  const cityName = destination ? `${destination.name}, ${destination.country}` : 'Unknown Location';

  if (isLoading) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-blue-700">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <p className="text-red-700">Error loading weather: {error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-sky-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Weather in {cityName}</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-blue-700">
            {Math.round(weatherData.temperature)}°C
          </div>
          <div className="text-sm text-gray-600">
            {weatherData.condition}
          </div>
        </div>
        {(weatherData.humidity || weatherData.windSpeed) && (
          <div className="text-right text-sm text-gray-600">
            {weatherData.humidity && <div>Humidity: {weatherData.humidity}%</div>}
            {weatherData.windSpeed && <div>Wind: {weatherData.windSpeed} km/h</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDisplay;