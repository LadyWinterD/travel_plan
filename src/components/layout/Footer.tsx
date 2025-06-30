import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8 relative">
      <div className="container mx-auto px-4">
        {/* 🎨 NEW: Redesigned layout to accommodate bottom-right badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Section: Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-teal-400 mb-2">TravelPlanner</h3>
            <p className="text-gray-300 text-sm sm:text-base">Plan your perfect trip with ease</p>
          </div>
          
          {/* Center Section: Quick Links */}
          <div className="text-center">
            <h4 className="text-base sm:text-lg font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="/" className="text-gray-300 hover:text-teal-400 transition-colors">Home</a>
              <a href="/destinations" className="text-gray-300 hover:text-teal-400 transition-colors">Plan Trip</a>
              <a href="/activities" className="text-gray-300 hover:text-teal-400 transition-colors">Activities</a>
              <a href="/itinerary" className="text-gray-300 hover:text-teal-400 transition-colors">Itinerary</a>
            </div>
          </div>
          
          {/* Right Section: About & Social */}
          <div className="text-center md:text-right">
            <h4 className="text-base sm:text-lg font-semibold mb-3">Connect</h4>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Terms</a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-teal-400 transition-colors flex items-center gap-1"
              >
                <Github size={14} />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-gray-400 text-sm sm:text-base">© {currentYear} TravelPlanner. All rights reserved.</p>
        </div>
      </div>
      
      {/* 🎨 PROFESSIONAL: Bolt.new Badge - Fixed Bottom Right */}
      <div className="absolute bottom-6 right-6">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
          title="Built with Bolt.new - AI-Powered Development"
        >
          <div className="relative transform transition-all duration-300 hover:scale-110 hover:rotate-3">
            {/* Badge Image */}
            <img 
              src="/black_circle_360x360.png" 
              alt="Powered by Bolt.new" 
              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-3xl bolt-badge-fixed"
            />
            
            {/* Subtle Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-150"></div>
            
            {/* Pulse Animation Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
          </div>
          
          {/* Professional Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="professional-tooltip text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap shadow-2xl">
              <div className="font-semibold">Built with Bolt.new</div>
              <div className="text-xs text-gray-300 mt-1">AI-Powered Development</div>
              {/* Tooltip Arrow */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
            </div>
          </div>
        </a>
      </div>
    </footer>
  );
};

export default Footer;