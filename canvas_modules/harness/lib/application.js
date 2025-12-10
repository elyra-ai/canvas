/*
 * Copyright 2017-2025 Elyra Authors
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

// ESLint Rule Overrides

/* eslint no-process-exit: 0 */
import express from "express";
import session from "express-session";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import appConfig from "./utils/app-config.js";
import { APP_SESSION_KEY, API_PATH_V1, APP_PATH } from "./constants.js";
import log4js from "log4js";
import bodyParser from "body-parser";
import log4jsUtils from "./utils/log4js-util.js";

log4jsUtils.init();

const isProduction = process.env.NODE_ENV === "production";

const logger = log4js.getLogger("application");

// Controllers
import formsAPI from "../controllers/v1-forms-api.js";
import opsAPI from "../controllers/v1-ops-api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function create(callback) {
	var state = appConfig.init();
	if (!state) {
		callback(new Error("Failed to initialize application configuration."), null);
		return;
	}

	var app = express();
	// See: http://expressjs.com/en/guide/behind-proxies.html
	app.set("trust proxy", 1);
	app.use(compression());

	app.use(session({
		secret: APP_SESSION_KEY,
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

	app.use(log4jsUtils.getRequestLogger());

	const routerOptions = {
		caseSensitive: true,
		mergeParams: true
	};
	const v1Router = express.Router(routerOptions);
	app.use(API_PATH_V1, v1Router);

	v1Router.use(bodyParser.json({ limit: "10mb" }));
	v1Router.use(APP_PATH, formsAPI);
	v1Router.use(APP_PATH, opsAPI);

	callback(null, app);
}
async function _configureHmr(app) {

	/* eslint new-cap: 0 */
	/* eslint global-require: 0 */
	var hmrRouter = express.Router({
		caseSensitive: true,
		mergeParams: true
	});

	const webpack = await import("webpack");
	const webpackConfig = await import("../webpack.config.dev.cjs");
	const compiler = webpack.default(webpackConfig.default);

	// Note: publicPath should match the output directory as defined
	// in the webpack config, but we are applying this middleware to
	// a route mounted at constants.APP_PATH already
	const WebpackHotMiddleware = await import("webpack-hot-middleware");
	const WebpackDevMiddleware = await import("webpack-dev-middleware");

	hmrRouter.use(WebpackDevMiddleware(compiler, {
		publicPath: "/"
	}));
	hmrRouter.use(WebpackHotMiddleware(compiler));

	app.use(APP_PATH, hmrRouter);

	// load images and styles from asserts folder in development mode
	app.use(express.static(path.join(__dirname, "../assets")));
}

export default {
	create
};
