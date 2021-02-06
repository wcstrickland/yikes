// requirements & init
const express = require('express');
const app = express(); // running app
const path = require('path'); // import path module to get access to file paths
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // import method override to allow put and other requests from body
const morgan = require('morgan'); // import logging middleware
const ejsMate = require('ejs-mate'); //import ejs engine allowing for layouts rather than partials
const wrapAsync = require('./utilities/wrapAsync');
const { reviewSchema, campgroundSchema } = require('./models/validationSchemas');
const AppError = require('./utilities/AppError');

// mongoose connection
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});
// models
const Campground = require('./models/campground');
const Review = require('./models/review');

// set viewpath, engine, and catch all MW's
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny'));

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

// ROUTES

// HOME
app.get('/', (req, res, next) => {
    res.render('home');
});

// INDEX
app.get(
    '/campgrounds',
    wrapAsync(async(req, res, next) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
);

// NEW FORM
app.get(
    '/campgrounds/new',
    wrapAsync((req, res, next) => {
        res.render('campgrounds/new');
    })
);

// NEW POST
app.post(
    '/campgrounds',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// SHOW
app.get(
    '/campgrounds/:id',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', { campground });
    })
);

// UPDATE FORM
app.get(
    '/campgrounds/:id/edit',
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', { campground });
    })
);

// UPDATE PUT
app.put(
    '/campgrounds/:id',
    validateCampground,
    wrapAsync(async(req, res, next) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE
app.delete(
    '/campgrounds/:id',
    wrapAsync(async(req, res, next) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    })
);

// SUBMIT NEW REVIEW
app.post(
    '/campgrounds/:id/reviews',
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

// 404 ERROR
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong...';
    res.status(status).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});