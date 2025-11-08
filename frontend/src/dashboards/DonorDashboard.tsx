import React, { useState } from "react";
import AddDonationForm from "../components/AddDonationForm";
import DonationList from "../components/DonationList";

const DonorDashboard = () => {
  console.log("DonorDashboard component loaded");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleDonationAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Donor Dashboard
                </h1>
                <p className="text-gray-600">Make a difference by donating medicines</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Lives Impacted</p>
                <p className="text-3xl font-bold text-purple-600">24</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">❤️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Add Donation Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📦</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Donation</h2>
                  <p className="text-blue-100 text-sm">Share your unused medicines</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <AddDonationForm onDonationAdded={handleDonationAdded} />
            </div>
          </div>

          {/* Donation List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Donations</h2>
                  <p className="text-purple-100 text-sm">Track your contributions</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <DonationList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Your Impact</h3>
            <p className="text-blue-100 text-lg">Every donation makes a difference in someone's life</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🌍</div>
              <div className="text-2xl font-bold">Global Reach</div>
              <div className="text-blue-100 text-sm">Worldwide Impact</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">♻️</div>
              <div className="text-2xl font-bold">Eco-Friendly</div>
              <div className="text-blue-100 text-sm">Reduce Waste</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤝</div>
              <div className="text-2xl font-bold">Community</div>
              <div className="text-blue-100 text-sm">Help Others</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💝</div>
              <div className="text-2xl font-bold">Gratitude</div>
              <div className="text-blue-100 text-sm">Lives Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;