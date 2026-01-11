const mongoose = require("mongoose");

const contactRequestSchema = new mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
            trim: true
        },
        phone_number: {
            type: String,
            required: true,
            length: 10
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactRequest", contactRequestSchema);