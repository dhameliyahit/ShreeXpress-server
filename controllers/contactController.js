const pool = require('../DB/connectdb');

// Create contact request
const createContactRequest = async (req, res) => {
    try {
        const { full_name, phone_number, email, subject, message } = req.body;

        const newRequest = await pool.query(
            `INSERT INTO contact_requests 
      (full_name, phone_number, email, subject, message) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
            [full_name, phone_number, email, subject, message]
        );

        res.status(201).json(newRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all contact requests (admin only)
const getAllContactRequests = async (req, res) => {
    try {
        const requests = await pool.query(`
      SELECT * FROM contact_requests 
      ORDER BY created_at DESC
    `);
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get contact request by ID
const getContactRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await pool.query(
            'SELECT * FROM contact_requests WHERE id = $1',
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
    createContactRequest,
    getAllContactRequests,
    getContactRequestById
};