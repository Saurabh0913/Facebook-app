// const mongoose = require('mongoose');
// const User = require('./user');

// const resetPassTokenSchema  = new mongoose.Schema({

//     user : {
//         type:mongoose.Schema.Types.ObjectId,
//         ref : 'User',
//         required : true
//     },
//     accessToken : {
//         type : String,
//         required : true
//     } ,
//     isValid : {
//         type : Boolean ,
//         required : true
//     }

// });

// const ResetPassToken = mongoose.model('ResetPassToken' , resetPassTokenSchema);
// module.exports = ResetPassToken;


const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    token:{
        type: String,
        require: true
    },
    isValid: {
        type: Boolean,
        require: true
    }
},{
    timestamps: true
});

const PasswordReset = mongoose.model('PasswordReset' , passwordResetSchema);
module.exports = PasswordReset;

