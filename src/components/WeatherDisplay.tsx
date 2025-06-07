import React, { useState, useEffect } from 'react';

interface WeatherDisplayProps {
  city: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ city }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://api.placeholder.com/weather/${encodeURIComponent(city)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

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
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Weather in {city}</h3>
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