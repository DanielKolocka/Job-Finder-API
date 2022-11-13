const express = require('express');
const router = express.Router();

const { registerUser, logInUser } = require('../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(logInUser);

module.exports = router;