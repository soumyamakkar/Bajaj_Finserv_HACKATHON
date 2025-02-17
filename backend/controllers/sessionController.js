const Exercise = require("../models/exercises");

const saveExercise = async (req, res) => {
    try {
      const { email, exerciseType, count } = req.body;
  
      if (!email || !exerciseType || count === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const newExercise = new Exercise({ email, exerciseType, count });
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


module.exports={saveExercise,getPastExercises};