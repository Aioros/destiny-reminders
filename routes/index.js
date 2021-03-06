var express = require('express');
var router = express.Router();
var createError = require('http-errors');

var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;

var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

const db = require("../db.js");

router.get("/", async function(req, res, next) {

	if (req.query.pm) {
		if (!req.user) {
			res.redirect("/");
		} else {
			req.session.passport.user.primaryMembershipId = req.query.pm;
			res.redirect("/");
		}
	}

	try {
		await helpers.updateDbInfo(!!req.query.force);

		var activityInfo = await getActivityInfo(req.user);

		res.render('index', {
			section: "home",
			user: req.isAuthenticated ? req.user : null,
			helpers: helpers,
			wishlist: activityInfo.wishlist,
			current: activityInfo.current
		});
	} catch (ex) {
		console.error(ex);
		if (ex.name == "BungieAPIException") {
			next(createError(503, "Bungie APIs are currently unavailable, please retry later", {expose: true}));
		} else if (ex.name == "DRMembershipException") {
			next(createError(503, ex.message, {expose: true}));
		}
		next(createError());
	}

});

router.get("/reminders", function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect("/auth/login?returnTo="+encodeURIComponent("/reminders"));
	} else {
		return next();
	}
}, async function(req, res, next) {
	try {
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
	} catch (ex) {
		console.error(ex);
		if (ex.name == "BungieAPIException") {
			next(createError(503, "Bungie APIs are currently unavailable, please retry later", {expose: true}));
		}
		next(createError());
	}
});

router.get("/renew", function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect("/auth/login?returnTo="+encodeURIComponent(req.originalUrl));
	} else {
		return next();
	}
}, async function(req, res, next) {
	var [category, choice] = [req.query.ct, req.query.ch].map(decodeURIComponent);
	var valid = true;
	try {
		var [result,] = await db.query("SELECT id " +
			"FROM " + helpers.getReminderTable() + " WHERE user = ? AND category = ? AND choice = ?",
			[req.user.bungieNetUser.membershipId, category, choice]
		);
		if (result.length == 0) {
			valid = false;
		} else {
			var {id} = result[0];
			await db.query("UPDATE " + helpers.getReminderTable() +
				" SET keep = 1, hash = NULL " +
				"WHERE id = ?", [id]);
		}
	} catch (ex) {
		console.log("error: ", ex);
		valid = false;
	}

	res.render("renew", {
		user: req.user,
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

router.post('*.logger', function (req, res) { 
    jsnlog_nodejs(JL, req.body);
    res.send(''); 
});

module.exports = router;
