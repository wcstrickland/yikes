if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// ************** REQUIREMENTS AND INTITIALIZATION *************

const express = require('express');
const methodOverride = require('method-override'); // import method override to allow put and other requests from body
const morgan = require('morgan'); // import logging middleware
const ejsMate = require('ejs-mate'); //import ejs engine allowing for layouts rather than partials
const cookieParser = require('cookie-parser'); // allows express to properly parse cookies
const session = require('express-session'); // express session tool
const flash = require('connect-flash'); // flash middlewared
const mongoSanitize = require('express-mongo-sanitize'); // sanitize db inputs
const MongoStore = require('connect-mongo').default; // mongo session store
const helmet = require('helmet'); // security mw package
const passport = require('passport'); // auth
const LocalStrategy = require('passport-local'); // auth
const app = express(); // running app
const path = require('path'); // import path module to get access to file paths
const mongoose = require('mongoose');
const AppError = require('./utilities/AppError');
const hauntingRoutes = require('./routes/hauntings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');
app.set('views', path.join(__dirname, 'views')); // set view path
app.set('view engine', 'ejs'); // set view engine
app.engine('ejs', ejsMate); // add engine

// ******************* MIDDLEWARES *********************

app.use(express.urlencoded({ extended: true })); // middle ware that parses post requests payloads incoming via DOM body
app.use(methodOverride('_method')); // middle ware that allows put request to be served via DOM body
app.use(morgan('tiny')); // logging mw: console.logs request, route, response time
app.use(flash()); // adds a .flash() method onto all req objects
app.use(express.static(path.join(__dirname, 'public'))); // serves static assets
app.use(cookieParser(process.env.COOKIE_PARSER_KEY)); // cookie parsing allows access to cookie info on req object

// ********* MONGOOSE CONNECTION (uri:string, options:object) ***********

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yikes';
// process.env.DB_URL ||
mongoose.connect(dbUrl, {
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

// ******************* SESSION **************************

// create a mongo session store variable to pass to session options later
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.MONGO_SESSION_SECRET,
    touchAfter: 24 * 60 * 60
});

store.on('error', function(e) {
    console.log('session store error', e);
});

app.use(
    session({
        store,
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // + ms -> sec -> min -> hr -> day -> week
            maxAge: 1000 * 60 * 60 * 24 * 7, // expires after a week
            httpOnly: true // helps prevent cross site scripting from obtaining cookie
        }
    })
);

//********** PASSPORT CONFIGURATION ****************

app.use(passport.initialize()); // initialize passport
app.use(passport.session()); // this must be used after `session`
app.use(mongoSanitize()); // sanitize db inputs against injection
app.use(helmet({ contentSecurityPolicy: false })); // helmet security package
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // method added by plugin on User model
passport.deserializeUser(User.deserializeUser()); // method added by plugin
// LOCALS/flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.currentUser.isAdmin = req.user;
    res.locals.reportThreshold = 2;
    res.locals.success = req.flash('success'); // attatches flash messages to all responses
    res.locals.error = req.flash('error');
    next(); // so we dont have to manually pass it around
});

//************ ROUTES *******************

// USER ROUTES
app.use('/', userRoutes);
// Haunting ROUTES
app.use('/hauntings', hauntingRoutes);
// REVIEW ROUTES
app.use('/hauntings/:id/reviews', reviewRoutes);

// HOME
app.get('/', (req, res, next) => {
    res.render('home');
});

// ERROR ROUTES :positionally must come last as they catch requests that
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}`);
});