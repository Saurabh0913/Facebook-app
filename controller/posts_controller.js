const Post = require('../models/posts');
const Comment = require('../models/comments');
const Like =  require('../models/likes');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);


// Creating Post

module.exports.post_Create = async function(request , response){
    try{
        // Create a new post object with the content and user properties set
        let post = new Post({
            content: request.body.content,
            user: request.user._id,
            imageUrl: ''
        });
         // Promisify the Post.upload_imageUrl middleware function
         const upload_imageUrl = promisify(Post.upload_imageUrl);
    
         // Call the middleware function to upload the post picture
         await upload_imageUrl(request, response);
     
         // Get the uploaded post picture from the request
         const imageUrl = request.file;
        
         // If a post picture was uploaded, process the file
         if (imageUrl) {
           // Get the file information from the uploaded file
           const { path: tmpFilePath, filename: tmpFileName, mimetype } = imageUrl;
     
           // If the file is not an image file, delete the temporary file and return an error message
           if (!mimetype.startsWith('image/')) {
             await unlinkAsync(tmpFilePath);
             request.flash('error', 'Invalid file type. Only image files are allowed.');
             return response.redirect('back');
           }
           // Rename the uploaded file to a unique filename to prevent filename collisions
           const fileName = `${Date.now()}_${tmpFileName}`;
           const upload_imageUrl = path.join(Post.PostFile_Path, fileName);
           await fs.promises.rename(tmpFilePath, path.join(__dirname, '..', upload_imageUrl));
     
           // Save the path to the post picture in the post's imageUrl field
           post.imageUrl = upload_imageUrl;
         }
        // Save the post  details in the database
        post.content = request.body.content,
        post.user = request.user._id,
        await post.save();
        // Send a success message and redirect the user to the previous page
        const successMessage = 'Posted Successfully.';
        request.flash('success', successMessage);
        return response.redirect('back');
    }
    catch(err){
        console.log('post',err);
        response.status(400).json({
            message:'Internall Server Error !!'
        });
        return;
    }
}


// Deleting Posts Along With The Comments

module.exports.destroy_post_comment = async function(request , response){

    const postId = request.params.id;
    try{
        const deletePosts = await Post.findByIdAndDelete(postId);
        if(!deletePosts){
            return res.status(400).json({
                message: 'Post Not Found'
            });
        }
        // Deleting All comments with all likesin posts
        await Like.deleteMany({likable: postId, onModel: 'post'});
        await Like.deleteMany({_id: {$in: postId.comments}});
        await Comment.deleteMany({posts: postId});
        // Using Ajax
        if(request.xhr){
            return response.status(200).json({
                data: {
                    post_id : postId
                },
                message: 'Post deleted'
            });
        }
        request.flash('success' , 'Post Deleted Successfully');
        return response.redirect('back');
    }catch(err){
        response.status(400).json({
            message:'Internall Server Error !!'
        })
        return;
    }
}