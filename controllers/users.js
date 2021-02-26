const User = require('../models/user');
const passport = require('passport');

module.exports.newForm = (req, res) => {
    res.render('users/register');
};

module.exports.newUser = async(req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome!');
            res.redirect('/hauntings');
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/hauntings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logOut();
    req.flash('success', 'Goodbye!');
    res.redirect('/hauntings');
};