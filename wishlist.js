const helpers = require("./helpers.js");

module.exports = () => ({

	banshee: {
		vendor: true,
		description: "banshee-44",
		frequency: "daily",
		values: [],
		setNeeded: function() {}
	},

	contact: {
		description: "contact boss",
		frequency: "weekly",
		values: [
			{name: "taken howler", neededFor: [{type: "objective", name: "contact: heavy hitters", value: false}]},
			{name: "taken pyromaster", neededFor: [{type: "objective", name: "contact: heavy hitters", value: false}]},
			{name: "taken monstrosity", neededFor: [{type: "objective", name: "contact: heavy hitters", value: false}]}
		],
		setNeeded: async function(profileInfo) {
			var hhRecord = await helpers.getDefinitionByName("record", this.values[0].neededFor[0].name);
			var hhObjectives = await Promise.all(this.values.map(value => 
				helpers.getDefinitionByField("objective", "$.progressDescription", value.name)
			));
			hhObjectives.forEach((hhObjective, i) => {
				this.values[i].neededFor[0].value = !(
					profileInfo.records[hhRecord.hash].objectives.find(
						o => o.objectiveHash == hhObjective.hash
					).complete
				);
			});
		}
	},

	interference: {
		description: "interference",
		frequency: "weekly",
		values: [
			{name: "crystal encounter", neededFor: [{type: "objective", name: "interference: loop", value: false}]},
			{name: "ritual encounter", neededFor: [{type: "objective", name: "interference: loop", value: false}]},
			{name: "relic encounter", neededFor: [{type: "objective", name: "interference: loop", value: false}]}
		],
		setNeeded: async function(profileInfo) {
			var ilRecord = await helpers.getDefinitionByName("record", this.values[0].neededFor[0].name);
			var ilObjectives = await Promise.all(this.values.map(value => 
				helpers.getDefinitionByField("objective", "$.progressDescription", value.name)
			));
			ilObjectives.forEach((ilObjective, i) => {
				this.values[i].neededFor[0].value = !(
					profileInfo.records[ilRecord.hash].objectives.find(
						o => o.objectiveHash == ilObjective.hash
					).complete
				);
			});
		}
	},

	dailyMissions: {
		description: "daily heroic story mission",
		frequency: "daily",
		values: [
			{
				name: "ace in the hole",
				neededFor: [{
					type: "book",
					name: "the man they called cayde",
					value: false
				}]
			},
			{
				name: "the machinist",
				neededFor: [{
					type: "lore",
					name: "the chosen's choice",
					value: false
				}]
			},
			{
				name: "chosen",
				neededFor: [{
					type: "triumph",
					name: "ghaul: heroic",
					value: false
				}]
			},
			{
				name: "omega",
				neededFor: [{
					type: "triumph",
					name: "panoptes: heroic",
					value: false
				}]
			},
			{
				name: "nothing left to say",
				neededFor: [{
					type: "triumph",
					name: "\"you're not my sister!\"",
					value: false
				}]
			}
		],
		setNeeded: async function(profileInfo) {
			var records = await Promise.all(this.values.map(value => helpers.getDefinitionByName("record", value.neededFor[0].name)));
			records.forEach((record, i) => {
				this.values[i].neededFor[0].value = profileInfo.records[record.hash].state % 4 == 0;
			});
		}
	},

	forges: {
		description: "black armory forge",
		frequency: "daily",
		values: [
			{name: "volundr", neededFor: [{value: false}]},
			{name: "gofannon", neededFor: [{value: false}]},
			{name: "izanami", neededFor: [{value: false}]},
			{name: "bergusia", neededFor: [{value: false}]}
		],
		setNeeded: function() {
			return false;
		}
	},

	nightmareHunts: {
		description: "nightmare hunt",
		frequency: "weekly",
		values: [
			{
				name: "crota",
				neededFor: [{
					type: "triumph",
					name: "time trial: despair",
					value: false
				}]
			},
			{
				name: "zydron",
				neededFor: [{
					type: "triumph",
					name: "time trial: servitude",
					value: false
				}]
			},
			{
				name: "phogoth",
				neededFor: [{
					type: "triumph",
					name: "time trial: fear",
					value: false
				}]
			},
			{
				name: "skolas",
				neededFor: [{
					type: "triumph",
					name: "time trial: pride",
					value: false
				}]
			},
			{
				name: "omnigul",
				neededFor: [{
					type: "triumph",
					name: "time trial: anguish",
					value: false
				}]
			},
			{
				name: "ghaul",
				neededFor: [{
					type: "triumph",
					name: "time trial: rage",
					value: false
				}]
			},
			{
				name: "the fanatic",
				neededFor: [{
					type: "triumph",
					name: "time trial: insanity",
					value: false
				}]
			},
			{
				name: "taniks",
				neededFor: [{
					type: "triumph",
					name: "time trial: isolation",
					value: false
				}]
			}
		],
		setNeeded: async function(profileInfo) {
			var records = await Promise.all(this.values.map(value => helpers.getDefinitionByName("record", value.neededFor[0].name)));
			records.forEach((record, i) => {
				this.values[i].neededFor[0].value = profileInfo.records[record.hash].state % 4 == 0;
			});
		}
	},

	nightfalls: {
		description: "nightfall",
		frequency: "weekly",
		values: [
			{
				name: "the arms dealer",
				neededFor: [{
					type: "item",
					name: "tilt fuse",
					value: false
				}]
			},
			{
				name: "lake of shadows",
				neededFor: [{
					type: "item",
					name: "the militia's birthright",
					value: false
				}]
			},
			{
				name: "savathûn's song",
				neededFor: [{
					type: "item",
					name: "duty bound",
					value: false
				}]
			},
			{
				name: "exodus crash",
				neededFor: [{
					type: "item",
					name: "impact velocity",
					value: false
				}]
			},
			{
				name: "the inverted spire",
				neededFor: [{
					type: "item",
					name: "trichromatica",
					value: false
				}]
			},
			{
				name: "the pyramidion",
				neededFor: [{
					type: "item",
					name: "silicon neuroma",
					value: false
				}]
			},
			{
				name: "tree of probabilities",
				neededFor: [{
					type: "item",
					name: "D.F.A.",
					value: false
				}]
			},
			{
				name: "a garden world",
				neededFor: [{
					type: "item",
					name: "universal wavefunction",
					value: false
				}]
			},
			{
				name: "strange terrain",
				neededFor: [{
					type: "item",
					name: "braytech osprey",
					value: false
				}]
			},
			{
				name: "will of the thousands",
				neededFor: [{
					type: "item",
					name: "worm god incarnation",
					value: false
				}]
			},
			{
				name: "the insight terminus",
				neededFor: [{
					type: "item",
					name: "the long goodbye",
					value: false
				}]
			},
			{
				name: "warden of nothing",
				neededFor: [{
					type: "item",
					name: "warden's law",
					value: false
				}]
			},
			{
				name: "broodhold",
				neededFor: [{
					type: "item",
					name: "",
					value: false
				}]
			},
			{
				name: "the hollowed lair",
				neededFor: [{
					type: "item",
					name: "mindbender's ambition",
					value: false
				}]
			},
			{
				name: "the corrupted",
				neededFor: [{
					type: "item",
					name: "horror's least",
					value: false
				}]
			},
			{
				name: "the scarlet keep",
				neededFor: [{
					type: "item",
					name: "",
					value: false
				}]
			},
			{
				name: "the festering core",
				neededFor: [{
					type: "item",
					name: "",
					value: false
				}]
			}
		],
		setNeeded: async function(profileInfo) {
			var collectibles = await Promise.all(this.values.map(value => 
				!value.neededFor[0].name ? null : helpers.getDefinitionByName("collectible", value.neededFor[0].name)
			));
			collectibles.forEach((collectible, i) => {
				this.values[i].neededFor[0].value = !this.values[i].neededFor[0].name ? false : profileInfo.collectibles[collectible.hash].state % 2 != 0;
			});
		}
	},

	ordeals: {
		description: "nightfall: the ordeal",
		frequency: "weekly",
		values: [
			{
				name: "the arms dealer",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the arms dealer",
					value: false
				}]
			},
			{
				name: "lake of shadows",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: lake of shadows",
					value: false
				}]
			},
			{
				name: "savathûn's song",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: savathûn's song",
					value: false
				}]
			},
			{
				name: "exodus crash",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: exodus crash",
					value: false
				}]
			},
			{
				name: "the inverted spire",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the inverted spire",
					value: false
				}]
			},
			{
				name: "the pyramidion",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the pyramidion",
					value: false
				}]
			},
			{
				name: "tree of probabilities",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: tree of probabilities",
					value: false
				}]
			},
			{
				name: "a garden world",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: a garden world",
					value: false
				}]
			},
			{
				name: "strange terrain",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: strange terrain",
					value: false
				}]
			},
			{
				name: "the insight terminus",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the insight terminus",
					value: false
				}]
			},
			{
				name: "warden of nothing",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: warden of nothing",
					value: false
				}]
			},
			{
				name: "broodhold",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: broodhold",
					value: false
				}]
			},
			{
				name: "the corrupted",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the corrupted",
					value: false
				}]
			},
			{
				name: "the scarlet keep",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the scarlet keep"
				}]
			},
			{
				name: "the festering core",
				neededFor: [{
					type: "triumph",
					name: "grandmaster: the festering core",
					value: false
				}]
			}
		],
		setNeeded: async function(profileInfo) {
			var records = await Promise.all(this.values.map(value => helpers.getDefinitionByName("record", value.neededFor[0].name)));
			records.forEach((record, i) => {
				if (!record) {
					this.values[i].neededFor[0].value = false;
				} else {
					this.values[i].neededFor[0].value = profileInfo.records[record.hash].state % 4 == 0;
				}
			});
		}
	},

	flashpoints: {
		description: "flashpoint",
		frequency: "weekly",
		values: [
			{name: "EDZ", neededFor: [{value: false}]},
			{name: "nessus", neededFor: [{value: false}]},
			{name: "tangled shore", neededFor: [{
				type: "book",
				name: "the tangled shore",
				value: false
			}]},
			{name: "io", neededFor: [{value: false}]},
			{name: "mercury", neededFor: [{value: false}]},
			{name: "titan", neededFor: [{value: false}]},
			{name: "mars", neededFor: [{value: false}]}
		],
		setNeeded: async function(profileInfo) {
			var value = this.values.find(v => v.name == "tangled shore");
			var ttsRecord = await helpers.getDefinitionByName("record", value.neededFor[0].name);
			value.neededFor[0].value = profileInfo.records[ttsRecord.hash].state % 4 == 0;
		}
	},

	curses: {
		description: "dreaming city's curse",
		frequency: "weekly",
		values: [
			{name: "weak", neededFor: [{value: false}]},
			{name: "growing", neededFor: [{value: false}]},
			{
				name: "strong",
				neededFor: [{
					type: "book",
					name: "truth to power",
					value: false
				}]
			}
		],
		setNeeded: async function(profileInfo) {
			var value = this.values.find(v => v.name == "strong");
			var ttpRecord = await helpers.getDefinitionByName("record", value.neededFor[0].name);
			value.neededFor[0].value = profileInfo.records[ttpRecord.hash].state % 4 == 0;
		}
	},

	ascendantChallenges: {
		description: "ascendant challenge",
		frequency: "weekly",
		values: [
			{
				name: "forfeit shrine (gardens of esila)",
				neededFor: [
					{type: "triumph", name: "never forfeit", value: false},
					{type: "lore", name: "heresiology", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1084474590,
						1034141726
					]}
				]
			},
			{
				name: "shattered ruins (spine of keres)",
				neededFor: [
					{type: "triumph", name: "shatter that record", value: false},
					{type: "lore", name: "ecstasiate I", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1084474583,
						1067697005
					]}
				]
			},
			{
				name: "keep of honed edges (harbinger's seclude)",
				neededFor: [
					{type: "triumph", name: "honed for speed", value: false},
					{type: "lore", name: "ecstasiate II", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1084474579,
						1084474578
					]}
				]
			},
			{
				name: "agonarch abyss (bay of drowned wishes)",
				neededFor: [
					{type: "triumph", name: "agonarch agony", value: false},
					{type: "lore", name: "cosmogyre IV", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1084474580,
						1084474582,
						1084474581
					]}
				]
			},
			{
				name: "cimmerian garrison (chamber of starlight)",
				neededFor: [
					{type: "triumph", name: "run the gauntlet", value: false},
					{type: "lore", name: "brephos III", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1067696994,
						1067697004,
						1067696995
					]}
				]
			},
			{
				name: "ouroborea (aphelion's rest)",
				neededFor: [
					{type: "triumph", name: "eating your own tail", value: false},
					{type: "lore", name: "imponent I", value: false},
					{type: "eggs", name: "corrupted eggs", value: false, checklist: [
						1084474577,
						1084474591,
						1084474576
					]}
				]
			}
		],
		setNeeded: async function(profileInfo) {
			var [triumphs, lores, eggsChecklist] = await Promise.all([
				Promise.all(this.values.map(value => 
					helpers.getDefinitionByName("record", value.neededFor[0].name)
				)),
				Promise.all(this.values.map(value => 
					helpers.getDefinitionByName("record", value.neededFor[1].name)
				)),
				helpers.getDefinitionByName("checklist", "corrupted eggs")
			]);
			this.values.forEach((value, i) => {
				value.neededFor[0].value = profileInfo.records[triumphs[i].hash].state % 4 == 0;
				value.neededFor[1].value = profileInfo.records[lores[i].hash].state % 4 == 0;
				var missingEggs = value.neededFor[2].checklist.filter(egg => !profileInfo.checklists[eggsChecklist.hash][egg]);
				value.neededFor[2].value = missingEggs.length > 0;
				value.neededFor[2].name = "corrupted eggs (" + missingEggs.length + ")";
			});
		}
	},
	
	blindWell: {
		description: "blind well boss",
		frequency: "weekly",
		values: [
			{name: "sikariis and varkuuriis", neededFor: [{
				type: "triumph",
				name: "the scorn champion",
				value: false
			}]},
			{name: "cragur", neededFor: [{
				type: "triumph",
				name: "the hive champion",
				value: false
			}]},
			{name: "inomina", neededFor: [{
				type: "triumph",
				name: "the taken champion",
				value: false
			}]}
		],
		setNeeded: async function(profileInfo) {
			var records = await Promise.all(this.values.map(value => helpers.getDefinitionByName("record", value.neededFor[0].name)));
			records.forEach((record, i) => {
				this.values[i].neededFor[0].value = profileInfo.records[record.hash].state % 4 == 0;
			});
		}
	},

	escalationProtocol: {
		description: "escalation protocol",
		frequency: "weekly",
		values: [
			{name: "bok litur (all weapons)", neededFor: [{
				type: "item",
				name: "",
				value: false
			}]},
			{name: "nur abath (shotgun)", neededFor: [{
				type: "item",
				name: "IKELOS_SG_v1.0.1",
				value: false
			}]},
			{name: "kathok (SMG)", neededFor: [{
				type: "item",
				name: "IKELOS_SMG_v1.0.1",
				value: false
			}]},
			{name: "damkath (sniper rifle)", neededFor: [{
				type: "item",
				name: "IKELOS_SR_v1.0.1",
				value: false
			}]},
			{name: "naksud (all weapons)", neededFor: [{
				type: "item",
				name: "",
				value: false
			}]},
		],
		setNeeded: async function(profileInfo) {
			var collectibles = await Promise.all(this.values.map(value => 
				!value.neededFor[0].name ? null : helpers.getDefinitionByName("collectible", value.neededFor[0].name)
			));
			collectibles.forEach((collectible, i) => {
				this.values[i].neededFor[0].value = !this.values[i].neededFor[0].name ? false : profileInfo.collectibles[collectible.hash].state % 2 != 0;
			});
		}
	},

	reckoning: {
		description: "reckoning boss",
		frequency: "weekly",
		values: [
			{name: "likeness of oryx", neededFor: [
				{type: "objective", name: "one skip ahead", value: false},
				{type: "triumph", name: "isn't he dead?", value: false}
			]},
			{name: "swords", neededFor:
				[{type: "objective", name: "one skip ahead", value: false}]
			}
		],
		setNeeded: async function(profileInfo) {
			var [oneSkipAhead, isntHeDead] = await Promise.all([
				helpers.getDefinitionByName("record", "one skip ahead"),
				helpers.getDefinitionByName("record", "isn't he dead?")
			]);
			var objectives = await Promise.all(this.values.map(value =>
				helpers.getDefinitionByField("objective", "$.progressDescription", value.name + " defeated", false)
			));
			objectives.forEach((objective, i) => {
				this.values[i].neededFor[0].value = !(profileInfo.records[oneSkipAhead.hash].objectives.find(o => o.objectiveHash == objective.hash).complete);
			});
			this.values[0].neededFor[1].value = profileInfo.records[isntHeDead.hash].state % 4 == 0;
		}
	},

	menagerie: {
		description: "menagerie boss",
		frequency: "weekly",
		values: [
			{name: "arunak", neededFor: [
				{type: "triumph", name: "prize(d) fighter", value: false},
				{type: "triumph", name: "eyes only for you", value: false},
				{type: "triumph", name: "uncontrolled rage", value: false},
				{type: "item", name: "truth", value: false}
			]},
			{name: "pagouri", neededFor: [
				{type: "triumph", name: "sweet and shy", value: false},
				{type: "triumph", name: "lambs to the slaughter", value: false},
				{type: "triumph", name: "come out and play", value: false}
			]},
			{name: "hasapiko", neededFor: [
				{type: "triumph", name: "flair for drama", value: false},
				{type: "triumph", name: "break a leg", value: false},
				{type: "triumph", name: "divided we conquer", value: false}
			]}
		],
		setNeeded: async function(profileInfo) {
			var triumphs = this.values.reduce((acc, cur) => {
				return acc.concat(cur.neededFor.filter(f => f.type == "triumph").map(t => t.name))
			}, []);
			var [triumphs, truth] = await Promise.all([
				Promise.all(triumphs.map(t => helpers.getDefinitionByName("record", t))),
				helpers.getDefinitionByName("collectible", "truth")
			]);
			this.values.forEach(value => {
				value.neededFor.filter(f => f.type == "triumph").forEach(f => {
					f.value = profileInfo.records[triumphs.find(t => t.displayProperties.name.toLowerCase() == f.name).hash].state % 4 == 0;
				});
			});
			this.values[0].neededFor[3].value = profileInfo.collectibles[truth.hash].state % 2 != 0;
		}
	},

	altars: {
		description: "altars of sorrow weapon",
		frequency: "daily",
		values: [
			{name: "apostate", neededFor: [{
				type: "item",
				name: "apostate",
				value: false
			}]},
			{name: "heretic", neededFor: [{
				type: "item",
				name: "heretic",
				value: false
			}]},
			{name: "blasphemer", neededFor: [{
				type: "item",
				name: "blasphemer",
				value: false
			}]},
		],
		setNeeded: async function(profileInfo) {
			var collectibles = await Promise.all(this.values.map(value => 
				helpers.getDefinitionByName("collectible", value.neededFor[0].name)
			));
			collectibles.forEach((collectible, i) => {
				this.values[i].neededFor[0].value = profileInfo.collectibles[collectible.hash].state % 2 != 0;
			});
		}
	},

	wanderingNightmares: {
		description: "wandering nightmare",
		frequency: "weekly",
		values: [
			{name: "horkis", neededFor: [{type: "objective", name: "wandering nightmares", value: false}]},
			{name: "jaxx", neededFor: [{type: "objective", name: "wandering nightmares", value: false}]},
			{name: "fallen council", neededFor: [{type: "objective", name: "wandering nightmares", value: false}]},
			{name: "xortal", neededFor: [{type: "objective", name: "wandering nightmares", value: false}]}
		],
		setNeeded: async function(profileInfo) {
			var wnRecord = await helpers.getDefinitionByName("record", this.values[0].neededFor[0].name);
			var wnObjectives = await Promise.all(this.values.map(value => 
				helpers.getDefinitionByField("objective", "$.progressDescription", value.name, false)
			));
			wnObjectives.forEach((wnObjective, i) => {
				this.values[i].neededFor[0].value = !(
					profileInfo.records[wnRecord.hash].objectives.find(
						o => o.objectiveHash == wnObjective.hash
					).complete
				);
			});
		}
	},

	whisper: {
		description: "the whisper (heroic)",
		frequency: "weekly",
		values: [
			{name: "solar singe", neededFor: [{value: false}]},
			{name: "void singe", neededFor: [{value: false}]},
			{name: "arc singe", neededFor: [{value: false}]}
		],
		setNeeded: function() {}
	},

	zeroHour: {
		description: "zero hour (heroic)",
		frequency: "weekly",
		values: [
			{name: "solar singe", neededFor: [{value: false}]},
			{name: "void singe", neededFor: [{value: false}]},
			{name: "arc singe", neededFor: [{value: false}]}
		],
		setNeeded: function() {}
	}
});