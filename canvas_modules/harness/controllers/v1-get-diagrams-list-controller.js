/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// Modules
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");

const logger = log4js.getLogger("v1-get-diagrams-list-controller");
const constants = require("../lib/constants");

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;

function _get(req, res) {
	logger.info("Retreiving list of files");
	var dirPath = path.join(__dirname, constants.TEST_RESOURCES_DIAGRAMS_PATH);
	if (req.query.file) { // retrieve file contents
		var filename = req.query.file;
		fs.readFile(dirPath + filename, "utf-8", function(err, data) {
			if (err) {
				res.status(constants.HTTP_STATUS_NOT_FOUND);
				res.json({ error: err });
			}
			res.status(constants.HTTP_STATUS_OK);
			res.json(JSON.parse(data));
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
