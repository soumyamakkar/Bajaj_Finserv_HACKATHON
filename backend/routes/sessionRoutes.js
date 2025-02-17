const express=require('express');
const {saveExercise,getPastExercises}=require("../controllers/sessionController");
const router=express.Router();

router.post('/exercise',saveExercise);
router.get('/past-reps',getPastExercises);

module.exports=router;