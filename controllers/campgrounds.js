const Campground = require('../models/campground'); // campground model import

module.exports.index = async(req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.newForm = (req, res, next) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground! 🎊');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async(req, res, next) => {
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
};

module.exports.editForm = async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not found. 🙃');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async(req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground });
    req.flash('success', 'Campground Updated 🎉');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted! 💥');
    res.redirect('/campgrounds');
};