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

const getDiagramsListController = require("./v1-get-diagrams-list-controller");
const getPalettesListController = require("./v1-get-palettes-list-controller");
const getPropertiesListController = require("./v1-get-properties-list-controller");

// Globals

const router = express.Router({
	caseSensitive: true,
	mergeParams: true
});

// Public Methods ------------------------------------------------------------->

module.exports = router;

// Private Methods ------------------------------------------------------------>

router.get("/forms/diagrams", getDiagramsListController.get);
router.get("/forms/palettes", getPalettesListController.get);
router.get("/forms/properties", getPropertiesListController.get);
