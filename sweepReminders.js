const dotenv = require("dotenv");
dotenv.config();

var moment = require("moment");
var db = require("./db.js");
var wishlist = require("./wishlist.js")();

async function main() {
	
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

	var categories = {weekly: [], daily: []};
	for (let category in wishlist) {
		categories[wishlist[category].frequency].push(category);
	}

	var deleteQuery = "DELETE FROM reminder " +
				"WHERE keep = 0 AND (" +
					"category IN (?) AND sent_date < ? OR " +
					"category IN (?) AND sent_date < ?" +
				")";
	const sql = db.format(deleteQuery, [
		categories.weekly, lastReset.weekly.format("YYYY-MM-DD HH:mm:ss"),
		categories.daily, lastReset.daily.format("YYYY-MM-DD HH:mm:ss")
	]);
	console.log(sql);
	await db.query(deleteQuery, [
		categories.weekly, lastReset.weekly.format("YYYY-MM-DD HH:mm:ss"),
		categories.daily, lastReset.daily.format("YYYY-MM-DD HH:mm:ss")
	]);

}

module.exports = main;