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
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const router = express.Router({ mergeParams: true }); // create router object

router
    .route('/')
    //INDEX
    .get(wrapAsync(campgrounds.index))
    // NEW POST
    .post(isLoggedIn, validateCampground, wrapAsync(campgrounds.createCampground));

// NEW CAMPGROUND FORM
router.get('/new', isLoggedIn, campgrounds.newForm);

router
    .route('/:id')
    // SHOW CAMPGROUND
    .get(wrapAsync(campgrounds.showCampground))
    // UPDATE CAMPGROUND PUT
    .put(isLoggedIn, isAuthor, validateCampground, wrapAsync(campgrounds.editCampground))
    // DELETE CAMPGROUND
    .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

// UPDATE CAMPGROUND FORM
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.editForm));

module.exports = router;