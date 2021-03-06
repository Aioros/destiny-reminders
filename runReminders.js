const dotenv = require("dotenv");
dotenv.config();

var moment = require("moment");
var crypto = require("crypto");
var mailer = require("./mail.js");
var db = require("./db.js");
var helpers = require("./helpers.js");
var getActivityInfo = require("./activities.js");

async function main() {
	
	await helpers.updateDbInfo();

	var activityInfo = await getActivityInfo();
	var currentActivities = activityInfo.current;
	var wishlist = activityInfo.wishlist;
	
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

	var baseSelectQuery = "SELECT id, user, category, choice, email, sent_date, keep " +
					"FROM " + helpers.getReminderTable() + " " +
					"WHERE category = ? " +
					"AND (sent_date IS NULL OR keep = 1) ";
	var selectQuery, selectParams;

	for (let category in wishlist) {

		var current = currentActivities[category];
		if (typeof current === "string") {
			current = [current];
		}

		if (["list", "vendor"].includes(wishlist[category].type)) {

			var currentValid = [];
			current.forEach(c => {
				var valid = wishlist[category].values.find(
					v => c.toLowerCase().includes(v.name.toLowerCase())
				);
				if (valid) {
					currentValid.push(valid.name);
				}
			});

			if (currentValid.length == 0) {
				continue;
			}

			selectQuery = baseSelectQuery + "AND choice IN (?)";
			selectParams = [category, currentValid];

		} else if (wishlist[category].type == "combo") {

			if (current.length == 0) continue;

			selectQuery = baseSelectQuery + "AND (";
			selectParams = [category];
			selectQuery += current.map(c => 
				"(" + Object.entries(c).map(entry => {
					var [type, value] = entry;
					selectParams.push(value);
					return "JSON_UNQUOTE(JSON_EXTRACT(CAST(choice AS JSON), '$."+type+"')) IN (?, '')";
				}).join(" AND ") + ")"
			).join(" OR ");

			selectQuery += ")";

		}
		
		try {
			const sql = db.format(selectQuery, selectParams);
			console.log(sql);
			var [result,] = await db.query(selectQuery,	selectParams);
			console.log(result.length + " rows");
			for (let row of result) {
				let sentDate = moment(row.sent_date || "1970-01-01");

				if (sentDate.isAfter(lastReset[wishlist[category].frequency])) {
					continue;
				}

				console.log("Send reminder to user " + row.user + " at " + row.email + " for " + row.choice);
				
				try {
					let info = await mailer.send({
						template: "reminder",
						message: {
							from: '"Destiny Reminders ✓" <postmaster@mg.destinyreminders.net>',
							to: row.email
						},
						locals: {
							category: category,
							categoryDesc: helpers.capitalize(wishlist[category].description),
							choice: row.choice,
							choiceDesc: helpers.capitalize(helpers.getChoiceDescription(category, row.choice)),
							frequency: wishlist[category].frequency,
							when: wishlist[category].frequency == "weekly" ? "this week" : "today"
						},
					});
					console.log("Email sent: %s", info.messageId);
					
					await db.query(
						"UPDATE " + helpers.getReminderTable() + " " +
						"SET sent_date = UTC_TIMESTAMP(), " +
						"keep = 0 " +
						"WHERE id = ?",
						[row.id]
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