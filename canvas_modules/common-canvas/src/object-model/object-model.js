/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint arrow-body-style: ["error", "always"] */
/* eslint complexity: ["error", 26] */

import { createStore, combineReducers } from "redux";
import { NONE, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL,
	CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT, CREATE_NODE_LINK,
	CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK } from "../common-canvas/constants/canvas-constants.js";
import dagre from "dagre/dist/dagre.min.js";
import LayoutDimensions from "./layout-dimensions.js";
import CanvasInHandler from "./canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import CanvasOutHandler from "./canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import PipelineInHandler from "./pipeline-in-handler.js";
import PipelineOutHandler from "./pipeline-out-handler.js";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import indexOf from "lodash/indexOf";
import uuid4 from "uuid/v4";
import { validatePipelineFlowAgainstSchema, validatePaletteAgainstSchema } from "./schemas-utils/schema-validator.js";
import { upgradePipelineFlow, extractVersion, LATEST_VERSION } from "@wdp/pipeline-schemas";
import { upgradePalette, extractPaletteVersion, LATEST_PALETTE_VERSION } from "./schemas-utils/upgrade-palette.js";

const nodes = (state = [], action) => {
	switch (action.type) {
	case "ADD_NODE":
	case "ADD_AUTO_NODE": {
		return [
			...state,
			action.data.newNode
		];
	}

	case "REPLACE_NODES": {
		return action.data;
	}

	case "MOVE_OBJECTS":
		// action.data.nodes contains an array of node and comment Ids
		if (action.data.nodes) {
			return state.map((node, index) => {
				if (action.data.nodes.findIndex((actionNodeId) => {
					return (actionNodeId === node.id);
				}) > -1) {
					const xPos = node.x_pos + action.data.offsetX;
					const yPos = node.y_pos + action.data.offsetY;
					return Object.assign({}, node, { x_pos: xPos, y_pos: yPos });
				}
				return node;
			});
		}
		return state;

	case "DELETE_OBJECT":
		return state.filter((node) => {
			return node.id !== action.data.id; // filter will return all objects NOT found
		});

	case "SET_NODE_PARAMETERS":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				newNode.parameters = action.data.parameters;
				return newNode;
			}
			return node;
		});

	case "SET_NODE_MESSAGE":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				if (newNode.messages) {
					const controlNameIndex = newNode.messages.findIndex((message) => {
						return (message.id_ref === action.data.message.id_ref);
					});
					if (controlNameIndex > -1) {
						newNode.messages[controlNameIndex] = action.data.message;
					} else {
						newNode.messages.push(action.data.message);
					}
				} else {
					newNode.messages = [action.data.message];
				}
				return newNode;
			}
			return node;
		});

	case "SET_NODE_MESSAGES":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				newNode.messages = action.data.messages;
				return newNode;
			}
			return node;
		});

	case "ADD_NODE_ATTR":
		return state.map((node, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === node.id);
			}) > -1) {
				const newNode = Object.assign({}, node);
				newNode.customAttrs = newNode.customAttrs || [];
				newNode.customAttrs.push(action.data.attrName);
				return newNode;
			}
			return node;
		});

	case "REMOVE_NODE_ATTR":
		return state.map((node, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === node.id);
			}) > -1) {
				const newNode = Object.assign({}, node);
				if (newNode.customAttrs) {
					newNode.customAttrs = newNode.customAttrs.filter((a) => {
						return a !== action.data.attrName;
					});
				}
				return newNode;
			}
			return node;
		});

	case "SET_NODE_LABEL":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				newNode.label = action.data.label;
				return newNode;
			}
			return node;
		});

	case "SET_INPUT_PORT_LABEL":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				return Object.assign({}, node, { input_ports: ports(node.input_ports, action) });
			}
			return node;
		});

	case "SET_OUTPUT_PORT_LABEL":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				return Object.assign({}, node, { output_ports: ports(node.output_ports, action) });
			}
			return node;
		});

	case "SET_PIPELINE_FLOW":
	case "SET_LAYOUT_INFO":
	case "SET_CANVAS_INFO":
		return state.map((node, index) => {
			let newNode = Object.assign({}, node);
			newNode = setNodeDimensions(newNode, action.layoutinfo);
			return newNode;
		});

	default:
		return state;
	}
};

const ports = (state = [], action) => {
	switch (action.type) {
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
		return state.map((port, index) => {
			if (action.data.portId === port.id) {
				const newPort = Object.assign({}, port);
				newPort.label = action.data.label;
				return newPort;
			}
			return port;
		});
	default:
		return state;
	}
};

const comments = (state = [], action) => {
	switch (action.type) {
	case "MOVE_OBJECTS":
		// action.data.nodes contains an array of node and comment Ids
		if (action.data.nodes) {
			return state.map((comment, index) => {
				if (action.data.nodes.findIndex((actionNodeId) => {
					return (actionNodeId === comment.id);
				}) > -1) {
					const xPos = comment.x_pos + action.data.offsetX;
					const yPos = comment.y_pos + action.data.offsetY;
					return Object.assign({}, comment, { x_pos: xPos, y_pos: yPos });
				}
				return comment;
			});
		}
		return state;

	case "DELETE_OBJECT":
		return state.filter((node) => {
			return node.id !== action.data.id; // filter will return all objects NOT found
		});

	case "ADD_COMMENT": {
		const newComment = {
			id: action.data.id,
			class_name: action.data.class_name,
			content: action.data.content,
			height: action.data.height,
			width: action.data.width,
			x_pos: action.data.x_pos,
			y_pos: action.data.y_pos
		};
		return [
			...state,
			newComment
		];
	}

	case "EDIT_COMMENT":
		return state.map((comment, index) => {
			if (action.data.nodes.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.content = action.data.label;
				newComment.height = action.data.height;
				newComment.width = action.data.width;
				newComment.x_pos = action.data.offsetX;
				newComment.y_pos = action.data.offsetY;
				return newComment;
			}
			return comment;
		});

	case "ADD_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.customAttrs = newComment.customAttrs || [];
				newComment.customAttrs.push(action.data.attrName);
				return newComment;
			}
			return comment;
		});

	case "REMOVE_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				if (newComment.customAttrs) {
					newComment.customAttrs = newComment.customAttrs.filter((a) => {
						return a !== action.data.attrName;
					});
				}
				return newComment;
			}
			return comment;
		});

	default:
		return state;
	}
};


const links = (state = [], action) => {
	switch (action.type) {
	case "DELETE_OBJECT":
		return state.filter((link) => {
			return (link.srcNodeId !== action.data.id && // If node being deleted is either source or target of link remove this link
				link.trgNodeId !== action.data.id);
		});

	case "ADD_LINK": {
		const newLink = {
			id: action.data.id,
			class_name: action.data.class_name,
			srcNodeId: action.data.srcNodeId,
			trgNodeId: action.data.trgNodeId,
			type: action.data.type
		};

		if (action.data.type === "nodeLink") {
			Object.assign(newLink, { "srcNodePortId": action.data.srcNodePortId, "trgNodePortId": action.data.trgNodePortId });
		}
		return [
			...state,
			newLink
		];
	}

	case "DELETE_LINK":
		return state.filter((link) => {
			return link.id !== action.data.id;
		});

	// When a comment is added, links have to be created from the comment
	// to each of the selected nodes.
	case "ADD_COMMENT": {
		const createdLinks = [];
		action.data.selectedObjectIds.forEach((objId, i) => {
			createdLinks.push({
				id: action.data.linkIds[i],
				class_name: "d3-comment-link",
				srcNodeId: action.data.id,
				trgNodeId: action.data.selectedObjectIds[i],
				type: "commentLink"
			});
		});
		return [
			...state,
			...createdLinks
		];
	}

	case "ADD_AUTO_NODE": {
		return [
			...state,
			action.data.newLink
		];
	}


	case "DISCONNECT_NODES":
		return state.filter((link) => {
			const index = action.data.selectedNodeIds.findIndex((selId) => {
				return (selId === link.srcNodeId ||
								selId === link.trgNodeId);
			});
			return index === -1;
		});

	default:
		return state;
	}
};

const canvasinfo = (state = [], action) => {
	switch (action.type) {
	case "CLEAR_PIPELINE_FLOW":
		return null;

	// Convert incoming pipeline flow pipelines to be canvasInfo pipelines and
	// make sure node dimensions are calculated for all nodes in all current
	// pipelines.
	case "SET_PIPELINE_FLOW": {
		let canvasInfoPipelines = [];
		if (action.data.pipelines) {
			canvasInfoPipelines = action.data.pipelines.map((pFlowPipline) => {
				const pipeline = PipelineInHandler.convertPipelineToCanvasInfoPipeline(pFlowPipline);
				return Object.assign({}, pipeline, { nodes: nodes(pipeline.nodes, action) });
			});
		}
		return Object.assign({}, action.data, { pipelines: canvasInfoPipelines });
	}

	// Save incoming pipelines as our current (state) pipelines and make sure
	// node dimensions are calculated for all nodes in all current
	// pipelines. This will replace all pipelines with the incomming ones.
	case "SET_CANVAS_INFO": {
		const canvasInfoPipelines = action.data.pipelines.map((pipeline) => {
			return Object.assign({}, pipeline, { nodes: nodes(pipeline.nodes, action) });
		});
		return Object.assign({}, action.data, { pipelines: canvasInfoPipelines });
	}
	// Ensure node dimensions are calculated for all nodes in all current
	// pipelines when layout info is changed.
	case "SET_LAYOUT_INFO": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			return Object.assign({}, pipeline, { nodes: nodes(pipeline.nodes, action) });
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "ADD_NODE":
	case "ADD_AUTO_NODE":
	case "REPLACE_NODES":
	case "SET_NODE_PARAMETERS":
	case "SET_NODE_MESSAGE":
	case "SET_NODE_MESSAGES":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "SET_NODE_LABEL":
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECT":
	case "ADD_LINK":
	case "DELETE_LINK":
	case "DISCONNECT_NODES":
	case "ADD_COMMENT":
	case "EDIT_COMMENT":
	case "ADD_COMMENT_ATTR":
	case "REMOVE_COMMENT_ATTR": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	default:
		return state;
	}
};

const palette = (state = {}, action) => {
	switch (action.type) {
	case "CLEAR_PALETTE_DATA":
		return {};

	case "SET_PALETTE_DATA":
		return Object.assign({}, action.data);

	case "ADD_NODE_TYPE_TO_PALETTE": {
		return Object.assign({}, state, { categories: categories(state.categories, action) });
	}
	default:
		return state;
	}
};

const categories = (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPE_TO_PALETTE": {
		let category = state.find((cat) => {
			return (cat.category === action.data.category);
		});

		if (category) {
			return state.map((cat, index) => {
				if (action.data.category === cat.category) {
					return Object.assign({}, cat, { nodetypes: nodetypes(cat.nodetypes, action) });
				}
				return cat;
			});
		}

		category = {
			"category": action.data.category,
			"label": action.data.categoryLabel ? action.data.categoryLabel : action.data.category,
			"nodetypes": []
		};

		return [
			...state,
			Object.assign({}, category, { nodetypes: nodetypes(category.nodetypes, action) })
		];
	}
	default:
		return state;
	}
};

const nodetypes = (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPE_TO_PALETTE":
		if (action.data.nodeType && action.data.nodeType.label &&
				action.data.nodeType.operator_id_ref && action.data.nodeType.image) {
			return [
				...state,
				action.data.nodeType
			];
		}
		return state;

	default:
		return state;
	}
};

const selections = (state = [], action) => {
	switch (action.type) {
	case "CLEAR_PIPELINE_FLOW":
		return [];

	case "SET_PIPELINE_FLOW": {
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only clear the selections if
		// we're given a completely new canvas.
		if (action.data && action.currentCanvasInfo &&
				action.data.id !== action.currentCanvasInfo.id) {
			return [];
		}
		return state;
	}

	case "CLEAR_SELECTIONS":
		return [];

	case "SET_SELECTIONS":
		return [...action.data];

	case "DELETE_OBJECT":
		return state.filter((objId) => {
			return action.data.id !== objId;
		});

	default:
		return state;
	}
};

const layoutinfo = (state = LayoutDimensions.getLayout(), action) => {
	switch (action.type) {
	case "SET_LAYOUT_INFO":
		return Object.assign({}, action.layoutinfo);

	default:
		return state;
	}
};

// Returns a copy of the node passed in with additional fields which contains
//  the height occupied by the input ports and output ports, based on the
// layout info passed in, as well as the node width.
const setNodeDimensions = (node, layoutInfo) => {
	const newNode = Object.assign({}, node);
	if (layoutInfo.connectionType === "ports") {
		newNode.inputPortsHeight = node.input_ports
			? (node.input_ports.length * (layoutInfo.portArcRadius * 2)) + ((node.input_ports.length - 1) * layoutInfo.portArcSpacing)
			: 0;

		newNode.outputPortsHeight = node.output_ports
			? (node.output_ports.length * (layoutInfo.portArcRadius * 2)) + ((node.output_ports.length - 1) * layoutInfo.portArcSpacing)
			: 0;

		newNode.height = Math.max(newNode.inputPortsHeight, newNode.outputPortsHeight, layoutInfo.defaultNodeHeight);
	} else { // 'halo' connection type
		newNode.inputPortsHeight = 0;
		newNode.outputPortsHeight = 0;
		newNode.height = layoutInfo.defaultNodeHeight;
	}
	newNode.width = layoutInfo.defaultNodeWidth;
	return newNode;
};

const notifications = (state = [], action) => {
	switch (action.type) {
	case "CLEAR_NOTIFICATION_MESSAGES":
		return [];

	case "SET_NOTIFICATION_MESSAGES":
		return [...action.data];

	default:
		return state;
	}
};

const getUUID = () => {
	return uuid4();
};


export default class ObjectModel {

	constructor() {
		// Put selections reducer first so selections are handled before
		// canvasinfo actions. Also, put layoutinfo reducer before canvasinfo
		// because node heights and width are calculated based on layoutinfo.
		var combinedReducer = combineReducers({ selections, layoutinfo, canvasinfo, palette, notifications });
		const initialState = {
			selections: [],
			layoutinfo: LayoutDimensions.getLayout(),
			canvasinfo: this.getEmptyCanvasInfo(),
			palette: {},
			notifications: []
		};
		this.store = createStore(combinedReducer, initialState);

		// Default value for fixed layout behavior
		this.fixedLayout = NONE;

		// TODO - Remove this gloabal  variable when WML Canvas supports pipelineFlow
		this.oldCanvas = null;

		// optional handler to generate the id of object model objects
		this.idGeneratorHandler = null;

		// optional callback for notification of selection changes
		this.selectionCallback = null;
	}

	// Standard methods

	// Only used for testing
	dispatch(action) {
		this.store.dispatch(action);
	}

	subscribe(callback) {
		return this.store.subscribe(callback);
	}

	setSchemaValidation(schemaValidation) {
		this.schemaValidation = schemaValidation;
	}

	// Palette methods

	clearPaletteData() {
		this.store.dispatch({ type: "CLEAR_PALETTE_DATA" });
	}

	// Deprecated  TODO - Remvove this method when WML Canvas migrates to setPipelineFlowPalette() method
	setPaletteData(paletteData) {
		var newPalData = CanvasInHandler.convertPaletteToPipelineFlowPalette(paletteData);
		this.store.dispatch({ type: "SET_PALETTE_DATA", data: newPalData });
	}

	setPipelineFlowPalette(paletteData) {
		if (!paletteData || isEmpty(paletteData)) {
			this.store.dispatch({ type: "SET_PALETTE_DATA", data: {} });
			return;
		}
		// TODO - this method is called by App.js test harness. Remove this check and
		// code when we remove the x-* example palette files after WML Canvas migrates to use v2.0 palette.
		if (CanvasInHandler.isVersion0Palette(paletteData)) {
			this.setPaletteData(paletteData);
			return;
		}

		const newPalData = this.validateAndUpgradePalette(paletteData);
		this.store.dispatch({ type: "SET_PALETTE_DATA", data: newPalData });
	}

	getPaletteData() {
		return this.store.getState().palette;
	}

	setNodeLabel(nodeId, newLabel) {
		this.store.dispatch({ type: "SET_NODE_LABEL", data: { nodeId: nodeId, label: newLabel }, pipelineId: this.getActivePipeline() });
	}

	setInputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_INPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.getActivePipeline() });
	}

	setOutputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.getActivePipeline() });
	}

	setIdGeneratorHandler(idGeneratorHandler) {
		this.idGeneratorHandler = idGeneratorHandler;
	}

	setSelectionChangeHandler(selectionChangeHandler) {
		this.selectionChangeHandler = selectionChangeHandler;
	}

	addNodeTypeToPalette(nodeTypeObj, category, categoryLabel) {
		const nodeTypePaletteData = {
			"nodeType": nodeTypeObj,
			"category": category,
		};
		if (categoryLabel) {
			nodeTypePaletteData.categoryLabel = categoryLabel;
		}

		this.store.dispatch({ type: "ADD_NODE_TYPE_TO_PALETTE", data: nodeTypePaletteData });
	}

	getPaletteNode(nodeOpIdRef) {
		let outNodeType = null;
		if (!isEmpty(this.getPaletteData())) {
			this.getPaletteData().categories.forEach((category) => {
				category.nodetypes.forEach((nodeType) => {
					if (nodeType.operator_id_ref === nodeOpIdRef) {
						outNodeType = nodeType;
					}
				});
			});
		}
		return outNodeType;
	}

	getCategoryForNode(nodeOpIdRef) {
		let result = null;
		this.getPaletteData().categories.forEach((category) => {
			category.nodetypes.forEach((nodeType) => {
				if (nodeType.operator_id_ref === nodeOpIdRef) {
					result = category;
				}
			});
		});
		return result;
	}

	// Canvas methods

	clearPipelineFlow() {
		this.clearSelection();
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_PIPELINE_FLOW" });
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	// TODO - Remember to also remove declaration of ObjectModel.oldCanvas from above
	setCanvas(canvas) {
		this.oldCanvas = canvas; // TODO - Remember to remvove the declaration of this global when WML Canvas UI supports pipleine flow.
		var canvasInfo = CanvasInHandler.convertCanvasToCanvasInfo(canvas);
		this.setCanvasInfo(canvasInfo);
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	getCanvas() {
		if (this.oldCanvas) {
			return CanvasOutHandler.getCanvasBasedOnCanvasInfo(this.oldCanvas, this.getCanvasInfo());
		}
		return {};
	}

	getEmptyCanvasInfo() {
		const newFlowId = getUUID();
		const newPipelineId = getUUID();

		return {
			"doc_type": "pipeline",
			"version": "2.0",
			"json_schema": "http://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v2-schema.json",
			"id": newFlowId,
			"primary_pipeline": newPipelineId,
			"pipelines": [
				{
					"id": newPipelineId,
					"runtime_ref": "empty_runtime",
					"nodes": [],
					"comments": [],
					"links": []
				}
			],
			"runtimes": [{ "id": "empty_runtime", "name": "empty_runtime" }],
			"schemas": []
		};
	}

	setEmptyPipelineFlow() {
		const emptyPipelineFlow = PipelineOutHandler.createPipelineFlow(this.getEmptyCanvasInfo());
		this.setPipelineFlow(emptyPipelineFlow);
	}

	setPipelineFlow(newPipelineFlow) {
		// TODO - Remove this if clause when we remove x-* test files.
		if (newPipelineFlow.objectData) { // Old canvas docs will have an 'objectData' field
			this.setCanvas(newPipelineFlow);
			return;
		}

		const pipelineFlow = this.validateAndUpgrade(newPipelineFlow);

		this.executeWithSelectionChange(this.store.dispatch, {
			type: "SET_PIPELINE_FLOW",
			data: pipelineFlow,
			layoutinfo: this.store.getState().layoutinfo,
			currentCanvasInfo: this.store.getState().canvasinfo });
	}

	getPrimaryPipelineId() {
		return this.getCanvasInfo().primary_pipeline;
	}

	validateAndUpgrade(newPipelineFlow) {
		// Clone the pipelineFlow to ensure we don't modify the incoming parameter.
		let pipelineFlow = JSON.parse(JSON.stringify(newPipelineFlow));

		const version = extractVersion(pipelineFlow);

		if (this.schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow, version);
		}

		if (version !== LATEST_VERSION) {
			pipelineFlow = upgradePipelineFlow(pipelineFlow);

			if (this.schemaValidation) {
				validatePipelineFlowAgainstSchema(pipelineFlow, LATEST_VERSION);
			}
		}
		return pipelineFlow;
	}

	validateAndUpgradePalette(newPalette) {
		// Clone the palette to ensure we don't modify the incoming parameter.
		let pal = JSON.parse(JSON.stringify(newPalette));

		const version = extractPaletteVersion(pal);

		if (this.schemaValidation) {
			validatePaletteAgainstSchema(pal, version);
		}

		if (version !== LATEST_PALETTE_VERSION) {
			pal = upgradePalette(pal);

			if (this.schemaValidation) {
				validatePaletteAgainstSchema(pal, LATEST_PALETTE_VERSION);
			}
		}
		return pal;
	}

	// Returns a pipeline flow based on the initial pipeline flow we were given
	// with the changes to canvasinfo made by the user. We don't do this in the
	// redux code because that would result is continuous update of the pipelineflow
	// as the consuming app makes getPipelineFlow() calls which are difficult to
	// handle when testing.
	getPipelineFlow() {
		const pipelineFlow =
			PipelineOutHandler.createPipelineFlow(this.getCanvasInfo());
		if (this.schemaValidation) {
			validatePipelineFlowAgainstSchema(pipelineFlow);
		}
		return pipelineFlow;
	}

	getCanvasInfo() {
		return this.store.getState().canvasinfo;
	}

	// Returns the pipeline for the id passed in or the primary pipeline if
	// no id is passed in.
	getCanvasInfoPipeline(pipelineId) {
		if (!this.getCanvasInfo()) {
			return null;
		}
		const pId = pipelineId || this.getPrimaryPipelineId();
		const pipelines = this.getCanvasInfo().pipelines;
		const p = pipelines.find((pipeline) => {
			return pipeline.id === pId;
		});
		return (typeof p === "undefined") ? null : p;
	}

	setActivePipeline(pipelineId) {
		this.activePipelineId = pipelineId;
	}

	getActivePipeline() {
		return this.activePipelineId ? this.activePipelineId : this.getPrimaryPipelineId();
	}

	setCanvasInfo(canvasInfo) {
		this.store.dispatch({ type: "SET_CANVAS_INFO", data: canvasInfo, layoutinfo: this.getLayout() });
	}

	isCanvasEmpty() {
		if ((this.getNodes() && this.getNodes().length > 0) ||
				(this.getComments() && this.getComments().length > 0)) {
			return false;
		}
		return true;
	}

	fixedAutoLayout(fixedLayoutDirection) {
		this.autoLayout(fixedLayoutDirection);
		this.fixedLayout = fixedLayoutDirection;
	}

	autoLayout(layoutDirection) {
		var canvasInfoPipeline = this.getCanvasInfoPipeline();
		var lookup = {};
		if (layoutDirection === VERTICAL) {
			lookup = this.dagreAutolayout(DAGRE_VERTICAL, canvasInfoPipeline);
		} else {
			lookup = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasInfoPipeline);
		}
		var newNodes = canvasInfoPipeline.nodes.map((node) => {
			return Object.assign({}, node, { x_pos: lookup[node.id].value.x, y_pos: lookup[node.id].value.y });
		});

		const canvasInfo = this.getCanvasInfo();

		const newCanvasInfoPipelines = canvasInfo.pipelines.map((ciPipeline) => {
			if (ciPipeline.id === canvasInfoPipeline.id) {
				return Object.assign({}, canvasInfoPipeline, { nodes: newNodes });
			}
			return ciPipeline;
		});

		const newCanvasInfo = {
			primary_pipeline: canvasInfo.primary_pipeline,
			pipelines: newCanvasInfoPipelines
		};

		this.setCanvasInfo(newCanvasInfo);
	}

	dagreAutolayout(direction, canvasData) {
		var nodeLinks = canvasData.links.filter((link) => {
			return link.type === "nodeLink" || link.type === "associationLink";
		});

		var edges = nodeLinks.map((link) => {
			return { "v": link.srcNodeId, "w": link.trgNodeId, "value": { "points": [] } };
		});

		var nodesData = canvasData.nodes.map((node) => {
			return { "v": node.id, "value": { } };
		});

		// possible values: TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
		// default TB for vertical layout
		// set to LR for horizontal layout
		var value = { };
		var directionList = ["TB", "BT", "LR", "RL"];
		if (directionList.indexOf(direction) >= 0) {
			value = { "rankDir": direction };
		}

		var inputGraph = { nodes: nodesData, edges: edges, value: value };

		var maxNodeSizes = this.getMaximumNodeSizes();

		const initialMarginX = this.store.getState().layoutinfo.autoLayoutInitialMarginX;
		const initialMarginY = this.store.getState().layoutinfo.autoLayoutInitialMarginY;
		const verticalSpacing = this.store.getState().layoutinfo.autoLayoutVerticalSpacing;
		const horizontalSpacing = this.store.getState().layoutinfo.autoLayoutHorizontalSpacing;

		var g = dagre.graphlib.json.read(inputGraph);
		g.graph().marginx = initialMarginX;
		g.graph().marginy = initialMarginY;
		if (direction === "TB") {
			g.graph().nodesep = maxNodeSizes.width + horizontalSpacing; // distance to separate the nodes horiziontally
			g.graph().ranksep = maxNodeSizes.height + verticalSpacing; // distance between each rank of nodes
		} else {
			g.graph().nodesep = maxNodeSizes.height + horizontalSpacing; // distance to separate the nodes horiziontally
			g.graph().ranksep = maxNodeSizes.width + verticalSpacing; // distance between each rank of nodes
		}
		dagre.layout(g);

		var outputGraph = dagre.graphlib.json.write(g);

		var lookup = { };
		for (var i = 0, len = outputGraph.nodes.length; i < len; i++) {
			lookup[outputGraph.nodes[i].v] = outputGraph.nodes[i];
		}
		return lookup;
	}

	getMaximumNodeSizes() {
		var maxWidth = this.store.getState().layoutinfo.defaultNodeWidth;
		var maxHeight = this.store.getState().layoutinfo.defaultNodeHeight;

		if (this.getCanvasInfo() &&
				this.getNodes()) {
			this.getNodes().forEach((node) => {
				maxWidth = Math.max(maxWidth, node.width);
				maxHeight = Math.max(maxHeight, node.height);
			});
		}

		return { width: maxWidth, height: maxHeight };
	}

	// Node AND comment methods

	moveObjects(data) {
		if (this.fixedLayout === NONE) {
			this.store.dispatch({ type: "MOVE_OBJECTS", data: data, pipelineId: this.getActivePipeline() });
		}
	}

	deleteObjects(source) {
		this.executeWithSelectionChange((src) => {
			src.selectedObjectIds.forEach((selId) => {
				this.store.dispatch({ type: "DELETE_OBJECT", data: { id: selId }, pipelineId: this.getActivePipeline() });
			});
			if (this.fixedLayout !== NONE) {
				this.autoLayout(this.fixedLayout);
			}
		}, source);
	}

	deleteObject(id) {
		this.executeWithSelectionChange(this.store.dispatch, { type: "DELETE_OBJECT", data: { id: id }, pipelineId: this.getActivePipeline() });
		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	disconnectNodes(source) {
		// We only disconnect links to data nodes (not links to comments).
		const selectedNodeIds = this.filterDataNodes(source.selectedObjectIds);
		const newSource = Object.assign({}, source, { selectedNodeIds: selectedNodeIds });

		this.store.dispatch({ type: "DISCONNECT_NODES", data: newSource, pipelineId: this.getActivePipeline() });
		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	// Node methods

	createNode(data) {
		const nodeTemplate = data.nodeTemplate;
		let node = {};
		if (nodeTemplate !== null) {
			node = Object.assign({}, nodeTemplate, {
				"id": this.getUniqueId(CREATE_NODE, { "nodeType": nodeTemplate }),
				"x_pos": data.offsetX,
				"y_pos": data.offsetY
			});

			// Add node height and width and, if appropriate, inputPortsHeight
			// and outputPortsHeight
			node = setNodeDimensions(node, this.store.getState().layoutinfo);
		}

		return node;
	}

	cloneNode(inNode) {
		let node = Object.assign({}, inNode, { id: this.getUniqueId(CLONE_NODE, { "node": inNode }) });

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = setNodeDimensions(node, this.store.getState().layoutinfo);
		return node;
	}

	// Returns a source node for auto completion or null if no source node can be
	// detected. The source node is either:
	// 1. The selected node, if only *one* node is currently selected or
	// 2. The most recently added node, provided it has one or more output ports or
	// 3. The most-recent-but-one added node, provided it has one or more output ports
	getAutoSourceNode() {
		var sourceNode = null;
		var selectedNodes = this.getSelectedNodes();

		if (selectedNodes.length === 1) {
			sourceNode = selectedNodes[0];
		} else {
			var nodesArray = this.getNodes();
			if (nodesArray.length > 0) {
				var lastNodeAdded = nodesArray[nodesArray.length - 1];
				if (lastNodeAdded.output_ports && lastNodeAdded.output_ports.length >= 0) {
					sourceNode = lastNodeAdded;
				} else if (nodesArray.length > 1) {
					var lastButOneNodeAdded = nodesArray[nodesArray.length - 2];
					if (lastButOneNodeAdded.output_ports && lastButOneNodeAdded.output_ports.length >= 0) {
						sourceNode = lastButOneNodeAdded;
					}
				}
			}
		}
		return sourceNode;
	}

	// Returns a newly created 'auto node' whose position is based on the
	// source node (if one is provided) and the the other nodes on the canvas.
	createAutoNode(data, sourceNode) {
		const initialMarginX = this.store.getState().layoutinfo.autoLayoutInitialMarginX;
		const initialMarginY = this.store.getState().layoutinfo.autoLayoutInitialMarginY;
		const horizontalSpacing = this.store.getState().layoutinfo.autoLayoutHorizontalSpacing;
		const verticalSpacing = this.store.getState().layoutinfo.autoLayoutVerticalSpacing;

		var x = 0;
		var y = 0;

		if (sourceNode === null) {
			x = initialMarginX;
			y = initialMarginY;
		} else {
			x = sourceNode.x_pos + sourceNode.width + horizontalSpacing;
			y = sourceNode.y_pos;
		}

		data.offsetX = x;
		data.offsetY = y;

		const newNode = this.createNode(data);

		if (this.getNodes().length > 0) {
			if (this.isEntryBindingNode(newNode)) {
				newNode.x_pos = initialMarginX;
				newNode.y_pos += newNode.height + verticalSpacing;
			}
		}

		var newNodeOverLapping = true;

		while (newNodeOverLapping) {
			newNodeOverLapping = this.isNodeOverlappingOthers(newNode);
			if (newNodeOverLapping) {
				newNode.y_pos += newNode.height + verticalSpacing;
			}
		}

		return newNode;
	}

	cloneNodes() {
		return this.getNodes().map(function(node) {
			return Object.assign({}, node);
		});
	}

	replaceNodes(replacementNodes) {
		this.store.dispatch({ type: "REPLACE_NODES", data: replacementNodes, pipelineId: this.getActivePipeline() });
	}

	// Returns true if a new link needs to be created with the newly created
	// auto node. A link is required when there IS a source node and the source
	// and target nodes each have a single port and the cardinality is not
	// exceeded for the ports.
	isLinkNeededWithAutoNode(newNode, srcNode) {
		let isLinkNeededWithAutoNode = false;

		if (newNode &&
				srcNode &&
				newNode.input_ports &&
				srcNode.output_ports &&
				newNode.input_ports.length === 1 &&
				srcNode.output_ports.length === 1 &&
				!this.isCardinalityExceeded(srcNode.output_ports[0].id, newNode.input_ports[0].id, srcNode, newNode)) {
			isLinkNeededWithAutoNode = true;
		}

		return isLinkNeededWithAutoNode;
	}

	isEntryBindingNode(node) {
		if (node.input_ports && node.input_ports.length > 0) {
			return false;
		}
		return true;
	}

	isNodeOverlappingOthers(node) {
		var index = this.getNodes().findIndex((arrayNode) => {
			return this.isSourceOverlappingTarget(arrayNode, node);
		});

		if (index === -1) {
			return false;
		}

		return true;
	}

	// Returns a position for a new comment added by clicking the 'add comment'
	// button on the toolbar. It searches for a position that is not already
	// occupied by an existing comment.
	getNewCommentPosition(svgPos) {
		const pos = { x_pos: svgPos.x_pos, y_pos: svgPos.y_pos };

		while (this.exactlyOverlaps(null, [pos])) {
			pos.x_pos += 10;
			pos.y_pos += 10;
		}

		return pos;
	}

	// Returns true if any of the node or comment definitions passed in exactly
	// overlap any of the existing nodes and comments. This is used by the
	// paste-from-clipboard code to detect if nodes and comments being pasted
	// overlap existing nodes and comments.
	exactlyOverlaps(nodeDefs, commentDefs) {
		var overlaps = false;

		if (nodeDefs && nodeDefs.length > 0) {
			const index = nodeDefs.findIndex((nodeDef) => {
				return this.exactlyOverlapsNodes(nodeDef);
			});
			if (index > -1) {
				overlaps = true;
			}
		}
		if (overlaps === false && commentDefs && commentDefs.length > 0) {
			const index = commentDefs.findIndex((commentDef) => {
				return this.exactlyOverlapsComments(commentDef);
			});
			if (index > -1) {
				overlaps = true;
			}
		}

		return overlaps;
	}

	// Return true if the new node definition passed in exactly overlaps any
	// of the existing nodes.
	exactlyOverlapsNodes(nodeDef) {
		var overlap = false;
		this.getNodes().forEach((canvasNode) => {
			if (canvasNode.x_pos === nodeDef.x_pos &&
					canvasNode.y_pos === nodeDef.y_pos) {
				overlap = true;
			}
		});
		return overlap;
	}

	// Return true if the new comment definition passed in exactly overlaps any
	// of the existing comments.
	exactlyOverlapsComments(comment) {
		var overlap = false;
		this.getComments().forEach((canvasComment) => {
			if (canvasComment.x_pos === comment.x_pos &&
					canvasComment.y_pos === comment.y_pos) {
				overlap = true;
			}
		});
		return overlap;
	}

	// Returns true if the node ID passed in exists in the array of nodes
	// passed in.
	isNodeIdInNodes(nodeId, inNodes) {
		if (inNodes) {
			return inNodes.findIndex((node) => {
				return node.id === nodeId;
			}) > -1;
		}
		return false;
	}

	addNode(newNode) {
		this.store.dispatch({ type: "ADD_NODE", data: { newNode: newNode }, pipelineId: this.getActivePipeline() });

		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	addAutoNodeAndLink(newNode, newLink) {
		this.store.dispatch({ type: "ADD_AUTO_NODE", data: {
			newNode: newNode,
			newLink: newLink },
		pipelineId: this.getActivePipeline() });
	}

	deleteNode(id) {
		this.deleteObject(id);
	}

	getNodes() {
		return this.getCanvasInfoPipeline().nodes;
	}

	getNodeParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.parameters : null);
	}

	getNodeMessages(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.messages : null);
	}

	getNodeMessage(nodeId, controlName) {
		var messages = this.getNodeMessages(nodeId);
		if (messages) {
			for (const message of messages) {
				if (message.id_ref === controlName) {
					return message;
				}
			}
		}
		return null;
	}

	hasErrorMessage(nodeId) {
		const messages = this.getNodeMessages(nodeId);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "error";
			}) !== "undefined");
		}
		return false;
	}

	hasWarningMessage(nodeId) {
		const messages = this.getNodeMessages(nodeId);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "warning";
			}) !== "undefined");
		}
		return false;
	}

	setNodeMessage(nodeId, message) {
		this.store.dispatch({ type: "SET_NODE_MESSAGE", data: { nodeId: nodeId, message: message }, pipelineId: this.getActivePipeline() });
	}

	setNodeMessages(nodeId, messages) {
		this.store.dispatch({ type: "SET_NODE_MESSAGES", data: { nodeId: nodeId, messages: messages }, pipelineId: this.getActivePipeline() });
	}

	setNodeParameters(nodeId, parameters) {
		this.store.dispatch({ type: "SET_NODE_PARAMETERS", data: { nodeId: nodeId, parameters: parameters }, pipelineId: this.getActivePipeline() });
	}

	addCustomAttrToNodes(objIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_NODE_ATTR", data: { objIds: objIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.getActivePipeline() });
	}

	removeCustomAttrFromNodes(objIds, attrName, attrValue) {
		this.store.dispatch({ type: "REMOVE_NODE_ATTR", data: { objIds: objIds, attrName: attrName }, pipelineId: this.getActivePipeline() });
	}

	canNodeBeDroppedOnLink(nodeType) {
		if (nodeType.input_ports && nodeType.input_ports.length > 0 &&
				nodeType.output_ports && nodeType.output_ports.length > 0) {
			return true;
		}
		return false;
	}

	// Comment methods

	createComment(source) {
		const info = {
			id: this.getUniqueId(CREATE_COMMENT),
			class_name: "d3-comment-rect",
			content: "",
			height: 42,
			width: 175,
			x_pos: source.mousePos.x,
			y_pos: source.mousePos.y,
			linkIds: [],
			selectedObjectIds: []
		};
		source.selectedObjectIds.forEach((objId) => {
			if (this.isDataNode(objId)) { // Only add links to data nodes, not comments
				info.selectedObjectIds.push(objId);
				info.linkIds.push(this.getUniqueId(CREATE_COMMENT_LINK, { "comment": info, "targetNode": this.getNode(objId) }));
			}
		});
		return info;
	}

	cloneComment(inComment) {
		return Object.assign({}, inComment, { id: this.getUniqueId(CLONE_COMMENT, { "comment": inComment }) });
	}

	addComment(data) {
		if (typeof data.selectedObjectIds === "undefined") {
			data.selectedObjectIds = [];
		}
		this.store.dispatch({ type: "ADD_COMMENT", data: data, pipelineId: this.getActivePipeline() });
		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	deleteComment(id) {
		this.deleteObject(id);
	}

	getComments() {
		return this.getCanvasInfoPipeline().comments;
	}

	editComment(data) {
		this.store.dispatch({ type: "EDIT_COMMENT", data: data, pipelineId: this.getActivePipeline() });
	}

	// use updateComment when you have the comment structure from the state object.
	// this method will format the input to be compatable with editComment interface.
	updateComment(data) {
		data.editType = "editComment";
		data.nodes = [data.id];
		data.offsetX = data.x_pos;
		data.offsetY = data.y_pos;
		data.label = data.content;
		this.editComment(data);
	}

	addCustomAttrToComments(objIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.getActivePipeline() });
	}

	removeCustomAttrFromComments(objIds, attrName) {
		this.store.dispatch({ type: "REMOVE_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName }, pipelineId: this.getActivePipeline() });
	}

	// Link methods

	createLink(newNode, srcNode) {
		const linkId = this.getUniqueId(CREATE_NODE_LINK, { "sourceNode": srcNode, "targetNode": newNode });
		let newLink = {
			id: linkId,
			class_name: "d3-data-link",
			srcNodeId: srcNode.id,
			trgNodeId: newNode.id,
			type: "nodeLink"
		};

		if (srcNode.output_ports && srcNode.output_ports.length > 0) {
			newLink = Object.assign(newLink, { "srcNodePortId": srcNode.output_ports[0].id });
		}
		if (newNode.input_ports && newNode.input_ports.length > 0) {
			newLink = Object.assign(newLink, { "trgNodePortId": newNode.input_ports[0].id });
		}

		return newLink;
	}

	deleteLink(link) {
		this.store.dispatch({ type: "DELETE_LINK", data: link, pipelineId: this.getActivePipeline() });
		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	createNodeLinks(data) {
		const linkNodeList = [];
		data.nodes.forEach((srcInfo) => {
			data.targetNodes.forEach((trgInfo) => {
				const link = this.createNodeLink(srcInfo, trgInfo);
				if (link) {
					linkNodeList.push(link);
				}
			});
		});
		return linkNodeList;
	}

	createNodeLink(srcInfo, trgInfo) {
		if (this.isConnectionAllowed(srcInfo, trgInfo)) {
			const link = {};
			link.id = this.getUniqueId(CREATE_NODE_LINK, { "sourceNode": this.getNode(srcInfo.id), "targetNode": this.getNode(trgInfo.id) });
			link.type = "nodeLink";
			link.class_name = "d3-data-link";
			link.srcNodeId = srcInfo.id;
			link.srcNodePortId = srcInfo.portId;
			link.trgNodeId = trgInfo.id;
			link.trgNodePortId = trgInfo.portId;
			return link;
		}
		return null;
	}

	cloneNodeLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.getUniqueId(CLONE_NODE_LINK, { "link": link, "sourceNodeId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			srcNodePortId: link.srcNodePortId,
			trgNodeId: trgNodeId,
			trgNodePortId: link.trgNodePortId
		};
	}

	addLinks(linkList) {
		linkList.forEach((link) => {
			this.store.dispatch({ type: "ADD_LINK", data: link, pipelineId: this.getActivePipeline() });
		});

		if (this.fixedLayout !== NONE) {
			this.autoLayout(this.fixedLayout);
		}
	}

	createCommentLinks(data) {
		const linkCommentList = [];
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				if (!this.commentLinkAlreadyExists(srcNodeId, trgNodeId)) {
					const info = {};
					info.id = this.getUniqueId(CREATE_COMMENT_LINK, { "comment": this.getComment(srcNodeId), "targetNode": this.getNode(trgNodeId) });
					info.type = "commentLink";
					info.class_name = "d3-comment-link";
					info.srcNodeId = srcNodeId;
					info.trgNodeId = trgNodeId;
					linkCommentList.push(info);
				}
			});
		});
		return linkCommentList;
	}

	cloneCommentLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.getUniqueId(CLONE_COMMENT_LINK, { "link": link, "commentId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			trgNodeId: trgNodeId
		};
	}

	getLinks() {
		return this.getCanvasInfoPipeline().links;
	}

	// Returns an array of links from canvas info links which link
	// any of the nodes or comments passed in.
	getLinksBetween(inNodes, inComments) {
		const linksList = this.getLinks();
		const filteredLinks = linksList.filter((link) => {
			// All links must point to a node so look for target node first
			if (this.isNodeIdInNodes(link.trgNodeId, inNodes)) {
				// Next look for any node or comment as the source object.
				if (this.isNodeIdInNodes(link.srcNodeId, inNodes) ||
						this.isCommentIdInComments(link.srcNodeId, inComments)) {
					return true;
				}
			}
			return false;
		});
		return filteredLinks;
	}

	getLinksContainingId(id) {
		const linksList = this.getLinks();
		const linksContaining = linksList.filter((link) => {
			return (link.srcNodeId === id || link.trgNodeId === id);
		});
		const returnLinks = linksContaining.map((link) => {
			var newLink = {};
			newLink.id = link.id;
			newLink.type = link.type;
			newLink.srcNodeId = link.srcNodeId;
			newLink.trgNodeId = link.trgNodeId;
			newLink.class_name = link.class_name;
			if (link.type === "nodeLink") {
				newLink.srcNodePortId = link.srcNodePortId;
				newLink.trgNodePortId = link.trgNodePortId;
			}
			return newLink;
		});
		return returnLinks;
	}

	// Returns true if the comment ID passed in exists in the array of comments
	// passed in.
	isCommentIdInComments(commentId, inComments) {
		if (inComments) {
			return inComments.findIndex((comment) => {
				return comment.id === commentId;
			}) > -1;
		}
		return false;
	}

	// Utility functions

	getNode(nodeId) {
		const diagramNodes = this.getNodes();
		return diagramNodes.find((node) => {
			return (node.id === nodeId);
		});
	}

	getComment(commentId) {
		const diagramComments = this.getComments();
		return diagramComments.find((comment) => {
			return (comment.id === commentId);
		});
	}

	getLink(linkId) {
		const diagramLinks = this.getLinks();
		return diagramLinks.find((link) => {
			return (link.id === linkId);
		});
	}

	isDataNode(objId) {
		const node = this.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	isConnectionAllowed(srcNodeInfo, trgNodeInfo) {
		const srcNode = this.getNode(srcNodeInfo.id);
		const trgNode = this.getNode(trgNodeInfo.id);


		if (!srcNode || !trgNode) { // Source ot target are not valid.
			return false;
		}

		if (srcNodeInfo.id === trgNodeInfo.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		if (!this.doesNodeHavePorts(trgNode)) {
			return false;
		}

		if (this.linkAlreadyExists(srcNodeInfo, trgNodeInfo)) {
			return false;
		}

		if (this.isCardinalityExceeded(srcNodeInfo.portId, trgNodeInfo.portId, srcNode, trgNode)) {
			return false;
		}

		return true;
	}

	doesNodeHavePorts(node) {
		return node.input_ports && node.input_ports.length > 0;
	}

	linkAlreadyExists(srcNodeInfo, trgNodeInfo) {
		let exists = false;

		const diagramLinks = this.getLinks();

		diagramLinks.forEach((link) => {
			if (link.srcNodeId === srcNodeInfo.id &&
					(!link.srcNodePortId || link.srcNodePortId === srcNodeInfo.portId) &&
					link.trgNodeId === trgNodeInfo.id &&
					(!link.trgNodePortId || link.trgNodePortId === trgNodeInfo.portId)) {
				exists = true;
			}
		});
		return exists;
	}

	commentLinkAlreadyExists(srcNodeId, trgNodeId) {
		let exists = false;

		const diagramLinks = this.getLinks();

		diagramLinks.forEach((link) => {
			if (link.srcNodeId === srcNodeId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	isCardinalityExceeded(srcPortId, trgPortId, srcNode, trgNode) {
		const diagramLinks = this.getLinks();

		var srcCount = 0;
		var trgCount = 0;

		diagramLinks.forEach((link) => {
			if (link.type === "nodeLink") {
				if (link.srcNodeId === srcNode.id && srcPortId) {
					if (link.srcNodePortId === srcPortId ||
							(!link.srcNodePortId && this.isFirstPort(srcNode.output_ports, srcPortId))) {
						srcCount++;
					}
				}

				if (link.trgNodeId === trgNode.id && trgPortId) {
					if (link.trgNodePortId === trgPortId ||
							(!link.trgNodePortId && this.isFirstPort(trgNode.input_ports, trgPortId))) {
						trgCount++;
					}
				}
			}
		});

		if (srcCount > 0) {
			const srcPort = this.getPort(srcNode.output_ports, srcPortId);
			if (srcPort &&
					srcPort.cardinality &&
					Number(srcPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					srcCount >= Number(srcPort.cardinality.max)) {
				return true;
			}
		}

		if (trgCount > 0) {
			const trgPort = this.getPort(trgNode.input_ports, trgPortId);
			if (trgPort &&
					trgPort.cardinality &&
					Number(trgPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					trgCount >= Number(trgPort.cardinality.max)) {
				return true;
			}
		}

		return false;
	}

	isFirstPort(portArray, portId) {
		const index = portArray.findIndex((port) => {
			return port.id === portId;
		});

		if (index === 0) {
			return true;
		}
		return false;
	}

	getPort(portArray, portId) {
		const index = portArray.findIndex((port) => {
			return port.id === portId;
		});

		if (index > -1) {
			return portArray[index];
		}
		return null;
	}

	isFlowValid(includeMsgTypes) {
		let validFlow = true;
		const flowNodes = this.getNodes();
		for (const node of flowNodes) {
			if (validFlow) {
				validFlow = this.isNodeValid(node, includeMsgTypes);
			}
		}
		return validFlow;
	}

	isNodeValid(node, includeMsgTypes) {
		let validNode = true;
		if (includeMsgTypes && Array.isArray(includeMsgTypes) && includeMsgTypes.length > 0) {
			for (const msg of node.messages) {
				if (indexOf(includeMsgTypes, msg.type) !== -1) {
					validNode = false;
				}
			}
		} else if (node.messages && node.messages.length > 0) {
			validNode = false;
		}
		return validNode;
	}

	getFlowMessages() {
		const flowNodes = this.getNodes();
		const nodeMsgs = {};
		flowNodes.forEach((node) => {
			if (node.messages && node.messages.length > 0) {
				nodeMsgs[node.id] = node.messages;
			}
		});
		return nodeMsgs;
	}

	// Methods to handle selections

	clearSelection() {
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_SELECTIONS" });
	}

	getSelectedObjectIds() {
		return this.store.getState().selections;
	}

	setSelections(newSelections) {
		this.executeWithSelectionChange(this.store.dispatch, { type: "SET_SELECTIONS", data: newSelections });
	}

	deleteSelectedObjects() {
		this.deleteObjects({ "selectedObjectIds": this.getSelectedObjectIds() });
	}

	getAllObjectIds() {
		var objIds = [];
		this.getNodes().forEach((node) => {
			objIds.push(node.id);
		});

		this.getComments().forEach((comment) => {
			objIds.push(comment.id);
		});

		return objIds;
	}

	selectAll() {
		const selected = [];
		for (const node of this.getNodes()) {
			selected.push(node.id);
		}
		for (const comment of this.getComments()) {
			selected.push(comment.id);
		}
		this.setSelections(selected);
	}

	isSelected(objectId) {
		return this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	// Either sets the target object as selected and removes any other
	// selections or leaves as selected if this object is already selected.
	ensureSelected(objectId) {
		let alreadySelected = this.getSelectedObjectIds();

		// If the operation is about to be done to a non-selected object,
		// make it the only selected object.
		if (alreadySelected.indexOf(objectId) < 0) {
			alreadySelected = [objectId];
		}
		this.setSelections(alreadySelected);

		return this.getSelectedObjectIds();
	}

	toggleSelection(objectId, toggleSelection) {
		let toggleSelections = [objectId];

		if (toggleSelection) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId)) {
				toggleSelections = this.getSelectedObjectIds().slice();
				const index = toggleSelections.indexOf(objectId);
				toggleSelections.splice(index, 1);
			}	else {
				toggleSelections = this.getSelectedObjectIds().concat(objectId);
			}
		}
		this.setSelections(toggleSelections);

		return this.getSelectedObjectIds();
	}

	selectInRegion(minX, minY, maxX, maxY) {
		var regionSelections = [];
		for (const node of this.getNodes()) {
			if (minX < node.x_pos + node.width &&
					maxX > node.x_pos &&
					minY < node.y_pos + node.height &&
					maxY > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of this.getComments()) {
			if (minX < comment.x_pos + comment.width &&
					maxX > comment.x_pos &&
					minY < comment.y_pos + comment.height &&
					maxY > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		this.setSelections(regionSelections);
	}

	findNodesInSubGraph(startNodeId, endNodeId, selection) {
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			const diagramLinks = this.getLinks();
			for (const link of diagramLinks) {
				if (link.srcNodeId === startNodeId) {
					const newRetval = this.findNodesInSubGraph(link.trgNodeId, endNodeId, selection);
					if (newRetval !== true) {
						selection.pop();
					}
					// this handles the case where there are multiple outward paths.
					// some of the outward paths coule be true and some false
					// this will make sure that the node is in the selection list of one of the paths
					// contains the end nodeId.
					retval = retval || newRetval;
				}
			}
		}

		return retval;
	}

	selectSubGraph(endNodeId) {
		const selection = [];
		const currentSelectedObjects = this.getSelectedObjectIds();

		// get all the nodes in the path from a currently selected object to the end node
		let foundPath = false;
		for (const startNodeId of currentSelectedObjects) {
			foundPath = foundPath || this.findNodesInSubGraph(startNodeId, endNodeId, selection);
		}
		if (!foundPath) {
			// if no subgraph found which is also the case if current selection was empty, just select endNode
			selection.push(endNodeId);
		}

		// do not put multiple copies of a nodeId in selected nodeId list.
		const selectedObjectIds = this.getSelectedObjectIds().slice();
		for (const selected of selection) {
			if (!this.isSelected(selected)) {
				selectedObjectIds.push(selected);
			}
		}

		this.setSelections(selectedObjectIds);

		return this.getSelectedObjectIds();
	}

	// Returns an offset object containing the x and y distances into negative
	// coordinate space that that the action would encroach. For the
	// 'moveObjects' action this is the distance the selected objects would encroach
	// into negative space. For other actions is is simply the offset amounts
	// passed in, provided either one is negative.
	getOffsetIntoNegativeSpace(action, offsetX, offsetY) {
		var selObjs = this.getSelectedNodesAndComments();
		var highlightGap = this.store.getState().layoutinfo.highlightGap;

		var offset = { "x": 0, "y": 0 };

		if (action === "moveObjects") {
			selObjs.forEach((obj) => {
				offset.x = Math.min(offset.x, obj.x_pos + offsetX - highlightGap);
				offset.y = Math.min(offset.y, obj.y_pos + offsetY - highlightGap);
			});

			var noneSelObjs = this.getNoneSelectedNodesAndComments();
			noneSelObjs.forEach((obj) => {
				offset.x = Math.min(offset.x, obj.x_pos - highlightGap);
				offset.y = Math.min(offset.y, obj.y_pos - highlightGap);
			});
		} else {
			offset = { "x": Math.min(0, offsetX), "y": Math.min(0, offsetY) };

			var objs = this.getNodesAndComments();
			objs.forEach((obj) => {
				offset.x = Math.min(offset.x, obj.x_pos - highlightGap);
				offset.y = Math.min(offset.y, obj.y_pos - highlightGap);
			});
		}

		return offset;
	}

	getSelectedNodesAndComments() {
		var objs = this.getSelectedNodes();
		return objs.concat(this.getSelectedComments());
	}

	getSelectedNodes() {
		var objs = [];
		this.getNodes().forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		return objs;
	}

	getSelectedComments() {
		var objs = [];
		this.getComments().forEach((comment) => {
			if (this.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});

		return objs;
	}

	getNoneSelectedNodesAndComments() {
		var objs = [];
		this.getNodes().forEach((node) => {
			if (!this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		this.getComments().forEach((comment) => {
			if (!this.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});
		return objs;
	}

	getNodesAndComments() {
		var objs = [];
		this.getNodes().forEach((node) => {
			objs.push(node);
		});

		this.getComments().forEach((comment) => {
			objs.push(comment);
		});
		return objs;
	}

	isSourceOverlappingTarget(srcNode, trgNode) {
		var highlightGap = this.store.getState().layoutinfo.highlightGap;
		if (((srcNode.x_pos + srcNode.width + highlightGap >= trgNode.x_pos - highlightGap &&
					trgNode.x_pos + trgNode.width + highlightGap >= srcNode.x_pos - highlightGap) &&
					(srcNode.y_pos + srcNode.height + highlightGap >= trgNode.y_pos - highlightGap &&
						trgNode.y_pos + trgNode.height + highlightGap >= srcNode.y_pos - highlightGap))) {
			return true;
		}

		return false;
	}

	// Methods to handle Layout info.

	setLayoutType(type) {
		this.store.dispatch({ type: "SET_LAYOUT_INFO", layoutinfo: LayoutDimensions.getLayout(type) });
	}

	getLayout() {
		return this.store.getState().layoutinfo;
	}

	getUniqueId(action, data) {
		let uniqueId;
		if (this.idGeneratorHandler) {
			uniqueId = this.idGeneratorHandler(action, data);
		}
		// generate v4 uuid if no custom id was generated
		return uniqueId ? uniqueId : getUUID();
	}

	executeWithSelectionChange(func, arg) {
		const previousSelection = {
			nodes: this.getSelectedNodes(),
			comments: this.getSelectedComments()
		};

		func(arg);

		if (this.selectionChangeHandler) {
			// determine delta in selected nodes and comments
			const selectedNodes = this.getSelectedNodes();
			const selectedComments = this.getSelectedComments();
			const newSelection = {
				selection: this.getSelectedObjectIds(),
				selectedNodes: selectedNodes,
				selectedComments: selectedComments,
				addedNodes: difference(selectedNodes, previousSelection.nodes),
				addedComments: difference(selectedComments, previousSelection.comments),
				deselectedNodes: difference(previousSelection.nodes, selectedNodes),
				deselectedComments: difference(previousSelection.comments, selectedComments)
			};

			// only trigger event if selection has changed
			if (!isEmpty(newSelection.addedNodes) ||
					!isEmpty(newSelection.addedComments) ||
					!isEmpty(newSelection.deselectedNodes) ||
					!isEmpty(newSelection.deselectedComments)) {
				this.selectionChangeHandler(newSelection);
			}
		}
	}

	clearNotificationMessages() {
		this.store.dispatch({ type: "CLEAR_NOTIFICATION_MESSAGES" });
	}

	setNotificationMessages(messages) {
		const newMessages = [];
		messages.forEach((message) => {
			const newMessageObj = Object.assign({}, message);
			if (newMessageObj.type === null || newMessageObj.type === "" || typeof newMessageObj.type === "undefined") {
				newMessageObj.type = "unspecified";
			}
			newMessages.push(newMessageObj);
		});
		this.store.dispatch({ type: "SET_NOTIFICATION_MESSAGES", data: newMessages });
	}

	getNotificationMessages(messageType) {
		const notificationMessages = this.store.getState().notifications;
		if (messageType) {
			return notificationMessages.filter((message) => {
				return message.type === messageType;
			});
		}
		return notificationMessages;
	}

}
