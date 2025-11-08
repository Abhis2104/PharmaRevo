import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;