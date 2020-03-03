/*
 * Copyright 2017-2020 IBM Corporation
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

var nconf = require("nconf");

// Should be called first to setup nconf
function initialize() {
	nconf.use("memory");
	nconf.argv();
	nconf.env("__");
	var defaultConfigFile = "./config/app.json";
	nconf.file("default", defaultConfigFile);
}

function getURL() {
	var configHost = nconf.get("host");
	var testHost = (typeof configHost === "undefined") ? "localhost" : configHost;

	var configPort = nconf.get("port:http");
	var testPort = (typeof configPort === "undefined") ? "3001" : configPort;
	return "http://" + testHost + ":" + testPort;
}

function getBaseDir() {
	var configDir = nconf.get("test_base_dir");
	return (typeof configDir === "undefined") ? process.env.PWD : configDir;
}

module.exports = {
	getURL: getURL,
	getBaseDir: getBaseDir,
	initialize: initialize
};
