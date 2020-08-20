const nodemailer = require("nodemailer");

const config = {
	host: process.env.SMTPHOST,
	port: process.env.SMTPPORT,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTPUSER,
		pass: process.env.SMTPPASS
	}
}

let transporter = nodemailer.createTransport(config);

module.exports = transporter;