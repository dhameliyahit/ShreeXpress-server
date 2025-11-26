const pool = require('../DB/connectdb');

// Create parcel
const createParcel = async (req, res) => {
    try {
        const {
            sender_name,
            sender_phone,
            sender_address,
            receiver_name,
            receiver_phone,
            receiver_address,
            to_branch,
            weight,
            dimensions,
            package_type,
            delivery_notes,
            payment_method
        } = req.body;

        const from_branch = req.user.id;
        console.log(from_branch)
        // Validate required fields
        if (
            !sender_name || !sender_phone || !sender_address ||
            !receiver_name || !receiver_phone || !receiver_address ||
            !from_branch || !to_branch || !weight || !package_type || !payment_method
        ) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find from_branch ID
        const fromBranchRes = await pool.query(
            'SELECT id FROM branches WHERE id = $1',
            [from_branch]
        );
        if (fromBranchRes.rowCount === 0) {
            return res.status(400).json({ error: 'From branch not found' });
        }
        const fromBranchId = fromBranchRes.rows[0].id;

        // Find to_branch ID
        const toBranchRes = await pool.query(
            'SELECT id FROM branches WHERE id = $1',
            [to_branch]
        );
        if (toBranchRes.rowCount === 0) {
            return res.status(400).json({ error: 'To branch not found' });
        }
        const toBranchId = toBranchRes.rows[0].id;

        // Generate tracking number
        const generateTrackingNumber = () => {
            return 'SX' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
        };
        const trackingNumber = generateTrackingNumber();

        // Insert parcel
        const newParcel = await pool.query(
            `INSERT INTO parcels (
        tracking_number, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address,
        from_branch, to_branch, weight, dimensions, package_type,
        delivery_notes, payment_method, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
            [
                trackingNumber,
                sender_name, sender_phone, sender_address,
                receiver_name, receiver_phone, receiver_address,
                fromBranchId, toBranchId, weight, dimensions, package_type,
                delivery_notes, payment_method, req.user.id
            ]
        );

        res.status(201).json(newParcel.rows[0]);

    } catch (err) {
        console.error("Error creating parcel:", err.message);
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
        console.log("Tracking Number:", trackingNumber);

        const parcelQuery = await pool.query(
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

        if (parcelQuery.rows.length === 0) {
            return res.status(404).json({ error: "Parcel not found" });
        }

        const parcel = parcelQuery.rows[0];

        // Get status history
        const history = await pool.query(
            `SELECT h.*, u.name as updated_by_name 
      FROM parcel_status_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.parcel_id = $1
      ORDER BY h.updated_at DESC`,
            [parcel.id]
        );

        // Normalized response
        res.json({
            trackingId: parcel.tracking_number,
            status: parcel.status,
            currentLocation: parcel.current_location || parcel.from_branch_name,
            expectedDelivery: parcel.expected_delivery,
            history: history.rows,

            // raw parcel object (optional, in case frontend needs full details later)
            parcel,
        });
    } catch (err) {
        console.error("Error in getParcelByTrackingNumber:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Update status
const updateParcelStatus = async (req, res) => {
    try {
        const parcelId = req.params.id;
        const { status } = req.body;

        if (!status)
            return res.status(400).json({ message: "Status is required" });

        const allowedStatuses = ["created", "in-transit", "delivered", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const result = await pool.query("UPDATE parcels SET current_status = $1 WHERE id = $2 RETURNING *", [status, parcelId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        res.status(200).json({ success: true, message: "Status updated", parcel: result.rows[0] });
    } catch (err) {
        console.error("Update parcel status error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const MyCourierController = async (req, res) => {
    try {
        const adminId = req.user.id;

        const query = `
      SELECT 
        p.*, 
        fb.branch_name AS from_branch_name,
        tb.branch_name AS to_branch_name
      FROM parcels p
      JOIN branches fb ON p.from_branch = fb.id
      JOIN branches tb ON p.to_branch = tb.id
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC
    `;

        const result = await pool.query(query, [adminId]);

        res.json({ success: true, count: result.rowCount, parcels: result.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const PaymentStatusChangeController = async (req, res) => {
    try {
        const { id, payment_status, payment_method } = req.body;

        if (!id || !payment_status || !payment_method) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const query = `
      UPDATE parcels
      SET payment_status = $1,
          payment_method = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

        const result = await pool.query(query, [payment_status, payment_method, id]);

        res.status(200).json({
            message: "Payment status & method updated successfully",
            updatedParcel: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createParcel,
    getAllParcels,
    getParcelByTrackingNumber,
    updateParcelStatus,
    MyCourierController,
    PaymentStatusChangeController
};