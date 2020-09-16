var express = require('express');
var router = express.Router();
const passport = require("passport");
const fetch = require("node-fetch");

var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

const db = require("../db.js");

router.get("/", async function(req, res, next) {

	await helpers.updateDbInfo();

	var activityInfo = await getActivityInfo(req.user);

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
	var wishlist = require("../wishlist.js")();
	var reminders = (await helpers.getUserReminders(req.user.bungieNetUser.membershipId))
		.sort((a, b) => {
			var compareCategory = wishlist[a.category].description.localeCompare(wishlist[b.category].description);
			if (compareCategory !== 0)
				return compareCategory;
			return a.choice.localeCompare(b.choice);
		});
	res.render("reminders", {
		section: "reminders",
		user: req.user,
		helpers: helpers,
		wishlist: wishlist,
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

router.get("/run/:action", async function(req, res, next) {
	var authHeader = req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.sendStatus(401);
	} else {
		try {
			var token = authHeader.substring(7, authHeader.length);

			const {OAuth2Client} = require('google-auth-library');
			const client = new OAuth2Client("destinyreminders.net");
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: "destinyreminders.net"
			});
			const payload = ticket.getPayload();
			const userid = payload['sub'];

			if (!userid) {
				res.sendStatus(401);
			} else {
				var action;
				switch (req.params.action) {
					case "reminders":
						action = require("../runReminders.js");
						break;
					case "sweep":
						action = require("../sweepReminders.js");
						break;
					default:
						action = function() {};
				}
				action().catch(console.error);
				res.sendStatus(200);
			}
		} catch (ex) {
			console.log(ex);
			res.sendStatus(401);
		}
	}
});

module.exports = router;
