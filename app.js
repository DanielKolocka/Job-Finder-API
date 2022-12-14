const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// Security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

//import db
const connectDataBase = require('./config/database.js');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');

//seeting up config.env file variables
dotenv.config({ path: 'config/config.env' });

//Handling uncaught exception
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down due to uncaught exception.');
    process.exit(1);
});

//Connecting to db
connectDataBase();

// Setup security headers (helmet)
app.use(helmet());

//Setup body parser
app.use(express.json());

//Setup cookie parser
app.use(cookieParser());

// Handle file uploads
app.use(fileUpload());

// Sanitize Data
app.use(mongoSanitize());

// Prevent xss attacks
app.use(xssClean());

// Prevent parameter polution. Eg. ?sort=name&sort=salary
app.use(hpp({
    whitelist: ['positions'] //Eg. We want to query jobs with positions=2 and positions=10 (hpp would prevent both showing up)
}));

// Setup CORS - Accessible by other domains
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMITER_TIME * 60 * 1000, //Minutes
    max: process.env.RATE_LIMITER_MAX //Number of requests

});
app.use(limiter);

//importing routes
const jobs = require('./routes/jobs.js');
const auth = require('./routes/auth');
const user = require('./routes/user');

app.use('/api/v1', jobs);
app.use('/api/v1', auth);
app.use('/api/v1', user);

//Handle unhandled routes
//app.all = all http requests, '*' = all routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

//Handling unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection.')
    server.close(() => {
        process.exit(1);
    });
});