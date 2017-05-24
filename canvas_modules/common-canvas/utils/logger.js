/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2015. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
