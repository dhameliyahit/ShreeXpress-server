const mongoose = require("mongoose");

const pickupRequestSchema = new mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
            trim: true
        },
        phone_number: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        goods_type: {
            type: String,
            required: true
        },
        approx_weight: {
            type: String
        },
        address: {
            type: String,
            required: true
        },
        nearest_branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch", // optional
            required: true
        }
    },
    { timestamps: true } // creates createdAt & updatedAt
);

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);