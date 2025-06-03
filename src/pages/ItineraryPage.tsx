import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Clock, Calendar, Sun, Cloud, CloudRain, Info, AlertTriangle, GripVertical, X } from 'lucide-react';
import { TripDay, ScheduledActivity, WeatherData, Activity } from '../types';
import { getMockWeather } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableActivityProps {
  activity: ScheduledActivity;
  onDelete: () => void;
}

const SortableActivity: React.FC<SortableActivityProps> = ({ activity, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.activityId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 group"
    >
      <div className="sm:w-32 flex-shrink-0 mb-2 sm:mb-0">
        <div className="text-gray-600 font-medium">
          {activity.startTime} - {activity.endTime}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-start">
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded mr-2"
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          <div 
            className="w-12 h-12 rounded-md bg-center bg-cover flex-shrink-0 mr-3"
            style={{ backgroundImage: `url(${activity.activity.image})` }}
          ></div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{activity.activity.name}</h4>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock size={14} className="mr-1" />
              {Math.floor(activity.activity.duration / 60)} hr {activity.activity.duration % 60 > 0 ? `${activity.activity.duration % 60} min` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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

  // Calculate total duration for a set of activities
  const calculateTotalDuration = (activities: Activity[]) => {
    return activities.reduce((sum, act) => sum + act.duration, 0);
  };

  // Distribute activities across days
  const distributeActivities = (activities: Activity[], numDays: number): Activity[][] => {
    const MAX_MINUTES_PER_DAY = 360; // 6 hours
    const days: Activity[][] = Array(numDays).fill(null).map(() => []);
    let currentDayIndex = 0;
    let currentDayDuration = 0;
    
    // Sort activities by duration (descending) to optimize distribution
    const sortedActivities = [...activities].sort((a, b) => b.duration - a.duration);
    
    sortedActivities.forEach(activity => {
      // If we're on the last day, add remaining activities regardless of duration
      if (currentDayIndex === numDays - 1) {
        days[currentDayIndex].push(activity);
        return;
      }
      
      // If adding this activity would exceed 6 hours and we have more days available
      if (currentDayDuration + activity.duration > MAX_MINUTES_PER_DAY && currentDayIndex < numDays - 1) {
        currentDayIndex++;
        currentDayDuration = 0;
      }
      
      days[currentDayIndex].push(activity);
      currentDayDuration += activity.duration;
    });
    
    return days;
  };

  // Schedule activities for a single day
  const scheduleActivities = (activities: Activity[], startDate: Date): ScheduledActivity[] => {
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
    
    try {
      const tripDates = getTripDates();
      const newItinerary: TripDay[] = [];
      let dateIndex = 0;
      
      // For each destination, distribute and schedule activities
      destinations.forEach(destination => {
        const destActivities = selectedActivities[destination.id] || [];
        
        // Skip if no activities selected for this destination
        if (destActivities.length === 0) return;
        
        // Distribute activities across available days
        const distributedActivities = distributeActivities(destActivities, destination.days);
        
        // Create schedule for each day
        for (let day = 0; day < destination.days; day++) {
          if (dateIndex >= tripDates.length) break;
          
          const currentDate = tripDates[dateIndex];
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayActivities = distributedActivities[day] || [];
          
          // Get weather data
          const weather = getMockWeather(destination.id, dateStr);
          
          // Schedule activities for this day
          const scheduledActivities = scheduleActivities(dayActivities, currentDate);
          
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
      
      updateItinerary(newItinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setErrorMessage('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle drag end for reordering activities
  const handleDragEnd = (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = dailyItinerary.findIndex(day => day.id === dayId);
      const day = dailyItinerary[oldIndex];
      
      const activities = [...day.activities];
      const oldActivityIndex = activities.findIndex(a => a.activityId === active.id);
      const newActivityIndex = activities.findIndex(a => a.activityId === over.id);
      
      const reorderedActivities = arrayMove(activities, oldActivityIndex, newActivityIndex);
      
      // Recalculate times
      let currentTime = new Date(day.date);
      currentTime.setHours(9, 0, 0, 0);
      
      const updatedActivities = reorderedActivities.map(activity => ({
        ...activity,
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: (() => {
          currentTime.setMinutes(currentTime.getMinutes() + activity.activity.duration);
          return currentTime.toTimeString().slice(0, 5);
        })(),
      }));
      
      const updatedItinerary = [...dailyItinerary];
      updatedItinerary[oldIndex] = {
        ...day,
        activities: updatedActivities,
      };
      
      updateItinerary(updatedItinerary);
    }
  };
  
  // Handle activity deletion
  const handleDeleteActivity = (dayId: string, activityId: string) => {
    const updatedItinerary = dailyItinerary.map(day => {
      if (day.id === dayId) {
        const updatedActivities = day.activities.filter(a => a.activityId !== activityId);
        
        // Recalculate times for remaining activities
        let currentTime = new Date(day.date);
        currentTime.setHours(9, 0, 0, 0);
        
        const rescheduledActivities = updatedActivities.map(activity => ({
          ...activity,
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: (() => {
            currentTime.setMinutes(currentTime.getMinutes() + activity.activity.duration);
            return currentTime.toTimeString().slice(0, 5);
          })(),
        }));
        
        return {
          ...day,
          activities: rescheduledActivities,
        };
      }
      return day;
    });
    
    updateItinerary(updatedItinerary);
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
          {dailyItinerary.map((day) => {
            const totalDuration = calculateTotalDuration(day.activities.map(a => a.activity));
            const showWarning = totalDuration > 360; // More than 6 hours

            return (
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
                  {showWarning && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                      <AlertTriangle size={16} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Total activities time ({Math.round(totalDuration / 60)} hours) exceeds the recommended 6 hours per day
                      </p>
                    </div>
                  )}

                  {day.activities.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, day.id)}
                    >
                      <SortableContext
                        items={day.activities.map(a => a.activityId)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {day.activities.map((scheduled) => (
                            <SortableActivity
                              key={scheduled.activityId}
                              activity={scheduled}
                              onDelete={() => handleDeleteActivity(day.id, scheduled.activityId)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Info size={24} className="mx-auto mb-2" />
                      <p>No activities scheduled for this day</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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