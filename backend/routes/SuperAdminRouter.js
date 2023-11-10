const express = require('express')
const SuperAdminRouter = express.Router();
const {loginSuperAdmin} = require('../controllers/SuperAdminController')

SuperAdminRouter.post('/login',loginSuperAdmin);


module.exports = SuperAdminRouter;
