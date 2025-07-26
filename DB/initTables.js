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
    pincode VARCHAR(15),
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

  tracking_number VARCHAR(50) UNIQUE NOT NULL,

  sender_name VARCHAR(100) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  sender_address TEXT NOT NULL,

  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  receiver_address TEXT NOT NULL,

  from_branch INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  to_branch INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,

  weight DECIMAL(10, 2) NOT NULL,
  dimensions VARCHAR(50),
  package_type VARCHAR(50),

  current_status VARCHAR(50) NOT NULL DEFAULT 'created',

  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  estimated_delivery DATE,
  delivery_notes TEXT,

  shipping_cost DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending'
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
      parcel_id INTEGER REFERENCES parcels(id) NOT NULL,
      status VARCHAR(50) NOT NULL,
      location_branch INTEGER REFERENCES branches(id),
      notes TEXT,
      updated_by INTEGER REFERENCES users(id) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✅ parcel_status_history table created');
};

const otp_logs = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS otp_logs (
    id SERIAL PRIMARY KEY,
    from_email VARCHAR(100) NOT NULL,
    to_email VARCHAR(100) NOT NULL,
    otp VARCHAR(10),
    status VARCHAR(20) CHECK (status IN ('sent', 'verified', 'expired', 'failed')) DEFAULT 'sent',
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);
  `
  await pool.query(query);
  console.log('✅ OTP_log table created');
}

const blocked_emails = async () => {
  const query = ` 
      CREATE TABLE IF NOT EXISTS blocked_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `
  await pool.query(query);
  console.log('✅ blocked_emails table created');
}

// 7️⃣ Export All Functions
module.exports = {
  RequestOfPicupTable,
  contactTable,
  users,
  branches,
  parcels,
  parcel_status_history,
  otp_logs,
  blocked_emails
};
