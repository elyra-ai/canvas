/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

// Used by the autoLayout method in CanvasController
_defineConstant("HORIZONTAL", "horizontal");
_defineConstant("VERTICAL", "vertical");

_defineConstant("NONE_SAVE_ZOOM", "None");
_defineConstant("LOCAL_STORAGE", "LocalStorage");
_defineConstant("PIPELINE_FLOW", "Pipelineflow");

_defineConstant("NONE_DRAG", "None");
_defineConstant("DURING_DRAG", "During");
_defineConstant("AFTER_DRAG", "After");

_defineConstant("MOUSE_INTERACTION", "Mouse");
_defineConstant("TRACKPAD_INTERACTION", "Trackpad");

_defineConstant("PORTS_CONNECTION", "Ports");
_defineConstant("HALO_CONNECTION", "Halo");

_defineConstant("VERTICAL_FORMAT", "Vertical");
_defineConstant("HORIZONTAL_FORMAT", "Horizontal");

_defineConstant("CURVE_LINKS", "Curve");
_defineConstant("ELBOW_LINKS", "Elbow");
_defineConstant("STRAIGHT_LINKS", "Straight");

_defineConstant("DIRECTION_LEFT_RIGHT", "LeftRight");
_defineConstant("DIRECTION_TOP_BOTTOM", "TopBottom");
_defineConstant("DIRECTION_BOTTOM_TOP", "BottomTop");

_defineConstant("ASSOC_RIGHT_SIDE_CURVE", "RightSideCurve");
_defineConstant("ASSOC_STRAIGHT", "Straight");

_defineConstant("EXAMPLE_APP_NONE", "None - use options below");
_defineConstant("EXAMPLE_APP_FLOWS", "Flows");
_defineConstant("EXAMPLE_APP_BLUE_ELLIPSES", "Blue Ellipses");
_defineConstant("EXAMPLE_APP_EXPLAIN", "Explain");
_defineConstant("EXAMPLE_APP_EXPLAIN2", "Explain2");
_defineConstant("EXAMPLE_APP_STREAMS", "Streams");
_defineConstant("EXAMPLE_APP_TABLES", "Tables");

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
_defineConstant("API_SET_NODE_DECORATIONS", "Set Node Decorations");
_defineConstant("API_SET_LINK_DECORATIONS", "Set Link Decorations");
_defineConstant("API_ADD_NOTIFICATION_MESSAGE", "Add Notification Message");
_defineConstant("API_ZOOM_CANVAS_TO_REVEAL", "Zoom Canvas To Reveal");

_defineConstant("INPUT_PORT", "inputPort");
_defineConstant("OUTPUT_PORT", "outputPort");

_defineConstant("TIP_PALETTE", "Palette");
_defineConstant("TIP_NODES", "Nodes");
_defineConstant("TIP_PORTS", "Ports");
_defineConstant("TIP_LINKS", "Links");

_defineConstant("NOTIFICATION_MESSAGE_TYPE", {
	INFO: "info",
	WARNING: "warning",
	ERROR: "error",
	SUCCESS: "success",
	UNSPECIFIED: "unspecified"
});

_defineConstant("LOCAL_FILE_OPTION", "Local File");
_defineConstant("FORMS", "forms");
_defineConstant("PARAMETER_DEFS", "parameterDefs");

_defineConstant("PRIMARY", "Primary");
