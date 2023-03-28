const nodemailer = require('nodemailer');
const enviroment = require('./enviroment');


let transporter = nodemailer.createTransport(enviroment.smtp);

module.exports = transporter;