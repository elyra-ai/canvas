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

// Modules

// New Relic must be initialized before anything else

import application from "./lib/application.js";
import http from "http";
import log4js from "log4js";
import nconf from "nconf";

// Globals

var logger = log4js.getLogger("index");

// Main ----------------------------------------------------------------------->

application.create(function(err, app) {

	if (err) {
		logger.fatal("Failed to create application.");
		logger.fatal(err);
		return;
	}

	var port = process.env.PORT || nconf.get("port").http;
	// HTTP

	http.createServer(app).listen(port, function() {
		logger.info("Express server listening on HTTP port " + port);
	});

});

// Private Methods ------------------------------------------------------------>
