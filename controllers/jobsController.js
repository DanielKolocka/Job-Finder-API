
const Job = require('../models/jobs.js');

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