/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Private Methods ------------------------------------------------------------>

import styles from "../../../assets/styles/common-canvas.scss";

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

_defineConstant("TOOLBAR", {
	ICON_WIDTH: parseInt(styles.toolbarIconWidth, 10),
	DIVIDER_WIDTH: 2
});

_defineConstant("NOTIFICATION_BELL_ICON", {
	DEFAULT: "bell",
	DOT: "bellDot"
});

_defineConstant("DEFAULT_NOTIFICATION_HEADER", "Notifications");

_defineConstant("ERROR", "error");
_defineConstant("WARNING", "warning");
_defineConstant("INFORMATION", "info");
_defineConstant("SUCCESS", "success");

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
