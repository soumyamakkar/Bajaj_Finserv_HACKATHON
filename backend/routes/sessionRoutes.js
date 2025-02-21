const express=require('express');
const {saveExercise,getPastExercises,getLeaderboard}=require("../controllers/sessionController");
const router=express.Router();

router.post('/exercise',saveExercise);
router.get('/past-reps',getPastExercises);
router.get("/leaderboard", async (req, res) => {
    try {
        const date = req.query.date || new Date(); // Get date from query params
        const leaderboard = await getLeaderboard(date);
        res.json(leaderboard); // ✅ Send JSON response
    } catch (error) {   
        console.error("Error in API route:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports=router;