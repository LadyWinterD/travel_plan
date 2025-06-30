import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Globe, Brain, Shield, Users, Star, CheckCircle, ArrowRight, Github, ExternalLink } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">About TravelPlanner</h1>
            <button
              onClick={() => navigate('/destinations')}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Start Planning
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-6">
            <Zap size={16} />
            <span>AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Revolutionizing
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Travel Planning
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            TravelPlanner combines cutting-edge AI technology with real-world data to create 
            the most intelligent travel planning experience ever built.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 sm:p-12 text-white mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl sm:text-2xl leading-relaxed opacity-95">
              To eliminate the stress and uncertainty from travel planning by providing 
              intelligent, weather-aware recommendations that help travelers make the most 
              of every moment of their journey.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another travel app. We're pioneering the future of intelligent travel planning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Brain size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced algorithms analyze weather patterns, user preferences, and real-time data 
                to create perfectly optimized itineraries that adapt to changing conditions.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Globe size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-World Data</h3>
              <p className="text-gray-600 leading-relaxed">
                We source authentic attraction data from OpenTripMap and real-time weather from WeatherAPI, 
                ensuring every recommendation is accurate and up-to-date.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your travel plans stay private. We use local storage and don't track your data, 
                giving you complete control over your personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Built with Cutting-Edge Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TravelPlanner leverages the latest web technologies to deliver a fast, reliable, and beautiful experience.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">⚛️</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">React 18</h4>
                <p className="text-sm text-gray-600">Modern UI framework</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">📘</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">TypeScript</h4>
                <p className="text-sm text-gray-600">Type-safe development</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-600">🎨</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Tailwind CSS</h4>
                <p className="text-sm text-gray-600">Beautiful styling</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Vite</h4>
                <p className="text-sm text-gray-600">Lightning-fast builds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted Data Sources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We partner with industry-leading APIs to provide the most accurate and comprehensive travel information.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">O</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">OpenTripMap</h3>
                  <p className="text-gray-600">Global attraction database</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Access to over 1 million points of interest worldwide with authentic photos, 
                detailed descriptions, and real user ratings.
              </p>
              <a 
                href="https://opentripmap.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
              >
                Learn More <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">W</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">WeatherAPI</h3>
                  <p className="text-gray-600">Real-time weather data</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Accurate weather forecasts and historical data for over 200,000 cities, 
                enabling smart scheduling based on weather conditions.
              </p>
              <a 
                href="https://weatherapi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
              >
                Learn More <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <div className="bg-gray-900 rounded-2xl p-8 sm:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Travelers Worldwide</h2>
              <p className="text-xl text-gray-300">
                Join thousands of smart travelers who never worry about weather ruining their plans.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2">10K+</div>
                <div className="text-lg text-gray-300">Happy Travelers</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">1K+</div>
                <div className="text-lg text-gray-300">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-green-400 mb-2">1M+</div>
                <div className="text-lg text-gray-300">Attractions</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">99%</div>
                <div className="text-lg text-gray-300">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              <Star size={16} />
              <span>Hackathon Project</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Bolt.new World's Largest Hackathon</h2>
            <p className="text-xl mb-6 opacity-90 max-w-3xl mx-auto">
              TravelPlanner was created as a demonstration of what's possible when cutting-edge AI meets 
              practical travel needs. This project showcases the future of intelligent travel planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/LadyWinterD/travel_plan"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Github size={20} />
                View Source Code
              </a>
              <button
                onClick={() => navigate('/destinations')}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Try the Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Revolutionary Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience travel planning like never before with our innovative features.
            </p>
          </div>
          
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Weather-Intelligent Scheduling</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Our AI automatically schedules outdoor activities on sunny days and indoor experiences 
                  when it's raining, ensuring you always have the perfect plan regardless of weather.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Real-time weather integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Automatic activity rescheduling</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>14-day forecast planning</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-8 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌤️</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Smart Weather Planning</h4>
                  <p className="text-gray-600">Never let weather ruin your travel plans again</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Real Attractions</h4>
                    <p className="text-gray-600">Authentic places with real photos and reviews</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentic Travel Data</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Every attraction in our database is real, verified, and comes with authentic photos 
                  and detailed information sourced from trusted APIs.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>1M+ verified attractions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>Real photos and descriptions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span>User ratings and reviews</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 sm:p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Experience the Future?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join the revolution in travel planning. Create your first intelligent itinerary in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/destinations')}
                className="bg-white text-teal-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Start Planning Your Trip
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/watch-how-it-works')}
                className="bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Watch How It Works
              </button>
            </div>
            <div className="mt-6 text-sm opacity-75">
              Free forever • No sign-up required • Privacy-first
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;