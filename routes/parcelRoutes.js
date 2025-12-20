const express = require('express');
const router = express.Router();
const {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus,
  MyCourierController,
  PaymentStatusChangeController
} = require('../controllers/parcelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/new/courier', protect, admin, createParcel);
router.get('/all/courier', protect, getAllParcels);
router.get('/track/:trackingNumber', getParcelByTrackingNumber);
router.put('/:id/status', protect, admin, updateParcelStatus);
// // what ever admin create that only see their.. allparcels
router.get("/my/courier", protect, admin, MyCourierController)

//payment statues change
router.patch("/payment/status", protect, admin, PaymentStatusChangeController)

module.exports = router;