const Parcel = require("../models/Parcel");
const Branch = require("../models/Branch");
const User = require("../models/User");
const ParcelHistory = require("../models/ParcelStatusHistory");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS
    }
});

/* ================= CREATE PARCEL ================= */
const createParcel = async (req, res) => {
    try {
        const {
            sender_name,
            sender_phone,
            sender_address,
            email,
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
            client_id
        } = req.body;

        if (!sender_name || !sender_phone || !sender_address || !receiver_name || !receiver_phone || !receiver_address || !from_branch || !to_branch || !weight || !package_type || !payment_method) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const fromBranchExists = await Branch.findById(from_branch);
        const toBranchExists = await Branch.findById(to_branch);

        if (!fromBranchExists || !toBranchExists) {
            return res.status(400).json({ error: "Branch not found" });
        }

        let parcelOwnerId = req.user.id;

        if (client_id) {
            const client = await User.findOne({
                _id: client_id,
                created_by: req.user.id
            });

            if (!client) {
                return res.status(403).json({ error: "Client not under your account" });
            }

            parcelOwnerId = client._id;
        }

        const trackingNumber =
            "SX" +
            Math.random().toString(36).substring(2, 6).toUpperCase() +
            Date.now().toString().slice(-6);

        const parcel = await Parcel.create({
            tracking_number: trackingNumber,
            sender_name,
            sender_phone,
            sender_address,
            email,
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
            created_by: parcelOwnerId
        });

        if (email) {
            try {
                await transporter.sendMail({
                    from: `"ShreeXpress Courier Service" <${process.env.SMTP_EMAIL}>`,
                    to: email,
                    subject: "Your Parcel Has Been Created – Tracking Details",
                    html: `
                    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6fb; padding:30px 0;">
                        <div style="max-width:620px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <div style="background:#383185; padding:24px; text-align:center;">
                          <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:0.5px;">
                            ShreeXpress Courier Service
                          </h1>
                          <p style="color:#d9dcff; margin:6px 0 0; font-size:13px;">
                            Fast • Reliable • Secure Delivery
                          </p>
                        </div>

                        <div style="padding:32px; color:#2d2d2d;">
                          <h2 style="margin-top:0; font-size:20px; color:#383185;">
                            Parcel Created Successfully
                          </h2>

                          <p style="font-size:15px; line-height:1.6;">
                            Thank you for using <strong>ShreeXpress</strong>. Your parcel has been successfully registered in our system.
                            Please find the tracking details below.
                          </p>

                          <!-- Tracking Box -->
                          <div style="margin:28px 0; padding:22px; background:#f1f3ff; border-radius:10px; text-align:center;">
                            <p style="margin:0; font-size:13px; color:#555;">
                              Tracking Number
                            </p>
                            <div style="margin-top:8px; font-size:26px; font-weight:bold; letter-spacing:2px; color:#383185;">
                              ${trackingNumber}
                            </div>
                          </div>

                          <!-- Parcel Details -->
                          <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555; width:40%;">
                                From Branch
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${fromBranchExists.branch_name}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555;">
                                To Branch
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${toBranchExists.branch_name}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555;">
                                Receiver Name
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${receiver_name}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555;">
                                Package Type
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${package_type}
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555;">
                                Weight
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${weight} kg
                              </td>
                            </tr>

                            ${dimensions ? `
                            <tr>
                              <td style="padding:10px 0; font-weight:600; color:#555;">
                                Dimensions
                              </td>
                              <td style="padding:10px 0; color:#333;">
                                ${dimensions}
                              </td>
                            </tr>` : ""}
                          </table>
                            
                          <!-- Info Note -->
                          <div style="margin-top:28px; padding:16px; background:#f9fafb; border-left:4px solid #383185; border-radius:6px;">
                            <p style="margin:0; font-size:14px; color:#444; line-height:1.6;">
                              Please keep this tracking number safe. You can use it anytime to track your parcel status through our system.
                            </p>
                          </div>
                            
                        </div>
                            
                        <!-- Footer -->
                        <div style="background:#f4f5fb; padding:16px; text-align:center; font-size:12px; color:#777;">
                          © ${new Date().getFullYear()} ShreeXpress Courier Service. All rights reserved.
                        </div>
                      </div>
                    </div>
                ` });
            } catch (mailError) {
                console.error("Email sending failed:", mailError.message);
            }
        }
        res.status(201).json({ success: true, parcel });

    } catch (error) {
        console.error("Create Parcel Error:", error.message);
        res.status(500).json({ error: "Server error", message: error.message });
    }
};

/* ================= GET ALL PARCELS ================= */
const getAllParcels = async (req, res) => {
    try {
        const { status, from_branch, to_branch } = req.query;

        if (!["admin", "superadmin"].includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }

        let filter = {};

        if (req.user.role === "admin") {
            const clients = await User.find({
                created_by: req.user.id,
                role: "client"
            }).select("_id");

            const clientIds = clients.map(c => c._id);

            filter.created_by = { $in: clientIds };
        }

        if (status) filter.current_status = status;
        if (from_branch) filter.from_branch = from_branch;
        if (to_branch) filter.to_branch = to_branch;

        const parcels = await Parcel.find(filter)
            .populate("from_branch", "branch_name")
            .populate("to_branch", "branch_name")
            .populate("created_by", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: parcels.length, parcels });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Server error",
            message: error.message
        });
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
const getStatusUpdateEmail = (parcel) => {
    const statusConfig = {
        created: { color: "#2563eb", label: "Parcel Created" },
        "in-transit": { color: "#d97706", label: "In Transit" },
        delivered: { color: "#16a34a", label: "Delivered Successfully" },
        cancelled: { color: "#dc2626", label: "Shipment Cancelled" },
    };

    const config = statusConfig[parcel.current_status];

    return `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f8; padding:30px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background:#1e293b; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0;">ShreeXpress Courier Service</h1>
                <p style="color:#cbd5e1; margin-top:5px;">Reliable • Secure • Fast Delivery</p>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333;">
                <h2 style="color:${config.color}; margin-bottom:10px;">
                    Parcel Status Updated
                </h2>

                <p>
                    Dear Customer,<br/><br/>
                    The status of your parcel has been updated. Please find the latest details below:
                </p>

                <!-- Status Box -->
                <div style="border:1px solid ${config.color}; background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0;">
                    <table style="width:100%;">
                        <tr>
                            <td style="font-weight:bold;">Tracking Number:</td>
                            <td style="text-align:right;">${parcel.tracking_number}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;">Current Status:</td>
                            <td style="text-align:right; color:${config.color}; font-weight:bold;">
                                ${config.label}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Info Table -->
                <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                    <tr>
                        <td style="padding:6px 0;"><strong>From Branch:</strong></td>
                        <td style="padding:6px 0;">${parcel.from_branch || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;"><strong>To Branch:</strong></td>
                        <td style="padding:6px 0;">${parcel.to_branch || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0;"><strong>Receiver:</strong></td>
                        <td style="padding:6px 0;">${parcel.receiver_name}</td>
                    </tr>
                </table>

                <p style="margin-top:20px; font-size:14px; color:#555;">
                    You can use your tracking number anytime to check the latest parcel updates.
                </p>

                <p style="margin-top:30px;">
                    Thank you for choosing <strong>ShreeXpress Courier Service</strong>.
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#64748b;">
                © ${new Date().getFullYear()} ShreeXpress Courier Service. All rights reserved.
            </div>
        </div>
    </div>
    `;
};
const updateParcelStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ["created", "in-transit", "delivered", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const parcel = await Parcel.findById(id);
        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (parcel.current_status === status) {
            return res.status(400).json({ message: "Status already unchanged" });
        }

        parcel.current_status = status;
        await parcel.save();

        await ParcelHistory.create({
            parcel_id: parcel._id,
            status,
            updated_by: req.user.id,
        });

        if (parcel.email) {
            await transporter.sendMail({
                from: `"ShreeXpress Courier Service" <${process.env.SMTP_EMAIL}>`,
                to: parcel.email,
                subject: `Parcel Status Update – ${parcel.tracking_number}`,
                html: getStatusUpdateEmail(parcel),
            });
        }

        res.json({ success: true, parcel });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/* ================= MY COURIERS ================= */
const MyCourierController = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Admins cannot access this route" });
        }

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

/* ================ ANALYTICS PARCEL ================= */
const AnalyticsParcel = async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // last 30 days including today
        startDate.setHours(0, 0, 0, 0);

        const parcelsPerDay = await Parcel.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: today } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const data = [];

        for (let i = 1; i <= 30; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);

            const dayStr = day.toISOString().split("T")[0]; // YYYY-MM-DD

            const dayData = parcelsPerDay.find(p => p._id === dayStr);

            data.push({
                day: dayStr,
                count: dayData ? dayData.count : 0
            });
        }

        res.json({ success: true, parcelsPerDay: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createParcel,
    getAllParcels,
    getParcelByTrackingNumber,
    updateParcelStatus,
    MyCourierController,
    PaymentStatusChangeController,
    AnalyticsParcel
};