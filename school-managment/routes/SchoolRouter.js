const express = require('express');
const Schoolrouter = express.Router();
const { getTotalSchoolCount,getSchoolById,updateTiming,getAllSchools,getSchoolsByStatus,changeSchoolStatusById,changePassword } = require('../controllers/SchoolController'); 
const {VerifyRegistrationToken,VerifySchool,VerifyAdmin} = require('../utils/Authenticate');



Schoolrouter.post('/update-timing',VerifyRegistrationToken,VerifySchool,updateTiming);
Schoolrouter.post('/getallschools',VerifyRegistrationToken,VerifyAdmin,getAllSchools)
Schoolrouter.post('/getschool/:id',VerifyRegistrationToken,VerifySchool || VerifyAdmin,getSchoolById)
Schoolrouter.post('/changestatus',VerifyRegistrationToken,VerifyAdmin,changeSchoolStatusById)
Schoolrouter.get('/totalschools',VerifyRegistrationToken,VerifyAdmin,getTotalSchoolCount);
Schoolrouter.post('/changepw',VerifyRegistrationToken,VerifySchool,changePassword)



module.exports = Schoolrouter;
