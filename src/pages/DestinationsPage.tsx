import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Destination } from '../types';
import { v4 as uuidv4 } from 'uuid';

const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, addDestination, removeDestination, updateDestination, setDates, startDate, endDate } = useAppContext();
  
  const [cityName, setCityName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission for adding a new destination
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityName.trim()) {
      setError('Please enter a city name');
      return;
    }
    
    // Check if destination already exists
    if (destinations.some(dest => dest.name.toLowerCase() === cityName.toLowerCase())) {
      setError('This destination has already been added');
      return;
    }
    
    const newDestination: Destination = {
      id: uuidv4(),
      name: cityName.trim(),
      country: '', // We'll set this as empty for now
      days: 3, // Default to 3 days
      image: `https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg` // Default image
    };
    
    addDestination(newDestination);
    
    // Reset form
    setCityName('');
    setError(null);
  };
  
  // Handle days change for a destination
  const handleDaysChange = (destinationId: string, days: number) => {
    updateDestination(destinationId, { days: Math.max(1, days) });
  };
  
  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    setDates(newStartDate, endDate);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Main Container & Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Trip</h1>
        <p className="text-gray-600">First, add the destinations you want to visit and your travel dates.</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {/* Single Line Form: Destination, Start Date, End Date, Add Button */}
      <div className="mb-8">
        <form onSubmit={handleAddDestination} className="flex gap-3 items-end">
          {/* Destination Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g., Paris"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          {/* Start Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          {/* End Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={startDate ? formatDateForInput(startDate) : ''}
              disabled={!startDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          {/* Add Destination Button */}
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
            >
              Add Destination
            </button>
          </div>
        </form>
      </div>
      
      {/* Added Destinations List */}
      {destinations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Destinations</h2>
          <div className="space-y-3">
            {destinations.map((destination) => (
              <div 
                key={destination.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Destination Name */}
                <div className="flex-1">
                  <span className="font-bold text-gray-900">{destination.name}</span>
                </div>
                
                {/* Days to Stay Input */}
                <div className="flex items-center gap-2 mx-4">
                  <label className="text-sm text-gray-600">Days to stay:</label>
                  <input
                    type="number"
                    min="1"
                    value={destination.days}
                    onChange={(e) => handleDaysChange(destination.id, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeDestination(destination.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove destination"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Navigation Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/activities')}
          disabled={!canProceed}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
            canProceed
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Select Activities
        </button>
        
        {!canProceed && (
          <p className="mt-2 text-sm text-gray-500">
            {destinations.length === 0 
              ? 'Add at least one destination to continue'
              : !startDate || !endDate
              ? 'Select both start and end dates to continue'
              : ''
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;