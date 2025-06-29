import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Clock, Calendar, Sun, Cloud, CloudRain, Info, AlertTriangle, GripVertical, X, MapPin, Umbrella, Download, Edit2, Check, RotateCcw } from 'lucide-react';
import { TripDay, ScheduledActivity, WeatherData, Activity } from '../types';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createEvent } from 'ics';
import { getFallbackImageUrl } from '../services/openTripMapApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimation,
  UniqueIdentifier,
  DragStartEvent,
  DragOverEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Time management utilities
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';
const BREAK_DURATION = 30; // minutes between activities

// Time grid options - 30-minute intervals from 6:00 to 22:00
const TIME_GRID_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00'
];

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const totalMinutes = timeToMinutes(time) + minutes;
  return minutesToTime(totalMinutes);
};

const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  return addMinutesToTime(startTime, durationMinutes);
};

const recalculateTimesForDay = (activities: ScheduledActivity[], startTime: string = DEFAULT_START_TIME): ScheduledActivity[] => {
  if (activities.length === 0) return activities;
  
  const updatedActivities = [...activities];
  let currentTime = startTime;
  
  updatedActivities.forEach((activity, index) => {
    // Update start time
    activity.startTime = currentTime;
    
    // Calculate end time based on activity duration
    activity.endTime = calculateEndTime(currentTime, activity.activity.duration);
    
    // Calculate next activity start time (add break)
    if (index < updatedActivities.length - 1) {
      currentTime = addMinutesToTime(activity.endTime, BREAK_DURATION);
    }
  });
  
  return updatedActivities;
};

interface SortableActivityProps {
  activity: ScheduledActivity;
  onDelete: () => void;
  onTimeEdit: (activityId: string, newStartTime: string) => void;
  onTimeReset: (activityId: string) => void;
  isDragging?: boolean;
  location?: string;
  weather?: WeatherData;
}

const WeatherDisplay: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" size={16} />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" size={16} />;
    return <Cloud className="text-gray-500" size={16} />;
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm weather-display">
      {getWeatherIcon()}
      <span>{Math.round(weather.temperature)}°C</span>
      {weather.isRainy && (
        <span className="flex items-center text-blue-500">
          <Umbrella size={12} className="mr-1" />
          {Math.round(weather.precipitation)}mm
        </span>
      )}
    </div>
  );
};

const SortableActivity: React.FC<SortableActivityProps> = ({ activity, onDelete, onTimeEdit, onTimeReset, isDragging, location, weather }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: activity.activityId,
    data: {
      type: 'activity',
      activity
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showWeatherWarning = weather?.isRainy && !activity.activity.indoor;
  
  // Time editing state
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTime, setEditTime] = useState(activity.startTime);

  const handleClick = () => {
    setIsEditingTime(true);
    setEditTime(activity.startTime);
  };

  const handleTimeSave = () => {
    if (editTime !== activity.startTime) {
      onTimeEdit(activity.activityId, editTime);
    }
    setIsEditingTime(false);
  };

  const handleTimeCancel = () => {
    setEditTime(activity.startTime);
    setIsEditingTime(false);
  };

  const handleTimeReset = () => {
    onTimeReset(activity.activityId);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}
      data-activity-id={activity.activityId}
    >
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Time Display/Edit Section */}
          <div className="flex-shrink-0 w-20 sm:w-24">
            {isEditingTime ? (
              <div className="flex flex-col gap-1">
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="text-xs sm:text-sm border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-teal-500"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleTimeSave}
                    className="p-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                    title="Save time"
                  >
                    <Check size={10} />
                  </button>
                  <button
                    onClick={handleTimeCancel}
                    className="p-0.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                    title="Cancel"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div 
                  className="text-xs sm:text-sm text-gray-600 font-medium cursor-pointer hover:text-teal-600 transition-colors"
                  onClick={handleClick}
                  title="Click to edit time"
                >
                  {activity.startTime}
                </div>
                <div className="text-xs text-gray-500">
                  {activity.endTime}
                </div>
                <button
                  onClick={handleTimeReset}
                  className="p-0.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                  title="Reset to auto-schedule"
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            )}
          </div>
          
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 sm:p-2 hover:bg-gray-100 rounded touch-none"
          >
            <GripVertical size={14} className="text-gray-400" />
          </div>
          
          <img
            src={activity.activity.image}
            alt={activity.activity.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = getFallbackImageUrl(activity.activity.categories);
            }}
          />
          
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{activity.activity.name}</h4>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <Clock size={12} className="mr-1 flex-shrink-0" />
                <span>{Math.floor(activity.activity.duration / 60)} hr {activity.activity.duration % 60 > 0 ? `${activity.activity.duration % 60} min` : ''}</span>
              </div>
              {activity.activity.address && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <MapPin size={12} className="mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {[
                      activity.activity.address.city,
                      activity.activity.address.country
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {weather && <WeatherDisplay weather={weather} />}
            </div>
            
            {showWeatherWarning && (
              <div className="mt-2 text-xs sm:text-sm text-yellow-700 bg-yellow-50 px-2 sm:px-3 py-1 rounded-md flex items-center">
                <AlertTriangle size={12} className="mr-1 flex-shrink-0" />
                <span>This is an outdoor activity and rain is forecasted</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onDelete}
            className="p-1 sm:p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DragOverlayContent: React.FC<{ activity: ScheduledActivity; location?: string; weather?: WeatherData }> = ({ activity, location, weather }) => (
  <div className="bg-white rounded-lg shadow-xl border-2 border-teal-500">
    <SortableActivity 
      activity={activity} 
      onDelete={() => {}} 
      onTimeEdit={() => {}}
      onTimeReset={() => {}}
      location={location} 
      weather={weather} 
    />
  </div>
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Preload all images in the itinerary content before PDF export
 * This ensures images are fully loaded and prevents blank areas in the PDF
 */
const preloadImages = async (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  console.log(`🔄 Found ${images.length} images to preload`);

  if (images.length === 0) {
    console.log(`ℹ️ No images found to preload`);
    return;
  }

  const imagePromises = Array.from(images).map((img, index) => {
    return new Promise<void>((resolve) => {
      const imageUrl = img.src;
      
      if (!imageUrl || imageUrl.includes('data:')) {
        console.log(`⏭️ Skipping image ${index + 1}: ${imageUrl ? 'data URL' : 'no URL'}`);
        resolve();
        return;
      }

      console.log(`🔄 Preloading image ${index + 1}/${images.length}: ${imageUrl.substring(0, 50)}...`);
      
      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      
      testImg.onload = () => {
        console.log(`✅ Image ${index + 1}/${images.length} preloaded successfully`);
        resolve();
      };
      
      testImg.onerror = () => {
        console.warn(`⚠️ Failed to preload image ${index + 1}/${images.length}`);
        resolve();
      };
      
      // Add a timeout to prevent hanging
      setTimeout(() => {
        console.warn(`⏰ Timeout for image ${index + 1}/${images.length}`);
        resolve();
      }, 15000);
      
      testImg.src = imageUrl;
    });
  });

  console.log(`🔄 Preloading ${imagePromises.length} images...`);
  await Promise.all(imagePromises);
  console.log(`✅ All images preloaded successfully`);
};

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { dailyItinerary, updateItinerary, destinations, weatherData } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCalendar, setIsExportingCalendar] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDroppableId, setActiveDroppableId] = useState<UniqueIdentifier | null>(null);
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null);
  const [draggedLocation, setDraggedLocation] = useState<string>('');
  const itineraryContentRef = useRef<HTMLDivElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getLocationForDay = (destinationId: string): string => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? `${destination.name}, ${destination.country}` : 'Unknown Location';
  };

  const calculateDayDuration = (activities: ScheduledActivity[]): number => {
    return activities.reduce((total, activity) => total + activity.activity.duration, 0);
  };

  const updateDayWarnings = (days: TripDay[]): TripDay[] => {
    return days.map(day => {
      const totalDuration = calculateDayDuration(day.activities);
      const destination = destinations.find(d => d.id === day.destinationId);
      const weatherInfo = destination && weatherData ? weatherData[destination.name] : undefined;
      const hasOutdoorActivitiesInRain = weatherInfo?.isRainy && 
        day.activities.some(activity => !activity.activity.indoor);

      let warning = undefined;
      if (totalDuration > 360) {
        warning = `This day's schedule exceeds 6 hours. Consider spreading activities across multiple days.`;
      } else if (hasOutdoorActivitiesInRain) {
        warning = `There are outdoor activities scheduled on a rainy day. Consider rearranging if possible.`;
      }

      return {
        ...day,
        warning,
        weatherData: weatherInfo
      };
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    const draggedDay = dailyItinerary.find(day => 
      day.activities.some(a => a.activityId === active.id)
    );
    
    if (draggedDay) {
      const activity = draggedDay.activities.find(a => a.activityId === active.id);
      if (activity) {
        setDraggedActivity(activity);
        setDraggedLocation(getLocationForDay(draggedDay.destinationId) || '');
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const droppableId = over.id.toString().split('-')[0];
      setActiveDroppableId(droppableId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedActivity) {
      setActiveId(null);
      setDraggedActivity(null);
      setDraggedLocation('');
      setActiveDroppableId(null);
      return;
    }

    const newItinerary = [...dailyItinerary];
    
    // Find source and target days
    const sourceDay = newItinerary.find(day => 
      day.activities.some(a => a.activityId === active.id)
    );
    
    const targetDay = newItinerary.find(day => 
      day.id === over.id || day.activities.some(a => a.activityId === over.id)
    );

    if (!sourceDay || !targetDay || sourceDay.destinationId !== targetDay.destinationId) {
      setActiveId(null);
      setDraggedActivity(null);
      setDraggedLocation('');
      setActiveDroppableId(null);
      return;
    }

    const sourceDayIndex = newItinerary.findIndex(d => d.id === sourceDay.id);
    const targetDayIndex = newItinerary.findIndex(d => d.id === targetDay.id);

    // Remove activity from source day
    const [movedActivity] = sourceDay.activities.splice(
      sourceDay.activities.findIndex(a => a.activityId === active.id),
      1
    );

    // If same day, just reorder
    if (sourceDay.id === targetDay.id) {
      const newIndex = targetDay.activities.findIndex(a => a.activityId === over.id);
      sourceDay.activities.splice(newIndex, 0, movedActivity);
      
      // Recalculate times for the day after reordering
      sourceDay.activities = recalculateTimesForDay(sourceDay.activities);
    } else {
      // Add to target day at correct position
      const targetIndex = over.id === targetDay.id 
        ? targetDay.activities.length 
        : targetDay.activities.findIndex(a => a.activityId === over.id);
      targetDay.activities.splice(targetIndex, 0, movedActivity);
      
      // Recalculate times for both days
      sourceDay.activities = recalculateTimesForDay(sourceDay.activities);
      targetDay.activities = recalculateTimesForDay(targetDay.activities);
    }

    // Update the days in the itinerary
    newItinerary[sourceDayIndex] = sourceDay;
    if (sourceDayIndex !== targetDayIndex) {
      newItinerary[targetDayIndex] = targetDay;
    }

    // Remove empty days and update warnings
    const filteredItinerary = updateDayWarnings(
      newItinerary.filter(day => day.activities.length > 0)
    );
    
    updateItinerary(filteredItinerary);
    
    setActiveId(null);
    setDraggedActivity(null);
    setDraggedLocation('');
    setActiveDroppableId(null);
  };

  const handleDeleteActivity = (date: string, activityId: string) => {
    const newItinerary = updateDayWarnings(
      dailyItinerary
        .map(day => {
          if (day.date === date) {
            return {
              ...day,
              activities: day.activities.filter(
                activity => activity.activityId !== activityId
              )
            };
          }
          return day;
        })
        .filter(day => day.activities.length > 0)
    );
    
    updateItinerary(newItinerary);
  };

  const handleTimeEdit = (activityId: string, newStartTime: string) => {
    const newItinerary = dailyItinerary.map(day => {
      const activityIndex = day.activities.findIndex(a => a.activityId === activityId);
      if (activityIndex === -1) return day;

      const updatedActivities = [...day.activities];
      const activity = { ...updatedActivities[activityIndex] };
      
      // Update the specific activity's time
      activity.startTime = newStartTime;
      activity.endTime = calculateEndTime(newStartTime, activity.activity.duration);
      updatedActivities[activityIndex] = activity;

      // Recalculate times for all activities after this one
      for (let i = activityIndex + 1; i < updatedActivities.length; i++) {
        const prevActivity = updatedActivities[i - 1];
        const currentActivity = updatedActivities[i];
        
        // Start time is end time of previous activity + break
        const newStartTime = addMinutesToTime(prevActivity.endTime, BREAK_DURATION);
        currentActivity.startTime = newStartTime;
        currentActivity.endTime = calculateEndTime(newStartTime, currentActivity.activity.duration);
      }

      return {
        ...day,
        activities: updatedActivities
      };
    });

    updateItinerary(updateDayWarnings(newItinerary));
  };

  const handleTimeReset = (activityId: string) => {
    const newItinerary = dailyItinerary.map(day => {
      const activityIndex = day.activities.findIndex(a => a.activityId === activityId);
      if (activityIndex === -1) return day;

      // Recalculate all times for this day
      const updatedActivities = recalculateTimesForDay(day.activities);

      return {
        ...day,
        activities: updatedActivities
      };
    });

    updateItinerary(updateDayWarnings(newItinerary));
  };

  // Group days by destination
  const daysByDestination = dailyItinerary.reduce((acc, day) => {
    if (!acc[day.destinationId]) {
      acc[day.destinationId] = [];
    }
    acc[day.destinationId].push(day);
    return acc;
  }, {} as Record<string, TripDay[]>);

  // Enhanced PDF Export functionality with chunked rendering
  const handleExportPDF = async () => {
    if (!itineraryContentRef.current) {
      console.error('Itinerary content ref is not available');
      return;
    }

    if (dailyItinerary.length === 0) {
      alert('No itinerary to export');
      return;
    }

    setIsExporting(true);

    try {
      console.log('🔄 Starting PDF generation with chunked rendering...');
      
      // Preload images first
      console.log('🔄 Preloading images...');
      await preloadImages(itineraryContentRef.current);
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      
      // Group days by destination
      const daysByDestination = dailyItinerary.reduce((acc, day) => {
        if (!acc[day.destinationId]) {
          acc[day.destinationId] = [];
        }
        acc[day.destinationId].push(day);
        return acc;
      }, {} as Record<string, TripDay[]>);
      
      let isFirstPage = true;
      
      // Process each destination as a separate chunk
      for (const [destinationId, days] of Object.entries(daysByDestination)) {
        const location = getLocationForDay(destinationId);
        
        // Create a temporary container for this destination
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.style.fontFamily = 'Inter, Arial, sans-serif';
        tempContainer.style.color = 'black';
        tempContainer.style.lineHeight = '1.6';
        
        // Add destination header
        const headerDiv = document.createElement('div');
        headerDiv.style.background = 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)';
        headerDiv.style.color = 'white';
        headerDiv.style.padding = '16px';
        headerDiv.style.borderRadius = '8px';
        headerDiv.style.marginBottom = '20px';
        headerDiv.innerHTML = `
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold;">${location}</h2>
          <p style="margin: 0; opacity: 0.9;">${days.length} ${days.length === 1 ? 'day' : 'days'}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px;">${formatDate(days[0].date)} - ${formatDate(days[days.length - 1].date)}</p>
        `;
        tempContainer.appendChild(headerDiv);
        
        // Add each day
        days.forEach((day, dayIndex) => {
          const dayDiv = document.createElement('div');
          dayDiv.style.marginBottom = '20px';
          dayDiv.style.border = '1px solid #e5e7eb';
          dayDiv.style.borderRadius = '8px';
          dayDiv.style.overflow = 'hidden';
          
          // Day header
          const dayHeader = document.createElement('div');
          dayHeader.style.padding = '16px';
          dayHeader.style.borderBottom = '1px solid #f3f4f6';
          dayHeader.style.backgroundColor = 'white';
          
          const dayTitle = document.createElement('h3');
          dayTitle.style.margin = '0 0 4px 0';
          dayTitle.style.fontSize = '16px';
          dayTitle.style.fontWeight = 'bold';
          dayTitle.textContent = `Day ${dayIndex + 1}`;
          
          const dayDate = document.createElement('div');
          dayDate.style.fontSize = '14px';
          dayDate.style.color = '#6b7280';
          dayDate.textContent = formatDate(day.date);
          
          dayHeader.appendChild(dayTitle);
          dayHeader.appendChild(dayDate);
          
          // Add weather info if available
          if (day.weatherData) {
            const weatherDiv = document.createElement('div');
            weatherDiv.style.marginTop = '8px';
            weatherDiv.style.fontSize = '14px';
            weatherDiv.style.color = '#6b7280';
            weatherDiv.textContent = `Weather: ${Math.round(day.weatherData.temperature)}°C${day.weatherData.isRainy ? `, Rain: ${Math.round(day.weatherData.precipitation)}mm` : ''}`;
            dayHeader.appendChild(weatherDiv);
          }
          
          dayDiv.appendChild(dayHeader);
          
          // Add activities
          const activitiesDiv = document.createElement('div');
          activitiesDiv.style.padding = '16px';
          
          day.activities.forEach((activity) => {
            const activityDiv = document.createElement('div');
            activityDiv.style.marginBottom = '12px';
            activityDiv.style.padding = '12px';
            activityDiv.style.backgroundColor = 'white';
            activityDiv.style.border = '1px solid #e5e7eb';
            activityDiv.style.borderRadius = '8px';
            activityDiv.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            
            // Activity content
            activityDiv.innerHTML = `
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="flex-shrink: 0; width: 60px; text-align: center;">
                  <div style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 2px;">${activity.startTime}</div>
                  <div style="font-size: 12px; color: #6b7280;">${activity.endTime}</div>
                </div>
                <div style="flex-grow: 1;">
                  <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111827;">${activity.activity.name}</h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 14px; color: #6b7280;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>⏱</span>
                      <span>${Math.floor(activity.activity.duration / 60)} hr ${activity.activity.duration % 60 > 0 ? `${activity.activity.duration % 60} min` : ''}</span>
                    </div>
                    ${activity.activity.address ? `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span>📍</span>
                        <span>${[activity.activity.address.city, activity.activity.address.country].filter(Boolean).join(', ')}</span>
                      </div>
                    ` : ''}
                  </div>
                  ${day.weatherData?.isRainy && !activity.activity.indoor ? `
                    <div style="margin-top: 8px; padding: 4px 8px; background: #fffbeb; color: #a16207; border-radius: 4px; font-size: 12px;">
                      ⚠ Outdoor activity - rain forecasted
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
            
            activitiesDiv.appendChild(activityDiv);
          });
          
          dayDiv.appendChild(activitiesDiv);
          tempContainer.appendChild(dayDiv);
        });
        
        // Add to document temporarily
        document.body.appendChild(tempContainer);
        
        try {
          // Wait for any images to load
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Render this chunk
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 30000,
            removeContainer: false,
            foreignObjectRendering: false,
            scrollX: 0,
            scrollY: 0,
            width: tempContainer.scrollWidth,
            height: tempContainer.scrollHeight
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // Calculate dimensions
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add new page if not first page
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;
          
          // Add the image to PDF
          let heightLeft = imgHeight;
          let position = 0;
          
          // Add first part of the image
          pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 2 * margin);
          
          // Add additional pages if needed for this destination
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 2 * margin);
          }
          
        } finally {
          // Clean up
          document.body.removeChild(tempContainer);
        }
      }
      
      // Save the PDF
      const filename = `travel_itinerary_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      console.log('✅ PDF exported successfully with chunked rendering');
      
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calendar Export functionality
  const handleExportCalendar = async () => {
    if (dailyItinerary.length === 0) {
      alert('No itinerary to export');
      return;
    }

    setIsExportingCalendar(true);

    try {
      console.log('🔄 Starting calendar generation...');
      
      const events: any[] = [];
      
      // Process each day and create calendar events
      dailyItinerary.forEach((day, dayIndex) => {
        const location = getLocationForDay(day.destinationId);
        
        // Create events for each activity
        day.activities.forEach((activity, activityIndex) => {
          // Parse start time
          const [startHour, startMinute] = activity.startTime.split(':').map(Number);
          const [endHour, endMinute] = activity.endTime.split(':').map(Number);
          
          // Parse date
          const date = new Date(day.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // ics uses 1-based months
          const dayOfMonth = date.getDate();
          
          // Create Google Maps link
          let googleMapsLink = '';
          if (activity.activity.location) {
            googleMapsLink = `https://www.google.com/maps?q=${activity.activity.location.lat},${activity.activity.location.lng}`;
          } else if (activity.activity.address) {
            const address = [activity.activity.address.city, activity.activity.address.country].filter(Boolean).join(', ');
            googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
          } else {
            googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
          }
          
          // Create detailed description
          const description = [
            `📍 Location: ${location}`,
            `⏱ Duration: ${Math.floor(activity.activity.duration / 60)} hr ${activity.activity.duration % 60 > 0 ? `${activity.activity.duration % 60} min` : ''}`,
            activity.activity.address ? `🏠 Address: ${[activity.activity.address.city, activity.activity.address.country].filter(Boolean).join(', ')}` : '',
            day.weatherData ? `🌤 Weather: ${Math.round(day.weatherData.temperature)}°C${day.weatherData.isRainy ? `, Rain: ${Math.round(day.weatherData.precipitation)}mm` : ''}` : '',
            day.weatherData?.isRainy && !activity.activity.indoor ? '⚠️ Outdoor activity - rain forecasted' : '',
            `🗺 Google Maps: ${googleMapsLink}`,
            '',
            `📝 Details: ${activity.activity.description}`
          ].filter(Boolean).join('\n');
          
          // Create event object with detailed information
          const event = {
            start: [year, month, dayOfMonth, startHour, startMinute] as [number, number, number, number, number],
            end: [year, month, dayOfMonth, endHour, endMinute] as [number, number, number, number, number],
            title: `${activity.activity.name} - ${location}`,
            description: description,
            location: activity.activity.address ? [activity.activity.address.city, activity.activity.address.country].filter(Boolean).join(', ') : location
          };
          
          events.push(event);
        });
      });
      
      console.log('Generated events:', events);
      
      // Generate ICS file - create events one by one
      let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Travel Planner//EN\r\n';
      
      events.forEach((event, index) => {
        const startDate = `${event.start[0]}${event.start[1].toString().padStart(2, '0')}${event.start[2].toString().padStart(2, '0')}T${event.start[3].toString().padStart(2, '0')}${event.start[4].toString().padStart(2, '0')}00`;
        const endDate = `${event.end[0]}${event.end[1].toString().padStart(2, '0')}${event.end[2].toString().padStart(2, '0')}T${event.end[3].toString().padStart(2, '0')}${event.end[4].toString().padStart(2, '0')}00`;
        
        icsContent += `BEGIN:VEVENT\r\n`;
        icsContent += `UID:${uuidv4()}\r\n`;
        icsContent += `DTSTART:${startDate}\r\n`;
        icsContent += `DTEND:${endDate}\r\n`;
        icsContent += `SUMMARY:${event.title.replace(/\n/g, '\\n')}\r\n`;
        icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\r\n`;
        if (event.location) {
          icsContent += `LOCATION:${event.location}\r\n`;
        }
        icsContent += `STATUS:CONFIRMED\r\n`;
        icsContent += `END:VEVENT\r\n`;
      });
      
      icsContent += 'END:VCALENDAR\r\n';
      
      // Create and download the file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel_itinerary_${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Calendar exported successfully');
      
    } catch (error) {
      console.error('❌ Error exporting calendar:', error);
      alert('Failed to export calendar. Please try again.');
    } finally {
      setIsExportingCalendar(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Itinerary</h1>
        
        {/* Export Buttons */}
        {dailyItinerary.length > 0 && (
          <div className="flex gap-3 export-buttons-container">
            <button
              onClick={handleExportCalendar}
              disabled={isExportingCalendar}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                isExportingCalendar
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">{isExportingCalendar ? 'Generating Calendar...' : 'Export Calendar'}</span>
              <span className="sm:hidden">{isExportingCalendar ? 'Generating...' : 'Calendar'}</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                isExporting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl'
              }`}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{isExporting ? 'Generating PDF...' : 'Export as PDF'}</span>
              <span className="sm:hidden">Export PDF</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Main content container for PDF export */}
      <div ref={itineraryContentRef} id="pdf-preview" className="pdf-export-container">
        {dailyItinerary.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always
              }
            }}
          >
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(daysByDestination).map(([destinationId, days]) => {
                const location = getLocationForDay(destinationId);
                return (
                  <div key={destinationId} className="bg-white rounded-lg shadow-lg overflow-hidden pdf-destination">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 text-white pdf-header">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold">{location}</h2>
                          <p className="text-sm opacity-90">{days.length} {days.length === 1 ? 'day' : 'days'}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(days[0].date)} - {formatDate(days[days.length - 1].date)}</span>
                          </div>
                          {days[0].weatherData && (
                            <div className="flex items-center gap-2">
                              <WeatherDisplay weather={days[0].weatherData} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {days.map((day, index) => (
                        <div 
                          key={day.id}
                          className={`p-4 sm:p-6 pdf-day ${activeDroppableId === day.id ? 'bg-gray-50' : ''}`}
                        >
                          <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold">Day {index + 1}</h3>
                                <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
                              </div>
                              {day.weatherData && (
                                <div className="self-start">
                                  <WeatherDisplay weather={day.weatherData} />
                                </div>
                              )}
                            </div>
                            {day.warning && (
                              <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
                                <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{day.warning}</span>
                              </div>
                            )}
                          </div>
                          
                          <SortableContext 
                            items={day.activities.map(a => a.activityId)} 
                            strategy={verticalListSortingStrategy}
                          >
                            <div>
                              {day.activities.map((activity) => (
                                <SortableActivity
                                  key={activity.activityId}
                                  activity={activity}
                                  onDelete={() => handleDeleteActivity(day.date, activity.activityId)}
                                  onTimeEdit={(activityId, newStartTime) => {
                                    handleTimeEdit(activityId, newStartTime);
                                  }}
                                  onTimeReset={(activityId) => {
                                    handleTimeReset(activityId);
                                  }}
                                  isDragging={activity.activityId === activeId}
                                  location={location}
                                  weather={day.weatherData}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {draggedActivity ? (
                <DragOverlayContent 
                  activity={draggedActivity} 
                  location={draggedLocation}
                  weather={dailyItinerary.find(day => 
                    day.activities.some(a => a.activityId === draggedActivity.activityId)
                  )?.weatherData}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <Calendar size={32} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4 text-sm sm:text-base">No activities scheduled yet.</p>
            <button
              onClick={() => navigate('/activities')}
              className="px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              Add Activities
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-6 sm:mt-8 flex justify-between">
        <button
          onClick={() => navigate('/activities')}
          className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
        >
          Back to Activities
        </button>
      </div>
    </div>
  );
};

export default ItineraryPage;