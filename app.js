const express = require('express');
const dotenv = require('dotenv');

const app = express();

//import db
const connectDataBase = require('./config/database.js');

//seeting up config.env file variables
dotenv.config({ path: 'config/config.env' });

//Connecting to db
connectDataBase();

//setup body parser
app.use(express.json());

//importing routes
const jobs = require('./routes/jobs.js');
app.use('/api/v1', jobs);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});