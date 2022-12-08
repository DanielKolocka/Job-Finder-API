const User = require('../models/users');
const Job = require('../models/jobs')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');

// Get current user profile => /api/v1/profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'jobsPublished',
        select: 'title postingDate'
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// Update current user Password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.checkPassword(req.body.currentPassword);

    if (!isMatched) {
        return next(new ErrorHandler('Old Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update current user data => api/v1/me/update
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true

    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// Delete current user => /api/v1/me/delete
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    deleteUserData(req.user.id, req.user.role);

    const user = await User.findByIdAndDelete(req.user.id);

    // Set the cookies to none since the user is gone
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Your account has been successfuly deleted.'
    });

});

// Delete any files associated with user, or jobs created by employers
async function deleteUserData(userId, role) {
    if (role == 'employer') {
        await Job.deleteMany({ user: userId });
    }

    if (role == 'user') {
        const appliedJobs = await Job.find({ 'applicantsApplied.id': userId }).select('+applicantsApplied');

        for (i = 0; i < appliedJobs.length; i++) {
            let obj = appliedJobs[i].applicantsApplied.find(x => x.id == userId);

            console.log('__dirname: ' + __dirname);
            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', '');
            console.log('filePath: ' + filepath);

            fs.unlink(filepath, err => {
                if (err) {
                    return console.log(err);
                }
            });

            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

            await appliedJobs[i].save();
        }
    }
}