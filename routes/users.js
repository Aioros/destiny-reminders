var express = require("express");
var router = express.Router();
const passport = require("passport");

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
router.get("/callback", passport.authenticate('bungie-oauth2', { failureRedirect: "/" }), function(req, res) {
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
});

module.exports = router;
