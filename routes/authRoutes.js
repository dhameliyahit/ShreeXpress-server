const express = require('express');
const router = express.Router();
const { login, newAdminController, newClientController, getAllAdminController, getAllClientController, getNewSuperAdminController, getAllUsersController, forgotPassword, verifyOtp, resetPassword } = require('../controllers/authController');
const { protect, superadmin, admin } = require('../middleware/authMiddleware');
const { body, validationResult } = require("express-validator");


router.post('/login', login);

router.post("/new/admin", protect, superadmin, [
    body("name").notEmpty().withMessage('name is required'),
    body("email").isEmail().withMessage("Email is Required"),
    body("password").notEmpty().withMessage("Password is requireed"),
    body("role").notEmpty().withMessage("Role must be define")
], newAdminController);

router.post("/new/client", protect)

router.get('/role-info', protect, (req, res) => {
    res.json({
        message: 'Role info fetched successfully',
        user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
        }
    });
});


router.post("/new/client", protect, admin, newClientController);

//super admin get all admin
router.get("/all/admin", protect, superadmin, getAllAdminController)

//admin got all client what creby him
router.get("/all/client", protect, admin, getAllClientController)



router.get("/all/users",protect, superadmin, getAllUsersController);
//update-delete pachhi

router.post("/new/superadmin", getNewSuperAdminController);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);


module.exports = router;