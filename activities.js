const moment = require("moment");

const helpers = require("./helpers.js");
const apiConfig = require("./apiConfig.js");

function pickByDateDiff(arr, diff) {
	return arr[diff % arr.length];
}

async function getActivityInfo(user) {
	var wishlist = require("./wishlist.js")();

	var vendorInfo;
	var ada, adaAllItems, adaMods, adaSales, availableAda;
	var banshee, bansheeAllItems, bansheeMods, bansheeSales, availableBanshee;
	var spider, spiderAllItems, spiderMatsAndBounties, spiderSales, availableSpider;
	var xur, xurAllItems, xurExotics, xurSales, availableXur;
	var [
		activityData,
		nightfallActivity,
		vendorStuff,
		profileNeededStuff
	] = await Promise.all([
		helpers.getActivityInfo()
			.then(avActivityInfo => avActivityInfo.map(a => a.activityHash))
			.then(helpers.getActivityData),
		Promise.all([
				helpers.getMilestoneInfo(),
				helpers.getDefinitionByField("milestone", "$.friendlyName", "MILESTONE_WEEKLY_NIGHTFALL"),
			]).then(result => {
				var [milestoneInfo, nightfallMilestone] = result;
				var nfMilestone = milestoneInfo[nightfallMilestone.hash];
				return helpers.getDefinition("activity", nfMilestone.activities[0].activityHash);
			}),
		Promise.all([
				helpers.getVendorInfo(),
				helpers.getDefinitionsByField("vendor", "$.displayProperties.name", ["Ada-1", "Banshee-44", "Spider", "Xûr"])
			]).then(result => {
				vendorInfo = result[0];
				ada = result[1].find(v => v.name == "Ada-1").data;
				adaAllItems = ada.itemList;
				adaSales = vendorInfo.sales.data[ada.hash].saleItems;
				banshee = result[1].find(v => v.name == "Banshee-44").data;
				bansheeAllItems = banshee.itemList;
				bansheeSales = vendorInfo.sales.data[banshee.hash].saleItems;
				spider = result[1].find(v => v.name == "Spider").data;
				spiderAllItems = spider.itemList;
				spiderSales = vendorInfo.sales.data[spider.hash].saleItems;
				xur = result[1].find(v => v.name == "Xûr").data;
				xurAllItems = xur.itemList;
				xurSales = vendorInfo.sales.data[xur.hash].saleItems;
			}).then(() => Promise.all([
				helpers.getItems(adaAllItems.map(i => i.itemHash), '% mod\"'),
				helpers.getItems(bansheeAllItems.map(i => i.itemHash), '% mod\"'),
				helpers.getItems(
					spiderAllItems
						.filter(i => ["Wanted Bounties", "Material Exchange"].includes(i.displayCategory))
						.map(i => i.itemHash)
				),
				helpers.getItems(
					xurAllItems
						.filter(i => i.displayCategory != "Exotic Ciphers")
						.map(i => i.itemHash)
						, '\"exotic %'
				)
			])).then(result => {
				adaMods = result[0];
				availableAda = adaMods
					.filter(mod => Object.values(adaSales).find(s => s.itemHash == mod.hash))
					.map(m => m.name);
				wishlist.ada.values = adaMods.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.ada.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
				bansheeMods = result[1];
				availableBanshee = bansheeMods
					.filter(mod => Object.values(bansheeSales).find(s => s.itemHash == mod.hash))
					.map(m => m.name);
				wishlist.banshee.values = bansheeMods.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.banshee.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
				spiderMatsAndBounties = result[2];
				availableSpider = spiderMatsAndBounties
					.filter(mb => Object.values(spiderSales).find(s => s.itemHash == mb.hash))
					.map(m => m.name);
				wishlist.spider.values = spiderMatsAndBounties.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.spider.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
				xurExotics = result[3];
				availableXur = xurExotics
					.filter(ex => Object.values(xurSales).find(s => s.itemHash == ex.hash))
					.map(m => m.name)
					.filter(ex => ex.toLowerCase() != 'exotic engram');
				wishlist.xur.values = xurExotics.map(m => ({name: m.name, neededFor: [{value: false}]}));
				wishlist.xur.values.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
			}),
		!user ? {} : helpers.getProfileInfo(user)
			.then(profileInfo => Promise.all(Object.values(wishlist).map(c => c.setNeeded(profileInfo))))
	]);

	var availableActivities = activityData.map(data => 
		Object.assign(data.activityData, {activityTypeName: data.activityTypeData.displayProperties.name})
	);

	//var dailyHeroicMissions = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("story mission"));

	//var dailyForge = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("forge"));
	
	var weeklyNightmareHunts = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightmare hunt"));

	//var weeklyNightfalls = availableActivities.filter(a => a.displayProperties.name.toLowerCase().includes("nightfall"));

	//var weeklyLegacyNFs = weeklyNightfalls.filter(a => !a.displayProperties.name.toLowerCase().includes("ordeal"));

	//var weeklyOrdeals = weeklyNightfalls.filter(a => a.displayProperties.name.toLowerCase().includes("ordeal"));

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
			ada: availableAda,
			banshee: availableBanshee,
			spider: availableSpider,
			xur: availableXur,
			nightmareHunts: [...new Set(weeklyNightmareHunts.map(n => n.displayProperties.description))],
			ordeals: nightfallActivity.displayProperties.description,
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