import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveExercise, fetchPastExercises } from "../api"; // Import API functions
import { FaBars, FaUser, FaCog, FaHistory, FaSignOutAlt, FaFire, FaTrophy } from "react-icons/fa"; // Import icons
import io from 'socket.io-client';
import ExerciseChart from "../components/Chart"; 
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
  const [isDetecting, setIsDetecting] = useState(false);
  const [squatCount, setSquatCount] = useState(0);
  const webcamRef = useRef(null);
  const requestRef = useRef(null);
  const [stage, setStage] = useState("stand");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [streak, setStreak] = useState(1);

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

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('count_update', (data) => {
      console.log('Received count update:', data);
      setSquatCount(data.count);
      setStage(data.stage);
      setExerciseCount(prev => ({
        ...prev,
        squats: data.count
      }));
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const storedStreak = localStorage.getItem("exerciseStreak") || 1;
    setStreak(Number(storedStreak));
  }, []);

  const [activeExercise, setActiveExercise] = useState(null);

  const handleStartExercise = async (exercise) => {
    try {
      setError(null);
      setIsLoading(true);
      await axios.get('http://localhost:5000/start-counting');
      setIsDetecting(true);
      setActiveExercise(exercise);
      
      // Reset the count for the specific exercise
      setExerciseCount(prev => ({
        ...prev,
        [exercise]: 0
      }));

      // Reset squat-specific states if needed
      if (exercise === 'squats') {
        setSquatCount(0);
        setStage("stand");
      }
      if (exercise === 'pushups') {
        setSquatCount(0);
        setStage("stand");
      }
      if (exercise === 'bicepcurl') {
        setSquatCount(0);
        setStage("stand");
      }
      if (exercise === 'crunches') {
        setSquatCount(0);
        setStage("stand");
      }
      if (exercise === 'pullups') {
        setSquatCount(0);
        setStage("stand");
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      console.error(`Error starting ${exercise}:`, err);
      setError('Failed to start exercise detection');
      setIsLoading(false);
      setIsDetecting(false);
      setActiveExercise(null);
    }
  };

  const handleCloseSession = async (exercise) => {
    try {
      setIsDetecting(false);
      setActiveExercise(null);
      const email = localStorage.getItem("email");
      const count = exerciseCount[exercise];

      if (!email) {
        console.error("No user email found in localStorage.");
        return;
      }

      await saveExercise(email, exercise, count);
      await axios.get('http://localhost:5000/stop-counting');
    } catch (error) {
      console.error(`Error closing ${exercise} session:`, error);
      setError(`Failed to close ${exercise} session`);
    }
  };

  const VideoFeedSection = () => (
    <div className="mb-8 w-full max-w-2xl mx-auto">
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        {isDetecting && (
          <img
            src="http://localhost:5000/video_feed"
            alt="Exercise Video Feed"
            className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
            style={{
              transform: 'scaleX(-1)',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onError={(e) => {
              console.error('Video feed error:', e);
              setError('Failed to load video feed');
            }}
          />
        )}
        {isDetecting && activeExercise && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded" style={{ zIndex: 2 }}>
            <p className="text-white text-xl">
              {activeExercise.charAt(0).toUpperCase() + activeExercise.slice(1)}: {exerciseCount[activeExercise]}
            </p>
            {activeExercise === 'squats' && (
              <p className="text-white text-sm">Stage: {stage}</p>
            )}
            {activeExercise === 'pushups' && (
              <p className="text-white text-sm">Keep your back straight!</p>
            )}
            {activeExercise === 'pullups' && (
              <p className="text-white text-sm">Full range of motion!</p>
            )}
            {activeExercise === 'crunches' && (
              <p className="text-white text-sm">Engage your core!</p>
            )}
            {activeExercise === 'bicepcurls' && (
              <p className="text-white text-sm">Engage your core!</p>
            )}
          </div>
        )}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 2 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4AE290]"></div>
          </div>
        )}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500" style={{ zIndex: 2 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );

  const StreakDisplay = () => (
    <div className="absolute top-4 right-4 flex gap-4">
      <button 
        onClick={() => navigate('/leaderboard')} 
        className="flex items-center bg-gray-800 rounded-full px-4 py-2 shadow-lg hover:bg-gray-700 transition-colors"
      >
        <FaTrophy className="text-yellow-500 text-xl mr-2" />
        <span className="text-white font-bold">Leaderboard</span>
      </button>
      <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 shadow-lg">
        <FaFire className="text-orange-500 text-xl mr-2" />
        <span className="text-white font-bold">{streak} days</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${isSidebarExpanded ? "w-64" : "w-20"
          } bg-gradient-to-b from-gray-800 to-gray-900 p-6 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <h2 className={`text-2xl text-center mb-6 font-semibold text-white ${!isSidebarExpanded && "hidden"
          }`}>
          Dashboard
        </h2>
        <nav className="flex flex-col flex-1">
          <ul className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { name: "Profile", icon: <FaUser /> },
              { name: "Settings", icon: <FaCog /> },
              { name: "See Past Reps", icon: <FaHistory /> },
            ].map((item, index) => (
              <li key={index} className="rounded-md hover:bg-[#4AE290] transition">
                <button
                  className="w-full text-left py-2 px-4 flex items-center justify-center"
                  onClick={() => navigate(`/${item.name.toLowerCase().replace(/\s+/g, "-")}`)}
                >
                  <span>{item.icon}</span>
                  {isSidebarExpanded && item.name}
                </button>
              </li>
            ))}
          </ul>


          {/* Logout at the bottom */}
          <button
            className="w-full text-left py-2 px-4 rounded hover:bg-[#4AE290] transition flex items-center mt-auto justify-center"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}>
            <span><FaSignOutAlt /></span>
            {isSidebarExpanded && "Logout"}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <StreakDisplay />
        
        {/* Hamburger Icon */}
        <button
          className="text-white text-2xl mb-6 focus:outline-none"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          <FaBars />
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-white">
          Back for more, <span className="text-[#4AE290]">{name}</span>? Let's smash those reps! 💪
        </h1>

        {/* Add Video Feed Section */}
        <VideoFeedSection />

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
                  <p className="text-sm font-bold">
                    Time: {exercise.date ? new Date(exercise.date).toLocaleString("en-US", { 
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                    }) : "No date"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No past records found.</p>
            )}
          </div>
        </div>
        <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-white">Exercise Progress Chart</h3>
          <ExerciseChart pastExercises={pastExercises} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;