/*
 * Copyright 2017-2020 IBM Corporation
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
import DisconnectObjectsAction from "../command-actions/disconnectObjectsAction.js";
import DisplayPreviousPipelineAction from "../command-actions/displayPreviousPipelineAction.js";
import DisplaySubPipelineAction from "../command-actions/displaySubPipelineAction.js";
import EditCommentAction from "../command-actions/editCommentAction.js";
import ExpandSuperNodeInPlaceAction from "../command-actions/expandSuperNodeInPlaceAction.js";
import InsertNodeIntoLinkAction from "../command-actions/insertNodeIntoLinkAction.js";
import MoveObjectsAction from "../command-actions/moveObjectsAction.js";
import SaveToPaletteAction from "../command-actions/saveToPaletteAction.js";
import SetObjectsStyleAction from "../command-actions/setObjectsStyleAction.js";
import SetLinksStyleAction from "../command-actions/setLinksStyleAction.js";
import Logger from "../logging/canvas-logger.js";
import ObjectModel from "../object-model/object-model.js";
import SizeAndPositionObjectsAction from "../command-actions/sizeAndPositionObjectsAction.js";
import LocalStorage from "./local-storage.js";
import has from "lodash/has";
import { ASSOC_STRAIGHT } from "./constants/canvas-constants";
import defaultMessages from "../../locales/common-canvas/locales/en.json";

// Global instance ID counter
var commonCanvasControllerInstanceId = 0;

export default class CanvasController {

	constructor() {
		this.logger = new Logger("CanvasController");

		this.defaultTipConfig = {
			"palette": true,
			"nodes": true,
			"ports": true,
			"links": true
		};

		this.canvasConfig = {
			enableInteractionType: "Mouse",
			enableConnectionType: "Ports",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableParentClass: "",
			enableAssocLinkCreation: false,
			enableAssocLinkType: ASSOC_STRAIGHT,
			enableDragWithoutSelect: false,
			enableInternalObjectModel: true,
			enablePaletteLayout: "Flyout",
			enableInsertNodeDroppedOnLink: false,
			enableHightlightNodeOnNewLinkDrag: false,
			enableMoveNodesOnSupernodeResize: true,
			enableDisplayFullLabelOnHover: false,
			enableDropZoneOnExternalDrag: false,
			enableZoomIntoSubFlows: false,
			enableSaveZoom: "None",
			enableSnapToGridType: "None",
			enableSnapToGridX: null,
			enableSnapToGridY: null,
			enableAutoLayoutVerticalSpacing: null,
			enableAutoLayoutHorizontalSpacing: null,
			enableBoundingRectangles: false,
			enableNarrowPalette: true,
			paletteInitialState: false,
			emptyCanvasContent: null,
			dropZoneCanvasContent: null,
			schemaValidation: false,
			tipConfig: this.defaultTipConfig,
			enableCanvasLayout: {},
			enableNodeLayout: {}
		};

		this.contextMenuConfig = {
			enableCreateSupernodeNonContiguous: false,
			defaultMenuEntries: {
				saveToPalette: false,
				createSupernode: true
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
			selectionChangeHandler: null
		};

		this.commonCanvas = null;
		this.contextMenuSource = null;

		this.objectModel = new ObjectModel();
		this.commandStack = new CommandStack();

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
		this.canvasConfig = Object.assign(this.canvasConfig, config);
		this.objectModel.setSchemaValidation(this.canvasConfig.schemaValidation);
	}

	getCanvasConfig() {
		return this.canvasConfig;
	}

	setIntl(intl) {
		this.intl = intl;
	}

	setContextMenuConfig(contextMenuConfig) {
		this.contextMenuConfig = Object.assign(this.contextMenuConfig, contextMenuConfig);
	}

	setKeyboardConfig(keyboardConfig) {
		if (keyboardConfig && keyboardConfig.actions) {
			this.keyboardConfig.actions = Object.assign({}, this.keyboardConfig.actions, keyboardConfig.actions);
		}
	}

	getKeyboardConfig() {
		return this.keyboardConfig;
	}

	setHandlers(inHandlers) {
		this.handlers = Object.assign(this.handlers, inHandlers);
		this.objectModel.setIdGeneratorHandler(inHandlers.idGeneratorHandler);
		this.objectModel.setSelectionChangeHandler(inHandlers.selectionChangeHandler);
		this.objectModel.setLayoutHandler(inHandlers.layoutHandler);
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

	// ---------------------------------------------------------------------------
	// Pipeline flow methods
	// ---------------------------------------------------------------------------

	// Loads the pipelineFlow document provided into common-canvas and displays it.
	// The document must conform to the pipelineFlow schema as documented in the
	// wdp-pipeline-schemas repo. Documents conforming to older versions may be
	// provided but they will be upgraded to the most recent version.
	setPipelineFlow(flow) {
		this.objectModel.setPipelineFlow(flow);
	}

	// Clears the pipleine flow and displays an empty canvas.
	clearPipelineFlow() {
		this.objectModel.clearPipelineFlow();
	}

	// Returns the current pipelineFlow document in the latest version of the
	// pipelineFlow schema as documented in the wdp-pipeline-schemas repo.
	getPipelineFlow() {
		return this.objectModel.getPipelineFlow();
	}

	// Returns the ID of the primary pipeline from the pipelineFlow.
	getPrimaryPipelineId() {
		return this.objectModel.getPrimaryPipelineId();
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

	// Changes the zoom amounts for the pipeline. Zoom is an object with three
	// fields:
	// k: is the scale amount which is a number greater than 0 where 1 is the
	//    default scale size.
	// x: Is the horizontal translate amount which is a number indicating the
	//    pixel amount to move. Negative left and positive right
	// y: Is the vertical translate amount which is a number indicating the
	//    pixel amount to move. Negative up and positive down.
	zoomPipeline(zoom, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).zoomPipeline(zoom);
	}

	// Clears any saved zoom values stored in local storage. This means
	// newly opened flows will appear with the default zoom. This method
	// is only applicable when the enableSaveZoom config parameter is
	// set to "localstorage".
	clearSavedZoomValues() {
		LocalStorage.delete("canvasSavedZoomValues");
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

	// Loads the palette data as descibed in the palette schema in
	// wdp-pipeline-schemas repo. Any version can be loaded and it will be
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
	// palette-v2-schema:
	//  https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-canvas/palette/palette-v2-schema.json)
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
	// in nodeTypes array in the palette-v2-schema:
	//  https://github.ibm.com/NGP-TWC/wdp-pipeline-schemas/blob/master/common-canvas/palette/palette-v2-schema.json)
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
	selectAll() {
		this.objectModel.selectAll();
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

	// Returns the currently selected objects (Nodes and Comments).
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

	// Returns the array of currently displayed notification messages shown in
	// the notification panel. The format of a notification message is an object
	// with these fields:
	// {
	//   "id": string (Required),
	//   "type" : enum, oneOf ["informational", "success", "warning", "error"] (Required),
	//   "title": string (Optional)
	//   "content": string, html, JSX Object (Optional),
	//   "timestamp": string (Optional)
	//   "callback": function, the callback function when a message is clicked (Required)
	// }
	getNotificationMessages(messageType) {
		return this.objectModel.getNotificationMessages(messageType);
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
	deleteObject(id, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteObject(id);
	}

	// Sets the class name to newClassName of the object identified by objectId
	// in the pipleine specified by pipeline ID.
	setObjectsClassName(objectId, newClassName, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setObjectsClassName(objectId, newClassName);
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

	// Returns a new node created from the object passed in which has the
	// following properties:
	// nodeTemplate - a node template from the palette
	// offsetX - the x coordinate of the new node
	// offsetY - the y coordinate of the new node
	// pipelineId - the ID of the pipeline where the new node will exist
	createNode(data, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).createNode(data);
	}

	// Adds a new node into the pipeline specified by the pipelineId.
	addNode(node, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).addNode(node);
	}

	// Deletes the node specified.
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	deleteNode(nodeId, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).deleteNode(nodeId);
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

	// Sets the decorations on a node. The decorations array passed in
	// will replace any decorations currently applied to the node.
	// nodeId - The ID of the node
	// newDecorations - An array of decorations. See Wiki for details.
	// pipelineId - The ID of the pipeline
	setNodeDecorations(nodeId, newDecorations, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).setNodeDecorations(nodeId, newDecorations);
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

	// Gets an array of decorations for a node
	// nodeId - The ID of the node
	// pipelineId - The ID of the pipeline
	getNodeDecorations(nodeId, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeDecorations(nodeId);
	}

	// Gets the style spcification (see Wiki) for a node
	// nodeId - The ID of the node
	// temporary - A boolean to indicate if the styles are serialized when
	//             getPipelineFlow() method is called or not.
	// pipelineId - The ID of the pipeline
	getNodeStyle(nodeId, temporary, pipelineId) {
		return this.objectModel.getAPIPipeline(pipelineId).getNodeStyle(nodeId, temporary);
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
		this.objectModel.getAPIPipeline(pipelineId).createNodeLinks(data);
	}

	// Creates comment links
	// data - Data describing the links
	// pipelineId - The ID of the pipeline
	createCommentLinks(data, pipelineId) {
		this.objectModel.getAPIPipeline(pipelineId).createCommentLinks(data);
	}

	// Sets the class name on links
	// linkIds - An array of links
	// newClassName - The class name
	// pipelineId - The ID of the pipeline
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

	addAfterUpdateCallback(callback) {
		if (this.commonCanvas) {
			this.commonCanvas.addAfterUpdateCallback(callback);
		}
	}

	removeAfterUpdateCallback(callback) {
		if (this.commonCanvas) {
			this.commonCanvas.removeAfterUpdateCallback(callback);
		}
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

	// Changes the zoom amounts for the canvas. This method does not alter the
	// pipelineFlow document. zoomObject is an object with three fields:
	// x: Is the horizontal translate amount which is a number indicating the
	//    pixel amount to move. Negative left and positive right
	// y: Is the vertical translate amount which is a number indicating the
	//    pixel amount to move. Negative up and positive down.
	// k: is the scale amount which is a number greater than 0 where 1 is the
	//    default scale size.
	zoomTo(zoomObject) {
		if (this.commonCanvas) {
			this.commonCanvas.zoomTo(zoomObject);
		}
	}

	// Returns a zoom object if any of the objects (nodes and/or comments)
	// identified by the objectIds array are not fully within the canvas viewport.
	// Returns null if all objects are fully within the canvas viewport.
	// The zoom object returned is an object with three fields:
	// x: Is the horizontal translate amount which is a number indicating the
	//    pixel amount to move. Negative left and positive right
	// y: Is the vertical translate amount which is a number indicating the
	//    pixel amount to move. Negative up and positive down.
	// k: is the scale amount which is a number greater than 0 where 1 is the
	//    default scale size.
	// Parameter:
	// objectIds - An array of nodes and/or comment IDs.
	getZoomToReveal(objectIds) {
		if (this.commonCanvas) {
			return this.commonCanvas.getZoomToReveal(objectIds);
		}
		return null;
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

		if (nodes.length === 0 && comments.length === 0) {
			return false;
		}

		if (nodes && nodes.length > 0) {
			copyData.nodes = nodes;
			let pipelines = [];
			const supernodes = apiPipeline.getSupernodes(nodes);
			supernodes.forEach((supernode) => {
				pipelines = pipelines.concat(this.objectModel.getSubPipelinesForSupernode(supernode));
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
		LocalStorage.set("canvasClipboard", clipboardData);

		return true;
	}

	isClipboardEmpty() {
		const value = LocalStorage.get("canvasClipboard");
		if (value && value !== "") {
			return false;
		}
		return true;
	}

	pasteFromClipboard(pipelineId) {
		this.editActionHandler({
			editType: "paste",
			editSource: "api",
			pipelineId: pipelineId
		});
	}

	getObjectsToPaste(pipelineId) {
		const textToPaste = LocalStorage.get("canvasClipboard");

		if (!textToPaste) {
			return {};
		}

		const objects = JSON.parse(textToPaste);

		// If there are no nodes and no comments there's nothing to paste so just
		// return.
		if (!objects.nodes && !objects.comments) {
			return {};
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

		return {
			objects: objects,
			pipelineId: apiPipeline.pipelineId
		};
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

	// Processes the drop of a palette node template onto the canvas.
	// nodeTemplate - The node template being dragged from the palette
	// link - the link where the node template is being dropped, or null if no link
	// transPos - mouse position transformed for canvas co-ordinates
	// pipelineId - the ID of the pipeline onto which the node is being dropped
	createDroppedPalettedNode(nodeTemplate, link, transPos, pipelineId) {
		if (nodeTemplate) {
			const newNodeTemplate = this.objectModel.convertNodeTemplate(nodeTemplate);
			if (link &&
					this.canNodeBeDroppedOnLink(newNodeTemplate) &&
					this.isInternalObjectModelEnabled()) {
				this.createNodeFromTemplateOnLinkAt(newNodeTemplate, link, transPos.x, transPos.y, pipelineId);
			} else {
				this.createNodeFromTemplateAt(newNodeTemplate, transPos.x, transPos.y, pipelineId);
			}
		}
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
		var data = {
			editType: "createAutoNode",
			editSource: "canvas",
			nodeTemplate: this.objectModel.convertNodeTemplate(nodeTemplate),
			pipelineId: apiPipeline.pipelineId
		};

		this.editActionHandler(data);
	}

	// Called when a node is dragged from the palette onto the canvas
	createNodeFromTemplateAt(nodeTemplate, x, y, pipelineId) {
		var data = {
			editType: "createNode",
			editSource: "canvas",
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
			editSource: "canvas",
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

	canNodeBeDroppedOnLink(nodeType) {
		if (nodeType.inputs && nodeType.inputs.length > 0 &&
				nodeType.outputs && nodeType.outputs.length > 0) {
			return true;
		}
		return false;
	}

	// Opens a full screen display if a sub-flow. pipelineInfo should contain two
	// fields:
	// pipelineId: The pipeline ID of the pipeline to be shown.
	// pipelineFlowId: The ID of the pipelineFlow document
	displaySubPipeline(pipelineInfo) {
		const data = { editType: "displaySubPipeline", pipelineInfo: pipelineInfo, editSource: "canvas" };
		this.editActionHandler(data);
	}

	displayPreviousPipeline() {
		const data = { editType: "displayPreviousPipeline", pipelineInfo: this.objectModel.getPreviousBreadcrumb(), editSource: "canvas" };
		this.editActionHandler(data);
	}

	getLabel(labelId) {
		return this.intl.formatMessage({ id: labelId, defaultMessage: defaultMessages[labelId] });
	}

	createEditMenu(source) {
		const editSubMenu = [
			{ action: "cut", label: this.getLabel("edit.cutSelection"), enable: source.selectedObjectIds.length > 0 },
			{ action: "copy", label: this.getLabel("edit.copySelection"), enable: source.selectedObjectIds.length > 0 },
			{ action: "paste", label: this.getLabel("edit.pasteSelection"), enable: !this.isClipboardEmpty() }
		];
		return editSubMenu;
	}

	createHighlightMenu(source) {
		const highlightSubMenu = [
			{ action: "highlightBranch", label: this.getLabel("menu.highlightBranch") },
			{ action: "highlightUpstream", label: this.getLabel("menu.highlightUpstream") },
			{ action: "highlightDownstream", label: this.getLabel("menu.highlightDownstream") }
		];
		return highlightSubMenu;
	}

	// This should only appear in menu if highlight is true.
	createUnhighlightMenu(source) {
		const unhighlightSubMenu = [
			{ action: "unhighlight", label: this.getLabel("menu.unhighlight"), enable: this.highlight }
		];
		return unhighlightSubMenu;
	}

	createDefaultMenu(source) {
		let menuDefinition = [];
		// Select all & add comment: canvas only
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "createComment", label: this.getLabel("canvas.addComment") },
				{ action: "selectAll", label: this.getLabel("canvas.selectAll") },
				{ divider: true }]);
		}
		// Disconnect node
		if (source.type === "node" || source.type === "comment") {
			const linksFound = this.objectModel.getAPIPipeline(source.pipelineId).getLinksContainingIds(source.selectedObjectIds);
			if (linksFound.length > 0) {
				menuDefinition = menuDefinition.concat({ action: "disconnectNode", label: this.getLabel("node.disconnectNode") });
				menuDefinition = menuDefinition.concat({ divider: true });
			}
		}
		// Edit submenu (cut, copy, paste)
		if (source.type === "node" || source.type === "comment" || source.type === "canvas") {
			const editSubMenu = this.createEditMenu(source);
			menuDefinition = menuDefinition.concat({ submenu: true, menu: editSubMenu, label: this.getLabel("node.editMenu") });
			menuDefinition = menuDefinition.concat({ divider: true });
		}
		// Undo and redo
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat([{ action: "undo", label: this.getLabel("canvas.undo"), enable: this.canUndo() },
				{ action: "redo", label: this.getLabel("canvas.redo"), enable: this.canRedo() },
				{ divider: true }]);
		}
		// Delete objects
		if (source.type === "node" || source.type === "comment") {
			menuDefinition = menuDefinition.concat([{ action: "deleteSelectedObjects", label: this.getLabel("canvas.deleteObject") },
				{ divider: true }]);
		}
		// Create supernode
		if (source.type === "node" || source.type === "comment") {
			if (this.isCreateSupernodeCMOptionRequired() &&
					((has(this, "contextMenuConfig.enableCreateSupernodeNonContiguous") &&
						this.contextMenuConfig.enableCreateSupernodeNonContiguous) ||
						this.areSelectedNodesContiguous())) {
				menuDefinition = menuDefinition.concat([{ action: "createSuperNode", label: this.getLabel("node.createSupernode") }]);
				menuDefinition = menuDefinition.concat([{ divider: true }]);
			}
		}
		// Expand and Collapse supernode
		if ((source.type === "node") && (source.selectedObjectIds.length === 1 && source.targetObject.type === "super_node")) {
			// Expand
			if ((!this.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) &&
				(source.targetObject.open_with_tool === "canvas" || typeof source.targetObject.open_with_tool === "undefined")) {
				menuDefinition = menuDefinition.concat({ action: "expandSuperNodeInPlace",
					label: this.getLabel("node.expandSupernodeInPlace") }, { divider: true });
			}
			// Collapse
			if (this.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
				menuDefinition = menuDefinition.concat({ action: "collapseSuperNodeInPlace",
					label: this.getLabel("node.collapseSupernodeInPlace") }, { divider: true });
			}
		}
		// Delete link
		if (source.type === "link") {
			menuDefinition = menuDefinition.concat([{ action: "deleteLink", label: this.getLabel("canvas.deleteObject") }]);
		}
		// Highlight submenu (Highlight Branch | Upstream | Downstream, Unhighlight)
		if (source.type === "node") {
			let highlightSubMenuDef = this.createHighlightMenu(source);
			highlightSubMenuDef.push({ divider: true });
			highlightSubMenuDef = highlightSubMenuDef.concat(this.createUnhighlightMenu(source));
			menuDefinition = menuDefinition.concat({ submenu: true, menu: highlightSubMenuDef, label: this.getLabel("menu.highlight") });
		}
		if (source.type === "canvas") {
			menuDefinition = menuDefinition.concat({ action: "unhighlight", label: this.getLabel("menu.unhighlight"), enable: this.highlight });
		}
		if (source.type === "node" &&
				has(this, "contextMenuConfig.defaultMenuEntries.saveToPalette") &&
				this.contextMenuConfig.defaultMenuEntries.saveToPalette) {
			menuDefinition = menuDefinition.concat({ divider: true },
				{ action: "saveToPalette", label: this.getLabel("node.saveToPalette") });
		}
		return (menuDefinition);
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
		const defMenu = this.createDefaultMenu(source);
		this.contextMenuSource = source;
		if (typeof this.handlers.contextMenuHandler === "function") {
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
		this.logger.log(this.contextMenuSource);
		const data = Object.assign({}, this.contextMenuSource, { "editType": action, "editSource": "contextmenu" });
		this.editActionHandler(data);

		this.commonCanvas.focusOnCanvas(); // Set focus on canvas so keybord events go there.
		this.closeContextMenu();
	}

	toolbarActionHandler(action) {
		this.logger.log("toolbarActionHandler - action: " + action);
		this.editActionHandler({ editType: action, editSource: "toolbar" });
	}

	keyboardActionHandler(action) {
		this.logger.log("keyboardActionHandler - action: " + action);

		this.editActionHandler({
			editType: action,
			editSource: "keyboard",
			pipelineId: this.objectModel.getSelectedPipelineId()
		});
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
			if (!data) {
				return;
			}
		}

		// Only execute the delete if there are some selections to delete.
		// This prevents an 'empty' command being added to the command stack when
		// 'delete' is pressed on the keyboard.
		if (data.editType === "deleteSelectedObjects" &&
				data.selectedObjectIds.length === 0) {
			return;
		}

		// selectAll is supported for the external AND internal object models.
		if (data.editType === "selectAll") {
			this.objectModel.selectAll(data.pipelineId);
		}

		let command = null;

		if (this.canvasConfig.enableInternalObjectModel) {
			switch (data.editType) {
			case "createNode": {
				command = new CreateNodeAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createNodeOnLink": {
				command = new CreateNodeOnLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "createAutoNode": {
				command = new CreateAutoNodeAction(data, this.objectModel);
				this.commandStack.do(command);
				this.panToReveal(data);
				data = command.getData();
				break;
			}
			case "createComment": {
				command = new CreateCommentAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "createAutoComment": {
				const svgPos = this.commonCanvas.getSvgViewportOffset();
				command = new CreateCommentAction(data, this.objectModel, svgPos);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "insertNodeIntoLink": {
				command = new InsertNodeIntoLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "moveObjects": {
				command = new MoveObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "resizeObjects": {
				command = new SizeAndPositionObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "setObjectsStyle": {
				command = new SetObjectsStyleAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "setLinksStyle": {
				command = new SetLinksStyleAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "editComment": {
				command = new EditCommentAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "linkNodes": {
				command = new CreateNodeLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "linkComment": {
				command = new CreateCommentLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				data = command.getData();
				break;
			}
			case "deleteSelectedObjects": {
				command = new DeleteObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "displaySubPipeline": {
				command = new DisplaySubPipelineAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "displayPreviousPipeline": {
				command = new DisplayPreviousPipelineAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "arrangeHorizontally": {
				command = new ArrangeLayoutAction(constants.HORIZONTAL, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "arrangeVertically": {
				command = new ArrangeLayoutAction(constants.VERTICAL, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "createSuperNode": {
				command = new CreateSuperNodeAction(data, this.objectModel, this.intl);
				this.commandStack.do(command);
				break;
			}
			case "expandSuperNodeInPlace": {
				command = new ExpandSuperNodeInPlaceAction(data, this.objectModel, this.canvasConfig.enableMoveNodesOnSupernodeResize);
				this.commandStack.do(command);
				break;
			}
			case "collapseSuperNodeInPlace": {
				command = new CollapseSuperNodeInPlaceAction(data, this.objectModel, this.canvasConfig.enableMoveNodesOnSupernodeResize);
				this.commandStack.do(command);
				break;
			}
			case "deleteLink": {
				command = new DeleteLinkAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "disconnectNode": {
				command = new DisconnectObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "saveToPalette": {
				command = new SaveToPaletteAction(data, this.objectModel, this.intl);
				this.commandStack.do(command);
				break;
			}
			case "cut": {
				this.copyToClipboard();
				command = new DeleteObjectsAction(data, this.objectModel);
				this.commandStack.do(command);
				break;
			}
			case "copy":
				this.copyToClipboard();
				break;
			case "paste": {
				const pasteObj = this.getObjectsToPaste(data.pipelineId);
				if (pasteObj.objects) {
					data = Object.assign(data, { objects: pasteObj.objects, pipelineId: pasteObj.pipelineId });
					command = new CloneMultipleObjectsAction(data, this.objectModel);
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
			case "zoomPipeline": {
				this.zoomPipeline(data.zoom, data.pipelineId);
				break;
			}
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
				this.commonCanvas.openNotificationPanel();
				break;
			case "closeNotificationPanel":
				this.commonCanvas.closeNotificationPanel();
				break;
			default:
			}
		}

		if (this.handlers.editActionHandler) {
			this.handlers.editActionHandler(data, command);
		}
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
