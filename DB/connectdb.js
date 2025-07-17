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
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
  ,
});


module.exports = pool;
