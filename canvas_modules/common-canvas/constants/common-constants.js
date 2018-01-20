/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// Private Methods ------------------------------------------------------------>

function _defineConstant(name, value) {
	Object.defineProperty(module.exports, name, {
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

_defineConstant("CANVAS_UI", {
	HALO_RADIUS: 45
});

_defineConstant("TOOLBAR", {
	ICON_WIDTH: 64,
	DIVIDER_WIDTH: 2
});

_defineConstant("NONE", "none");
_defineConstant("HORIZONTAL", "horizonal");
_defineConstant("VERTICAL", "vertical");
_defineConstant("DAGRE_HORIZONTAL", "LR");
_defineConstant("DAGRE_VERTICAL", "TB");

_defineConstant("TIP_TYPE_NODE", "tipTypeNode");
_defineConstant("TIP_TYPE_PORT", "tipTypePort");
_defineConstant("TIP_TYPE_LINK", "tipTypeLink");
_defineConstant("TIP_TYPE_PALETTE_ITEM", "tipTypePaletteItem");
_defineConstant("TIP_TYPE_TOOLBAR_ITEM", "tipTypeToolbarItem");

_defineConstant("CREATE_NODE", "create_node");
_defineConstant("CLONE_NODE", "clone_node");
_defineConstant("CREATE_COMMENT", "create_comment");
_defineConstant("CLONE_COMMENT", "clone_comment");
_defineConstant("CREATE_NODE_LINK", "create_node_link");
_defineConstant("CLONE_NODE_LINK", "clone_node_link");
_defineConstant("CREATE_COMMENT_LINK", "create_comment_link");
_defineConstant("CLONE_COMMENT_LINK", "clone_comment_link");
