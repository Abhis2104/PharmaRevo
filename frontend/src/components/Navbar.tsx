import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PharmaRevo
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Home
          </a>
          <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            About
          </a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Contact
          </a>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/signin"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium"
            >
              Sign Up
            </Link>
            <Link
              to="/admin-login"
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium text-sm"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className={`w-full h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
            <div className={`w-full h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-full h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-200`}>
        <div className="px-6 py-4 space-y-4">
          <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">Home</a>
          <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">About</a>
          <a href="#contact" className="block text-gray-700 hover:text-blue-600 font-medium">Contact</a>
          <div className="pt-4 space-y-3">
            <Link to="/signin" className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-full">
              Sign In
            </Link>
            <Link to="/signup" className="block w-full text-center border-2 border-blue-600 text-blue-600 py-2 rounded-full">
              Sign Up
            </Link>
            <Link to="/admin-login" className="block w-full text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-full">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;