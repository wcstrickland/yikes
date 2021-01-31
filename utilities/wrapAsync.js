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

module.exports = wrapAsync;