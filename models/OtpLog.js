// models/OtpLog.js
const mongoose = require("mongoose");

const otpLogSchema = new mongoose.Schema({
    from_email: String,
    to_email: String,
    otp: String,
    status: {
        type: String,
        enum: ["sent", "verified", "invalid", "expired_or_missing", "expired", "failed"],
        default: "sent"
    },
    ip_address: String,
    user_agent: String
}, { timestamps: true });

module.exports = mongoose.model("OtpLog", otpLogSchema);