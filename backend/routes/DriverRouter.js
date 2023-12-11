const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');
const authMiddleware = require('../utils/Authenticate');

router.post('/create',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool, driverController.createDriverAccount);
router.post('/changepw',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.changePassword);
router.delete('/:driverId', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool,driverController.deleteDriverById);
router.put('/:driverId',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver, driverController.updateDriver);
router.post('/:driverId/vehicles', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver, driverController.addVehicleToDriver);
router.delete('/:driverId/vehicles/:regNumber', authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver, driverController.removeVehicleFromDriver);
router.post('/login', driverController.loginDriver);
router.post('/forgot-password', driverController.forgotPassword);
router.post('/reset-password', driverController.resetPassword);
router.post('/addStudent',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifySchool,driverController.addStudentToDriver);
router.post('/removeStudent',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.removeStudentFromDriver);
router.post('/getStudents',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.getDriverStudentsBySchool);
router.post('/getSchools',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.getDriverSchools);
router.post('/getDetails',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.getDriverDetails);
router.post('/getVehicles',authMiddleware.VerifyRegistrationToken,authMiddleware.VerifyDriver,driverController.getDriverVehicles);

module.exports = router;
