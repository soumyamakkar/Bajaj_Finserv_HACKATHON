import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verify2FA } from "../api";
import { jwtDecode } from "jwt-decode";

const TwoFactorAuth = () => {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const handleVerify = async (e) => {
    e.preventDefault();

    const response = await verify2FA(email, code);

    if (response.success) {
      // Decode token to extract user details
      const decodedToken = jwtDecode(response.token);
      const email = decodedToken.email;
      const userName = decodedToken.name; // Extract name from token

      // Store name in localStorage
      localStorage.setItem("userName", userName);
      localStorage.setItem("email",email);

      navigate("/dashboard"); // Navigate after successful verification
    } else {
      setErrorMessage(response.message);
    }
  };

  const handleResendCode = () => {
    console.log("Resending verification code...");
    // Add API call to resend the code
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="bg-white p-4 rounded-lg w-full max-w-[400px]">
        <h2 className="text-xl text-center text-black mb-3">Two-Factor Authentication</h2>

        <p className="text-sm text-center text-gray-600 mb-3">
          A verification code has been sent to your email. Please enter it below.
        </p>

        {errorMessage && <p className="text-center text-red-500 text-sm mb-2">{errorMessage}</p>}

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="block text-black text-sm font-semibold mb-1">Enter Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md text-center tracking-widest"
              placeholder="XXXXXX"
              required
            />
          </div>

          <button type="submit" className="w-full bg-[#4AE290] text-white py-1.5 rounded-md font-semibold text-sm">
            Verify
          </button>
        </form>

        <button onClick={handleResendCode} className="w-full mt-2 text-[#4AE290] text-sm font-semibold underline">
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
