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
        
        // Make an asynchronous fetch call to the WeatherAPI.com API using the cityName
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=f37afaba87034221b29110532250706&q=${cityName}`);
        
        // Check if response.ok is false. If it is, throw a new Error
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        // If the response is ok, parse the JSON data
        const data = await response.json();
        
        // Transform the API response to match our WeatherData interface using WeatherAPI.com format
        const transformedData: WeatherData = {
          temperature: data.current.temp_c,
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph
        };
        
        // Finally, call setWeatherData to update the state
        setWeatherData(transformedData);
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