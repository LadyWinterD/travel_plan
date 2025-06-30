import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-teal-400">TravelPlanner</h3>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">Plan your perfect trip with ease</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Home</a></li>
                <li><a href="/destinations" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Plan Trip</a></li>
                <li><a href="/activities" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Activities</a></li>
                <li><a href="/itinerary" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Itinerary</a></li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-2">About</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors text-sm sm:text-base">Terms of Service</a></li>
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-teal-400 transition-colors flex items-center justify-center sm:justify-start space-x-1 text-sm sm:text-base"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-gray-400 text-sm sm:text-base">© {currentYear} TravelPlanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;