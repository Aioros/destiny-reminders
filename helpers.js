const fetch = require("node-fetch");
const fs = require("fs");
const apiConfig = require("./apiConfig.js");
const db = require("./db.js");
const moment = require("moment");

const aiorosMembership = "4611686018461991702";
const aiorosWarlock = "2305843009269797090";

const dotenv = require("dotenv");
dotenv.config();

function BungieAPIException(status, message) {
	this.status = status;
	this.message = message;
	this.name = "BungieAPIException";
}

module.exports = {
	capitalize: function(str) {
		return str
			.split(" ")
			.map(word => word
				.split("(")
	            .map(w2 => w2
	                .split("\"")
				    .map(w => w.substring(0, 1).toUpperCase() + w.substring(1))
	                .join("\""))
				.join("("))
			.join(" ");
	},

	getData: async (url, token = null) => {
		try {
			var start = moment();
			var log = start.format("HH:mm:ss:SSS") + "; GET " + url + "; ";
			var headers = {
				"X-API-Key": token ? apiConfig.aiorosApiKey : apiConfig.apiKey
			};
			if (token) {
				headers["Authorization"] = "Bearer " + token.access_token;
			}
			var response = await fetch(url, {
				headers: headers
			});
			if (token && response.status == 401) {
				response = await fetch(apiConfig.baseUrl + "/app/oauth/token/", {
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded"},
					body: "client_id="+apiConfig.aiorosClientID+"&client_secret="+apiConfig.clientSecret+"&grant_type=refresh_token&refresh_token="+token.refresh_token
				});
				var newToken = await response.json();
				await fs.promises.writeFile("./data/token.json", JSON.stringify({access_token: newToken.access_token, refresh_token: newToken.refresh_token}));
				headers["Authorization"] = "Bearer " + newToken.access_token;
				response = await fetch(url, {headers: headers});
			}
			var end = moment();//.diff(start);
			log += end.format("HH:mm:ss:SSS") + "; " + end.diff(start) + "ms";
			//console.log(log);
			const json = await response.json();
			//console.log(json);
			if (json.ErrorCode > 1) {
				console.error("Bungie API error", {url, headers});
				throw new BungieAPIException(json.ErrorStatus, json.Message);
			}
			return json;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	updateDbInfo: async function(force = false) {
		var [newManifest, oldManifest] = await Promise.all([
			this.getData(apiConfig.baseUrl + "/Destiny2/Manifest").then(result => result.Response),
			fs.promises.readFile("./data/manifest.json").then(JSON.parse).catch(() => ({version: 0}))
		]);
		if (oldManifest.version === 0) {
			try {
				await fs.promises.mkdir("./data");
			} catch (ex) {console.error(ex);}
		}
		if (newManifest.version != oldManifest.version || force) {
			await fs.promises.writeFile("./data/manifest.json", JSON.stringify(newManifest));
			await this.updateDefinitions(newManifest);
		}
	},

	updateDefinitions: function(manifest) {
		var definitions = {
			vendor: "Vendor",
			item: "InventoryItemLite",
			activity: "Activity",
			activityType: "ActivityType",
			milestone: "Milestone",
			record: "Record",
			objective: "Objective",
			collectible: "Collectible",
			checklist: "Checklist"
		};
		var outputDefs = {};

		for (let d in definitions) {
			definitions[d] = this.getData("https://www.bungie.net" + manifest.jsonWorldComponentContentPaths.en["Destiny" + definitions[d] + "Definition"])
				.then(data => { outputDefs[d] = data; });
		}

		return Promise.all(Object.values(definitions)).then(() => {
			return fs.promises.writeFile("./data/definitions.json", JSON.stringify(outputDefs));
		});
	},

	getDefinitions: function() {
		return fs.promises.readFile("./data/definitions.json").then(JSON.parse);
	},

	getActivityInfo: async function() {
		var activityUrl = apiConfig.baseUrl + "/Destiny2/2/Profile/" + aiorosMembership + "/?components=204";
		var availableActivities = {};
		await this.getData(activityUrl).then(info => {
			for (let c in info.Response.characterActivities.data) {
				info.Response.characterActivities.data[c].availableActivities.forEach(act => {
					availableActivities[act.activityHash] = act;
				});
			}
			availableActivities = Object.values(availableActivities);
		});
		return availableActivities;
	},

	getMilestoneInfo: function() {
		return this.getData(apiConfig.baseUrl + "/Destiny2/Milestones").then(info => info.Response);
	},

	getVendorInfo: async function() {
		var token;
		try {
			token = await fs.promises.readFile("./data/token.json").then(JSON.parse);
		} catch (ex) {
			token = {
				access_token: process.env.AIOROS_AT,
				refresh_token: process.env.AIOROS_RT
			};
			await fs.promises.writeFile("./data/token.json", JSON.stringify(token));
		}
		return this.getData(
			apiConfig.baseUrl + "/Destiny2/2/Profile/" + aiorosMembership
				+ "/Character/" + aiorosWarlock + "/Vendors/?components=402",
			token
		).then(info => info.Response);
	},

	getProfileInfo: async function(user) {
		console.log("getProfileInfo", user);
		var membershipId = user.primaryMembershipId || user.destinyMemberships[0].membershipId;
		var profileUrl = apiConfig.baseUrl + "/Destiny2/2/Profile/" + membershipId + "/?components=104,800,900";
		var profileInfo = {};
		await this.getData(profileUrl).then(info => {
			profileInfo.collectibles = info.Response.profileCollectibles.data.collectibles;
			profileInfo.records = info.Response.profileRecords.data.records;
			for (let c in info.Response.characterRecords.data) {
				Object.assign(
					profileInfo.records,
					info.Response.characterRecords.data[c].records
				);
			}
			profileInfo.checklists = info.Response.profileProgression.data.checklists;
		});
		return profileInfo;
	},

	isCurrent(category, choice, current) {
		if (Array.isArray(current[category])) {
			return current[category].some(c => c.toLowerCase().includes(choice.toLowerCase()));
		} else {
			return current[category].toLowerCase().includes(choice.toLowerCase());
		}
	},

	getUserInfo: async function(membershipId) {
		var userInfo = await this.getData(
			apiConfig.baseUrl + "/User/GetMembershipsById/"+membershipId+"/0/"
		);
		return userInfo.Response;
	},

	getUserReminders: async function(userId) {
		try {
			var [result,] = await db.query("SELECT id, user, category, choice, email " +
					"FROM reminder WHERE user = ?", userId);
			return result;
		} catch (ex) {
			console.log("error: ", ex);
			return [];
		}
	},

	log: function(message) {
		console.log(message);
		return JSON.stringify(message);
	}
};