const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const env = require('./enviroment');

const crypto = require('crypto');
const User = require('../models/user');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET_KEY,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
    async function(accessToken, refreshToken, profile, callBack){ 
        try{
            let user = await User.findOne({githubId: profile.id});
            if(!user){
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(70).toString('hex')
                });
            }else{
                return callBack(null ,user);
            }
        }catch(err){
            return callBack(err);
        }
    }
));

// serializing
passport.serializeUser((user , callback) => {
    callback(null , user.id);
});

// deserializing
passport.deserializeUser(async(id , callBack) => {
    try{
        const user = await User.findById(id);
        callBack(null ,user);
    }catch(err){
        callBack(err);
    }
});



module.exports = passport;