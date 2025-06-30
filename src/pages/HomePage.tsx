import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* 🍎 APPLE STYLE: Hero Section with Massive Typography and Minimal Elements */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Subtle Background Gradient - Very Apple */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* 🍎 APPLE STYLE: Massive, Clean Typography */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-thin text-gray-900 mb-8 tracking-tight leading-none">
            Travel
            <br />
            <span className="font-light bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          
          {/* 🍎 APPLE STYLE: Simple, Elegant Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-16 font-light leading-relaxed max-w-4xl mx-auto">
            AI finds perfect activities instantly.
            <br className="hidden sm:block" />
            Weather optimizes your schedule automatically.
          </p>
          
          {/* 🍎 APPLE STYLE: Minimal Button Design */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/destinations')}
              className="group bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Start Planning
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/watch-how-it-works')}
              className="group flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
            >
              <div className="w-12 h-12 border-2 border-blue-600 rounded-full flex items-center justify-center group-hover:border-blue-700 transition-colors">
                <Play size={16} className="ml-0.5" />
              </div>
              <span>Watch the film</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* 🍎 APPLE STYLE: Clean Feature Section with Lots of White Space */}
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
          
          {/* 🍎 APPLE STYLE: Clean, Spacious Feature Grid */}
          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8">
                  <span className="text-2xl font-light text-blue-600">1</span>
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
                      <div className="h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center px-4">
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
                      <div className="text-sm text-blue-600 font-medium">22°C Sunny</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-4 h-32 relative">
                        <div className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">FREE</div>
                        <div className="absolute bottom-2 left-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">☀️</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 h-32"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-8">
                  <span className="text-2xl font-light text-purple-600">2</span>
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
                      <div className="text-sm text-green-600 font-medium">Optimized</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-l-4 border-green-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">9:00 AM</span>
                          <span className="text-xs text-green-600">☀️ 22°C</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-l-4 border-blue-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">2:00 PM</span>
                          <span className="text-xs text-blue-600">🏛️ Indoor</span>
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
      
      {/* 🍎 APPLE STYLE: Minimal Stats Section */}
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
      
      {/* 🍎 APPLE STYLE: Final CTA with Minimal Design */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-thin mb-8 tracking-tight leading-tight">
            Ready to explore?
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-16 font-light leading-relaxed">
            Start planning your perfect trip in seconds.
          </p>
          
          <button 
            onClick={() => navigate('/destinations')}
            className="bg-white text-black px-12 py-5 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105"
          >
            Get started
          </button>
          
          <div className="mt-16 text-sm text-gray-500 font-light">
            Free forever. No sign-up required.
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;