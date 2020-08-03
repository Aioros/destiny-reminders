const fetch = require("node-fetch");
const apiConfig = require("./apiConfig.js");

module.exports = {
	capitalize: function(str) {
		return str
			.split(/\b/)
			.map(word => (word.length == 1 ? word : word.charAt(0).toUpperCase() + word.substring(1)))
			.join("");
	},

	isCurrent(category, current, choice) {
		if (typeof current[category] === "string")
			return current[category].toLowerCase().includes(choice.toLowerCase());
		else
			return current[category].some(c => c.toLowerCase().includes(choice.toLowerCase()));
	},

	getData: async url => {
		try {
			const response = await fetch(url, {
				headers: {
					"X-API-Key": apiConfig.apiKey
				}
			});
			const json = await response.json();
			return json;
		} catch (error) {
			console.log(error);
		}
	},

	getUserInfo: async function(membershipId) {
		var userInfo = await this.getData(
			apiConfig.baseUrl + "/User/GetMembershipsById/"+membershipId+"/0/"
		);
		var main = userInfo.Response.destinyMemberships.find(
			m => m.membershipId == userInfo.Response.primaryMembershipId
		);
		return main;
	}
};