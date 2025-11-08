import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Revolutionizing Medicine Redistribution
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PharmaRevo
                </span>
                <br />
                <span className="text-gray-800">
                  Medicine for All
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Connecting unused medicines with those in need. Reduce waste, save lives, and create a sustainable healthcare ecosystem.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center"
              >
                Get Started
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group">
                <span className="mr-2">▶</span>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Medicines Donated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">50+</div>
                <div className="text-sm text-gray-600">Partner NGOs</div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="relative">
              {/* Main Illustration Container */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  {/* Medicine Icons */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-white text-2xl transform hover:scale-110 transition-all duration-300 animate-bounce`}
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        💊
                      </div>
                    ))}
                  </div>
                  
                  {/* Flow Arrow */}
                  <div className="flex justify-center mb-6">
                    <div className="text-4xl animate-pulse">⬇️</div>
                  </div>
                  
                  {/* Beneficiaries */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="text-3xl mb-2">🏥</div>
                      <div className="text-sm font-medium text-green-800">Hospitals</div>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300">
                      <div className="text-3xl mb-2">🤝</div>
                      <div className="text-sm font-medium text-blue-800">NGOs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pink-400 rounded-full animate-bounce animation-delay-1000"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;