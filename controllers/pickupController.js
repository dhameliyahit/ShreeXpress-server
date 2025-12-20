const PickupRequest = require("../models/PickupRequest");

// Create pickup request
const createPickupRequest = async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      pincode,
      goods_type,
      approx_weight,
      address,
      nearest_branch
    } = req.body;

    // Basic validation
    if (!full_name || !phone_number || !pincode || !goods_type || !address || !nearest_branch) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRequest = await PickupRequest.create({
      full_name,
      phone_number,
      pincode,
      goods_type,
      approx_weight,
      address,
      nearest_branch
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Create Pickup Request Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all pickup requests (admin)
const getAllPickupRequests = async (req, res) => {
  try {
    const requests = await PickupRequest.find()
      .sort({ createdAt: -1 })
      .populate("nearest_branch", "branch_name"); // optional

    res.json(requests);
  } catch (err) {
    console.error("Get All Pickup Requests Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get pickup request by ID
const getPickupRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PickupRequest.findById(id)
      .populate("nearest_branch", "branch_name");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error("Get Pickup Request By ID Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createPickupRequest,
  getAllPickupRequests,
  getPickupRequestById
};