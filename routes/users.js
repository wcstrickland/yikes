const express = require('express');
const router = express.Router();
const wrapAsync = require('../utilities/wrapAsync');
const User = require('../models/user');
const passport = require('passport');

// SERVES REGISTER FORM
router.get('/register', (req, res) => {
    res.render('users/register');
});

// POSTS REGISTER FORM
router.post(
    '/register',
    wrapAsync(async(req, res, next) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash('success', 'Welcome!');
                res.redirect('/campgrounds');
            });
        } catch (error) {
            req.flash('error', error.message);
            res.redirect('/register');
        }
    })
);

// SERVES LOGIN FORM
router.get('/login', (req, res) => {
    res.render('users/login');
});

// POSTS LOGIN FORM DATA
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
});

module.exports = router;