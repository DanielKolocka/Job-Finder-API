# Job-Finder-API
Backend RESTful API for jobs built in Node.js using Express.js and MongoDB

## Documentation
[Link to Postman generated documentation.](https://documenter.getpostman.com/view/11898271/2s8YzTU2Qe)

## Install all Dependencies
```
npm i
```
## Config.env
### Replace all environment variables with your's.
PORT
NODE_ENV = production

DB_LOCAL_URI: [Your Database URI](https://www.mongodb.com/atlas/database)

GEOCODER_PROVIDER = mapquest </br>
GEOCODER_API_KEY: [Get your own api key](https://developer.mapquest.com/)

JWT_SECRET: Your secret 256-bit secret key </br>
JWT_EXPIRE_TIME: How long for token to expire. Eg. 7d </br>
COOKIE_EXPIRES_TIME: How long for cookie to expire. Eg. 7

SMTP_HOST: Simple Mail Transfer Protocol Host. Eg. smtp.mailtrap.io </br>
SMTP_PORT: Simple Mail Transfer Protocol Port. Eg. smtp.mailtrap.io </br>
SMTP_USER: Simple Mail Transfer Protocol User. </br>
SMTP_PASS: Simple Mail Transfer Protocol Password. </br>
SMTP_FROM_EMAIL: Simple Mail Transfer Protocol From Email. Eg. noreply@jobapi.com </br>
SMTP_FROM_NAME: Simple Mail Transfer Protocol From Name. Eg. JobAPI

MAX_FILE_SIZE: Max file size for upload (Resume upload). Eg. 2000000 (2mb) </br>
UPLOAD_PATH: Location to upload resumes. Eg. ./public/uploads

RATE_LIMITER_TIME: Time limit for api call limit. Eg. 10 (10 minutes) </br>
RATE_LIMITER_MAX: Aou call limit per time limit. Eg. 1000 (1000 calls)

