// connectDB.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    });

<<<<<<< HEAD

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // connectionString: "postgresql://shreexpress_user:uoidLGu98pCQjLq6CBmVADh6L7T5pET8@dpg-d1sgql2dbo4c738b6kmg-a.oregon-postgres.render.com/shreexpress",
  // ssl: {
  //   rejectUnauthorized: false
  // }
});
=======
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
>>>>>>> 7a7c53eb0621c8ccf6a65028b9c5f4f6abf0a903

module.exports = connectDB;