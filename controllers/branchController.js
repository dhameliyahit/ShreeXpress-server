const pool = require('../DB/connectdb');

// Create branch (admin/superadmin only)
const createBranch = async (req, res) => {
  try {
    const { branch_name, address, phone } = req.body;
    
    const newBranch = await pool.query(
      'INSERT INTO branches (branch_name, address, phone, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [branch_name, address, phone, req.user.id]
    );
    
    res.status(201).json(newBranch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await pool.query(`
      SELECT b.*, u.name as created_by_name 
      FROM branches b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(branches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const branch = await pool.query(`
      SELECT b.*, u.name as created_by_name 
      FROM branches b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = $1
    `, [id]);
    
    if (branch.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json(branch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_name, address, phone } = req.body;
    
    const updatedBranch = await pool.query(
      'UPDATE branches SET branch_name = $1, address = $2, phone = $3 WHERE id = $4 RETURNING *',
      [branch_name, address, phone, id]
    );
    
    if (updatedBranch.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    res.json(updatedBranch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if branch exists
    const branchExists = await pool.query('SELECT id FROM branches WHERE id = $1', [id]);
    if (branchExists.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    await pool.query('DELETE FROM branches WHERE id = $1', [id]);
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch
};