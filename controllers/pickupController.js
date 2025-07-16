const pool = require('../DB/connectdb');

// Create pickup request
const createPickupRequest = async (req, res) => {
  try {
    const { 
      full_name, 
      phone_number, 
      pincode, 
      goods_type, 
      approx_weight, 
      address, 
      nearest_branch 
    } = req.body;
    
    const newRequest = await pool.query(
      `INSERT INTO pickup_requests 
      (full_name, phone_number, pincode, goods_type, approx_weight, address, nearest_branch) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [full_name, phone_number, pincode, goods_type, approx_weight, address, nearest_branch]
    );
    
    res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all pickup requests (admin only)
const getAllPickupRequests = async (req, res) => {
  try {
    const requests = await pool.query(`
      SELECT * FROM pickup_requests 
      ORDER BY created_at DESC
    `);
    res.json(requests.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get pickup request by ID
const getPickupRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await pool.query(
      'SELECT * FROM pickup_requests WHERE id = $1',
      [id]
    );
    
    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById
};