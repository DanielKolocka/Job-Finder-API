const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

//Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, role, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });
    res.status(200).json({
        success: true,
        message: 'User is registered.',
        data: user,
    });
});