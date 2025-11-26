const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const branchRoutes = require('./routes/branchRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const contactRoutes = require('./routes/contactRoutes');


dotenv.config();
const {
    RequestOfPicupTable,
    contactTable,
    users,
    branches,
    parcels,
    parcel_status_history,
    otp_logs,
    blocked_emails
} = require('./DB/initTables');
const pool = require("./DB/connectdb");
const { protect, superadmin } = require("./middleware/authMiddleware");

const createTables = async () => {
    try {
        await RequestOfPicupTable();
        await contactTable();
        await users();               // Required for branches, parcels, status history
        await branches();            // Required for parcels
        await parcels();             // Required for parcel_status_history
        await parcel_status_history();
        await otp_logs();
        await blocked_emails();
        console.log('✅ All tables initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing tables:', err.message);
    }
};

createTables();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/courier', parcelRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
    //  res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.send("<h1>ShreeXpress Courier API</h1>");
});

app.get("/api/all", async (req, res) => {
    try {
        const query = "select * from users"
        const users = await pool.query(query);
        if (users.rows.length === 0) {
            res.status(400).json({
                message: "Table is Empty"
            })
        }
        res.status(200).json(users.rows);

    } catch (error) {
        console.log("Error while Feathing User")
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

app.get('/sql/editor', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'No SQL query provided' });
    }

    try {
        const result = await pool.query(query);

        res.json({
            rowCount: result.rowCount,
            command: result.command, // SELECT, INSERT, UPDATE, etc.
            fields: result.fields?.map((f) => f.name) || [],
            rows: result.rows || [],
        });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(400).json({ message: err.message });
    }
});

//otp logs
app.get('/api/otp-logs', protect, superadmin, async (req, res) => {
    try {
        const logs = await pool.query("SELECT * FROM otp_logs ORDER BY created_at DESC");
        res.status(200).json(logs.rows);
    } catch (error) {
        console.error("Error fetching OTP logs:", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
})

//block emails
//add 
app.post('/api/block-email', protect, superadmin, async (req, res) => {
    const { email, reason } = req.body;
    if (!email || !reason) {
        return res.status(400).json({ message: 'Email and reason are required' });
    }
    //if allreay have
    const query = "SELECT * FROM blocked_emails WHERE email = $1";
    const existingEmail = await pool.query(query, [email]);
    if (existingEmail.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already blocked' });
    }

    try {
        const query = "INSERT INTO blocked_emails (email, reason) VALUES ($1, $2) RETURNING *";
        const values = [email, reason];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error blocking email:", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

//get all blocked emails
app.get('/api/blocked-emails', protect, superadmin, async (req, res
) => {
    try {
        const result = await pool.query("SELECT * FROM blocked_emails ORDER BY blocked_at DESC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching blocked emails:", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

//delete blocked email
app.delete('/api/block-email/:id', protect, superadmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM blocked_emails WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Blocked email not found' });
        }
        res.status(200).json({ message: 'Blocked email deleted successfully' });
    } catch (error) {
        console.error("Error deleting blocked email:", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});


app.listen(PORT || 5000, () => {
    console.log(`Server is Running On : ${PORT}`);
});
