const jwt = require('jsonwebtoken');
const pool = require('../DB/connectdb');


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Extract token
      token = req.headers.authorization.split(' ')[1];
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from DB
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // 4. Attach user to request
      req.user = result.rows[0];

      return next();

    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  // No token at all
  return res.status(401).json({ error: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as a superadmin' });
  }
};

module.exports = { protect, admin, superadmin };