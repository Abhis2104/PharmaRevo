import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role,
        createdAt: new Date(),
      });

      alert(`Registered as ${role}. You can now log in.`);
      navigate("/signin");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-[400px] border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="donor">Donor (Individual)</option>
              <option value="pharmacy">Pharmacy / Medical Store</option>
              <option value="company">Pharmaceutical Company</option>
              <option value="ngo">NGO / Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
