/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// Modules

// New Relic must be initialized before anything else

var nconf = require("nconf");
var log4js = require("log4js");
var http = require("http");

var application = require("./lib/application");

// Globals

var logger = log4js.getLogger("index");

// Main ----------------------------------------------------------------------->

application.create(function(err, app) {

	if (err) {
		logger.fatal("Failed to create application.");
		logger.fatal(err);
		application.destroy();
		return;
	}

	var port = process.env.PORT || nconf.get("port").http;
	// HTTP

	http.createServer(app).listen(port, function() {
		logger.info("Express server listening on HTTP port " + port);
	});

});

// Private Methods ------------------------------------------------------------>
