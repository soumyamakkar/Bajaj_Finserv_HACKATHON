const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://soumyamakkar123:123@cluster0.vsldh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
