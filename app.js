// REQUIREMENTS AND INTITIALIZATION
const express = require('express');
const methodOverride = require('method-override'); // import method override to allow put and other requests from body
const morgan = require('morgan'); // import logging middleware
const ejsMate = require('ejs-mate'); //import ejs engine allowing for layouts rather than partials
const app = express(); // running app
const path = require('path'); // import path module to get access to file paths
const mongoose = require('mongoose');
const AppError = require('./utilities/AppError');
const campgroundRoutes = require('./routes/campgrounds');
app.set('views', path.join(__dirname, 'views')); // set view path
app.set('view engine', 'ejs'); // set view engine
app.engine('ejs', ejsMate); // add engine
// MIDDLEWARES
app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny')); // logging mw: console.logs request, route, response time

// MONGOOSE CONNECTION (uri:string, options:object)
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

//ROUTES

// CAMPGROUND ROUTES
app.use('/campgrounds', campgroundRoutes);

// HOME
app.get('/', (req, res, next) => {
    res.render('home');
});

// ERROR ROUTES positionally must come last as they catch requests that
// 'fall through' to them

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

// LISTENER
app.listen(3000, () => {
    console.log('Serving on port 3000');
});