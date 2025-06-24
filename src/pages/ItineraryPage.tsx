import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Clock, Calendar, Sun, Cloud, CloudRain, Info, AlertTriangle, GripVertical, X, MapPin, Umbrella, Download } from 'lucide-react';
import { TripDay, ScheduledActivity, WeatherData, Activity } from '../types';
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';
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
  DragOverlay as DndDragOverlay,
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

interface SortableActivityProps {
  activity: ScheduledActivity;
  onDelete: () => void;
  isDragging?: boolean;
  location?: string;
  weather?: WeatherData;
}

const WeatherDisplay: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const getWeatherIcon = () => {
    if (weather.isRainy) return <CloudRain className="text-blue-500" />;
    if (weather.temperature > 25) return <Sun className="text-yellow-500" />;
    return <Cloud className="text-gray-500" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getWeatherIcon()}
      <span>{Math.round(weather.temperature)}°C</span>
      {weather.isRainy && (
        <span className="flex items-center text-blue-500">
          <Umbrella size={14} className="mr-1" />
          {Math.round(weather.precipitation)}mm
        </span>
      )}
    </div>
  );
};

const SortableActivity: React.FC<SortableActivityProps> = ({ activity, onDelete, isDragging, location, weather }) => {
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}
      data-activity-id={activity.activityId}
    >
      <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-20 text-sm text-gray-600">
            {activity.startTime}
          </div>
          
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded touch-none"
          >
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          <img
            src={activity.activity.image}
            alt={activity.activity.name}
            crossOrigin="anonymous"
            onLoad={(e) => {
              console.log(`Image loaded successfully: ${e.currentTarget.src}`);
            }}
            onError={(e) => {
              const img = e.currentTarget;
              const originalUrl = img.src;
              console.warn(`Image failed to load, switching to fallback. Original URL: ${originalUrl}`);
              img.onerror = null; // Prevent infinite loop if fallback also fails
              img.src = getFallbackImageUrl(activity.activity.categories);
            }}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{activity.activity.name}</h4>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={14} className="mr-1 flex-shrink-0" />
                <span>{Math.floor(activity.activity.duration / 60)} hr {activity.activity.duration % 60 > 0 ? `${activity.activity.duration % 60} min` : ''}</span>
              </div>
              {location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {weather && <WeatherDisplay weather={weather} />}
            </div>
            
            {showWeatherWarning && (
              <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-md flex items-center">
                <AlertTriangle size={14} className="mr-1 flex-shrink-0" />
                <span>This is an outdoor activity and rain is forecasted</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DragOverlayContent: React.FC<{ activity: ScheduledActivity; location?: string; weather?: WeatherData }> = ({ activity, location, weather }) => (
  <div className="bg-white rounded-lg shadow-xl border-2 border-teal-500">
    <SortableActivity activity={activity} onDelete={() => {}} location={location} weather={weather} />
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
  const images = element.querySelectorAll('img, [style*="background-image"]');
  const imagePromises: Promise<void>[] = [];

  images.forEach((img) => {
    let imageUrl: string | null = null;

    if (img instanceof HTMLImageElement) {
      imageUrl = img.src;
    } else {
      // Handle background images
      const style = window.getComputedStyle(img);
      const backgroundImage = style.backgroundImage;
      const match = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1]) {
        imageUrl = match[1];
      }
    }

    if (imageUrl) {
      const promise = new Promise<void>((resolve) => {
        const testImg = new Image();
        testImg.crossOrigin = 'anonymous';
        
        testImg.onload = () => {
          console.log(`✅ Image preloaded successfully: ${imageUrl}`);
          resolve();
        };
        
        testImg.onerror = () => {
          console.warn(`⚠️ Failed to preload image: ${imageUrl}`);
          // Don't reject, just resolve to continue with other images
          resolve();
        };
        
        testImg.src = imageUrl;
      });
      
      imagePromises.push(promise);
    }
  });

  if (imagePromises.length > 0) {
    console.log(`🔄 Preloading ${imagePromises.length} images...`);
    await Promise.all(imagePromises);
    console.log(`✅ All images preloaded successfully`);
  }
};

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { dailyItinerary, updateItinerary, destinations, weatherData } = useAppContext();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null);
  const [draggedLocation, setDraggedLocation] = useState<string | undefined>(undefined);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreloadingImages, setIsPreloadingImages] = useState(false);
  
  // Ref for the content to be exported as PDF
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

  const getLocationForDay = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? `${destination.name}, ${destination.country}` : undefined;
  };

  const calculateDayDuration = (activities: ScheduledActivity[]): number => {
    return activities.reduce((total, activity) => total + activity.activity.duration, 0);
  };

  const updateDayWarnings = (days: TripDay[]): TripDay[] => {
    return days.map(day => {
      const totalDuration = calculateDayDuration(day.activities);
      const destination = destinations.find(d => d.id === day.destinationId);
      const weatherInfo = destination && weatherData ? weatherData[destination.name] : null;
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
        setDraggedLocation(getLocationForDay(draggedDay.destinationId));
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
      setDraggedLocation(undefined);
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
      setDraggedLocation(undefined);
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
    } else {
      // Add to target day at correct position
      const targetIndex = over.id === targetDay.id 
        ? targetDay.activities.length 
        : targetDay.activities.findIndex(a => a.activityId === over.id);
      targetDay.activities.splice(targetIndex, 0, movedActivity);
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
    setDraggedLocation(undefined);
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

  // Enhanced PDF Export functionality with image preloading
  const handleExportPDF = async () => {
    if (!itineraryContentRef.current) {
      console.error('Itinerary content ref is not available');
      return;
    }

    setIsExporting(true);
    setIsPreloadingImages(true);

    try {
      const element = itineraryContentRef.current;
      
      // Step 1: Preload all images to prevent blank areas in PDF
      console.log('🔄 Starting image preloading...');
      await preloadImages(element);
      setIsPreloadingImages(false);
      
      // Step 2: Wait a bit more to ensure all images are rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Generate PDF with high quality settings
      console.log('🔄 Starting PDF generation...');
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'travel_itinerary.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2, // High quality scaling
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false, // Reduce console noise
          imageTimeout: 15000, // Longer timeout for images
          removeContainer: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(options).from(element).save();
      
      console.log('✅ PDF exported successfully');
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setIsPreloadingImages(false);
    }
  };

  // Group days by destination
  const daysByDestination = dailyItinerary.reduce((acc, day) => {
    if (!acc[day.destinationId]) {
      acc[day.destinationId] = [];
    }
    acc[day.destinationId].push(day);
    return acc;
  }, {} as Record<string, TripDay[]>);

  // Get export button text based on current state
  const getExportButtonText = () => {
    if (isPreloadingImages) return 'Preparing Images...';
    if (isExporting) return 'Generating PDF...';
    return 'Export as PDF';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Itinerary</h1>
        
        {/* Export PDF Button */}
        {dailyItinerary.length > 0 && (
          <button
            onClick={handleExportPDF}
            disabled={isExporting || isPreloadingImages}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isExporting || isPreloadingImages
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl'
            }`}
          >
            <Download size={20} />
            {getExportButtonText()}
          </button>
        )}
      </div>
      
      {/* Main content container for PDF export */}
      <div ref={itineraryContentRef} id="pdf-preview">
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
            <div className="space-y-8">
              {Object.entries(daysByDestination).map(([destinationId, days]) => {
                const location = getLocationForDay(destinationId);
                return (
                  <div key={destinationId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 text-white">
                      <h2 className="text-xl font-semibold">{location}</h2>
                      <p className="text-sm opacity-90">{days.length} {days.length === 1 ? 'day' : 'days'}</p>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {days.map((day, index) => (
                        <div 
                          key={day.id}
                          className={`p-6 ${activeDroppableId === day.id ? 'bg-gray-50' : ''}`}
                        >
                          <div className="mb-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                                <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
                              </div>
                              {day.weatherData && (
                                <WeatherDisplay weather={day.weatherData} />
                              )}
                            </div>
                            {day.warning && (
                              <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-center">
                                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                                {day.warning}
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
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No activities scheduled yet.</p>
            <button
              onClick={() => navigate('/activities')}
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Add Activities
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/activities')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Activities
        </button>
      </div>
    </div>
  );
};

export default ItineraryPage;