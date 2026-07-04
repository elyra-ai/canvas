/*
 * Copyright 2017-2026 Elyra Authors
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

import { get } from "lodash";
import { LINK_SELECTION_NONE, SUPER_NODE, WYSIWYG, CAUSE_KEYBOARD,
	OBJ_NODE, OBJ_LINK, OBJ_COMMENT, OBJ_CANVAS,
	OBJ_INPUT_PORT, OBJ_OUTPUT_PORT,
	ACTION_CREATE_COMMENT, ACTION_CREATE_WYSIWYG_COMMENT,
	ACTION_CREATE_AUTO_COMMENT, ACTION_CREATE_AUTO_WYSIWYG_COMMENT,
	ACTION_COLOR_BACKGROUND, ACTION_SET_COMMENT_EDIT_MODE, ACTION_SET_NODE_LABEL_EDIT,
	ACTION_CUT, ACTION_COPY, ACTION_PASTE, ACTION_UNDO, ACTION_REDO,
	ACTION_DELETE_SELECTED_OBJECTS, ACTION_COLLAPSE_SUPERNODE_IN_PLACE,
	ACTION_EXPAND_SUPERNODE_IN_PLACE, ACTION_EXPAND_SUPERNODE_FULL_PAGE,
	ACTION_DELETE_LINK, ACTION_CONNECT_FROM_PORT, ACTION_CONNECT_TO_PORT,
	ACTION_CLIPBOARD,
	ACTION_SET_NODE_DECORATION_LABEL_EDIT, ACTION_SET_COMMENT_DECORATION_LABEL_EDIT,
	ACTION_SET_LINK_DECORATION_LABEL_EDIT, ACTION_SELECT_ALL, ACTION_DESELECT_ALL,
	ACTION_DISCONNECT_NODE, ACTION_SAVE_TO_PALETTE,
	ACTION_CREATE_SUPERNODE, ACTION_CREATE_SUPERNODE_EXTERNAL,
	ACTION_DECONSTRUCT_SUPERNODE, ACTION_CONVERT_SUPERNODE_EXTERNAL_TO_LOCAL,
	ACTION_CONVERT_SUPERNODE_LOCAL_TO_EXTERNAL,
	ACTION_HIGHLIGHT_BRANCH, ACTION_HIGHLIGHT_UPSTREAM, ACTION_HIGHLIGHT_DOWNSTREAM,
	ACTION_UNHIGHLIGHT } from "./constants/canvas-constants";
import CanvasUtils from "./common-canvas-utils";

// Global temporary variable to handle the canvas controller.
let cc = null;

// Returns a context menu definition for the source object passed in which
// is either the default menu or a customized one provided by the host app.
export default function getContextMenuDefinition(source, canvasController) {
	cc = canvasController;

	const defMenu = createDefaultContextMenu(source, cc);
	let menuDefinition;

	if (typeof cc.handlers.contextMenuHandler === "function") {
		const menuCustom = cc.handlers.contextMenuHandler(source, defMenu);
		if (menuCustom && menuCustom.length > 0) {
			menuDefinition = menuCustom;
		}
	} else {
		menuDefinition = defMenu;
	}

	// If we are NOT allowing editing actions (perhaps because we are showing a
	// read-only canvas), remove any actions from the context menu that might
	// alter the canvas objects.
	if (menuDefinition && menuDefinition.length > 0 &&
			cc.getCanvasConfig().enableEditingActions === false) {
		menuDefinition = filterOutEditingActions(menuDefinition);
	}

	// We need to remove any unwanted dividers. These might be dividers at
	// the top of the array that are there after editing actions have been
	// removed or doubled-up dividers in the menu which might be there after
	// removing editing actions or in the menu def returned by the host app.
	if (menuDefinition && menuDefinition.length > 0) {
		menuDefinition = filterOutUnwantedDividers(menuDefinition);
	}

	return menuDefinition;
}

// Returns a new menu based, on the menu passed in, where all actions that
// might alter the canvas have been removed.
const filterOutEditingActions = (menuDefinition) => {
	const newMenuDefinition = [];
	menuDefinition.forEach((menuEntry) => {
		if (menuEntry.submenu) {
			const newSubMenu = filterOutEditingActions(menuEntry.menu);
			if (newSubMenu && newSubMenu.length > 0) {
				menuEntry.menu = newSubMenu;
				newMenuDefinition.push(menuEntry);
			}

		} else if (!isEditingAction(menuEntry.action)) {
			newMenuDefinition.push(menuEntry);
		}
	});
	return newMenuDefinition;
};

// Remove any doubled-up or leading dividers in the array.
const filterOutUnwantedDividers = (menuDef) => {
	const newMenuDef = [];
	let previousDivider = true;
	menuDef.forEach((item) => {
		if (item.divider) {
			if (!previousDivider) {
				newMenuDef.push(item);
				previousDivider = true;
			}
		} else {
			newMenuDef.push(item);
			previousDivider = false;
		}
	});
	return newMenuDef;
};

// Returns true if the action string passed in is one of the actions
// that would alter the canvas objects. This is useful for filtering
// out editing actions that should be unavailable with a read-only canvas.
const isEditingAction = (action) =>
	action === ACTION_CREATE_COMMENT ||
	action === ACTION_CREATE_WYSIWYG_COMMENT ||
	action === ACTION_CREATE_AUTO_COMMENT ||
	action === ACTION_CREATE_AUTO_WYSIWYG_COMMENT ||
	action === ACTION_COLOR_BACKGROUND ||
	action === ACTION_DISCONNECT_NODE ||
	action === ACTION_SET_COMMENT_EDIT_MODE ||
	action === ACTION_SET_NODE_LABEL_EDIT ||
	action === ACTION_SET_NODE_DECORATION_LABEL_EDIT ||
	action === ACTION_SET_COMMENT_DECORATION_LABEL_EDIT ||
	action === ACTION_SET_LINK_DECORATION_LABEL_EDIT ||
	action === ACTION_CUT ||
	action === ACTION_COPY ||
	action === ACTION_PASTE ||
	action === ACTION_UNDO ||
	action === ACTION_REDO ||
	action === ACTION_DELETE_SELECTED_OBJECTS ||
	action === ACTION_CREATE_SUPERNODE ||
	action === ACTION_CREATE_SUPERNODE_EXTERNAL ||
	action === ACTION_DECONSTRUCT_SUPERNODE ||
	action === ACTION_COLLAPSE_SUPERNODE_IN_PLACE ||
	action === ACTION_EXPAND_SUPERNODE_IN_PLACE ||
	action === ACTION_CONVERT_SUPERNODE_EXTERNAL_TO_LOCAL ||
	action === ACTION_CONVERT_SUPERNODE_LOCAL_TO_EXTERNAL ||
	action === ACTION_DELETE_LINK ||
	action === ACTION_SAVE_TO_PALETTE ||
	action === ACTION_CONNECT_FROM_PORT ||
	action === ACTION_CONNECT_TO_PORT
;

// Returns a default context menu definition for the source object and canvas
// controller passed in.
const createDefaultContextMenu = (source) => {
	let menuDefinition = [];
	const menuForNonSelectedObj = cc.isContextToolbarForNonSelectedObj(source);

	// Select all & add comment: canvas only
	if (source.type === OBJ_CANVAS) {
		const commentMenu = source.cause === CAUSE_KEYBOARD
			? createAutoCommentMenu()
			: createCommentMenu();
		menuDefinition = menuDefinition.concat(
			commentMenu,
			createSelectAllMenu()
		);
	}
	// Rename node
	if (source.type === OBJ_NODE && get(source, "targetObject.layout.labelEditable", false)) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_SET_NODE_LABEL_EDIT, label: getLabel("node.renameNode"), toolbarItem: true }
		);
	}
	// Edit comment
	if (source.type === OBJ_COMMENT) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_SET_COMMENT_EDIT_MODE, label: getLabel("comment.editComment"), toolbarItem: true }
		);
	}
	// Color objects
	if (source.type === OBJ_COMMENT &&
			source.targetObject?.contentType !== WYSIWYG &&
			get(cc, "contextMenuConfig.defaultMenuEntries.colorBackground", true)) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_COLOR_BACKGROUND, label: getLabel("comment.colorBackground") },
			{ divider: true }
		);
	}
	// Disconnect node
	if (source.type === OBJ_NODE || source.type === OBJ_COMMENT) {
		const objectAry = menuForNonSelectedObj ? [source.targetObject.id] : source.selectedObjectIds;
		const linksFound = cc.objectModel.getAPIPipeline(source.pipelineId).getLinksContainingIds(objectAry);
		if (linksFound.length > 0) {
			menuDefinition = menuDefinition.concat(
				{ action: ACTION_DISCONNECT_NODE, label: getLabel("node.disconnectNode") },
				{ divider: true }
			);
		}
	}
	// Edit submenu (cut, copy, paste)
	if (source.type === OBJ_NODE ||
			source.type === OBJ_COMMENT ||
			(source.type === OBJ_LINK && cc.areDetachableLinksInUse()) ||
			source.type === OBJ_CANVAS) {
		const editSubMenu = createEditMenu(source, source.type === OBJ_CANVAS);
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_CLIPBOARD, submenu: true, menu: editSubMenu, label: getLabel("node.editMenu") },
			{ divider: true }
		);
	}
	// Undo and redo
	if (source.type === OBJ_CANVAS) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_UNDO, label: getLabel("canvas.undo"), enable: cc.canUndo() },
			{ action: ACTION_REDO, label: getLabel("canvas.redo"), enable: cc.canRedo() },
			{ divider: true }
		);
	}
	// Delete objects
	if (source.type === OBJ_NODE || source.type === OBJ_COMMENT ||
			(cc.getCanvasConfig().enableLinkSelection !== LINK_SELECTION_NONE && source.type === OBJ_LINK)) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_DELETE_SELECTED_OBJECTS, label: getLabel("canvas.deleteObject"), toolbarItem: true },
			{ divider: true }
		);
	}
	// Create supernode
	if (source.type === OBJ_NODE || source.type === OBJ_COMMENT) {
		if (get(cc, "contextMenuConfig.defaultMenuEntries.createSupernode", false) &&
				(cc.areSelectedNodesContiguous() ||
					get(cc, "contextMenuConfig.enableCreateSupernodeNonContiguous", false) ||
					(menuForNonSelectedObj && source.type === OBJ_NODE))) {
			menuDefinition = menuDefinition.concat(
				{ action: ACTION_CREATE_SUPERNODE, label: getLabel("node.createSupernode") }
			);
			if (cc.getCanvasConfig().enableExternalPipelineFlows) {
				menuDefinition = menuDefinition.concat(
					{ action: ACTION_CREATE_SUPERNODE_EXTERNAL, label: getLabel("node.createSupernodeExternal") }
				);
			}
			menuDefinition = menuDefinition.concat(
				{ divider: true }
			);
		}
	}
	// Supernode options - only applicable with a single supernode selected
	// which is opened by the "canvas" (default) editor.
	if (source.type === OBJ_NODE &&
			source.targetObject.type === SUPER_NODE &&
			(source.selectedObjectIds.length === 1 || menuForNonSelectedObj) &&
				(source.targetObject.open_with_tool === "canvas" || typeof source.targetObject.open_with_tool === "undefined")) {
		// Deconstruct supernode
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_DECONSTRUCT_SUPERNODE, label: getLabel("node.deconstructSupernode") },
			{ divider: true }
		);

		// Collapse supernode
		if (cc.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
			menuDefinition = menuDefinition.concat(
				{ action: ACTION_COLLAPSE_SUPERNODE_IN_PLACE, label: getLabel("node.collapseSupernodeInPlace") }
			);
		// Expand supernode
		} else {
			menuDefinition = menuDefinition.concat(
				{ action: ACTION_EXPAND_SUPERNODE_IN_PLACE, label: getLabel("node.expandSupernode") }
			);
		}

		// Expand supernode to full page display
		if (get(cc, "contextMenuConfig.defaultMenuEntries.displaySupernodeFullPage")) {
			menuDefinition = menuDefinition.concat(
				{ action: ACTION_EXPAND_SUPERNODE_FULL_PAGE, label: getLabel("node.displaySupernodeFullPage"), toolbarItem: true }
			);
		}

		menuDefinition = menuDefinition.concat(
			{ divider: true }
		);

		// Convert supernode
		if (cc.getCanvasConfig().enableExternalPipelineFlows) {
			// Convert External to Local
			if (source.targetObject.subflow_ref.url) {
				// Supernodes inside an external sub-flow cannot be made local.
				if (!cc.isPipelineExternal(source.pipelineId)) {
					menuDefinition = menuDefinition.concat(
						{ action: ACTION_CONVERT_SUPERNODE_EXTERNAL_TO_LOCAL, label: getLabel("node.convertSupernodeExternalToLocal") },
						{ divider: true }
					);
				}
			// Convert Local to External
			} else {
				menuDefinition = menuDefinition.concat(
					{ action: ACTION_CONVERT_SUPERNODE_LOCAL_TO_EXTERNAL, label: getLabel("node.convertSupernodeLocalToExternal") },
					{ divider: true }
				);
			}
		}
	}
	// Delete link
	if (source.type === OBJ_LINK &&
			cc.getCanvasConfig().enableLinkSelection === LINK_SELECTION_NONE) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_DELETE_LINK, label: getLabel("canvas.deleteObject"), toolbarItem: true }
		);
	}
	// Highlight submenu (Highlight Branch | Upstream | Downstream, Unhighlight)
	if (source.type === OBJ_NODE) {
		menuDefinition = menuDefinition.concat(
			{ action: "highlight", submenu: true, menu: createHighlightSubMenu(source), label: getLabel("menu.highlight") }
		);
	}
	if (source.type === OBJ_CANVAS) {
		menuDefinition = menuDefinition.concat(
			{ action: ACTION_UNHIGHLIGHT, label: getLabel("menu.unhighlight"), enable: cc.isBranchHighlighted() }
		);
	}
	if (source.type === OBJ_NODE &&
			get(cc, "contextMenuConfig.defaultMenuEntries.saveToPalette", false)) {
		menuDefinition = menuDefinition.concat(
			{ divider: true },
			{ action: ACTION_SAVE_TO_PALETTE, label: getLabel("node.saveToPalette") }
		);
	}
	// Mark output port for creating links
	if (source.type === OBJ_OUTPUT_PORT) {
		// Check if the port can accept more connections based on cardinality
		const node = cc.getNode(source.id, source.pipelineId);
		const links = cc.getLinks(source.pipelineId);
		const isCardinalityAtMax = CanvasUtils.isSrcCardinalityAtMax(source.port.id, node, links);

		menuDefinition = menuDefinition.concat(
			{ action: ACTION_CONNECT_FROM_PORT, label: getLabel("port.markForOutput"), enable: !isCardinalityAtMax, toolbarItem: true }
		);
	}
	// Connect to input port from marked output port
	if (source.type === OBJ_INPUT_PORT) {
		const connectFromInfo = cc.getConnectFromInfo(source.pipelineId);
		const hasMarkedPort = connectFromInfo !== null;

		// Check if the input port can accept more connections based on cardinality
		const node = cc.getNode(source.id, source.pipelineId);
		const links = cc.getLinks(source.pipelineId);
		const isCardinalityAtMax = CanvasUtils.isTrgCardinalityAtMax(source.port.id, node, links);

		// Enable only if there's a marked port AND this port can accept more connections
		const isEnabled = hasMarkedPort && !isCardinalityAtMax;

		menuDefinition = menuDefinition.concat(
			{ action: ACTION_CONNECT_TO_PORT, label: getLabel("port.connectTo"), enable: isEnabled, toolbarItem: true }
		);
	}

	return menuDefinition;
};

const createCommentMenu = () => {
	const menu = [{ action: ACTION_CREATE_COMMENT, label: getLabel("canvas.addComment"), toolbarItem: true }];
	if (cc.getCanvasConfig().enableWYSIWYGComments) {
		menu.push(
			{ action: ACTION_CREATE_WYSIWYG_COMMENT, label: getLabel("canvas.addWysiwygComment"), toolbarItem: true }
		);
	}
	return menu;
};

const createAutoCommentMenu = () => {
	const menu = [{ action: ACTION_CREATE_AUTO_COMMENT, label: getLabel("canvas.addComment"), toolbarItem: true }];
	if (cc.getCanvasConfig().enableWYSIWYGComments) {
		menu.push(
			{ action: ACTION_CREATE_AUTO_WYSIWYG_COMMENT, label: getLabel("canvas.addWysiwygComment"), toolbarItem: true }
		);
	}
	return menu;
};

const createSelectAllMenu = () => {
	const menu = [];
	if (!cc.isPrimaryPipelineEmpty() && !cc.areAllObjectsSelected()) {
		menu.push(
			{ action: ACTION_SELECT_ALL, label: getLabel("canvas.selectAll") },
			{ divider: true }
		);
	}
	if (cc.getSelectedObjectIds().length > 0) {
		menu.push(
			{ action: ACTION_DESELECT_ALL, label: getLabel("canvas.deselectAll") },
			{ divider: true }
		);
	}
	return menu;
};

const createEditMenu = (source, includePaste) => {
	const editSubMenu = [
		{ action: ACTION_CUT, label: getLabel("edit.cutSelection"), enable: source.type === OBJ_CANVAS ? source.selectedObjectIds.length > 0 : true },
		{ action: ACTION_COPY, label: getLabel("edit.copySelection"), enable: source.type === OBJ_CANVAS ? source.selectedObjectIds.length > 0 : true }
	];
	if (includePaste) {
		editSubMenu.push({ action: ACTION_PASTE, label: getLabel("edit.pasteSelection"), enable: !cc.isClipboardEmpty() });
	}
	return editSubMenu;
};

const createHighlightSubMenu = (source) => {
	let highlightSubMenuDef = [
		{ action: ACTION_HIGHLIGHT_BRANCH, label: getLabel("menu.highlightBranch") },
		{ action: ACTION_HIGHLIGHT_UPSTREAM, label: getLabel("menu.highlightUpstream") },
		{ action: ACTION_HIGHLIGHT_DOWNSTREAM, label: getLabel("menu.highlightDownstream") }
	];
	highlightSubMenuDef.push({ divider: true });
	highlightSubMenuDef = highlightSubMenuDef.concat(createUnhighlightMenu(source));
	return highlightSubMenuDef;
};

// This should only appear in menu if highlight is true.
const createUnhighlightMenu = (source) => {
	const unhighlightSubMenu = [
		{ action: ACTION_UNHIGHLIGHT, label: getLabel("menu.unhighlight"), enable: cc.isBranchHighlighted() }
	];
	return unhighlightSubMenu;
};

// Returns a label index by the key from the canvas controller.
const getLabel = (key) => cc.labelUtil.getLabel(key);
