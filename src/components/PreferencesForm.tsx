import React from 'react';
import { useNavigate } from 'react-router-dom';
import { activityCategories, ActivityCategory } from '../data/activityCategories';
import { useAppContext } from '../context/AppContext';

const PreferencesForm: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useAppContext();

  const handleToggleCategory = (category: ActivityCategory) => {
    const newPreferences = preferences.includes(category)
      ? preferences.filter(p => p !== category)
      : [...preferences, category];
    updatePreferences(newPreferences);
  };

  const handleContinue = () => {
    navigate('/destinations');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Travel Interests</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600 mb-6">
          Select the types of activities you're most interested in. This will help us personalize your travel recommendations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {activityCategories.map((category) => (
            <label
              key={category}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                preferences.includes(category)
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={preferences.includes(category)}
                onChange={() => handleToggleCategory(category)}
                className="sr-only"
              />
              <span className={`text-lg ${
                preferences.includes(category) ? 'text-teal-700' : 'text-gray-700'
              }`}>
                {category}
              </span>
            </label>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Selected: {preferences.length} / {activityCategories.length}
          </p>
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            Continue to Destinations
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesForm;