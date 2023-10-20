const express = require('express');
const Schoolrouter = express.Router();
const { registerSchool, verifyEmail } = require('../controllers/SchoolController'); 

// Define routes for registering a school and verifying email
Schoolrouter.post('/register-school', registerSchool);
Schoolrouter.post('/verify-email', verifyEmail);

module.exports = Schoolrouter;
