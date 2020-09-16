#!/usr/bin/env node

const dotenv = require("dotenv");
dotenv.config();

var moment = require("moment");
var crypto = require("crypto");
var mailer = require("./mail.js");
var db = require("./db.js");
var helpers = require("./helpers.js");
var wishlist = require("./wishlist.js")();
var getActivityInfo = require("./activities.js");

async function main() {
	
	await helpers.updateDbInfo();

	var currentActivities = (await getActivityInfo()).current;
	
	let now = moment().utc();
	let lastReset = {};
	lastReset.weekly = moment().utc().startOf('isoWeek').add({days: 1, hours: 17});
	if (now.day() < 2 || now.day() == 2 && now.hour() < 17) {
		lastReset.weekly = lastReset.weekly.add(-1, 'week');
	}
	lastReset.daily = moment().utc().startOf('day').add(17, "h");
	if (now.hour() < 17) {
		lastReset.daily = lastReset.daily.add(-1, 'day');
	}

	for (let category in wishlist) {

		var current = currentActivities[category];
		if (typeof current === "string") {
			current = [current];
		}
		
		try {
			var [result,] = await db.query(
				"SELECT id, user, category, choice, email, sent_date, keep " +
					"FROM reminder " +
					"WHERE category = ? " +
					"AND choice IN (?)",
				[category, current]
			);
			
			for (let row of result) {
				let sentDate = moment(row.sent_date || "1970-01-01");

				if (sentDate.isAfter(lastReset[wishlist[category].frequency])) {
					break;
				}

				var newHash = crypto.randomBytes(16).toString("hex");

				console.log("Send reminder to user " + row.user + " at " + row.email + " for " + row.choice);
				if (row.user) {
					userName = (await helpers.getUserInfo(row.user)).bungieNetUser.displayName;
				} else {
					userName = "";
				}
				
				try {
					let info = await mailer.send({
						template: "reminder",
						message: {
							from: '"Destiny Reminders ✓" <postmaster@mg.destinyreminders.net>',
							to: row.email,
						},
						locals: {
							userName: userName,
							category: helpers.capitalize(wishlist[category].description),
							choice: helpers.capitalize(row.choice),
							when: wishlist[category].frequency == "weekly" ? "this week" : "today",
							id: row.id,
							newHash: newHash
						},
					});
					console.log("Email sent: %s", info.messageId);
					
					await db.query(
						"UPDATE reminder " +
						"SET sent_date = UTC_TIMESTAMP(), " +
						"keep = 0, " +
						"hash = ? " +
						"WHERE id = ?",
						[newHash, row.id]
					);
				} catch (ex) {
					console.log(ex);
				}
			}
		} catch (ex) {
			console.log("error: ", ex);
		}

	}

}

module.exports = main;