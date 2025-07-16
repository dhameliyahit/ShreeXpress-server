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
    parcel_status_history
} = require('./DB/initTables');
const pool = require("./DB/connectdb");

const createTables = async () => {
    try {
        await RequestOfPicupTable();
        await contactTable();
        await users();               // Required for branches, parcels, status history
        await branches();            // Required for parcels
        await parcels();             // Required for parcel_status_history
        await parcel_status_history();
        console.log('✅ All tables initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing tables:', err.message);
    }
};

createTables();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/parcels', parcelRoutes);
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


app.listen(PORT || 3000, () => {
    console.log(`Server is Running On : ${PORT}`);
});
