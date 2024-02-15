const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/GuardianController');
const {VerifyRegistrationToken,VerifyGuardian, VerifySchool} = require('../utils/Authenticate')


router.post('/changepw',VerifyRegistrationToken,VerifyGuardian,guardianController.changePassword);
router.delete('/:guardianId',VerifyRegistrationToken,VerifyGuardian, guardianController.deleteGuardianById);
router.put('/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.updateGuardian);
router.post('/details/:guardianId',VerifyRegistrationToken,VerifyGuardian,guardianController.getGuardianDetails);
router.post('/remove-child',VerifyRegistrationToken,VerifyGuardian, guardianController.removeChildFromGuardian);
router.post('/getguardian/:studentId',VerifyRegistrationToken,VerifyGuardian,guardianController.getGuardians);
router.get('/getAllGuardians', VerifyRegistrationToken,VerifySchool, guardianController.getAllGuardians);
router.post('/assign-child', VerifyRegistrationToken, VerifyGuardian, guardianController.assignChildToGuardian);

module.exports = router;
