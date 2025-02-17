import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { signup } from '../api'; // Import the signup function from api.js
import { generate2FA } from '../api';
import { FaGoogle, FaGithub } from "react-icons/fa"; // Import icons

const Signup = () => {
  const [fullname, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation (confirm password check)
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Prepare the user data
    const userData = { fullname, username, email, password, confirmPassword, gender };

    // Call the signup API
    try {
      // Call the signup API
      const signupResponse = await signup(userData);
  
      if (signupResponse.success) {
        // If signup successful, request 2FA generation
        const twoFAResponse = await generate2FA(email);
  
        if (twoFAResponse.success) {
          // Navigate to 2FA page with email as a query param
          navigate(`/two-factor?email=${email}`);
        } else {
          setErrorMessage("Failed to send 2FA code. Try again.");
        }
      } else {
        setErrorMessage(signupResponse.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="bg-white p-4 rounded-lg w-full max-w-[500px]">
        <h2 className="text-xl text-center text-black mb-3">Sign Up</h2>

        {/* Show error message if any */}
        {errorMessage && <div className="text-red-500 text-center mb-2">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div className="mb-2">
            <label className="block text-black text-sm font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Username Field */}
          <div className="mb-2">
            <label className="block text-black text-sm font-semibold mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-2">
            <label className="block text-black text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className="block text-black text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-2">
            <label className="block text-black text-sm font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Gender Field */}
          <div className="mb-3">
            <label className="block text-black text-sm font-semibold mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#4AE290] text-white py-1.5 rounded-md font-semibold text-sm mb-2"
          >
            Submit
          </button>
        </form>

        {/* Signup with Google & GitHub */}
              <div className="mt-3">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-1.5 rounded-md text-sm font-semibold mb-2">
          <FaGoogle /> Sign up with Google
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white py-1.5 rounded-md text-sm font-semibold">
          <FaGithub /> Sign up with GitHub
        </button>
      </div>

      </div>
    </div>
  );
};

export default Signup;
