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

const getSyntaxCheckController = require("./v1-get-syntax-check-controller");

// Globals

const router = express.Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

module.exports = router;

// Private Methods ------------------------------------------------------------>

router.get("/ops", getSyntaxCheckController.get);
