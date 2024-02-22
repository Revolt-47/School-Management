const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/Authenticate');
const attendanceController = require('../controllers/attendanceController')


router.post('/check-in',attendanceController.checkInStudent);
router.post('/getCheckinCheckout',attendanceController.getStudentCheckInCheckoutForDay);
router.post('/checkout',attendanceController.checkoutStudent);
router.post('/mark-attendance',attendanceController.updateOrCreateAttendance);
router.post('/call-student',attendanceController.addToQueue);
router.post('/section-attendance',attendanceController.getAttendanceofaClass);
router.post('/getAttendance',attendanceController.getStudentAttendance);
router.post('/getcalls',attendanceController.getQueueBySchoolId);


module.exports = router