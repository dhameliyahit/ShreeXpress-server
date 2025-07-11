const express = require('express');
const router = express.Router();
const pool = require('../DB/connectdb'); // Adjust the path as necessary

// pickup request route
router.post('/pickup', async (req, res) => {
    try {
        const { full_name, phone_number, pincode, goods_type, approx_weight, address, nearest_branch } = req.body;
        console.log('Received pickup request:', req.body);
        const result = await pool.query(`
    INSERT INTO pickup_requests (full_name, phone_number, pincode, goods_type, approx_weight, address, nearest_branch)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
`, [full_name, phone_number, pincode, goods_type, approx_weight, address, nearest_branch]);

         // ✅ shows inserted row

        res.status(201).json({ message: 'Pickup request created successfully' });
    } catch (error) {
        console.error('Error creating pickup request:', error);
        res.status(500).json({ error: 'Failed to create pickup request' });
    }
});
//get all  pickup requests
router.get("/pickup",async (req,res)=>{
    try {
        const result = await pool.query('SELECT * FROM pickup_requests ORDER BY created_at DESC;');
        console.log('Fetched pickup requests:', result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching pickup requests:', error);
        res.status(500).json({ error: 'Failed to fetch pickup requests' });
    }
})

//contact us

router.post('/contact', async (req, res) => {
    try {
        const {full_name,phone_number,email,subject,message} = req.body;
        const result = await pool.query(`INSERT INTO contact_requests (full_name,phone_number,email,subject,message) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, [full_name, phone_number, email, subject, message]);
        console.log(result.rows[0]); // ✅ shows inserted row
        res.status(201).json({ message: 'Contact request processed successfully' });
    } catch (error) {
        console.error('Error processing contact request:', error);
        res.status(500).json({ error: 'Failed to process contact request' });
    }
});

module.exports = router;