const express = require('express');
const router = express.Router();
const {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus,
  MyCourierController,
  PaymentStatusChangeController,
  AnalyticsParcel
} = require('../controllers/parcelController');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');

router.post('/new/courier', protect, createParcel);
router.get('/all/courier', protect, getAllParcels);
router.get('/track/:trackingNumber', getParcelByTrackingNumber);
router.put('/:id/status', protect, admin, updateParcelStatus);
// // what ever admin create that only see their.. allparcels
router.get("/my/courier", protect, MyCourierController)
//payment statues change
router.patch("/payment/status", protect, admin, PaymentStatusChangeController)
router.get("/analytics", protect, superadmin, AnalyticsParcel)

module.exports = router;