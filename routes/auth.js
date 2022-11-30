const express = require('express');
const router = express.Router();

const { registerUser, logInUser, forgotPassword } = require('../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(logInUser);

router.route('/password/forgot').post(forgotPassword);

module.exports = router;