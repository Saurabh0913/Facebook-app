const express  = require('express');
const router = express.Router();
const passport =  require('passport');

const PasswordResetController =  require('../controller/authUsers');

router.get('/reset-password/:token',passport.checkAuthentication, PasswordResetController.sendPasswordResetEmail );