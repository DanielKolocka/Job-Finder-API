const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address.'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address.'],
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'employer'],
            message: 'Please select your correct role.'
        },
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please enter password for your account.'],
        minLength: [6, 'Your password must be at least 8 characters long'],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    //for resetting passwords
    resetPasswprdToken: String,
    resetPasswordExpire: Date,
});

module.exports = mongoose.model('User', userSchema)