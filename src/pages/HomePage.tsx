import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Sun, Calendar, CheckCircle, Play } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* 🍎 APPLE STYLE: Hero Section with Massive Typography and Green Theme */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Subtle Background Gradient - Green Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 to-white"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* 🍎 APPLE STYLE: Massive, Clean Typography with Green Accent */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-thin text-gray-900 mb-8 tracking-tight leading-none">
            Travel
            <br />
            <span className="font-light bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          
          {/* 🍎 APPLE STYLE: Simple, Elegant Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-16 font-light leading-relaxed max-w-4xl mx-auto">
            AI finds perfect activities instantly.
            <br className="hidden sm:block" />
            Weather optimizes your schedule automatically.
          </p>
          
          {/* 🍎 APPLE STYLE: Action Buttons - Primary and Secondary */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            {/* Primary Action Button */}
            <button 
              onClick={() => navigate('/destinations')}
              className="group bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-12 py-5 rounded-full text-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-3">
                Start Planning Your Trip
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            {/* 🆕 NEW: Tutorial Button */}
            <button 
              onClick={() => navigate('/watch-how-it-works')}
              className="group bg-white text-teal-600 border-2 border-teal-500 px-12 py-5 rounded-full text-xl font-medium hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-3">
                <Play size={24} className="group-hover:scale-110 transition-transform" />
                看教程
              </span>
            </button>
          </div>
          
          {/* Trust Indicator */}
          <div className="mt-8 text-sm text-gray-500 font-light">
            Free forever • No sign-up required • Real attractions
          </div>
        </div>
      </section>
      
      {/* 🍎 APPLE STYLE: Clean Feature Section with Green Accents */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 🍎 APPLE STYLE: Centered, Minimal Headline */}
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-thin text-gray-900 mb-8 tracking-tight">
              Three steps.
              <br />
              <span className="text-gray-500">Infinite possibilities.</span>
            </h2>
          </div>
          
          {/* 🍎 APPLE STYLE: Clean, Spacious Feature Grid with Green Theme */}
          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-8">
                  <span className="text-2xl font-light text-teal-600">1</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-thin text-gray-900 mb-6 leading-tight">
                  Tell us where
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  Simply type any destination. Our intelligent system recognizes cities worldwide 
                  and helps you plan the perfect duration for each location.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    <div className="h-4 bg-gray-100 rounded-full w-1/3"></div>
                    <div className="space-y-4">
                      <div className="h-12 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-xl flex items-center px-4">
                        <span className="text-gray-700 font-medium">Paris, France</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-gray-50 rounded-xl"></div>
                        <div className="h-12 bg-gray-50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                      <div className="text-sm text-teal-600 font-medium">22°C Sunny</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-4 h-32 relative">
                        <div className="absolute top-2 right-2 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">FREE</div>
                        <div className="absolute bottom-2 left-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">☀️</div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl p-4 h-32"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
                  <span className="text-2xl font-light text-emerald-600">2</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-thin text-gray-900 mb-6 leading-tight">
                  AI finds magic
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  Our intelligence discovers authentic experiences with real photos and reviews. 
                  Weather data ensures perfect timing for every activity.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                  <span className="text-2xl font-light text-green-600">3</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-thin text-gray-900 mb-6 leading-tight">
                  Perfect schedule
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  Weather-intelligent scheduling creates your ideal itinerary. 
                  Outdoor adventures on sunny days, cozy experiences when it rains.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded-full w-1/3"></div>
                      <div className="text-sm text-emerald-600 font-medium">Optimized</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-l-4 border-emerald-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">9:00 AM</span>
                          <span className="text-xs text-emerald-600">☀️ 22°C</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-4 border-l-4 border-teal-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">2:00 PM</span>
                          <span className="text-xs text-teal-600">🏛️ Indoor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🍎 APPLE STYLE: Minimal Stats Section with Green Theme */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-thin text-gray-900 mb-20 tracking-tight">
            Trusted by travelers worldwide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="text-5xl sm:text-6xl font-thin text-gray-900 mb-4">10K+</div>
              <div className="text-lg text-gray-600 font-light">Happy travelers</div>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-thin text-gray-900 mb-4">1K+</div>
              <div className="text-lg text-gray-600 font-light">Cities covered</div>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-thin text-gray-900 mb-4">99%</div>
              <div className="text-lg text-gray-600 font-light">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🍎 APPLE STYLE: Final CTA with Green Theme */}
      <section className="py-32 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-thin mb-8 tracking-tight leading-tight">
            Ready to explore?
          </h2>
          
          <p className="text-xl sm:text-2xl text-teal-100 mb-16 font-light leading-relaxed">
            Start planning your perfect trip in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => navigate('/destinations')}
              className="bg-white text-teal-600 px-12 py-5 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              Get started
            </button>
            
            <button 
              onClick={() => navigate('/watch-how-it-works')}
              className="bg-white/20 text-white border-2 border-white/30 px-12 py-5 rounded-full text-lg font-medium hover:bg-white/30 transition-all duration-300 backdrop-blur-sm transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Play size={20} />
              看教程
            </button>
          </div>
          
          <div className="mt-16 text-sm text-teal-200 font-light">
            Free forever. No sign-up required.
          </div>
        </div>
      </section>
      
      {/* 🆕 NEW: Features Highlight Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-thin text-gray-900 mb-6">
              Why TravelPlanner is Different
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sun size={32} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Weather Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time weather integration ensures you're never caught off guard. 
                Indoor activities for rainy days, outdoor adventures when it's sunny.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Attractions</h3>
              <p className="text-gray-600 leading-relaxed">
                Authentic attractions from OpenTripMap with real photos, ratings, and detailed information. 
                No fake or outdated listings.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered itinerary optimization considers travel time, opening hours, and weather 
                to create the most efficient trip possible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;