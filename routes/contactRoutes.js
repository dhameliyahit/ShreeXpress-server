const express = require('express');
const router = express.Router();
const {
  createContactRequest,
  getAllContactRequests,
  getContactRequestById
} = require('../controllers/contactController');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');

router.post('/', createContactRequest);
router.get('/', protect, superadmin, getAllContactRequests);
router.get('/:id', protect, admin, getContactRequestById);

module.exports = router;