/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

// ESLint Rule Overrides

/* eslint no-process-exit: 0 */
var express = require("express");
const appConfig = require("./utils/app-config");

module.exports.create = _create;

function _create(callback) {
	var status = appConfig.init();
	if (!status) {
		callback(new Error("Failed to initialize application configuration."), null);
		return;
	}

	var app = express();
	// See: http://expressjs.com/en/guide/behind-proxies.html
	app.set("trust proxy", 1);
	callback(null, app);
}
