const Parcel = require("../models/Parcel");
const Branch = require("../models/Branch");
const ParcelHistory = require("../models/ParcelStatusHistory");

/* ================= CREATE PARCEL ================= */
const createParcel = async (req, res) => {
    try {
        const {
            sender_name,
            sender_phone,
            sender_address,
            receiver_name,
            receiver_phone,
            receiver_address,
            from_branch,
            to_branch,
            weight,
            dimensions,
            package_type,
            delivery_notes,
            payment_method
        } = req.body;

        if (!sender_name || !sender_phone || !sender_address || !receiver_name || !receiver_phone || !receiver_address || !from_branch || !to_branch || !weight || !package_type || !payment_method) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const fromBranchExists = await Branch.findById(from_branch);
        const toBranchExists = await Branch.findById(to_branch);

        if (!fromBranchExists || !toBranchExists) {
            return res.status(400).json({ error: "Branch not found" });
        }

        const trackingNumber = "SX" + Math.random().toString(36).substring(2, 6).toUpperCase() + Date.now().toString().slice(-6);

        const parcel = await Parcel.create({
            tracking_number: trackingNumber,
            sender_name,
            sender_phone,
            sender_address,
            receiver_name,
            receiver_phone,
            receiver_address,
            from_branch,
            to_branch,
            weight,
            dimensions,
            package_type,
            delivery_notes,
            payment_method,
            created_by: req.user.id
        });

        res.status(201).json(parcel);

    } catch (error) {
        console.error("Create Parcel Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= GET ALL PARCELS ================= */
const getAllParcels = async (req, res) => {
    try {
        const { status, from_branch, to_branch } = req.query;

        const filter = {};
        if (status) filter.current_status = status;
        if (from_branch) filter.from_branch = from_branch;
        if (to_branch) filter.to_branch = to_branch;

        const parcels = await Parcel.find(filter)
            .populate("from_branch", "branch_name")
            .populate("to_branch", "branch_name")
            .populate("created_by", "name")
            .sort({ createdAt: -1 });

        if (!parcels) {
            return res.status(404).json({ error: "Parcel not found" });
        }

        res.json(parcels);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= TRACK PARCEL ================= */
const getParcelByTrackingNumber = async (req, res) => {
    try {
        const { trackingNumber } = req.params;

        const parcel = await Parcel.findOne({ tracking_number: trackingNumber })
            .populate("from_branch", "branch_name")
            .populate("to_branch", "branch_name")
            .populate("created_by", "name");

        if (!parcel) {
            return res.status(404).json({ error: "Parcel not found" });
        }

        const history = await ParcelHistory.find({ parcel_id: parcel._id })
            .populate("updated_by", "name")
            .sort({ createdAt: -1 });

        res.json({
            trackingId: parcel.tracking_number,
            status: parcel.current_status,
            expectedDelivery: parcel.estimated_delivery,
            history,
            parcel
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= UPDATE PARCEL STATUS ================= */
const updateParcelStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["created", "in-transit", "delivered", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const parcel = await Parcel.findByIdAndUpdate(
            id,
            { current_status: status },
            { new: true }
        );

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        await ParcelHistory.create({
            parcel_id: parcel.id,
            status,
            updated_by: req.user.id
        });

        res.json({ success: true, parcel });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ================= MY COURIERS ================= */
const MyCourierController = async (req, res) => {
    try {
        const parcels = await Parcel.find({ created_by: req.user.id })
            .populate("from_branch", "branch_name")
            .populate("to_branch", "branch_name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: parcels.length,
            parcels
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= PAYMENT STATUS ================= */
const PaymentStatusChangeController = async (req, res) => {
    try {
        const { id, payment_status, payment_method } = req.body;

        const parcel = await Parcel.findByIdAndUpdate(
            id,
            { payment_status, payment_method },
            { new: true }
        );

        res.json({
            message: "Payment updated successfully",
            updatedParcel: parcel
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createParcel,
    getAllParcels,
    getParcelByTrackingNumber,
    updateParcelStatus,
    MyCourierController,
    PaymentStatusChangeController
};