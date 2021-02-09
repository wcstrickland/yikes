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
const { campgroundSchema } = require('../models/validationSchemas'); // JOI validation schemas for server side validation
const AppError = require('../utilities/AppError');
const { isLoggedIn } = require('../middleware');
const router = express.Router({ mergeParams: true }); // create router object

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
    isLoggedIn,
    wrapAsync((req, res, next) => {
        res.render('campgrounds/new');
    })
);

// NEW CAMPGROUND POST
router.post(
    '/',
    isLoggedIn,
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'Successfully made a new campground! 🎊🎊🎊');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// SHOW CAMPGROUND
router.get(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');
        if (!campground) {
            req.flash('error', 'Campground not found. 🙃');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', { campground });
    })
);

// UPDATE CAMPGROUND FORM
router.get(
    '/:id/edit',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            req.flash('error', 'Campground not found. 🙃');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    })
);

// UPDATE CAMPGROUNDPUT
router.put(
    '/:id',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground });
        req.flash('success', 'Campground Updated 🎉🎉🎉');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE CAMPGROUND
router.delete(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Campground Deleted! 💥💥💥');
        res.redirect('/campgrounds');
    })
);

module.exports = router;