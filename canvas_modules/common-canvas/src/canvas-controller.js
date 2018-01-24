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
import CloneMultipleObjectsAction from "./command-actions/cloneMultipleObjectsAction.js";
import CommandStack from "./command-stack/command-stack.js";
import constants from "../constants/common-constants.js";
import CreateAutoNodeAction from "./command-actions/createAutoNodeAction.js";
import CreateCommentAction from "./command-actions/createCommentAction.js";
import CreateNodeAction from "./command-actions/createNodeAction.js";
import CreateNodeOnLinkAction from "./command-actions/createNodeOnLinkAction.js";
import DeleteLinkAction from "./command-actions/deleteLinkAction.js";
import DeleteObjectsAction from "./command-actions/deleteObjectsAction.js";
import DisconnectNodesAction from "./command-actions/disconnectNodesAction.js";
import EditCommentAction from "./command-actions/editCommentAction.js";
import MoveObjectsAction from "./command-actions/moveObjectsAction.js";
import ObjectModel from "./object-model/object-model.js";
import has from "lodash/has";

// Global instance ID counter
var commonCanvasControllerInstanceId = 0;

export default class CanvasController {

	constructor() {
		this.defaultTipConfig = {
			"palette": true,
			"nodes": true,
			"ports": true,
			"links": true
		};

		this.canvasConfig = {
			enableRenderingEngine: "D3",
			enableConnectionType: "Ports",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Curve",
			enableInternalObjectModel: true,
			enablePaletteLayout: "Flyout",
			tipConfig: this.defaultTipConfig
		};

		this.handlers = {
			contextMenuHandler: null,
			contextMenuActionHandler: null,
			editActionHandler: null,
			clickActionHandler: null,
			decorationActionHandler: null,
			toolbarMenuActionHandler: null,
			tipHandler: null
		};

		this.commonCanvas = null;
		this.contextMenuSource = null;

		this.objectModel = new ObjectModel();
		this.commandStack = new CommandStack();

		// Increment the global instance ID by 1 each time a new
		// canvas controller is created.
		this.instanceId = commonCanvasControllerInstanceId++;
	}

	setCanvasConfig(config) {
		this.canvasConfig = Object.assign(this.canvasConfig, config);
	}

	setHandlers(inHandlers) {
		this.handlers = Object.assign(this.handlers, inHandlers);
		this.objectModel.setIdGeneratorHandler(inHandlers.idGeneratorHandler);
	}

	setCommonCanvas(comcan) {
		this.commonCanvas = comcan;
	}

	setPipelineFlowPalette(palette) {
		this.objectModel.setPipelineFlowPalette(palette);
	}

	setPipelineFlow(flow) {
		this.objectModel.setPipelineFlow(flow);
	}

	setEmptyPipelineFlow() {
		this.objectModel.setEmptyPipelineFlow();
	}

	clearPipelineFlow() {
		this.objectModel.clearPipelineFlow();
	}

	setCanvas(canvas) {
		this.objectModel.setCanvas(canvas); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	setPaletteData(paletteData) {
		this.objectModel.setPaletteData(paletteData); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	clearPaletteData() {
		this.objectModel.clearPaletteData();
	}

	setNodeParameters(nodeId, parameters) {
		this.objectModel.setNodeParameters(nodeId, parameters);
	}

	setNodeMessages(nodeId, messages) {
		this.objectModel.setNodeMessages(nodeId, messages);
	}

	setNodeMessage(nodeId, message) {
		this.objectModel.setNodeMessage(nodeId, message);
	}

	setNodeLabel(nodeId, newLabel) {
		this.objectModel.setNodeLabel(nodeId, newLabel);
	}

	setInputPortLabel(nodeId, portId, newLabel) {
		this.objectModel.setInputPortLabel(nodeId, portId, newLabel);
	}

	setOutputPortLabel(nodeId, portId, newLabel) {
		this.objectModel.setOutputPortLabel(nodeId, portId, newLabel);
	}

	moveObjects(data) {
		this.objectModel.moveObjects(data);
	}

	deleteObjects(source) {
		this.objectModel.deleteObjects(source);
	}

	deleteObject(id) {
		this.objectModel.deleteObject(id);
	}

	disconnectNodes(source) {
		this.objectModel.disconnectNodes(source);
	}

	addNode(node) {
		this.objectModel.addNode(node);
	}

	createNode(data) {
		this.objectModel.createNode(data);
	}

	deleteNode(nodeId) {
		this.objectModel.deleteNode(nodeId);
	}

	addLinks(linkList) {
		this.objectModel.addLinks(linkList);
	}

	deleteLink(source) {
		this.objectModel.deleteLink(source);
	}

	createNodeLinks(data) {
		this.objectModel.createNodeLinks(data);
	}

	createCommentLinks(data) {
		this.objectModel.createCommentLinks(data);
	}

	getLink(linkId) {
		return this.objectModel.getLink(linkId);
	}

	addNodeTypeToPalette(nodeTypeObj, category, categoryLabel) {
		this.objectModel.addNodeTypeToPalette(nodeTypeObj, category, categoryLabel);
	}

	addCustomAttrToNodes(objIds, attrName) {
		this.objectModel.addCustomAttrToNodes(objIds, attrName);
	}

	removeCustomAttrFromNodes(objIds, attrName) {
		this.objectModel.removeCustomAttrToNodes(objIds, attrName);
	}

	fixedAutoLayout(selectedLayout) {
		this.objectModel.fixedAutoLayout(selectedLayout);
	}

	autoLayout(layoutDirection) {
		this.objectModel.autoLayout(layoutDirection);
	}

	createComment(source) {
		this.objectModel.createComment(source);
	}

	addComment(info) {
		this.objectModel.addComment(info);
	}

	editComment(data) {
		this.objectModel.editComment(data);
	}

	deleteComment(id) {
		this.objectModel.deleteComment(id);
	}

	getComments() {
		return this.objectModel.getComments();
	}

	addCustomAttrToComments(objIds, attrName) {
		this.objectModel.addCustomAttrToComments(objIds, attrName);
	}

	removeCustomAttrFromComments(objIds, attrName) {
		this.objectModel.removeCustomAttrToComments(objIds, attrName);
	}

	// Return a unique identifier for this instance of common canvas.
	getInstanceId() {
		return this.instanceId;
	}

	getPipelineFlow() {
		return this.objectModel.getPipelineFlow();
	}

	getCanvas() {
		return this.objectModel.getCanvas(); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	getCanvasInfo() {
		return this.objectModel.getCanvasInfo();
	}

	getNode(nodeId) {
		return this.objectModel.getNode(nodeId);
	}

	getNodes() {
		return this.objectModel.getNodes();
	}

	getPaletteData() {
		return this.objectModel.getPaletteData();
	}

	getPaletteNode(operatorId) {
		return this.objectModel.getPaletteNode(operatorId);
	}

	getNodeMessages(nodeId) {
		return this.objectModel.getNodeMessages(nodeId);
	}

	getNodeMessage(nodeId, controlName) {
		return this.objectModel.getNodeMessage(nodeId, controlName);
	}

	getAllObjectIds() {
		return this.objectModel.getAllObjectIds();
	}

	getOffsetIntoNegativeSpace(editType, offsetX, offsetY) {
		return this.objectModel.getOffsetIntoNegativeSpace(editType, offsetX, offsetY);
	}

	canNodeBeDroppedOnLink(operatorIdRef) {
		return this.objectModel.canNodeBeDroppedOnLink(operatorIdRef);
	}

	getObjectModel() {
		return this.objectModel;
	}

	getCommandStack() {
		return this.commandStack;
	}

	isInternalObjectModelEnabled() {
		return this.canvasConfig.enableInternalObjectModel;
	}

	openPalette() {
		if (this.commonCanvas) {
			this.commonCanvas.openPalette();
		}
	}

	closePalette() {
		if (this.commonCanvas) {
			this.commonCanvas.closePalette();
		}
	}

	openContextMenu(menuDef) {
		if (this.commonCanvas) {
			this.commonCanvas.openContextMenu(menuDef);
		}
	}

	closeContextMenu() {
		this.contextMenuSource = null;
		if (this.commonCanvas) {
			this.commonCanvas.closeContextMenu();
		}
	}

	zoomIn() {
		if (this.commonCanvas) {
			this.commonCanvas.zoomIn();
		}
	}

	zoomOut() {
		if (this.commonCanvas) {
			this.commonCanvas.zoomOut();
		}
	}

	zoomToFit() {
		if (this.commonCanvas) {
			this.commonCanvas.zoomToFit();
		}
	}

	cutToClipboard() {
		if (this.copyToClipboard()) {
			this.editActionHandler({
				editType: "deleteSelectedObjects",
				selectedObjectIds: this.objectModel.getSelectedObjectIds()
			});
		}
	}

	// Copies the currently selected objects to the internal clipboard and
	// returns true if successful. Returns false if there is nothing to copy to
	// the clipboard.
	copyToClipboard() {
		var copyData = {};
		var nodes = this.objectModel.getSelectedNodes();
		var comments = this.objectModel.getSelectedComments();
		var links = this.objectModel.getLinksBetween(nodes, comments);

		if (nodes.length === 0 && comments.length === 0) {
			return false;
		}

		if (nodes && nodes.length > 0) {
			copyData.nodes = nodes;
		}
		if (comments && comments.length > 0) {
			copyData.comments = comments;
		}
		if (links && links.length > 0) {
			copyData.links = links;
		}

		var clipboardData = JSON.stringify(copyData);
		localStorage.canvasClipboard = clipboardData;

		return true;
	}

	isClipboardEmpty() {
		return !localStorage.canvasClipboard || localStorage.canvasClipboard === "";
	}

	pasteFromClipboard() {
		var pastedText = localStorage.canvasClipboard;

		var objects = JSON.parse(pastedText);

		// If there are no nodes and no comments there's nothing to paste so just
		// return.
		if (!objects.nodes && !objects.comments) {
			return;
		}

		// Offset position of pasted nodes and comments if they exactly overlap
		// existing nodes and comments - this can happen when pasting over the top
		// of the canvas from which the nodes and comments were copied.
		while (this.objectModel.exactlyOverlaps(objects.nodes, objects.comments)) {
			if (objects.nodes) {
				objects.nodes.forEach((node) => {
					node.x_pos += 10;
					node.y_pos += 10;
				});
			}
			if (objects.comments) {
				objects.comments.forEach((comment) => {
					comment.x_pos += 10;
					comment.y_pos += 10;
					comment.selectedObjectIds = [];
				});
			}
		}

		this.editActionHandler({
			editType: "cloneMultipleObjects",
			objects: objects
		});
	}

	showTip(tipConfig) {
		if (this.commonCanvas && !this.isTipShowing() && this.isTipEnabled(tipConfig.type)) {
			if (this.handlers.tipHandler) {
				const data = {};
				switch (tipConfig.type) {
				case constants.TIP_TYPE_PALETTE_ITEM:
					data.nodeTemplate = tipConfig.nodeTemplate;
					break;
				case constants.TIP_TYPE_NODE:
					data.pipelineId = tipConfig.pipelineId;
					data.node = tipConfig.node;
					break;
				case constants.TIP_TYPE_PORT:
					data.pipelineId = tipConfig.pipelineId;
					data.node = tipConfig.node;
					data.port = tipConfig.port;
					break;
				case constants.TIP_TYPE_LINK:
					data.pipelineId = tipConfig.pipelineId;
					data.link = tipConfig.link;
					break;
				default:
				}

				tipConfig.customContent = this.handlers.tipHandler(tipConfig.type, data);
			}

			this.commonCanvas.showTip(tipConfig);
		}
	}

	isTipShowing() {
		return this.commonCanvas.isTipShowing();
	}

	hideTip() {
		if (this.commonCanvas) {
			this.commonCanvas.hideTip();
		}
	}

	isTipEnabled(tipType) {
		switch (tipType) {
		case constants.TIP_TYPE_PALETTE_ITEM:
			return (has(this.canvasConfig, "tipConfig.palette") ? this.canvasConfig.tipConfig.palette : this.defaultTipConfig.palette);
		case constants.TIP_TYPE_NODE:
			return (has(this.canvasConfig, "tipConfig.nodes") ? this.canvasConfig.tipConfig.nodes : this.defaultTipConfig.nodes);
		case constants.TIP_TYPE_PORT:
			return (has(this.canvasConfig, "tipConfig.ports") ? this.canvasConfig.tipConfig.ports : this.defaultTipConfig.ports);
		case constants.TIP_TYPE_LINK:
			return (has(this.canvasConfig, "tipConfig.links") ? this.canvasConfig.tipConfig.links : this.defaultTipConfig.links);
		default:
			return false;
		}
	}

	createAutoNode(nodeTemplate) {
		var data = {
			editType: "createAutoNode",
			label: nodeTemplate.label, // label is provided for the external object model
			operator_id_ref: nodeTemplate.operator_id_ref,
			nodeTypeId: nodeTemplate.operator_id_ref // TODO - Remove this when WML Canvas migrates to pipeline flow
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas
	createNodeFromTemplateAt(operatorIdRef, label, x, y) {
		var data = {
			editType: "createNode",
			label: label, // label will be passed through to the external object model
			operator_id_ref: operatorIdRef,
			nodeTypeId: operatorIdRef, // TODO - Remove this when WML Canvas migrates to pipeline flow
			offsetX: x,
			offsetY: y
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas and dropped
	// onto an existing link between two data nodes.
	createNodeFromTemplateOnLinkAt(operatorIdRef, link, label, x, y) {
		var data = {
			editType: "createNodeOnLink",
			label: label, // label will be passed through to the external object model
			operator_id_ref: operatorIdRef,
			nodeTypeId: operatorIdRef, // TODO - Remove this when WML Canvas migrates to pipeline flow
			offsetX: x,
			offsetY: y,
			link: link
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the 'output' window (in WML) onto the canvas
	createNodeFromObjectAt(sourceId, sourceObjectTypeId, label, x, y) {
		var data = {
			editType: "createNode",
			label: label, // label will be passed through to the external object model
			offsetX: x,
			offsetY: y,
			sourceObjectId: sourceId,
			sourceObjectTypeId: sourceObjectTypeId
		};

		this.editActionHandler(data);
	}

	// Called when a data object is dragged from outside common canvas.
	// The data object must contain the 'action' field that is passed to
	// the host app from editActionHandler. The editActionHandler method
	// does not intercept this action.
	createNodeFromDataAt(x, y, data) {
		data.offsetX = x;
		data.offsetY = y;

		this.editActionHandler(data);
	}

	contextMenuHandler(source) {
		if (this.handlers.contextMenuHandler) {
			this.contextMenuSource = source;
			const menuDef = this.handlers.contextMenuHandler(source);
			if (menuDef && menuDef.length > 0) {
				this.openContextMenu(menuDef, this.contextMenuSource);
			}
		}
	}

	getContextMenuPos() {
		if (this.contextMenuSource) {
			return this.contextMenuSource.cmPos;
		}
		return { x: 0, y: 0 };
	}

	contextMenuActionHandler(action) {
		// selectAll is supported for the external AND internal object models.
		if (action === "selectAll") {
			this.objectModel.selectAll();
		}

		if (this.canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "deleteObjects": {
				const command = new DeleteObjectsAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "addComment": {
				const comment = this.objectModel.createComment(this.contextMenuSource);
				const command = new CreateCommentAction(comment, this.objectModel);
				this.commandStack.do(command);
				this.contextMenuSource.commentId = comment.id;
				break;
			}
			case "deleteLink": {
				const command = new DeleteLinkAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "disconnectNode": {
				const command = new DisconnectNodesAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "undo":
				this.commandStack.undo();
				break;
			case "redo":
				this.commandStack.redo();
				break;
			default:
			}
		}

		if (this.handlers.contextMenuActionHandler) {
			this.handlers.contextMenuActionHandler(action, this.contextMenuSource);
		}

		this.commonCanvas.focusOnCanvas(); // Set focus on canvas so keybord events go there.
		this.closeContextMenu();
	}

	toolbarMenuActionHandler(action) {
		const source = {
			selectedObjectIds: this.objectModel.getSelectedObjectIds(),
		};
		if (this.canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "delete": {
				const command = new DeleteObjectsAction(source, this.objectModel);
				this.commandStack.do(command);
				this.commonCanvas.configureToolbarButtonsState();
				break;
			}
			case "cut":
				this.cutToClipboard();
				this.commonCanvas.configureToolbarButtonsState();
				break;
			case "copy":
				this.copyToClipboard();
				this.commonCanvas.configureToolbarButtonsState();
				break;
			case "paste":
				this.pasteFromClipboard();
				this.commonCanvas.configureToolbarButtonsState();
				break;
			case "addComment": {
				const comPos = this.objectModel.getNewCommentPosition();
				source.mousePos = {
					x: comPos.x_pos,
					y: comPos.y_pos
				};
				const comment = this.objectModel.createComment(source);
				const command = new CreateCommentAction(comment, this.objectModel);
				this.commandStack.do(command);
				source.commentId = comment.id;
				break;
			}
			case "arrangeHorizontally": {
				const command = new ArrangeLayoutAction(constants.HORIZONTAL, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "arrangeVertically": {
				const command = new ArrangeLayoutAction(constants.VERTICAL, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "undo":
				this.commandStack.undo();
				this.commonCanvas.configureToolbarButtonsState();
				break;
			case "redo":
				this.commandStack.redo();
				this.commonCanvas.configureToolbarButtonsState();
				break;
			default:
			}
		}

		if (this.handlers.toolbarMenuActionHandler) {
			this.handlers.toolbarMenuActionHandler(action, source);
		}
	}

	clickActionHandler(source) {
		if (source.clickType === "SINGLE_CLICK" && source.objectType === "canvas") {
			// Don"t clear the selection if the canvas context menu is up
			if (!this.commonCanvas.isContextMenuDisplayed()) {
				this.objectModel.clearSelection();
			}

			// if (this.state.rightFlyoutContent && this.props.closeRightFlyout) {
			// 	this.props.closeRightFlyout(); // Equivalent of canceling
			// }
		}

		if (this.handlers.clickActionHandler) {
			this.handlers.clickActionHandler(source);
		}
	}

	decorationActionHandler(node, id) {
		if (this.handlers.decorationActionHandler) {
			this.handlers.decorationActionHandler(node, id);
		}
	}

	editActionHandler(data) {
		if (this.canvasConfig.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				const node = this.objectModel.createNode(data);
				const command = new CreateNodeAction(node, this.objectModel);
				this.commandStack.do(command);
				// need to pass the nodeid along to any this.props.editActionHandlers
				data.nodeId = node.id;
				break;
			}
			case "createNodeOnLink": {
				const command = new CreateNodeOnLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "createAutoNode": {
				const command = new CreateAutoNodeAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "cloneMultipleObjects": {
				const command = new CloneMultipleObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "moveObjects": {
				const command = new MoveObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "editComment": {
				// only add editComment action, if value or size of comment has changed
				const selectedComment = this.objectModel.getComment(data.nodes[0]);
				if (selectedComment.content !== data.label ||
						selectedComment.height !== data.height ||
						selectedComment.width !== data.height) {
					const command = new EditCommentAction(data, this.objectModel);
					this.commandStack.do(command);
				}
				break;
			}
			case "linkNodes": {
				const linkNodesList = this.objectModel.createNodeLinks(data);
				if (linkNodesList.length > 0) {
					const command = new AddLinksAction(linkNodesList, this.objectModel);
					this.commandStack.do(command);
					data.linkIds = linkNodesList.map((link) => link.id);
				}
				break;
			}
			case "linkComment": {
				const linkCommentList = this.objectModel.createCommentLinks(data);
				if (linkCommentList.length > 0) {
					const command = new AddLinksAction(linkCommentList, this.objectModel);
					this.commandStack.do(command);
					data.linkIds = linkCommentList.map((link) => link.id);

				}
				break;
			}
			case "deleteSelectedObjects": {
				const command = new DeleteObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "undo":
				this.commandStack.undo();
				break;
			case "redo":
				this.commandStack.redo();
				break;
			default:
			}
		}

		if (this.handlers.editActionHandler) {
			this.handlers.editActionHandler(data);
		}
	}
}
