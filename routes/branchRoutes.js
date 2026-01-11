const express = require('express');
const router = express.Router();
const {
  createBranch,
  getAllBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  getAllBranchName,
  BranchInfoController
} = require('../controllers/branchController');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');

router.post('/new/branch', protect, admin, createBranch);
router.get('/all/branch', protect, superadmin, getAllBranches);
router.get('/all/:searchTerm', getBranch);
router.get("/names/:branchName",getAllBranchName);
router.put('/:id', protect, admin, updateBranch);
router.delete('/:id',protect,superadmin, deleteBranch);
router.get("/info/branch",protect, BranchInfoController)
module.exports = router;