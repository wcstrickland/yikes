/**
 * custom error class that extends built in error
 */
class AppError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}
/**
 * wrapper for async functions with built in catch
 * @param {function} fn 
 * @returns {function} fn.catch(e => next(e))
 */
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((e) => next(e));
    };
}

module.exports = { AppError, wrapAsync };