
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

//Create new job => /api/v1/job/new

exports.newJob = async (req, res, next) => {

    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: 'Job Created',
        data: job
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