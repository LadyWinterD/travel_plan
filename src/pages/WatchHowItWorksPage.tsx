import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, MapPin, Sun, Calendar, CheckCircle, Star, Clock, DollarSign, Thermometer, CloudRain, ArrowRight } from 'lucide-react';

const WatchHowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Add Your Destinations",
      description: "Tell us where you want to go and for how long. Our smart autocomplete helps you find any city worldwide.",
      features: [
        "Smart city autocomplete with auto-correction",
        "Set duration for each destination",
        "Multiple destinations supported",
        "Travel date planning"
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create Your Trip</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <div className="relative">
                <input 
                  type="text" 
                  value="Paris" 
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input 
                  type="date" 
                  value="2024-06-15" 
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                <input 
                  type="number" 
                  value="3" 
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <div className="flex items-center text-teal-700">
                <CheckCircle size={16} className="mr-2" />
                <span className="text-sm font-medium">Paris, France added successfully!</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Pick Your Adventures",
      description: "Browse real, highly-rated activities with authentic photos. Our AI recommends the best experiences based on weather and your preferences.",
      features: [
        "Real attractions from OpenTripMap database",
        "Authentic photos and detailed descriptions",
        "Weather-based recommendations",
        "Filter by interests and price"
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Thermometer className="text-blue-500" size={20} />
                <div>
                  <div className="font-semibold">Paris, France</div>
                  <div className="text-sm text-gray-600">22°C, Sunny - Perfect for outdoor activities!</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    FREE
                  </div>
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ☀️ Perfect Weather
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1">Eiffel Tower</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Star size={10} className="text-yellow-500" />
                    <span>4.8</span>
                    <Clock size={10} />
                    <span>2h</span>
                    <DollarSign size={10} />
                    <span>Free</span>
                  </div>
                  <button className="w-full py-2 bg-teal-500 text-white rounded-md text-sm font-medium">
                    Add to Trip
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    $15
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1">Louvre Museum</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Star size={10} className="text-yellow-500" />
                    <span>4.9</span>
                    <Clock size={10} />
                    <span>3h</span>
                    <DollarSign size={10} />
                    <span>$15</span>
                  </div>
                  <button className="w-full py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium border">
                    Add to Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Get Your Smart Itinerary",
      description: "Our AI engine automatically schedules your activities on the best days based on weather forecasts, creating the perfect trip timeline.",
      features: [
        "Weather-optimized scheduling",
        "Automatic time slot allocation",
        "Export to Google Sheets or PDF",
        "Drag-and-drop customization"
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-b">
            <h3 className="font-semibold">Your Smart Itinerary</h3>
            <p className="text-sm text-gray-600">Optimized for perfect weather</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-teal-600" />
                  <span className="font-semibold">Day 1 - June 15</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Sun size={14} className="text-yellow-500" />
                  <span>22°C, Sunny</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <div className="text-xs font-medium text-green-700">9:00 AM</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Eiffel Tower</div>
                    <div className="text-xs text-gray-500">Perfect weather for outdoor sightseeing</div>
                  </div>
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-700">2:00 PM</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Louvre Museum</div>
                    <div className="text-xs text-gray-500">Indoor backup if weather changes</div>
                  </div>
                  <CheckCircle size={16} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-teal-600" />
                  <span className="font-semibold">Day 2 - June 16</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CloudRain size={14} className="text-blue-500" />
                  <span>18°C, Rainy</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <div className="text-xs font-medium text-purple-700">10:00 AM</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Musée d'Orsay</div>
                    <div className="text-xs text-gray-500">Perfect indoor activity for rainy day</div>
                  </div>
                  <CheckCircle size={16} className="text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

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
            <h1 className="text-xl font-bold text-gray-900">How TravelPlanner Works</h1>
            <button
              onClick={() => navigate('/destinations')}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Start Planning
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-6">
            <Play size={16} />
            <span>Interactive Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            See How TravelPlanner
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Creates Perfect Trips
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how our AI-powered platform transforms your travel ideas into weather-optimized itineraries in just 3 simple steps.
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeStep === step.id
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeStep === step.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <span className="font-medium hidden sm:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <ArrowRight size={20} className="text-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Active Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-4">
                Step {activeStep}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {steps[activeStep - 1].title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {steps[activeStep - 1].description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h3>
              <ul className="space-y-3">
                {steps[activeStep - 1].features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-teal-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/destinations')}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2"
              >
                Try It Now
                <ArrowRight size={18} />
              </button>
              {activeStep < 3 && (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>

          {/* Right: Interactive Mockup */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
            <div className="relative">
              {steps[activeStep - 1].mockup}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why TravelPlanner Works Better</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Thermometer size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weather Intelligence</h3>
              <p className="text-gray-600">
                Real-time weather data ensures you're never caught off guard. Indoor activities for rainy days, outdoor adventures when it's sunny.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Attractions</h3>
              <p className="text-gray-600">
                Authentic attractions from OpenTripMap with real photos, ratings, and detailed information. No fake or outdated listings.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Scheduling</h3>
              <p className="text-gray-600">
                AI-powered itinerary optimization considers travel time, opening hours, and weather to create the most efficient trip possible.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Plan Your Perfect Trip?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who never worry about weather ruining their plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/destinations')}
              className="bg-white text-teal-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Planning For Free
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchHowItWorksPage;