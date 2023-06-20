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

const logger = log4js.getLogger("v1-get-syntax-check-controller");
const constants = require("../lib/constants");

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;

function _get(req, res) {
	logger.info("Syntax checker");
	if (req.query.expression) { // retrieve expression contents
		var expression = req.query.expression;
		// this could be the call to PSAPI??
		var content = { type: "error", text: "There is an '?' in your expression." };
		if (expression.indexOf("?") === -1) {
			content = { type: "success", text: "Expression is valid" };
		}
		res.status(constants.HTTP_STATUS_OK);
		res.json(content);
	} else {
		res.status(constants.HTTP_STATUS_NOT_FOUND);
		res.json({ type: "error", text: "Expression not found in syntax checker." });
	}
}
