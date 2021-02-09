// AUTHENTICATION
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // req.isAuthenticated() is a helper provided by passport to manage extended login session auth
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
};