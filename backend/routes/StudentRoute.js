const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/StudentController');
const { VerifyRegistrationToken, VerifySchool } = require('../utils/Authenticate');

// POST request to add a new student
studentRouter.post('/add',VerifyRegistrationToken,VerifySchool,studentController.addStudent);
studentRouter.delete('/delete/:id',VerifyRegistrationToken,VerifySchool,studentController.deleteStudent);
studentRouter.post('/edit/:studentId',VerifyRegistrationToken,VerifySchool,studentController.updateStudent);

module.exports = studentRouter;
