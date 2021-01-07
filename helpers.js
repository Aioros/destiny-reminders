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

function DRMembershipException(status, message) {
	this.status = status;
	this.message = message;
	this.name = "DRMembershipException";
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

	getReminderTable: function() {
		var mainName = "reminder";
		if (process.env.ENVIRONMENT == "local") {
			mainName += "_dev";
		}
		return mainName;
	},

	readToken: async function() {
		try {
			var [token,] = await db.query("SELECT access_token, refresh_token FROM token WHERE id = 1");
			//console.log(token);
			if (token.length == 0 || token[0].access_token == "" || token[0].refresh_token == "") return null;
			return token[0];
		} catch (ex) {
			console.log("error: ", ex);
			return null;
		}
	},

	writeToken: async function(token) {
		try {
			var [token,] = await db.query("UPDATE token SET " +
				"access_token = ?, " +
				"refresh_token = ? WHERE id = 1", [token.access_token, token.refresh_token]);
		} catch (ex) {
			console.log("error: ", ex);
		}
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
				token = await this.readToken();
				if (!token) throw new Error("Token read error");
			} catch (ex) {
				token = {
					access_token: process.env.AIOROS_AT,
					refresh_token: process.env.AIOROS_RT
				};
				await this.writeToken(token);
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
				await this.writeToken(newToken);
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

	isMultiPlatform: function(user) {
		return user.destinyMemberships.filter(m => m.isValidMembership).length > 1;
	},

	getPrimaryPlatformIcon: function(user) {
		return user.destinyMemberships.find(m => m.membershipId == user.primaryMembershipId).iconPath;
	},

	getProfileInfo: async function(user) {
		console.log("getProfileInfo", user);
		var primaryMembership, membershipType, membershipId;
		primaryMembership = user.destinyMemberships.find(m => m.membershipId == user.primaryMembershipId);
		membershipType = primaryMembership.membershipType;
		membershipId = primaryMembership.membershipId;
		var profileUrl = apiConfig.baseUrl + "/Destiny2/" + membershipType + "/Profile/" + membershipId + "/?components=104,800,900";
		var profileInfo = {};
		await this.getData(profileUrl).then(info => {
			profileInfo.collectibles = info.Response.profileCollectibles.data?.collectibles || {};
			profileInfo.records = info.Response.profileRecords.data?.records;
			for (let c in info.Response.characterCollectibles.data) {
				Object.assign(
					profileInfo.collectibles,
					info.Response.characterCollectibles.data[c].collectibles
				);
			}
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

	isCategoryNeeded(category) {
		var isNeeded = false;
		if (category.type == "combo") {
			isNeeded = Object.values(category.values).some(subCategory => this.isCategoryNeeded({values: subCategory}));
		} else {
			isNeeded = category.values.some(choice => this.choiceNeededFor(choice).length > 0);
		}
		return isNeeded;
	},

	choiceNeededFor(choice) {
		if (!choice.neededFor) return [];
		return choice.neededFor.filter(f => f.value);
	},

	isCurrent(category, choice, current) {
		var currentArray = current[category];
		if (!Array.isArray(currentArray))
			currentArray = [currentArray];

		//if (Array.isArray(current[category])) {
			//return current[category].some(c => c.toLowerCase().includes(choice.toLowerCase()));
			return currentArray.some(c => c.toLowerCase().includes(choice.toLowerCase()));
		//} else {
		//	return current[category].toLowerCase().includes(choice.toLowerCase());
		//}
	},

	/*isCurrentCombo(category, type, choice, current) {
		var currentArray = current[category];
		if (!Array.isArray(currentArray))
			currentArray = [currentArray];
		return currentArray.some(c => c[type].toLowerCase().includes(choice.toLowerCase()));
	},*/

	getChoiceDescription(category, choice) {
		if (["list", "vendor"].includes((require("./wishlist.js")())[category].type)) {
			return choice;
		}
		if (typeof choice == "string") {
			choice = JSON.parse(choice);
		}
		return Object.values(choice).filter(c => c).join(" - ");
	},

	getUserInfo: async function(membershipId) {
		var userInfo = await this.getData(
			apiConfig.baseUrl + "/User/GetMembershipsById/"+membershipId+"/0/"
		);
		userInfo = userInfo.Response;


	    var primaryMembership;
	    if (!userInfo.destinyMemberships || userInfo.destinyMemberships.length == 0) {
	        console.error("Bungie Membership error", {user: userInfo});
	        throw new DRMembershipException(null, null);
	    }
	    primaryMembership = userInfo.destinyMemberships.find(m => m.membershipId == userInfo.primaryMembershipId);
	    if (!primaryMembership) {
	        var checkValidMemberships = userInfo.destinyMemberships.map(m => {
	            var profileUrl = apiConfig.baseUrl + "/Destiny2/" + m.membershipType + "/Profile/" + m.membershipId + "/?components=0";
	            return fetch(profileUrl, {headers: {"X-API-Key": apiConfig.apiKey}})
	                .then(response => response.json())
	                .then(json => {
	                    m.isValidMembership = json.ErrorCode == 1;
	                })
	                .catch(() => { m.isValidMembership = false; });
	        });
	        await Promise.all(checkValidMemberships);

	        primaryMembership = userInfo.destinyMemberships.find(m => m.isValidMembership);
	        userInfo.primaryMembershipId = primaryMembership.membershipId;
	    } else {
	        primaryMembership.isValidMembership = true;
	    }
	    if (!primaryMembership) {
	        console.error("Bungie Membership error", {user: userInfo});
	        throw new DRMembershipException(null, null);
	    }

		return userInfo;
	},

	getUserReminders: async function(userId) {
		try {
			var [result,] = await db.query("SELECT id, user, category, choice, email " +
					"FROM " + this.getReminderTable() + " WHERE user = ?", userId);
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