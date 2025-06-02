import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, MapPin, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Destination } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, addDestination, removeDestination, updateDestination, setDates, startDate, endDate } = useAppContext();
  
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [days, setDays] = useState(1);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission for adding a new destination
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new destination:', { cityName, country, days });
    
    if (!cityName || !country) {
      setError('Please fill in both city name and country');
      return;
    }
    
    const newDestination: Destination = {
      id: uuidv4(),
      name: cityName,
      country,
      days,
      image: `https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg` // Default image
    };
    
    addDestination(newDestination);
    
    // Reset form
    setCityName('');
    setCountry('');
    setDays(1);
    setError(null);
  };
  
  // Handle editing a destination
  const handleEditDestination = (destination: Destination) => {
    console.log('Editing destination:', destination);
    setEditMode(destination.id);
    setCityName(destination.name);
    setCountry(destination.country);
    setDays(destination.days);
  };
  
  // Handle saving edited destination
  const handleSaveEdit = () => {
    if (editMode && cityName && country) {
      console.log('Saving edited destination:', { id: editMode, cityName, country, days });
      updateDestination(editMode, {
        name: cityName,
        country,
        days
      });
      
      // Reset form and exit edit mode
      setCityName('');
      setCountry('');
      setDays(1);
      setEditMode(null);
    }
  };
  
  // Calculate total days
  const totalDays = destinations.reduce((sum, dest) => sum + dest.days, 0);
  
  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    console.log('Setting start date:', newStartDate);
    setDates(newStartDate, endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    console.log('Setting end date:', newEndDate);
    setDates(startDate, newEndDate);
  };
  
  // Format dates for input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Check if can proceed to next page
  const canProceed = destinations.length > 0 && startDate && endDate;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Plan Your Trip</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Trip Dates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          Trip Dates
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={startDate ? formatDateForInput(startDate) : ''}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={!startDate}
            />
          </div>
        </div>
        
        {startDate && endDate && (
          <div className="mt-4 text-sm text-gray-600">
            Total trip duration: <span className="font-semibold">{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
          </div>
        )}
      </div>
      
      {/* Destinations */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MapPin className="mr-2" size={20} />
          Destinations
        </h2>
        
        {/* Add Destination Form */}
        <form 
          onSubmit={editMode ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleAddDestination}
          className="mb-6 p-4 border border-gray-200 rounded-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">
                City Name
              </label>
              <input
                type="text"
                id="cityName"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g., Paris"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., France"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                id="days"
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value)))}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            {editMode ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(null);
                    setCityName('');
                    setCountry('');
                    setDays(1);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center"
                >
                  <Edit2 size={16} className="mr-1" />
                  Update Destination
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Destination
              </button>
            )}
          </div>
        </form>
        
        {/* Destinations List */}
        {destinations.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium mb-3">Your Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((destination) => (
                <div 
                  key={destination.id}
                  className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                    editMode === destination.id ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  <div 
                    className="h-32 bg-center bg-cover"
                    style={{ backgroundImage: `url(${destination.image || 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg'})` }}
                  ></div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg">{destination.name}</h4>
                    <p className="text-gray-600">{destination.country}</p>
                    <p className="text-sm text-gray-500 mt-1">{destination.days} {destination.days === 1 ? 'day' : 'days'}</p>
                    
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditDestination(destination)}
                        className="p-1.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => removeDestination(destination.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Total days across all destinations: <span className="font-semibold">{totalDays}</span>
              {startDate && endDate && totalDays > Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) && (
                <p className="text-red-500 mt-1">
                  Warning: Total destination days exceed your trip duration. Please adjust either your trip dates or destination days.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Add your first destination to get started</p>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Home
        </button>
        
        <button
          onClick={() => navigate('/activities')}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-md transition-colors ${
            canProceed
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Activities
        </button>
      </div>
    </div>
  );
};

export default DestinationsPage;