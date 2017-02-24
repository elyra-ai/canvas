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
	MINIMIZED: "10px",
	MAXIMIXED: "200px"
});

_defineConstant("CURVE", "CURVE");
_defineConstant("ELBOW", "ELBOW");
_defineConstant("STRAIGHT", "STRAIGHT");


_defineConstant("SIDE_PANEL", {
	MINIMIZED: "0px",
	MAXIMIXED: "200px"
});
_defineConstant("SIDE_PANEL_FORMS", "sidepanel-forms");
_defineConstant("SIDE_PANEL_STYLES", "sidepanel-styles");
