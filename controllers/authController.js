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
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const blocked = await BlockedEmail.findOne({ email });
        if (blocked) {
            return res.status(403).json({ message: "Email blocked" });
        }

        otpMap.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        await transporter.sendMail({
            from: `"ShreeXpress Courier Service" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Your OTP to Reset Password",
            html: `
    <div style="font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:#383185; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">ShreeXpress Courier Service</h1>
                <p style="color:#dcdcff; margin:5px 0 0; font-size:14px;">
                    Fast • Reliable • Secure
                </p>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333333;">
                <h2 style="margin-top:0; color:#383185;">Password Reset Request</h2>

                <p style="font-size:15px; line-height:1.6;">
                    We received a request to reset the password for your <strong>ShreeXpress</strong> account.
                </p>

                <p style="font-size:15px; line-height:1.6;">
                    Please use the following One-Time Password (OTP) to continue:
                </p>

                <!-- OTP Box -->
                <div style="margin:30px 0; text-align:center;">
                    <span style="
                        display:inline-block;
                        background:#f1f2ff;
                        color:#383185;
                        font-size:28px;
                        letter-spacing:6px;
                        padding:15px 30px;
                        border-radius:8px;
                        font-weight:bold;
                    ">
                        ${otp}
                    </span>
                </div>

                <p style="font-size:14px; color:#555;">
                    ⏰ This OTP is valid for <strong>10 minutes</strong>.
                </p>

                <p style="font-size:14px; color:#555;">
                    If you did not request a password reset, please ignore this email or contact our support team immediately.
                </p>

                <hr style="border:none; border-top:1px solid #e5e7eb; margin:25px 0;">

                <p style="font-size:13px; color:#777;">
                    For security reasons, do not share this OTP with anyone. Our team will never ask for your OTP.
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} ShreeXpress Courier Service. All rights reserved.
            </div>

        </div>
    </div>
            `,
        });

        await OtpLog.create({
            from_email: process.env.SMTP_EMAIL,
            to_email: email,
            otp,
            status: "sent",
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
        });

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const data = otpMap.get(email);

    if (!data || Date.now() > data.expiresAt) {
        return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (data.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    otpMap.delete(email);

    await OtpLog.create({
        from_email: process.env.SMTP_EMAIL,
        to_email: email,
        otp,
        status: "verified",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
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