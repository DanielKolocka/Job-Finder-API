const express = require('express');
const router = express.Router();

const { registerUser, logInUser, forgotPassword, resetPassword, logOut } = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middlewares/auth');


router.route('/register').post(registerUser);
router.route('/login').post(logInUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(isAuthenticatedUser, logOut);

module.exports = router;