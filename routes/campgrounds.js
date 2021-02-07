/**
 * this express router allows us to move routes and
 * their direct dependencies out of the main `app` file
 * in the app file it appears app.use('/campgrounds', campgroundRoutes);
 * the first argument is the string representation.
 * if any incoming requests match the string it will pass to this file
 * essentially the string is a prefix for all router.verb routes below
 * the second argument is the name given to the import of this file
 */

const express = require('express');
const wrapAsync = require('../utilities/wrapAsync'); // try/catch wrapper for async functions calling next on errors
const Campground = require('../models/campground'); // campground model import
const Review = require('../models/review'); // review model import
const { reviewSchema, campgroundSchema } = require('../models/validationSchemas'); // JOI validation schemas for server side validation
const router = express.Router(); // create router object

// VALIDATION MIDDLEWARE
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};

// INDEX
router.get(
    '/',
    wrapAsync(async(req, res, next) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
);

// NEW CAMPGROUND FORM
router.get(
    '/new',
    wrapAsync((req, res, next) => {
        res.render('campgrounds/new');
    })
);

// NEW CAMPGROUND POST
router.post(
    '/',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// SHOW CAMPGROUND
router.get(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', { campground });
    })
);

// UPDATE CAMPGROUND FORM
router.get(
    '/:id/edit',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', { campground });
    })
);

// UPDATE CAMPGROUNDPUT
router.put(
    '/:id',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE CAMPGROUND
router.delete(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    })
);

// SUBMIT NEW REVIEW
router.post(
    '/:id/reviews',
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
    '/:id/reviews/:reviewId',
    wrapAsync(async(req, res, next) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;