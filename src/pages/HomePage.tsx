import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, List, Sun, Cloud, CloudRain, ArrowRight, CheckCircle, Star, Users, Globe } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Weather-Focused Problem Statement */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-32 w-48 h-48 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-xl"></div>
        </div>
        
        {/* Weather Icons Floating Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-white/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <Sun size={40} />
          </div>
          <div className="absolute top-1/3 right-1/4 text-white/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <Cloud size={35} />
          </div>
          <div className="absolute bottom-1/3 left-1/3 text-white/20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
            <CloudRain size={30} />
          </div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          {/* Problem Statement */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Stop Letting Bad Weather
              <br />
              <span className="text-yellow-300">Ruin Your Travels</span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Introducing <span className="font-bold text-yellow-300">TravelPlanner</span>: The intelligent trip planner that adapts your itinerary to the forecast, so you always get the perfect day.
            </p>
          </div>
          
          {/* CTA Button */}
          <button 
            onClick={() => navigate('/destinations')}
            className="group bg-white text-gray-900 font-bold px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 hover:bg-yellow-50 border-4 border-transparent hover:border-yellow-300"
          >
            <span className="flex items-center gap-3">
              Start Planning For Free
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} />
              <span>Real-Time Weather Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>Worldwide Destinations</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Plan Your Perfect Trip in 3 Simple Steps
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              我们用AI为您处理所有复杂的规划，您只需专注于探索和享受。
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <MapPin size={40} className="sm:w-12 sm:h-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Add Your Destinations</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Tell us where you want to go and for how long. Paris for 3 days, then London for 4? No problem.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <Sun size={40} className="sm:w-12 sm:h-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Pick Your Adventures</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Browse real, highly-rated activities for each city. See photos, descriptions, and our weather-based recommendations, then add your favorites to the plan.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <Calendar size={40} className="sm:w-12 sm:h-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Get Your Smart Itinerary</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Our intelligent engine schedules your chosen activities on the best possible days based on weather forecasts, saving your itinerary for you to view, edit, and export.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <List size={16} />
                Export to Sheets
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Philosophy Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Our Mission: Planning Should Be Part of the Fun
            </h2>
            
            <div className="prose prose-lg sm:prose-xl max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                We believe planning a trip should be as joyful and exciting as the journey itself. For too long, travelers have been frustrated by a simple, age-old problem: <strong>"What if it rains?"</strong>
              </p>
              
              <p>
                An unexpected downpour can cancel that perfect beach day, and a sudden heatwave can make exploring a historic city unbearable.
              </p>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 my-8">
                <p className="text-teal-700 font-semibold text-lg sm:text-xl mb-4">
                  TravelPlanner was born out of this frustration during the Bolt.new World's Largest Hackathon.
                </p>
                <p>
                  Our mission is to eliminate the stress of "what-if" by building the smartest, most intuitive travel planning tool on the planet. We use real-time data, intelligent recommendations, and a beautiful, user-first design to ensure your only travel surprise is a pleasant one.
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">100+</div>
                <div className="text-gray-600">Cities Worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Weather Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">AI</div>
                <div className="text-gray-600">Powered Recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final Call to Action Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Ready to Build Your Weather-Proof Vacation?
            </h2>
            
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of smart travelers who never worry about the weather ruining their plans again.
            </p>
            
            <button 
              onClick={() => navigate('/destinations')}
              className="group bg-white text-gray-900 font-bold px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 hover:bg-yellow-50 border-4 border-transparent hover:border-yellow-300"
            >
              <span className="flex items-center gap-3">
                Create Your First Itinerary Now
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            {/* Additional Trust Signals */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Trusted by 10,000+ Travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} />
                <span>5-Star Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;