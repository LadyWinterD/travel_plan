import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, List, Sun } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  console.log('HomePage component rendering...'); // 添加调试日志
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-center bg-cover z-[-1]" 
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg)' }}
        ></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Plan Your Dream Trip
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Create the perfect itinerary with weather-optimized activities for multiple destinations
          </p>
          <button 
            onClick={() => navigate('/destinations')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg transition-colors duration-300 shadow-lg"
          >
            Start Planning
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-teal-100 text-teal-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <MapPin size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Add Destinations</h3>
              <p className="text-gray-600 text-sm sm:text-base">Choose multiple cities and allocate days for each location</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Sun size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Select Activities</h3>
              <p className="text-gray-600 text-sm sm:text-base">Browse and choose from top-rated activities in each destination</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Calendar size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Optimize Itinerary</h3>
              <p className="text-gray-600 text-sm sm:text-base">Smart scheduling based on weather forecasts and activity duration</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <List size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Customize & Share</h3>
              <p className="text-gray-600 text-sm sm:text-base">Edit your itinerary and save or export for your trip</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gray-100 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to start your adventure?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Create your personalized travel itinerary in minutes, optimized for the best experience.
          </p>
          <button 
            onClick={() => navigate('/destinations')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg transition-colors duration-300"
          >
            Plan Your Trip
          </button>
        </div>

        {/* 🎨 PROFESSIONAL: Static Bolt.new Badge - Bottom Right */}
        <div className="absolute bottom-8 right-8">
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              {/* Badge Image */}
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt.new" 
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-3xl"
              />
              
              {/* Subtle Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-150"></div>
              
              {/* Pulse Animation Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            </div>
            
            {/* Professional Tooltip */}
            <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
              <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap shadow-2xl border border-white/10">
                <div className="font-semibold">Built with Bolt.new</div>
                <div className="text-xs text-gray-300 mt-1">AI-Powered Development</div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;