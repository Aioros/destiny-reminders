const dotenv = require("dotenv");
dotenv.config();

module.exports = {
	baseUrl: "https://www.bungie.net/Platform",
	apiKey: process.env.API_KEY,
	aiorosApiKey: process.env.AIOROS_API_KEY,
	aiorosClientID: 34147,
	clientID: 33607,
	clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://destinyreminders.net/auth/callback"
};