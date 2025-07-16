const express = require('express');
const router = express.Router();
const {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus
} = require('../controllers/parcelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createParcel);
router.get('/', protect, getAllParcels);
router.get('/track/:trackingNumber', getParcelByTrackingNumber);
router.put('/:id/status', protect, updateParcelStatus);

module.exports = router;