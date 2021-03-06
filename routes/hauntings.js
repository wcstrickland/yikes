/**
 * this express router allows us to move routes and
 * their direct dependencies out of the main `app` file
 * in the app file it appears app.use('/haunting', hauntingRoutes);
 * the first argument is the string representation.
 * if any incoming requests match the string it will pass to this file
 * essentially the string is a prefix for all router.verb routes below
 * the second argument is the name given to the import of this file
 */

const express = require('express');
const wrapAsync = require('../utilities/wrapAsync'); // try/catch wrapper for async functions calling next on errors
const hauntings = require('../controllers/hauntings');
const { isLoggedIn, isAuthor, validateHaunting, isAdmin, hasReported, beenRemoved } = require('../middleware');
const router = express.Router({ mergeParams: true }); // create router object
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
    .route('/')
    //INDEX
    .get(wrapAsync(hauntings.index))
    // NEW POST
    .post(isLoggedIn, upload.array('image'), validateHaunting, wrapAsync(hauntings.createHaunting));

// NEW Haunting FORM
router.get('/new', isLoggedIn, hauntings.newForm);

// reported listings (admin use) must stay above :id routes or admin is misread as an id
router.get('/admin', isLoggedIn, isAdmin, wrapAsync(hauntings.reportedIndex));
router.get('/admin/:id', isLoggedIn, isAdmin, wrapAsync(hauntings.showReportedHaunting));
router.patch('/admin/:id', isLoggedIn, isAdmin, wrapAsync(hauntings.clearReports));

router
    .route('/:id')
    // SHOW Haunting
    .get(beenRemoved, wrapAsync(hauntings.showHaunting))
    // UPDATE Haunting PUT
    .put(isLoggedIn, isAuthor, upload.array('image'), validateHaunting, wrapAsync(hauntings.editHaunting))
    // APPEND PHOTOS
    .patch(isLoggedIn, isAuthor, upload.array('image'), wrapAsync(hauntings.appendPhotos))
    // DELETE Haunting
    .delete(isLoggedIn, isAuthor, wrapAsync(hauntings.deleteHaunting));

// UPDATE Haunting FORM
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(hauntings.editForm));
// APPEND PHOTOS FORM
router.get('/:id/append', isLoggedIn, isAuthor, wrapAsync(hauntings.appendForm));

// REPORT ROUTES
// Report Form
router.get('/:id/report', hasReported, isLoggedIn, wrapAsync(hauntings.reportForm));
// report
router.put('/:id/report', hasReported, isLoggedIn, wrapAsync(hauntings.reportHaunting));

module.exports = router;