const pool = require('./connectdb');

// 1️⃣ Pickup Request Table
const RequestOfPicupTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      goods_type VARCHAR(100),
      approx_weight VARCHAR(50),
      address TEXT NOT NULL,
      nearest_branch VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ pickup_requests table created');
};

// 2️⃣ Contact Table
const contactTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS contact_requests (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ contact_requests table created');
};

// 3️⃣ Users Table
const users = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(50) CHECK (role IN ('client', 'admin', 'superadmin')) DEFAULT 'client',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ users table created');
};

// 4️⃣ Branches Table
const branches = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      branch_name VARCHAR(100),
      address TEXT,
      phone VARCHAR(15),
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ branches table created');
};

// 5️⃣ Parcels Table
const parcels = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS parcels (
      id SERIAL PRIMARY KEY,
      tracking_number VARCHAR(50) UNIQUE,
      sender_name VARCHAR(100),
      receiver_name VARCHAR(100),
      from_branch INTEGER REFERENCES branches(id),
      to_branch INTEGER REFERENCES branches(id),
      current_status VARCHAR(50) DEFAULT 'created',
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ parcels table created');
};

// 6️⃣ Parcel Status History Table
const parcel_status_history = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS parcel_status_history (
      id SERIAL PRIMARY KEY,
      parcel_id INTEGER REFERENCES parcels(id),
      status VARCHAR(50),
      updated_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ parcel_status_history table created');
};

// 7️⃣ Export All Functions
module.exports = {
  RequestOfPicupTable,
  contactTable,
  users,
  branches,
  parcels,
  parcel_status_history,
};
