var express = require('express');
var router = express.Router();

const nodemailer = require("nodemailer");

var helpers = require("../helpers.js");
var getActivityInfo = require("../activities.js");

const db = require("../db.js");

/*router.get("/temp", async function(req, res, next) {
	const fs = require("fs");
	var lowlidev = await helpers.getData("https://lowlidev.com.au/destiny/api/v2/map/supported?debug")
		.then(data => data.data.nodes);
	lowlidev = lowlidev.filter(node => 
		node.destinationId == "dreaming-city"
		&& ["corrupted-egg", "record-scan", "chest"].includes(node.node.type)
	);
	await fs.promises.writeFile("./data/lowlidevDc.json", JSON.stringify(lowlidev));
	res.json({});
});*/

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

router.get("/check/:category/:choice", async function(req, res, next) {

	var current = await getCurrentActivities();
	var isCurrent = helpers.isCurrent(req.params.category, req.params.choice, current);
	res.json({result: isCurrent});

});

router.get("/testmail", function(req, res, next) {



});

module.exports = router;
