const express = require('express');
const router = express.Router();
const {
  createParcel,
  getAllParcels,
  getParcelByTrackingNumber,
  updateParcelStatus
} = require('../controllers/parcelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/new/courier', protect,admin, createParcel);
router.get('/all/courier', protect, getAllParcels);
router.get('/track/:trackingNumber', getParcelByTrackingNumber);
router.put('/:id/status', protect, updateParcelStatus);
// // what ever admin crete that only see thire.. allparcels
// router.get("/my/courier",protect,MyCourierController)

module.exports = router;