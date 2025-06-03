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
  return (
    <AppContextProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/preferences" element={<PreferencesForm />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContextProvider>
  );
}

export default App;