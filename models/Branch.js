const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
    {
        branch_name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            length: 6
        },
        phone: {
            type: String,
            required: true,
            length: 10
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);