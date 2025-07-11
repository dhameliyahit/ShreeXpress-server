const pool = require('./connectdb');

// 1️⃣ Pick Of Request Table
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
    console.log('✅ pick_of_request table created');
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
    console.log('✅ contact table created');
};

// 3️⃣ Export all functions
module.exports = {
    RequestOfPicupTable,
    contactTable,
};
