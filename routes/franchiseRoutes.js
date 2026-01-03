const express = require('express');
const router = express.Router();
const { getAllFranchiseRequest, createFranchiseRequest } = require('../controllers/franchiseController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.post('/new/request', createFranchiseRequest)
router.get('/', protect, superadmin, getAllFranchiseRequest)

module.exports = router;