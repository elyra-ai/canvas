/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

// eslint-disable-line global-require
function getURL() {
	var nconf = require("nconf");
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
	var nconf = require("nconf");
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
