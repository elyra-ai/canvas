/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Private Methods ------------------------------------------------------------>

function _defineConstant(constName, value) {
	Object.defineProperty(module.exports, constName, {
		value: value,
		enumerable: true,
		writable: false
	});
}

// Public Methods ------------------------------------------------------------->
_defineConstant("DND_DATA_TEXT", "text");
_defineConstant("DRAG_MOVE", "move");
_defineConstant("DRAG_LINK", "link");
_defineConstant("DRAG_SELECT_REGION", "selectRegion");

_defineConstant("NOTIFICATION_BELL_ICON", {
	DEFAULT: "bell",
	DOT: "bellDot"
});

_defineConstant("DEFAULT_NOTIFICATION_HEADER", "Notifications");

_defineConstant("MOUSE_INTERACTION", "Mouse");
_defineConstant("TRACKPAD_INTERACTION", "Trackpad");

_defineConstant("ERROR", "error");
_defineConstant("WARNING", "warning");
_defineConstant("INFO", "info");
_defineConstant("SUCCESS", "success");
_defineConstant("CARBON_SUCCESS", "checkmark");

_defineConstant("NONE", "none");
_defineConstant("HORIZONTAL", "horizonal");
_defineConstant("VERTICAL", "vertical");
_defineConstant("DAGRE_HORIZONTAL", "LR");
_defineConstant("DAGRE_VERTICAL", "TB");

_defineConstant("TIP_TYPE_NODE", "tipTypeNode");
_defineConstant("TIP_TYPE_PORT", "tipTypePort");
_defineConstant("TIP_TYPE_LINK", "tipTypeLink");
_defineConstant("TIP_TYPE_PALETTE_ITEM", "tipTypePaletteItem");
_defineConstant("TIP_TYPE_PALETTE_CATEGORY", "tipTypePaletteCategory");
_defineConstant("TIP_TYPE_TOOLBAR_ITEM", "tipTypeToolbarItem");

_defineConstant("CREATE_NODE", "create_node");
_defineConstant("CLONE_NODE", "clone_node");
_defineConstant("CREATE_COMMENT", "create_comment");
_defineConstant("CLONE_COMMENT", "clone_comment");
_defineConstant("CREATE_NODE_LINK", "create_node_link");
_defineConstant("CLONE_NODE_LINK", "clone_node_link");
_defineConstant("CREATE_COMMENT_LINK", "create_comment_link");
_defineConstant("CLONE_COMMENT_LINK", "clone_comment_link");
_defineConstant("CREATE_PIPELINE", "create_pipeline");
_defineConstant("CLONE_PIPELINE", "clone_pipeline");

_defineConstant("HIGHLIGHT_BRANCH", "branch");
_defineConstant("HIGHLIGHT_UPSTREAM", "upstream");
_defineConstant("HIGHLIGHT_DOWNSTREAM", "downstream");

_defineConstant("HIGHLIGHT_FILL", "#bad8ff");
_defineConstant("HIGHLIGHT_HOVER_FILL", "#a0c8fe");
_defineConstant("HIGHLIGHT_STROKE", "#152935");
_defineConstant("HIGHLIGHT_STROKE_WIDTH", "3px");

_defineConstant("PALETTE", {
	OPEN_WIDTH: 250,
	CLOSED_WIDTH: 0,
	NARROW_WIDTH: 64
});

_defineConstant("BINDING", "binding");
_defineConstant("SUPER_NODE", "super_node");
_defineConstant("MODEL_NODE", "model_node");
_defineConstant("EXECUTION_NODE", "execution_node");

_defineConstant("SAVED_NODES_CATEGORY_ID", "savedNodes");

_defineConstant("NODE_MENU_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 16.14\">" +
	"<circle cx=\"2\" cy=\"2\" r=\"2\"/>" +
	"<circle cx=\"2\" cy=\"8.03\" r=\"2\"/>" +
	"<circle cx=\"2\" cy=\"14.14\" r=\"2\"/>" +
	"</svg>");

_defineConstant("SUPER_NODE_EXPAND_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" enable-background=\"new 0 0 16 16\">" +
	"<g><path d=\"m14.9 9.1h-1.5c-.1 0-.1 0-.1.1v5.2h-11.6v-11.6h5.2c.1 0 .1 0 .1-.1v-1.5c0-.1 " +
	"0-.1-.1-.1h-5.4c-.8 0-1.5.7-1.5 1.4v12c0 .8.7 1.5 1.5 1.5h12.1c.8 0 1.5-.7 1.5-1.4v-5.4c-.1-.1-.2-.1-.2-.1\"/>" +
	"<path d=\"m10.4 0v1.4h3.2l-5.1 5v.1l1.1 1 4.9-5.1v3.3h1.5v-5.7z\"/>" +
	"</g>" +
	"</svg>");

_defineConstant("NODE_ERROR_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">" +
	"<path d=\"M8 16 A8 8 0 1 1 8 0 a 8 8 0 0 1 0 16 z" + // Circle.
	" M 11.5 4.3 l -7 7z\"/>" + // Slash.
	"</svg>");

_defineConstant("NODE_WARNING_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">" +
	"<path d=\"M.75 16 a.75.75 0 0 1 -.67 -1.085 L 7.33 .415 a .75 .75 0 0 1 1.34 0 l 7.25 14.5 A .75 .75 0 0 1 15.25 16 H .75 z" + // Triangle.
	" m 7.25 -10.5 v 5" + // Exclamation mark line.
	" M 8 13.25 A .25 .25 0 1 0 8 12.25 a .25 .25 0 0 0 0 1 z" + // Exclamation mark dot.
	" M 8 12 l 0.5 1.25\"/>" + // Draw a line through the exclamation circle to fill it.
	"</svg>");

// This image is stored in the format to be shown as an <img> in the JSX
// created by palette-flyout-content-category render method.
_defineConstant("SAVED_NODES_FOLDER_ICON",
	"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllci" +
	"AxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNC" +
	"AyMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiM5NDkzOTQ7fTwvc3R5bGU+PC9kZWZzPj" +
	"x0aXRsZT5zb3VyY2VzX29wZW48L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEwLD" +
	"MuNDRWMkgyVjE4SDIyVjMuNDRabTEwLjE3LDEzSDMuNzdWNS4xN0gyMC4xNFoiLz48L3N2Zz4=");
