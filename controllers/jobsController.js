
const Job = require('../models/jobs.js');
const geoCoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const APIFilters = require('../utils/apiFilters');

//get all jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {

    const apiFilters = new APIFilters(Job.find(), req.query);
    apiFilters
        .filter()
        .sort();

    const jobs = await apiFilters.query;
    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});

//Get a single job with id and slug => /api/v1/jobs/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id);

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
    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler('Job not found.', 404));
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