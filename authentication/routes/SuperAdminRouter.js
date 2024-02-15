const express = require('express')
const SuperAdminRouter = express.Router();
const {loginSuperAdmin,forgotPassword,resetPassword} = require('../controllers/SuperAdminController');


SuperAdminRouter.post('/login',loginSuperAdmin);
SuperAdminRouter.post('/forgot-password',forgotPassword)
SuperAdminRouter.post('/reset-password',resetPassword)


module.exports = SuperAdminRouter;
