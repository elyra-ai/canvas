/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// Modules
const express = require("express");

const getCanvasDiagramController = require("./v1-get-canvas-diagram-controller");
const postCanvasDiagramController = require("./v1-post-canvas-diagram-controller");
const getEventLogController = require("./v1-get-event-log-controller");
const postEventLogController = require("./v1-post-event-log-controller");
const postSessionDataController = require("./v1-post-session-data-controller");

// Globals

const router = express.Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

module.exports = router;

// Private Methods ------------------------------------------------------------>

router.get("/canvas", getCanvasDiagramController.get);
router.post("/canvas", postCanvasDiagramController.post);
router.get("/canvas2", getCanvasDiagramController.get2);
router.post("/canvas2", postCanvasDiagramController.post2);
router.get("/events", getEventLogController.get);
router.post("/events", postEventLogController.post);
router.post("/data", postSessionDataController.post);
