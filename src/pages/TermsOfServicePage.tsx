import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, AlertTriangle, CheckCircle, ExternalLink, Mail, Globe, Shield } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
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
            <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
            <div className="w-24"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Scale size={16} />
            <span>Terms & Conditions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using TravelPlanner, our hackathon demonstration project.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Hackathon Demonstration Project</h3>
              <p className="text-amber-700 leading-relaxed">
                <strong>TravelPlanner is a non-commercial demonstration project</strong> created for the Bolt.new World's Largest Hackathon. 
                This application is provided for educational and showcase purposes only. By using this application, 
                you acknowledge that this is a demonstration and not a commercial travel service.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Section 1: Acceptance of Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  By accessing and using TravelPlanner, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Important Acknowledgments:</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>This is a demonstration project, not a commercial service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>No warranties are provided regarding travel information accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Use of this application is entirely at your own risk</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Service Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe size={18} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Service Description</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  TravelPlanner is a web-based demonstration application that provides travel planning functionality including:
                </p>
                <ul className="space-y-2 ml-6">
                  <li>• Destination search and trip planning tools</li>
                  <li>• Activity and attraction recommendations from third-party APIs</li>
                  <li>• Weather-based itinerary optimization</li>
                  <li>• Trip export and sharing capabilities</li>
                </ul>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Data Sources:</h4>
                  <p className="text-green-800">
                    All travel and weather information is sourced from legitimate third-party APIs including 
                    OpenTripMap and WeatherAPI. We do not guarantee the accuracy, completeness, or timeliness of this information.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. User Responsibilities</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  As a user of this demonstration application, you agree to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">✅ You Should:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Use the application for demonstration purposes only</li>
                      <li>• Verify all travel information independently</li>
                      <li>• Respect third-party API terms and conditions</li>
                      <li>• Report any issues or concerns promptly</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">❌ You Should Not:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Rely solely on this app for travel decisions</li>
                      <li>• Attempt to reverse engineer or copy the application</li>
                      <li>• Use the application for commercial purposes</li>
                      <li>• Overload the system with excessive requests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Disclaimers */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Disclaimers and Limitations</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Important Disclaimers:</h4>
                  <ul className="space-y-2 text-red-800">
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>No Warranty:</strong> This application is provided "as-is" without any warranties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Travel Information:</strong> All travel data is from third parties and may be inaccurate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Weather Data:</strong> Weather forecasts are estimates and may change</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span><strong>No Liability:</strong> We are not responsible for any travel decisions or outcomes</span>
                    </li>
                  </ul>
                </div>
                <p className="text-gray-600 italic">
                  Always verify travel information, weather conditions, attraction hours, and prices through official sources 
                  before making travel plans or bookings.
                </p>
              </div>
            </section>

            {/* Section 5: Third-Party Services */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ExternalLink size={18} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  TravelPlanner integrates with third-party services to provide functionality. Your use of these services 
                  is subject to their respective terms and conditions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">O</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">OpenTripMap</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Provides attraction and point-of-interest data
                    </p>
                    <a 
                      href="https://opentripmap.io/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      View Terms <ExternalLink size={12} />
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
                      Provides weather data and forecasts
                    </p>
                    <a 
                      href="https://www.weatherapi.com/terms.aspx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      View Terms <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Intellectual Property */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Scale size={18} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  This demonstration project respects all intellectual property rights:
                </p>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-teal-900 mb-2">Our Commitments:</h4>
                  <ul className="space-y-2 text-teal-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>All third-party APIs are used within their terms of service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>Proper attribution is provided for all data sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>No commercial use or redistribution of third-party data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>Immediate response to any intellectual property concerns</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: Contact and Takedown */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">7. Contact and Takedown Policy</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  If you have any concerns about this demonstration project, including intellectual property issues, 
                  terms violations, or requests for removal, please contact us immediately:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-600" />
                      <span className="text-gray-700">Email: </span>
                      <a href="mailto:ladywinterd@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                        ladywinterd@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-600" />
                      <span className="text-gray-700">GitHub: </span>
                      <a 
                        href="https://github.com/LadyWinterD/travel_plan" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Project Repository
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Takedown Commitment:</h4>
                  <p className="text-yellow-800">
                    We are committed to addressing any legitimate concerns promptly. If this project violates any terms, 
                    infringes on rights, or causes any issues, we will take immediate action including removing the 
                    application if necessary.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Changes to Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">8. Changes to Terms</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  As this is a demonstration project, these terms may be updated to reflect changes in functionality 
                  or legal requirements. Continued use of the application constitutes acceptance of any updated terms.
                </p>
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <br />
                  <strong>Version:</strong> 1.0 (Hackathon Demo)
                  <br />
                  <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
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

export default TermsOfServicePage;