const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');
const authMiddleware = require('../utils/Authenticate');

router.post('/create',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool, driverController.createDriverAccount);
router.post('/login', driverController.loginDriver);
router.post('/forgot-password', driverController.forgotPassword);
router.post('/reset-password', driverController.resetPassword);

module.exports = router;
