/*
 * Copyright 2017-2019 IBM Corporation
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


// Modules

const log4js = require("log4js");

// const envUtil = require("./env-util");
// const constants = require("../constants");

// Globals

// TODO: Extract as a constant?
// const APP_ID = constants.APP_NAME;
const RELOAD_INTERVAL = 300; // 5 mins
const LOCAL_LAYOUT_PATTERN = "[%d] [%[%-5p%]] [%-16c] %m";
// const BLUEMIX_LAYOUT_PATTERN = `[%d] [%-5p] [${APP_ID}] [%-16c] %m`;

// Public Methods ------------------------------------------------------------->

module.exports.init = _init;
module.exports.getRequestLogger = _getRequestLogger;

// Private Methods ------------------------------------------------------------>

function _init() {

	const log4jsConfigFile = "./config/log4js.json";

	log4js.configure(log4jsConfigFile, {
		reloadSecs: RELOAD_INTERVAL
	});

	// let pattern;
	// if (envUtil.isBluemixEnvironment()) {
	//	pattern = BLUEMIX_LAYOUT_PATTERN;
	// } else {
	const pattern = LOCAL_LAYOUT_PATTERN;
	// }

	// Console Appender

	const layoutConfig = {
		pattern: pattern
	};
	const layout = log4js.layouts.layout("pattern", layoutConfig);
	const consoleAppender = log4js.appenders.console(layout);

	log4js.addAppender(consoleAppender);

}

function _getRequestLogger() {
	return log4js.connectLogger(log4js.getLogger("incoming-request"), {
		format: "[:status] :method :url (:response-time ms)",
		level: log4js.levels.TRACE
	});
}
