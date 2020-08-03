var express = require('express');
var router = express.Router();

var wishlist = require("../wishlist.js");
var helpers = require("../helpers.js");
var getCurrentActivities = require("../current.js");

router.get('/', async function(req, res, next) {

	var current = await getCurrentActivities();
	res.render('index', {
		title: "Destiny Reminders",
		user: req.isAuthenticated ? req.user : null,
		helpers,
		wishlist,
		current
	});

});

router.get('/check/:category/:choice', async function(req, res, next) {

	var current = await getCurrentActivities();
	var isCurrent = helpers.isCurrent(req.params.category, current, req.params.choice);
	res.json({result: isCurrent});

});

module.exports = router;
