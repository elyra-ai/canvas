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

_defineConstant("SIDE_PANEL", {
	MINIMIZED: "0px",
	MAXIMIXED: "240px"
});
_defineConstant("SIDE_PANEL_CANVAS", "sidepanel-canvas");
_defineConstant("SIDE_PANEL_MODAL", "sidepanel-modal");
_defineConstant("SIDE_PANEL_API", "sidepanel-api");

_defineConstant("NONE", "none");
_defineConstant("HORIZONTAL", "horizontal");
_defineConstant("VERTICAL", "vertical");

_defineConstant("PORTS_CONNECTION", "Ports");
_defineConstant("HALO_CONNECTION", "Halo");

_defineConstant("VERTICAL_FORMAT", "Vertical");
_defineConstant("HORIZONTAL_FORMAT", "Horizontal");

_defineConstant("CURVE_LINKS", "Curve");
_defineConstant("ELBOW_LINKS", "Elbow");
_defineConstant("STRAIGHT_LINKS", "Straight");

_defineConstant("FLYOUT", "Flyout");
_defineConstant("MODAL", "Modal");
_defineConstant("CUSTOM", "Custom");
_defineConstant("EDITING", "Editing");

_defineConstant("CHOOSE_FROM_LOCATION", "Choose from location...");

_defineConstant("PALETTE_TOOLTIP", "Click to show node palette");

_defineConstant("API_SET_PIPELINEFLOW", "Set PipelineFlow");
_defineConstant("API_ADD_PALETTE_ITEM", "Add PaletteItem");
_defineConstant("API_SET_NODE_LABEL", "Set Node Label");
_defineConstant("API_SET_INPUT_PORT_LABEL", "Set Input Port Label");
_defineConstant("API_SET_OUTPUT_PORT_LABEL", "Set Output Port Label");
_defineConstant("API_ADD_NOTIFICATION_MESSAGE", "Add Notification Message");
_defineConstant("INPUT_PORT", "inputPort");
_defineConstant("OUTPUT_PORT", "outputPort");

_defineConstant("TIP_PALETTE", "Palette");
_defineConstant("TIP_NODES", "Nodes");
_defineConstant("TIP_PORTS", "Ports");
_defineConstant("TIP_LINKS", "Links");

_defineConstant("NOTIFICATION_MESSAGE_TYPE", {
	INFORMATIONAL: "informational",
	WARNING: "warning",
	ERROR: "error",
	SUCCESS: "success",
	UNSPECIFIED: "unspecified"
});

_defineConstant("LOCAL_FILE_OPTION", "Local File");
_defineConstant("FORMS", "forms");
_defineConstant("PARAMETER_DEFS", "parameterDefs");

_defineConstant("PRIMARY", "Primary");
