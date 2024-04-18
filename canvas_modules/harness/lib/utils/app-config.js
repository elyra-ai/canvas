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

const nconf = require("nconf");
const log4js = require("log4js");

// Globals

const logger = log4js.getLogger("app-config");

// Public Methods ------------------------------------------------------------->

module.exports.init = _init;

// Private Methods ------------------------------------------------------------>

function _init() {

	logger.info("Initializing nconf...");

	// Load order

	// 1. Overrides
	// 2. Command-line arguments
	// 3. Environment variables
	// 4. Node environment specific config file
	// 5. Default config file
	// 6. Global variables (if any)

	// To specify a config parameter via ARGV, use --config:<param>
	// e.g. 'node index.js --config:cloudantDBName my_very_own_db_name'
	// ------------------------------------------------------------------------
	nconf.argv();

	// To specify a config parameter via ENV, use config__<param>
	// e.g. 'export config__cloudantDBName=my_very_own_db_name; node index.js'
	// Note that to access the parameter from the code, you still need to use ':'
	// as the separator i.e. nconf.get("config:cloudantDBName")
	// ------------------------------------------------------------------------
	nconf.env("__");

	// Load default config file

	var defaultConfigFile = "./config/app.json";
	logger.info("Loading config file: " + defaultConfigFile);
	nconf.file("default", defaultConfigFile);

	logger.info("nconf successfully initialized.");

	return true;
}
