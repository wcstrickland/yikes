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
    wrapAsync(async(req, res) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.flash('success', 'Welcome!');
            res.redirect('/campgrounds');
        } catch (error) {
            req.flash('error', error.message);
            res.redirect('/register');
        }
    })
);

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/campgrounds');
});

module.exports = router;