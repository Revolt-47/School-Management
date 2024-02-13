const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/GuardianController');
const {VerifyRegistrationToken,VerifyGuardian, VerifySchool} = require('../utils/Authenticate')

router.post('/create',VerifyRegistrationToken,VerifyGuardian,guardianController.createGuardianAccount);
router.post('/login', guardianController.loginGuardian);
router.post('/forgot-password', guardianController.forgotPassword);
router.post('/reset-password', guardianController.resetPassword);


module.exports = router;
