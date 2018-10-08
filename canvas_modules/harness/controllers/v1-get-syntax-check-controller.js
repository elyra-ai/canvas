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

const logger = log4js.getLogger("v1-get-syntax-check-controller");
const constants = require("../lib/constants");

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;

function _get(req, res) {
	logger.info("Syntax checker");
	if (req.query.expression) { // retrieve expression contents
		var expression = req.query.expression;
		// this could be the call to PSAPI??
		var content = { type: "error", text: "There is an '?' in your expression." };
		if (expression.indexOf("?") === -1) {
			content = { type: "success", text: "Expression is valid" };
		}
		res.status(constants.HTTP_STATUS_OK);
		res.json(content);
	} else {
		res.status(constants.HTTP_STATUS_NOT_FOUND);
		res.json({ type: "error", text: "Expression not found in syntax checker." });
	}
}
