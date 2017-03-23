/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// ESLint Rule Overrides

/* eslint no-process-exit: 0 */
var express = require("express");
var session = require("express-session");
var path = require("path");
const appConfig = require("./utils/app-config");
const constants = require("./constants");
const log4js = require("log4js");
const bodyParser = require("body-parser");

const isProduction = process.env.NODE_ENV === "production";

const logger = log4js.getLogger("application");

// Controllers
var testAPI = require("../controllers/v1-test-api.js");

function _create(callback) {
	var status = appConfig.init();
	if (!status) {
		callback(new Error("Failed to initialize application configuration."), null);
		return;
	}

	var app = express();
	// See: http://expressjs.com/en/guide/behind-proxies.html
	app.set("trust proxy", 1);
	app.use(session({
		secret: constants.APP_SESSION_KEY,
		resave: false,
		saveUninitialized: true,
		name: "testharness.sid"
		// cookie: { httpOnly: false }
	}));
	// Configure Development tools
	if (!isProduction) {
		logger.info("In development mode; using webpack with HMR");
		_configureHmr(app);
	}
	app.use(express.static(path.join(__dirname, "../public")));

	const routerOptions = {
		caseSensitive: true,
		mergeParams: true
	};
	const v1Router = express.Router(routerOptions);
	app.use(constants.API_PATH_V1, v1Router);
	v1Router.use(bodyParser.json());
	v1Router.use(constants.APP_PATH, testAPI);

	callback(null, app);
}
function _configureHmr(app) {

	/* eslint new-cap: 0 */
	/* eslint global-require: 0 */
	var hmrRouter = express.Router({
		caseSensitive: true,
		mergeParams: true
	});

	var webpack = require("webpack");
	var webpackConfig = require("../webpack.config.dev");
	var compiler = webpack(webpackConfig);

	// Note: publicPath should match the output directory as defined
	// in the webpack config, but we are applying this middleware to
	// a route mounted at constants.APP_PATH already
	hmrRouter.use(require("webpack-dev-middleware")(compiler, {
		noInfo: true,
		publicPath: "/"
	}));

	hmrRouter.use(require("webpack-hot-middleware")(compiler));
	app.use(constants.APP_PATH, hmrRouter);
}

module.exports.create = _create;
