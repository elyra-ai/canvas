/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

var nconf = require("nconf");

// eslint-disable-line global-require
function getURL() {
	nconf.argv();
	nconf.env("__");
	var defaultConfigFile = "./config/app.json";
	nconf.file("default", defaultConfigFile);

	var configHost = nconf.get("host");
	var testHost = (typeof configHost === "undefined") ? "localhost" : configHost;

	var configPort = nconf.get("port:http");
	var testPort = (typeof configPort === "undefined") ? "3001" : configPort;
	return "http://" + testHost + ":" + testPort;
}

function getBaseDir() {
	nconf.argv();
	nconf.env("__");
	var defaultConfigFile = "./config/app.json";
	nconf.file("default", defaultConfigFile);
	var configDir = nconf.get("test_base_dir");
	return (typeof configDir === "undefined") ? process.env.PWD : configDir;
}


module.exports = {
	getURL: getURL,
	getBaseDir: getBaseDir
};
