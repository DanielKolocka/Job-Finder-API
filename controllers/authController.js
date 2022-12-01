const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, role, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendToken(user, 200, res);
});

//Login user => /api/v1/login
exports.logInUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    //Check if email or password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password'), 400);
    }

    //Finding user in database. //The + lets us return the password in addition to the other user traits. Without +, returns only password
    //Find one user with this email and this password. Return the user. Password select=false so we use .select()
    const user = await User.findOne({ email }).select('+password');
    console.log(user);

    if (!user) {
        return next(new ErrorHandler('Invalid email or password.'), 401);
    }

    //Check if password is correct
    const isPasswordMatched = await user.checkPassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password'), 401);
    }

    sendToken(user, 200, res);

});

// Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    // Check user email is in database
    if (!user) {
        return next(new ErrorHandler('No User found with this email.', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follows:\n\n${resetUrl}\n\nIf you have not requested this, please ignore this.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'JobAPI Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent successfully to: ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler('Email is not sent.'), 500);
    }


});

// Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Password Reset token is invalid or has expired!'), 400);
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});