class AppError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((e) => next(e));
    };
}

module.exports = { AppError, wrapAsync };