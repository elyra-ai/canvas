/*
 * Copyright 2017-2021 Elyra Authors
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

// Private Methods ------------------------------------------------------------>

function _defineConstant(constName, value) {
	Object.defineProperty(module.exports, constName, {
		value: value,
		enumerable: true,
		writable: false
	});
}

// Diff between the border for a text div (2px) and a label's editable text area (6px)
// This is used for node labels and also node/link text decorations.
_defineConstant("TEXT_AREA_BORDER_ADJUSTMENT", 4);

// Public Methods ------------------------------------------------------------->
_defineConstant("DND_DATA_TEXT", "text");
_defineConstant("DRAG_MOVE", "move");
_defineConstant("DRAG_LINK", "link");
_defineConstant("DRAG_SELECT_REGION", "selectRegion");

_defineConstant("DEFAULT_NOTIFICATION_HEADER", "Notifications");

// Used by both toolbar and notification panel.
_defineConstant("NOTIFICATION_ICON_CLASS", "notificationCounterIcon");

_defineConstant("INTERACTION_MOUSE", "Mouse");
_defineConstant("INTERACTION_TRACKPAD", "Trackpad");

_defineConstant("LINK_TYPE_CURVE", "Curve");
_defineConstant("LINK_TYPE_ELBOW", "Elbow");
_defineConstant("LINK_TYPE_STRAIGHT", "Straight");

_defineConstant("LINK_DIR_LEFT_RIGHT", "LeftRight");
_defineConstant("LINK_DIR_TOP_BOTTOM", "TopBottom");
_defineConstant("LINK_DIR_BOTTOM_TOP", "BottomTop");

// Values for enableLinkSelection config parameter
_defineConstant("LINK_SELECTION_NONE", "None");
_defineConstant("LINK_SELECTION_LINK_ONLY", "LinkOnly");
_defineConstant("LINK_SELECTION_HANDLES", "Handles");
_defineConstant("LINK_SELECTION_DETACHABLE", "Detachable");

// Values for enablePaletteLayout config parameter
_defineConstant("PALETTE_LAYOUT_NONE", "None");
_defineConstant("PALETTE_LAYOUT_FLYOUT", "Flyout");
_defineConstant("PALETTE_LAYOUT_MODAL", "Modal");

// Values for enableToolbarLayout config parameter
_defineConstant("TOOLBAR_LAYOUT_NONE", "None");
_defineConstant("TOOLBAR_LAYOUT_TOP", "Top");


// Values for enableAssocLinkType config parameter
_defineConstant("ASSOC_RIGHT_SIDE_CURVE", "RightSideCurve");
_defineConstant("ASSOC_STRAIGHT", "Straight");

_defineConstant("ERROR", "error");
_defineConstant("WARNING", "warning");
_defineConstant("INFO", "info");
_defineConstant("SUCCESS", "success");

_defineConstant("HORIZONTAL", "horizonal");
_defineConstant("VERTICAL", "vertical");

_defineConstant("PORT_OBJECT_IMAGE", "image");
_defineConstant("PORT_OBJECT_CIRCLE", "circle");

// Variations of association links - when enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE
_defineConstant("ASSOC_VAR_CURVE_RIGHT", "curveRight");
_defineConstant("ASSOC_VAR_CURVE_LEFT", "curveLeft");
_defineConstant("ASSOC_VAR_DOUBLE_BACK_RIGHT", "doubleBackRight");
_defineConstant("ASSOC_VAR_DOUBLE_BACK_LEFT", "doubleBackLeft");

// The type of object to which deorations are to be attached.
_defineConstant("DEC_NODE", "node");
_defineConstant("DEC_LINK", "link");

_defineConstant("DAGRE_HORIZONTAL", "LR");
_defineConstant("DAGRE_VERTICAL", "TB");

_defineConstant("NODE_LINK", "nodeLink");
_defineConstant("ASSOCIATION_LINK", "associationLink");
_defineConstant("COMMENT_LINK", "commentLink");

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

_defineConstant("BINDING", "binding");
_defineConstant("SUPER_NODE", "super_node");
_defineConstant("MODEL_NODE", "model_node");
_defineConstant("EXECUTION_NODE", "execution_node");

_defineConstant("SAVED_NODES_CATEGORY_ID", "savedNodes");

_defineConstant("USE_DEFAULT_ICON", "useDefaultIcon");
_defineConstant("USE_DEFAULT_EXT_ICON", "useDefaultExtIcon");

_defineConstant("CONTEXT_MENU_BUTTON", 2);

_defineConstant("CANVAS_CARBON_ICONS", {
	CHEVRONARROWS: {
		UP: "chevron-up",
		DOWN: "chevron-down"
	},
	OVERFLOWMENU: "overflow-menu",
	SEARCH: "search",
	WARNING_UNFILLED: "warning16"
});

_defineConstant("CONTEXT_MENU_CARBON_ICONS", {
	CHEVRONARROWS: {
		RIGHT: "chevron-right"
	}
});

_defineConstant("TOOLBAR_ACTIONS", {
	TOOLBAR_STOP: "stop",
	TOOLBAR_RUN: "run",
	TOOLBAR_UNDO: "undo",
	TOOLBAR_REDO: "redo",
	TOOLBAR_CUT: "cut",
	TOOLBAR_COPY: "copy",
	TOOLBAR_PASTE: "paste",
	TOOLBAR_CREATE_AUTO_COMMENT: "createAutoComment",
	TOOLBAR_DELETE_SELECTED_OBJECTS: "deleteSelectedObjects",
	TOOLBAR_ZOOM_IN: "zoomIn",
	TOOLBAR_ZOOM_OUT: "zoomOut",
	TOOLBAR_ZOOM_FIT: "zoomToFit",
	TOOLBAR_TOGGLE_NOTIFICATION_PANEL: "toggleNotificationPanel"
});

_defineConstant("EDIT_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\">" +
	"<rect x=\"2\" y=\"26\" width=\"28\" height=\"2\"/>" +
	"<path d=\"M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0" +
	"c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6" +
	"l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z\"/>" +
	"</svg>");

_defineConstant("NODE_MENU_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 16\">" +
	"<circle cx=\"2\" cy=\"4\" r=\"1.1\"/>" +
	"<circle cx=\"2\" cy=\"9\" r=\"1.1\"/>" +
	"<circle cx=\"2\" cy=\"14\" r=\"1.1\"/>" +
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
	"<path d=\"M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm2.7 10.5L4.5 5.3l.8-.8 6.2 6.2-.8.8z\"></path>" +
	"<path style=\"fill: #ffffff;\" d=\"M10.7 11.5L4.5 5.3l.8-.8 6.2 6.2-.8.8z\"></path>" +
	"</svg>");

_defineConstant("NODE_WARNING_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">" +
	"<path d=\"M8 1C4.2 1 1 4.2 1 8s3.2 7 7 7 7-3.1 7-7-3.1-7-7-7zm-.5 3h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z\"></path>" +
	"<path style=\"stroke-width: 0; fill: #161616; opacity: 1;\" d=\"M7.5 4h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z\"></path>" +
	"</svg>");

_defineConstant("LEFT_ARROW_ICON",
	"<svg focusable=\"false\" preserveAspectRatio=\"xMidYMid meet\" xmlns=\"http://www.w3.org/2000/svg\" " +
	"width=\"16\" height=\"16\" viewBox=\"0 0 32 32\" aria-hidden=\"true\" style=\"will-change: transform;\">" +
	"<path d=\"M13 26L14.41 24.59 6.83 17 29 17 29 15 6.83 15 14.41 7.41 13 6 3 16 13 26z\"></path>" +
	"<title>Arrow left</title></svg>");

// This image is stored in the format to be shown as an <img> in the JSX
// created by palette-flyout-content-category render method.
_defineConstant("SAVED_NODES_FOLDER_ICON",
	"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllci" +
	"AxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNC" +
	"AyMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiM5NDkzOTQ7fTwvc3R5bGU+PC9kZWZzPj" +
	"x0aXRsZT5zb3VyY2VzX29wZW48L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEwLD" +
	"MuNDRWMkgyVjE4SDIyVjMuNDRabTEwLjE3LDEzSDMuNzdWNS4xN0gyMC4xNFoiLz48L3N2Zz4=");
