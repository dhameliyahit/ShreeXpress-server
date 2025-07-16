const pool = require('../DB/connectdb');
const { generateTrackingNumber } = require('../utils/helpers');

// Create parcel
const createParcel = async (req, res) => {
  try {
    const { sender_name, receiver_name, from_branch, to_branch } = req.body;
    
    // Generate unique tracking number
    const trackingNumber = generateTrackingNumber();
    
    const newParcel = await pool.query(
      `INSERT INTO parcels 
      (tracking_number, sender_name, receiver_name, from_branch, to_branch, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [trackingNumber, sender_name, receiver_name, from_branch, to_branch, req.user.id]
    );
    
    // Add initial status to history
    await pool.query(
      'INSERT INTO parcel_status_history (parcel_id, status, updated_by) VALUES ($1, $2, $3)',
      [newParcel.rows[0].id, 'created', req.user.id]
    );
    
    res.status(201).json(newParcel.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all parcels with filters
const getAllParcels = async (req, res) => {
  try {
    const { status, from_branch, to_branch } = req.query;
    
    let query = `
      SELECT p.*, 
      fb.branch_name as from_branch_name,
      tb.branch_name as to_branch_name,
      u.name as created_by_name
      FROM parcels p
      LEFT JOIN branches fb ON p.from_branch = fb.id
      LEFT JOIN branches tb ON p.to_branch = tb.id
      LEFT JOIN users u ON p.created_by = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (status) {
      params.push(status);
      conditions.push(`p.current_status = $${params.length}`);
    }
    
    if (from_branch) {
      params.push(from_branch);
      conditions.push(`p.from_branch = $${params.length}`);
    }
    
    if (to_branch) {
      params.push(to_branch);
      conditions.push(`p.to_branch = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const parcels = await pool.query(query, params);
    res.json(parcels.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get parcel by tracking number
const getParcelByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const parcel = await pool.query(
      `SELECT p.*, 
      fb.branch_name as from_branch_name,
      tb.branch_name as to_branch_name,
      u.name as created_by_name
      FROM parcels p
      LEFT JOIN branches fb ON p.from_branch = fb.id
      LEFT JOIN branches tb ON p.to_branch = tb.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tracking_number = $1`,
      [trackingNumber]
    );
    
    if (parcel.rows.length === 0) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    // Get status history
    const history = await pool.query(
      `SELECT h.*, u.name as updated_by_name 
      FROM parcel_status_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.parcel_id = $1
      ORDER BY h.updated_at DESC`,
      [parcel.rows[0].id]
    );
    
    res.json({
      parcel: parcel.rows[0],
      history: history.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update parcel status
const updateParcelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // First check if parcel exists
    const parcelExists = await pool.query('SELECT id FROM parcels WHERE id = $1', [id]);
    if (parcelExists.rows.length === 0) {
      return res.status(404).json({ error: 'Parcel not found' });
    }
    
    // Update parcel status
    await pool.query(
      'UPDATE parcels SET current_status = $1 WHERE id = $2',
      [status, id]
    );
    
    // Add to history
    await pool.query(
      'INSERT INTO parcel_status_history (parcel_id, status, updated_by) VALUES ($1, $2, $3)',
      [id, status, req.user.id]
    );
    
    res.json({ message: 'Parcel status updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus
};