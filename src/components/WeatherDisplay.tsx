import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Cloud, Sun, CloudRain, Umbrella, Thermometer, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  isRainy: boolean;
}

interface WeatherDisplayProps {
  destinationId: string;
  date: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ destinationId, date }) => {
  const { destinations } = useAppContext();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (condition: string, temp: number) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return <CloudRain className="text-blue-500\" size={24} />;
    }
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="text-yellow-500" size={24} />;
    }
    if (temp > 25) {
      return <Sun className="text-yellow-500\" size={24} />;
    }
    return <Cloud className="text-gray-500" size={24} />;
  };

  const getWeatherAdvice = (weatherData: WeatherData) => {
    if (weatherData.isRainy) {
      return "建议选择室内活动，或准备雨具";
    }
    if (weatherData.temperature > 30) {
      return "天气炎热，建议选择有空调的室内活动";
    }
    if (weatherData.temperature < 5) {
      return "天气寒冷，建议选择室内活动保暖";
    }
    if (weatherData.temperature > 20) {
      return "天气宜人，适合户外活动";
    }
    return "天气适中，室内外活动都不错";
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const destination = destinations.find(d => d.id === destinationId);
        if (!destination) {
          throw new Error('Destination not found');
        }

        const cityName = destination.name;
        if (!cityName) {
          return;
        }

        // Use a CORS proxy to avoid CORS issues
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `http://api.weatherapi.com/v1/current.json?key=f37afaba87034221b29110532250706&q=${encodeURIComponent(cityName)}&aqi=no`;
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const processedWeatherData: WeatherData = {
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          isRainy: data.current.condition.text.toLowerCase().includes('rain') || 
                   data.current.condition.text.toLowerCase().includes('drizzle')
        };

        setWeatherData(processedWeatherData);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to fetch weather data');
        
        // Fallback to mock data if API fails
        const mockWeatherData: WeatherData = {
          temperature: 20,
          condition: 'Partly cloudy',
          humidity: 65,
          windSpeed: 10,
          isRainy: false
        };
        setWeatherData(mockWeatherData);
      } finally {
        setIsLoading(false);
      }
    };

    if (destinationId && destinations.length > 0) {
      fetchWeatherData();
    }
  }, [destinationId, destinations]);

  const destination = destinations.find(d => d.id === destinationId);
  const location = destination ? `${destination.name}, ${destination.country}` : 'Unknown Location';

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-2 text-gray-600">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{location} 今日天气</h3>
          <div className="flex items-center gap-3 mt-2">
            {getWeatherIcon(weatherData.condition, weatherData.temperature)}
            <div>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-red-500" />
                <span className="text-xl font-bold">{weatherData.temperature}°C</span>
                <span className="text-gray-600">{weatherData.condition}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Droplets size={14} />
                  <span>湿度: {weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind size={14} />
                  <span>风速: {weatherData.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">出行建议</div>
          <div className="text-sm font-medium text-gray-800 max-w-48">
            {getWeatherAdvice(weatherData)}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          {error} (显示模拟数据)
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;