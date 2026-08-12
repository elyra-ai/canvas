/*
 * Copyright 2017-2026 Elyra Authors
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
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import appConfig from "./utils/app-config.js";
import { APP_SESSION_KEY, API_PATH_V1, APP_PATH } from "./constants.js";
import log4js from "log4js";
import bodyParser from "body-parser";
import log4jsUtils from "./utils/log4js-util.js";
import { isCspEnabled } from "./csp-state.js";

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

	// Content Security Policy middleware — only active when cspEnabled is true.
	// A fresh nonce is generated for every request and embedded in the HTML
	// response as window.__CSP_NONCE__ so that client code (e.g. CommonProperties)
	// can pass it to components that inject <style> tags at runtime.
	// script-src retains 'unsafe-inline' for the HMR dev toolchain only.
	// CSP violations are visible in the browser DevTools console.
	app.use((_req, res, next) => {
		if (!isCspEnabled()) {
			return next();
		}
		res.locals.cspNonce = randomBytes(16).toString("base64");
		res.setHeader(
			"Content-Security-Policy",
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'",
				`style-src 'self' 'nonce-${res.locals.cspNonce}'`,
				"font-src 'self' data:",
				"img-src 'self' data:",
				"connect-src 'self'",
				"worker-src blob:"
			].join("; ")
		);
		return next();
	});

	app.use(session({
		secret: APP_SESSION_KEY,
		resave: false,
		saveUninitialized: false,
		name: "testharness.sid"
	}));

	// Configure Development tools
	let devCompiler = null;
	if (!isProduction) {
		logger.info("In development mode; using webpack with HMR");
		devCompiler = _configureHmr(app);
	}

	app.use(express.static(path.join(__dirname, "../.build"), { index: false }));

	// Serve index.html dynamically so the CSP nonce can be injected when CSP is
	// enabled.  In dev mode the HTML is read from webpack's in-memory filesystem
	// (populated by HtmlWebpackPlugin) so that the nonce is applied to the
	// compiled output.  In production the HTML is read from the pre-built
	// .build directory.
	app.get("/", async(_req, res) => {
		let template;
		if (devCompiler) {
			const outputFs = (await devCompiler).outputFileSystem;
			const htmlPath = path.join(__dirname, "../.build", "index.html");
			template = await new Promise((resolve, reject) => {
				outputFs.readFile(htmlPath, "utf8", (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		} else {
			template = readFileSync(path.join(__dirname, "../.build", "index.html"), "utf8");
		}
		res.setHeader("Cache-Control", "no-store");
		if (isCspEnabled()) {
			const nonce = res.locals.cspNonce;
			const html = template.replace(
				"<head>",
				`<head>\n  <script nonce="${nonce}">window.__CSP_NONCE__="${nonce}";</script>`
			);
			res.type("html").send(html);
		} else {
			res.type("html").send(template);
		}
	});

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

	hmrRouter.use(WebpackDevMiddleware.default(compiler, {
		publicPath: "/"
	}));
	hmrRouter.use(WebpackHotMiddleware.default(compiler));

	app.use(APP_PATH, hmrRouter);

	// load images and styles from asserts folder in development mode
	app.use(express.static(path.join(__dirname, "../assets")));

	// Return a Promise that resolves with the compiler only after the first
	// webpack build completes, so the in-memory index.html exists before
	// any browser request tries to read it.
	return new Promise((resolve) => {
		compiler.hooks.done.tap("harness-ready", () => resolve(compiler));
	});
}

export default {
	create
};
