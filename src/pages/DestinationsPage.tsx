import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Destination } from '../types';
import { v4 as uuidv4 } from 'uuid';
import CityAutocomplete from '../components/CityAutocomplete';

const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { destinations, addDestination, removeDestination, updateDestination, setDates, startDate, endDate } = useAppContext();
  
  const [cityName, setCityName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission for adding a new destination
  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityName.trim()) {
      setError('Please select a city from the dropdown');
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
      country: selectedCountry || 'Unknown',
      days: 3, // Default to 3 days
      image: `https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg` // Default image
    };
    
    addDestination(newDestination);
    
    // Reset form
    setCityName('');
    setSelectedCountry('');
    setError(null);
  };
  
  // Handle city selection from autocomplete
  const handleCityChange = (value: string, country?: string) => {
    setCityName(value);
    if (country) {
      setSelectedCountry(country);
    }
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
      
      {/* Trip Dates Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Travel Dates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Trip End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={startDate ? formatDateForInput(startDate) : ''}
              disabled={!startDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
            />
          </div>
        </div>
        
        {startDate && endDate && (
          <div className="mt-4 p-3 bg-teal-50 rounded-lg">
            <p className="text-teal-700 font-medium">
              Total trip duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        )}
      </div>
      
      {/* Destinations Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Destinations</h2>
        
        {/* Add Destination Form */}
        <form onSubmit={handleAddDestination} className="mb-6">
          <div className="flex gap-4 items-end">
            {/* Destination Input with Autocomplete */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type destination (a, b, c...)
              </label>
              <CityAutocomplete
                value={cityName}
                onChange={handleCityChange}
                placeholder="e.g., Paris"
                error={!!error && error.includes('city')}
                className="text-lg py-3"
              />
            </div>
            
            {/* Add Destination Button */}
            <div>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap text-lg"
              >
                Add Destination
              </button>
            </div>
          </div>
        </form>
        
        {/* Added Destinations List */}
        {destinations.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Destinations</h3>
            <div className="space-y-3">
              {destinations.map((destination, index) => (
                <div 
                  key={destination.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  {/* Destination Letter & Name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-lg">{destination.name}</span>
                      {destination.country && (
                        <span className="text-gray-500 ml-2">({destination.country})</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Days to Stay Input */}
                  <div className="flex items-center gap-3 mx-6">
                    <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      Days to stay:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={destination.days}
                      onChange={(e) => handleDaysChange(destination.id, parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
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
            
            {/* Total Days Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">
                Total destination days: {destinations.reduce((sum, dest) => sum + dest.days, 0)} days
                {startDate && endDate && destinations.reduce((sum, dest) => sum + dest.days, 0) > Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) && (
                  <span className="text-red-600 ml-2">
                    (⚠️ Exceeds trip duration)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
        
        {destinations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Add your first destination to get started</p>
          </div>
        )}
      </div>
      
      {/* Navigation Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/activities')}
          disabled={!canProceed}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-xl transition-colors ${
            canProceed
              ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Select Activities
        </button>
        
        {!canProceed && (
          <div className="mt-3 text-sm text-gray-500">
            {!startDate || !endDate ? (
              <p>📅 Please select both start and end dates</p>
            ) : destinations.length === 0 ? (
              <p>📍 Add at least one destination to continue</p>
            ) : (
              <p>✅ Ready to continue!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;