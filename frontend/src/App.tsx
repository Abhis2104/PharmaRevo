import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AdminLogin from "./pages/AdminLogin";
import LandingPage from "./pages/LandingPage";
import DonorDashboard from './dashboards/DonorDashboard';
import PharmacyDashboard from './dashboards/PharmacyDashboard';
import CompanyDashboard from './dashboards/CompanyDashboard';
import NGODashboard from './dashboards/NGODashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import Chatbot from './components/Chatbot';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/ngo-dashboard" element={<NGODashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
