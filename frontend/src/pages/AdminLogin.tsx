import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (username === "PharmaRevoAdmin" && password === "Pharma@123") {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin-dashboard");
    } else {
      alert("Invalid admin credentials!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-50">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-[400px] border border-red-100">
        <h2 className="text-3xl font-extrabold text-red-700 mb-6 text-center">
          Admin Login
        </h2>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login as Admin"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          <a href="/" className="text-red-600 hover:underline font-semibold">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;