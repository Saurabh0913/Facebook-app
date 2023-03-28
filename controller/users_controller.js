// importing models
const User = require('../models/user');
const Post =  require('../models/posts');
const Friendship = require('../models/friendship');

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);


// Main Profile showing own post in profile
module.exports.profile = async function(request,response){
    try{
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            }
        }).populate({
            path: 'comments',
            populate: {
                path : 'likes'
            }
        }).populate('likes');

        //   finding the frinedships of logged user
        let users = await User.findById(request.params.id);

        // // friendship shown
        let is_friend = false;
        let friendship = await Friendship.findOne({
            $or: [{from_user: request.user._id , to_user: request.params.id},
            {from_user:request.params.id , to_user:request.user._id }]
        });

        if(friendship){
            is_friend = true;
        }
        return response.render('user_profile',{
            title : 'User Profile | My Book',
            profile_user : users,
            is_friends: is_friend,
            posts:posts,
            message:{type:null,text:null}
        });

    }catch(err){
        response.status(400).json({
            message:'Internall Server Error !!'
        })
        return;
    }
}
module.exports.profile_edit = async function(request,response){
    try{

        let user = await User.findById(request.params.id);

        // // friendship shown
        let is_friend = false;
        let friendship = await Friendship.findOne({
            $or: [{from_user: request.user._id , to_user: request.params.id},
            {from_user:request.params.id , to_user:request.user._id }]
        });

        if(friendship){
            is_friend = true;
        }
        return response.render('update_profile',{
            title : 'Update User Profile | My Book',
            profile_user : user,
            is_friends: is_friend
        });

    }catch(err){
        console.log('Error To Showing User Profile' , err);
        return;
    }
}
// For Updating User Details
module.exports.profile_update = async function(request , response){
    try {
        // Check if the current user is authorized to update the profile
        if (request.user.id !== request.params.id) {
          request.flash('error', 'Unauthorized User');
          return response.redirect('back');
        }
    
        // Update the user's details in the database
        const updatedUser = await User.findByIdAndUpdate(request.params.id, request.body);
    
        // Promisify the User.upload_Profile_Picture middleware function
        const uploadProfilePicture = promisify(User.upload_Profile_Picture);
    
        // Call the middleware function to upload the profile picture
        await uploadProfilePicture(request, response);
    
        // Get the uploaded profile picture file and user details from the request
        const profilePicture = request.file;
        const { name, email, password } = request.body;
    
        // If a profile picture was uploaded, process the file
        if (profilePicture) {
          // Get the file information from the uploaded file
          const { path: tmpFilePath, filename: tmpFileName, mimetype } = profilePicture;
    
          // If the file is not an image file, delete the temporary file and return an error message
          if (!mimetype.startsWith('image/')) {
            await unlinkAsync(tmpFilePath);
            request.flash('error', 'Invalid file type. Only image files are allowed.');
            return response.redirect('back');
          }
    
          // If the user already has a profile picture, delete the old file
          if (updatedUser.profile_picture && fs.existsSync(path.join(__dirname, '..', updatedUser.profile_picture))) {
             fs.unlinkSync(path.join(__dirname, '..', updatedUser.profile_picture));
          }
    
          // Rename the uploaded file to a unique filename to prevent filename collisions
          const fileName = `${Date.now()}_${tmpFileName}`;
          const profilePicturePath = path.join(User.Profile_Path, fileName);
          await fs.promises.rename(tmpFilePath, path.join(__dirname, '..', profilePicturePath));
    
          // Save the path to the profile picture in the user's profile_picture field
          updatedUser.profile_picture = profilePicturePath;
        }
    
        // Update the user's name and email fields
        updatedUser.name = name;
        updatedUser.email = email;
        updatedUser.password = password;
    
        // Save the updated user details in the database
        await updatedUser.save();
    
        // Send a success message and redirect the user to the previous page
        const successMessage = 'User details updated successfully.';
        request.flash('success', successMessage);
        return response.redirect('back');
    } catch (error) {
        // If an error occurred, log the error and return an error message to the user
        response.status(400).json({
            message:'Internall Server Error !!'
            })
        return;
    }
    
};

// for signup controll

module.exports.sign_up = function(request , response){
    if(request.isAuthenticated()){
        return response.redirect('/user/profile');
    }
    return response.render('user_signup',{
        title : 'Create New Account | My Book',
        message: { type: null, text: null },
    });
}
// For sign in controll 

module.exports.sign_in = function(request , response){
    if(request.isAuthenticated()){
       return response.redirect('/user/profile');
    }
    response.render('user_signin',{
        title: 'Sign in | My Book',
        message: { type: null, text: null }
    });
    return
}

// get the data from sign Up
module.exports.create = async function(request , response){
    try{
        if(request.body.password != request.body.confirm_password){
            request.flash('error' , 'Wrong Username Or Password !');
            return response.redirect('back');
        } 
        let user = await User.findOne({email: request.body.email});
         // If no user with that mail then create
        if(!user){
            let user = await User.create(request.body);
            request.flash('success' , 'User Account Created Successfully');
            return response.redirect('/user/sign-in');
        }else{
            request.flash('error' , 'User Account Already');
            return response.redirect('back');
        }
    }catch(err){
        response.status(400).json({
            message:'Internall Server Error !!'
        })
        return;
    }
}


// create the session for the user
module.exports.create_session = function(request,response){
    // Using passposrt Js library use
    request.flash('success', 'Log In Successfully');
    return response.redirect('/');
}

// For SignOut 
module.exports.destroySession = function(request , response){
    request.logout(function(err) {
        if (err) {
            response.status(400).json({
                message:'Internall Server Error !!'
            })
            return;
        }
        request.flash('success' , 'Logged Out Successfully');
        return response.redirect('/');
    });
}
