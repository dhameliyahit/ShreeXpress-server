// connectDB.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("⚠️ MONGO_URI environment variable is not defined!");
    console.error("Please configure MONGO_URI in your Back4app Container Settings -> Environment Variables.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.error("Keep-alive: The process will not exit so that the server can handle health checks and you can inspect the logs.");
  }
};

module.exports = connectDB;