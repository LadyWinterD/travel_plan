import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Globe, Mail, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
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
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
            <div className="w-24"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Shield size={16} />
            <span>Privacy & Legal Information</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy matters to us. This policy explains how TravelPlanner handles your information as a hackathon demonstration project.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Notice</h3>
              <p className="text-amber-700 leading-relaxed">
                <strong>TravelPlanner is a demonstration project created for the Bolt.new World's Largest Hackathon.</strong> 
                This application is not intended for commercial use and serves purely as a technical showcase. 
                If you have any legal concerns or requests regarding this project, please contact us immediately 
                and we will promptly address them, including removing the application if necessary.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Section 1: Project Nature */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe size={18} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Nature of This Project</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  TravelPlanner is a <strong>non-commercial demonstration project</strong> developed for educational and 
                  showcase purposes as part of the Bolt.new World's Largest Hackathon competition.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Points:</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>This is a hackathon demonstration project, not a commercial service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>No revenue is generated from this application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>All data sources are properly attributed and used within their terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>We respect all intellectual property rights and API usage policies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Data Sources */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database size={18} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Third-Party Data Sources</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  TravelPlanner integrates with legitimate third-party services to provide travel information. 
                  All data is sourced from publicly available APIs and used in accordance with their respective terms of service.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {/* 🔧 FIXED: Use a simple colored icon instead of external favicon */}
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">O</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">OpenTripMap API</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Provides attraction and point-of-interest data worldwide
                    </p>
                    <a 
                      href="https://opentripmap.io/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      View API Documentation <ExternalLink size={12} />
                    </a>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">WeatherAPI</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Provides current weather and forecast data for travel planning
                    </p>
                    <a 
                      href="https://www.weatherapi.com/docs/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      View API Documentation <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Data Usage Compliance:</h4>
                  <ul className="space-y-1 text-green-800 text-sm">
                    <li>• All API calls are made within rate limits and usage quotas</li>
                    <li>• Data is used for demonstration purposes only, not commercial gain</li>
                    <li>• Proper attribution is provided for all data sources</li>
                    <li>• No data is stored permanently or redistributed</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: User Data */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Your Data and Privacy</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We are committed to protecting your privacy. Here's exactly what happens with any information you provide:
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Information We Collect:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Travel destinations you search for or add to your trip</li>
                      <li>• Travel dates you specify</li>
                      <li>• Activity preferences you select</li>
                      <li>• Basic browser information for functionality (no tracking)</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">How We Use It:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• To provide travel recommendations and itinerary planning</li>
                      <li>• To fetch relevant weather data for your travel dates</li>
                      <li>• To display attractions and activities in your chosen destinations</li>
                      <li>• All processing happens locally in your browser when possible</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-red-400 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">What We DON'T Do:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• We don't sell, share, or monetize your data</li>
                      <li>• We don't use tracking cookies or analytics</li>
                      <li>• We don't store personal information on our servers</li>
                      <li>• We don't require account creation or personal details</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Local Storage */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database size={18} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Local Data Storage</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  To improve your experience, TravelPlanner stores some information locally in your browser:
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Browser Local Storage:</h4>
                  <ul className="space-y-2 text-orange-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Your trip plans are saved locally so you don't lose progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>API responses are cached temporarily to improve performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>All data stays on your device - we can't access it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>You can clear this data anytime through your browser settings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Legal Disclaimer */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Legal Disclaimer & Contact</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Important Legal Notice:</h4>
                  <p className="text-red-800 mb-3">
                    This application is provided "as-is" for demonstration purposes only. We make no warranties 
                    about the accuracy of travel information, weather data, or attraction details. 
                    <strong> Use this information at your own discretion and always verify details independently before traveling.</strong>
                  </p>
                  <p className="text-red-800">
                    If you believe this project infringes on any rights, violates any terms of service, 
                    or raises any legal concerns, please contact us immediately and we will address the issue promptly, 
                    including removing the application if necessary.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-600" />
                      <span className="text-gray-700">For legal concerns or takedown requests: </span>
                      <a href="mailto:ladywinterd@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                        ladywinterd@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-600" />
                      <span className="text-gray-700">Project Repository: </span>
                      <a 
                        href="https://github.com/LadyWinterD/travel_plan" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        GitHub Repository
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Updates */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={18} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Policy Updates</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  As this is a demonstration project, this privacy policy may be updated to reflect 
                  changes in functionality or legal requirements. Any updates will be posted on this page.
                </p>
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <br />
                  <strong>Version:</strong> 1.0 (Hackathon Demo)
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About This Policy?</h3>
            <p className="text-lg mb-6 opacity-90">
              We're committed to transparency and addressing any concerns about this demonstration project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:ladywinterd@gmail.com"
                className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <button
                onClick={() => navigate('/')}
                className="bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;