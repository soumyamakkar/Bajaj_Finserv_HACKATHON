const Exercise = require("../models/exercises");
const User = require("../models/user");

const saveExercise = async (req, res) => {
    try {
      const { email, exerciseType, count, date} = req.body;
  
      if (!email || !exerciseType || count === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const newExercise = new Exercise({ email, exerciseType, count, date});
      await newExercise.save();
  
      res.status(201).json({ message: "Exercise saved successfully!" });
    } catch (error) {
      console.error("Error saving exercise:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const getPastExercises = async (req, res) => {
    try {
        const { email } = req.query; // Get email from query params

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const exercises = await Exercise.find({ email });
        res.status(200).json(exercises);
    } catch (error) {
        console.error("Error fetching past exercises:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getLeaderboard = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
      console.log("Fetching exercises for date:", date);

      // 1. Fetch exercises for the given date
      const exercises = await Exercise.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          exerciseType: { $in: ["squats", "pushups", "crunches"] }
      }).lean();

      console.log("Exercises fetched:", exercises.length);

      // 2. Group total counts per user & exercise type
      const leaderboardMap = {};
      exercises.forEach(({ email, exerciseType, count }) => {
          const key = `${email}-${exerciseType}`;
          if (!leaderboardMap[key]) {
              leaderboardMap[key] = { email, exerciseType, totalCount: 0 };
          }
          leaderboardMap[key].totalCount += count || 0;
      });

      // 3. Convert to an array
      const groupedLeaderboard = Object.values(leaderboardMap);

      console.log("Grouping done...");

      // 4. Organize leaderboard by exercise type
      const leaderboardByExercise = { squats: [], pushups: [], crunches: [] };

      groupedLeaderboard.forEach(({ email, exerciseType, totalCount }) => {
          leaderboardByExercise[exerciseType].push({ email, totalCount });
      });

      // 5. Sort each exercise list in descending order
      Object.keys(leaderboardByExercise).forEach(exercise => {
          leaderboardByExercise[exercise].sort((a, b) => b.totalCount - a.totalCount);
      });

      console.log("Returning final leaderboard...");
      return leaderboardByExercise;
  } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw new Error("Internal Server Error");
  }
};






module.exports={saveExercise,getPastExercises,getLeaderboard};