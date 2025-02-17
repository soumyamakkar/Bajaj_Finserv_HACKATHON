import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Replace with your actual backend URL

export const signup = async (userData) => {
  try {
    // Making the POST request with user data (username, email, password, etc.)
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    
    // If the signup is successful, return a success message or proceed
    if (response.status === 201) {
      return { success: true, message: 'Signup successful!' };
    } else {
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  } catch (error) {
    // Handle errors like network issues or invalid requests
    console.error('Error during signup:', error);
    return { success: false, message: 'Signup failed. Please try again later.' };
  }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });

        if (response.status === 200 && response.data.token) {
            const { token, fullname, email } = response.data;
            
            // Store JWT, fullname, and email in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userName", fullname);
            localStorage.setItem("email", email);

            return { success: true };
        } else {
            return { success: false, message: "Invalid credentials. Please try again." };
        }
    } catch (error) {
        console.error("Error during login:", error.response?.data || error.message);
        return { success: false, message: "Login failed. Please try again later." };
    }
};


export const generate2FA = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/generate`, { email });
  
      if (response.status === 200) {
        return { success: true, message: "2FA code sent to your email!" };
      } else {
        return { success: false, message: "Failed to generate 2FA code." };
      }
    } catch (error) {
      console.error("Error generating 2FA:", error);
      return { success: false, message: "Error sending 2FA code. Try again." };
    }
  };
  

export const verify2FA = async (email, code) => {
  try {
    const response = await axios.post(`${API_URL}/auth/2fa/verify`, { email, code });

    if (response.status === 200 && response.data.token) {
      const token = response.data.token;

      // Store JWT in localStorage
      localStorage.setItem("token", token);

      return { success: true, token };
    } else {
      return { success: false, message: "Invalid or expired 2FA code." };
    }
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return { success: false, message: "Error verifying 2FA. Try again." };
  }
};

export const saveExercise = async (email, exerciseType, count) => {
    try {
        console.log("Sending data:", { email, exerciseType, count }); // ✅ Debug

        const response = await axios.post(`${API_URL}/session/exercise`, 
            { email, exerciseType, count }, // ✅ Fix: Ensure correct structure
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        console.log("Exercise data saved:", response.data);
    } catch (error) {
        console.error("Error saving exercise data:", error.response?.data || error.message);
    }
};

export const fetchPastExercises = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/session/past-reps?email=${email}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching past exercises:", error);
      return [];
    }
  };
