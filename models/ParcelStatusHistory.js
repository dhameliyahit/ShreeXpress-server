const mongoose = require("mongoose");

const parcelStatusHistorySchema = new mongoose.Schema(
    {
        parcel_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Parcel",
            required: true
        },
        status: String,
        location_branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch"
        },
        notes: String,
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ParcelStatusHistory", parcelStatusHistorySchema);