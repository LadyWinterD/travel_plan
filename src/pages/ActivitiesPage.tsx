import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity } from '../types';
import { Clock, Star, DollarSign, Check, MapPin } from 'lucide-react';
import { getMockActivities } from '../utils/mockData';

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, selectedActivities, toggleActivity } = useAppContext();
  
  const [activeDestination, setActiveDestination] = useState<string | null>(
    destinations.length > 0 ? destinations[0].id : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Load activities for the selected destination
  useEffect(() => {
    if (!activeDestination) return;
    
    setLoading(true);
    console.log('Loading activities for destination:', activeDestination);
    
    // For now, use mock data
    const destinationActivities = getMockActivities(activeDestination);
    setActivities(destinationActivities);
    setLoading(false);
    
  }, [activeDestination]);
  
  // If no destinations are available, redirect to destinations page
  useEffect(() => {
    if (destinations.length === 0) {
      console.log('No destinations found, redirecting to destinations page');
      navigate('/destinations');
    }
  }, [destinations, navigate]);
  
  // Check if an activity is selected
  const isActivitySelected = (destinationId: string, activityId: string): boolean => {
    return selectedActivities[destinationId]?.some(a => a.id === activityId) || false;
  };
  
  // Format duration in hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };
  
  // Get the current destination object
  const currentDestination = destinations.find(d => d.id === activeDestination);
  
  if (destinations.length === 0) {
    return null; // Redirect handled by useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Activities</h1>
      
      {/* Destination Tabs */}
      <div className="mb-8">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => setActiveDestination(destination.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center ${
                activeDestination === destination.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <MapPin size={16} className="mr-1" />
              {destination.name}
              {selectedActivities[destination.id]?.length > 0 && (
                <span className="ml-2 bg-white text-teal-600 text-xs rounded-full px-2 py-0.5">
                  {selectedActivities[destination.id].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Destination Info */}
      {currentDestination && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentDestination.name}, {currentDestination.country}</h2>
              <p className="mt-1">Duration: {currentDestination.days} {currentDestination.days === 1 ? 'day' : 'days'}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 rounded-md px-4 py-2">
                <p className="text-sm">Selected Activities: {selectedActivities[currentDestination.id]?.length || 0}</p>
                <p className="text-sm mt-1">Recommended: 2-4 activities per day</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Activities List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
                isActivitySelected(activeDestination!, activity.id) ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <div 
                className="h-48 bg-center bg-cover relative"
                style={{ backgroundImage: `url(${activity.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-white font-semibold text-lg">{activity.name}</h3>
                </div>
                {isActivitySelected(activeDestination!, activity.id) && (
                  <div className="absolute top-2 right-2 bg-teal-500 text-white p-1 rounded-full">
                    <Check size={20} />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2 h-10">{activity.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="flex items-center text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    <Clock size={14} className="mr-1" />
                    {formatDuration(activity.duration)}
                  </div>
                  
                  <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                    <Star size={14} className="mr-1" />
                    {activity.rating.toFixed(1)}
                  </div>
                  
                  {activity.price && (
                    <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      <DollarSign size={14} className="mr-1" />
                      {activity.price.amount} {activity.price.currencyCode}
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => toggleActivity(activeDestination!, activity)}
                    className={`w-full py-2 rounded-md transition-colors ${
                      isActivitySelected(activeDestination!, activity.id)
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    {isActivitySelected(activeDestination!, activity.id) ? 'Remove' : 'Add to Itinerary'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activities.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No activities found for this destination.</p>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/destinations')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Destinations
        </button>
        
        <button
          onClick={() => navigate('/itinerary')}
          className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
        >
          Continue to Itinerary
        </button>
      </div>
    </div>
  
  );
};

export default ActivitiesPage;