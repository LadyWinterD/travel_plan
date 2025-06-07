// src/components/WeatherDisplay.tsx

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
    return "Pleasant weather, great for outdoor activities.";
  };

  useEffect(() => {
    if (!destinationId || !date || destinations.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);

      const destination = destinations.find(d => d.id === destinationId);
      const cityName = destination?.name;

      if (!cityName) {
        setError("Destination city not found.");
        setIsLoading(false);
        return;
      }

      try {
        // 使用你的有效 API Key
        const apiKey = '37781fb79e564cf493f112949250706'; 
        
        // 正确的、直接的 API URL，不使用任何代理
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cityName)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          // 如果API返回错误（例如Key无效，找不到城市），就抛出错误信息
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [destinationId, date, destinations]);
  
  // --- UI / JSX 部分 ---
  const destination = destinations.find(d => d.id === destinationId);
  const location = destination ? `${destination.name}, ${destination.country}` : 'Loading...';

  if (isLoading) {
    return (
      <div className="text-center p-4">Loading weather...</div>
    );
  }

  if (error) {
    return (
       <div className="text-center p-4 text-red-500 flex items-center justify-center">
         <AlertTriangle size={16} className="mr-2"/> Error: {error}
       </div>
    )
  }

  if (!weatherData) {
    return null; 
  }
  
  return (
    <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">Weather in {location}</h3>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weatherData.condition)}
          <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
          <span className="text-gray-600">{weatherData.condition}</span>
        </div>
        <div className="text-sm text-gray-500">
          <p>Humidity: {weatherData.humidity}%</p>
          <p>Wind: {weatherData.windSpeed} km/h</p>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700 bg-gray-100 p-2 rounded">
        <strong>Advice:</strong> {getWeatherAdvice(weatherData)}
      </div>
    </div>
  );
};

export default WeatherDisplay;