const express = require('express');
const router = express.Router();

//importing jobs controller methods
const { getJobs, newJob, getJobsInRadius } = require('../controllers/jobsController.js');

router.route('/jobs').get(getJobs);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);

router.route('/jobs/new').post(newJob);

module.exports = router;

