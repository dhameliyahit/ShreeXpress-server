const pool = require('../DB/connectdb');

// Create branch (admin/superadmin only)
const createBranch = async (req, res) => {
  try {
    const { branch_name, address, pincode, phone } = req.body;

    if (!branch_name || !address || !pincode || !phone ||
      branch_name.trim() === '' ||
      address.trim() === '' ||
      pincode.toString().length !== 6 || isNaN(pincode) ||
      phone.toString().length !== 10 || isNaN(phone)) {
      return res.status(400).send({ error: 'Invalid input. Please check all fields.' });
    }

    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT * FROM branches WHERE created_by = $1',
      [userId]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        error: 'You have already created a branch. Only one branch per admin is allowed.'
      });
    }


    const newBranch = await pool.query(
      'INSERT INTO branches (branch_name, address, phone, pincode, created_by) VALUES ($1, $2, $3, $4,$5) RETURNING *',
      [branch_name, address, phone, pincode, req.user.id]
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
      ORDER BY b.created_at ASC
    `);
    res.json(branches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get branch by ID
const getBranch = async (req, res) => {
  try {
    const { searchTerm } = req.params;

    const branch = await pool.query(`
      SELECT *
      FROM branches
      WHERE branch_name ILIKE $1 OR pincode = $2
`, [`%${searchTerm}%`, searchTerm]);


    if (branch.rows.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(branch.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllBranchName = async (req, res) => {
  try {
    const { branchName } = req.params;

    const query = `
      SELECT DISTINCT branch_name 
      FROM branches 
      WHERE branch_name ILIKE $1
    `;

    const values = [`%${branchName}%`]; // finds substring anywhere in name

    const BNames = await pool.query(query, values);

    if (BNames.rowCount === 0) {
      return res.status(404).json({
        message: "No branches match the given name",
        suggestions: []
      });
    }

    return res.status(200).json({
      message: `Branches matching "${branchName}"`,
      branches: BNames.rows
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};



// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_name, address, phone, pincode } = req.body;

    const updatedBranch = await pool.query(
      'UPDATE branches SET branch_name = $1, address = $2, phone = $3 pincode = $4 WHERE id = $5 RETURNING *',
      [branch_name, address, phone, pincode, id]
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
  getBranch,
  updateBranch,
  deleteBranch,
  getAllBranchName
};