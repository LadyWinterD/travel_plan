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

      {/* 🎨 PROFESSIONAL: Fixed Bottom-Right Bolt.new Badge */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="relative">
          {/* Badge Container with Professional Styling */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-3 transition-all duration-300 hover:scale-105 hover:shadow-3xl group-hover:bg-white">
            <img 
              src="/logotext_poweredby_360w.png" 
              alt="Powered by Bolt.new" 
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          
          {/* Tooltip on Hover */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Built with Bolt.new
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;