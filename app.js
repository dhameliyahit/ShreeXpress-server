const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./DB/connectdb");
connectDB();

const User = require('./models/User');
const OtpLog = require("./models/OtpLog");
const BlockedEmail = require("./models/BlockedEmail");
const authRoutes = require("./routes/authRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const branchRoutes = require("./routes/branchRoutes");
const parcelRoutes = require("./routes/parcelRoutes");
const contactRoutes = require("./routes/contactRoutes");
const franchiseRoutes = require("./routes/franchiseRoutes");

const { protect, superadmin } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/courier", parcelRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/franchise", franchiseRoutes);

app.get("/", (req, res) => {
    res.send("<h1>ShreeXpress Courier API (MongoDB)</h1>");
});

app.get("/api/all", async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(400).json({ message: "No users found" });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/api/otp-logs", protect, superadmin, async (req, res) => {
    try {
        const logs = await OtpLog.find().sort({ created_at: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/block-email", protect, superadmin, async (req, res) => {
    const { email, reason } = req.body;

    const exists = await BlockedEmail.findOne({ email });
    if (exists) {
        return res.status(400).json({ message: "Email already blocked" });
    }

    const blocked = await BlockedEmail.create({ email, reason });
    res.status(201).json(blocked);
});

app.get("/api/blocked-emails", protect, superadmin, async (req, res) => {
    const emails = await BlockedEmail.find().sort({ blocked_at: -1 });
    res.json(emails);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});