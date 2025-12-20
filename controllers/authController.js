const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const OtpLog = require("../models/OtpLog");
const BlockedEmail = require("../models/BlockedEmail");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS
    }
});

const otpMap = new Map();
const SALT = 10;

/* ================= LOGIN ================= */
const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            role: user.role
        }
    });
};

/* ================= CREATE ADMIN ================= */
const newAdminController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: `Email already exists as ${exists.role}` });

    const hashedPassword = await bcrypt.hash(password, SALT);

    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    res.status(201).json({ message: "New Admin Created", user: admin });
};

/* ================= CREATE CLIENT ================= */
const newClientController = async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT);

    const client = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "client",
        created_by: req.user.id
    });

    res.status(201).json({ message: "New Client Created", user: client });
};

/* ================= GET ADMINS ================= */
const getAllAdminController = async (req, res) => {
    const admins = await User.find({ role: "admin" });
    res.json({ totalAdmin: admins.length, admins });
};

/* ================= GET CLIENTS ================= */
const getAllClientController = async (req, res) => {
    const clients = await User.find({ created_by: req.user.id });
    res.json({ total: clients.length, clients });
};

/* ================= DELETE CLIENT ================= */
const deleteClientController = async (req, res) => {
    const client = await User.findOne({
        _id: req.params.clientId,
        created_by: req.user.id
    });

    if (!client) return res.status(403).json({ message: "Unauthorized" });

    await User.findByIdAndDelete(req.params.clientId);
    res.json({ message: "Client deleted successfully" });
};

/* ================= CREATE SUPERADMIN ================= */
const getNewSuperAdminController = async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT);

    const superadmin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "superadmin"
    });

    res.json({ message: "Superadmin Created", superadmin });
};

/* ================= GET ALL USERS ================= */
const getAllUsersController = async (req, res) => {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const blocked = await BlockedEmail.findOne({ email });
    if (blocked) return res.status(403).json({ message: "Email blocked" });

    otpMap.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: "OTP for Password Reset",
        text: `Your OTP is ${otp}`
    });

    await OtpLog.create({
        from_email: process.env.SMTP_EMAIL,
        to_email: email,
        otp,
        status: "sent",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });

    res.json({ message: "OTP sent successfully" });
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const data = otpMap.get(email);

    if (!data || Date.now() > data.expiresAt)
        return res.status(400).json({ message: "OTP expired or invalid" });

    if (data.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

    otpMap.delete(email);

    await OtpLog.create({
        from_email: process.env.SMTP_EMAIL,
        to_email: email,
        otp,
        status: "verified",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"]
    });

    res.json({ message: "OTP verified successfully" });
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT);
    await User.updateOne({ email }, { password: hashedPassword });

    res.json({ message: "Password reset successful" });
};

module.exports = {
    login,
    newAdminController,
    newClientController,
    getAllAdminController,
    getAllClientController,
    deleteClientController,
    getNewSuperAdminController,
    getAllUsersController,
    forgotPassword,
    verifyOtp,
    resetPassword
};