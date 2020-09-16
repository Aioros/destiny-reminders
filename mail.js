const Email = require('email-templates');
const nodemailer = require("nodemailer");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const config = {
	host: process.env.SMTPHOST,
	port: process.env.SMTPPORT,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTPUSER,
		pass: process.env.SMTPPASS
	}
};

let transporter = nodemailer.createTransport(config);

const email = new Email({
	// uncomment below to send emails in development/test env:
	send: true,
	preview: false,
	transport: transporter
});

module.exports = email;