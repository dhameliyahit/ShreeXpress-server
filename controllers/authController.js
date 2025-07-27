const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../DB/connectdb');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1. Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: `credentials Not Found` });
    }

    const user = result.rows[0];


    // 2. Check if password is valid
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid Password' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

const newAdminController = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;



    const isAlreadyHave = await pool.query('SELECT email, role FROM users WHERE email = $1', [email]);

    if (isAlreadyHave.rows.length > 0) {
      if (isAlreadyHave.rows[0].role === 'admin') {
        return res.status(400).json({
          message: "This email already exists as an admin"
        });
      } else if (isAlreadyHave.rows[0].role === 'superadmin') {
        return res.status(400).json({
          message: "This email already exists as a superadmin"
        });
      } else {
        // email exists, but not an admin
        return res.status(400).json({
          message: "This email already exists as a client"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, salt)


    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [name, email, hashedPassword, role]);

    if (result.rowCount === 0) {
      return res.status(202).json({
        message: "New Admin Creation Failed"
      });
    }

    res.status(200).json({
      message: "New Admin Created",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error while creating new admin:", error.message);

    res.status(500).json({
      message: "Internal Server Error",


    });
  }
};


const newClientController = async (req, res) => {
  try {
    const { name, email, password, role = "client" } = req.body;
    const createdBy = req.user.id;

    const hashedPassword = await bcrypt.hash(password, salt)

    const query = `
      INSERT INTO users (name, email, password,role,created_by)
      VALUES ($1, $2, $3, $4,$5)
      RETURNING *
    `;

    const result = await pool.query(query, [name, email, hashedPassword, role, createdBy]);

    if (result.rowCount === 0) {
      return res.status(202).json({
        message: "New Client Creation Failed"
      });
    }

    res.status(200).json({
      message: "New Client Created",
      user: result.rows[0],
    });


  } catch (error) {
    console.log("Error while New Client Create By Admin", error.message);
    res.status(500).json({
      message: `Error ${error.message}`
    })
  }
};


const getAllAdminController = async (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE role = 'admin'`
    const admins = await pool.query(query);

    if (admins.rows.length === 0) {
      res.status(400).json({
        message: "In Our Company No admins any"
      })
    }

    res.status(200).json({
      message: "All Admin's Got By Super Admin",
      totalAdmin: admins.admins,
      admins: admins.rows,
    })

  } catch (error) {
    console.log("Error on All Admin Get" + error.message)
    res.status(500).json({
      message: `error ${error.message}`
    })
  }
};


const getAllClientController = async (req, res) => {
  try {
    const { id } = req.user;

    const query = `SELECT * FROM users WHERE role = 'client' AND created_by = $1`
    const clients = await pool.query(query, [id]);

    if (clients.rows.length === 0) {
      res.status(300).json({
        client: "No Client's that creted by me!"
      })
    }

    res.status(200).json({
      message: "All Cleint Get Successfully",
      total: clients.rowCount,
      clients: clients.rows
    })

    // const client = await pool.query(query,[])

  } catch (error) {
    console.log("Error while Get client By Admin" + error.message)
    res.status(500).json({
      message: "Error while geting client By admin" + error.message
    })
  }
}

const getNewSuperAdminController = async (req, res) => {
  try {
    const { name, email, password, role = 'superadmin' } = req.body;

    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)`

    const superadmin = await pool.query(query, [name, email, hashedPassword, role]);

    res.status(200).json({
      message: "Superadmin Created successfully",
      superadmin: superadmin.rows[0]
    })

  } catch (error) {
    console.log("error" + error.message)
    res.status(200).json({ message: "error while crete super admin" + error.message })
  }
}


const getAllUsersController = async (req, res) => {
  try {
    const { role } = req.query;

    // Only allow these roles
    const validRoles = ['client', 'admin', 'superadmin'];

    let query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
    let values = [];

    if (role && validRoles.includes(role)) {
      query += ' WHERE role = $1';
      values.push(role);
    }

    const result = await pool.query(query, values);
    res.json({ success: true, users: result.rows });

  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

const otpMap = new Map(); // In-memory store (email → otp)




const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const from_email = process.env.SMTP_EMAIL || 'shreexpresscourierservice@gmail.com';

  try {
    // 1. Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if recipient is blocked
    const blocked = await pool.query(`SELECT * FROM blocked_emails WHERE email = $1`, [email]);
    if (blocked.rows.length > 0) {
      return res.status(403).json({ message: 'This email is blocked from receiving OTPs.' });
    }

    // 3. Store OTP in-memory (temp)
    otpMap.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 mins

    // 4. Send OTP Email
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

    // 5. Log OTP send event
    await pool.query(
      `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
       VALUES ($1, $2, $3, 'sent', $4, $5)`,
      [
        from_email,
        email,
        otp,
        req.ip,
        req.headers['user-agent'] || ''
      ]
    );

    res.json({ success: true, message: `OTP sent to ${email}` });

  } catch (err) {
    console.error("Forgot password error:", err);

    // Log failed OTP event
    await pool.query(
      `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
       VALUES ($1, $2, $3, 'failed', $4, $5)`,
      [
        from_email,
        email,
        otp,
        req.ip,
        req.headers['user-agent'] || ''
      ]
    );

    res.status(500).json({ success: false, message: 'Failed to send OTP', error: err.message });
  }
};


const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log("Email:", email, "OTP:", otp);
  console.log("Current OTP Map:", otpMap);

  const data = otpMap.get(email);
  const from_email = process.env.SMTP_EMAIL || 'shreexpresscourierservice@gmail.com';

  if (!data) {
    // Log expired/missing OTP
    await pool.query(
      `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
       VALUES ($1, $2, $3, 'expired_or_missing', $4, $5)`,
      [from_email, email, otp, req.ip, req.headers['user-agent'] || '']
    );
    return res.status(400).json({ message: "OTP not found or expired" });
  }

  if (data.otp !== otp) {
    // Log invalid OTP attempt
    await pool.query(
      `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
       VALUES ($1, $2, $3, 'invalid', $4, $5)`,
      [from_email, email, otp, req.ip, req.headers['user-agent'] || '']
    );
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > data.expiresAt) {
    otpMap.delete(email);
    // Log expired OTP
    await pool.query(
      `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
       VALUES ($1, $2, $3, 'expired', $4, $5)`,
      [from_email, email, otp, req.ip, req.headers['user-agent'] || '']
    );
    return res.status(400).json({ message: "OTP expired" });
  }

  // Success: OTP verified
  otpMap.delete(email);
  await pool.query(
    `INSERT INTO otp_logs (from_email, to_email, otp, status, ip_address, user_agent)
     VALUES ($1, $2, $3, 'verified', $4, $5)`,
    [from_email, email, otp, req.ip, req.headers['user-agent'] || '']
  );

  res.json({ message: "OTP verified successfully" });
};


const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    res.json({ message: 'Password reset successful', newPassword: password });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message });
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
  getAllUsersController
};