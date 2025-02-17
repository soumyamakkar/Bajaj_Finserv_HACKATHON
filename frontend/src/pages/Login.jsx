import React, { useState } from "react";
import { login } from "../api";  // Ensure the correct path to api.js
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await login(email, password);

    if (response.success) {
      navigate("/dashboard"); // Redirect to dashboard on success
    } else {
      alert(response.message); // Show error message
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-8 rounded-lg w-full max-w-[400px]">
        <h2 className="text-3xl text-center text-black mb-6">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-black font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#4AE290] text-white py-3 rounded-md font-semibold text-lg"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
