/*
 * Copyright 2017-2023 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";
// ESLint Rule Overrides

/* eslint no-process-exit: 0 */
const express = require("express");
const session = require("express-session");
const compression = require("compression");
const path = require("path");
const appConfig = require("./utils/app-config");
const constants = require("./constants");
const log4js = require("log4js");
const bodyParser = require("body-parser");
const log4jsUtil = require("./utils/log4js-util");
log4jsUtil.init();

const isProduction = process.env.NODE_ENV === "production";

const logger = log4js.getLogger("application");

// Controllers
var formsAPI = require("../controllers/v1-forms-api.js");
var opsAPI = require("../controllers/v1-ops-api.js");

function _create(callback) {
	var status = appConfig.init();
	if (!status) {
		callback(new Error("Failed to initialize application configuration."), null);
		return;
	}

	var app = express();
	// See: http://expressjs.com/en/guide/behind-proxies.html
	app.set("trust proxy", 1);
	app.use(compression());

	app.use(session({
		secret: constants.APP_SESSION_KEY,
		resave: false,
		saveUninitialized: false,
		name: "testharness.sid"
	}));

	// Configure Development tools
	if (!isProduction) {
		logger.info("In development mode; using webpack with HMR");
		_configureHmr(app);
	}

	app.use(express.static(path.join(__dirname, "../.build")));

	app.use(log4jsUtil.getRequestLogger());

	const routerOptions = {
		caseSensitive: true,
		mergeParams: true
	};
	const v1Router = express.Router(routerOptions);
	app.use(constants.API_PATH_V1, v1Router);

	v1Router.use(bodyParser.json({ limit: "10mb" }));
	v1Router.use(constants.APP_PATH, formsAPI);
	v1Router.use(constants.APP_PATH, opsAPI);

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
	// load images and styles from asserts folder in development mode
	app.use(express.static(path.join(__dirname, "../assets")));
}

module.exports.create = _create;
