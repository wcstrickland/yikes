const Haunting = require('../models/haunting'); // haunting model import
const Review = require('../models/review'); // review model import

module.exports.newReview = async(req, res, next) => {
    const haunting = await Haunting.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    haunting.reviews.push(review);
    await review.save();
    await haunting.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/hauntings/${haunting._id}`);
};

module.exports.deleteReview = async(req, res, next) => {
    const { id, reviewId } = req.params;
    await Haunting.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/hauntings/${id}`);
};