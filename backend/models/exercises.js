const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    email:{
        type: String,
        required:true,
    },
    exerciseType: {
        type: String,
        enum: ["pushups", "squats", "crunches"],
        required: true,
    },
    count: { // Changed the key name from 'exercise' to 'count'
        type: Number,
        required: true,
    },
    date:{
        type:Date,
    }
},{timestamps:true});

const Exercise = mongoose.model("Exercise", exerciseSchema);
module.exports = Exercise;