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
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

// Modules

// Globals

// Private Methods ------------------------------------------------------------>

function _getErrorMessage(prefix, errorObject, id) {
	var classID = "";
	var lineNumber = "";
	var message = "";

	// Class name
	if (id) {
		classID = id + ": ";
	}

	if (errorObject) {
		// Line number
		if (errorObject.lineNumber) {
			lineNumber = "(line " + errorObject.lineNumber + "): ";
		}
		// Error message
		if (errorObject.message) {
			message = errorObject.message;
		} else {
			message = "Message unavailable";
		}
	}

	var errorMessage = "[" + prefix + "]: " +
						classID +
						lineNumber +
						message;

	return errorMessage;
}

/**
 * Prints a DEBUG status message to the console.
 *
 * @param {String} id:           Logging ID included in status message.
 * @param {String} errorObject:  Error object used to wrap message & line number.
 *
 * @returns void
 */
function _debug(id, errorObject) {
	console.log(_getErrorMessage("DEBUG", errorObject, id));
}

/**
 * Prints a INFO status message to the console.
 *
 * @param {String} id:           Logging ID included in status message.
 * @param {String} errorObject:  Error object used to wrap message & line number.
 *
 * @returns void
 */
function _info(id, errorObject) {
	console.log(_getErrorMessage("INFO", errorObject, id));
}

/**
 * Prints a WARNING status message to the console.
 *
 * @param {String} id:           Logging ID included in status message.
 * @param {String} errorObject:  Error object used to wrap message & line number.
 *
 * @returns void
 */
function _warning(id, errorObject) {
	console.warn(_getErrorMessage("WARNING", errorObject, id));
}

/**
 * Prints a ERROR status message to the console.
 *
 * @param {String} id:           Logging ID included in status message.
 * @param {String} errorObject:  Error object used to wrap message & line number.
 *
 * @returns void
 */
function _error(id, errorObject) {
	console.error(_getErrorMessage("ERROR", errorObject, id));
}

// Public Methods ------------------------------------------------------------->

module.exports.debug = _debug;
module.exports.info = _info;
module.exports.warn = _warning;
module.exports.error = _error;
