const express = require('express');// importing express 
const mongoose = require('mongoose');
const enviroment = require('./configration/enviroment');//environment
const cookieParser = require('cookie-parser'); // importing cookie-parser
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.SERVER_PORT || 3000 ;

//DATABSE THINGS
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB is Connected Successfully:${conn.connection.host}`);
     }catch(err){
        console.log(`Error in connecting with MongoDB:${err}`);
        process.exit(1);
     }
};
     

app.use(express.urlencoded({ extended: true }));// url endcoding
app.use(cookieParser());// using cookie
const expresslayouts = require('express-ejs-layouts');// Layouts setups
// const dataBase = require('./configration/mongoose');// DataBase Connection
const session = require('express-session');// express-session
const flash = require('connect-flash');// for flash message require
const customFlashMiddleWare = require('./configration/flash-middleware');// custom middleware for flash
const passport = require('passport');// Passport 
const passportLocal = require('./configration/passport_local');// local passport from configration
const passportGithub = require('./configration/passport_github');// github auth configration
const passport_JWT = require('passport-jwt');// Requiring passport-jwt
const passport_JWT_Stretgy = require('./configration/passport_jwt');
const MongoStore = require('connect-mongo');// permanent store cookie in storemongo using connect-mongo
// chat server to be use with socket.io
// const http = require('http').Server(app);
// const socketIo  = require('socket.io')(http);

// const chatPort = 5000;
// http.listen( chatPort, function(err){
//     if(err){console.log('Error to Connecting the socket server' ,err);return;}
//     console.log('Successfully connected to the socket server' ,chatPort);return;
// });


app.use(express.static(process.env.ASSETS_PATH)); //static files uses
app.use('/uploads',express.static(__dirname + '/uploads')); // uploding img files
app.use(expresslayouts);//layouts change
app.set('layout extractStyles' , true);//extract styles from sub pages
app.set('layout extractScripts' , true);//extract scripts from sub pages

//set view engine
app.set('view engine','ejs');
app.set('views','./views');

app.use(session({ // session use and make like middlevare for passport authentication
    name:'My-book_Social-meadia',
    secret:process.env.JWT_PRIVATE_KEY,
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge:(1000 * 60 * 100)
    },
    // mongostore connection where to store the session cookies
    store: MongoStore.create(  // Mongo store is used to store session cookie in the DATABASE
        { 
            mongoUrl : process.env.MONGO_URL,
            autoRemove: 'disabled'//I dont want to remove session cookies automatically
        }, function(err){
        if(err){console.log('Error while trying to establish the connection and store session cookie:', err); return;}
        console.log('connect-mongo setup okay'); return;
    })
}));
// use passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

const nodemailer = require('nodemailer');



app.use(flash()); // Using Flash 
app.use(customFlashMiddleWare.setFlash); // using custum flash 
app.use('/',require('./routers')); //Using Express Router For routing all access

// app.listen(port,function(err){  //server Check
//    if(err){
//        console.log('Error to Connecting the server');
//        return
//  }
//    console.log('Successfull Connected With the Port:',port);
//});

connectDB(). then(() => {
    app.listen(PORT,() => {
        console.log(`Server Listening Successfully with the port:${PORT}`); 
    });
});
