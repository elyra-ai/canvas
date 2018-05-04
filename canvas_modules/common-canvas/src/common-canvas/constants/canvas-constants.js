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

_defineConstant("NODE_MENU_ICON",
	"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 16.14\">" +
	"<circle cx=\"2\" cy=\"2\" r=\"2\"/>" +
	"<circle cx=\"2\" cy=\"8.03\" r=\"2\"/>" +
	"<circle cx=\"2\" cy=\"14.14\" r=\"2\"/>" +
	"</svg>");
