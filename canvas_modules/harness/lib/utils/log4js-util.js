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

// Modules

const log4js = require("log4js");

// const envUtil = require("./env-util");
// const constants = require("../constants");

// Globals

const RELOAD_INTERVAL = 300; // 5 mins
const LAYOUT_PATTERN = "[%d] [%[%-5p%]] [%-16c] %m";

// Public Methods ------------------------------------------------------------->

module.exports.init = _init;
module.exports.getRequestLogger = _getRequestLogger;

// Private Methods ------------------------------------------------------------>

function _init() {
	const appenders = {
		appenders: {
			out: {
				type: "stdout",
				layout: {
					type: "pattern",
					pattern: LAYOUT_PATTERN
				}
			}
		},
		categories: { default: { appenders: ["out"], level: "error" } }
	};
	log4js.configure(appenders, {
		reloadSecs: RELOAD_INTERVAL
	});
}

function _getRequestLogger() {
	return log4js.connectLogger(log4js.getLogger("incoming-request"), {
		format: "[:status] :method :url (:response-time ms)",
		level: log4js.levels.TRACE
	});
}
