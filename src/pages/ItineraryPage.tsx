import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Clock, Calendar, Sun, Cloud, CloudRain, Info, AlertTriangle } from 'lucide-react';
import { TripDay, ScheduledActivity, WeatherData, Activity } from '../types';
import { getMockWeather } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    destinations, 
    selectedActivities, 
    startDate, 
    endDate, 
    dailyItinerary,
    updateItinerary,
    weatherData,
  } = useAppContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cityWarnings, setCityWarnings] = useState<Record<string, string>>({});
  
  // Calculate trip dates based on start and end dates
  const getTripDates = () => {
    if (!startDate || !endDate) return [];
    
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Check if total duration exceeds recommended daily limit for a city
  const checkCityDuration = (activities: Activity[], cityName: string) => {
    const MAX_RECOMMENDED_DURATION = 360; // 6 hours in minutes
    const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
    
    if (totalDuration > MAX_RECOMMENDED_DURATION) {
      return `${cityName}: Selected activities total ${Math.round(totalDuration / 60)} hours, which exceeds the recommended 6 hours per day.`;
    }
    return null;
  };

  // Schedule activities for a single day
  const scheduleActivities = (activities: Activity[], startDate: Date) => {
    let currentTime = new Date(startDate);
    currentTime.setHours(9, 0, 0, 0); // Start at 9:00 AM

    return activities.map(activity => {
      const startTime = currentTime.toTimeString().slice(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + activity.duration);
      const endTime = currentTime.toTimeString().slice(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute break

      return {
        activityId: activity.id,
        startTime,
        endTime,
        activity,
      };
    });
  };
  
  // Generate optimized itinerary
  const generateItinerary = () => {
    if (!startDate || !endDate || destinations.length === 0) {
      setErrorMessage('Please set trip dates and destinations first');
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage(null);
    setCityWarnings({});
    
    try {
      const tripDates = getTripDates();
      const newItinerary: TripDay[] = [];
      let dateIndex = 0;
      const warnings: Record<string, string> = {};
      
      // For each destination, create daily schedules
      destinations.forEach(destination => {
        const destActivities = selectedActivities[destination.id] || [];
        
        // Skip if no activities selected for this destination
        if (destActivities.length === 0) return;
        
        // Check total duration and set warning if needed
        const warning = checkCityDuration(destActivities, destination.name);
        if (warning) {
          warnings[destination.id] = warning;
        }
        
        // Create schedule for each day
        for (let day = 0; day < destination.days; day++) {
          if (dateIndex >= tripDates.length) break;
          
          const currentDate = tripDates[dateIndex];
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Get weather data
          const weather = getMockWeather(destination.id, dateStr);
          
          // Schedule all activities for this day
          const scheduledActivities = scheduleActivities(destActivities, currentDate);
          
          newItinerary.push({
            id: uuidv4(),
            date: dateStr,
            destinationId: destination.id,
            activities: scheduledActivities,
            weatherData: weather,
          });
          
          dateIndex++;
        }
      });
      
      setCityWarnings(warnings);
      updateItinerary(newItinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setErrorMessage('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate itinerary when destinations or activities change
  useEffect(() => {
    if (destinations.length > 0 && startDate && endDate) {
      generateItinerary();
    }
  }, [destinations, selectedActivities]);
  
  // If no destinations are available, redirect to destinations page
  useEffect(() => {
    if (destinations.length === 0) {
      navigate('/destinations');
    }
  }, [destinations, navigate]);
  
  // Get destination name by ID
  const getDestinationName = (id: string) => {
    return destinations.find(d => d.id === id)?.name || 'Unknown';
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (weather: WeatherData) => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" />;
    if (weather.condition.includes('Cloudy')) return <Cloud className="text-gray-500" />;
    return <Sun className="text-yellow-500" />;
  };
  
  if (destinations.length === 0) {
    return null; // Redirect handled by useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Travel Itinerary</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {Object.entries(cityWarnings).length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <div className="font-semibold mb-2">Time Allocation Warnings:</div>
          {Object.values(cityWarnings).map((warning, index) => (
            <div key={index} className="flex items-start mb-2 last:mb-0">
              <AlertTriangle size={16} className="mr-2 mt-1 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Itinerary Controls */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-md p-4">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-semibold flex items-center">
            <Calendar className="mr-2" size={20} />
            {startDate && endDate ? (
              <span>
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
            ) : (
              <span>Trip Schedule</span>
            )}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generateItinerary}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-md ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                Generating...
              </>
            ) : (
              'Regenerate Itinerary'
            )}
          </button>
        </div>
      </div>
      
      {/* Itinerary Display */}
      {dailyItinerary.length > 0 ? (
        <div className="space-y-6">
          {dailyItinerary.map((day) => (
            <div key={day.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-white/90">{getDestinationName(day.destinationId)}</p>
                  </div>
                  
                  {day.weatherData && (
                    <div className="mt-2 sm:mt-0 flex items-center bg-white/20 rounded-full px-3 py-1">
                      {getWeatherIcon(day.weatherData)}
                      <span className="ml-1">{day.weatherData.temperature}°C</span>
                      <span className="ml-1 text-sm">{day.weatherData.condition}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Day Activities */}
              <div className="p-4">
                {day.activities.length > 0 ? (
                  <div className="space-y-4">
                    {day.activities.map((scheduled, index) => (
                      <div 
                        key={`${scheduled.activityId}-${index}`}
                        className="flex flex-col sm:flex-row border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="sm:w-32 flex-shrink-0 mb-2 sm:mb-0">
                          <div className="text-gray-600 font-medium">
                            {scheduled.startTime} - {scheduled.endTime}
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-start">
                            <div 
                              className="w-12 h-12 rounded-md bg-center bg-cover flex-shrink-0 mr-3"
                              style={{ backgroundImage: `url(${scheduled.activity.image})` }}
                            ></div>
                            
                            <div>
                              <h4 className="font-medium">{scheduled.activity.name}</h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Clock size={14} className="mr-1" />
                                {Math.floor(scheduled.activity.duration / 60)} hr {scheduled.activity.duration % 60 > 0 ? `${scheduled.activity.duration % 60} min` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Info size={24} className="mx-auto mb-2" />
                    <p>No activities scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {isGenerating ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating your itinerary...</p>
            </div>
          ) : (
            <div>
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Your itinerary will appear here once generated</p>
              <button
                onClick={generateItinerary}
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              >
                Generate Itinerary
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/activities')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Activities
        </button>
        
        <button
          onClick={() => {
            // Export itinerary as JSON
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dailyItinerary, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "travel_itinerary.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={dailyItinerary.length === 0}
        >
          Export Itinerary
        </button>
      </div>
    </div>
  );
};

export default ItineraryPage;