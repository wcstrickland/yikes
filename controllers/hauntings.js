const Haunting = require('../models/haunting'); // haunting model import
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async(req, res, next) => {
    const hauntings = await Haunting.find({});
    res.render('hauntings/index', { hauntings });
};

module.exports.newForm = (req, res, next) => {
    res.render('hauntings/new');
};

module.exports.createHaunting = async(req, res, next) => {
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.haunting.location,
            limit: 1
        })
        .send();
    const haunting = new Haunting(req.body.haunting);
    haunting.geometry = geoData.body.features[0].geometry;
    haunting.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    haunting.author = req.user._id;
    await haunting.save();
    req.flash('success', 'Successfully made a new haunting! ');
    res.redirect(`/hauntings/${haunting._id}`);
};

module.exports.showHaunting = async(req, res, next) => {
    const haunting = await Haunting.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!haunting) {
        req.flash('error', 'Haunting not found. 🙃');
        return res.redirect('/hauntings');
    }
    res.render('hauntings/show', { haunting });
};

module.exports.editForm = async(req, res, next) => {
    const haunting = await Haunting.findById(req.params.id);
    if (!haunting) {
        req.flash('error', 'Haunting not found. 🙃');
        return res.redirect('/hauntings');
    }
    res.render('hauntings/edit', { haunting });
};

module.exports.appendForm = async(req, res, next) => {
    const haunting = await Haunting.findById(req.params.id);
    if (!haunting) {
        req.flash('error', 'Haunting not found. 🙃');
        return res.redirect('/hauntings');
    }
    res.render('hauntings/append', { haunting });
};

module.exports.editHaunting = async(req, res, next) => {
    const haunting = await Haunting.findByIdAndUpdate(req.params.id, {...req.body.haunting });
    for (let img of haunting.images) {
        await cloudinary.uploader.destroy(img.filename);
    }
    haunting.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    await haunting.save();
    req.flash('success', 'Haunting  Updated ');
    res.redirect(`/hauntings/${haunting._id}`);
};

module.exports.appendPhotos = async(req, res, next) => {
    const haunting = await Haunting.findById(req.params.id);
    if (!haunting) {
        req.flash('error', 'Haunting not found. 🙃');
        return res.redirect('/hauntings');
    }
    const newImages = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    for (let img of newImages) {
        haunting.images.push(img);
    }
    await haunting.save();
    req.flash('success', 'Successfully added photos');
    res.redirect(`/hauntings/${haunting._id}`);
};

module.exports.deleteHaunting = async(req, res, next) => {
    const { id } = req.params;
    await Haunting.findByIdAndDelete(id);
    req.flash('success', 'Haunting Deleted! ');
    res.redirect('/hauntings');
};