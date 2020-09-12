const mysql = require('mysql2/promise');

const config = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DB,
	timezone: "Z"
};

if (process.env.ENVIRONMENT == "local") {
    config.host = process.env.DBHOST;
	config.port = process.env.DBPORT;
} else {
	config.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
}
console.log(config);

const pool = mysql.createPool(config);

module.exports = pool;