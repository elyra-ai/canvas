/*
 * Copyright 2017-2022 Elyra Authors
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

import ArrangeLayoutAction from "../command-actions/arrangeLayoutAction.js";
import AttachNodeToLinksAction from "../command-actions/attachNodeToLinksAction.js";
import CommandStack from "../command-stack/command-stack.js";
import ConvertSuperNodeExternalToLocal from "../command-actions/convertSuperNodeExternalToLocalAction.js";
import ConvertSuperNodeLocalToExternal from "../command-actions/convertSuperNodeLocalToExternalAction.js";
import * as constants from "./constants/canvas-constants";
import CreateAutoNodeAction from "../command-actions/createAutoNodeAction.js";
import CreateCommentAction from "../command-actions/createCommentAction.js";
import CreateCommentLinkAction from "../command-actions/createCommentLinkAction.js";
import CreateNodeAction from "../command-actions/createNodeAction.js";
import CreateNodeLinkAction from "../command-actions/createNodeLinkAction.js";
import CreateNodeLinkDetachedAction from "../command-actions/createNodeLinkDetachedAction.js";
import CreateNodeOnLinkAction from "../command-actions/createNodeOnLinkAction.js";
import CreateNodeAttachLinksAction from "../command-actions/createNodeAttachLinksAction.js";
import CreateSuperNodeAction from "../command-actions/createSuperNodeAction.js";
import CollapseSuperNodeInPlaceAction from "../command-actions/collapseSuperNodeInPlaceAction.js";
import ColorSelectedObjectsAction from "../command-actions/colorSelectedObjectsAction.js";
import DeconstructSuperNodeAction from "../command-actions/deconstructSuperNodeAction.js";
import DeleteLinkAction from "../command-actions/deleteLinkAction.js";
import DeleteObjectsAction from "../command-actions/deleteObjectsAction.js";
import DisconnectObjectsAction from "../command-actions/disconnectObjectsAction.js";
import DisplayPreviousPipelineAction from "../command-actions/displayPreviousPipelineAction.js";
import DisplaySubPipelineAction from "../command-actions/displaySubPipelineAction.js";
import EditCommentAction from "../command-actions/editCommentAction.js";
import EditDecorationLabelAction from "../command-actions/editDecorationLabelAction.js";
import SetNodeLabelAction from "../command-actions/setNodeLabelAction.js";
import ExpandSuperNodeInPlaceAction from "../command-actions/expandSuperNodeInPlaceAction.js";
import InsertNodeIntoLinkAction from "../command-actions/insertNodeIntoLinkAction.js";
import MoveObjectsAction from "../command-actions/moveObjectsAction.js";
import PasteAction from "../command-actions/pasteAction.js";
import SaveToPaletteAction from "../command-actions/saveToPaletteAction.js";
import SetObjectsStyleAction from "../command-actions/setObjectsStyleAction.js";
import SetLinksStyleAction from "../command-actions/setLinksStyleAction.js";
import UpdateLinkAction from "../command-actions/updateLinkAction.js";
import LabelUtil from "./label-util.js";
import Logger from "../logging/canvas-logger.js";
import ObjectModel from "../object-model/object-model.js";
import SizeAndPositionObjectsAction from "../command-actions/sizeAndPositionObjectsAction.js";
import { get, has, isEmpty } from "lodash";
import { LINK_SELECTION_NONE, LINK_SELECTION_DETACHABLE, SNAP_TO_GRID_NONE, SUPER_NODE } from "./constants/canvas-constants";

// Global instance ID counter
var commonCanvasControllerInstanceId = 0;

export default class CanvasController {

	constructor() {
		this.logger = new Logger("CanvasController");

		this.contextMenuConfig = {
			enableCreateSupernodeNonContiguous: false,
			defaultMenuEntries: {
				saveToPalette: false,
				createSupernode: true,
				displaySupernodeFullPage: true,
				colorBackground: true
			}
		};

		this.keyboardConfig = {
			actions: {
				delete: true,
				undo: true,
				redo: true,
				selectAll: true,
				copyToClipboard: true,
				cutToClipboard: true,
				pasteFromClipboard: true
			}
		};

		this.handlers = {
			contextMenuHandler: null,
			beforeEditActionHandler: null,
			editActionHandler: null,
			clickActionHandler: null,
			decorationActionHandler: null,
			tipHandler: null,
			layoutHandler: null,
			idGeneratorHandler: null,
			selectionChangeHandler: null,
			actionLabelHandler: null
		};

		this.contextMenuSource = null;

		this.objectModel = new ObjectModel();
		this.commandStack = new CommandStack();

		// Create a util object to serve up translated messages when needed.
		// The intl object will be provided to labelUtil when we get it from
		// common-canvas.jsx.
		this.labelUtil = new LabelUtil();

		// The following two functions must bind to this so that the correct canvas
		// controller context can be accessed in context menu wrapper component.
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);

		// Increment the global instance ID by 1 each time a new
		// canvas controller is created.
		this.instanceId = commonCanvasControllerInstanceId++;

		this.highlight = false;
	}

	// ---------------------------------------------------------------------------
	// Config methods
	// ---------------------------------------------------------------------------

	setCanvasConfig(config) {
		this.logger.log("Setting Canvas Config");
		const correctConfig = this.correctTypo(config);
		this.objectModel.openPaletteIfNecessary(config);
		this.objectModel.setCanvasConfig(correctConfig);
	}

	// Converts the config option 'enableHightlightNodeOnNewLinkDrag' (which has
	// a typo with a 't' in the middle of 'Highlight') if present, to the correct
	// name.
	// TODO -- remove this at the next major version change.
	correctTypo(config) {
		if (!isEmpty(config) && typeof config.enableHightlightNodeOnNewLinkDrag === "boolean") {
			config.enableHighlightNodeOnNewLinkDrag = config.enableHightlightNodeOnNewLinkDrag;
			delete config.enableHightlightNodeOnNewLinkDrag; // Delete it so it doesn't cause debugging confusion
		}
		return config;
	}

	getCanvasConfig() {
		return this.objectModel.getCanvasConfig();
	}

	setIntl(intl) {
		this.labelUtil.setIntl(intl);
	}

	setToolbarConfig(config) {
		this.logger.log("Setting Toolbar Config");
		this.objectModel.setToolbarConfig(config);
	}

	setNotificationPanelConfig(config) {
		this.logger.log("Setting Notif Panel Config");
		this.objectModel.setNotificationPanelConfig(config);
	}

	setRightFlyoutConfig(config) {
		this.logger.log("Setting Right Flyout Config");
		this.objectModel.setRightFlyoutConfig(config);
	}

	setBottomPanelConfig(config) {
		this.logger.log("Setting Bottom Panel Config");
		this.objectModel.setBottomPanelConfig(config);
	}

	setContextMenuConfig(contextMenuConfig) {
		this.logger.log("Setting Context Menu Config");
		if (contextMenuConfig) {
			const defaultMenuEntries = Object.assign(this.contextMenuConfig.defaultMenuEntries, contextMenuConfig.defaultMenuEntries);
			this.contextMenuConfig = Object.assign(this.contextMenuConfig, contextMenuConfig, { defaultMenuEntries });
		}
	}

	setKeyboardConfig(keyboardConfig) {
		this.logger.log("Setting Keyboard Config");
		if (keyboardConfig && keyboardConfig.actions) {
			this.keyboardConfig.actions = Object.assign({}, this.keyboardConfig.actions, keyboardConfig.actions);
		}
	}

	getKeyboardConfig() {
		return this.keyboardConfig;
	}

	setHandlers(inHandlers) {
		this.logger.log("Setting Handlers");
		this.handlers = Object.assign(this.handlers, inHandlers);
		this.objectModel.setIdGeneratorHandler(inHandlers.idGeneratorHandler);
		this.objectModel.setSelectionChangeHandler(inHandlers.selectionChangeHandler);
		this.objectModel.setLayoutHandler(inHandlers.layoutHandler);
		this.labelUtil.setActionLabelHandler(inHandlers.actionLabelHandler);
	}

	setCanvasContents(canvasContents) {
		this.canvasContents = canvasContents;
	}

	// Returns a reference to the 'top-level' D3 rendering object
	getSVGCanvasD3() {
		if (this.canvasContents) {
			return this.canvasContents.getSVGCanvasD3();
		}
		return null;
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
		return this.getCanvasConfig().enableInternalObjectModel;
	}

	// Returns the redux store
	getStore() {
		return this.getObjectModel().getStore();
	}

	// ---------------------------------------------------------------------------
	// Pipeline flow methods
	// ---------------------------------------------------------------------------

	// Loads the pipelineFlow document provided into common-canvas and displays it.
	// The document must conform to the pipelineFlow schema as documented in the
	// elyra-ai pipeline-schemas repo. Documents conforming to older versions may be
	// provided but they will be upgraded to the most recent version.
	setPipelineFlow(flow) {
		this.objectModel.setPipelineFlow(flow);
		// When a pipeline flow is loaded it may have expanded supernodes which
		// refer to external pipelines and these need to be loaded for the
		// pipeline to display correctly.
		this.ensureVisibleExpandedPipelinesAreLoaded();
	}

	// Clears the pipleine flow and displays an empty canvas.
	clearPipelineFlow() {
		this.objectModel.clearPipelineFlow();
	}

	// Returns the current pipelineFlow document in the latest version of the
	// pipelineFlow schema as documented in the elyra-ai pipeline-schemas repo.
	getPipelineFlow() {
		return this.objectModel.getPipelineFlow();
	}

	// Returns the current pipelineFlow document ID.
	getPipelineFlowId() {
		return this.objectModel.getPipelineFlowId();
	}

	// Returns the ID of the primary pipeline from the pipelineFlow.
	getPrimaryPipelineId() {
		return this.objectModel.getPrimaryPipelineId();
	}

	// Returns the external pipeline flow for the url passed in. The external
	// flow must have been loaded through some common canvas action for this
	// method to be able to return anything.
	getExternalPipelineFlow(url) {
		return this.objectModel.getExternalPipelineFlow(url);
	}

	// Returns the internal format of all canvas data stored in memory by
	// common-canvas. Nodes, comments and links are returned in the internal
	// format.
	getCanvasInfo() {
		return this.objectModel.getCanvasInfo();
	}

	// Returns the IDs of the ancestor pipleline of the pipeline ID passed in.
	getAncestorPipelineIds(pipelineId) {
		return this.objectModel.getAncestorPipelineIds(pipelineId);
	}

	// Removes all styles from nodes, comments and links. See the setObjectsStyle
	// and setLinkStyle methods for details on setting styles.
	// temporary - is a boolean that indicates whether temporary or permanent
	// styles should be removed.
	removeAllStyles(temporary) {
		this.objectModel.removeAllStyles(temporary);
	}

	// Specifies the new styles for objects that are not highlighted during
	// branch highlighting.
	// newStyle - is a style specification object. See wiki for details.
	setSubdueStyle(newStyle) {
		this.objectModel.setSubdueStyle(newStyle);
	}

	// ---------------------------------------------------------------------------
	// Pipeline methods
	// ---------------------------------------------------------------------------

	// Returns the pipeline object for the pipeline Id passed in.
	getPipeline(pipelineId) {
		return this.objectModel.getCanvasInfoPipeline(pipelineId);
	}

	// Returns the ID of the pipeline object which is currently on display
	// in the canvas. Typically, this is the primary pipeline but will be
	// different if the user has navigated into one or more supernodes; in
	// which case it will be the ID of the pipeline at the level in the
	// supernode hierarchy that is currently on display.
	getCurrentPipelineId() {
		return this.objectModel.getCurrentBreadcrumb().pipelineId;
	}

	// Returns truty if the pipeline is external (that is it is part of an
	// external pipeline flow). Otherwise, return falsy to indicate the pipeline
	// is local.
	isPipelineExternal(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isPipelineExternal();
	}

	// Returns the flow validation messages for the pipeline ID passed in.
	getFlowMessages(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getFlowMessages();
	}

	// Returns a boolean to indicate whether there are any messages of
	// includeMsgsType in the pipeline identified by the pipeline ID passed in.
	// includeMsgsType - can be either "error" or "warning"
	isFlowValid(includeMsgTypes, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isFlowValid(includeMsgTypes);
	}

	// Rearranges the nodes in the canvas in the direction specified for the
	// pipeline ID passed in.
	// layoutDirection - can be "horizontal" or "vertical"
	autoLayout(layoutDirection, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).autoLayout(layoutDirection);
	}

	// ---------------------------------------------------------------------------
	// Deprecated methods
	// ---------------------------------------------------------------------------

	// Loads a canvas document (in the format used by WML Canvas) into
	// common-canvas and displays it.
	setCanvas(canvas) {
		this.objectModel.setCanvas(canvas); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	// Loads a canvas palette document (in the format used by WML Canvas) into
	// common-canvas and displays it in the palette.
	setPaletteData(paletteData) {
		this.objectModel.setPaletteData(paletteData); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	// Returns a canvas document (in the format used by WML Canvas).
	getCanvas() {
		return this.objectModel.getCanvas(); // TODO - Remove this method when WML Canvas moves to pipeline flow
	}

	// ---------------------------------------------------------------------------
	// Palette methods
	// ---------------------------------------------------------------------------

	// Loads the palette data as described in the palette schema in
	// elyra-ai pipeline-schemas repo. Any version can be loaded and it will be
	// upgraded to the latest version.
	setPipelineFlowPalette(palette) {
		this.objectModel.setPipelineFlowPalette(palette);
	}

	// Clears the palette data from common-canvas.
	clearPaletteData() {
		this.objectModel.clearPaletteData();
	}

	// Sets the loading text of the category. If set to a non-empty string the
	// category will show an InlineLoading control in the palette category div
	// with this text as the label. If set to falsey the palette category
	// will display as normal.
	setCategoryLoadingText(categoryId, loadingText) {
		this.objectModel.setCategoryLoadingText(categoryId, loadingText);
	}

	// Sets the empty text of the category. If set to a non-empty string and the
	// category does not have any nodes the palette will show a dummy node with
	// this text as the displayed text. If set to falsey no dummy node will be displayed.
	setCategoryEmptyText(categoryId, emptyText) {
		this.objectModel.setCategoryEmptyText(categoryId, emptyText);
	}

	// Adds a new node into the palette:
	// nodeTypeObj - must conform to the style of node used by the palette as
	// described in the palette schema. See objects in nodeTypes array in the
	// palette schema:
	//  https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json
	// category - is the name of the palette category where the node will be
	// added. If the category doesn't exist it will be created.
	// categoryLabel - Is an optional param. If a new category is created it will
	// be displayed with this label.
	// categoryDescription - Is an optional param. If a new category is created
	// it will be displayed with this description.
	// categoryImage - Is an optional param. The image displayed for the category provided as a
	// reference to an image or the image itself.
	addNodeTypeToPalette(nodeTypeObj, categoryId, categoryLabel, categoryDescription, categoryImage) {
		this.objectModel.addNodeTypeToPalette(nodeTypeObj, categoryId, categoryLabel, categoryDescription, categoryImage);
	}

	// Adds an array of new node into the palette:
	// nodeTypeObjs - an array of nodetypes that must conform to the style of
	// nodes used by the palette as described in the palette schema. See objects
	// in nodeTypes array in the palette schema:
	//  https://github.com/elyra-ai/pipeline-schemas/blob/main/common-canvas/palette/palette-v3-schema.json
	// category - is the name of the palette category where the node will be
	// added. If the category doesn't exist it will be created.
	// categoryLabel - is an optional param. If a new category is created it will
	// be displayed with this label.
	// categoryImage - the image displayed for the category provided as a
	// reference to an image or the image itself.
	// categoryDescription - Is an optional param. If a new category is created
	// it will be displayed with this description.
	// categoryImage - Is an optional param. The image displayed for the category provided as a
	// reference to an image or the image itself.
	addNodeTypesToPalette(nodeTypeObjs, categoryId, categoryLabel, categoryDescription, categoryImage) {
		this.objectModel.addNodeTypesToPalette(nodeTypeObjs, categoryId, categoryLabel, categoryDescription, categoryImage);
	}

	// Removes nodetypes from a palette category
	// selObjectIds - an array of object IDs to identify the nodetypes to be
	// removed
	// categoryId - the ID of teh category from which the nodes will be removed
	removeNodesFromPalette(selObjectIds, categoryId) {
		this.objectModel.addNodeTypesToPalette(selObjectIds, categoryId);
	}

	// Returns the palette data document which will conform to the latest version
	// of the palette schema.
	getPaletteData() {
		return this.objectModel.getPaletteData();
	}

	// Returns the palette node identified by the operator ID passed in.
	getPaletteNode(operatorId) {
		return this.objectModel.getPaletteNode(operatorId);
	}

	// Returns the palette node identified by the node ID passed in.
	getPaletteNodeById(nodeId) {
		return this.objectModel.getPaletteNodeById(nodeId);
	}

	// Returns the category of the palette node identified by the operator passed in
	getCategoryForNode(nodeOpIdRef) {
		return this.objectModel.getCategoryForNode(nodeOpIdRef);
	}

	// Converts a node template from the format used in the palette (that conforms
	// to the schema) to the internal node format.
	convertNodeTemplate(nodeTemplate) {
		return this.objectModel.convertNodeTemplate(nodeTemplate);
	}

	// ---------------------------------------------------------------------------
	// Selections methods
	// ---------------------------------------------------------------------------

	// Sets the currently selected objects replacing any current selections.
	// newSelection - An array of object IDs for nodes and/or comments
	// pipelineId - Optional. The ID of the pipeline where the objects exist.
	// Selected objects can only be in one pipeline. If this parameter is omitted
	// it is assumed the selections will be for objects in the 'top-level' pipeline
	// being displayed.
	setSelections(newSelection, pipelineId) {
		this.objectModel.setSelections(newSelection, pipelineId);
	}

	// Clears all the current selections from the canvas.
	clearSelections() {
		this.objectModel.clearSelections();
	}

	// Selects all the objects on the canvas.
	selectAll(pipelineId) {
		// Include links in selectAll unless LinkSelection is "None"
		const includeLinks = this.getCanvasConfig().enableLinkSelection !== LINK_SELECTION_NONE;
		this.objectModel.selectAll(includeLinks, pipelineId);
	}

	isPrimaryPipelineEmpty() {
		return this.objectModel.isPrimaryPipelineEmpty();
	}

	// Returns an array of the IDs of the currently selected objects.
	getSelectedObjectIds() {
		return this.objectModel.getSelectedObjectIds();
	}

	// Returns the currently selected Nodes.
	getSelectedNodes() {
		return this.objectModel.getSelectedNodes();
	}

	// Returns the currently selected Comments.
	getSelectedComments() {
		return this.objectModel.getSelectedComments();
	}

	// Returns the currently selected Links.
	getSelectedLinks() {
		return this.objectModel.getSelectedLinks();
	}

	// Returns the currently selected objects (Nodes and Comments and Links).
	getSelectedObjects() {
		return this.objectModel.getSelectedObjects();
	}

	// Returns the ID of the pipeline in which the currently selected objects
	// exist. Only one pipeline may contain selected objects.
	getSelectedPipelineId() {
		return this.objectModel.getSelectedPipelineId();
	}

	// Deletes all currently selected objects.
	deleteSelectedObjects() {
		this.objectModel.deleteSelectedObjects();
	}

	// Returns true if the currently selected objects are all linked together.
	// This is used when deciding to creating a supernode.
	areSelectedNodesContiguous() {
		return this.objectModel.areSelectedNodesContiguous();
	}

	// Returns true if all the selected objects are links.
	areAllSelectedObjectsLinks() {
		return this.objectModel.areAllSelectedObjectsLinks();
	}

	areDetachableLinksInUse() {
		return this.getCanvasConfig().enableLinkSelection === LINK_SELECTION_DETACHABLE;
	}

	isSnapToGridInUse() {
		return this.getCanvasConfig().enableSnapToGridType !== SNAP_TO_GRID_NONE;
	}

	// ---------------------------------------------------------------------------
	// Notification messages methods
	// ---------------------------------------------------------------------------

	// Overwrites the array of notification messages shown in the notification
	// panel.
	// newMessage - An array of messages (see getNotificationMessages)
	setNotificationMessages(newMessages) {
		this.objectModel.setNotificationMessages(newMessages);
	}

	// Deletes all notification messages shown in the notification panel.
	clearNotificationMessages() {
		this.objectModel.clearNotificationMessages();
	}

	// Removes the notification messages from the given array of ids
	deleteNotificationMessages(ids) {
		this.objectModel.deleteNotificationMessages(ids);
	}

	// Returns the array of current notification messages. If the messageType is
	// provided only messages of that type will be returned. If messageType is
	// not provided, all messages will be returned. The format of a notification
	// message is an object with these fields:
	// {
	//   "id": string (Required),
	//   "type" : enum, oneOf ["info", "success", "warning", "error"] (Required),
	//   "callback": function, the callback function when a message is clicked (Required),
	//   "title": string (Optional),
	//   "content": string, html, JSX Object (Optional),
	//   "timestamp": string (Optional),
	//   "closeMessage": string (Optional)
	// }
	getNotificationMessages(messageType) {
		return this.objectModel.getNotificationMessages(messageType);
	}

	// Returns the maximum notification message type present in the current set
	// of notification messages. For this: ("error" > "warning" > "success" > "info")
	getNotificationMessagesMaxType() {
		return this.objectModel.getNotificationMessagesMaxType();
	}

	// ---------------------------------------------------------------------------
	// Objects (nodes and comments) methods
	// ---------------------------------------------------------------------------

	// Moves the objects identified in the data object which must be in the
	// pipeline identified by the pipeline ID.
	// data - A javascript object like this:
	// {
	//   nodes: []       // An array of node and comment IDs
	//   offsetX: number // Offset in pixels the objects will move in the X dir
	//   offsetY: number // Offset in pixels the objects will move in the Y dir
	// }
	moveObjects(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).moveObjects(data);
	}

	// Deletes the objects specified in objectIds array.
	// objectIds - An array of node and comment IDs
	deleteObjects(objectIds, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteObjects(objectIds);
	}

	// Removes the links to and from the objects specified in the objectIds array.
	// objectIds - An array of node and comment IDs
	disconnectObjects(objectIds, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).disconnectObjects(objectIds);
	}

	// Deletes the object specified by the id in the pipleine specified by
	// pipeline ID.
	// @Deprecated Use deleteNode or deleteComment as appropriate instead.
	deleteObject(id, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteObject(id);
	}

	// Sets the style of the objects specified by pipelineObjectIds to be
	// the newStyle which will be either temporary or permanent.
	// pipelineObjectIds: This identified the objects to be styles. It is a
	// javascript object like this:
	//   {
	//     <pipelineID_1>: [
	//       <objectID_1_1>,
	//       <objectID_1_2
	//     ],
	//     <pipelineID_2>: [
	//         <objectID_2_1>,
	//         <objectID_2_2
	//     ]
	//   }
	// newStyles - This is a style specification. See the wiki for details.
	// temporary - A boolean to indicate if the style is serialized when
	//             getPipelineFlow() method is called or not.
	setObjectsStyle(pipelineObjectIds, newStyle, temporary) {
		this.objectModel.setObjectsStyle(pipelineObjectIds, newStyle, temporary);
	}

	// Sets the styles of multiple objects at once.
	// pipelineObjStyles - Specified the objects and the styles each should be
	// set to. It is a javascript array like this:
	//   [
	//     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>},
	//     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>},
	//     { pipelineId: <pipelineId>, objId: <objectId>, style: <style_spec>}
	//   ]
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	setObjectsMultiStyle(pipelineObjStyles, temporary) {
		this.objectModel.setObjectsMultiStyle(pipelineObjStyles, temporary);
	}

	// ---------------------------------------------------------------------------
	// Node methods
	// ---------------------------------------------------------------------------

	// Retuns an array of nodes for the pipeline specified by the pipelineId.
	getNodes(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodes();
	}

	// Returns a new node created from the data parameter in the pipeline
	// identified by the pipelineId.
	// The data parameter must contain:
	// nodeTemplate -  a node template from the palette. The nodeTemplate
	//                 can be retrieved from the palette using with Canvas
	//                 Controller methods: getPaletteNode or getPaletteNodeById.
	// offsetX - the x coordinate of the new node
	// offsetY - the y coordinate of the new node
	createNode(data, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).createNode(data);
	}

	// Adds a new node into the pipeline specified by the pipelineId.
	addNode(node, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addNode(node);
	}

	// Creates a node using the data parameter provided in the pipeline specified
	// by pipelineId and adds the command to the command stack (so the user can
	// undo/redo the command). This will also cause the beforeEditActionHandler
	// and editActionHandler callbacks to be called.
	// The data parameter must contain:
	// nodeTemplate -  a node template from the palette. The nodeTemplate
	//                 can be retrieved from the palette using with Canvas
	//                 Controller methods: getPaletteNode or getPaletteNodeById.
	// offsetX - the x coordinate of the new node
	// offsetY - the y coordinate of the new node
	//
	// If pipelineId is omitted the node will be created in the current
	// "top-level" pipeline.
	createNodeCommand(data, pipelineId) {
		const pId = pipelineId || this.getCurrentPipelineId();
		this.createNodeFromTemplateAt(data.nodeTemplate, { x: data.offsetX, y: data.offsetY }, pId);
	}

	// Deletes the node specified.
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	deleteNode(nodeId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteNode(nodeId);
	}

	// Sets the node properties
	// nodeId - The ID of the node
	// properties - An object containing properties to be overriden in the node
	// pipelineId - The ID of the pipeline
	setNodeProperties(nodeId, properties, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeProperties(nodeId, properties);
	}

	// Sets the node parameters
	// nodeId - The ID of the node
	// parameters - An array of parameters
	// pipelineId - The ID of the pipeline
	setNodeParameters(nodeId, parameters, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeParameters(nodeId, parameters);
	}

	// Sets the node UI parameters
	// nodeId - The ID of the node
	// parameters - An array of UI parameters
	// pipelineId - The ID of the pipeline
	setNodeUiParameters(nodeId, uiParameters, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeUiParameters(nodeId, uiParameters);
	}

	// Sets the node messages
	// nodeId - The ID of the node
	// messages - An array of messages
	// pipelineId - The ID of the pipeline
	setNodeMessages(nodeId, messages, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeMessages(nodeId, messages);
	}

	// Sets a single message on a node
	// nodeId - The ID of the node
	// message - A message
	// pipelineId - The ID of the pipeline
	setNodeMessage(nodeId, message, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeMessage(nodeId, message);
	}

	// Sets the lable for a node
	// nodeId - The ID of the node
	// ndeLabel - The label
	// pipelineId - The ID of the pipeline
	setNodeLabel(nodeId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeLabel(nodeId, newLabel);
	}

	// Sets the class name to newClassName of the nodes identified by nodeIds
	// array in the pipleine specified by pipeline ID. The class name will be
	// applied to the node body path.
	setNodesClassName(nodeIds, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setObjectsClassName(nodeIds, newClassName);
	}

	// Sets the decorations on a node. The decorations array passed in
	// will replace any decorations currently applied to the node.
	// nodeId - The ID of the node
	// newDecorations - An array of decorations. See Wiki for details.
	// pipelineId - The ID of the pipeline
	setNodeDecorations(nodeId, newDecorations, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeDecorations(nodeId, newDecorations);
	}

	// Sets the input ports on a node. The inputs array of ports provided will
	// replace any input ports for a node.
	// nodeId - The ID of the node
	// inputs - An array of input port objects.
	// pipelineId - The ID of the pipeline
	setNodeInputPorts(nodeId, inputs, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeInputPorts(nodeId, inputs);
	}

	// Sets the output ports on a node. The outputs array of ports provided will
	// replace any output ports for a node.
	// nodeId - The ID of the node
	// outputs - An array of output port objects.
	// pipelineId - The ID of the pipeline
	setNodeOutputPorts(nodeId, outputs, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeOutputPorts(nodeId, outputs);
	}

	// Sets the decorations of multiple nodes at once. The decorations array
	// passed in will replace any decorations currently applied to the nodes.
	// pipelineNodeDecorations - Specifies the nodes and their decorations.
	// It is a javascript array like this:
	//   [
	//     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec>},
	//     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec>},
	//     { pipelineId: <pipelineId>, nodeId: <nodeId>, decorations: <decoration_spec>}
	//   ]
	setNodesMultiDecorations(pipelineNodeDecorations) {
		this.objectModel.setNodesMultiDecorations(pipelineNodeDecorations);
	}

	// Sets the input port label on a node
	// nodeId - The ID of the node
	// portId - The ID of the input port
	// newLabel - The label
	// pipelineId - The ID of the pipeline
	setInputPortLabel(nodeId, portId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setInputPortLabel(nodeId, portId, newLabel);
	}

	// Sets the output port label on a node
	// nodeId - The ID of the node
	// portId - The ID of the output port
	// newLabel - The label
	// pipelineId - The ID of the pipeline
	setOutputPortLabel(nodeId, portId, newLabel, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setOutputPortLabel(nodeId, portId, newLabel);
	}

	// Gets a node
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNode(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNode(nodeId);
	}

	// Gets the UI parameters for a node
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeUiParameters(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeUiParameters(nodeId);
	}

	// Gets the supernodes for a pipeline.
	// pipelineId - The ID of the pipeline
	getSupernodes(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getSupernodes();
	}

	// Returns supernode ID that has a subflow_ref to the given pipelineId.
	getSupernodeObjReferencing(pipelineId) {
		return this.objectModel.getSupernodeObjReferencing(pipelineId);
	}

	// Gets the messages for a node
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeMessages(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessages(nodeId);
	}

	// Gets a message for a specific control for a node
	// nodeId - The ID of the node
	// controlName - The control name
	// pipelineId - The ID of the pipeline
	getNodeMessage(nodeId, controlName, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeMessage(nodeId, controlName);
	}

	// Gets the array of input ports for the node or null if the node ID is
	// not recognized.
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeInputPorts(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeInputPorts(nodeId);
	}

	// Gets the array of output ports for the node or null if the node ID is
	// not recognized.
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeOutputPorts(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeOutputPorts(nodeId);
	}

	// Gets an array of decorations for a node
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeDecorations(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeDecorations(nodeId);
	}

	// Gets the class name associated with the node specified by nodeId in the
	// pipeline specified by pipelineId.
	getNodeClassName(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeClassName(nodeId);
	}

	// Gets the style specification (see Wiki) for a node
	// nodeId - The ID of the node
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	// pipelineId - The ID of the pipeline
	getNodeStyle(nodeId, temporary, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeStyle(nodeId, temporary);
	}

	// Returns an array of nodes that are for the branch(es) that the nodes,
	// identified by the node IDs passed in, are within.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline where the nodes exist
	getBranchNodes(nodeIds, pipelineId) {
		const pId = pipelineId ? pipelineId : this.objectModel.getCurrentPipelineId();
		return this.objectModel.getHighlightObjectIds(pId, nodeIds, constants.HIGHLIGHT_BRANCH);
	}

	// Returns an array of nodes that are upstream from the nodes
	// identified by the node IDs passed in.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline where the nodes exist
	getUpstreamNodes(nodeIds, pipelineId) {
		const pId = pipelineId ? pipelineId : this.objectModel.getCurrentPipelineId();
		return this.objectModel.getHighlightObjectIds(pId, nodeIds, constants.HIGHLIGHT_UPSTREAM);
	}

	// Returns an array of nodes that are downstream from the nodes
	// identified by the node IDs passed in.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline where the nodes exist
	getDownstreamNodes(nodeIds, pipelineId) {
		const pId = pipelineId ? pipelineId : this.objectModel.getCurrentPipelineId();
		return this.objectModel.getHighlightObjectIds(pId, nodeIds, constants.HIGHLIGHT_DOWNSTREAM);
	}

	// Adds a custom attribute to the nodes.
	// @Deprecated.
	addCustomAttrToNodes(nodeIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToNodes(nodeIds, attrName);
	}

	// Removes a custom attribute from the nodes.
	// @Deprecated.
	removeCustomAttrFromNodes(nodeIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrFromNodes(nodeIds, attrName);
	}

	// Returns a boolean to indicate whether the supernode is expanded in place.
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	isSuperNodeExpandedInPlace(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).isSuperNodeExpandedInPlace(nodeId);
	}

	// ---------------------------------------------------------------------------
	// Comments methods
	// ---------------------------------------------------------------------------

	// Returns the comments from the pipeline.
	// pipelineId - The ID of the pipeline
	getComments(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComments();
	}

	// Returns a comment from the pipeline.
	// comId - The ID of the comment
	// pipelineId - The ID of the pipeline
	getComment(comId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getComment(comId);
	}

	// Creates a comment for the pipeline.
	// source - Input data
	// pipelineId - The ID of the pipeline
	createComment(source, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createComment(source);
	}

	// Adds a comment to the pipeline.
	// data - the data describing the comment
	// pipelineId - The ID of the pipeline
	addComment(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addComment(data);
	}

	// Edits a comment with the data.
	// data - the comment
	// pipelineId - The ID of the pipeline
	editComment(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).editComment(data);
	}

	// Sets the properties in the comment identified by the commentId. The
	// commentProperties is an object containing one or more properties that will
	// replace the corresponding properties in the comment. For example: if
	// commentProperties is { x_pos: 50, y_pos: 70 } the comment
	// will be set to that position.
	setCommentProperties(commentId, commentProperties, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setCommentProperties(commentId, commentProperties);
	}

	// Sets the class name to newClassName of the comments identified by commentIds
	// array in the pipleine specified by pipeline ID. The class name will be
	// applied to the comment body path.
	setCommentsClassName(commentIds, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setObjectsClassName(commentIds, newClassName);
	}

	// Deletes a comment
	// comId - The ID of the comment
	// pipelineId - The ID of the pipeline
	deleteComment(comId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteComment(comId);
	}

	// Adds cutom attributes to a comment
	// @Deprecated
	addCustomAttrToComments(comIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addCustomAttrToComments(comIds, attrName);
	}

	// Removes cutom attributes from a comment
	// @Deprecated
	removeCustomAttrFromComments(comIds, attrName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).removeCustomAttrFromComments(comIds, attrName);
	}

	// Gets the class name associated with the comment specified by commentId in the
	// pipeline specified by pipelineId.
	getCommentClassName(commentId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getCommentClassName(commentId);
	}

	// Gets the style spcification (see Wiki) for a comment
	// commentId - The ID of the node
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	// pipelineId - The ID of the pipeline
	getCommentStyle(commentId, temporary, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getCommentStyle(commentId, temporary);
	}

	// ---------------------------------------------------------------------------
	// Links methods
	// ---------------------------------------------------------------------------

	// Gets a link
	// linkId - The ID of the link
	// pipelineId - The ID of the pipeline
	getLink(linkId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLink(linkId);
	}

	// Returns an array of link objects for the pipelineId passed in.
	// pipelineId - The ID of the pipeline
	getLinks(pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLinks();
	}

	// Sets the properties in the link identified by the linkId. The
	// linkProperties is an object containing one or more properties that will
	// replace the corresponding properties in the link. For exam`ple: if
	// linkProperties is { trgNodeId: "123", trgNodePortId: "789" } the target
	// node ID will be set to "123" and the target port ID set to "789".
	setLinkProperties(linkId, linkProperties, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setLinkProperties(linkId, linkProperties);
	}

	// Sets the source properties in the data link identified by the linkId. The
	// srcNodeId and srcNodePortId will be set to the values provided. If
	// srcNodePortId is set to null the current srcNodePortId will be removed
	// from the link. Also, if the link has a srcPos property (because its
	// source end is detached) that will be removed.
	setNodeDataLinkSrcInfo(linkId, srcNodeId, srcNodePortId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeDataLinkSrcInfo(linkId, srcNodeId, srcNodePortId);
	}

	// Sets the target properties in the data link identified by the linkId. The
	// trgNodeId and trgNodePortId will be set to the values provided. If
	// trgNodePortId is set to null the current trgNodePortId will be removed
	// from the link. Also, if the link has a trgPos property (because its
	// target end is detached) that will be removed.
	setNodeDataLinkTrgInfo(linkId, trgNodeId, trgNodePortId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeDataLinkTrgInfo(linkId, trgNodeId, trgNodePortId);
	}

	// Gets a node to node data link
	// srcNodeId - The ID of the source node
	// srcNodePortId - The ID of the source node port
	// trgNodeId - The ID of the target node
	// trgNodePortId - The ID of the target node port
	// pipelineId - The ID of the pipeline
	getNodeDataLinkFromInfo(srcNodeId, srcNodePortId, trgNodeId, trgNodePortId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeDataLinkFromInfo(srcNodeId, srcNodePortId, trgNodeId, trgNodePortId);
	}

	// Gets a comment to node link
	// id1 - The ID of the comment
	// id2 - The ID of the node
	// pipelineId - The ID of the pipeline
	getCommentLinkFromInfo(id1, id2, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getCommentLinkFromInfo(id1, id2);
	}

	// Gets a node to node association link
	// id1 - The ID of one of the node
	// id2 - The ID of one of the node
	// pipelineId - The ID of the pipeline
	getNodeAssocLinkFromInfo(id1, id2, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeAssocLinkFromInfo(id1, id2);
	}

	// Adds links to a pipeline
	// linkList - An array of links
	// pipelineId - The ID of the pipeline
	addLinks(linkList, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addLinks(linkList);
	}

	// Deletes a link
	// source - An array of links
	// pipelineId - The ID of the pipeline
	deleteLink(link, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteLink(link);
	}

	// Creates node to node links
	// data - Data describing the links
	// pipelineId - The ID of the pipeline
	createNodeLinks(data, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).createNodeLinks(data);
	}

	// Creates comment links
	// data - Data describing the links
	// pipelineId - The ID of the pipeline
	createCommentLinks(data, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).createCommentLinks(data);
	}

	// Sets the class name to newClassName of the links identified by linkIds
	// array in the pipleine specified by pipeline ID. The class name will be
	// applied to the link line path.
	setLinksClassName(linkIds, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setLinksClassName(linkIds, newClassName);
	}

	// Sets the style of the links specified by pipelineLinkIds to be
	// the newStyle which will be either temporary or permanent.
	// pipelineLinkIds - This identifies the objects to be styles. It is a
	// javascript object like this:
	//   {
	//     <pipelineID_1>: [
	//       <linkID_1_1>,
	//       <linkID_1_2
	//     ],
	//     <pipelineID_2>: [
	//         <linkID_2_1>,
	//         <linkID_2_2
	//     ]
	//   }
	// newStyle - This is a style specification. See the wiki for details.
	// temporary - A boolean to indicate if the style is serialized when
	//             getPipelineFlow() method is called or not.
	setLinksStyle(pipelineLinkIds, newStyle, temporary) {
		this.objectModel.setLinksStyle(pipelineLinkIds, newStyle, temporary);
	}

	// Sets the styles of multiple links at once.
	// pipelineObjStyles - Specified the links and the styles each should be
	// set to. It is a javascript array like this:
	//   [
	//     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>},
	//     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>},
	//     { pipelineId: <pipelineId>, objId: <linkId>, style: <style_spec>}
	//   ]
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	setLinksMultiStyle(pipelineObjStyles, temporary) {
		this.objectModel.setLinksMultiStyle(pipelineObjStyles, temporary);
	}

	// Gets the class name associated with the link specified by linkId in the
	// pipeline specified by pipelineId.
	getLinkClassName(linkId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLinkClassName(linkId);
	}

	// Returns the style specification for a link.
	// linkIds - An array of links
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	// pipelineId - The ID of the pipeline
	getLinkStyle(linkId, temporary, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLinkStyle(linkId, temporary);
	}

	// Sets the decorations on a link. The decorations array passed in
	// will replace any decorations currently applied to the link.
	// linkId - The ID of the link
	// newDecorations - An array of decorations. See Wiki for details.
	// pipelineId - The ID of the pipeline
	setLinkDecorations(linkId, newDecorations, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setLinkDecorations(linkId, newDecorations);
	}

	// Sets the decorations of multiple links at once. The decorations array
	// passed in will replace any decorations currently applied to the links.
	// pipelineLinkDecorations - Specifies the links and their decorations.
	// It is a javascript array like this:
	//   [
	//     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec>},
	//     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec>},
	//     { pipelineId: <pipelineId>, linkId: <linkId>, decorations: <decoration_spec>}
	//   ]
	setLinksMultiDecorations(pipelineLinkDecorations) {
		this.objectModel.setLinksMultiDecorations(pipelineLinkDecorations);
	}

	// Gets an array of decorations for a link
	// linkId - The ID of the link
	// pipelineId - The ID of the pipeline
	getLinkDecorations(linkId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getLinkDecorations(linkId);
	}

	// ---------------------------------------------------------------------------
	// Command stack methods
	// ---------------------------------------------------------------------------

	getCommandStack() {
		return this.commandStack;
	}

	undo() {
		if (this.canUndo()) {
			this.getCommandStack().undo();
		}
	}

	redo() {
		if (this.canRedo()) {
			this.getCommandStack().redo();
		}
	}

	canUndo() {
		return this.getCommandStack().canUndo();
	}

	canRedo() {
		return this.getCommandStack().canRedo();
	}

	getUndoLabel() {
		if (this.canUndo()) {
			const cmnd = this.getCommandStack().getUndoCommand();
			if (cmnd && cmnd.getLabel) {
				return cmnd.getLabel();
			}
		}
		return "";
	}

	getRedoLabel() {
		if (this.canRedo()) {
			const cmnd = this.getCommandStack().getRedoCommand();
			if (cmnd && cmnd.getLabel) {
				return cmnd.getLabel();
			}
		}
		return "";
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	// Returns the current array of breadcrumbs. There will one breadcrumb object
	// for each level of supernode that the user has navigated into. This array
	// can be used to display breadcrumbs to the user to show where they are
	// within the navigation hierarchy within common canvas.
	getBreadcrumbs() {
		return this.objectModel.getBreadcrumbs();
	}

	// Returns the last breadcrumb which represents the level with supernode
	// hierarchy that the user has currently navigated to.
	getCurrentBreadcrumb() {
		return this.objectModel.getCurrentBreadcrumb();
	}

	// ---------------------------------------------------------------------------
	// Highlight methods
	// ---------------------------------------------------------------------------

	//
	setHighlightStyle(highlightObjectIds, pipelineId) {
		this.removeAllStyles(true);
		const objectStyle = {
			body: {
				default: `fill: ${constants.HIGHLIGHT_FILL} ;stroke: ${constants.HIGHLIGHT_STROKE};`,
				hover: `fill: ${constants.HIGHLIGHT_HOVER_FILL};`
			}
		};
		const linkStyle = {
			line: {
				default: `stroke: ${constants.HIGHLIGHT_STROKE};`,
				hover: `stroke-width: ${constants.HIGHLIGHT_STROKE_WIDTH}`
			}
		};
		this.setObjectsStyle(highlightObjectIds.nodes, objectStyle, true, false);
		this.setLinksStyle(highlightObjectIds.links, linkStyle, true, false);
		this.highlight = true;
	}

	// Highlights the branch(s) (both upstream and downstream) from the node
	// IDs passed in.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline
	highlightBranch(nodeIds, pipelineId) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_BRANCH);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
	}

	// Highlights the upstream nodes from the node IDs passed in.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline
	highlightUpstream(nodeIds, pipelineId) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_UPSTREAM);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
	}

	// Highlights the downstream nodes from the node IDs passed in.
	// nodeIds - An array of node Ids
	// pipelineId - The ID of the pipeline
	highlightDownstream(nodeIds, pipelineId) {
		const highlightObjectIds = this.objectModel.getHighlightObjectIds(pipelineId, nodeIds, constants.HIGHLIGHT_DOWNSTREAM);
		this.setHighlightStyle(highlightObjectIds, pipelineId);
		return highlightObjectIds;
	}

	// ---------------------------------------------------------------------------
	// Operational methods
	// ---------------------------------------------------------------------------

	// Returns a Boolean to indicate whether canvas logging is switched on or off.
	getLoggingState() {
		return Logger.getLoggingState();
	}

	// Sets canvas logging based on the Boolean passed in.
	setLoggingState(state) {
		Logger.setLoggingState(state);
	}

	log(msg) {
		const logger = new Logger("Host App");
		logger.log(msg);
	}

	addAfterUpdateCallback(callback) {
		if (this.canvasContents) {
			this.canvasContents.addAfterUpdateCallback(callback);
		}
	}

	removeAfterUpdateCallback(callback) {
		if (this.canvasContents) {
			this.canvasContents.removeAfterUpdateCallback(callback);
		}
	}

	togglePalette() {
		this.getObjectModel().togglePalette();
	}

	openPalette() {
		this.getObjectModel().openPalette();
	}

	closePalette() {
		this.getObjectModel().closePalette();
	}

	isPaletteOpen() {
		return this.getObjectModel().isPaletteOpen();
	}

	openContextMenu(menuDef) {
		this.objectModel.openContextMenu(menuDef);
	}

	isBottomPanelOpen() {
		return this.getObjectModel().isBottomPanelOpen();
	}

	setBottomPanelHeight(ht) {
		this.objectModel.setBottomPanelHeight(ht);
	}

	closeContextMenu() {
		this.objectModel.closeContextMenu();
	}

	isContextMenuDisplayed() {
		return this.objectModel.isContextMenuDisplayed();
	}

	openNotificationPanel() {
		this.objectModel.openNotificationPanel();
	}

	closeNotificationPanel() {
		this.objectModel.closeNotificationPanel();
	}

	toggleNotificationPanel() {
		this.objectModel.toggleNotificationPanel();
	}

	isRightFlyoutOpen() {
		return this.objectModel.isRightFlyoutOpen();
	}

	// Displays a pipeline (identified by the pipelineId passed in). This must be
	// one of the pipelines referenced by the current set of breadcrumbs. It
	// cannot be used to open a new pipeline outside the current set of breadcruumbs.
	displaySubPipeline(pipelineId) {
		const breadcrumbs = this.objectModel.getBreadcrumbs();
		const index = breadcrumbs.findIndex((b) => b.pipelineId === pipelineId);
		if (index > -1) {
			const supernode = this.getSupernodeFromBreadcrumb(breadcrumbs[index]);

			const data = {
				editType: "displaySubPipeline",
				editSource: "canvas",
				targetObject: supernode,
				breadcrumbIndex: index
			};
			this.editActionHandler(data);
		}
	}

	// Displays a pipeline for the supernode (identifid by the supernodeId
	// parameter) in the pipeline (identifid by the pipelineId parameter). For
	// correct breadcrumb generation this pipeline should be the one in the last
	// of the current set of breadcumbs. That is, the pipeline currently shown
	// "full page" in the canvas.
	displaySubPipelineForSupernode(supernodeId, pipelineId) {
		const sn = this.getNode(supernodeId, pipelineId);
		if (sn && sn.type === SUPER_NODE) {
			const currentBreadcrumb = this.objectModel.getCurrentBreadcrumb();
			const bc = this.objectModel.createBreadcrumb(sn, currentBreadcrumb.pipelineId);
			this.displaySubPipelineForBreadcrumbs([bc]);
		}
	}

	// Adds the breadcrumbs provided to the current set of breadcrumbs and then
	// displays "full page" the pipeline identified by the last of the additional
	// set of breadcrumbs. This is a convenience function for the common-canvas.
	displaySubPipelineForBreadcrumbs(addBreadcrumbs) {
		const lastBreadcrumb = addBreadcrumbs[addBreadcrumbs.length - 1];
		const supernode = this.getSupernodeFromBreadcrumb(lastBreadcrumb);

		const data = {
			editType: "displaySubPipeline",
			editSource: "canvas",
			targetObject: supernode,
			addBreadcrumbs: addBreadcrumbs
		};
		this.editActionHandler(data);
	}

	// Returns the supernode speified in the bradcrumb provided.
	getSupernodeFromBreadcrumb(breadcrumb) {
		if (breadcrumb.supernodeParentPipelineId) {
			const apiPipeline = this.objectModel.getAPIPipeline(breadcrumb.supernodeParentPipelineId);
			return apiPipeline.getNode(breadcrumb.supernodeId);
		}
		// breadcrumb.supernodeParentPipelineId might be missing when processing
		// the breadcrumb for the primary pipeline.
		return null;
	}

	displayPreviousPipeline() {
		const data = { editType: "displayPreviousPipeline", pipelineInfo: this.objectModel.getPreviousBreadcrumb(), editSource: "canvas" };
		this.editActionHandler(data);
	}

	zoomIn() {
		if (this.canvasContents) {
			this.getSVGCanvasD3().zoomIn();
		}
	}

	zoomOut() {
		if (this.canvasContents) {
			this.getSVGCanvasD3().zoomOut();
		}
	}

	zoomToFit() {
		if (this.canvasContents) {
			this.getSVGCanvasD3().zoomToFit();
		}
	}

	// Changes the zoom amounts for the canvas. This method does not alter the
	// pipelineFlow document. zoomObject is an object with three fields:
	// x: Is the horizontal translate amount which is a number indicating the
	//    pixel amount to move. Negative left and positive right
	// y: Is the vertical translate amount which is a number indicating the
	//    pixel amount to move. Negative up and positive down.
	// k: is the scale amount which is a number greater than 0 where 1 is the
	//    default scale size.
	zoomTo(zoomObject) {
		if (this.canvasContents) {
			this.getSVGCanvasD3().zoomTo(zoomObject);
		}
	}

	// Increments the translation of the canvas by the x and y increment
	// amounts. The optional animateTime parameter can be provided to animate the
	// movement of the canvas. It is a time for the animation in milliseconds.
	// If omitted the movement happens immediately.
	translateBy(x, y, animateTime) {
		if (this.canvasContents) {
			this.getSVGCanvasD3().translateBy(x, y, animateTime);
		}
	}

	// Returns the current zoom object for the currently displayed canvas.
	getZoom() {
		return this.getSVGCanvasD3().getZoom();
	}

	// Returns a zoom object required to pan the objects (nodes and/or comments)
	// identified by the objectIds array to 'reveal' the objects in the viewport.
	// The zoom object returned can be provided to the CanvasController.zoomTo()
	// method to perform the zoom/pan action.
	// If the xPos and yPos variables are provided it will return a zoom object
	// to pan the objects to a location specified by a percentage offset of the
	// viewport width and height respectively.
	// If the xPos and yPos parameters are undefined (omitted) and all the
	// objects are fully within the canvas viewport, it will return null.
	// This can be used to detect whether the objects are fully visible or not.
	// Otherwise it will return a zoom object which can be used to pan the
	// objects into the viewport so they appear at the nearest side of the
	// viewport to where they are currently positioned.
	// The zoom object has three fields:
	// x: Is the horizontal translate amount which is a number indicating the
	//    pixel amount to move. Negative left and positive right
	// y: Is the vertical translate amount which is a number indicating the
	//    pixel amount to move. Negative up and positive down.
	// k: is the scale amount which is a number greater than 0 where 1 is the
	//    default scale size.
	// Parameters:
	// objectIds - An array of nodes and/or comment IDs.
	// xPos - Optional. Can be set to percentage offset of the viewport width.
	// yPos - Optional. Can be set to percentage offset of the viewport height.
	getZoomToReveal(objectIds, xPos, yPos) {
		if (this.canvasContents) {
			return this.getSVGCanvasD3().getZoomToReveal(objectIds, xPos, yPos);
		}
		return null;
	}

	// Clears any saved zoom values stored in local storage. This means
	// newly opened flows will appear with the default zoom. This method
	// is only applicable when the enableSaveZoom config parameter is
	// set to "LocalStorage".
	clearSavedZoomValues() {
		this.objectModel.clearSavedZoomValues();
	}

	// ---------------------------------------------------------------------------
	// Utility/helper methods
	// ---------------------------------------------------------------------------

	getGhostNode(nodeTemplate) {
		if (this.canvasContents) {
			return this.getSVGCanvasD3().getGhostNode(nodeTemplate);
		}
		return null;
	}

	nodeTemplateDragStart(nodeTemplate) {
		CanvasController.dragNodeTemplate = nodeTemplate;

		if (this.canvasContents) {
			this.getSVGCanvasD3().nodeTemplateDragStart(CanvasController.dragNodeTemplate);
		}
	}

	nodeTemplateDragEnd() {
		if (this.canvasContents && CanvasController.dragNodeTemplate) {
			this.getSVGCanvasD3().nodeTemplateDragEnd(CanvasController.dragNodeTemplate);
		}
		CanvasController.dragNodeTemplate = null;
	}

	getDragNodeTemplate() {
		return CanvasController.dragNodeTemplate;
	}

	// Cuts the currently selected objects to the internal clipboard.
	cutToClipboard() {
		this.editActionHandler({
			editType: "cut",
			editSource: "api"
		});
	}

	// Copies the currently selected objects to the internal clipboard.
	copyToClipboard() {
		this.editActionHandler({
			editType: "copy",
			editSource: "api"
		});
	}

	pasteFromClipboard(pipelineId) {
		this.editActionHandler({
			editType: "paste",
			editSource: "api",
			pipelineId: pipelineId
		});
	}

	isClipboardEmpty() {
		return this.objectModel.isClipboardEmpty();
	}

	canPaste() {
		return !this.isClipboardEmpty();
	}

	canCutCopy() {
		if (this.getSelectedObjectIds().length > 0) {
			if (this.areAllSelectedObjectsLinks() &&
					!this.areDetachableLinksInUse()) {
				return false;
			}
			return true;
		}
		return false;
	}

	canDelete() {
		return this.getSelectedObjectIds().length > 0;
	}

	canZoomIn() {
		if (this.isPrimaryPipelineEmpty()) {
			return false;

		} else if (this.getSVGCanvasD3()) {
			return !this.getSVGCanvasD3().isZoomedToMax();
		}
		return true;
	}

	canZoomOut() {
		if (this.isPrimaryPipelineEmpty()) {
			return false;

		} else if (this.getSVGCanvasD3()) {
			return !this.getSVGCanvasD3().isZoomedToMin();
		}
		return true;
	}

	canZoomToFit() {
		if (this.isPrimaryPipelineEmpty()) {
			return false;
		}
		return true;
	}

	// Returns the saved zoom either from what is in local storage or in the
	// pipeline flow (based on the enableSaveZoom config parameter) or null,
	// if there is no saved zoom.
	getSavedZoom(pipelineId) {
		return this.objectModel.getSavedZoom(pipelineId);
	}

	openTip(tipConfig) {
		if (!this.isTipOpen() && this.isTipEnabled(tipConfig.type)) {
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
				case constants.TIP_TYPE_DEC:
					data.pipelineId = tipConfig.pipelineId;
					data.decoration = tipConfig.decoration;
					break;
				case constants.TIP_TYPE_LINK:
					data.pipelineId = tipConfig.pipelineId;
					data.link = tipConfig.link;
					break;
				case constants.TIP_TYPE_STATE_TAG:
					data.stateTagText = tipConfig.stateTagText;
					data.stateTagType = tipConfig.stateTagType;
					break;

				default:
				}

				tipConfig.customContent = this.handlers.tipHandler(tipConfig.type, data);
			}

			const that = this;
			if (this.pendingTooltip) {
				clearTimeout(this.pendingTooltip);
			}

			this.pendingTooltip = setTimeout(function() {
				that.objectModel.setTooltipDef(tipConfig);
			}, tipConfig.delay ? tipConfig.delay : 200);
		}
	}

	closeTip() {
		if (this.pendingTooltip) {
			clearTimeout(this.pendingTooltip);
		}
		if (this.isTipOpen()) {
			this.objectModel.setTooltipDef({});
		}
	}

	isTipOpen() {
		return this.objectModel.isTooltipOpen();
	}

	isTipEnabled(tipType) {
		const canvasConfig = this.getCanvasConfig();
		switch (tipType) {
		case constants.TIP_TYPE_PALETTE_ITEM:
		case constants.TIP_TYPE_PALETTE_CATEGORY:
			return canvasConfig.tipConfig.palette;
		case constants.TIP_TYPE_NODE:
			return canvasConfig.tipConfig.nodes;
		case constants.TIP_TYPE_PORT:
			return canvasConfig.tipConfig.ports;
		case constants.TIP_TYPE_DEC:
			return canvasConfig.tipConfig.decorations;
		case constants.TIP_TYPE_LINK:
			return canvasConfig.tipConfig.links;
		case constants.TIP_TYPE_STATE_TAG:
			return canvasConfig.tipConfig.stateTag;
		default:
			return false;
		}
	}

	openTextToolbar(xPos, yPos, actionHandler, blurHandler) {
		this.objectModel.setTextToolbarDef({ isOpen: true, pos_x: xPos, pos_y: yPos, actionHandler, blurHandler });
	}

	closeTextToolbar() {
		this.objectModel.setTextToolbarDef({ isOpen: false });
	}

	moveTextToolbar(xPos, yPos) {
		this.objectModel.setTextToolbarDef({ pos_x: xPos, pos_y: yPos });
	}

	// Processes the drop of an 'external' object, either from the desktop or
	// elsewhere on the browser page, onto the canvas.
	// dropData - The data describing the object being dropped
	// transPos - mouse position transformed for canvas coordinates
	// pipelineId - the ID of the pipeline onto which the object is being dropped
	createDroppedExternalObject(dropData, transPos, pipelineId) {
		if (dropData) {
			if (dropData.operation === "createFromObject") {
				this.createNodeFromObjectAt(dropData.sourceId, dropData.sourceObjectTypeId, dropData.label, transPos.x, transPos.y, pipelineId);

			} else {
				this.createNodeFromDataAt(transPos.x, transPos.y, dropData, pipelineId);
			}
		}
	}

	createAutoNode(nodeTemplate) {
		const selApiPipeline = this.objectModel.getSelectionAPIPipeline();
		const apiPipeline = selApiPipeline ? selApiPipeline : this.objectModel.getAPIPipeline();
		const newNodeTemplate = this.convertNodeTemplate(nodeTemplate);
		var data = {
			editType: "createAutoNode",
			editSource: "canvas",
			nodeTemplate: newNodeTemplate,
			pipelineId: apiPipeline.pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas
	createNodeFromTemplateAt(nodeTemplate, pos, pipelineId) {
		const newNodeTemplate = this.convertNodeTemplate(nodeTemplate);
		var data = {
			editType: "createNode",
			editSource: "canvas",
			nodeTemplate: newNodeTemplate,
			offsetX: pos.x,
			offsetY: pos.y,
			pipelineId: pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas and dropped
	// onto an existing link between two data nodes.
	createNodeFromTemplateOnLinkAt(nodeTemplate, link, pos, pipelineId) {
		const newNodeTemplate = this.convertNodeTemplate(nodeTemplate);
		if (this.canNewNodeBeDroppedOnLink(newNodeTemplate)) {
			var data = {
				editType: "createNodeOnLink",
				editSource: "canvas",
				nodeTemplate: newNodeTemplate,
				offsetX: pos.x,
				offsetY: pos.y,
				link: link,
				pipelineId: pipelineId
			};

			this.editActionHandler(data);
		}
	}

	// Called when a node is dragged from the palette onto the canvas and dropped
	// onto one or more semi-detached or fully-detached links.
	createNodeFromTemplateAttachLinks(nodeTemplate, detachedLinks, pos, pipelineId) {
		const newNodeTemplate = this.convertNodeTemplate(nodeTemplate);
		if (detachedLinks &&
				this.canNewNodeBeAttachedToLinks(newNodeTemplate)) {
			var data = {
				editType: "createNodeAttachLinks",
				editSource: "canvas",
				nodeTemplate: newNodeTemplate,
				offsetX: pos.x,
				offsetY: pos.y,
				detachedLinks: detachedLinks,
				pipelineId: pipelineId
			};

			this.editActionHandler(data);
		}
	}

	// Called when a node is dragged from the 'output' window (in WML) onto the canvas
	createNodeFromObjectAt(sourceId, sourceObjectTypeId, label, x, y, pipelineId) {
		var data = {
			editType: "createNode",
			editSource: "canvas",
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
	createNodeFromDataAt(x, y, dropData, pipelineId) {
		const data = dropData.data;
		data.offsetX = x;
		data.offsetY = y;
		data.pipelineId = pipelineId;
		data.editSource = "canvas";

		this.editActionHandler(data);
	}

	canNewNodeBeDroppedOnLink(nodeType) {
		if (nodeType.inputs && nodeType.inputs.length > 0 &&
				nodeType.outputs && nodeType.outputs.length > 0) {
			return true;
		}
		return false;
	}

	canNewNodeBeAttachedToLinks(nodeType) {
		if (nodeType.inputs && nodeType.inputs.length > 0 ||
				nodeType.outputs && nodeType.outputs.length > 0) {
			return true;
		}
		return false;
	}

	createEditMenu(source, includePaste) {
		const editSubMenu = [
			{ action: "cut", label: this.labelUtil.getLabel("edit.cutSelection"), enable: source.selectedObjectIds.length > 0 },
			{ action: "copy", label: this.labelUtil.getLabel("edit.copySelection"), enable: source.selectedObjectIds.length > 0 }
		];
		if (includePaste) {
			editSubMenu.push({ action: "paste", label: this.labelUtil.getLabel("edit.pasteSelection"), enable: !this.isClipboardEmpty() });
		}
		return editSubMenu;
	}

	createHighlightMenu(source) {
		const highlightSubMenu = [
			{ action: "highlightBranch", label: this.labelUtil.getLabel("menu.highlightBranch") },
			{ action: "highlightUpstream", label: this.labelUtil.getLabel("menu.highlightUpstream") },
			{ action: "highlightDownstream", label: this.labelUtil.getLabel("menu.highlightDownstream") }
		];
		return highlightSubMenu;
	}

	// This should only appear in menu if highlight is true.
	createUnhighlightMenu(source) {
		const unhighlightSubMenu = [
			{ action: "unhighlight", label: this.labelUtil.getLabel("menu.unhighlight"), enable: this.highlight }
		];
		return unhighlightSubMenu;
	}

	createDefaultMenu(source) {
		let menuDefinition = [];
		// Select all & add comment: canvas only
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "createComment", label: this.labelUtil.getLabel("canvas.addComment") },
				{ action: "selectAll", label: this.labelUtil.getLabel("canvas.selectAll") },
				{ divider: true }]);
		}
		// Disconnect node
		if (source.type === "node" || source.type === "comment") {
			const linksFound = this.objectModel.getAPIPipeline(source.pipelineId).getLinksContainingIds(source.selectedObjectIds);
			if (linksFound.length > 0) {
				menuDefinition = menuDefinition.concat({ action: "disconnectNode", label: this.labelUtil.getLabel("node.disconnectNode") });
				menuDefinition = menuDefinition.concat({ divider: true });
			}
		}
		// Color objects
		if (source.type === "comment" &&
				get(this, "contextMenuConfig.defaultMenuEntries.colorBackground", true)) {
			menuDefinition = menuDefinition.concat({ submenu: true, menu: "colorPicker", label: this.labelUtil.getLabel("comment.colorBackground") });
			menuDefinition = menuDefinition.concat({ divider: true });
		}
		// Edit submenu (cut, copy, paste)
		if (source.type === "node" ||
				source.type === "comment" ||
				(source.type === "link" && this.areDetachableLinksInUse()) ||
				source.type === "canvas") {
			const editSubMenu = this.createEditMenu(source, source.type === "canvas");
			menuDefinition = menuDefinition.concat({ submenu: true, menu: editSubMenu, label: this.labelUtil.getLabel("node.editMenu") });
			menuDefinition = menuDefinition.concat({ divider: true });
		}
		// Undo and redo
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "undo", label: this.labelUtil.getLabel("canvas.undo"), enable: this.canUndo() },
				{ action: "redo", label: this.labelUtil.getLabel("canvas.redo"), enable: this.canRedo() },
				{ divider: true }]);
		}
		// Delete objects
		if (source.type === "node" || source.type === "comment" ||
				(this.getCanvasConfig().enableLinkSelection !== LINK_SELECTION_NONE && source.type === "link")) {
			menuDefinition = menuDefinition.concat([{ action: "deleteSelectedObjects", label: this.labelUtil.getLabel("canvas.deleteObject") },
				{ divider: true }]);
		}
		// Create supernode
		if (source.type === "node" || source.type === "comment") {
			if (this.isCreateSupernodeCMOptionRequired() &&
					((has(this, "contextMenuConfig.enableCreateSupernodeNonContiguous") &&
						this.contextMenuConfig.enableCreateSupernodeNonContiguous) ||
						this.areSelectedNodesContiguous())) {
				menuDefinition = menuDefinition.concat([{ action: "createSuperNode", label: this.labelUtil.getLabel("node.createSupernode") }]);
				if (this.getCanvasConfig().enableExternalPipelineFlows) {
					menuDefinition = menuDefinition.concat([{ action: "createSuperNodeExternal", label: this.labelUtil.getLabel("node.createSupernodeExternal") }]);
				}
				menuDefinition = menuDefinition.concat([{ divider: true }]);
			}
		}
		// Supernode options - only applicable with a single supernode selected
		// which is opened by the "canvas" (default) editor.
		if (source.type === "node" && source.selectedObjectIds.length === 1 && source.targetObject.type === SUPER_NODE &&
				(source.targetObject.open_with_tool === "canvas" || typeof source.targetObject.open_with_tool === "undefined")) {
			// Deconstruct supernode
			menuDefinition = menuDefinition.concat({ action: "deconstructSuperNode",
				label: this.labelUtil.getLabel("node.deconstructSupernode") });

			menuDefinition = menuDefinition.concat({ divider: true });

			// Collapse supernode
			if (this.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
				menuDefinition = menuDefinition.concat({ action: "collapseSuperNodeInPlace",
					label: this.labelUtil.getLabel("node.collapseSupernodeInPlace") });
			// Expand supernode
			} else {
				menuDefinition = menuDefinition.concat({ action: "expandSuperNodeInPlace",
					label: this.labelUtil.getLabel("node.expandSupernode") });
			}

			// Expand supernode to full page display
			if (get(this, "contextMenuConfig.defaultMenuEntries.displaySupernodeFullPage")) {
				menuDefinition = menuDefinition.concat({ action: "displaySubPipeline",
					label: this.labelUtil.getLabel("node.displaySupernodeFullPage") });
			}

			menuDefinition = menuDefinition.concat({ divider: true });

			// Convert supernode
			if (this.getCanvasConfig().enableExternalPipelineFlows) {
				// Convert External to Local
				if (source.targetObject.subflow_ref.url) {
					// Supernodes inside an external sub-flow cannot be made local.
					if (!this.isPipelineExternal(source.pipelineId)) {
						menuDefinition = menuDefinition.concat({ action: "convertSuperNodeExternalToLocal",
							label: this.labelUtil.getLabel("node.convertSupernodeExternalToLocal") }, { divider: true });
					}
				// Convert Local to External
				} else {
					menuDefinition = menuDefinition.concat({ action: "convertSuperNodeLocalToExternal",
						label: this.labelUtil.getLabel("node.convertSupernodeLocalToExternal") }, { divider: true });
				}
			}
		}

		// Delete link
		if (this.getCanvasConfig().enableLinkSelection === LINK_SELECTION_NONE &&
				source.type === "link") {
			menuDefinition = menuDefinition.concat([{ action: "deleteLink", label: this.labelUtil.getLabel("canvas.deleteObject") }]);
		}
		// Highlight submenu (Highlight Branch | Upstream | Downstream, Unhighlight)
		if (source.type === "node") {
			let highlightSubMenuDef = this.createHighlightMenu(source);
			highlightSubMenuDef.push({ divider: true });
			highlightSubMenuDef = highlightSubMenuDef.concat(this.createUnhighlightMenu(source));
			menuDefinition = menuDefinition.concat({ submenu: true, menu: highlightSubMenuDef, label: this.labelUtil.getLabel("menu.highlight") });
		}
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat({ action: "unhighlight", label: this.labelUtil.getLabel("menu.unhighlight"), enable: this.highlight });
		}
		if (source.type === "node" &&
				has(this, "contextMenuConfig.defaultMenuEntries.saveToPalette") &&
				this.contextMenuConfig.defaultMenuEntries.saveToPalette) {
			menuDefinition = menuDefinition.concat({ divider: true },
				{ action: "saveToPalette", label: this.labelUtil.getLabel("node.saveToPalette") });
		}

		return menuDefinition;
	}

	// Returns a new menu based, on the menu passed in, where all actions that
	// might alter the canvas have been removed.
	filterOutEditingActions(menuDefinition) {
		const newMenuDefinition = [];
		menuDefinition.forEach((menuEntry) => {
			if (menuEntry.submenu) {
				const newSubMenu = this.filterOutEditingActions(menuEntry.menu);
				if (newSubMenu && newSubMenu.length > 0) {
					menuEntry.menu = newSubMenu;
					newMenuDefinition.push(menuEntry);
				}

			} else if (!this.isEditingAction(menuEntry.action)) {
				newMenuDefinition.push(menuEntry);
			}
		});
		return newMenuDefinition;
	}

	// Returns true if the action string passed in is one of the actions
	// that would alter the canvas objects. This is useful for filtering
	// out editing actions that should be unavailable with a read-only canvas.
	isEditingAction(action) {
		return (
			action === "createComment" ||
			action === "disconnectNode" ||
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
		);
	}

	// Returns whether the 'Create Supernode' context menu option is required or
	// not. The default is true.
	isCreateSupernodeCMOptionRequired() {
		let required = true;
		if (has(this, "contextMenuConfig.defaultMenuEntries.createSupernode") &&
				this.contextMenuConfig.defaultMenuEntries.createSupernode === false) {
			required = false;
		}

		return required;
	}

	contextMenuHandler(source) {
		this.contextMenuSource = source;
		const defMenu = this.createDefaultMenu(source);
		let menuDefinition;

		if (typeof this.handlers.contextMenuHandler === "function") {
			const menuCustom = this.handlers.contextMenuHandler(source, defMenu);
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
				this.getCanvasConfig().enableEditingActions === false) {
			menuDefinition = this.filterOutEditingActions(menuDefinition);
		}

		if (menuDefinition && menuDefinition.length > 0 &&
				!this.allDividers(menuDefinition)) {
			this.openContextMenu(menuDefinition);
		}
	}

	// Returns true if the menu only contains dividers. This might happen if
	// action items have been removed from a menu and left only dividers behind.
	allDividers(menu) {
		const dividers = menu.filter((m) => m.divider);
		return menu.length === dividers.length;
	}

	getContextMenuPos() {
		if (this.contextMenuSource) {
			return this.contextMenuSource.cmPos;
		}
		return { x: 0, y: 0 };
	}

	contextMenuActionHandler(action, editParam) {
		this.logger.log("contextMenuActionHandler - action: " + action);
		this.logger.log(this.contextMenuSource);
		const data = Object.assign({}, this.contextMenuSource, { "editType": action, "editParam": editParam, "editSource": "contextmenu" });
		this.editActionHandler(data);

		this.canvasContents.focusOnCanvas(); // Set focus on canvas so keybord events go there.
		this.closeContextMenu();
	}

	toolbarActionHandler(action) {
		this.logger.log("toolbarActionHandler - action: " + action);
		this.editActionHandler({
			editType: action,
			editSource: "toolbar",
			pipelineId: this.objectModel.getSelectedPipelineId() });
	}

	keyboardActionHandler(action, mousePos) {
		this.logger.log("keyboardActionHandler - action: " + action);

		this.editActionHandler({
			editType: action,
			editSource: "keyboard",
			pipelineId: this.objectModel.getSelectedPipelineId(),
			mousePos: mousePos });
	}

	clickActionHandler(source) {
		this.logger.log("clickActionHandler - " + source.clickType + " on " + source.objectType);
		if (this.handlers.clickActionHandler) {
			this.handlers.clickActionHandler(source);
		}
	}

	decorationActionHandler(node, id, pipelineId) {
		this.logger.log("decorationActionHandler - node: " + node.id + " id: " + id);
		if (this.handlers.decorationActionHandler) {
			this.handlers.decorationActionHandler(node, id, pipelineId);
		}
	}

	editActionHandler(cmndData) {
		this.logger.log("editActionHandler - " + cmndData.editType);
		this.logger.log(cmndData);
		let data = cmndData;
		data.selectedObjectIds = this.getSelectedObjectIds();
		data.selectedObjects = this.getSelectedObjects();

		// Generate a dummy external URL when an external sub-flow is being
		// created.
		if (data.editType === "createSuperNodeExternal" ||
				data.editType === "convertSuperNodeLocalToExternal") {
			data.externalUrl = "";
			data.externalPipelineFlowId = "";

		// Pre-process for handling external pipeline flows.
		} else if (data.editType === "loadPipelineFlow" ||
				data.editType === "expandSuperNodeInPlace" ||
				data.editType === "displaySubPipeline" ||
				data.editType === "deconstructSuperNode" ||
				data.editType === "convertSuperNodeExternalToLocal") {
			data = this.preProcessForExternalPipelines(data);
		}

		// Check with host application if it wants to proceed with the command
		// and also let the application modify the command input data if required.
		if (this.handlers.beforeEditActionHandler) {
			let cmnd = null;
			if (data.editType === "undo") {
				cmnd = this.getCommandStack().getUndoCommand();
			} else if (data.editType === "redo") {
				cmnd = this.getCommandStack().getRedoCommand();
			}
			data = this.handlers.beforeEditActionHandler(data, cmnd);
			// If the host app returns null, it doesn't want the action to proceed.
			if (!data) {
				return;
			}
			// If an external pipeline flow was requested, we need to make sure it
			// was provided by the host app. We can't proceed if it was not.
			if (!this.wasExtPipelineFlowLoadSuccessful(data)) {
				return;
			}
		}

		// Now preprocessing is complete, execuete the action itself.
		this.editAction(data);
	}

	// Performs the edit action using the 'data' parameter, which contains the
	// approprite action parameters, without executing any of the preprocessing
	// or the beforeEditActionhandler callback. This is useful for applications
	// that need to do asynchronous activty in their beforeEditActionHandler code.
	// Those applications should call this method to execute the command, after
	// their asynchronous activity has ended, instead of the editActionHandler
	// method otherwise the host app's beforeEdtActionHandler callback will be
	// called a second time.
	editAction(cmndData) {
		let data = cmndData;

		// Only execute the delete if there are some selections to delete.
		// This prevents an 'empty' command being added to the command stack when
		// 'delete' is pressed on the keyboard.
		if (data.editType === "deleteSelectedObjects" &&
				data.selectedObjectIds.length === 0) {
			return;
		}

		// These commands are supported for the external AND internal object models.
		switch (data.editType) {
		case "selectAll": {
			this.selectAll(data.pipelineId);
			break;
		}
		case "zoomIn": {
			this.zoomIn();
			break;
		}
		case "zoomOut": {
			this.zoomOut();
			break;
		}
		case "zoomToFit": {
			this.zoomToFit();
			break;
		}
		case "setZoom": {
			this.objectModel.setZoom(data.zoom, data.pipelineId);
			break;
		}
		case "togglePalette": {
			this.togglePalette();
			break;
		}
		case "toggleNotificationPanel": {
			this.toggleNotificationPanel();
			break;
		}
		case "loadPipelineFlow": {
			this.objectModel.ensurePipelineIsLoaded(data);
			break;
		}
		default:
		}

		// These commands are added to the command stack
		let command = null;

		if (this.getCanvasConfig().enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				command = new CreateNodeAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createNodeOnLink": {
				command = new CreateNodeOnLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createNodeAttachLinks": {
				command = new CreateNodeAttachLinksAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createAutoNode": {
				const autoLinkSelNodes = this.getCanvasConfig().enableAutoLinkOnlyFromSelNodes;
				command = new CreateAutoNodeAction(data, this.objectModel, this.labelUtil, autoLinkSelNodes);
				this.commandStack.do(command);
				this.panToReveal(data);
				data = command.getData();
				break;
			}
			case "createComment": {
				command = new CreateCommentAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "createAutoComment": {
				const svgPos = this.getSVGCanvasD3().getSvgViewportOffset();
				command = new CreateCommentAction(data, this.objectModel, this.labelUtil, svgPos);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "insertNodeIntoLink": {
				command = new InsertNodeIntoLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "attachNodeToLinks": {
				command = new AttachNodeToLinksAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "moveObjects": {
				command = new MoveObjectsAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "resizeObjects": {
				command = new SizeAndPositionObjectsAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "setObjectsStyle": {
				command = new SetObjectsStyleAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "setLinksStyle": {
				command = new SetLinksStyleAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "updateLink": {
				command = new UpdateLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "setNodeLabel": {
				command = new SetNodeLabelAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "editComment": {
				command = new EditCommentAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "editDecorationLabel": {
				command = new EditDecorationLabelAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "linkNodes": {
				command = new CreateNodeLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "linkNodesAndReplace": {
				command = new CreateNodeLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "linkComment": {
				command = new CreateCommentLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createDetachedLink": {
				command = new CreateNodeLinkDetachedAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "colorSelectedObjects": {
				command = new ColorSelectedObjectsAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "deleteSelectedObjects": {
				command = new DeleteObjectsAction(data, this.objectModel, this.labelUtil, this.areDetachableLinksInUse());
				this.commandStack.do(command);
				break;
			}
			case "displaySubPipeline": {
				command = new DisplaySubPipelineAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "displayPreviousPipeline": {
				command = new DisplayPreviousPipelineAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "arrangeHorizontally": {
				command = new ArrangeLayoutAction(data, this.objectModel, this.labelUtil, constants.HORIZONTAL);
				this.commandStack.do(command);
				break;
			}
			case "arrangeVertically": {
				command = new ArrangeLayoutAction(data, this.objectModel, this.labelUtil, constants.VERTICAL);
				this.commandStack.do(command);
				break;
			}
			case "createSuperNode":
			case "createSuperNodeExternal": {
				command = new CreateSuperNodeAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "deconstructSuperNode": {
				command = new DeconstructSuperNodeAction(data, this.objectModel, this.labelUtil,
					this.getCanvasConfig().enableMoveNodesOnSupernodeResize);
				this.commandStack.do(command);
				break;
			}

			case "expandSuperNodeInPlace": {
				command = new ExpandSuperNodeInPlaceAction(data, this.objectModel, this.labelUtil,
					this.getCanvasConfig().enableMoveNodesOnSupernodeResize);
				this.commandStack.do(command);
				break;
			}
			case "collapseSuperNodeInPlace": {
				command = new CollapseSuperNodeInPlaceAction(data, this.objectModel, this.labelUtil,
					this.getCanvasConfig().enableMoveNodesOnSupernodeResize);
				this.commandStack.do(command);
				break;
			}
			case "convertSuperNodeExternalToLocal": {
				command = new ConvertSuperNodeExternalToLocal(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "convertSuperNodeLocalToExternal": {
				command = new ConvertSuperNodeLocalToExternal(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "deleteLink": {
				command = new DeleteLinkAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "disconnectNode": {
				command = new DisconnectObjectsAction(data, this.objectModel, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "saveToPalette": {
				command = new SaveToPaletteAction(data, this.objectModel, this.labelUtil, this.labelUtil);
				this.commandStack.do(command);
				break;
			}
			case "cut": {
				this.objectModel.copyToClipboard(this.areDetachableLinksInUse());
				command = new DeleteObjectsAction(data, this.objectModel, this.labelUtil,
					this.areDetachableLinksInUse());
				this.commandStack.do(command);
				break;
			}
			case "copy": {
				this.objectModel.copyToClipboard(this.areDetachableLinksInUse());
				break;
			}
			case "paste": {
				const pasteObjects = this.objectModel.getObjectsToPaste();
				if (pasteObjects) {
					data.objects = pasteObjects;
					const vpDims = this.getSVGCanvasD3().getTransformedViewportDimensions();
					command = new PasteAction(data, this.objectModel, this.labelUtil,
						vpDims, this.areDetachableLinksInUse(), this.isSnapToGridInUse());
					this.commandStack.do(command);
					data = command.getData();
				}
				break;
			}
			case "undo": {
				command = this.getCommandStack().getUndoCommand();
				this.commandStack.undo();
				break;
			}
			case "redo": {
				command = this.getCommandStack().getRedoCommand();
				this.commandStack.redo();
				break;
			}

			// Commands which are not added to the command stack.
			case "highlightBranch":
				data.highlightedObjectIds = this.highlightBranch(this.objectModel.getSelectedNodesIds(), data.pipelineId);
				break;
			case "highlightDownstream":
				data.highlightedObjectIds = this.highlightDownstream(this.objectModel.getSelectedNodesIds(), data.pipelineId);
				break;
			case "highlightUpstream":
				data.highlightedObjectIds = this.highlightUpstream(this.objectModel.getSelectedNodesIds(), data.pipelineId);
				break;
			case "unhighlight":
				// this.setSubdueStyle(null);
				this.removeAllStyles(true);
				this.highlight = false; // TODO: use this for context menu when to show unhighlight option.
				break;
			case "openNotificationPanel":
				this.openNotificationPanel();
				break;
			case "closeNotificationPanel":
				this.closeNotificationPanel();
				break;
			default:
			}
		}

		if (this.handlers.editActionHandler) {
			this.handlers.editActionHandler(data, command);
		}

		// After executing the 'loadPipelineFlow' and 'expandSuperNodeInPlace'
		// actions we need to check to see if there are any more expanded
		// supernodes that refer to external pipelines. These need to be loaded
		// for the pipeline to display correctly. If there is more than one expanded
		// pipeline visible they will be loaded one by one when this check is
		// encountered.
		this.ensureVisibleExpandedPipelinesAreLoaded();
	}

	// Sets the appropriate values when handling an external pipleine flow
	// when performing sub-flow actions.
	preProcessForExternalPipelines(data) {
		data.externalPipelineFlowLoad = false;

		// targetObject might be missing if we are handing display of the
		// primary pipeline which will always be 'local' not 'external'.
		if (data.targetObject) {
			const externalPipelineFlowUrl = get(data, "targetObject.subflow_ref.url");

			// If there is a URL then we must be accessing an external pipeline flow.
			if (externalPipelineFlowUrl) {
				data.externalUrl = externalPipelineFlowUrl;

				// Try to retrieve the pipeline from our store. If it is not there then
				// we'll need to load it from the host application so switch load flag on.
				data.externalPipelineFlow = this.objectModel.getExternalPipelineFlow(externalPipelineFlowUrl);
				if (!data.externalPipelineFlow) {
					data.externalPipelineFlowLoad = true;
				}
			}
		}

		return data;
	}

	// Ensures that any external pipeline, associated with any visible expanded
	// supernodes in the pipeline flow being displayed, are loaded. This method
	// is called for one pipeline at a time until all needed pipeline flows are
	// loaded. This allows the host app to serve up one pipeline flow at a time.
	ensureVisibleExpandedPipelinesAreLoaded() {
		const expandedSupernodes = this.objectModel.getVisibleExpandedExternalSupernodes();
		if (expandedSupernodes && expandedSupernodes.length > 0) {
			this.editActionHandler({
				editType: "loadPipelineFlow",
				targetObject: expandedSupernodes[0]
			});
		}
	}

	// Returns false if the host application did not provided an external pipeline
	// flow when requested by common-canvas setting the externalPipelineFlowLoad
	// boolean to true. Returns true otherwise which will be the case when no
	// external pipeline was requested.
	wasExtPipelineFlowLoadSuccessful(data) {
		if (data.externalPipelineFlowLoad && !data.externalPipelineFlow) {
			const msg = "The host app did not provide a pipeline flow when requested for action " +
				data.editType + " in beforeEditActionHandler, for URL: " +
				data.externalUrl;
			this.logger.error(msg);
			return false;
		}
		return true;
	}

	// Pans the canvas to bring the newly added node into view if it is not
	// already visible. This needs to be done after the canvas has finished
	// updating so we add the function as a callback to be called after update.
	panToReveal(data) {
		// Declare a function that will reposition the canvas to show the
		// newly added node if it's outside the viewport.
		const moveCanvasToReveal = () => {
			const zoomObject = this.getZoomToReveal([data.newNode.id]);
			if (zoomObject) {
				this.zoomTo(zoomObject);
			}
			// Remove the callback after it has been called so it is not called for
			// other canvas operations.
			this.removeAfterUpdateCallback(moveCanvasToReveal);
		};

		this.addAfterUpdateCallback(moveCanvasToReveal);
	}
}

// A static variable for saving the current node template being dragged.
CanvasController.dragNodeTemplate = null;
