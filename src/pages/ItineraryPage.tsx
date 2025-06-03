import React, { useState, useEffect, useCallback } from 'react';
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

interface SortableActivityProps {
  activity: ScheduledActivity;
  onDelete: () => void;
  isDragging?: boolean;
}

const SortableActivity: React.FC<SortableActivityProps> = ({ activity, onDelete, isDragging }) => {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const ActivityContent = (
    <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 group bg-white rounded-lg">
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
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded mr-2 touch-none"
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`transition-transform duration-200 ease-in-out ${isDragging ? 'z-50' : ''}`}
    >
      {ActivityContent}
    </div>
  );
};

const DragOverlayContent: React.FC<{ activity: ScheduledActivity }> = ({ activity }) => (
  <div className="bg-white rounded-lg shadow-lg border border-teal-500">
    <SortableActivity activity={activity} onDelete={() => {}} isDragging />
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
  const { dailyItinerary, updateItinerary } = useAppContext();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null);

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
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = dailyItinerary.findIndex(day => 
        day.activities.some(activity => activity.activityId === active.id)
      );
      
      if (oldIndex !== -1) {
        const newItinerary = [...dailyItinerary];
        const dayActivities = [...newItinerary[oldIndex].activities];
        
        const oldActivityIndex = dayActivities.findIndex(
          activity => activity.activityId === active.id
        );
        const newActivityIndex = dayActivities.findIndex(
          activity => activity.activityId === over.id
        );

        newItinerary[oldIndex].activities = arrayMove(
          dayActivities,
          oldActivityIndex,
          newActivityIndex
        );

        updateItinerary(newItinerary);
      }
    }

    setActiveId(null);
    setDraggedActivity(null);
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
    });
    
    updateItinerary(newItinerary);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Itinerary</h1>
      
      {dailyItinerary.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
        >
          <div className="space-y-6">
            {dailyItinerary.map((day, index) => (
              <div key={day.date} className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                  <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
                </div>
                
                <SortableContext items={day.activities.map(a => a.activityId)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {day.activities.map((activity) => (
                      <SortableActivity
                        key={activity.activityId}
                        activity={activity}
                        onDelete={() => handleDeleteActivity(day.date, activity.activityId)}
                        isDragging={activity.activityId === activeId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
          
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {draggedActivity ? <DragOverlayContent activity={draggedActivity} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No activities scheduled yet.</p>
          <button
            onClick={() => navigate('/activities')}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
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