const express = require('express');
const wrapAsync = require('../utilities/wrapAsync'); // try/catch wrapper for async functions calling next on errors
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const router = express.Router({ mergeParams: true }); // create router object

// SUBMIT NEW REVIEW
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.newReview));

// DELETE REVIEW
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;