/*
 * Copyright 2017-2023 Elyra Authors
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
import { LINK_SELECTION_NONE, SUPER_NODE } from "./constants/canvas-constants";

// Global constant to handle the canvas controller.
let cc = null;

// Returns a context menu definition for the source object passed in which
// is either the default menu or a customized one provided by the host app.
export default function getContextMenuDefiniton(source, canvasController) {
	cc = canvasController;

	const defMenu = createDefaultContextMenu(source);
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
	// removing editing actions or in the menu def returtned by the host app.
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
	action === "createComment" ||
	action === "colorBackground" ||
	action === "disconnectNode" ||
	action === "setNodeLabelEditingMode" ||
	action === "setCommentEditingMode" ||
	action === "cut" ||
	action === "copy" ||
	action === "paste" ||
	action === "undo" ||
	action === "redo" ||
	action === "deleteSelectedObjects" ||
	action === "createSuperNode" ||
	action === "createSuperNodeExternal" ||
	action === "deconstructSuperNode" ||
	action === "collapseSuperNodeInPlace" ||
	action === "expandSuperNodeInPlace" ||
	action === "convertSuperNodeExternalToLocal" ||
	action === "convertSuperNodeLocalToExternal" ||
	action === "deleteLink" ||
	action === "saveToPalette"
;

// Returns a default context menu definition for the source object and canvas
// controller passed in.
const createDefaultContextMenu = (source) => {
	let menuDefinition = [];
	const menuForNonSelectedObj = cc.isContextMenuForNonSelectedObj(source);

	// Select all & add comment: canvas only
	if (source.type === "canvas") {
		menuDefinition = menuDefinition.concat([
			{ action: "createComment", label: getLabel("canvas.addComment"), toolbarItem: true },
			{ action: "selectAll", label: getLabel("canvas.selectAll") },
			{ divider: true }
		]);
	}
	// Rename node
	if (source.type === "node" && get(source, "targetObject.layout.labelEditable", false)) {
		menuDefinition = menuDefinition.concat(
			{ action: "setNodeLabelEditingMode", label: getLabel("node.renameNode"), toolbarItem: true }
		);
	}
	// Edit comment
	if (source.type === "comment") {
		menuDefinition = menuDefinition.concat(
			{ action: "setCommentEditingMode", label: getLabel("comment.editComment"), toolbarItem: true }
		);
	}
	// Color objects
	if (source.type === "comment" &&
			get(cc, "contextMenuConfig.defaultMenuEntries.colorBackground", true)) {
		menuDefinition = menuDefinition.concat(
			{ action: "colorBackground", label: getLabel("comment.colorBackground") },
			{ divider: true }
		);
	}
	// Disconnect node
	if (source.type === "node" || source.type === "comment") {
		const objectAry = menuForNonSelectedObj ? [source.targetObject.id] : source.selectedObjectIds;
		const linksFound = cc.objectModel.getAPIPipeline(source.pipelineId).getLinksContainingIds(objectAry);
		if (linksFound.length > 0) {
			menuDefinition = menuDefinition.concat(
				{ action: "disconnectNode", label: getLabel("node.disconnectNode") },
				{ divider: true }
			);
		}
	}
	// Edit submenu (cut, copy, paste)
	if (source.type === "node" ||
			source.type === "comment" ||
			(source.type === "link" && cc.areDetachableLinksInUse()) ||
			source.type === "canvas") {
		const editSubMenu = createEditMenu(source, source.type === "canvas");
		menuDefinition = menuDefinition.concat(
			{ action: "clipboard", submenu: true, menu: editSubMenu, label: getLabel("node.editMenu") },
			{ divider: true }
		);
	}
	// Undo and redo
	if (source.type === "canvas") {
		menuDefinition = menuDefinition.concat(
			{ action: "undo", label: getLabel("canvas.undo"), enable: cc.canUndo() },
			{ action: "redo", label: getLabel("canvas.redo"), enable: cc.canRedo() },
			{ divider: true }
		);
	}
	// Delete objects
	if (source.type === "node" || source.type === "comment" ||
			(cc.getCanvasConfig().enableLinkSelection !== LINK_SELECTION_NONE && source.type === "link")) {
		menuDefinition = menuDefinition.concat(
			{ action: "deleteSelectedObjects", label: getLabel("canvas.deleteObject"), toolbarItem: true },
			{ divider: true }
		);
	}
	// Create supernode
	if (source.type === "node" || source.type === "comment") {
		if (get(cc, "contextMenuConfig.defaultMenuEntries.createSupernode", false) &&
				(cc.areSelectedNodesContiguous() ||
					get(cc, "contextMenuConfig.enableCreateSupernodeNonContiguous", false) ||
					(menuForNonSelectedObj && source.type === "node"))) {
			menuDefinition = menuDefinition.concat(
				{ action: "createSuperNode", label: getLabel("node.createSupernode") }
			);
			if (cc.getCanvasConfig().enableExternalPipelineFlows) {
				menuDefinition = menuDefinition.concat(
					{ action: "createSuperNodeExternal", label: getLabel("node.createSupernodeExternal") }
				);
			}
			menuDefinition = menuDefinition.concat(
				{ divider: true }
			);
		}
	}
	// Supernode options - only applicable with a single supernode selected
	// which is opened by the "canvas" (default) editor.
	if (source.type === "node" &&
			source.targetObject.type === SUPER_NODE &&
			(source.selectedObjectIds.length === 1 || menuForNonSelectedObj) &&
				(source.targetObject.open_with_tool === "canvas" || typeof source.targetObject.open_with_tool === "undefined")) {
		// Deconstruct supernode
		menuDefinition = menuDefinition.concat(
			{ action: "deconstructSuperNode", label: getLabel("node.deconstructSupernode") },
			{ divider: true }
		);

		// Collapse supernode
		if (cc.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
			menuDefinition = menuDefinition.concat(
				{ action: "collapseSuperNodeInPlace", label: getLabel("node.collapseSupernodeInPlace") }
			);
		// Expand supernode
		} else {
			menuDefinition = menuDefinition.concat(
				{ action: "expandSuperNodeInPlace", label: getLabel("node.expandSupernode") }
			);
		}

		// Expand supernode to full page display
		if (get(cc, "contextMenuConfig.defaultMenuEntries.displaySupernodeFullPage")) {
			menuDefinition = menuDefinition.concat(
				{ action: "displaySubPipeline", label: getLabel("node.displaySupernodeFullPage"), toolbarItem: true }
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
						{ action: "convertSuperNodeExternalToLocal", label: getLabel("node.convertSupernodeExternalToLocal") },
						{ divider: true }
					);
				}
			// Convert Local to External
			} else {
				menuDefinition = menuDefinition.concat(
					{ action: "convertSuperNodeLocalToExternal", label: getLabel("node.convertSupernodeLocalToExternal") },
					{ divider: true }
				);
			}
		}
	}
	// Delete link
	if (source.type === "link" &&
			cc.getCanvasConfig().enableLinkSelection === LINK_SELECTION_NONE) {
		menuDefinition = menuDefinition.concat(
			{ action: "deleteLink", label: getLabel("canvas.deleteObject"), toolbarItem: true }
		);
	}
	// Highlight submenu (Highlight Branch | Upstream | Downstream, Unhighlight)
	if (source.type === "node") {
		menuDefinition = menuDefinition.concat(
			{ action: "highlight", submenu: true, menu: createHighlightSubMenu(source), label: getLabel("menu.highlight") }
		);
	}
	if (source.type === "canvas") {
		menuDefinition = menuDefinition.concat(
			{ action: "unhighlight", label: getLabel("menu.unhighlight"), enable: cc.isBranchHighlighted() }
		);
	}
	if (source.type === "node" &&
			get(cc, "contextMenuConfig.defaultMenuEntries.saveToPalette", false)) {
		menuDefinition = menuDefinition.concat(
			{ divider: true },
			{ action: "saveToPalette", label: getLabel("node.saveToPalette") }
		);
	}

	return menuDefinition;
};

const createEditMenu = (source, includePaste) => {
	const editSubMenu = [
		{ action: "cut", label: getLabel("edit.cutSelection"), enable: source.type === "canvas" ? source.selectedObjectIds.length > 0 : true },
		{ action: "copy", label: getLabel("edit.copySelection"), enable: source.type === "canvas" ? source.selectedObjectIds.length > 0 : true }
	];
	if (includePaste) {
		editSubMenu.push({ action: "paste", label: getLabel("edit.pasteSelection"), enable: !cc.isClipboardEmpty() });
	}
	return editSubMenu;
};

const createHighlightSubMenu = (source) => {
	let highlightSubMenuDef = [
		{ action: "highlightBranch", label: getLabel("menu.highlightBranch") },
		{ action: "highlightUpstream", label: getLabel("menu.highlightUpstream") },
		{ action: "highlightDownstream", label: getLabel("menu.highlightDownstream") }
	];
	highlightSubMenuDef.push({ divider: true });
	highlightSubMenuDef = highlightSubMenuDef.concat(createUnhighlightMenu(source));
	return highlightSubMenuDef;
};

// This should only appear in menu if highlight is true.
const createUnhighlightMenu = (source) => {
	const unhighlightSubMenu = [
		{ action: "unhighlight", label: getLabel("menu.unhighlight"), enable: cc.isBranchHighlighted() }
	];
	return unhighlightSubMenu;
};

// Returns a label index by the key from the canvas controller.
const getLabel = (key) => cc.labelUtil.getLabel(key);
