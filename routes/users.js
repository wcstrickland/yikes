const express = require('express');
const router = express.Router();
const wrapAsync = require('../utilities/wrapAsync');
const users = require('../controllers/users');
const passport = require('passport');

router
    .route('/register')
    // SERVES REGISTER FORM
    .get(users.newForm)
    // POSTS REGISTER FORM
    .post(wrapAsync(users.newUser));

router
    .route('/login')
    // SERVES LOGIN FORM
    .get(users.loginForm)
    // POSTS LOGIN FORM DATA
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser);

// LOGOUT
router.get('/logout', users.logoutUser);

module.exports = router;