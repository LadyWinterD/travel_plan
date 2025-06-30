import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Globe, Sparkles, Zap, Shield, Search, MapPin, Compass, Clock, Heart, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* 🎨 REDESIGNED: Modern Hero Section with Better Visual Hierarchy */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating orbs with better colors */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-100/20 to-emerald-100/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center max-w-6xl">
          {/* 🎯 ENHANCED: Better Social Proof Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium mb-8 shadow-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-gray-700">Join 10,000+ smart travelers</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          
          {/* 🎨 REDESIGNED: More Impactful Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 leading-[0.85] tracking-tight">
            Travel Planning
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Made Simple
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full opacity-60"></div>
            </span>
          </h1>
          
          {/* 🎯 ENHANCED: More Compelling Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Stop wasting hours on Google searches. Our AI finds amazing activities 
            <span className="font-semibold text-teal-600"> instantly</span> and optimizes your schedule 
            <span className="font-semibold text-blue-600"> perfectly</span> for the weather.
          </p>
          
          {/* 🎨 REDESIGNED: More Attractive CTA Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={() => navigate('/destinations')}
              className="group relative bg-gradient-to-r from-teal-500 via-blue-500 to-teal-600 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-teal-500/25 transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-3">
                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                Start Planning For Free
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
            
            <button 
              onClick={() => navigate('/watch-how-it-works')}
              className="group flex items-center gap-3 text-gray-700 hover:text-teal-600 font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center group-hover:border-teal-300 group-hover:bg-teal-50 transition-all">
                <div className="w-0 h-0 border-l-[8px] border-l-teal-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </div>
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* 🎯 ENHANCED: Better Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <CheckCircle size={18} className="text-green-500" />
              <span className="font-medium">100% Free Forever</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <Star size={18} className="text-yellow-500" />
              <span className="font-medium">Real Photos & Reviews</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
              <Globe size={18} className="text-blue-500" />
              <span className="font-medium">1000+ Cities Worldwide</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🎨 REDESIGNED: Problem-Solution Section (New Addition) */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, teal 2px, transparent 2px), radial-gradient(circle at 75% 75%, blue 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              The Travel Planning Problem
              <br />
              <span className="text-teal-400">We Actually Solve</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Problem Side */}
            <div className="space-y-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">😤</div>
                  <h3 className="text-2xl font-bold text-red-400">The Old Way Sucks</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Hours wasted scrolling through endless Google results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Fake reviews and outdated information everywhere</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Perfect outdoor plans ruined by unexpected rain</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Overwhelming choices with no clear guidance</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Solution Side */}
            <div className="space-y-8">
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🚀</div>
                  <h3 className="text-2xl font-bold text-teal-400">The TravelPlanner Way</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <span>AI finds the best activities in seconds, not hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <span>Real photos and verified ratings from trusted sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <span>Weather-smart scheduling prevents disappointment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <span>Personalized recommendations based on your interests</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🎨 REDESIGNED: How It Works with Better Visual Design */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-bold mb-6">
              <Zap size={16} />
              <span>Lightning Fast Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              From Idea to Itinerary in
              <br />
              <span className="text-teal-600">Under 5 Minutes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Our AI-powered platform does the heavy lifting so you can focus on the fun part: exploring!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 - Enhanced Design */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin size={28} />
                  </div>
                  <div className="text-6xl font-black text-teal-100">01</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tell Us Where</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Just type any city name. Our smart autocomplete helps you find destinations worldwide, 
                  from Paris to hidden gems you've never heard of.
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <Clock size={16} />
                  <span>Takes 30 seconds</span>
                </div>
              </div>
            </div>
            
            {/* Step 2 - Enhanced Design */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Search size={28} />
                  </div>
                  <div className="text-6xl font-black text-blue-100">02</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Finds Gold</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Our AI instantly discovers amazing activities with real photos and reviews. 
                  No more endless scrolling through fake listings or outdated information.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <Sparkles size={16} />
                  <span>Powered by real data</span>
                </div>
              </div>
            </div>
            
            {/* Step 3 - Enhanced Design */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap size={28} />
                  </div>
                  <div className="text-6xl font-black text-purple-100">03</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect Schedule</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Weather-smart AI creates your perfect itinerary. Outdoor adventures on sunny days, 
                  cozy museums when it rains. Export to sheets included.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                  <Shield size={16} />
                  <span>Weather protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🎨 NEW: Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Loved by Travelers
              <br />
              <span className="text-teal-600">Worldwide</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users size={32} className="text-white" />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Happy Travelers</div>
            </div>
            
            {/* Stat 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe size={32} className="text-white" />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
            
            {/* Stat 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart size={32} className="text-white" />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">99%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 🎨 REDESIGNED: Final CTA with Better Design */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-8">
            <Sparkles size={16} className="text-teal-400" />
            <span>Ready to Transform Your Travel Planning?</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
            Stop Googling.
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start Exploring.
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
            Join thousands of smart travelers who've discovered the secret to stress-free trip planning. 
            Your perfect adventure is just 3 clicks away.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <button 
              onClick={() => navigate('/destinations')}
              className="group relative bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-teal-500/25 transform hover:-translate-y-2"
            >
              <span className="flex items-center gap-4">
                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                Create My Perfect Trip
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </span>
              {/* Enhanced shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>
          
          {/* Enhanced trust signals */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              <span className="font-medium">Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              <span className="font-medium">No Sign-up Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-teal-400" />
              <span className="font-medium">Instant Results</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;