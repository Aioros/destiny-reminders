const moment = require("moment");

const wishlist = require("./wishlist.js");
const helpers = require("./helpers.js");
const apiConfig = require("./apiConfig.js");

const aiorosWarlock = "2305843009269797090";

// temporary
var activityDefUrl = "https://www.bungie.net/common/destiny2_content/json/en/DestinyActivityDefinition-fdddf2ca-57f5-4da0-88d9-10be10a553d5.json";
var activityTypeDefUrl = "https://www.bungie.net/common/destiny2_content/json/en/DestinyActivityTypeDefinition-fdddf2ca-57f5-4da0-88d9-10be10a553d5.json";
var milestoneDefUrl = "https://www.bungie.net/common/destiny2_content/json/en/DestinyMilestoneDefinition-fdddf2ca-57f5-4da0-88d9-10be10a553d5.json";

async function getCurrentActivities() {
	var [availableActivities, actDefs, actTypeDefs, milestones, milestoneDefs] = await Promise.all([
		helpers.getData(apiConfig.baseUrl + "/Destiny2/2/Profile/4611686018461991702/?components=204"),
		helpers.getData(activityDefUrl),
		helpers.getData(activityTypeDefUrl),
		helpers.getData(apiConfig.baseUrl + "/Destiny2/Milestones"),
		helpers.getData(milestoneDefUrl)
	]);

	availableActivities = availableActivities.Response.characterActivities.data[aiorosWarlock].availableActivities;
	availableActivities = availableActivities.map(avActivity => {
		var activityDefinition = actDefs[avActivity.activityHash];
		var activityTypeDefinition = actTypeDefs[activityDefinition.activityTypeHash];
		activityDefinition.activityTypeName = activityTypeDefinition.displayProperties.name;
		return activityDefinition;
	});

	//console.log(availableActivities);

	var dailyHeroicMissions = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("story mission"));

	var dailyForge = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("forge"));

	var weeklyNightmareHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightmare hunt"));

	var weeklyNightfalls = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightfall"));

	var weeklyLegacyNFs = weeklyNightfalls.filter(a => !a.displayProperties.name.toLowerCase().includes("ordeal"));

	var weeklyOrdeals = weeklyNightfalls.filter(a => a.displayProperties.name.toLowerCase().includes("ordeal"));

	var flashpointMilestone = Object.values(milestoneDefs).filter(md => md.friendlyName == "Hotspot")[0];
	var flashpointQuest = milestones.Response[flashpointMilestone.hash].availableQuests[0].questItemHash;
	var flashpoint = milestoneDefs[flashpointMilestone.hash].quests[flashpointQuest];

	// TODO: crucible rotators, vendors (xur, spider)

	var today = moment();
	var start = moment("20200714");
	var weekDiff = today.diff(start, "week");
	var dayDiff = today.diff(start, "day");

	return {
		dailyMissions: dailyHeroicMissions.map(s => s.displayProperties.name),
		forges: dailyForge[0].displayProperties.name,
		nightmareHunts: [...new Set(weeklyNightmareHunts.map(n => n.displayProperties.description))],
		nightfalls: weeklyLegacyNFs.map(n => n.displayProperties.name),
		ordeals: weeklyOrdeals[0].displayProperties.description,
		flashpoints: flashpoint.displayProperties.name,
		curses: wishlist.curses.values[weekDiff % wishlist.curses.values.length],
		ascendantChallenges: wishlist.ascendantChallenges.values[weekDiff % wishlist.ascendantChallenges.values.length],
		blindWell: wishlist.blindWell.values[weekDiff % wishlist.blindWell.values.length],
		escalationProtocol: wishlist.escalationProtocol.values[weekDiff % wishlist.escalationProtocol.values.length],
		reckoning: wishlist.reckoning.values[weekDiff % wishlist.reckoning.values.length],
		menagerie: wishlist.menagerie.values[weekDiff % wishlist.menagerie.values.length],
		altars: wishlist.altars.values[dayDiff % wishlist.altars.values.length],
		wanderingNightmares: wishlist.wanderingNightmares.values[weekDiff % wishlist.wanderingNightmares.values.length]
	};

}

module.exports = getCurrentActivities;