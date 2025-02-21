import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../api"; // Adjust path if needed

const LeaderBoard = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const data = await getLeaderboard(today);
      if (data) {
        setLeaderboard(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading)
    return <p className="text-center text-[#4AE290] text-lg">Loading leaderboard...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#0A192F] shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-[#4AE290] mb-6">🏆 Leaderboard</h2>
      {leaderboard &&
        Object.keys(leaderboard).map((exercise) => (
          <div key={exercise} className="mb-6">
            <h3 className="text-xl font-semibold text-[#4AE290] border-b border-[#4AE290] pb-2">
              {exercise.toUpperCase()}
            </h3>
            <ul className="mt-3 space-y-2">
              {leaderboard[exercise].map(({ email, totalCount }, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-md text-black ${
                    index === 0
                      ? "bg-[#4AE290] text-black font-bold"
                      : index === 1
                      ? "bg-gray-300 text-black font-semibold"
                      : index === 2
                      ? "bg-gray-400 text-black font-semibold"
                      : "bg-[#112240] text-[#4AE290]"
                  }`}
                >
                  <span className="font-medium">{index + 1}.</span> {email} -{" "}
                  <span className="font-bold">{totalCount}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default LeaderBoard;