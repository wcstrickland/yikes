// requirements & init
const express = require('express');
const app = express(); // running app
const path = require('path'); // import path module to get access to file paths
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // import method override to allow put and other requests from body
const morgan = require('morgan') // import logging middleware
const ejsMate = require('ejs-mate') //import ejs engine allowing for layouts rather than partials

// mongoose connection
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});
// models
const Campground = require('./models/campground');


// set viewpath, engine, and catch all MW's
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny'));

// ROUTES

// HOME
app.get('/', (req, res) => {
    res.render('home')
});

// INDEX
app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

// NEW FORM
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// NEW POST
app.post('/campgrounds', async(req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

// SHOW
app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
})

// UPDATE FORM
app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
})

// UPDATE PUT
app.put('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
})

// DELETE
app.delete('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

// // 404 
// app.use((req, res) => {
//     res.render('404', { req })
// })


app.listen(3000, () => {
    console.log('Serving on port 3000')
})