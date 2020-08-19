const moment = require("moment");

const wishlist = require("./wishlist.js");
const helpers = require("./helpers.js");
const apiConfig = require("./apiConfig.js");

async function getActivityInfo(user) {

	var [definitions, avActivityInfo, milestoneInfo, profileInfo] = await Promise.all([
		helpers.getDefinitions(),
		helpers.getActivityInfo(),
		helpers.getMilestoneInfo(),
		user ? helpers.getProfileInfo(user) : {}
	]);

	var availableActivities = avActivityInfo.map(avActivity => {
		var activityDefinition = definitions.activity[avActivity.activityHash];
		var activityTypeDefinition = definitions.activityType[activityDefinition.activityTypeHash];
		activityDefinition.activityTypeName = activityTypeDefinition.displayProperties.name;
		return activityDefinition;
	});

	var dailyHeroicMissions = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("story mission"));

	var dailyForge = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("forge"));
	
	var weeklyNightmareHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightmare hunt"));

	var weeklyNightfalls = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightfall"));

	var weeklyLegacyNFs = weeklyNightfalls.filter(a => !a.displayProperties.name.toLowerCase().includes("ordeal"));

	var weeklyOrdeals = weeklyNightfalls.filter(a => a.displayProperties.name.toLowerCase().includes("ordeal"));

	var flashpointMilestone = Object.values(definitions.milestone).filter(md => md.friendlyName == "Hotspot")[0];
	var flashpointQuest = milestoneInfo[flashpointMilestone.hash].availableQuests[0].questItemHash;
	var flashpoint = definitions.milestone[flashpointMilestone.hash].quests[flashpointQuest];

	// TODO: crucible rotators, zero hour, whisper, vendors (xur, spider)

	var today = moment();
	var start = moment("20200714");
	var weekDiff = today.diff(start, "week");
	var dayDiff = today.diff(start, "day");

	var activityInfo = {
		current: {
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

	if (user) {
		for (let category in wishlist) {
			let values = wishlist[category].values;
			for (let v in wishlist[category].values) {
				await wishlist[category].setNeeded(values[v], profileInfo, definitions);
				//debugger;
			}
		}
	}

	activityInfo.wishlist = wishlist;

	return activityInfo;

}

module.exports = getActivityInfo;