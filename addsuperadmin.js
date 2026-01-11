const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import User model
const User = require("./models/User");

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("DB connection failed:", error.message);
        process.exit(1);
    }
};

const addSuperAdmin = async () => {
    try {
        await connectDB();

        const name = "Balar Crens";
        const email = "balarcrens@gmail.com";
        const password = "crens446";
        const role = "superadmin";

        // Check if already exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log("❌ Superadmin already exists");
            process.exit();
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        console.log("✅ Superadmin created successfully");
        console.log("ID:", user._id.toString());

        process.exit();
    } catch (error) {
        console.error("Error creating superadmin:", error.message);
        process.exit(1);
    }
};

addSuperAdmin();