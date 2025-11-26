// addSuperAdmin.js
const pool = require('./DB/connectdb'); // Import your existing pool
const bcrypt = require('bcrypt');

async function addsuperadmin() {
    try {
        const name = 'Balar Crens';
        const email = 'balarcrens@gmail.com';
        const password = 'crens446';
        const role = 'superadmin';

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert into users table
        const query = `
  INSERT INTO users (name, email, password, role, created_at)
  VALUES ($1, $2, $3, $4, NOW())
  RETURNING id
`;
        const values = [name, email, hashedPassword, role];

        const result = await pool.query(query, values);
        console.log('Super admin added with ID:', result.rows[0].id);

        // Optionally, you can end the pool if this is a one-time script
        await pool.end();
    } catch (err) {
        console.error('Error adding super admin:', err.message);
    }
}

addsuperadmin();