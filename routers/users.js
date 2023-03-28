const express = require('express');
const router = express.Router();

// import passport
const passport = require('passport');

const usersController = require('../controller/users_controller');


// for profile
router.get('/profile/:id', passport.checkAuthentication,usersController.profile);// add this passport.checkAuthentication,for when passport using
router.get('/profile-edit/:id', passport.checkAuthentication,usersController.profile_edit);// add this passport.checkAuthentication,for when passport using
// For Updating profile details
router.post('/update-user-profile/:id' ,passport.checkAuthentication ,usersController.profile_update);
// for signup route
router.get('/sign-up',usersController.sign_up);
// for signin route
router.get('/sign-in' ,usersController.sign_in);
// sign up crete route
router.post('/create-user', usersController.create);
// sigin session using middleware passport
router.post('/login-user-session',passport.authenticate('local',{
    failureRedirect:'/user/sign-in',
    successFlash: true
},
),usersController.create_session);
// signOut request
router.get('/sign-out',  usersController.destroySession);

// for google stretgy
router.get('/auth/google' , passport.authenticate('google' ,{scope: ['profile', 'email ']}));
router.get('/auth/google/callback' , passport.authenticate( 'google',{failureRedirect: '/user/sign-in'}), usersController.create_session);

// github login
router.get('/auth/github' , passport.authenticate('github' , {scope:['user:email' , 'user:name']}));
router.get('/auth/github/callback' , passport.authenticate( 'github',{failureRedirect: '/user/sign-in'}), usersController.create_session);

module.exports = router;