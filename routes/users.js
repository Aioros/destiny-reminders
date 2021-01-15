var express = require("express");
var router = express.Router();
const passport = require("passport");
var createError = require('http-errors');

//router.get("/login", passport.authenticate('bungie-oauth2'));
router.get("/login", function(req, res, next) {
	const { returnTo } = req.query;
    const state = returnTo
        ? Buffer.from(JSON.stringify({ returnTo })).toString('base64') : undefined
    const authenticator = passport.authenticate('bungie-oauth2', { state });
    authenticator(req, res, next);
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect('/');
});

//router.get("/callback", passport.authenticate('bungie-oauth2', { successRedirect: "/", failureRedirect: "/" }));
/*router.get("/callback", passport.authenticate('bungie-oauth2', { failureRedirect: "/" }), function(req, res) {
	try {
        const { state } = req.query
        const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString())
        if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
            return res.redirect(decodeURIComponent(returnTo));
        }
    } catch {
        // just redirect normally below
    }
    res.redirect('/')
});*/

router.get("/callback", function(req, res, next) {
    passport.authenticate('bungie-oauth2', function(err, user, info) {
        if (info?.error) {
            return next(createError(info.error.status, info.error.message, {expose: true}));
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            try {
                const { state } = req.query
                const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString())
                if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
                    return res.redirect(decodeURIComponent(returnTo));
                }
            } catch {
                // just redirect normally below
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

module.exports = router;
