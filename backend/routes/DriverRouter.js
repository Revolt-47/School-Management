const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');
const authMiddleware = require('../utils/Authenticate');

router.post('/create',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool, driverController.createDriverAccount);
router.post('/changepw',VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.changePassword);
router.delete('/:driverId', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool,driverController.deleteDriverById);
router.put('/:driverId',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool, driverController.updateDriver);
router.post('/:driverId/vehicles', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver, driverController.addVehicleToDriver);
router.delete('/:driverId/vehicles/:regNumber', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver, driverController.removeVehicleFromDriver);
router.post('/login', driverController.loginDriver);
router.post('/forgot-password', driverController.forgotPassword);
router.post('/reset-password', driverController.resetPassword);

module.exports = router;
