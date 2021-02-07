const express = require('express');
const wrapAsync = require('../utilities/wrapAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema, campgroundSchema } = require('../models/validationSchemas');
const router = express.Router();

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

// NEW FORM
router.get(
    '/new',
    wrapAsync((req, res, next) => {
        res.render('campgrounds/new');
    })
);

// NEW POST
router.post(
    '/',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// SHOW
router.get(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', { campground });
    })
);

// UPDATE FORM
router.get(
    '/:id/edit',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', { campground });
    })
);

// UPDATE PUT
router.put(
    '/:id',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE
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

// delete a review
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