const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/user');
const PasswordReset = require('../models/PasswordReset');


//form render
module.exports.showForgotPassword = async (req, res) => {
    return res.render('forgotPassword',{
      title: 'Forgot Password Page | My Book',
      message: {typs:null ,text:null}
    });
  };

// Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465, 
  auth: {
    user: 'smartds2550@yahoo.com',
    pass: 'Prarabh@000'
  },
  secure: true,
});


// forgot password controller
exports.forgotPassword = async (req, res) => {
  try{
    const { email } = req.body;

    // Find the user associated with the email
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.render('forgotPassword', { 
        title:'Forgot Passwor Page | My Book',
        message: { type: 'danger', text: 'No user found with that email address.' }
      });
    }
  
    // Generate a password reset token
    const token = crypto.randomBytes(20).toString('hex');
    const passwordReset = new PasswordReset({
      userId: user,
      token: token,
      isValid: true,
    });
    await passwordReset.save();
  
    // Construct the password reset email
    const mailOptions = {
      from: 'smartds2550@yahoo.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `Click the link below to reset your password:<br><br><a href="${req.protocol}://${req.get('host')}/auth/reset-password/${token}">${req.protocol}://${req.get('host')}/auth/reset-password/${token}</a>`,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log('errror mail send' , err);
        res.render('forgotPassword', {
          title:'Forgot Password Page | My Book',
          message: { type: 'danger', text: 'There was an error sending the password reset email. Please try again later.' }
        });
      } else {
        res.render('forgotPassword', {
          title:'Forgot Password Page | My Book',
          message: { type: 'success', text: 'A password reset link has been sent to your email address.' }
        });
      }
    });
  }catch(err){
    return res.render('forgotPassword', { 
      title:'Forgot Password Page | My Book',
      message: { type: 'danger', text: 'Inernal Server Error !!..' }
    });
  }
};

//password link handelor
exports.handleResetPasswordLink = async (req, res) => {
  try{
    const { token } = req.params;

  // Look up the password reset token in the database
  const passwordReset = await PasswordReset.findOne({token});

  // If the token doesn't exist, display an error message
  if (!passwordReset) {
    return res.render('forgotPassword', { 
      title:'Forgot Password Page | My Book',
      message: { type: 'danger', text: 'Invalid password reset link. Please request a new link.' }
    });
  }
  // Render the password reset form
  return res.render('resetPassword', {
    title:'Forgot Password Final Page | My Book',
    token:passwordReset.token,
    message: { type: 'success', text: 'Update Your Password Now' }
  });
  }catch(err){
    return res.render('forgotPassword', { 
      title:'Forgot Password Page | My Book',
      message: { type: 'danger', text: 'Internal Server Error !.' }
    });
  }
};

// reset password updates
exports.resetPassword = async (req, res) => {
  try{
    // console.log(req.query);
    const passwordReset = await PasswordReset.findOne({token : req.query.youruniqtoken});
    
   
    // If the token doesn't exist, display an error message
    if (!passwordReset) {
        return res.render('resetPassword', {
          title:'Forgot Password Final Page | My Book', 
          token: passwordReset.youruniqtoken,
          message: { type: 'danger', text: 'Password reset Link Expired. Please request a new link.' }
        });
    }
    // If the token has expired, display an error message
    if(passwordReset.isValid){
  
      passwordReset.isValid = false; 
  
      if(req.body.password == req.body.confirm_password){
        const user = await User.findById(passwordReset.userId);
        if(user){
          user.password = req.body.password;
          user.confirm_password = req.body.confirm_password;
          passwordReset.save();
          user.save();
          // Redirect the user to the login page with a success message
          return res.render('user_signin', {
            title:'Sign-in Page | My Book',
            message: { type: 'success', text: 'Your password has been reset. Please log in with your new password.' }
          });
        }else{
          request.flash('error' , 'Password did not matched');
          return response.redirect('back');
        }
      }else{
        return res.render('resetPassword', {
          title:'Forgot Password Final Page | My Book', 
          token: passwordReset.token,
          message: { type: 'danger', text: 'Password and Confirm Passwrod Not Matched.' }
        });
      }
    }else{
      return res.render('forgotPassword', { 
        title:'Forgot Password Page | My Book',
        message: { type: 'danger', text: 'Invalid password reset Token. Please request a new Token.' }
      });
    }
  }catch(err){
    return res.render('forgotPassword', { 
      title:'Forgot Password Page | My Book',
      message: { type: 'danger', text: 'Internal Server Error !!!! ..Please Try Again.' }
    });
  }
};