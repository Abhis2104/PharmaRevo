import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Attempting sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("User signed in:", uid);

      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData?.role;
        console.log("User role:", role);

        switch (role) {
          case "donor":
            console.log("Navigating to donor dashboard");
            navigate("/donor-dashboard");
            break;
          case "pharmacy":
            navigate("/pharmacy-dashboard");
            break;
          case "company":
            navigate("/company-dashboard");
            break;
          case "ngo":
            navigate("/ngo-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          default:
            console.error("Invalid role:", role);
            alert("Invalid role! Please contact support.");
        }
      } else {
        console.error("No user document found");
        alert("No user data found.");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-[400px] border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Sign In
        </h2>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
