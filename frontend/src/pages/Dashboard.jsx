import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveExercise, fetchPastExercises } from "../api"; // Import API functions
import { FaBars, FaUser, FaCog, FaHistory, FaSignOutAlt } from "react-icons/fa"; // Import icons

const Dashboard = () => {
  const navigate = useNavigate();
  const [exerciseCount, setExerciseCount] = useState({
    squats: 0,
    pushups: 0,
    crunches: 0,
    pullups: 0,
  });
  const [pastExercises, setPastExercises] = useState([]); // Store past exercises
  const [intervalId, setIntervalId] = useState(null);
  const [name, setName] = useState("Athlete");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // State for sidebar expansion

  // Load name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  // Fetch past exercises on load
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      fetchPastExercises(email).then((data) => setPastExercises(data));
    }
  }, []);

  const fetchExerciseCount = async (exercise) => {
    try {
      console.log(`Fetching latest ${exercise} count...`);
      const response = await axios.get(`http://127.0.0.1:5000/last-session`);
      console.log(`API Response:`, response.data);

      // Adjust key access to match API structure
      const apiKey = `last_squat_session`;
      console.log("api key data: ",response.data[apiKey]); // Example: "last_squat_session"
      if (response.data[apiKey] !== undefined) {
        const newCount = response.data[apiKey];
        console.log("new count: ",newCount);

        // Update state and localStorage
        setExerciseCount((prev) => {
          const updatedCount = { ...prev, [exercise]: newCount };
          localStorage.setItem("exerciseCount", JSON.stringify(updatedCount));
          return updatedCount;
        });
      } else {
        console.log(`No new data for ${exercise}, state remains:`, exerciseCount);
      }
    } catch (error) {
      console.error(`Error fetching ${exercise} count:`, error);
    }
  };

  const handleStartExercise = async (exercise) => {
    try {
      console.log(`Starting ${exercise} detection...`);
      await axios.get(`http://127.0.0.1:5000/start-counting`);

      console.log(`Started polling for ${exercise} count every 5 seconds...`);
      const id = setInterval(() => {
        console.log(`Polling ${exercise} count...`);
        fetchExerciseCount(exercise);
      }, 5000);

      setIntervalId(id);
    } catch (error) {
      console.error(`Error starting ${exercise} detection:`, error);
    }
  };

  const handleCloseSession = async (exercise) => {
    console.log(`Closing ${exercise} session...`);

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      console.log(`Stopped polling Flask API for ${exercise}.`);
    }

    const email = localStorage.getItem("email");
    const count = exerciseCount[exercise]; // Use state directly instead of localStorage

    if (!email) {
      console.error("No user email found in localStorage.");
      return;
    }

    try {
      await saveExercise(email, exercise, count);
      await axios.get(`http://127.0.0.1:5000/stop-counting`);
      console.log(`${exercise} session closed.`);
    } catch (error) {
      console.error(`Error closing ${exercise} session:`, error);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Cleared interval on unmount.");
      }
    };
  }, [intervalId]);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarExpanded ? "w-64" : "w-20"
        } bg-gradient-to-b from-gray-800 to-gray-900 p-6 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <h2 className={`text-2xl text-center mb-6 font-semibold text-white ${
          !isSidebarExpanded && "hidden"
        }`}>
          Dashboard
        </h2>
        <nav className="flex flex-col flex-1">
          {/* Center the icons */}
          <ul className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { name: "Profile", icon: <FaUser /> },
              { name: "Settings", icon: <FaCog /> },
              { name: "See Past Reps", icon: <FaHistory /> },
            ].map((item, index) => (
              <li key={index}>
                <button
                  className="w-full text-left py-2 px-4 rounded-md hover:bg-[#4AE290] transition flex items-center"
                  onClick={() => navigate(`/${item.name.toLowerCase().replace(/\s+/g, "-")}`)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {isSidebarExpanded && item.name}
                </button>
              </li>
            ))}
          </ul>

          {/* Logout at the bottom */}
          <button
          className="w-full text-left py-2 px-4 rounded-md hover:bg-[#4AE290] transition flex items-center mt-auto"
            onClick={() => {
                localStorage.clear();
                navigate("/");
            }}>
            <span className="mr-2"><FaSignOutAlt /></span>
            {isSidebarExpanded && "Logout"}
        </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Hamburger Icon */}
        <button
          className="text-white text-2xl mb-6 focus:outline-none"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <FaBars />
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-white">
          Back for more, <span className="text-[#4AE290]">{name}</span>? Let’s smash those reps! 💪
        </h1>

        {/* Exercise Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Squats", key: "squats", icon: "🏋️" },
            { name: "Pushups", key: "pushups", icon: "💪" },
            { name: "Crunches", key: "crunches", icon: "🤸" },
            { name: "Pullups", key: "pullups", icon: "🧗" },
          ].map((exercise) => (
            <div key={exercise.key} className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <span className="text-4xl">{exercise.icon}</span>
              <h3 className="text-xl font-semibold mt-3">{exercise.name}</h3>
              <button
                className="w-full mt-4 bg-gradient-to-r from-[#4AE290] to-[#2EA65F] text-white py-2 rounded-lg transition-transform transform hover:scale-105"
                onClick={() => handleStartExercise(exercise.key)}
              >
                Start {exercise.name}
              </button>
              <button
                className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg transition-transform transform hover:scale-105"
                onClick={() => handleCloseSession(exercise.key)}
              >
                Close Session
              </button>
            </div>
          ))}
        </div>

        {/* Past Records */}
        <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-white">Past Reps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastExercises.length > 0 ? (
              pastExercises.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-[#4AE290] text-white p-4 rounded-lg shadow-sm flex flex-col items-center"
                >
                  <h4 className="text-lg font-semibold">
                    {exercise.exerciseType.charAt(0).toUpperCase() + exercise.exerciseType.slice(1)}
                  </h4>
                  <p className="text-2xl font-bold">{exercise.count}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No past records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;