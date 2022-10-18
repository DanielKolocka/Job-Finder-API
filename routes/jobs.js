const express = require('express');
const router = express.Router();

//importing jobs controller methods
const { getJobs, getJob, newJob, getJobsInRadius, updateJob, deleteJob, jobStats } = require('../controllers/jobsController.js');

router.route('/jobs').get(getJobs);
router.route('/jobs/:id').get(getJob);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/stats/:topic').get(jobStats);

router.route('/jobs/new').post(newJob);

router.route('/jobs/:id').put(updateJob);
router.route('/jobs/:id').delete(deleteJob);
module.exports = router;

