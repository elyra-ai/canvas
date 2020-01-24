/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


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
		categories: { default: { appenders: ["out"], level: "debug" } }
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
