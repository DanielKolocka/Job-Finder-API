const express = require('express');
const router = express.Router();

const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserAdmin } = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

//So that you don't have to put in every single route
router.use(isAuthenticatedUser);

router.route('/profile').get(getUserProfile);
// router.route('/jobs/applied').get(authorizeRoles('user'), getAppliedJobs);
router.route('/profile/applied').get(authorizeRoles('user'), getAppliedJobs);
router.route('/profile/published').get(authorizeRoles('employer', 'admin'), getPublishedJobs);

router.route('/password/update').put(updatePassword);
router.route('/me/update').put(updateUser);

router.route('/me/delete').delete(deleteUser);

// Admin only route
router.route('/users').get(authorizeRoles('admin'), getUsers);
router.route('/users/:id').delete(authorizeRoles('admin'), deleteUserAdmin);

module.exports = router;