const Branch = require("../models/Branch");
const Parcel = require("../models/Parcel");

/* ================= CREATE BRANCH ================= */
const createBranch = async (req, res) => {
    try {
        const { branch_name, address, pincode, phone } = req.body;

        if (
            !branch_name ||
            !address ||
            !pincode ||
            !phone ||
            branch_name.trim() === "" ||
            address.trim() === "" ||
            pincode.length !== 6 ||
            phone.length !== 10
        ) {
            return res.status(400).json({
                error: "Invalid input. Please check all fields."
            });
        }

        const userId = req.user.id;

        // Only one branch per admin
        const existing = await Branch.findOne({ created_by: userId });
        if (existing) {
            return res.status(409).json({
                error: "You have already created a branch. Only one branch per admin is allowed."
            });
        }

        const branch = await Branch.create({
            branch_name,
            address,
            pincode,
            phone,
            created_by: userId
        });

        res.status(201).json(branch);

    } catch (error) {
        console.error("Create Branch Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= GET ALL BRANCHES ================= */
const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find()
            .populate("created_by", "name email role phone")
            .sort({ createdAt: -1 });

        res.status(200).json(branches);
    } catch (error) {
        console.error("Get All Branches Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= SEARCH BRANCH ================= */
const getBranch = async (req, res) => {
    try {
        const { searchTerm } = req.params;

        const branches = await Branch.find({
            $or: [
                { branch_name: { $regex: searchTerm, $options: "i" } },
                { pincode: searchTerm }
            ]
        });

        if (branches.length === 0) {
            return res.status(404).json({ error: "Branch not found" });
        }

        res.status(200).json(branches);
    } catch (error) {
        console.error("Get Branch Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= GET BRANCH NAME SUGGESTION ================= */
const getAllBranchName = async (req, res) => {
    try {
        const { branchName } = req.params;

        const branches = await Branch.find(
            { branch_name: { $regex: branchName, $options: "i" } },
            { branch_name: 1, _id: 0 }
        ).distinct("branch_name");

        if (branches.length === 0) {
            return res.status(404).json({
                message: "No branches match the given name",
                suggestions: []
            });
        }

        res.status(200).json({
            message: `Branches matching "${branchName}"`,
            branches
        });

    } catch (error) {
        console.error("Branch Name Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================= BRANCH INFO (ID + NAME) ================= */
const BranchInfoController = async (req, res) => {
    try {
        const branches = await Branch.find({}, { branch_name: 1 });

        res.status(200).json({
            message: "All branches info fetched successfully.",
            branches
        });

    } catch (error) {
        console.error("Branch Info Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= UPDATE BRANCH ================= */
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, address, phone, pincode } = req.body;

        const branch = await Branch.findByIdAndUpdate(
            id,
            { branch_name, address, phone, pincode },
            { new: true }
        );

        if (!branch) {
            return res.status(404).json({ error: "Branch not found" });
        }

        res.status(200).json(branch);

    } catch (error) {
        console.error("Update Branch Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= DELETE BRANCH ================= */
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await Branch.findById(id);
        if (!branch) {
            return res.status(404).json({ error: "Branch not found" });
        }

        const hasParcel = await Parcel.findOne({ branch: id });
        if (hasParcel) {
            return res.status(400).json({
                error: "Branch has active parcels. Cannot delete."
            });
        }

        await branch.deleteOne();

        res.status(200).json({ message: "Branch deleted successfully" });

    } catch (error) {
        console.error("Delete Branch Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranch,
    updateBranch,
    deleteBranch,
    getAllBranchName,
    BranchInfoController
};