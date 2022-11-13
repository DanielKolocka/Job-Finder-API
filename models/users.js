const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

userSchema.pre('save', async function (next) {
    //10 is recommended salt length to generate hash
    this.password = await bcrypt.hash(this.password, 10);
});

//Return JSON Web Token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_TIME });
}

//compare user entered password with password in the database
userSchema.methods.checkPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema)