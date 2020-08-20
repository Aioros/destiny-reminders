var express = require('express');
var router = express.Router();

const nodemailer = require("nodemailer");

var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

const db = require("../db.js");

router.get("/", async function(req, res, next) {

	await helpers.updateDbInfo();

	var activityInfo = await getActivityInfo(req.user);

	if (req.isAuthenticated()) {
		req.user.userReminders = await helpers.getUserReminders(req.user.bungieNetUser.membershipId);
	}

	res.render('index', {
		title: "Destiny Reminders",
		user: req.isAuthenticated ? req.user : null,
		helpers: helpers,
		wishlist: activityInfo.wishlist,
		current: activityInfo.current
	});

});

router.get("/reminders/user/:user", async function(req, res, next) {
	res.json(await helpers.getUserReminders(req.params.user));
});

router.post("/reminders/", async function(req, res, next) {
	var newReminder = {
		user: req.isAuthenticated() ? req.user.bungieNetUser.membershipId : null,
		category: req.body.category,
		choice: req.body.choice,
		email: req.body.email
	};
	try {
		var [result,] = await db.query("INSERT INTO reminder SET ?", newReminder);
		res.json({status: "ok", reminder: {id: result.insertId, ...newReminder}});
	} catch (ex) {
		console.log("error: ", ex);
		res.json(ex);
	}
});

router.delete("/reminders/:id", async function(req, res, next) {
	try {
		await db.query("DELETE FROM reminder WHERE id = ?", req.params.id);
		res.json({status: "ok"});
	} catch (ex) {
		console.log("error: ", ex);
		res.json(ex);
	}
});

router.get("/current/:category", async function(req, res, next) {

	await helpers.updateDbInfo();

	var activityInfo = await getActivityInfo();

	res.json(activityInfo.current[req.params.category]);

});

module.exports = router;
