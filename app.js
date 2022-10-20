const express = require('express');
const dotenv = require('dotenv');

const app = express();

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

//setup body parser
app.use(express.json());

//importing routes
const jobs = require('./routes/jobs.js');
app.use('/api/v1', jobs);

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