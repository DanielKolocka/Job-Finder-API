const jwt = require('jsonwebtoken');
const user = require('../models/users');
const catchAsyncErrors = require('./catchAsyncErrors');
const errorHandler = require('../utils/errorHandler');
const ErrorHandler = require('../utils/errorHandler');

//Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    //Bearer is authorization key's value
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; //Split 'Bearer token': [0] = Bearer, [1] = token
    }
    if (!token) {
        return next(new ErrorHandler('Login first to acess this resource.', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await user.findById(decoded.id);

    next();
});

//Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        //req.user set in isAuthenticatedUser Method
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resource.`, 403));
        }
        next();
    }
}