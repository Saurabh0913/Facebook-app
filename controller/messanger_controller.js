;
module.exports.messanger = function(request , response){
    
    return response.render('messanger',{
        title: 'Messanger | My-Book',
        user: request.user
    });
}