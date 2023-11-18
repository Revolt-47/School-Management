const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/GuardianController');
const {VerifyRegistrationToken,VerifyGuardian} = require('../utils/Authenticate')

router.post('/create',VerifyRegistrationToken,VerifyGuardian,guardianController.createGuardianAccount);
router.delete('/:guardianId', guardianController.deleteGuardianById);
router.put('/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.updateGuardian);
router.get('/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.getGuardianDetails);
router.delete('/:guardianId/remove-child/:childId',VerifyRegistrationToken,VerifyGuardian, guardianController.removeChildFromGuardian);
router.post('/login', guardianController.loginGuardian);
router.post('/forgot-password', guardianController.forgotPassword);
router.post('/reset-password', guardianController.resetPassword);

module.exports = router;
