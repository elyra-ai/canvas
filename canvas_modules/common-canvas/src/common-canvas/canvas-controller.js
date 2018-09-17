/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 30] */

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
import DisplayPreviousPipelineAction from "../command-actions/displayPreviousPipelineAction.js";
import DisplaySubPipelineAction from "../command-actions/displaySubPipelineAction.js";
import EditCommentAction from "../command-actions/editCommentAction.js";
import ExpandSuperNodeInPlaceAction from "../command-actions/expandSuperNodeInPlaceAction.js";
import MoveObjectsAction from "../command-actions/moveObjectsAction.js";
import SetObjectsStyleAction from "../command-actions/setObjectsStyleAction.js";
import SetLinksStyleAction from "../command-actions/setLinksStyleAction.js";
import Logger from "../logging/canvas-logger.js";
import ObjectModel from "../object-model/object-model.js";
import SizeAndPositionObjectsAction from "../command-actions/sizeAndPositionObjectsAction.js";
import has from "lodash/has";

// Global instance ID counter
var commonCanvasControllerInstanceId = 0;
const labelChoices = { canvas_addComment: "New comment",
	canvas_selectAll: "Select All", edit_cutSelection: "Cut",
	edit_copySelection: "Copy", edit_pasteSelection: "Paste",
	canvas_undo: "Undo", canvas_redo: "Redo",
	node_createSuperNode: "Create supernode",
	node_expandSuperNodeInPlace: "Expand supernode",
	node_collapseSuperNodeInPlace: "Collapse supernode", node_editNode: "Open",
	canvas_deleteObject: "Delete", node_disconnectNode: "Disconnect", link_deleteLink: "Delete",
	canvas_validateFlow: "Validate Flow", node_editMenu: "Edit" };

export default class CanvasController {

	constructor() {
		this.defaultTipConfig = {
			"palette": true,
			"nodes": true,
			"ports": true,
			"links": true
		};

		this.logger = new Logger("CanvasController");

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

		this.highlight = false;
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

	isInternalObjectModelEnabled() {
		return this.canvasConfig.enableInternalObjectModel;
	}

	setFixedAutoLayout(selectedLayout) {
		this.objectModel.setFixedAutoLayout(selectedLayout);
	}

	// ---------------------------------------------------------------------------
	// Pipeline flow methods
	// ---------------------------------------------------------------------------

	setPipelineFlow(flow) {
		this.objectModel.setPipelineFlow(flow);
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

	getAncestorPipelineIds(pipelineId) {
		return this.objectModel.getAncestorPipelineIds(pipelineId);
	}

	removeAllStyles(temporary) {
		this.objectModel.removeAllStyles(temporary);
	}

	setSubdueStyle(newStyle) {
		this.objectModel.setSubdueStyle(newStyle);
	}

	// ---------------------------------------------------------------------------
	// Pipeline methods
	// ---------------------------------------------------------------------------

	getFlowMessages(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getFlowMessages();
	}

	isFlowValid(includeMsgTypes, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isFlowValid(includeMsgTypes);
	}

	autoLayout(layoutDirection, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).autoLayout(layoutDirection);
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

	getSelectedPipelineId() {
		return this.objectModel.getSelectedPipelineId();
	}

	deleteSelectedObjects() {
		this.objectModel.deleteSelectedObjects();
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

	setObjectsClassName(objectId, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setObjectsClassName(objectId, newClassName);
	}

	setObjectsStyle(pipelineObjectIds, newStyle, pipelineId, temporary, addToCommandStack) {
		if (addToCommandStack) {
			const data = { editType: "setObjectsStyle", pipelineObjectIds: pipelineObjectIds, style: newStyle, pipelineId: pipelineId, temporary: temporary };
			this.editActionHandler(data);
		} else {
			this.objectModel.getAPIPipeline(pipelineId).setObjectsStyle(pipelineObjectIds, newStyle, temporary);
		}
	}

	// ---------------------------------------------------------------------------
	// Node methods
	// ---------------------------------------------------------------------------

	getNodes(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodes();
	}

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

	setNodeUiParameters(nodeId, uiParameters, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeUiParameters(nodeId, uiParameters);
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

	setNodeDecorations(nodeId, newDecorations, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeDecorations(nodeId, newDecorations);
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

	getNodeUiParameters(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeUiParameters(nodeId);
	}

	getSupernodes(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getSupernodes();
	}

	// Returns supernode id that have a subflow_ref to the given pipelineId.
	getSupernodeObjReferencing(pipelineId) {
		return this.objectModel.getSupernodeObjReferencing(pipelineId);
	}

	getNodeMessages(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessages(nodeId);
	}

	getNodeMessage(nodeId, controlName, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessage(nodeId, controlName);
	}

	getNodeDecorations(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeDecorations(nodeId);
	}

	addCustomAttrToNodes(nodeIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToNodes(nodeIds, attrName);
	}

	removeCustomAttrFromNodes(nodeIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrToNodes(nodeIds, attrName);
	}

	canNodeBeDroppedOnLink(operatorIdRef, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).canNodeBeDroppedOnLink(operatorIdRef);
	}

	isSuperNodeExpandedInPlace(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isSuperNodeExpandedInPlace(nodeId);
	}

	// ---------------------------------------------------------------------------
	// Comments methods
	// ---------------------------------------------------------------------------

	getComments(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComments();
	}

	getComment(comId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComment(comId);
	}

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

	addCustomAttrToComments(comIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToComments(comIds, attrName);
	}

	removeCustomAttrFromComments(comIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrToComments(comIds, attrName);
	}

	// ---------------------------------------------------------------------------
	// Links methods
	// ---------------------------------------------------------------------------

	getLink(linkId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLink(linkId);
	}

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

	setLinksClassName(linkIds, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setLinksClassName(linkIds, newClassName);
	}

	setLinksStyle(pipelineLinkIds, newStyle, pipelineId, temporary, addToCommandStack) {
		if (addToCommandStack) {
			const data = { editType: "setLinksStyle", pipelineLinkIds: pipelineLinkIds, style: newStyle, pipelineId: pipelineId, temporary: temporary };
			this.editActionHandler(data);
		} else {
			this.objectModel.getAPIPipeline(pipelineId).setLinksStyle(pipelineLinkIds, newStyle, temporary);
		}
	}

	// ---------------------------------------------------------------------------
	// Command stack methods
	// ---------------------------------------------------------------------------

	getCommandStack() {
		return this.commandStack;
	}

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

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	getBreadcrumbs() {
		return this.objectModel.getBreadcrumbs();
	}

	getCurrentBreadcrumb() {
		return this.objectModel.getCurrentBreadcrumb();
	}

	// ---------------------------------------------------------------------------
	// Highlight methods
	// ---------------------------------------------------------------------------

	setHighlightStyle(highlightObjectIds, pipelineId) {
		this.removeAllStyles(true);
		const objectStyle = {
			body: {
				default: `fill: ${constants.HIGHLIGHT_FILL} ;stroke: ${constants.HIGHLIGHT_STROKE};`,
				hover: `fill: ${constants.HIGHLIGHT_HOVER_FILL};`
			}
		};
		const linkStyle = {
			default: `stroke: ${constants.HIGHLIGHT_STROKE};, hover: stroke-width: ${constants.HIGHLIGHT_STROKE_WIDTH}`
		};
		this.setObjectsStyle(highlightObjectIds.nodes, objectStyle, pipelineId, true, false);
		this.setLinksStyle(highlightObjectIds.links, linkStyle, pipelineId, true, false);
		this.highlight = true;
	}

	highlightBranch(pipelineId, nodeIds) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_BRANCH);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
	}

	highlightUpstream(pipelineId, nodeIds) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_UPSTREAM);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
	}

	highlightDownstream(pipelineId, nodeIds) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_DOWNSTREAM);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
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

	isPaletteOpen() {
		if (this.commonCanvas) {
			return this.commonCanvas.isPaletteOpen();
		}
		return false;
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
		const nodes = this.objectModel.getSelectedNodes();
		const comments = this.objectModel.getSelectedComments();
		const links = apiPipeline.getLinksBetween(nodes, comments);
		const pipelines = [];

		if (nodes.length === 0 && comments.length === 0) {
			return false;
		}

		if (nodes && nodes.length > 0) {
			copyData.nodes = nodes;
			const supernodes = apiPipeline.getSupernodes(nodes);
			supernodes.forEach((supernode) => {
				if (has(supernode, "subflow_ref.pipeline_id_ref")) {
					pipelines.push(this.objectModel.getCanvasInfoPipeline(supernode.subflow_ref.pipeline_id_ref));
					const subPiplines = this.objectModel.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref);
					subPiplines.forEach((subPiplineId) => {
						pipelines.push(this.objectModel.getCanvasInfoPipeline(subPiplineId));
					});
				}
			});
			copyData.pipelines = pipelines;
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

		// If a pipeline is not provided (like when the user clicks paste in the
		// toolbar or uses keyboard short cut) this will get an APIPipeline for
		// the latest breadcrumbs entry.
		const apiPipeline = this.objectModel.getAPIPipeline(pipelineId);

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

	openTip(tipConfig) {
		if (this.commonCanvas && !this.isTipOpen() && this.isTipEnabled(tipConfig.type)) {
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

			this.commonCanvas.openTip(tipConfig);
		}
	}

	closeTip() {
		if (this.commonCanvas) {
			this.commonCanvas.closeTip();
		}
	}

	isTipOpen() {
		return this.commonCanvas.isTipOpen();
	}

	isTipOpening() {
		return this.commonCanvas.isTipOpening();
	}

	isTipClosing() {
		return this.commonCanvas.isTipClosing();
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

	displayPreviousPipeline() {
		const data = { editType: "displayPreviousPipeline", pipelineInfo: this.objectModel.getPreviousBreadcrumb() };
		this.editActionHandler(data);
	}

	getLabel(labelId, defaultLabel) {
		if (labelChoices[labelId]) {
			return labelChoices[labelId];
		}
		return defaultLabel;
	}

	createEditMenu(source) {
		let editSubMenu = [];
		editSubMenu = editSubMenu.concat({ action: "cut", label: this.getLabel("edit_cutSelection", "Cut"), enable: source.selectedObjectIds.length > 0 },
			{ action: "copy", label: this.getLabel("edit_copySelection", "Copy"), enable: source.selectedObjectIds.length > 0 },
			{ action: "paste", label: this.getLabel("edit_pasteSelection", "Paste"), enable: !this.isClipboardEmpty() });
		return editSubMenu;
	}

	createHighlightMenu(source) {
		const highlightSubMenu = [
			{ action: "highlightBranch", label: "Highlight Branch" },
			{ action: "highlightUpstream", label: "Highlight Upstream" },
			{ action: "highlightDownstream", label: "Highlight Downstream" }
		];
		return highlightSubMenu;
	}

	// This should only appear in menu if highlight is true.
	createUnhighlightMenu(source) {
		const unhighlightSubMenu = [
			{ action: "unhighlight", label: "Unhighlight", enable: this.highlight }
		];
		return unhighlightSubMenu;
	}

	createDefaultMenu(source) {
		let menuDefinition = [];
		// Select all & add comment: canvas only
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "addComment", label: this.getLabel("canvas_addComment", "New comment") },
				{ action: "selectAll", label: this.getLabel("canvas_selectAll", "Select All") },
				{ divider: true }]);
		}
		// Disconnect node
		if (source.type === "node" || source.type === "comment") {
			const linksFound = this.objectModel.getAPIPipeline(source.pipelineId).getLinksContainingIds(source.selectedObjectIds);
			if (linksFound.length > 0) {
				menuDefinition = menuDefinition.concat({ action: "disconnectNode", label: this.getLabel("node_disconnectNode", "Disconnect") });
				menuDefinition = menuDefinition.concat({ divider: true });
			}
		}
		// Edit submenu (cut, copy, paste)
		if (source.type === "node" || source.type === "comment" || source.type === "canvas") {
			const editSubMenu = this.createEditMenu(source);
			menuDefinition = menuDefinition.concat({ submenu: true, menu: editSubMenu, label: this.getLabel("node_editMenu", "Edit") });
			menuDefinition = menuDefinition.concat({ divider: true });
		}
		// Undo and redo
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "undo", label: this.getLabel("canvas_undo", "Undo"), enable: this.canUndo() },
				{ action: "redo", label: this.getLabel("canvas_redo", "Redo"), enable: this.canRedo() },
				{ divider: true }]);
		}
		// Delete objects
		if (source.type === "node" || source.type === "comment") {
			menuDefinition = menuDefinition.concat([{ action: "deleteObjects", label: this.getLabel("canvas_deleteObject", "Delete") }, { divider: true }]);
		}
		// Create supernode
		if (source.type === "node" || source.type === "comment") {
			if ((has(this, "canvasConfig.contextMenuConfig.enableCreateSupernodeNonContiguous") &&
					this.canvasConfig.contextMenuConfig.enableCreateSupernodeNonContiguous) ||
					this.areSelectedNodesContiguous()) {
				menuDefinition = menuDefinition.concat([{ action: "createSuperNode", label: this.getLabel("node_createSuperNode", "Create supernode") }]);
				menuDefinition = menuDefinition.concat([{ divider: true }]);
			}
		}
		// Expand and Collapse supernode
		if ((source.type === "node") && (source.selectedObjectIds.length === 1 && source.targetObject.type === "super_node")) {
			// Expand
			if ((!this.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) &&
				(source.targetObject.open_with_tool === "canvas" || typeof source.targetObject.open_with_tool === "undefined")) {
				menuDefinition = menuDefinition.concat({ action: "expandSuperNodeInPlace",
					label: this.getLabel("node_expandSuperNodeInPlace", "Expand supernode") }, { divider: true });
			}
			// Collapse
			if (this.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
				menuDefinition = menuDefinition.concat({ action: "collapseSuperNodeInPlace",
					label: this.getLabel("node_collapseSuperNodeInPlace", "Collapse supernode") }, { divider: true });
			}
		}
		// Delete link
		if (source.type === "link") {
			menuDefinition = menuDefinition.concat([{ action: "deleteLink", label: this.getLabel("link_deleteLink", "Delete") }]);
		}
		// Highlight submenu (Highlight Branch | Upstream | Downstream, Unhighlight)
		if (source.type === "node") {
			let highlightSubMenuDef = this.createHighlightMenu(source);
			highlightSubMenuDef.push({ divider: true });
			highlightSubMenuDef = highlightSubMenuDef.concat(this.createUnhighlightMenu(source));
			menuDefinition = menuDefinition.concat({ submenu: true, menu: highlightSubMenuDef, label: this.getLabel("node_highlightMenu", "Highlight") });
		}
		if (source.type === "canvas") {
			const unhighlightSubMenuDef = this.createUnhighlightMenu(source);
			menuDefinition = menuDefinition.concat({ submenu: true, menu: unhighlightSubMenuDef, label: this.getLabel("node_highlightMenu", "Highlight") });
		}
		return (menuDefinition);
	}

	contextMenuHandler(source) {
		const defMenu = this.createDefaultMenu(source);
		if (typeof this.handlers.contextMenuHandler === "function") {
			this.contextMenuSource = source;
			const menuDef = this.handlers.contextMenuHandler(source, defMenu);
			if (menuDef && menuDef.length > 0) {
				this.openContextMenu(menuDef);
			}
		} else {
			this.openContextMenu(defMenu);
		}
	}

	getContextMenuPos() {
		if (this.contextMenuSource) {
			return this.contextMenuSource.cmPos;
		}
		return { x: 0, y: 0 };
	}

	contextMenuActionHandler(action) {
		this.logger.log("contextMenuActionHandler - action: " + action);
		// selectAll is supported for the external AND internal object models.
		if (action === "selectAll") {
			this.objectModel.selectAll(this.contextMenuSource.pipelineId);
		}

		if (this.canvasConfig.enableInternalObjectModel) {
			switch (action) {
			case "createSuperNode": {
				const command = new CreateSuperNodeAction(this.contextMenuSource, this.objectModel);
				this.commandStack.do(command);
				this.contextMenuSource = command.getData();
				break;
			}
			case "expandSuperNodeInPlace": {
				const command = new ExpandSuperNodeInPlaceAction(this.contextMenuSource, this.objectModel, this.canvasConfig.enableMoveNodesOnSupernodeResize);
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
			case "displayPreviousPipeline": {
				const command = new DisplayPreviousPipelineAction({}, this.objectModel);
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
			case "highlightBranch":
				this.contextMenuSource.highlightedObjectIds = this.highlightBranch(this.contextMenuSource.pipelineId, this.objectModel.getSelectedNodesIds());
				break;
			case "highlightDownstream":
				this.contextMenuSource.highlightedObjectIds = this.highlightDownstream(this.contextMenuSource.pipelineId, this.objectModel.getSelectedNodesIds());
				break;
			case "highlightUpstream":
				this.contextMenuSource.highlightedObjectIds = this.highlightUpstream(this.contextMenuSource.pipelineId, this.objectModel.getSelectedNodesIds());
				break;
			case "unhighlight":
				// this.setSubdueStyle(null);
				this.removeAllStyles(true);
				this.highlight = false; // TODO: use this for context menu when to show unhighlight option.
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
		this.logger.log("toolbarMenuActionHandler - action: " + action);
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
		this.logger.log("clickActionHandler - " + source.clickType + " on " + source.objectType);
		if (this.handlers.clickActionHandler) {
			this.handlers.clickActionHandler(source);
		}
	}

	decorationActionHandler(node, id) {
		this.logger.log("decorationActionHandler - node: " + node.id + " id: " + id);
		if (this.handlers.decorationActionHandler) {
			this.handlers.decorationActionHandler(node, id);
		}
	}

	editActionHandler(cmndData) {
		this.logger.log("editActionHandler - " + cmndData.editType);
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
			case "setObjectsStyle": {
				const command = new SetObjectsStyleAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "setLinksStyle": {
				const command = new SetLinksStyleAction(data, this.objectModel);
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
			case "displayPreviousPipeline": {
				const command = new DisplayPreviousPipelineAction(data, this.objectModel);
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
