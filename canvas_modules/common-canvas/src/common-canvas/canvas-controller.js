/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 22] */
/* eslint no-console: "off" */

import ArrangeLayoutAction from "../command-actions/arrangeLayoutAction.js";
import CloneMultipleObjectsAction from "../command-actions/cloneMultipleObjectsAction.js";
import CommandStack from "../command-stack/command-stack.js";
import constants from "./constants/canvas-constants";
import CreateAutoNodeAction from "../command-actions/createAutoNodeAction.js";
import CreateCommentAction from "../command-actions/createCommentAction.js";
import CreateCommentLinkAction from "../command-actions/createCommentLinkAction.js";
import CreateNodeAction from "../command-actions/createNodeAction.js";
import CreateNodeLinkAction from "../command-actions/createNodeLinkAction.js";
import CreateNodeOnLinkAction from "../command-actions/createNodeOnLinkAction.js";
import CreateSuperNodeAction from "../command-actions/createSuperNodeAction.js";
import CollapseSuperNodeInPlaceAction from "../command-actions/collapseSuperNodeInPlaceAction.js";
import DeleteLinkAction from "../command-actions/deleteLinkAction.js";
import DeleteObjectsAction from "../command-actions/deleteObjectsAction.js";
import DisconnectNodesAction from "../command-actions/disconnectNodesAction.js";
import DisplayParentPipelineAction from "../command-actions/displayParentPipelineAction.js";
import DisplaySubPipelineAction from "../command-actions/displaySubPipelineAction.js";
import EditCommentAction from "../command-actions/editCommentAction.js";
import ExpandSuperNodeInPlaceAction from "../command-actions/expandSuperNodeInPlaceAction.js";
import MoveObjectsAction from "../command-actions/moveObjectsAction.js";
import ObjectModel from "../object-model/object-model.js";
import SizeAndPositionObjectsAction from "../command-actions/sizeAndPositionObjectsAction.js";
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
			selectionChangeHandler: null,
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

	// ---------------------------------------------------------------------------
	// Config methods
	// ---------------------------------------------------------------------------

	setCanvasConfig(config) {
		this.canvasConfig = Object.assign(this.canvasConfig, config);
		this.objectModel.setSchemaValidation(this.canvasConfig.schemaValidation);
	}

	setHandlers(inHandlers) {
		this.handlers = Object.assign(this.handlers, inHandlers);
		this.objectModel.setIdGeneratorHandler(inHandlers.idGeneratorHandler);
		this.objectModel.setSelectionChangeHandler(inHandlers.selectionChangeHandler);
	}

	setCommonCanvas(comcan) {
		this.commonCanvas = comcan;
	}

	// Allow application to set instanceId.  Needed for server side rendering to prevent
	// new instanceId from being created on page refreshes.
	setInstanceId(instanceId) {
		this.instanceId = instanceId;
	}

	// Return a unique identifier for this instance of common canvas.
	getInstanceId() {
		return this.instanceId;
	}

	getObjectModel() {
		return this.objectModel;
	}

	getCommandStack() {
		return this.commandStack;
	}

	// ---------------------------------------------------------------------------
	// Pipeline flow methods
	// ---------------------------------------------------------------------------

	setPipelineFlow(flow) {
		this.objectModel.setPipelineFlow(flow);
	}

	setEmptyPipelineFlow() {
		this.objectModel.setEmptyPipelineFlow();
	}

	clearPipelineFlow() {
		this.objectModel.clearPipelineFlow();
	}

	getPipelineFlow() {
		return this.objectModel.getPipelineFlow();
	}

	getPrimaryPipelineId() {
		return this.objectModel.getPrimaryPipelineId();
	}

	getCanvasInfo() {
		return this.objectModel.getCanvasInfo();
	}

	// ---------------------------------------------------------------------------
	// Deprecated methods
	// ---------------------------------------------------------------------------

	setCanvas(canvas) {
		this.objectModel.setCanvas(canvas); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	setPaletteData(paletteData) {
		this.objectModel.setPaletteData(paletteData); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	getCanvas() {
		return this.objectModel.getCanvas(); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	// ---------------------------------------------------------------------------
	// Palette methods
	// ---------------------------------------------------------------------------

	setPipelineFlowPalette(palette) {
		this.objectModel.setPipelineFlowPalette(palette);
	}

	clearPaletteData() {
		this.objectModel.clearPaletteData();
	}

	addNodeTypeToPalette(nodeTypeObj, category, categoryLabel, pipelineId) {
		this.objectModel.addNodeTypeToPalette(nodeTypeObj, category, categoryLabel);
	}

	getPaletteData() {
		return this.objectModel.getPaletteData();
	}

	getPaletteNode(operatorId) {
		return this.objectModel.getPaletteNode(operatorId);
	}

	// ---------------------------------------------------------------------------
	// Node methods
	// ---------------------------------------------------------------------------

	addNode(node, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addNode(node);
	}

	createNode(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createNode(data);
	}

	deleteNode(nodeId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteNode(nodeId);
	}

	disconnectNodes(source, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).disconnectNodes(source);
	}

	setNodeParameters(nodeId, parameters, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeParameters(nodeId, parameters);
	}

	setNodeMessages(nodeId, messages, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeMessages(nodeId, messages);
	}

	setNodeMessage(nodeId, message, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeMessage(nodeId, message);
	}

	setNodeLabel(nodeId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeLabel(nodeId, newLabel);
	}

	setInputPortLabel(nodeId, portId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setInputPortLabel(nodeId, portId, newLabel);
	}

	setOutputPortLabel(nodeId, portId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setOutputPortLabel(nodeId, portId, newLabel);
	}
	getNode(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNode(nodeId);
	}

	getNodes(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodes();
	}

	getNodeMessages(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessages(nodeId);
	}

	getNodeMessage(nodeId, controlName, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessage(nodeId, controlName);
	}

	getFlowMessages(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getFlowMessages();
	}

	isFlowValid(includeMsgTypes, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isFlowValid(includeMsgTypes);
	}

	addCustomAttrToNodes(objIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToNodes(objIds, attrName);
	}

	removeCustomAttrFromNodes(objIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrToNodes(objIds, attrName);
	}

	canNodeBeDroppedOnLink(operatorIdRef, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).canNodeBeDroppedOnLink(operatorIdRef);
	}

	fixedAutoLayout(selectedLayout) {
		this.objectModel.fixedAutoLayout(selectedLayout);
	}

	autoLayout(layoutDirection, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).autoLayout(layoutDirection);
	}

	// ---------------------------------------------------------------------------
	// Selections methods
	// ---------------------------------------------------------------------------

	setSelections(newSelection, pipelineId) {
		this.objectModel.setSelections(newSelection, pipelineId);
	}

	clearSelections() {
		if (!this.commonCanvas.isContextMenuDisplayed()) {
			this.objectModel.clearSelections();
		}
	}

	selectAll() {
		this.objectModel.selectAll();
	}

	getSelectedObjectIds() {
		return this.objectModel.getSelectedObjectIds();
	}

	getSelectedNodes() {
		return this.objectModel.getSelectedNodes();
	}

	getSelectedComments() {
		return this.objectModel.getSelectedComments();
	}

	areSelectedNodesContiguous() {
		return this.objectModel.areSelectedNodesContiguous();
	}

	// ---------------------------------------------------------------------------
	// Notification messages methods
	// ---------------------------------------------------------------------------

	setNotificationMessages(newMessages) {
		this.objectModel.setNotificationMessages(newMessages);
	}

	clearNotificationMessages() {
		this.objectModel.clearNotificationMessages();
	}

	getNotificationMessages(messageType) {
		return this.objectModel.getNotificationMessages(messageType);
	}

	// ---------------------------------------------------------------------------
	// Objects (nodes and comments) methods
	// ---------------------------------------------------------------------------

	moveObjects(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).moveObjects(data);
	}

	deleteObjects(source, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteObjects(source);
	}

	deleteObject(id, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteObject(id);
	}

	deleteSelectedObjects() {
		this.objectModel.deleteSelectedObjects();
	}

	getAllObjectIds() {
		return this.objectModel.getAllObjectIds();
	}

	// getOffsetIntoNegativeSpace(editType, offsetX, offsetY) {
	// 	return this.objectModel.getOffsetIntoNegativeSpace(editType, offsetX, offsetY);
	// }

	// ---------------------------------------------------------------------------
	// Links methods
	// ---------------------------------------------------------------------------

	addLinks(linkList, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addLinks(linkList);
	}

	deleteLink(source, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteLink(source);
	}

	createNodeLinks(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createNodeLinks(data);
	}

	createCommentLinks(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createCommentLinks(data);
	}

	getLink(linkId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLink(linkId);
	}

	// ---------------------------------------------------------------------------
	// Comments methods
	// ---------------------------------------------------------------------------

	createComment(source, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createComment(source);
	}

	addComment(info, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addComment(info);
	}

	editComment(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).editComment(data);
	}

	deleteComment(id, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteComment(id);
	}

	getComment(comId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComment(comId);
	}

	getComments(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComments();
	}

	addCustomAttrToComments(objIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToComments(objIds, attrName);
	}

	removeCustomAttrFromComments(objIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrToComments(objIds, attrName);
	}

	// ---------------------------------------------------------------------------
	// Command stack methods
	// ---------------------------------------------------------------------------

	undo() {
		if (this.canUndo()) {
			this.editActionHandler({ editType: "undo" });
		}
	}

	redo() {
		if (this.canRedo()) {
			this.editActionHandler({ editType: "redo" });
		}
	}

	canUndo() {
		return this.getCommandStack().canUndo();
	}

	canRedo() {
		return this.getCommandStack().canRedo();
	}

	isInternalObjectModelEnabled() {
		return this.canvasConfig.enableInternalObjectModel;
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	getCurrentBreadcrumb() {
		return this.objectModel.getCurrentBreadcrumb();
	}

	// ---------------------------------------------------------------------------
	// Operational methods
	// ---------------------------------------------------------------------------

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

	openNotificationPanel() {
		if (this.commonCanvas) {
			this.commonCanvas.openNotificationPanel();
		}
	}

	closeNotificationPanel() {
		if (this.commonCanvas) {
			this.commonCanvas.closeNotificationPanel();
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
			const apiPipeline = this.objectModel.getSelectionAPIPipeline();
			this.editActionHandler({
				editType: "deleteSelectedObjects",
				selectedObjectIds: this.objectModel.getSelectedObjectIds(),
				pipelineId: apiPipeline.pipelineId
			});
		}
	}

	// Copies the currently selected objects to the internal clipboard and
	// returns true if successful. Returns false if there is nothing to copy to
	// the clipboard.
	copyToClipboard() {
		var copyData = {};

		const apiPipeline = this.objectModel.getSelectionAPIPipeline();
		if (!apiPipeline) {
			return false;
		}
		var nodes = this.objectModel.getSelectedNodes();
		var comments = this.objectModel.getSelectedComments();
		var links = apiPipeline.getLinksBetween(nodes, comments);

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
		return typeof localStorage === "undefined" || !localStorage.canvasClipboard || localStorage.canvasClipboard === "";
	}

	pasteFromClipboard(pipelineId) {
		var pastedText = localStorage.canvasClipboard;

		var objects = JSON.parse(pastedText);

		// If there are no nodes and no comments there's nothing to paste so just
		// return.
		if (!objects.nodes && !objects.comments) {
			return;
		}

		// Find a target pipeline for the objects to be pasted into: first, if
		// a source object containing a pipelineId is provided (by the context menu)
		// use it; second, ask the object model to make a suggestion.
		let apiPipeline;
		if (pipelineId) {
			apiPipeline = this.objectModel.getAPIPipeline(pipelineId);
		} else {
			apiPipeline = this.objectModel.getAPIPipeline();
		}

		// Offset position of pasted nodes and comments if they exactly overlap
		// existing nodes and comments - this can happen when pasting over the top
		// of the canvas from which the nodes and comments were copied.
		while (apiPipeline.exactlyOverlaps(objects.nodes, objects.comments)) {
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
			objects: objects,
			pipelineId: apiPipeline.pipelineId
		});
	}

	showTip(tipConfig) {
		if (this.commonCanvas && !this.isTipShowing() && this.isTipEnabled(tipConfig.type)) {
			if (this.handlers.tipHandler) {
				const data = {};
				// Copy only required fields from tipConfig to data object - ignore other fields in tipConfig
				switch (tipConfig.type) {
				case constants.TIP_TYPE_PALETTE_ITEM:
					data.nodeTemplate = tipConfig.nodeTemplate;
					break;
				case constants.TIP_TYPE_PALETTE_CATEGORY:
					data.category = tipConfig.category;
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
		case constants.TIP_TYPE_PALETTE_CATEGORY:
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
		const apiPipeline = this.objectModel.getAPIPipeline();
		var data = {
			editType: "createAutoNode",
			nodeTemplate: nodeTemplate,
			pipelineId: apiPipeline.pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas
	createNodeFromTemplateAt(nodeTemplate, x, y, pipelineId) {
		var data = {
			editType: "createNode",
			nodeTemplate: nodeTemplate,
			offsetX: x,
			offsetY: y,
			pipelineId: pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas and dropped
	// onto an existing link between two data nodes.
	createNodeFromTemplateOnLinkAt(nodeTemplate, link, x, y, pipelineId) {
		var data = {
			editType: "createNodeOnLink",
			nodeTemplate: nodeTemplate,
			offsetX: x,
			offsetY: y,
			link: link,
			pipelineId: pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the 'output' window (in WML) onto the canvas
	createNodeFromObjectAt(sourceId, sourceObjectTypeId, label, x, y, pipelineId) {
		var data = {
			editType: "createNode",
			label: label, // label will be passed through to the external object model
			offsetX: x,
			offsetY: y,
			sourceObjectId: sourceId,
			sourceObjectTypeId: sourceObjectTypeId,
			pipelineId: pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a data object is dragged from outside common canvas.
	// The data object must contain the 'action' field that is passed to
	// the host app from editActionHandler. The editActionHandler method
	// does not intercept this action.
	createNodeFromDataAt(x, y, data, pipelineId) {
		data.offsetX = x;
		data.offsetY = y;
		data.pipelineId = pipelineId;

		this.editActionHandler(data);
	}

	displaySubPipeline(pipelineInfo) {
		const data = { editType: "displaySubPipeline", pipelineInfo: pipelineInfo };
		this.editActionHandler(data);
	}

	displayParentPipeline() {
		const data = { editType: "displayParentPipeline" };
		this.editActionHandler(data);
	}

	contextMenuHandler(source) {
		if (this.handlers.contextMenuHandler) {
			this.contextMenuSource = source;
			const menuDef = this.handlers.contextMenuHandler(source);
			if (menuDef && menuDef.length > 0) {
				this.openContextMenu(menuDef);
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
			this.objectModel.selectAll(this.contextMenuSource.pipelineId);
		}

		if (this.canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "createSuperNode": {
				const command = new CreateSuperNodeAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "expandSuperNodeInPlace": {
				const command = new ExpandSuperNodeInPlaceAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "collapseSuperNodeInPlace": {
				const command = new CollapseSuperNodeInPlaceAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "deleteObjects": {
				const command = new DeleteObjectsAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "addComment": {
				const command = new CreateCommentAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				this.contextMenuSource = command.getData();
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
			case "displayParentPipeline": {
				const command = new DisplayParentPipelineAction({}, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "undo":
				this.undo();
				break;
			case "redo":
				this.redo();
				break;
			case "cut":
				this.cutToClipboard();
				break;
			case "copy":
				this.copyToClipboard();
				break;
			case "paste":
				this.pasteFromClipboard(this.contextMenuSource.pipelineId);
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
		let source = {
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
				const svgPos = this.commonCanvas.getSvgViewportOffset();
				const command = new CreateCommentAction(source, this.objectModel, svgPos);
				this.commandStack.do(command);
				source = command.getData();
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
		console.log("clickActionHandler - " + source.clickType + " on " + source.objectType);
		if (this.handlers.clickActionHandler) {
			this.handlers.clickActionHandler(source);
		}
	}

	decorationActionHandler(node, id) {
		if (this.handlers.decorationActionHandler) {
			this.handlers.decorationActionHandler(node, id);
		}
	}

	editActionHandler(cmndData) {
		console.log("editActionHandler - " + cmndData.editType);
		let data = cmndData;
		if (this.canvasConfig.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				const command = new CreateNodeAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				data = this.addHistoricalFields(data);
				break;
			}
			case "createNodeOnLink": {
				const command = new CreateNodeOnLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createAutoNode": {
				const command = new CreateAutoNodeAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "cloneMultipleObjects": {
				const command = new CloneMultipleObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "moveObjects": {
				const command = new MoveObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "resizeObjects": {
				const command = new SizeAndPositionObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "editComment": {
				const command = new EditCommentAction(data, this.objectModel);
				this.commandStack.do(command);
				data = this.addHistoricalFieldsEditComment(data);
				break;
			}
			case "linkNodes": {
				const command = new CreateNodeLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "linkComment": {
				const command = new CreateCommentLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "deleteSelectedObjects": {
				const command = new DeleteObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "displaySubPipeline": {
				const command = new DisplaySubPipelineAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "displayParentPipeline": {
				const command = new DisplayParentPipelineAction(data, this.objectModel);
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

	// These fields are added to the data object because historically we've
	// passed this information to the consuming app in these fields.
	addHistoricalFields(data) {
		data.nodeId = data.newNode.id;
		data.label = data.newNode.label;
		data.operator_id_ref = data.newNode.operator_id_ref;
		data.nodeTypeId = data.newNode.operator_id_ref; // TODO - Remove this when WML Canvas migrates to pipeline flow
		return data;
	}

	// These fields are added to the data object because historically we've
	// passed this information to WML Canvas in this way.
	// TODO - Remove this if WML Canvas moved to GFE.
	addHistoricalFieldsEditComment(data) {
		data.nodes = [data.id];
		data.label = data.content;
		data.offsetX = data.x_pos;
		data.offsetY = data.y_pos;

		return data;
	}
}
