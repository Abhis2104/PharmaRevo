import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PharmaRevo
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Revolutionizing healthcare accessibility by connecting unused medicines with those in need. 
              Building a sustainable future, one medicine at a time.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "💙", label: "Twitter" },
                { icon: "📘", label: "Facebook" },
                { icon: "💼", label: "LinkedIn" },
                { icon: "📷", label: "Instagram" }
              ].map((social, index) => (
                <button
                  key={index}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 group"
                  title={social.label}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {social.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "#home" },
                { name: "About", href: "#about" },
                { name: "How It Works", href: "#about" },
                { name: "Contact", href: "#contact" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="mr-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Our Services</h4>
            <ul className="space-y-3">
              {[
                "Medicine Donation",
                "AI Verification",
                "Smart Distribution",
                "Safe Disposal",
                "NGO Partnership",
                "Corporate CSR"
              ].map((service, index) => (
                <li key={index} className="text-gray-400 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mt-1">
                  <span className="text-white text-sm">📍</span>
                </div>
                <div>
                  <p className="text-gray-400">
                    Mumbai, Maharashtra<br />
                    India 400001
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📧</span>
                </div>
                <p className="text-gray-400">contact@pharmarevo.com</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📞</span>
                </div>
                <p className="text-gray-400">+91 9876543210</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <h5 className="font-semibold mb-3 text-white">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-r-lg hover:shadow-lg transition-all duration-300">
                  ✈️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 PharmaRevo. All rights reserved. Made with ❤️ for a better world.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/signin" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Sign In
              </Link>
              <Link to="/signup" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                Sign Up
              </Link>
              <Link to="/admin-login" className="text-gray-400 hover:text-red-400 transition-colors duration-300">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white text-xl hover:scale-110 transition-all duration-300 z-50 animate-bounce">
        ↑
      </button>
    </footer>
  );
};

export default Footer;