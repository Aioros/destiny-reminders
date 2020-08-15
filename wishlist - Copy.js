const helpers = require("./helpers.js");

module.exports = {

	dailyMissions: {
		description: "daily heroic story mission",
		frequency: "daily",
		values: [
			"ace in the hole",
			"the machinist",
			"chosen",
			"omega",
			"nothing left to say"
		],
		isNeeded: function() {
			return false;
		}
	},

	forges: {
		description: "black armory forge",
		frequency: "daily",
		values: [
			"volundr",
			"gofannon",
			"izanami",
			"bergusia"
		],
		isNeeded: function() {
			return false;
		}
	},

	nightmareHunts: {
		description: "nightmare hunt",
		frequency: "weekly",
		values: [
			"crota",
			"zydron",
			"phogoth",
			"skolas",
			"omnigul",
			"ghaul",
			"the fanatic",
			"taniks"
		],
		isNeeded: function() {
			return false;
		}
	},

	nightfalls: {
		description: "nightfall",
		frequency: "weekly",
		values: [
			"the arms dealer",
			"lake of shadows",
			"savathûn's song",
			"exodus crash",
			"the inverted spire",
			"the pyramidion",
			"tree of probabilities",
			"a garden world",
			"strange terrain",
			"will of the thousands",
			"the insight terminus",
			"warden of nothing",
			"broodhold",
			"the hollowed lair",
			"the corrupted",
			"the scarlet keep",
			"the festering core"
		],
		isNeeded: function() {
			return false;
		}
	},

	ordeals: {
		description: "nightfall: the ordeal",
		frequency: "weekly",
		values: [
			"the arms dealer",
			"lake of shadows",
			"savathûn's song",
			"exodus crash",
			"the inverted spire",
			"the pyramidion",
			"tree of probabilities",
			"a garden world",
			"strange terrain",
			"the insight terminus",
			"warden of nothing",
			"broodhold",
			"the corrupted",
			"the scarlet keep",
			"the festering core"
		],
		isNeeded: function() {
			return false;
		}
	},

	flashpoints: {
		description: "flashpoint",
		frequency: "weekly",
		values: ["EDZ", "nessus", "tangled shore", "io", "mercury", "titan", "mars"],
		isNeeded: function() {
			return false;
		}
	},

	curses: {
		description: "dreaming city's curse",
		frequency: "weekly",
		values: ["weak", "growing", "strong"],
		isNeeded: function() {
			return false;
		}
	},

	ascendantChallenges: {
		description: "ascendant challenge",
		frequency: "weekly",
		values: [
			"forfeit shrine (gardens of esila)",
			"shattered ruins (spine of keres)",
			"keep of honed edges (harbinger's seclude)",
			"agonarch abyss (bay of drowned wishes)",
			"cimmerian garrison (chamber of starlight)",
			"ouroborea (aphelion's rest)"
		],
		isNeeded: function() {
			return false;
		}
	},
	
	blindWell: {
		description: "blind well boss",
		frequency: "weekly",
		values: ["sikariis and varkuuriis", "cragur", "inomina"],
		isNeeded: function() {
			return false;
		}
	},

	escalationProtocol: {
		description: "escalation protocol",
		frequency: "weekly",
		values: [
			"bok litur (all weapons)",
			"nur abath (shotgun)",
			"kathok (SMG)",
			"damkath (sniper rifle)",
			"naksud (all weapons)"
		],
		isNeeded: function() {
			return false;
		}
	},

	reckoning: {
		description: "reckoning boss",
		frequency: "weekly",
		values: ["likeness of oryx", "the swords"],
		isNeeded: function() {
			return false;
		}
	},

	menagerie: {
		description: "menagerie boss",
		frequency: "weekly",
		values: ["arunak", "pagouri", "hasapiko"],
		isNeeded: function() {
			return false;
		}
	},

	altars: {
		description: "altars of sorrow weapon",
		frequency: "daily",
		values: ["apostate", "heretic", "blasphemer"],
		isNeeded: function() {
			return false;
		}
	},

	wanderingNightmares: {
		description: "wandering nightmare",
		frequency: "weekly",
		values: ["horkis", "jaxx", "fallen council", "xortal"],
		isNeeded: function(value, profileInfo) {
			var definitions = helpers.getDefinitions();
			wnRecord = Object.values(definitions.record).find(
				r => r.displayProperties.name == "Wandering Nightmares"
			).hash;
			wnObjective = Object.values(definitions.objective).find(
				o => o.progressDescription.toLowerCase().includes(wanderingNightmare.name)
			).hash;
			return profileInfo.records[wnRecord].objectives.find(o => o.objectiveHash == wnObjective).complete;
		}
	}
};