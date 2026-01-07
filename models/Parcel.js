const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
    {
        tracking_number: { type: String, unique: true, required: true },

        sender_name: String,
        sender_phone: String,
        sender_address: String,
        email: String,

        receiver_name: String,
        receiver_phone: String,
        receiver_address: String,

        from_branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },
        to_branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            required: true
        },

        weight: Number,
        dimensions: String,
        package_type: String,

        current_status: {
            type: String,
            enum: ["created", "in-transit", "delivered", "cancelled"],
            default: "created"
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        estimated_delivery: Date,
        delivery_notes: String,

        shipping_cost: Number,
        payment_method: String,
        payment_status: {
            type: String,
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Parcel", parcelSchema);