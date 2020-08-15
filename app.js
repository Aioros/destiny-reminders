var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var MemoryStore = require('memorystore')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const apiConfig = require("./apiConfig.js");
const helpers = require("./helpers.js");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const passport = require('passport');
const BungieOAuth2Strategy = require('passport-bungie-oauth2').Strategy;
passport.use(new BungieOAuth2Strategy({
		clientID: apiConfig.clientID,
		callbackURL: apiConfig.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		helpers.getUserInfo(profile.membershipId).then(user => {
			return done(null, user);
		});
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user/*id*/, done) {
	done(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'destiny-reminders sessions',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
