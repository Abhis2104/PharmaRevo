import React from "react";
import { useLocation } from "react-router-dom";
import DonorDashboard from "../dashboards/DonorDashboard";
import PharmacyDashboard from "../dashboards/PharmacyDashboard";
import CompanyDashboard from "../dashboards/CompanyDashboard";
import AdminDashboard from "../dashboards/AdminDashboard";
import NGODashboard from "../dashboards/NGODashboard";


const DashboardRouter: React.FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role");

  switch (role) {
    case "donor":
      return <DonorDashboard />;
    case "pharmacy":
      return <PharmacyDashboard />;
    case "ngo":
      return <NGODashboard />;
    default:
      return <div>No role assigned</div>;
  }
};

export default DashboardRouter;
