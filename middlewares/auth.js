const jtw = require('jsonwebtoken');
const user = require('../models/users');
const catchAsyncErrors = require('./catchAsyncErrors');
const errorHandler = require('../utils/errorHandler');
const ErrorHandler = require('../utils/errorHandler');

//Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    //Bearer is authorization key's value
    if (req.headers.authorization && req.headers.authorization.startWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; //Split 'Bearer token': [0] = Bearer, [1] = token
    }
    if (!token) {
        return next(new ErrorHandler('Login first to acess this resource.', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await user.findById(decoded.id);

    next();
});