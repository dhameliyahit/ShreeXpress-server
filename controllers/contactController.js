const ContactRequest = require("../models/ContactRequest");

/* ================= CREATE CONTACT REQUEST ================= */
const createContactRequest = async (req, res) => {
    try {
        const { full_name, phone_number, email, subject, message } = req.body;

        if (
            !full_name ||
            !phone_number ||
            !email ||
            !subject ||
            !message
        ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const contact = await ContactRequest.create({
            full_name,
            phone_number,
            email,
            subject,
            message
        });

        res.status(201).json(contact);

    } catch (error) {
        console.error("Create Contact Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= GET ALL CONTACT REQUESTS ================= */
const getAllContactRequests = async (req, res) => {
    try {
        const requests = await ContactRequest
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        console.error("Get Contacts Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

/* ================= GET CONTACT REQUEST BY ID ================= */
const getContactRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ContactRequest.findById(id);

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        res.status(200).json(request);

    } catch (error) {
        console.error("Get Contact By ID Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createContactRequest,
    getAllContactRequests,
    getContactRequestById
};