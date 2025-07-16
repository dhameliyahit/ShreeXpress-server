const express = require('express');
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, createBranch);
router.get('/', getAllBranches);
router.get('/:id', getBranchById);
router.put('/:id', protect, admin, updateBranch);
router.delete('/:id', protect, admin, deleteBranch);

module.exports = router;