const express = require('express');
const wrapAsync = require('../utilities/wrapAsync'); // try/catch wrapper for async functions calling next on errors
const Campground = require('../models/campground'); // campground model import
const Review = require('../models/review'); // review model import
const { reviewSchema } = require('../models/validationSchemas'); // JOI validation schemas for server side validation
const AppError = require('../utilities/AppError');
const router = express.Router({ mergeParams: true }); // create router object

// VALIDATION MIDDLEWARE
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};

// SUBMIT NEW REVIEW
router.post(
    '/',
    validateReview,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE REVIEW
router.delete(
    '/:reviewId',
    wrapAsync(async(req, res, next) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;