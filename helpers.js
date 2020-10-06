const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
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

function tableName(name) {
	return name.split(/(?=[A-Z])/).join('_').toLowerCase()
}

async function writeFile(filePath, content) {
	return fs.promises.mkdir(path.dirname(filePath), {recursive: true})
		.then(() => fs.promises.writeFile(filePath, content));
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

	getData: async function(url, options, attempt=0) {
		if (attempt > 0) {
			var waitTimeMs = attempt == 0 ? 0 : Math.pow(2, attempt-1) * 1000;
			await (new Promise(resolve => setTimeout(resolve, waitTimeMs)));
		}
		var defaultOpts = {};
		options = Object.assign({}, defaultOpts, options);
		options.headers = Object.assign({
			"X-API-Key": options.withToken ? apiConfig.aiorosApiKey : apiConfig.apiKey
		}, options.headers);

		var token;
		if (options.withToken) {
			try {
				token = await fs.promises.readFile("./data/token.json").then(JSON.parse);
			} catch (ex) {
				token = {
					access_token: process.env.AIOROS_AT,
					refresh_token: process.env.AIOROS_RT
				};
				await writeFile("./data/token.json", JSON.stringify(token));
				token = await fs.promises.readFile("./data/token.json").then(JSON.parse);
			}
			options.headers["Authorization"] = "Bearer " + token.access_token;
		}

		try {
			var start = moment();
			var log = start.format("HH:mm:ss:SSS") + "; GET " + url + "; ";
			var response = await fetch(url, {
				headers: options.headers
			});
			if (options.withToken && response.status == 401) {
				response = await fetch(apiConfig.baseUrl + "/app/oauth/token/", {
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded"},
					body: "client_id="+apiConfig.aiorosClientID+"&client_secret="+apiConfig.clientSecret+"&grant_type=refresh_token&refresh_token="+token.refresh_token
				});
				var newToken = await response.json();
				newToken = {access_token: newToken.access_token, refresh_token: newToken.refresh_token};
				await writeFile("./data/token.json", JSON.stringify(newToken));
				return this.getData(url, options);
			}
			var end = moment();//.diff(start);
			log += end.format("HH:mm:ss:SSS") + "; " + end.diff(start) + "ms";
			//console.log(log);
			const json = await response.json();
			//console.log(json);
			if (json.ErrorCode > 1) {
				console.error("Bungie API error", {url, options});
				throw new BungieAPIException(json.ErrorStatus, json.Message);
			}
			return json;
		} catch (error) {
			console.log("error", url, options, attempt);
			if (attempt > 4) throw error;
			console.log("Retrying getData");
			return this.getData(url, options, attempt+1);
		}
	},

	updateDbInfo: async function(force = false) {
		//console.log("start updateDbInfo");
		const dbUpdateConnection = await db.getConnection();
		try {
			var oldManifestVersion = 0;
			var [newManifest,] = await Promise.all([
				this.getData(apiConfig.baseUrl + "/Destiny2/Manifest").then(result => result.Response),
				dbUpdateConnection.query("START TRANSACTION")
					.then(() => {
						//console.log("started transaction, trying to select/lock manifest table");
						return dbUpdateConnection.query("SELECT version FROM manifest_version FOR UPDATE")
					}).then(result => {
						oldManifestVersion = result[0][0].version;
						//console.log("oldversion="+result[0][0].version+", sleeping for 20");
						//return dbUpdateConnection.query("SELECT SLEEP(20)");
					})
			]);
			if (newManifest.version != oldManifestVersion || force) {
				//console.log("starting updateDefinitions");
				await Promise.all([
					dbUpdateConnection.query("UPDATE manifest_version SET version = ?, manifest = ? WHERE version = ?", [newManifest.version, JSON.stringify(newManifest), oldManifestVersion]),
					this.updateDefinitions(newManifest, dbUpdateConnection)
				]);
			}
			//console.log("commit");
			await dbUpdateConnection.query("COMMIT");
			//await dbUpdateConnection.release();
			await db.release(dbUpdateConnection);
		} catch (ex) {
			console.error(ex);
			//console.log("rollback");
			await dbUpdateConnection.query("ROLLBACK");
			//await dbUpdateConnection.release();
			await db.release(dbUpdateConnection);
		}
	},

	updateDefinitions: function(manifest, connection) {
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

		var insertValues = [];
		for (let d in definitions) {
			definitions[d] = this.getData("https://www.bungie.net" + manifest.jsonWorldComponentContentPaths.en["Destiny" + definitions[d] + "Definition"])
				.then(data => Object.entries(data).map(entry => [entry[0], JSON.stringify(entry[1])]))
				.then(values =>
					connection.query("DELETE FROM " + tableName(d))
						.then(() => {
							return connection.query("INSERT INTO " + tableName(d) + " (hash, data) VALUES ?", [values])
						})
				);
		}
		return Promise.all(Object.values(definitions));
	},

	getDefinition: async function(category, hash) {
		try {
			var [result,] = await db.query("SELECT data " +
					"FROM " + tableName(category) + " WHERE hash = ?", hash);
			return result[0].data;
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
	},

	getDefinitionByName: async function(category, name) {
		return this.getDefinitionByField(category, "$.displayProperties.name", name);
	},

	getDefinitionByField: async function(category, field, value, exact = true) {
		try {
			var query = "SELECT data " +
					"FROM " + tableName(category) +
					" WHERE LOWER(data->>?)";
			var params = [field];
			if (exact) {
				query += " = ?";
				params.push(value.toLowerCase());
			} else {
				query += " LIKE ?";
				params.push("%"+value.toLowerCase()+"%");
			}
			//console.log(db.format(query, params));
			var [result,] = await db.query(query, params);
			if (result.length == 0) return null;
			return result[0].data;
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
	},

	getDefinitionsByField: async function(category, field, values) {
		try {
			values = values.map(v => v.toLowerCase());
			var query = "SELECT data->>? name, data " +
					"FROM " + tableName(category) +
					" WHERE LOWER(data->>?) IN (?) ";
			var params = [field, field, values];
			//console.log(db.format(query, params));
			var [result,] = await db.query(query, params);
			return result;
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
	},

	getActivityData: async function(activityHashes) {
		try {
			var [result,] = await db.query("SELECT a.data activityData, at.data activityTypeData " +
					"FROM activity a " + 
					"INNER JOIN activity_type at ON JSON_EXTRACT(a.data, '$.activityTypeHash') = at.hash " +
					"WHERE a.hash IN (?)", [activityHashes]);
			return result;
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
	},

	getItems: async function(itemHashes, typeFilter = null) {
		var query = "SELECT i.hash, JSON_EXTRACT(i.data, '$.displayProperties.name') name " +
					"FROM item i " +
					"WHERE i.hash IN (?) ";
		var params = [itemHashes];
		if (typeFilter) {
			query += "AND LOWER(JSON_EXTRACT(i.data, '$.itemTypeDisplayName')) LIKE ?"; //% mod\"
			params.push(typeFilter);
		}
		try {
			var [result,] = await db.query(query, params);
			return result;
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
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
		return this.getData(
			apiConfig.baseUrl + "/Destiny2/2/Profile/" + aiorosMembership
				+ "/Character/" + aiorosWarlock + "/Vendors/?components=402",
			{withToken: true}
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