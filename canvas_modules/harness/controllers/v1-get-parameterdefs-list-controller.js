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
"use strict";
// Modules
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");

const logger = log4js.getLogger("v1-get-parameterdefs-list-controller");
const constants = require("../lib/constants");

// var dirPath = "/Users/caritaou/ngp-git/wdp-abstract-canvas/canvas_modules/harness/test_resources/properties/";

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;

function _get(req, res) {
	logger.info("Retrieving list of files");
	var dirPath = path.join(__dirname, constants.TEST_RESOURCES_PARAMETERDEFS_PATH);
	if (req.query.file) { // retrieve file contents
		var filename = req.query.file;
		logger.info(`Retrieving ${dirPath}${filename}`);
		fs.readFile(dirPath + filename, "utf-8", function(err, data) {
			if (err) {
				res.status(constants.HTTP_STATUS_NOT_FOUND);
				res.json({ error: err });
			}
			res.status(constants.HTTP_STATUS_OK);
			var content = {};
			try {
				content = JSON.parse(data);
			} catch (error) {
				logger.warn("error parsing json " + filename);
			}
			res.json(content);
		});
	} else { // retrieve all
		fs.readdir(dirPath, function(err, files) {
			if (err) {
				res.status(constants.HTTP_STATUS_NOT_FOUND);
				res.json({ error: err });
			}
			res.status(constants.HTTP_STATUS_OK);
			res.json(files);
		});
	}
}
