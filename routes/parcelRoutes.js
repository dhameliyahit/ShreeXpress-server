const express = require('express');
const router = express.Router();
const {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus
} = require('../controllers/parcelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/new/courier', protect, createParcel);
router.get('/all/courier', protect, getAllParcels);
router.get('/track/:trackingNumber', getParcelByTrackingNumber);
router.put('/:id/status', protect, updateParcelStatus);

module.exports = router;