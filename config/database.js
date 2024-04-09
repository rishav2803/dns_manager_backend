const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { dbName });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;
