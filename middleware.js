const Haunting = require('./models/haunting'); // haunting model import
const Review = require('./models/review'); // review model import
const { hauntingSchema, reviewSchema } = require('./models/validationSchemas'); // JOI validation schemas for server side validation
const AppError = require('./utilities/AppError');

// AUTHENTICATION
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // req.isAuthenticated() is a helper provided by passport to manage extended login session auth
        req.session.returnTo = req.originalUrl; // store attempted route on the session for redirect
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
};

// AUTHORIZATION
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const haunting = await Haunting.findById(id);
    if (!haunting.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/hauntings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/hauntings/${id}`);
    }
    next();
};

module.exports.isAdmin = async(req, res, next) => {
    if (!res.locals.currentUser.isAdmin) {
        req.flash('error', 'You do not have admin privlidges');
        return;
    }
    next();
};

// JOI VALIDATION MIDDLEWARE
module.exports.validateHaunting = (req, res, next) => {
    const { error } = hauntingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};