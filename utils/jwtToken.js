//Create and send token and save in cookie
const sendToken = (user, statusCode, res, req) => {
    //Create JWT Token
    const token = user.getJwtToken();

    //Options for cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000), //convert 7 from config file to 7 days
        httpOnly: true, //for saftey to not store locally
    };

    //Enable when using https custom domain
    // if (process.env.NODE_END == 'production') {
    //     options.secure = true;
    // }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}

module.exports = sendToken;