const express = require('express');
const router = express.Router();

const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs } = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/profile').get(isAuthenticatedUser, getUserProfile);
// router.route('/jobs/applied').get(isAuthenticatedUser, authorizeRoles('user'), getAppliedJobs);
router.route('/profile/applied').get(isAuthenticatedUser, authorizeRoles('user'), getAppliedJobs);
router.route('/profile/published').get(isAuthenticatedUser, authorizeRoles('employer', 'admin'), getPublishedJobs);

router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateUser);

router.route('/me/delete').delete(isAuthenticatedUser, deleteUser);

module.exports = router;