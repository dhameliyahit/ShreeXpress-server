const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../DB/connectdb');
const { validationResult } = require('express-validator');
const { admin } = require('../middleware/authMiddleware');

const newAdminController = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [name, email, password, role]);

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
      message: "Internal Server Error"
    });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password)
    // 1. Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({message : `credentials Not Found`});
    }

    const user = result.rows[0];

    // 2. Check if password is valid
    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) {
    //   return res.status(400).json({ error: 'Invalid credentials' });
    // }

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


const newClientController = async (req, res) => {
  try {
    const { name, email, password, role = "client" } = req.body;
    const createdBy = req.user.id;
    const query = `
      INSERT INTO users (name, email, password,role,created_by)
      VALUES ($1, $2, $3, $4,$5)
      RETURNING *
    `;

    const result = await pool.query(query, [name, email, password, role, createdBy]);

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
//select * from users where role='client'AND create_by = * admin id


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
      totalAdmin: admins.rowCount,
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

module.exports = { login, newAdminController, newClientController, getAllAdminController, getAllClientController };