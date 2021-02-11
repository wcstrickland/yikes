const Campground = require('./models/campground'); // campground model import
const Review = require('./models/review'); // review model import
const { campgroundSchema, reviewSchema } = require('./models/validationSchemas'); // JOI validation schemas for server side validation
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
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

// JOI VALIDATION MIDDLEWARE
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
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