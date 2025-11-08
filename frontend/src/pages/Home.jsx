import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Pill, Stethoscope, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-blue-100 min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">Pharma<span className="text-sky-500">Revo</span></h1>
        <div className="flex space-x-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/available-medicines" className="hover:text-blue-600 transition">Medicines</Link>
          <Link to="/donate-medicine" className="hover:text-blue-600 transition">Donate</Link>
          <Link to="/about" className="hover:text-blue-600 transition">About</Link>
          <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
        </div>
      </nav>

      {/* ✅ Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between px-10 py-16 md:py-24">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-5xl font-bold text-gray-800 leading-tight">
            Revolutionizing <span className="text-blue-600">Medicine Donation</span> and Access
          </h2>
          <p className="text-gray-600 text-lg">
            Join PharmaRevo — a platform connecting donors, NGOs, and patients to
            make healthcare more accessible and reduce medicine wastage.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/donate-medicine"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition"
            >
              Donate Now
            </Link>
            <Link
              to="/available-medicines"
              className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl shadow-md hover:bg-blue-50 transition"
            >
              Explore Medicines
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src="https://cdn.dribbble.com/users/199982/screenshots/16328221/media/33f611fb38b9e90ed30aaf5f99c63b46.png"
            alt="Healthcare Illustration"
            className="w-96 drop-shadow-2xl"
          />
        </div>
      </header>

      {/* ✅ Features Section */}
      <section className="bg-white py-16 px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center shadow-inner">
        <div className="p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition">
          <HeartPulse className="mx-auto text-blue-600 w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Healthcare Impact</h3>
          <p className="text-gray-500 text-sm">Helping underprivileged communities get free medicine support.</p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition">
          <Pill className="mx-auto text-blue-600 w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Verified Donations</h3>
          <p className="text-gray-500 text-sm">Every donation is verified to ensure safety and quality.</p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition">
          <Stethoscope className="mx-auto text-blue-600 w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Smart Platform</h3>
          <p className="text-gray-500 text-sm">Seamless interface for donors and receivers to connect easily.</p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition">
          <Users className="mx-auto text-blue-600 w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Community Driven</h3>
          <p className="text-gray-500 text-sm">Join thousands of people making healthcare better together.</p>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-blue-600 text-white py-6 text-center mt-auto">
        <p>© {new Date().getFullYear()} PharmaRevo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
