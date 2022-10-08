const express = require('express');
const router = express.Router();

//importing jobs controller methods
const { getJobs } = require('../controllers/jobsController.js');

router.route('/jobs').get(getJobs);
router.get('/jobs', (req, res) => {

});

module.exports = router;

