const express = require('express');
const router = express.Router();

//importing jobs controller methods
const { getJobs, getJob, newJob, getJobsInRadius, updateJob, deleteJob, jobStats, applyJob } = require('../controllers/jobsController.js');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/jobs').get(getJobs);
router.route('/jobs/:id').get(getJob);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router.route('/stats/:topic').get(jobStats);

router.route('/jobs/new').post(isAuthenticatedUser, authorizeRoles('employer', 'admin'), newJob);

router.route('/job/:id/apply').put(isAuthenticatedUser, authorizeRoles('user'), applyJob);

router.route('/jobs/:id').put(isAuthenticatedUser, authorizeRoles('employer', 'admin'), updateJob);
router.route('/jobs/:id').delete(isAuthenticatedUser, authorizeRoles('employer', 'admin'), deleteJob);
module.exports = router;

