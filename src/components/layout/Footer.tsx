import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-teal-400">TravelPlanner</h3>
            <p className="text-gray-300 mt-2">Plan your perfect trip with ease</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-teal-400 transition-colors">Home</a></li>
                <li><a href="/destinations" className="text-gray-300 hover:text-teal-400 transition-colors">Plan Trip</a></li>
                <li><a href="/activities" className="text-gray-300 hover:text-teal-400 transition-colors">Activities</a></li>
                <li><a href="/itinerary" className="text-gray-300 hover:text-teal-400 transition-colors">Itinerary</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">About</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-teal-400 transition-colors flex items-center space-x-1"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center md:text-left">
          <p className="text-gray-400">© {currentYear} TravelPlanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;