// connectDB.js
const { Pool } = require("pg");
require("dotenv").config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');


const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // database: process.env.DB_DATABASE,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  host: "123.45.67.89",
  user: "postgres",
  database: "postgres",
  password: "NzlxtqOJFXmaJxL4",
  port: 5432,
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:NzlxtqOJFXmaJxL4@db.bmrafgsrabzqgfnhuzbt.supabase.co:5432/postgres",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});


module.exports = pool;
