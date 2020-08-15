const helpers = require("./helpers.js");

module.exports = {

	dailyMissions: {
		description: "daily heroic story mission",
		frequency: "daily",
		values: [
			{
				name: "ace in the hole",
				needed: {
					value: false,
					for: {
						type: "book",
						name: "the man they called cayde"
					}
				}
			},
			{
				name: "the machinist",
				needed: {
					value: false,
					for: {
						type: "lore",
						name: "the chosen's choice"
					}
				}
			},
			{
				name: "chosen",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "ghaul: heroic"
					}
				}
			},
			{
				name: "omega",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "panoptes: heroic"
					}
				}
			},
			{
				name: "nothing left to say",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "\"you're not my sister!\""
					}
				}
			}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.records[record].state % 4 == 0;
		}
	},

	forges: {
		description: "black armory forge",
		frequency: "daily",
		values: [
			{name: "volundr", needed: {value: false}},
			{name: "gofannon", needed: {value: false}},
			{name: "izanami", needed: {value: false}},
			{name: "bergusia", needed: {value: false}}
		],
		isNeeded: function() {
			return false;
		}
	},

	nightmareHunts: {
		description: "nightmare hunt",
		frequency: "weekly",
		values: [
			{
				name: "crota", needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: despair"
					}
				}
			},
			{
				name: "zydron",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: servitude"
					}
				}
			},
			{
				name: "phogoth",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: fear"
					}
				}
			},
			{
				name: "skolas",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: pride"
					}
				}
			},
			{
				name: "omnigul",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: anguish"
					}
				}
			},
			{
				name: "ghaul",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: rage"
					}
				}
			},
			{
				name: "the fanatic",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: insanity"
					}
				}
			},
			{
				name: "taniks",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "time trial: isolation"
					}
				}
			}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.records[record].state % 4 == 0;
		}
	},

	nightfalls: {
		description: "nightfall",
		frequency: "weekly",
		values: [
			{
				name: "the arms dealer",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Tilt Fuse"
					}
				}
			},
			{
				name: "lake of shadows",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "The Militia's Birthright"
					}
				}
			},
			{
				name: "savathûn's song",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Duty Bound"
					}
				}
			},
			{
				name: "exodus crash",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Impact Velocity"
					}
				}
			},
			{
				name: "the inverted spire",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Trichromatica"
					}
				}
			},
			{
				name: "the pyramidion",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Silicon Neuroma"
					}
				}
			},
			{
				name: "tree of probabilities",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "D.F.A."
					}
				}
			},
			{
				name: "a garden world",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Universal Wavefunction"
					}
				}
			},
			{
				name: "strange terrain",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Braytech Osprey"
					}
				}
			},
			{
				name: "will of the thousands",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Worm God Incarnation"
					}
				}
			},
			{
				name: "the insight terminus",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "the long goodbye"
					}
				}
			},
			{
				name: "warden of nothing",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Warden's Law"
					}
				}
			},
			{
				name: "broodhold",
				needed: {
					value: false,
					for: {
						type: "item",
						name: ""
					}
				}
			},
			{
				name: "the hollowed lair",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Mindbender's Ambition"
					}
				}
			},
			{
				name: "the corrupted",
				needed: {
					value: false,
					for: {
						type: "item",
						name: "Horror's Least"
					}
				}
			},
			{
				name: "the scarlet keep",
				needed: {
					value: false,
					for: {
						type: "item",
						name: ""
					}
				}
			},
			{
				name: "the festering core",
				needed: {
					value: false,
					for: {
						type: "item",
						name: ""
					}
				}
			}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			if (!value.needed.for.name)
				return false;
			var collectible = Object.values(definitions.collectible).find(
				c => c.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.collectibles[collectible].state % 2 != 0;
		}
	},

	ordeals: {
		description: "nightfall: the ordeal",
		frequency: "weekly",
		values: [
			{
				name: "the arms dealer",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the arms dealer"
					}
				}
			},
			{
				name: "lake of shadows",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: lake of shadows"
					}
				}
			},
			{
				name: "savathûn's song",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: savathûn's song"
					}
				}
			},
			{
				name: "exodus crash",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: exodus crash"
					}
				}
			},
			{
				name: "the inverted spire",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the inverted spire"
					}
				}
			},
			{
				name: "the pyramidion",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the pyramidion"
					}
				}
			},
			{
				name: "tree of probabilities",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: tree of probabilities"
					}
				}
			},
			{
				name: "a garden world",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: a garden world"
					}
				}
			},
			{
				name: "strange terrain",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: strange terrain"
					}
				}
			},
			{
				name: "the insight terminus",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the insight terminus"
					}
				}
			},
			{
				name: "warden of nothing",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: warden of nothing"
					}
				}
			},
			{
				name: "broodhold",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: broodhold"
					}
				}
			},
			{
				name: "the corrupted",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the corrupted"
					}
				}
			},
			{
				name: "the scarlet keep",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the scarlet keep"
					}
				}
			},
			{
				name: "the festering core",
				needed: {
					value: false,
					for: {
						type: "triumph",
						name: "grandmaster: the festering core"
					}
				}
			}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			);
			if (!record) return false;
			return profileInfo.records[record.hash].state % 4 == 0;
		}
	},

	flashpoints: {
		description: "flashpoint",
		frequency: "weekly",
		values: [
			{name: "EDZ", needed: {value: false}},
			{name: "nessus", needed: {value: false}},
			{name: "tangled shore", needed: {
				value: false,
				for: {
					type: "book",
					name: "the tangled shore"
				}
			}},
			{name: "io", needed: {value: false}},
			{name: "mercury", needed: {value: false}},
			{name: "titan", needed: {value: false}},
			{name: "mars", needed: {value: false}}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			if (value.name != "tangled shore") {
				return false;
			}
			var ttsRecord = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.records[ttsRecord].state % 4 == 0;
		}
	},

	curses: {
		description: "dreaming city's curse",
		frequency: "weekly",
		values: [
			{name: "weak", needed: {value: false}},
			{name: "growing", needed: {value: false}},
			{
				name: "strong",
				needed: {
					value: false,
					for: {
						type: "lore",
						name: "truth to power"
					}
				}
			}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			if (value.name != "strong") {
				return false;
			}
			var ttpRecord = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == "truth to power"
			).hash;
			return profileInfo.records[ttpRecord].state % 4 == 0;
		}
	},

	ascendantChallenges: {
		description: "ascendant challenge",
		frequency: "weekly",
		values: [
			{name: "forfeit shrine (gardens of esila)", needed: {value: false}},
			{name: "shattered ruins (spine of keres)", needed: {value: false}},
			{name: "keep of honed edges (harbinger's seclude)", needed: {value: false}},
			{name: "agonarch abyss (bay of drowned wishes)", needed: {value: false}},
			{name: "cimmerian garrison (chamber of starlight)", needed: {value: false}},
			{name: "ouroborea (aphelion's rest)", needed: {value: false}}
		],
		isNeeded: function() {
			return false;
		}
	},
	
	blindWell: {
		description: "blind well boss",
		frequency: "weekly",
		values: [
			{name: "sikariis and varkuuriis", needed: {
				value: false,
				for: {
					type: "triumph",
					name: "the scorn champion"
				}
			}},
			{name: "cragur", needed: {
				value: false,
				for: {
					type: "triumph",
					name: "the hive champion"
				}
			}},
			{name: "inomina", needed: {
				value: false,
				for: {
					type: "triumph",
					name: "the taken champion"
				}
			}}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			);
			if (!record) return false;
			return profileInfo.records[record.hash].state % 4 == 0;
		}
	},

	escalationProtocol: {
		description: "escalation protocol",
		frequency: "weekly",
		values: [
			{name: "bok litur (all weapons)", needed: {
				value: false,
				for: {
					type: "item",
					name: ""
				}
			}},
			{name: "nur abath (shotgun)", needed: {
				value: false,
				for: {
					type: "item",
					name: "IKELOS_SG_v1.0.1"
				}
			}},
			{name: "kathok (SMG)", needed: {
				value: false,
				for: {
					type: "item",
					name: "IKELOS_SMG_v1.0.1"
				}
			}},
			{name: "damkath (sniper rifle)", needed: {
				value: false,
				for: {
					type: "item",
					name: "IKELOS_SR_v1.0.1"
				}
			}},
			{name: "naksud (all weapons)", needed: {
				value: false,
				for: {
					type: "item",
					name: ""
				}
			}},
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			if (!value.needed.for.name)
				return false;
			var collectible = Object.values(definitions.collectible).find(
				c => c.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.collectibles[collectible].state % 2 != 0;
		}
	},

	reckoning: {
		description: "reckoning boss",
		frequency: "weekly",
		values: [
			{name: "likeness of oryx", needed: {
				value: false,
				for: {type: "triumph", name: "one skip ahead"}
			}},
			{name: "swords", needed: {
				value: false,
				for: {type: "triumph", name: "one skip ahead"}
			}}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			var objective = Object.values(definitions.objective).find(
				o => o.progressDescription.toLowerCase().includes(value.name + " defeated")
			).hash;
			return !(profileInfo.records[record].objectives.find(o => o.objectiveHash == objective).complete);
		}
	},

	menagerie: {
		description: "menagerie boss",
		frequency: "weekly",
		values: [
			{name: "arunak", needed: {
				value: false,
				for: {type: "triumph", name: "prize(d) fighter"}
			}},
			{name: "pagouri", needed: {
				value: false,
				for: {type: "triumph", name: "sweet and shy"}
			}},
			{name: "hasapiko", needed: {
				value: false,
				for: {type: "triumph", name: "flair for drama"}
			}}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var record = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			);
			if (!record) return false;
			return profileInfo.records[record.hash].state % 4 == 0;
		}
	},

	altars: {
		description: "altars of sorrow weapon",
		frequency: "daily",
		values: [
			{name: "apostate", needed: {
				value: false,
				for: {
					type: "item",
					name: "apostate"
				}
			}},
			{name: "heretic", needed: {
				value: false,
				for: {
					type: "item",
					name: "heretic"
				}
			}},
			{name: "blasphemer", needed: {
				value: false,
				for: {
					type: "item",
					name: "blasphemer"
				}
			}},
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			if (!value.needed.for.name)
				return false;
			var collectible = Object.values(definitions.collectible).find(
				c => c.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			return profileInfo.collectibles[collectible].state % 2 != 0;
		}
	},

	wanderingNightmares: {
		description: "wandering nightmare",
		frequency: "weekly",
		values: [
			{name: "horkis", needed: {
				value: false,
				for: {type: "triumph", name: "wandering nightmares"}
			}},
			{name: "jaxx", needed: {
				value: false,
				for: {type: "triumph", name: "wandering nightmares"}
			}},
			{name: "fallen council", needed: {
				value: false,
				for: {type: "triumph", name: "wandering nightmares"}
			}},
			{name: "xortal", needed: {
				value: false,
				for: {type: "triumph", name: "wandering nightmares"}
			}}
		],
		isNeeded: async function(value, profileInfo, definitions) {
			definitions = definitions || await helpers.getDefinitions();
			var wnRecord = Object.values(definitions.record).find(
				r => r.displayProperties.name.toLowerCase() == value.needed.for.name.toLowerCase()
			).hash;
			var wnObjective = Object.values(definitions.objective).find(
				o => o.progressDescription.toLowerCase().includes(value.name)
			).hash;
			return !(profileInfo.records[wnRecord].objectives.find(o => o.objectiveHash == wnObjective).complete);
		}
	}
};