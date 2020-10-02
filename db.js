const mysql = require("mysql2/promise");
const genericPool = require("generic-pool");

const config = {
	user: process.env.DBUSER,
	password: process.env.DBPASSWORD,
	database: process.env.DB,
	timezone: "Z",
	enableKeepAlive: true,
	keepAliveInitialDelay: 10000
};

if (process.env.ENVIRONMENT == "local") {
    config.host = process.env.DBHOST;
	config.port = process.env.DBPORT;
} else {
	config.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
}

const pool = genericPool.createPool({
	create: () => {
		const conn = mysql.createConnection(config);
		console.log('Connection %d made', conn.threadId);
		return conn;
	},
	destroy: (connection) => connection.end(),
	validate: (connection) => connection.query("SELECT 1").then(() => true, () => false),
}, {
	max: 10,
	min: 0,
	testOnBorrow: true
});

const db = {
	release: async (conn) => pool.release(conn),
	query: async (sql, values) => {
		let conn;
		try {
			conn = await pool.acquire();
			const r = await conn.query(sql, values);
			await pool.release(conn);
			return r;
		} catch (e) {
			if (conn) await pool.destroy(conn);
			throw e;
		}
	},

	getConnection: async () => {
		return pool.acquire();
	}
};

module.exports = db;

//const pool = mysql.createPool(config);

/*pool.on('acquire', function (connection) {
	console.log('Connection %d acquired', connection.threadId);
});

pool.on('connection', function (connection) {
	console.log('Connection %d made', connection.threadId);
});

pool.on('release', function (connection) {
	console.log('Connection %d released', connection.threadId);
});

module.exports = pool;*/