const express = require('express');
const Schoolrouter = express.Router();
const {registerSchool, verifyEmail,Login,resetPassword,forgotPassword } = require('../controllers/SchoolController'); 


// Define routes for registering a school and verifying email
Schoolrouter.post('/register-school', registerSchool);
Schoolrouter.post('/verify-email/:schoolId', verifyEmail);
Schoolrouter.post('/Login',Login);
Schoolrouter.post('/forget-pw',forgotPassword);
Schoolrouter.post('/resetPassword',resetPassword);



module.exports = Schoolrouter;
