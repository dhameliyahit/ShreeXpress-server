// models/BlockedEmail.js
const mongoose = require("mongoose");

const blockedEmailSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  reason: String
}, { timestamps: true });

module.exports = mongoose.model("BlockedEmail", blockedEmailSchema);