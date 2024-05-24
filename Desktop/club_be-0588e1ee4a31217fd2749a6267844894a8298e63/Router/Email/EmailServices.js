const express = require('express');
 const appRoute = express.Router();
const {signup,getbill} = require('../controller/controller')
appRoute.post('/signup',signup);
appRoute.post('/gmail',getbill);

 module.exports = appRoute;