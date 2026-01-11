const mongoose = require('mongoose');

const FranchiseSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Invalid phone number']
    },

    location: { type: String, required: true, trim: true },

    pincode: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 6,
        match: [/^\d{6}$/, 'Invalid pincode']
    },

    current_business: { type: String, required: true, trim: true },

    experience_years: {
        type: Number,
        required: true,
        min: 0
    },
    experience_months: {
        type: Number,
        required: true,
        min: 0,
        max: 11
    },
    no_of_experience: {
        type: Number, // total months
        required: true,
        min: 0
    },

    message: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Franchise", FranchiseSchema);