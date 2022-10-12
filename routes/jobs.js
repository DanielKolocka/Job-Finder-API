const express = require('express');
const router = express.Router();

//importing jobs controller methods
const { getJobs, newJob } = require('../controllers/jobsController.js');

router.route('/jobs').get(getJobs);

router.route('/jobs/new').post(newJob);

module.exports = router;

