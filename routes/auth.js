const express = require('express');
const router = express.Router();

const { registerUser, logInUser, forgotPassword, resetPassword } = require('../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(logInUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

module.exports = router;