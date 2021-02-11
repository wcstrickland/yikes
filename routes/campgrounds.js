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
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const router = express.Router({ mergeParams: true }); // create router object

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
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully made a new campground! 🎊🎊🎊');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// SHOW CAMPGROUND
router.get(
    '/:id',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            })
            .populate('author');
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
    isLoggedIn,
    isAuthor,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            req.flash('error', 'Campground not found. 🙃');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    })
);

// UPDATE CAMPGROUND PUT
router.put(
    '/:id',
    isLoggedIn,
    isAuthor,
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
    isLoggedIn,
    isAuthor,
    wrapAsync(async(req, res, next) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Campground Deleted! 💥💥💥');
        res.redirect('/campgrounds');
    })
);

module.exports = router;