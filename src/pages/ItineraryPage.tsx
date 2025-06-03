import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Clock, Calendar, Sun, Cloud, CloudRain, Info, AlertTriangle, GripVertical, X, MapPin } from 'lucide-react';
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
}

const SortableActivity: React.FC<SortableActivityProps> = ({ activity, onDelete, isDragging, location }) => {
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
          
          <div 
            className="w-16 h-16 rounded-lg bg-center bg-cover flex-shrink-0"
            style={{ backgroundImage: `url(${activity.activity.image})` }}
          ></div>
          
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
            </div>
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

const DragOverlayContent: React.FC<{ activity: ScheduledActivity; location?: string }> = ({ activity, location }) => (
  <div className="bg-white rounded-lg shadow-xl border-2 border-teal-500">
    <SortableActivity activity={activity} onDelete={() => {}} location={location} />
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

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { dailyItinerary, updateItinerary, destinations } = useAppContext();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null);
  const [draggedLocation, setDraggedLocation] = useState<string | undefined>(undefined);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(null);

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
    
    if (!over || !draggedActivity) return;

    const sourceDay = dailyItinerary.find(day => 
      day.activities.some(a => a.activityId === active.id)
    );
    
    const targetDay = dailyItinerary.find(day => 
      day.activities.some(a => a.activityId === over.id) || day.id === over.id
    );

    if (sourceDay && targetDay && sourceDay.destinationId === targetDay.destinationId) {
      const newItinerary = [...dailyItinerary];
      
      // Remove from source day
      const sourceDayIndex = newItinerary.findIndex(d => d.id === sourceDay.id);
      const sourceActivities = [...newItinerary[sourceDayIndex].activities];
      const activityIndex = sourceActivities.findIndex(a => a.activityId === active.id);
      const [movedActivity] = sourceActivities.splice(activityIndex, 1);
      
      // Add to target day
      const targetDayIndex = newItinerary.findIndex(d => d.id === targetDay.id);
      const targetActivities = [...newItinerary[targetDayIndex].activities];
      
      const overIndex = over.id === targetDay.id 
        ? targetActivities.length 
        : targetActivities.findIndex(a => a.activityId === over.id);
      
      targetActivities.splice(overIndex, 0, movedActivity);
      
      // Update both days
      newItinerary[sourceDayIndex] = {
        ...newItinerary[sourceDayIndex],
        activities: sourceActivities
      };
      
      newItinerary[targetDayIndex] = {
        ...newItinerary[targetDayIndex],
        activities: targetActivities
      };
      
      // Remove empty days
      const filteredItinerary = newItinerary.filter(day => day.activities.length > 0);
      
      updateItinerary(filteredItinerary);
    }

    setActiveId(null);
    setDraggedActivity(null);
    setDraggedLocation(undefined);
    setActiveDroppableId(null);
  };

  const handleDeleteActivity = (date: string, activityId: string) => {
    const newItinerary = dailyItinerary.map(day => {
      if (day.date === date) {
        return {
          ...day,
          activities: day.activities.filter(
            activity => activity.activityId !== activityId
          )
        };
      }
      return day;
    }).filter(day => day.activities.length > 0);
    
    updateItinerary(newItinerary);
  };

  // Group days by destination
  const daysByDestination = dailyItinerary.reduce((acc, day) => {
    if (!acc[day.destinationId]) {
      acc[day.destinationId] = [];
    }
    acc[day.destinationId].push(day);
    return acc;
  }, {} as Record<string, TripDay[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Itinerary</h1>
      
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
                          <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                          <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
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