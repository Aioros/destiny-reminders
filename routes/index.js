var express = require('express');
var router = express.Router();
const passport = require("passport");

var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

const db = require("../db.js");

router.get("/", async function(req, res, next) {

	await helpers.updateDbInfo();

	var activityInfo = await getActivityInfo(req.user);

	/*if (req.isAuthenticated()) {
		req.user.userReminders = await helpers.getUserReminders(req.user.bungieNetUser.membershipId);
	}*/

	res.render('index', {
		section: "home",
		user: req.isAuthenticated ? req.user : null,
		helpers: helpers,
		wishlist: activityInfo.wishlist,
		current: activityInfo.current
	});

});

router.get("/reminders", function(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect("/auth/login?returnTo="+encodeURIComponent("/reminders"));
	} else {
		return next();
	}
}, async function(req, res, next) {
	var reminders = await helpers.getUserReminders(req.user.bungieNetUser.membershipId);
	res.render("reminders", {
		section: "reminders",
		user: req.user,
		helpers: helpers,
		wishlist: require("../wishlist.js")(),
		reminders: reminders
	});
});

router.get("/action", async function(req, res, next) {

	var [id, keep, hash] = [req.query.i, req.query.k, req.query.h];
	var valid = true;
	try {
		var [result,] = await db.query("SELECT user, category, choice, keep " +
			"FROM reminder WHERE id = ? AND hash = ?", [id, hash]);
		if (result.length == 0) {
			valid = false;
		} else {
			var {user, category, choice} = result[0];
			user = await helpers.getUserInfo(user);
			await db.query("UPDATE reminder " +
				"SET keep = ?, hash = NULL " +
				"WHERE id = ?", [Number(keep), id]);
		}
	} catch (ex) {
		console.log("error: ", ex);
		valid = false;
	}

	res.render("action", {
		user: user,
		helpers: helpers,
		wishlist: require("../wishlist.js")(),
		category: category,
		choice: choice,
		valid: valid
	});

});

module.exports = router;
