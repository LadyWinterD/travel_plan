import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, List, Sun } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-center bg-cover z-[-1]" 
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg)' }}
        ></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Plan Your Dream Trip
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
            Create the perfect itinerary with weather-optimized activities for multiple destinations
          </p>
          <button 
            onClick={() => navigate('/destinations')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors duration-300 shadow-lg"
          >
            Start Planning
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-teal-100 text-teal-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Add Destinations</h3>
              <p className="text-gray-600">Choose multiple cities and allocate days for each location</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Sun size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Select Activities</h3>
              <p className="text-gray-600">Browse and choose from top-rated activities in each destination</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Optimize Itinerary</h3>
              <p className="text-gray-600">Smart scheduling based on weather forecasts and activity duration</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <List size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customize & Share</h3>
              <p className="text-gray-600">Edit your itinerary and save or export for your trip</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your adventure?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your personalized travel itinerary in minutes, optimized for the best experience.
          </p>
          <button 
            onClick={() => navigate('/destinations')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors duration-300"
          >
            Plan Your Trip
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;