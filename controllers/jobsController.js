
const Job = require('../models/jobs.js');
const geoCoder = require('../utils/geocoder');

//get all jobs => /api/v1/jobs
exports.getJobs = async (req, res, next) => {

    const jobs = await Job.find();
    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
}

//Get a single job with id and slug => /api/v1/jobs/:id/:slug
exports.getJob = async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found.'
        });
    }

    res.status(200).json({
        success: true,
        data: job
    });
}

//Create new job => /api/v1/jobs/new

exports.newJob = async (req, res, next) => {

    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: 'Job Created',
        data: job
    });
}

//Update a job => /api/v1/jobs/:id
exports.updateJob = async (req, res, next) => {
    const jobId = req.params.id;
    let job = await Job.findById(jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found.'
        });
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
}

//Delete a job => /api/v1/jobs/:id
exports.deleteJob = async (req, res, next) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    job = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Job is deleted'
    });
}

//Search jobs with radius => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = async (req, res, next) => {
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
}