const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Mongoose User model

/* ================= PROTECT ================= */
const protect = async (req, res, next) => {
  let token;

  console.log("[AUTH] Authorization header:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("[AUTH] Extracted token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AUTH] Decoded JWT:", decoded);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          error: "Not authorized, user not found",
        });
      }

      req.user = user; // attach mongoose user
      next();

    } catch (error) {
      console.error("[AUTH] Token verification error:", error.message);
      return res.status(401).json({
        error: "Not authorized, token failed",
      });
    }
  } else {
    console.warn("[AUTH] No Bearer token in header");
    return res.status(401).json({
      error: "Not authorized, no token",
    });
  }
};

/* ================= ADMIN ================= */
const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res.status(403).json({
      error: "Not authorized as an admin",
    });
  }
};

/* ================= SUPERADMIN ================= */
const superadmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({
      error: "Not authorized as a superadmin",
    });
  }
};

module.exports = { protect, admin, superadmin };