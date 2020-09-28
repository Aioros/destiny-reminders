const moment = require("moment");

const helpers = require("./helpers.js");
const apiConfig = require("./apiConfig.js");

async function getActivityInfo(user) {
	var wishlist = require("./wishlist.js")();

	var vendorInfo;
	var banshee, bansheeAllItems, mods, bansheeSales, availableBanshee;
	var [
		activityData,
		milestoneInfo,
		vendorStuff,
		flashpointMilestone,
		profileNeededStuff
	] = await Promise.all([
		helpers.getActivityInfo()
			.then(avActivityInfo => avActivityInfo.map(a => a.activityHash))
			.then(helpers.getActivityData),
		helpers.getMilestoneInfo(),

		Promise.all([
				helpers.getVendorInfo(),
				helpers.getDefinitionByName("vendor", "Banshee-44")
			]).then(result => {
				vendorInfo = result[0];
				banshee = result[1];
				bansheeAllItems = banshee.itemList;
				bansheeSales = vendorInfo.sales.data[banshee.hash].saleItems;
			}).then(() => Promise.all([
				helpers.getItems(bansheeAllItems.map(i => i.itemHash), '% mod\"'),
				helpers.getItems(Object.values(bansheeSales).map(s => s.itemHash), '% mod\"')
			])).then(result => {
				mods = result[0];
				availableBanshee = result[1].map(m => m.name);
				wishlist.banshee.values = mods.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.banshee.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
			}),
		helpers.getDefinitionByField("milestone", "$.friendlyName", "Hotspot"),
		!user ? {} : helpers.getProfileInfo(user)
			.then(profileInfo => Promise.all(Object.values(wishlist).map(c => c.setNeeded(profileInfo))))
	]);

	var availableActivities = activityData.map(data => 
		Object.assign(data.activityData, {activityTypeName: data.activityTypeData.displayProperties.name})
	);

	var dailyHeroicMissions = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("story mission"));

	var dailyForge = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("forge"));
	
	var weeklyNightmareHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightmare hunt"));

	var weeklyNightfalls = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightfall"));

	var weeklyLegacyNFs = weeklyNightfalls.filter(a => !a.displayProperties.name.toLowerCase().includes("ordeal"));

	var weeklyOrdeals = weeklyNightfalls.filter(a => a.displayProperties.name.toLowerCase().includes("ordeal"));

	var flashpointQuest = milestoneInfo[flashpointMilestone.hash].availableQuests[0].questItemHash;
	var flashpoint = flashpointMilestone.quests[flashpointQuest];

	// TODO: crucible rotators, vendors (xur, spider)

	var today = moment();
	var start = moment("2020-07-14 17Z");
	var weekDiff = today.diff(start, "week");
	var dayDiff = today.diff(start, "day");

	var activityInfo = {
		current: {
			banshee: availableBanshee,
			contact: wishlist.contact.values[weekDiff % wishlist.contact.values.length].name,
			interference: wishlist.interference.values[weekDiff % wishlist.interference.values.length].name,
			dailyMissions: dailyHeroicMissions.map(s => s.displayProperties.name),
			forges: dailyForge[0].displayProperties.name,
			nightmareHunts: [...new Set(weeklyNightmareHunts.map(n => n.displayProperties.description))],
			nightfalls: weeklyLegacyNFs.map(n => n.displayProperties.name),
			ordeals: weeklyOrdeals[0].displayProperties.description,
			flashpoints: flashpoint.displayProperties.name,
			curses: wishlist.curses.values[weekDiff % wishlist.curses.values.length].name,
			ascendantChallenges: wishlist.ascendantChallenges.values[weekDiff % wishlist.ascendantChallenges.values.length].name,
			blindWell: wishlist.blindWell.values[weekDiff % wishlist.blindWell.values.length].name,
			escalationProtocol: wishlist.escalationProtocol.values[weekDiff % wishlist.escalationProtocol.values.length].name,
			reckoning: wishlist.reckoning.values[weekDiff % wishlist.reckoning.values.length].name,
			menagerie: wishlist.menagerie.values[weekDiff % wishlist.menagerie.values.length].name,
			altars: wishlist.altars.values[dayDiff % wishlist.altars.values.length].name,
			wanderingNightmares: wishlist.wanderingNightmares.values[weekDiff % wishlist.wanderingNightmares.values.length].name,
			whisper: wishlist.whisper.values[dayDiff % wishlist.whisper.values.length].name,
			zeroHour: wishlist.zeroHour.values[dayDiff % wishlist.zeroHour.values.length].name
		}
	};
	
	activityInfo.wishlist = wishlist;

	return activityInfo;

}

module.exports = getActivityInfo;