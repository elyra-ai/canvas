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

const logger = log4js.getLogger("v1-get-canvas-controller");
const constants = require("../lib/constants");

// Public Methods ------------------------------------------------------------->

module.exports.get = _get;
module.exports.get2 = _get2;

function _get(req, res) {
	getCanvas(req, res, "canvas");
}

function _get2(req, res) {
	getCanvas(req, res, "canvas2");
}

function getCanvas(req, res, canvasRef) {
	logger.info("Retrieving canvas diagram");
	if (req.session[canvasRef]) {
		res.status(constants.HTTP_STATUS_OK);
		res.json(req.session[canvasRef]).end();
	} else {
		res.status(constants.HTTP_STATUS_NOT_FOUND);
		res.json({ error: "Unable to find " + canvasRef }).end();
	}
}
