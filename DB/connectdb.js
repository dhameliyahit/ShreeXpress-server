// connectDB.js
const { Pool } = require("pg");
require("dotenv").config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');


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


module.exports = pool;
