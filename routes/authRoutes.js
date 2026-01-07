const express = require('express');
const router = express.Router();
const { login, newAdminController, newClientController, getAllAdminController, deleteUserBySuperadmin, getAllClientController, deleteClientController, getNewSuperAdminController, getAllUsersController, forgotPassword, verifyOtp, resetPassword, updateUserRoleController } = require('../controllers/authController');
const { protect, superadmin, admin } = require('../middleware/authMiddleware');
const { body } = require("express-validator");


router.post('/login', login);

router.post("/new/admin", protect, superadmin, [
    body("name").notEmpty().withMessage('name is required'),
    body("email").isEmail().withMessage("Email is Required"),
    body("password").notEmpty().withMessage("Password is requireed"),
    body("role").notEmpty().withMessage("Role must be define")
], newAdminController);

// router.post("/new/client", protect)

router.post("/new/client", protect, admin, newClientController);

//super admin get all admin
router.get("/all/admin", protect, superadmin, getAllAdminController)

router.delete("/users/:id", protect, superadmin, deleteUserBySuperadmin);

//admin got all client what creby him
router.get("/all/client", protect, admin, getAllClientController)

router.delete("/delete/client/:clientId", protect, admin, deleteClientController);

router.get("/all/users", protect, superadmin, getAllUsersController);

router.post("/new/superadmin", getNewSuperAdminController);

router.put("/user/:id/role", protect, superadmin, updateUserRoleController);

router.post('/forgot-password', forgotPassword);

router.post('/verify-otp', verifyOtp);

router.post('/reset-password', resetPassword);


module.exports = router;