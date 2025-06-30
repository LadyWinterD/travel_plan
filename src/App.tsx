import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import WatchHowItWorksPage from './pages/WatchHowItWorksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PreferencesForm from './components/PreferencesForm';
import DestinationsPage from './pages/DestinationsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ItineraryPage from './pages/ItineraryPage';
import { AppContextProvider } from './context/AppContext';

function App() {
  console.log('App component rendering...'); // 添加调试日志
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppContextProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/watch-how-it-works" element={<WatchHowItWorksPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
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
    </div>
  );
}

export default App;