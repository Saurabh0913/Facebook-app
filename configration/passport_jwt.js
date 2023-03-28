const passport = require('passport');
const JWTStretgy = require('passport-jwt').Strategy;
const JWTExtract = require('passport-jwt').ExtractJwt;
// const enviroment = require('./enviroment');

const User = require('../models/user');


let options = {
    jwtFromRequest: JWTExtract.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_PRIVATE_KEY
}

passport.use(new JWTStretgy(options , function(jwtPayload , done){

    User.findById(jwtPayload._id , function(error , user){
        if(error){console.log('Error When finding User' ,error);return;}

        if(user){
            return done(null ,user);
        }else{
            return done(null ,false);
        }

    });
}));


module.exports = passport;