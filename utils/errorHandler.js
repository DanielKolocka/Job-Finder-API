class ErrorHandler extends Error {
    constructor(message, statusCode) {
        //super is the constructor on the parent class Error which takes in a message for constructor
        super(message);
        this.statusCode = statusCode;

        //Almost all errors thrown by V8 have a stack property that holds the topmost 10 stack frames
        //CaptureStackTrace is a V8 function that creates the stack property on an Error instance.
        //Maintains stock trade for where our error was thrown
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHandler;