import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Sun, Calendar, Menu, X, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { destinations } = useAppContext();
  
  const getStepNumber = () => {
    const pathMap: Record<string, number> = {
      '/': 1,
      '/destinations': 1,
      '/activities': 2,
      '/itinerary': 3
    };
    return pathMap[location.pathname] || 1;
  };
  
  const stepNumber = getStepNumber();
  
  const navigationItems = [
    { name: 'Plan Trip', path: '/destinations', icon: <MapPin size={18} />, step: 1 },
    { name: 'Activities', path: '/activities', icon: <Sun size={18} />, step: 2, disabled: destinations.length === 0 },
    { name: 'Itinerary', path: '/itinerary', icon: <Calendar size={18} />, step: 3, disabled: destinations.length === 0 }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-teal-600 text-xl sm:text-2xl font-bold">TravelPlanner</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-teal-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {/* About Link */}
            <Link
              to="/about"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-sm lg:text-base ${
                location.pathname === '/about'
                  ? 'text-white bg-teal-600'
                  : 'text-gray-600 hover:text-teal-600'
              }`}
            >
              <Info size={18} />
              <span>About</span>
            </Link>
            
            {/* Planning Steps */}
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.disabled ? '#' : item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors text-sm lg:text-base ${
                  item.step === stepNumber
                    ? 'text-white bg-teal-600'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-teal-600'
                }`}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-100 pt-4">
            {/* About Link */}
            <Link
              to="/about"
              className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                location.pathname === '/about'
                  ? 'text-white bg-teal-600'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Info size={18} />
              <span className="text-base">About</span>
            </Link>
            
            {/* Planning Steps */}
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.disabled ? '#' : item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  item.step === stepNumber
                    ? 'text-white bg-teal-600'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  setIsMenuOpen(false);
                }}
              >
                {item.icon}
                <span className="text-base">{item.name}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;