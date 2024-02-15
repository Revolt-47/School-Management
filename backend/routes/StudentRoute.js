const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/StudentController');
const { VerifyRegistrationToken, VerifySchool, VerifyAdmin } = require('../utils/Authenticate');


studentRouter.post('/add',VerifyRegistrationToken,VerifySchool,studentController.addStudent);
studentRouter.delete('/delete/:id',VerifyRegistrationToken,VerifySchool,studentController.deleteStudent);
studentRouter.put('/edit/:studentId',VerifyRegistrationToken,VerifySchool,studentController.updateStudent);
studentRouter.post('/students/:schoolId',VerifyRegistrationToken,VerifySchool,studentController.getStudentsBySchool);
studentRouter.get('/totalcount',VerifyRegistrationToken,VerifyAdmin,studentController.getTotalStudentsCount);
studentRouter.get('/getdetails',VerifyRegistrationToken,VerifySchool,studentController.getStudentbyID)

module.exports = studentRouter;
