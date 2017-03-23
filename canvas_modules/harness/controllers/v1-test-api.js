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
