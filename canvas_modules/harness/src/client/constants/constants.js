/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

// Private Methods ------------------------------------------------------------>

function _defineConstant(name, value) {
	Object.defineProperty(module.exports, name, {
		value: value,
		enumerable: true,
		writable: false
	});
}

// Public Methods ------------------------------------------------------------->
_defineConstant("CONSOLE", {
	MINIMIZED: "0px",
	MAXIMIXED: "200px"
});

_defineConstant("CURVE", "curve");
_defineConstant("ELBOW", "elbow");
_defineConstant("STRAIGHT", "straight");

_defineConstant("SIDE_PANEL", {
	MINIMIZED: "0px",
	MAXIMIXED: "200px"
});
_defineConstant("SIDE_PANEL_FORMS", "sidepanel-forms");
_defineConstant("SIDE_PANEL_STYLES", "sidepanel-styles");

_defineConstant("NONE", "none");
_defineConstant("HORIZONTAL", "horizontal");
_defineConstant("VERTICAL", "vertical");

_defineConstant("BLANK_CANVAS", {
	"id": "abc651d6-9b88-423c-b01b-861f12d01489",
	"className": "canvas-image",
	"style": "",
	"zoom": 100,
	"objectData": {
		"label": "learning",
		"description": "",
		"created": 1481766985496,
		"updated": 1481766986599
	},
	"userData": {
		"typeId": "stream"
	},
	"diagram": {
		"id": "abc651d6-9b88-423c-b01b-861f12d01489",
		"nodes": [],
		"comments": [],
		"links": []
	},
	"parents": [{
		"id": "abc651d6-9b88-423c-b01b-861f12d01489",
		"label": "druglearn"
	}]
});

_defineConstant("PALETTE_TOOLTIP", "Click to show node palette");
