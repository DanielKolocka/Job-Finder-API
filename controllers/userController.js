const User = require('../models/users');
const Job = require('../models/jobs')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');
const APIFilters = require('../utils/apiFilters');

// Get current user profile => /api/v1/profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    console.log(req.user);
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

// Show all applied jobs => /api/v1/profile/applied
exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
    // console.log(req.user);
    const jobs = await Job.find({ 'applicantsApplied.id': req.user.id }).select('+applicantsApplied');
    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

// Show all jobs published by employer => /api/v1/profile/published
exports.getPublishedJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await Job.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
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

// Adding controller methods that are only accessible by admins

// Show all users(admin) => /api/v1/users
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
    const apiFilters = new APIFilters(User.find(), req.query);
    apiFilters
        .filter()
        .sort()
        .limitFields();
    // .pagination();

    const users = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: users.length,
        data: users
    });
});

// Delete user(admin) => /api/v1/user/:id
exports.deleteUserAdmin = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with provided id: ${req.params.id}`, 404));
    }

    deleteUserData(user.id, user.role);
    user.remove();

    res.status(200).json({
        success: true,
        message: 'User is deleted by Admin.'
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

            // console.log('__dirname: ' + __dirname);
            let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', ''); //Replace controllers folder with empty folder so we can access public folder path
            // console.log('filePath: ' + filepath);

            fs.unlink(filepath, err => {
                if (err) {
                    return console.log(err);
                }
            });

            // Remove the applicant from the array of applicants
            appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

            await appliedJobs[i].save();
        }
    }
}