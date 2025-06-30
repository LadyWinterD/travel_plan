import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Globe, Sparkles, Zap, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Apple-inspired minimalism */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        
        {/* Floating geometric shapes - very subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-teal-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center max-w-5xl">
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 mb-8 border border-gray-200/50">
            <Sparkles size={16} className="text-blue-500" />
            <span>Introducing the future of travel planning</span>
          </div>
          
          {/* Main headline - Apple-style typography */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-gray-900 mb-8 leading-[0.9] tracking-tight">
            Stop letting
            <br />
            <span className="font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              bad weather
            </span>
            <br />
            ruin your travels
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            The intelligent trip planner that adapts your itinerary to the forecast, 
            so you always get the perfect day.
          </p>
          
          {/* CTA Button - Apple-style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => navigate('/destinations')}
              className="group relative bg-black text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:bg-gray-800 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-3">
                Start Planning For Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors">
              Watch how it works
            </button>
          </div>
          
          {/* Trust indicators - minimal */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              <span>Real-time weather data</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              <span>Worldwide destinations</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section - Clean and minimal */}
      <section className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Plan your perfect trip in
              <br />
              <span className="font-semibold">3 simple steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              We handle all the complex planning with AI, so you can focus on exploring and enjoying.
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-2xl font-light">1</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Add destinations</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                Tell us where you want to go and for how long. Paris for 3 days, then London for 4? No problem.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-2xl font-light">2</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Pick adventures</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                Browse real, highly-rated activities for each city. See photos, descriptions, and weather-based recommendations.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                  <span className="text-2xl font-light">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get smart itinerary</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                Our intelligent engine schedules activities on the best days based on weather forecasts. Export to sheets included.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Apple-style cards */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Built for the way
              <br />
              <span className="font-semibold">you actually travel</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl border border-blue-100/50 hover:shadow-lg transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-powered planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms analyze weather patterns, activity ratings, and your preferences to create the perfect itinerary.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl border border-purple-100/50 hover:shadow-lg transition-all duration-500">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weather protection</h3>
              <p className="text-gray-600 leading-relaxed">
                Never get caught in the rain again. We automatically adjust your plans based on real-time weather forecasts.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-3xl border border-teal-100/50 hover:shadow-lg transition-all duration-500">
              <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global coverage</h3>
              <p className="text-gray-600 leading-relaxed">
                From bustling cities to hidden gems, we cover destinations worldwide with authentic, highly-rated activities.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Philosophy Section - Simplified without hackathon reference */}
      <section className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-8 tracking-tight">
              Our mission:
              <br />
              <span className="font-semibold">Planning should be part of the fun</span>
            </h2>
            
            <div className="space-y-8 text-xl text-gray-600 leading-relaxed font-light">
              <p>
                We believe planning a trip should be as joyful and exciting as the journey itself. 
                For too long, travelers have been frustrated by a simple, age-old problem: <strong className="font-semibold text-gray-900">"What if it rains?"</strong>
              </p>
              
              <p>
                An unexpected downpour can cancel that perfect beach day, and a sudden heatwave 
                can make exploring a historic city unbearable.
              </p>
            </div>
            
            {/* Stats - minimal and elegant */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-16">
              <div className="text-center">
                <div className="text-4xl font-light text-gray-900 mb-2">100+</div>
                <div className="text-gray-600">Cities worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-gray-900 mb-2">24/7</div>
                <div className="text-gray-600">Weather monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-gray-900 mb-2">AI</div>
                <div className="text-gray-600">Powered recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section - Premium and clean */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-8 leading-tight tracking-tight">
            Ready to build your
            <br />
            <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              weather-proof vacation?
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed font-light">
            Join thousands of smart travelers who never worry about the weather ruining their plans again.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => navigate('/destinations')}
              className="group bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-3">
                Create Your First Itinerary Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
          
          {/* Trust signals - minimal */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Trusted by 10,000+ travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} />
              <span>5-star experience</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;