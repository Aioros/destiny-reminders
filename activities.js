const moment = require("moment");

const helpers = require("./helpers.js");
const apiConfig = require("./apiConfig.js");

function pickByDateDiff(arr, diff) {
	return arr[diff % arr.length];
}

async function getActivityInfo(user) {
	var wishlist = require("./wishlist.js")();

	var vendorInfo;
	var banshee, bansheeAllItems, bansheeMods, bansheeSales, availableBanshee;
	var spider, spiderAllItems, spiderBounties, spiderSales, availableSpider;
	var [
		activityData,
		//milestoneInfo,
		vendorStuff,
		//flashpointMilestone,
		profileNeededStuff
	] = await Promise.all([
		helpers.getActivityInfo()
			.then(avActivityInfo => avActivityInfo.map(a => a.activityHash))
			.then(helpers.getActivityData),
		//helpers.getMilestoneInfo(),
		Promise.all([
				helpers.getVendorInfo(),
				helpers.getDefinitionsByField("vendor", "$.displayProperties.name", ["Banshee-44", "Spider"])
			]).then(result => {
				vendorInfo = result[0];
				banshee = result[1].find(v => v.name == "Banshee-44").data;
				bansheeAllItems = banshee.itemList;
				bansheeSales = vendorInfo.sales.data[banshee.hash].saleItems;
				spider = result[1].find(v => v.name == "Spider").data;
				spiderAllItems = spider.itemList;
				spiderSales = vendorInfo.sales.data[spider.hash].saleItems;
			}).then(() => Promise.all([
				helpers.getItems(bansheeAllItems.map(i => i.itemHash), '% mod\"'),
				helpers.getItems(
					spiderAllItems
						.filter(i => ["Wanted Bounties", "Material Exchange"].includes(i.displayCategory))
						.map(i => i.itemHash)
				)
			])).then(result => {
				bansheeMods = result[0];
				availableBanshee = bansheeMods
					.filter(mod => Object.values(bansheeSales).find(s => s.itemHash == mod.hash))
					.map(m => m.name);
				wishlist.banshee.values = bansheeMods.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.banshee.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
				spiderMatsAndBounties = result[1];
				availableSpider = spiderMatsAndBounties
					.filter(mb => Object.values(spiderSales).find(s => s.itemHash == mb.hash))
					.map(m => m.name);
				wishlist.spider.values = spiderMatsAndBounties.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.spider.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
			}),
		//helpers.getDefinitionByField("milestone", "$.friendlyName", "Hotspot"),
		!user ? {} : helpers.getProfileInfo(user)
			.then(profileInfo => Promise.all(Object.values(wishlist).map(c => c.setNeeded(profileInfo))))
	]);

	var availableActivities = activityData.map(data => 
		Object.assign(data.activityData, {activityTypeName: data.activityTypeData.displayProperties.name})
	);

	//var dailyHeroicMissions = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("story mission"));

	//var dailyForge = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("forge"));
	
	var weeklyNightmareHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightmare hunt"));

	var weeklyNightfalls = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightfall"));

	//var weeklyLegacyNFs = weeklyNightfalls.filter(a => !a.displayProperties.name.toLowerCase().includes("ordeal"));

	var weeklyOrdeals = weeklyNightfalls.filter(a => a.displayProperties.name.toLowerCase().includes("ordeal"));

	//var flashpointQuest = milestoneInfo[flashpointMilestone.hash].availableQuests[0].questItemHash;
	//var flashpoint = flashpointMilestone.quests[flashpointQuest];

	var weeklyEmpireHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("empire hunt"));

	var weeklyExoChallenges = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("simulation:"));

	// TODO: crucible rotators, vendors (xur, spider)

	var today = moment();
	var start = moment("2020-07-14 17Z");
	var weekDiff = today.diff(start, "week");
	var dayDiff = today.diff(start, "day");

	var activityInfo = {
		current: {
			lostSectors: [
				{
					level: "legend",
					sector: pickByDateDiff(wishlist.lostSectors.values.sector, dayDiff).name,
					reward: pickByDateDiff(wishlist.lostSectors.values.reward, dayDiff).name
				},
				{
					level: "master",
					sector: pickByDateDiff(wishlist.lostSectors.values.sector, dayDiff-1).name,
					reward: pickByDateDiff(wishlist.lostSectors.values.reward, dayDiff-1).name
				}
			],
			banshee: availableBanshee,
			spider: availableSpider,
			nightmareHunts: [...new Set(weeklyNightmareHunts.map(n => n.displayProperties.description))],
			ordeals: weeklyOrdeals[0].displayProperties.description,
			curses: pickByDateDiff(wishlist.curses.values, weekDiff).name,
			ascendantChallenges: pickByDateDiff(wishlist.ascendantChallenges.values, weekDiff).name,
			blindWell: pickByDateDiff(wishlist.blindWell.values, weekDiff).name,
			altars: pickByDateDiff(wishlist.altars.values, dayDiff).name,
			wanderingNightmares: pickByDateDiff(wishlist.wanderingNightmares.values, weekDiff).name,
			empireHunts: weeklyEmpireHunts[0].displayProperties.description,
			exoChallenges: weeklyExoChallenges[0].displayProperties.name,
			augments: pickByDateDiff(wishlist.augments.values, weekDiff).name
			//contact: wishlist.contact.values[weekDiff % wishlist.contact.values.length].name,
			//interference: 'final encounter',//wishlist.interference.values[weekDiff % wishlist.interference.values.length].name,
			//dailyMissions: dailyHeroicMissions.map(s => s.displayProperties.name),
			//forges: dailyForge[0].displayProperties.name,
			//nightfalls: weeklyLegacyNFs.map(n => n.displayProperties.name),
			//flashpoints: flashpoint.displayProperties.name,
			//escalationProtocol: wishlist.escalationProtocol.values[weekDiff % wishlist.escalationProtocol.values.length].name,
			//reckoning: wishlist.reckoning.values[weekDiff % wishlist.reckoning.values.length].name,
			//menagerie: wishlist.menagerie.values[weekDiff % wishlist.menagerie.values.length].name,
			//whisper: wishlist.whisper.values[weekDiff % wishlist.whisper.values.length].name,
			//zeroHour: wishlist.zeroHour.values[weekDiff % wishlist.zeroHour.values.length].name
		}
	};

	activityInfo.wishlist = wishlist;

	return activityInfo;

}

module.exports = getActivityInfo;