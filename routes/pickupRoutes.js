const express = require('express');
const router = express.Router();
const {
    createPickupRequest,
    getAllPickupRequests,
    getPickupRequestById
} = require('../controllers/pickupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', createPickupRequest);
router.get('/', protect, admin, getAllPickupRequests);
router.get('/:id', protect, admin, getPickupRequestById);

module.exports = router;