/*
const db = require('mysql-promise')();
db.configure({
	host: process.env.DBHOST,
	port: process.env.DBPORT,
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DB
});

module.exports = db;
*/

const mysql = require('mysql2/promise');
const config = {
    host: process.env.DBHOST,
	port: process.env.DBPORT,
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DB
}

const pool = mysql.createPool(config);

module.exports = pool;