const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/GuardianController');
const {VerifyRegistrationToken,VerifyGuardian, VerifySchool} = require('../utils/Authenticate')

router.post('/create',VerifyRegistrationToken,VerifyGuardian,guardianController.createGuardianAccount);
router.post('/changepw',VerifyRegistrationToken,VerifyGuardian,guardianController.changePassword);
router.delete('/:guardianId',VerifyRegistrationToken,VerifyGuardian, guardianController.deleteGuardianById);
router.put('/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.updateGuardian);
router.post('/details/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.getGuardianDetails);
router.post('/remove-child',VerifyRegistrationToken,VerifyGuardian, guardianController.removeChildFromGuardian);
router.post('/login', guardianController.loginGuardian);
router.post('/forgot-password', guardianController.forgotPassword);
router.post('/reset-password', guardianController.resetPassword);
router.post('/getguardian/:studentId',VerifyRegistrationToken,VerifyGuardian,guardianController.getGuardians);

router.post('/getAllGuardians', VerifyRegistrationToken,VerifySchool, guardianController.getAllGuardians);

router.post('/assign-child', VerifyRegistrationToken, VerifyGuardian, guardianController.assignChildToGuardian);

module.exports = router;
