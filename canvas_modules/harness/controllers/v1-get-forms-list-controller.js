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

const logger = log4js.getLogger("v1-get-forms-list-controller");
const constants = require("../lib/constants");

// var dirPath = "/Users/caritaou/ngp-git/wdp-abstract-canvas/canvas_modules/harness/test_resources/properties/";

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;

function _get(req, res) {
	logger.debug("Retrieving list of files");
	var dirPath = path.join(__dirname, constants.TEST_RESOURCES_FORMS_PATH);
	if (req.query.file) { // retrieve file contents
		var filename = req.query.file;
		logger.debug(`Retrieving ${dirPath}${filename}`);
		fs.readFile(dirPath + filename, "utf-8", function(err, data) {
			if (err) {
				res.status(constants.HTTP_STATUS_NOT_FOUND);
				res.json({ error: err });
			}
			res.status(constants.HTTP_STATUS_OK);
			var content = {};
			try {
				content = JSON.parse(data);
			} catch (error) {
				logger.warn("error parsing json " + filename);
			}
			res.json(content);
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
