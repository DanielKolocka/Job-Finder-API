
const Job = require('../models/jobs.js');
const geoCoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const APIFilters = require('../utils/apiFilters');
const path = require('path');
const fs = require('fs');

//get all jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {

    const apiFilters = new APIFilters(Job.find(), req.query);
    apiFilters
        .filter()
        .sort()
        .limitFields()
        .searchByQuery();

    const jobs = await apiFilters.query;
    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

//Get a single job with id and slug => /api/v1/jobs/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {

    //Populate added so that we see the id and the name of the user that created the job, rather than just id
    const job = await Job.findById(req.params.id).populate({
        path: 'user',
        select: 'name'
    });

    if (!job) {
        return next(new ErrorHandler('Job not found.', 404));
    }

    res.status(200).json({
        success: true,
        data: job
    });
});

//Create new job => /api/v1/jobs/new

exports.newJob = catchAsyncErrors(async (req, res, next) => {

    //Adding user to body
    req.body.user = req.user.id;

    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: 'Job Created',
        data: job
    });
});

//Update a job => /api/v1/jobs/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    let job = await Job.findById(jobId);

    if (!job) {
        return next(new ErrorHandler('Job not found', 404));

    }

    // Check the the user updating is the owner
    if (job.user.toString() != req.user.id && req.user.role != 'admin') {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to update this job.`,));
    }

    job = await Job.findByIdAndUpdate(jobId, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Job is updated.',
        data: job
    });
});

//Delete a job => /api/v1/jobs/:id
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id).select('+applicantsApplied');

    if (!job) {
        return next(new ErrorHandler('Job not found.', 404));
    }

    // Check the the user updating is the owner
    if (job.user.toString() != req.user.id && req.user.role != 'admin') {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to delete this job.`,));
    }

    // Delete files associated with job
    for (let i = 0; i < job.applicantsApplied.length; i++) {
        let filepath = `${__dirname}/public/uploads/${job.applicantsApplied[i].resume}`.replace('\\controllers', ''); //Replace controllers folder with empty folder so we can access public folder path

        fs.unlink(filepath, err => {
            if (err) {
                return console.log(err);
            }
        });
    }

    job = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Job is deleted'
    });
});

//Search jobs with radius => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //Getting lat and long from geoCoder using zipcode
    const loc = await geoCoder.geocode(zipcode);
    const long = loc[0].longitude;
    const lat = loc[0].latitude;

    //Radius of earth in miles: 3963
    const radius = distance / 3963;

    const jobs = await Job.find({
        location: { $geoWithin: { $centerSphere: [[long, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

//Get stats about a topic (job) => /api/v1/stats/:topic
exports.jobStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Job.aggregate([
        {
            $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
        },
        {
            $group: {
                //_id field groups together by _id
                _id: { $toUpper: "$experience" },
                totalJobs: { $count: {} },
                avgPositions: { $avg: "$positions" },
                avgSalary: { $avg: "$salary" },
                minSalary: { $min: "$salary" },
                maxSalary: { $max: "$salary" }
            }
        },

    ]);
    if (stats.length === 0) {
        return next(new ErrorHandler(`No stats found for: ${req.params.topic}`, 200));
    }

    res.status(200).json({
        success: true,
        data: stats
    });
});

// Apply to job using resume => api/v1/job/:id/apply
exports.applyJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id).select('+applicantsApplied');

    if (!job) {
        return next(new ErrorHandler('Job not found.', 404));
    }

    // Check if job last date has passed (expired posting)
    if (job.lastDate < new Date(Date.now())) {
        return next(new ErrorHandler('You can no longer apply to this job. Job posting has expired', 400));
    }

    // Check if user has applied before
    for (let i = 0; i < job.applicantsApplied.length; i++) {
        if (job.applicantsApplied[i].id === req.user.id) {
            return next(new ErrorHandler('You have already applied for this job.', 400));
        }
    }


    // Check if a file is uploaded (resume)
    if (!req.files) {
        return next(new ErrorHandler('Please upload a file.', 400));
    }

    const file = req.files.file;

    // Check file type (pdf or docx)
    const supportedFiles = /.docx|.pdf/;
    if (!supportedFiles.test(path.extname(file.name))) {
        return next(new ErrorHandler('Please upload document file.', 400));
    }

    // Check document size
    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorHandler('Please upload file less than 2mb.', 400));
    }

    // Rename resume to unique name
    file.name = `${req.user.name.replace(' ', '_')}_${job._id}${path.parse(file.name).ext}`;

    // Store file
    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorHandler('Resume upload failed.', 500));
        }

        await Job.findByIdAndUpdate(req.params.id, {
            $push: {
                applicantsApplied: {
                    id: req.user.id,
                    resume: file.name
                }
            }
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            message: 'Applied to job successfully.',
            data: file.name
        });
    })

});