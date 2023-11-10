const express = require('express');
const Schoolrouter = express.Router();
const { registerSchool, verifyEmail,Login,resetPassword,forgotPassword,updateTiming,getAllSchools,getSchoolsByStatus,changeSchoolStatusById } = require('../controllers/SchoolController'); 
const {VerifyRegistrationToken,VerifySchool,VerifyAdmin} = require('../utils/Authenticate')

// Define routes for registering a school and verifying email
Schoolrouter.post('/register-school', registerSchool);
Schoolrouter.post('/verify-email/:schoolId', verifyEmail);
Schoolrouter.post('/Login',Login);
Schoolrouter.post('/forget-pw',forgotPassword);
Schoolrouter.post('/resetPassword',resetPassword);
Schoolrouter.post('/update-timing',VerifyRegistrationToken,VerifySchool,updateTiming);
Schoolrouter.post('/getallschools',VerifyRegistrationToken,VerifyAdmin,getAllSchools)
Schoolrouter.post('/getschoolsbystatus',VerifyRegistrationToken,VerifyAdmin,getSchoolsByStatus)
Schoolrouter.post('/changestatus',VerifyRegistrationToken,VerifyAdmin,changeSchoolStatusById)

module.exports = Schoolrouter;
