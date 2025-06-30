import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import PreferencesForm from './components/PreferencesForm';
import DestinationsPage from './pages/DestinationsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ItineraryPage from './pages/ItineraryPage';
import { AppContextProvider } from './context/AppContext';

function App() {
  console.log('App component rendering...'); // 添加调试日志
  
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AppContextProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/preferences" element={<PreferencesForm />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/itinerary" element={<ItineraryPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AppContextProvider>

      {/* 🎨 PROFESSIONAL: Fixed Bottom-Right Bolt.new Badge - Black Circle Design */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="relative">
          {/* Main Badge Container */}
          <div className="relative transform transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer">
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
        </div>
      </div>
    </div>
  );
}

export default App;