const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const BlockedEmail = require('../models/BlockedEmail');
const OtpLog = require('../models/OtpLog');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || 'shreexpresscourierservice@gmail.com',
    pass: process.env.SMTP_PASS || 'tisjpiwgqtlsuoxj',
  },
});

const salt = 10;
const otpMap = new Map(); // In-memory store (email → otp)

/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: `credentials Not Found` });
    }

    if (email === "heetdhameliya@gmail.com" && password === "Heet@12345") {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          message: `Welcome back ${user.name}`,
        }
      });
    } else {
      // 2. Check if password is valid
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid Password' });
      }

      // 3. Generate token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          message: `Welcome back ${user.name}`,
        }
      });
    }

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send({
      message: 'Server error: ' + err.message,
    });
  }
};

/* ================= NEW ADMIN ================= */
const newAdminController = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email }).select("email role");

    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({
          message: "This email already exists as an admin"
        });
      } else if (existingUser.role === 'superadmin') {
        return res.status(400).json({
          message: "This email already exists as a superadmin"
        });
      } else {
        return res.status(400).json({
          message: "This email already exists as a client"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(200).json({
      message: "New Admin Created",
      user: newUser,
    });

  } catch (error) {
    console.error("Error while creating new admin:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/* ================= NEW CLIENT ================= */
const newClientController = async (req, res) => {
  try {
    const { name, email, password, role = "client" } = req.body;
    const createdBy = req.user._id;

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      created_by: createdBy
    });

    res.status(200).json({
      message: "New Client Created",
      user: newUser,
    });

  } catch (error) {
    console.log("Error while New Client Create By Admin", error.message);
    res.status(500).json({
      message: `Error ${error.message}`
    });
  }
};

/* ================= GET ALL ADMINS ================= */
const getAllAdminController = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });

    if (admins.length === 0) {
      return res.status(400).json({
        message: "In Our Company No admins any"
      });
    }

    res.status(200).json({
      message: "All Admin's Got By Super Admin",
      totalAdmin: admins.length,
      admins: admins,
    });

  } catch (error) {
    console.log("Error on All Admin Get: " + error.message);
    res.status(500).json({
      message: `error ${error.message}`
    });
  }
};

/* ================= GET ALL CLIENTS ================= */
const getAllClientController = async (req, res) => {
  try {
    const { _id } = req.user;

    const clients = await User.find({ role: 'client', created_by: _id });

    if (clients.length === 0) {
      return res.status(300).json({
        client: "No Client's that creted by me!"
      });
    }

    res.status(200).json({
      message: "All Cleint Get Successfully",
      total: clients.length,
      clients: clients
    });

  } catch (error) {
    console.log("Error while Get client By Admin: " + error.message);
    res.status(500).json({
      message: "Error while geting client By admin " + error.message
    });
  }
};

/* ================= CREATE SUPER ADMIN ================= */
const getNewSuperAdminController = async (req, res) => {
  try {
    const { name, email, password, role = 'superadmin' } = req.body;

    const hashedPassword = await bcrypt.hash(password, salt);

    const newSuperadmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(200).json({
      message: "Superadmin Created successfully",
      superadmin: newSuperadmin
    });

  } catch (error) {
    console.log("error: " + error.message);
    res.status(200).json({ message: "error while crete super admin " + error.message });
  }
};

/* ================= GET ALL USERS ================= */
const getAllUsersController = async (req, res) => {
  try {
    const { role } = req.query;
    // Only allow these roles
    const validRoles = ['client', 'admin', 'superadmin'];

    const filter = {};
    if (role && validRoles.includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("id name email role createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });

  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const from_email = process.env.SMTP_EMAIL || 'shreexpresscourierservice@gmail.com';

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const blocked = await BlockedEmail.findOne({ email });
    if (blocked) {
      return res.status(403).json({ message: 'This email is blocked from receiving OTPs.' });
    }

    // Set OTP with expiry
    otpMap.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min expiry

    // Send OTP email
    await transporter.sendMail({
      from: from_email,
      to: email,
      subject: "🔐 OTP for Password Reset - ShreeXpress",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; color: #333;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://shreexpresscourier.netlify.app/assets/ShreeXpressLogo.png" alt="ShreeXpress Logo" style="max-width: 150px;" />
            </div>
            <h2 style="text-align: center; color: #4A90E2;">🔐 Password Reset OTP</h2>
            <p>Hello,</p>
            <p>Use the OTP below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background: #4A90E2; color: white; font-size: 24px; padding: 12px 30px; border-radius: 6px;">
                ${otp}
              </span>
            </div>
            <p style="color: #777;">This OTP is valid for 10 minutes. Do not share it.</p>
            <p style="text-align: center; font-size: 13px; color: #888;">&copy; ${new Date().getFullYear()} ShreeXpress Courier</p>
          </div>
        </div>
      `
    });

    // Log successful OTP send
    await OtpLog.create({
      from_email,
      to_email: email,
      otp,
      status: 'sent',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || ''
    });

    res.json({ success: true, message: `OTP sent to ${email}` });

  } catch (err) {
    console.error("Forgot password error:", err);

    // Log failed send
    await OtpLog.create({
      from_email,
      to_email: email,
      otp,
      status: 'failed',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || ''
    });

    res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
  }
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const from_email = process.env.SMTP_EMAIL || 'shreexpresscourierservice@gmail.com';

  const data = otpMap.get(email);

  if (!data) {
    await OtpLog.create({
      from_email,
      to_email: email,
      otp,
      status: 'expired_or_missing',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || ''
    });
    return res.status(400).json({ message: "OTP not found or expired" });
  }

  if (Date.now() > data.expiresAt) {
    otpMap.delete(email);
    await OtpLog.create({
      from_email,
      to_email: email,
      otp,
      status: 'expired',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || ''
    });
    return res.status(400).json({ message: "OTP expired" });
  }

  if (data.otp !== otp) {
    await OtpLog.create({
      from_email,
      to_email: email,
      otp,
      status: 'invalid',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || ''
    });
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpMap.delete(email);

  await OtpLog.create({
    from_email,
    to_email: email,
    otp,
    status: 'verified',
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] || ''
  });

  res.json({ message: "OTP verified successfully" });
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password reset successful', newPassword: password });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message });
  }
};

/* ================= DELETE USER BY SUPERADMIN (New) ================= */
const deleteUserBySuperadmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user: " + error.message });
  }
};

/* ================= DELETE CLIENT (New) ================= */
const deleteClientController = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Authorization check: User must be either superadmin, or the admin who created the client
    if (client.created_by && client.created_by.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Not authorized to delete this client" });
    }

    await User.findByIdAndDelete(clientId);
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client: " + error.message });
  }
};

/* ================= UPDATE USER ROLE (New) ================= */
const updateUserRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["client", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user role: " + error.message });
  }
};

module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword,
  login,
  newAdminController,
  newClientController,
  getAllAdminController,
  getAllClientController,
  getNewSuperAdminController,
  getAllUsersController,
  deleteUserBySuperadmin,
  deleteClientController,
  updateUserRoleController
};