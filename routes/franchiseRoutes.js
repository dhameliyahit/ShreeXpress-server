const express = require('express');
const router = express.Router();
const { getAllFranchiseRequest, createFranchiseRequest, deleteFranchiseRequestById } = require('../controllers/franchiseController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.post('/new/request', createFranchiseRequest)
router.get('/', protect, superadmin, getAllFranchiseRequest)
router.delete('/:id', protect, superadmin, deleteFranchiseRequestById)

module.exports = router;