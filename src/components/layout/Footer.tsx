import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* 🎨 REDESIGNED: Perfectly Balanced Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
          
          {/* Left Section: Brand & Description */}
          <div className="text-center lg:text-left lg:flex-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-teal-400 mb-3">TravelPlanner</h3>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              Plan your perfect trip with ease. Discover amazing destinations, find the best activities, and create unforgettable memories.
            </p>
          </div>
          
          {/* Center Section: Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 lg:flex-1">
            
            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-bold mb-4 text-white border-b-2 border-teal-400 pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/destinations" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Plan Trip
                  </a>
                </li>
                <li>
                  <a href="/activities" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Activities
                  </a>
                </li>
                <li>
                  <a href="/itinerary" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Itinerary
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Connect */}
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-bold mb-4 text-white border-b-2 border-teal-400 pb-2 inline-block">
                Connect
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors text-base sm:text-lg hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-teal-400 transition-colors flex items-center gap-2 text-base sm:text-lg hover:underline justify-center sm:justify-start"
                  >
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Section: Bolt.new Badge with Enhanced Design */}
          <div className="flex flex-col items-center lg:items-end lg:flex-1 lg:max-w-xs">
            <div className="text-center lg:text-right mb-4">
              <h4 className="text-lg font-bold text-white mb-2">Powered By</h4>
              <p className="text-gray-400 text-sm">Built with cutting-edge AI technology</p>
            </div>
            
            <a 
              href="https://bolt.new/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group relative"
              title="Built with Bolt.new - AI-Powered Development Platform"
            >
              {/* Enhanced Badge Container */}
              <div className="relative transform transition-all duration-500 hover:scale-110 hover:rotate-6 group-hover:drop-shadow-2xl">
                
                {/* Animated Background Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150 animate-pulse-ring"></div>
                
                {/* Main Badge */}
                <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 p-2 rounded-full shadow-2xl border-2 border-gray-600 group-hover:border-teal-400 transition-all duration-300">
                  <img 
                    src="/black_circle_360x360.png" 
                    alt="Powered by Bolt.new" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 group-hover:brightness-110"
                  />
                </div>
                
                {/* Floating Particles Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 right-2 w-1 h-1 bg-teal-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-3 left-3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-1/2 right-1 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              
              {/* Professional Tooltip */}
              <div className="absolute bottom-full right-0 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-10">
                <div className="bg-gradient-to-r from-gray-900 to-black text-white text-sm px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
                  <div className="font-bold text-teal-400 mb-1">Built with Bolt.new</div>
                  <div className="text-xs text-gray-300">AI-Powered Development Platform</div>
                  <div className="text-xs text-gray-400 mt-1">Click to learn more</div>
                  {/* Enhanced Tooltip Arrow */}
                  <div className="absolute top-full right-8 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </a>
          </div>
        </div>
        
        {/* 🎨 ENHANCED: Copyright Section with Better Spacing */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm sm:text-base">
              © {currentYear} TravelPlanner. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span>Made with ❤️ for travelers</span>
              <span>•</span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;