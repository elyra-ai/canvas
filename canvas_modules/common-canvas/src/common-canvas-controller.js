/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import AddLinksAction from "./command-actions/addLinksAction.js";
import ArrangeLayoutAction from "./command-actions/arrangeLayoutAction.js";
import CommandStack from "./command-stack/command-stack.js";
import constants from "../constants/common-constants.js";
import CreateAutoNodeAction from "./command-actions/createAutoNodeAction.js";
import CreateCommentAction from "./command-actions/createCommentAction.js";
import CreateNodeAction from "./command-actions/createNodeAction.js";
import DeleteLinkAction from "./command-actions/deleteLinkAction.js";
import DeleteObjectsAction from "./command-actions/deleteObjectsAction.js";
import DisconnectNodesAction from "./command-actions/disconnectNodesAction.js";
import EditCommentAction from "./command-actions/editCommentAction.js";
import MoveObjectsAction from "./command-actions/moveObjectsAction.js";
import ObjectModel from "./object-model/object-model.js";

var canvasConfig = {
	enableRenderingEngine: "D3",
	enableConnectionType: "Ports",
	enableNodeFormatType: "Horizontal",
	enableLinkType: "Curve",
	enableInternalObjectModel: true,
	enablePaletteLayout: "Flyout"
};


var handlers = {
	contextMenuHandler: null,
	contextMenuActionHandler: null,
	editActionHandler: null,
	clickActionHandler: null,
	decorationActionHandler: null,
	toolbarMenuActionHandler: null
};

var commonCanvas = null;
var contextMenuSource = null;


export default class CommonCanvasController {

	static setCanvasConfig(config) {
		canvasConfig = Object.assign(canvasConfig, config);
	}

	static setHandlers(inHandlers) {
		handlers = Object.assign(handlers, inHandlers);
	}

	static setCommonCanvas(comcan) {
		commonCanvas = comcan;
	}

	static openPalette() {
		if (commonCanvas) {
			commonCanvas.openPalette();
		}
	}

	static closePalette() {
		if (commonCanvas) {
			commonCanvas.closePalette();
		}
	}

	static openContextMenu(menuDef) {
		if (commonCanvas) {
			commonCanvas.openContextMenu(menuDef);
		}
	}

	static closeContextMenu() {
		contextMenuSource = null;
		if (commonCanvas) {
			commonCanvas.closeContextMenu();
		}
	}

	static zoomIn() {
		if (commonCanvas) {
			commonCanvas.zoomIn();
		}
	}

	static zoomOut() {
		if (commonCanvas) {
			commonCanvas.zoomOut();
		}
	}

	static zoomToFit() {
		if (commonCanvas) {
			commonCanvas.zoomToFit();
		}
	}

	static createAutoNode(nodeTemplate) {
		var data = {
			editType: "createAutoNode",
			label: nodeTemplate.label, // label is provided for the external object model
			operator_id_ref: nodeTemplate.operator_id_ref,
			nodeTypeId: nodeTemplate.operator_id_ref // TODO - Remove this when WML Canvas migrates to pipeline flow
		};

		this.editActionHandler(data);
	}

	static createNodeAt(operatorIdRef, label, sourceId, sourceObjectTypeId, x, y) {
		var data = {};

		if (typeof sourceId !== "undefined") {
			data = {
				editType: "createNode",
				label: label,
				offsetX: x,
				offsetY: y,
				sourceObjectId: sourceId,
				sourceObjectTypeId: sourceObjectTypeId
			};
		} else {
			data = {
				editType: "createNode",
				label: label, // label is provided for the external object model
				operator_id_ref: operatorIdRef,
				nodeTypeId: operatorIdRef, // TODO - Remove this when WML Canvas migrates to pipeline flow
				offsetX: x,
				offsetY: y
			};
		}

		this.editActionHandler(data);
	}

	static createNodeFromDataAt(x, y, data) {
		data.offsetX = x;
		data.offsetY = y;

		this.editActionHandler(data);
	}

	static contextMenuHandler(source) {
		if (handlers.contextMenuHandler) {
			contextMenuSource = source;
			const menuDef = handlers.contextMenuHandler(source);
			if (menuDef && menuDef.length > 0) {
				this.openContextMenu(menuDef, contextMenuSource);
			}
		}
	}

	static getContextMenuPos() {
		return contextMenuSource.cmPos;
	}

	static contextMenuActionHandler(action) {
		if (canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "selectAll": {
				ObjectModel.selectAll();
				break;
			}
			case "deleteObjects": {
				const command = new DeleteObjectsAction(contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "addComment": {
				const comment = ObjectModel.createComment(contextMenuSource);
				const command = new CreateCommentAction(comment);
				CommandStack.do(command);
				contextMenuSource.commentId = comment.id;
				break;
			}
			case "deleteLink": {
				const command = new DeleteLinkAction(contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "disconnectNode": {
				const command = new DisconnectNodesAction(contextMenuSource);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				break;
			case "redo":
				CommandStack.redo();
				break;
			default:
			}
		}

		if (handlers.contextMenuActionHandler) {
			handlers.contextMenuActionHandler(action, contextMenuSource);
		}

		commonCanvas.focusOnCanvas(); // Set focus on canvas so keybord events go there.
		this.closeContextMenu();
	}

	static toolbarMenuActionHandler(action) {
		const source = {
			selectedObjectIds: ObjectModel.getSelectedObjectIds(),
		};
		if (canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "delete": {
				const command = new DeleteObjectsAction(source);
				CommandStack.do(command);
				break;
			}
			case "addComment": {
				const comment = ObjectModel.createComment(source);
				const command = new CreateCommentAction(comment);
				CommandStack.do(command);
				source.commentId = comment.id;
				break;
			}
			case "arrangeHorizontally": {
				const command = new ArrangeLayoutAction(constants.HORIZONTAL);
				CommandStack.do(command);
				break;
			}
			case "arrangeVertically": {
				const command = new ArrangeLayoutAction(constants.VERTICAL);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				commonCanvas.canUndoRedo();
				break;
			case "redo":
				CommandStack.redo();
				commonCanvas.canUndoRedo();
				break;
			default:
			}
		}

		if (handlers.toolbarMenuActionHandler) {
			handlers.toolbarMenuActionHandler(action, source);
		}
	}

	static clickActionHandler(source) {
		if (source.clickType === "SINGLE_CLICK" && source.objectType === "canvas") {
			// Don"t clear the selection if the canvas context menu is up
			if (!commonCanvas.isContextMenuDisplayed()) {
				ObjectModel.clearSelection();
			}

			// if (this.state.rightFlyoutContent && this.props.closeRightFlyout) {
			// 	this.props.closeRightFlyout(); // Equivalent of canceling
			// }
		}

		if (handlers.clickActionHandler) {
			handlers.clickActionHandler(source);
		}
	}

	static decorationActionHandler(node, id) {
		if (handlers.decorationActionHandler) {
			handlers.decorationActionHandler(node, id);
		}
	}

	static editActionHandler(data) {
		if (canvasConfig.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				const node = ObjectModel.createNode(data);
				const command = new CreateNodeAction(node);
				CommandStack.do(command);
				// need to pass the nodeid along to any this.props.editActionHandlers
				data.nodeId = node.id;
				break;
			}
			case "createAutoNode": {
				const command = new CreateAutoNodeAction(data);
				CommandStack.do(command);
				break;
			}
			case "moveObjects": {
				const command = new MoveObjectsAction(data);
				CommandStack.do(command);
				break;
			}
			case "editComment": {
				// only add editComment action, if value or size of comment has changed
				const selectedComment = ObjectModel.getComment(data.nodes[0]);
				if (selectedComment.content !== data.label ||
						selectedComment.height !== data.height ||
						selectedComment.width !== data.height) {
					const command = new EditCommentAction(data);
					CommandStack.do(command);
				}
				break;
			}
			case "linkNodes": {
				const linkNodesList = ObjectModel.createNodeLinks(data);
				if (linkNodesList.length > 0) {
					const command = new AddLinksAction(linkNodesList);
					CommandStack.do(command);
					data.linkIds = linkNodesList.map((link) => link.id);
				}
				break;
			}
			case "linkComment": {
				const linkCommentList = ObjectModel.createCommentLinks(data);
				if (linkCommentList.length > 0) {
					const command = new AddLinksAction(linkCommentList);
					CommandStack.do(command);
					data.linkIds = linkCommentList.map((link) => link.id);

				}
				break;
			}
			case "deleteSelectedObjects": {
				const command = new DeleteObjectsAction(data);
				CommandStack.do(command);
				break;
			}
			case "undo":
				CommandStack.undo();
				break;
			case "redo":
				CommandStack.redo();
				break;
			default:
			}
		}

		if (handlers.editActionHandler) {
			handlers.editActionHandler(data);
		}
	}
}
