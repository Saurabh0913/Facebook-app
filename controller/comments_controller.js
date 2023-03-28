const Comment = require('../models/comments');
const Post = require('../models/posts');
const Like = require('../models/likes');


// Create Comments
module.exports.comment_Create = async function(request , response){

  try{
    let post = await Post.findById(request.body.post_id);

    if(post){
      let comment = await Comment.create({
        content: request.body.content,
        posts: request.body.post_id,
        user: request.user._id
      });
      post.comments.push(comment);
      post.save();

      comment = await comment.populate('user' ,'name email');
      if(request.xhr){
        return response.status(200).json({
          data:{
            comment: comment
          },
          message:'Request Created'
        })
      }
      request.flash('success' , 'SuccessFully Commented');
      return response.redirect('/');
    }
  }catch(err){
    response.status(400).json({
      message:'Internall Server Error !!'
    })
    return;
  }
}

// deleting comments
module.exports.destroy_comment = async function( request , response){
  try{
    let comment = await Comment.findById(request.params.id);
    if(comment.user == request.user.id){
      // store post id
      let postId = comment.posts;
      // Delete comment
      await Comment.deleteOne({_id: comment._id});
      // Update the post 
      let post = await Post.findByIdAndUpdate( postId ,{ $pull: {comments: request.params.id}});

      // Delete all likes with reactions for the comment
      await Like.deleteMany({likable: comment._id , onModel: 'comment', reaction: {$exists: true}});
      request.flash('success' , 'Deleted Comment Successfully:');
      return response.redirect('back');
    }else{
      request.flash('error' , 'You can delete only own commnts:');
      return response.redirect('back');
    }
  }catch(err){
    response.status(400).json({
      message:'Internall Server Error !!'
    })
    return;
  }
}
