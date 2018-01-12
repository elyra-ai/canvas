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

const logger = log4js.getLogger("v1-post-session-data-controller");
const constants = require("../lib/constants");

// Public Methods ------------------------------------------------------------->

module.exports.post = _post;

function _post(req, res, next) {
	logger.info("Posting canvas diagram");
	if (req.body) {
		req.session.events = req.body.events;
		req.session.canvas = req.body.canvas;
		if (req.body.canvas2) {
			req.session.canvas2 = req.body.canvas2;
		}
		res.status(constants.HTTP_STATUS_OK);
		res.json(req.body).end();
	} else {
		res.status(constants.HTTP_STATUS_NOT_FOUND);
		res.json({ error: "Unable to post session data" }).end();
	}
}
