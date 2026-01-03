const Franchise = require('../models/Franchise');

const createFranchiseRequest = async (req, res) => {
    try {
        const { experience_years, experience_months, ...rest } = req.body;

        const totalMonths = Number(experience_years) * 12 + Number(experience_months);

        const franchise = await Franchise.create({ ...rest, experience_years, experience_months, no_of_experience: totalMonths });

        res.status(201).json({
            message: "Franchise Request Submitted",
            data: franchise
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllFranchiseRequest = async (req, res) => {
    try {
        const franchises = await Franchise.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            total: franchises.length,
            data: franchises
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createFranchiseRequest, getAllFranchiseRequest };