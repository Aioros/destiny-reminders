var express = require("express");
var router = express.Router();
const passport = require("passport");

router.get("/login", passport.authenticate('bungie-oauth2'));
router.get("/logout", function(req, res){
	req.logout();
	res.redirect('/');
});
router.get("/callback", passport.authenticate('bungie-oauth2', { successRedirect: "/", failureRedirect: "/" }));

module.exports = router;
