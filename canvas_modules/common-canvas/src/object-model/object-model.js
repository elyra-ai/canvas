/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { createStore, combineReducers } from "redux";
import uuid from "node-uuid";
import { NONE, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL } from "../../constants/common-constants.js";
import dagre from "dagre";
import LayoutDimensions from "./layout-dimensions.js";
import SVGCanvasInHandler from "../svg-canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import SVGCanvasOutHandler from "../svg-canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import SVGPipelineInHandler from "../svg-pipeline-in-handler.js";
import SVGPipelineOutHandler from "../svg-pipeline-out-handler.js";
import _ from "underscore";

/* eslint arrow-body-style: ["error", "always"] */
/* eslint complexity: ["error", 23] */

const nodes = (state = [], action) => {
	switch (action.type) {
	case "ADD_NODE":
	case "ADD_AUTO_NODE": {
		return [
			...state,
			action.data.newNode
		];
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
			return node.id !== action.data; // filter will return all objects NOT found
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
			return node.id !== action.data; // filter will return all objects NOT found
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
			return (link.srcNodeId !== action.data && // If node being deleted is either source or target of link remove this link
				link.trgNodeId !== action.data);
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
		var newAutoLink = {
			id: action.linkId,
			class_name: "d3-data-link",
			srcNodeId: action.data.srcNode.id,
			trgNodeId: action.data.newNode.id,
			type: "nodeLink"
		};

		if (action.data.srcNode.output_ports && action.data.srcNode.output_ports.length > 0) {
			newAutoLink = Object.assign(newAutoLink, { "srcNodePortId": action.data.srcNode.output_ports[0].id });
		}
		if (action.data.newNode.input_ports && action.data.newNode.input_ports.length > 0) {
			newAutoLink = Object.assign(newAutoLink, { "trgNodePortId": action.data.newNode.input_ports[0].id });
		}

		return [
			...state,
			newAutoLink
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

const canvasinfo = (state = getInitialCanvas(), action) => {
	switch (action.type) {
	case "CLEAR_PIPELINE_FLOW":
		return null;

	case "SET_PIPELINE_FLOW": {
		if (action.data.pipelines &&
				action.data.pipelines.length > 0) {
			const mainPipeline = getMainPipeline(action.data);
			if (mainPipeline) {
				var canvasInfo = SVGPipelineInHandler.convertPipelineToCanvasInfo(mainPipeline);
				canvasInfo.id = action.data.id;
				return Object.assign({}, canvasInfo, { nodes: nodes(canvasInfo.nodes, action) });
			}
		}
		return null;
	}

	case "SET_CANVAS_INFO":
		return Object.assign({}, action.data, { nodes: nodes(action.data.nodes, action) });

	case "ADD_NODE":
	case "SET_NODE_PARAMETERS":
	case "SET_NODE_MESSAGE":
	case "SET_NODE_MESSAGES":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "SET_LAYOUT_INFO":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action) });

	case "ADD_AUTO_NODE":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action), links: links(state.links, action) });

	case "MOVE_OBJECTS":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action), comments: comments(state.comments, action) });

	case "DELETE_OBJECT":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action), comments: comments(state.comments, action), links: links(state.links, action) });

	case "ADD_LINK":
	case "DELETE_LINK":
	case "DISCONNECT_NODES":
		return Object.assign({}, state, { links: links(state.links, action) });

	case "ADD_COMMENT":
		return Object.assign({}, state, { comments: comments(state.comments, action), links: links(state.links, action) });

	case "EDIT_COMMENT":
	case "ADD_COMMENT_ATTR":
	case "REMOVE_COMMENT_ATTR":
		return Object.assign({}, state, { comments: comments(state.comments, action) });

	default:
		return state;
	}
};

const pipelineflow = (state = getInitialPipelineFlow(), action) => {
	switch (action.type) {
	case "CLEAR_PIPELINE_FLOW":
		return null;

	case "SET_PIPELINE_FLOW":
		return Object.assign({}, action.data);

	default:
		return state;
	}
};

const palette = (state = {}, action) => {
	switch (action.type) {
	case "CLEAR_PALETTE_DATA":
		return null;

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
		if (action.data && store.getState().pipelineflow &&
				action.data.id !== store.getState().pipelineflow.id) {
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
			return action.data !== objId;
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

const getInitialCanvas = () => {
	const newPipelineUuid = getUUID();

	return { "id": newPipelineUuid, "nodes": [], "comments": [], "links": [] };
};

const getInitialPipelineFlow = (flowId, primaryPipelineId) => {

	var newFlowId = flowId;
	if (!flowId) {
		newFlowId = getUUID();
	}
	var newPrimaryPipelineId = primaryPipelineId;
	if (!primaryPipelineId) {
		newPrimaryPipelineId = getUUID();
	}

	return {
		"doc_type": "pipeline",
		"version": "1.0",
		"json_schema": "http://www.ibm.com/ibm/wdp/canvas/v1.0/pipeline-flow-v1-schema.json",
		"id": newFlowId,
		"primary_pipeline": newPrimaryPipelineId,
		"pipelines": [
			{
				"id": newPrimaryPipelineId,
				"nodes": []
			},
		],
		"schemas": []
	};
};

const getMainPipeline = (pipelineFlow) => {
	if (pipelineFlow.pipelines) {
		const mainPipeline = pipelineFlow.pipelines.find((p) => {
			return p.id === pipelineFlow.primary_pipeline;
		});
		return mainPipeline;
	}

	return null;
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

const getUUID = () => {
	return uuid.v4();
};

// Put 'selections' reducer first so slections are handled before canvas and pipeline flow actions
// Also put layoutinfo reducer before canvas info becuase node heights and width are calculated
// based on layoutinfo.
const combinedReducer = combineReducers({ selections, layoutinfo, canvasinfo, pipelineflow, palette });
const store = createStore(combinedReducer);

store.dispatch({ type: "CLEAR_CANVAS" });
store.dispatch({ type: "CLEAR_PALETTE_DATA" });
store.dispatch({ type: "SET_LAYOUT_INFO", layoutinfo: LayoutDimensions.getLayout() });

// TODO - Remove this gloabal  variable when WML Canvas supports pipelineFlow
var oldCanvas = null;

export default class ObjectModel {

// Standard methods

	static dispatch(action) {
		store.dispatch(action);
	}

	static subscribe(callback) {
		store.subscribe(callback);
	}

	// Palette methods

	static clearPaletteData() {
		store.dispatch({ type: "CLEAR_PALETTE_DATA" });
	}

	// Deprecated  TODO - Remvove this method when WML Canvas migrates to setPipelineFlowPalette() method
	static setPaletteData(paletteData) {
		var newPalData = SVGCanvasInHandler.convertPaletteToPipelineFlowPalette(paletteData);
		store.dispatch({ type: "SET_PALETTE_DATA", data: newPalData });
	}

	static setPipelineFlowPalette(paletteData) {
		store.dispatch({ type: "SET_PALETTE_DATA", data: paletteData });
	}

	static getPaletteData() {
		return store.getState().palette;
	}

	static addNodeTypeToPalette(nodeTypeObj, category, categoryLabel) {
		const nodeTypePaletteData = {
			"nodeType": nodeTypeObj,
			"category": category,
		};
		if (categoryLabel) {
			nodeTypePaletteData.categoryLabel = categoryLabel;
		}

		store.dispatch({ type: "ADD_NODE_TYPE_TO_PALETTE", data: nodeTypePaletteData });
	}

	static getPaletteNode(nodeOpIdRef) {
		let outNodeType = null;
		if (!_.isEmpty(ObjectModel.getPaletteData())) {
			ObjectModel.getPaletteData().categories.forEach((category) => {
				category.nodetypes.forEach((nodeType) => {
					if (nodeType.operator_id_ref === nodeOpIdRef) {
						outNodeType = nodeType;
					}
				});
			});
		}
		return outNodeType;
	}

	static getCategoryForNode(nodeOpIdRef) {
		let result = null;
		ObjectModel.getPaletteData().categories.forEach((category) => {
			category.nodetypes.forEach((nodeType) => {
				if (nodeType.operator_id_ref === nodeOpIdRef) {
					result = category;
				}
			});
		});
		return result;
	}

	// Canvas methods

	static clearPipelineFlow() {
		this.clearSelection();
		store.dispatch({ type: "CLEAR_PIPELINE_FLOW" });
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	// TODO - Remember to also remove declaration of ObjectModel.oldCanvas from above
	static setCanvas(canvas) {
		oldCanvas = canvas; // TODO - Remember to remvove the declaration of this global when WML Canvas UI supports pipleine flow.
		store.dispatch({ type: "SET_PIPELINE_FLOW", data: getInitialPipelineFlow(canvas.id, canvas.diagram.id), layoutinfo: store.getState().layoutinfo });
		var canvasInfo = SVGCanvasInHandler.convertCanvasToCanvasInfo(canvas);
		this.setCanvasInfo(canvasInfo);
	}

	// Deprectaed TODO - Remove this method when WML Canvas supports pipeline Flow
	static getCanvas() {
		if (oldCanvas) {
			return SVGCanvasOutHandler.getCanvasBasedOnCanvas(oldCanvas, store.getState().canvasinfo);
		}
		return {};
	}

	static setPipelineFlow(newPipelineFlow) {
		// TODO - Remove this if clause when we remove x-* test files.
		if (newPipelineFlow.objectData) { // Old canvas docs will have an 'objectData' field
			this.setCanvas(newPipelineFlow);
			return;
		}

		store.dispatch({ type: "SET_PIPELINE_FLOW", data: newPipelineFlow, layoutinfo: store.getState().layoutinfo });
	}

	static setEmptyPipelineFlow() {
		store.dispatch({ type: "SET_PIPELINE_FLOW", data: getInitialPipelineFlow("empty-pipeline-flow", "empty-pipeline"), layoutinfo: store.getState().layoutinfo });
	}

	// Returns a pipeline flow based on the initial pipeline flow we were given
	// with the changes to canvasinfo made by the user. We don't do this in the
	// redux code because that would result is continuous update of the pipelineflow
	// as the consuming app makes getPipelineFlow() calls which are difficult to
	// handle when teting.
	static getPipelineFlow() {
		return this.syncPipelineFlow(store.getState().pipelineflow, store.getState().canvasinfo);
	}

	// Returns a pipeline flow based on the initial pipeline flow we were given
	// with the changes to canvasinfo made by the user.
	static syncPipelineFlow(pipelineFlow, canvasInfo) {
		var pipeline = getMainPipeline(pipelineFlow);
		var newPipeline = SVGPipelineOutHandler.modifyPipelineWithCanvasInfo(pipeline, canvasInfo);

		if (newPipeline) {
			var newPipelines = pipelineFlow.pipelines.map((pline) => {
				if (pline.id === newPipeline.id) {
					return newPipeline;
				}
				return pline;
			});
			return Object.assign({}, pipelineFlow, { pipelines: newPipelines });
		}

		return null;
	}

	static getCanvasInfo() {
		return store.getState().canvasinfo;
	}

	static setCanvasInfo(canvasInfo) {
		store.dispatch({ type: "SET_CANVAS_INFO", data: canvasInfo, layoutinfo: this.getLayout() });
	}

	static isCanvasEmpty() {
		if ((this.getNodes() && this.getNodes().length > 0) ||
				(this.getComments() && this.getComments().length > 0)) {
			return false;
		}
		return true;
	}

	static fixedAutoLayout(fixedLayoutDirection) {
		this.autoLayout(fixedLayoutDirection);
		ObjectModel.fixedLayout = fixedLayoutDirection;
	}

	static autoLayout(layoutDirection) {
		var canvasData = this.getCanvasInfo();
		var lookup = {};
		if (layoutDirection === VERTICAL) {
			lookup = this.dagreAutolayout(DAGRE_VERTICAL, canvasData);
		} else {
			lookup = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasData);
		}
		var newNodes = canvasData.nodes.map((node) => {
			return Object.assign({}, node, { x_pos: lookup[node.id].value.x, y_pos: lookup[node.id].value.y });
		});

		var newCanvasData = Object.assign({}, canvasData, { nodes: newNodes });
		this.setCanvasInfo(newCanvasData);
	}

	static dagreAutolayout(direction, canvasData) {
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

		const initialMarginX = store.getState().layoutinfo.autoLayoutInitialMarginX;
		const initialMarginY = store.getState().layoutinfo.autoLayoutInitialMarginY;
		const verticalSpacing = store.getState().layoutinfo.autoLayoutVerticalSpacing;
		const horizontalSpacing = store.getState().layoutinfo.autoLayoutHorizontalSpacing;

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

	static getMaximumNodeSizes() {
		var maxWidth = store.getState().layoutinfo.defaultNodeWidth;
		var maxHeight = store.getState().layoutinfo.defaultNodeHeight;

		if (store.getState().canvasinfo &&
				store.getState().canvasinfo.nodes) {
			store.getState().canvasinfo.nodes.forEach((node) => {
				maxWidth = Math.max(maxWidth, node.width);
				maxHeight = Math.max(maxHeight, node.height);
			});
		}

		return { width: maxWidth, height: maxHeight };
	}

	// Node AND comment methods

	static moveObjects(data) {
		if (ObjectModel.fixedLayout === NONE) {
			store.dispatch({ type: "MOVE_OBJECTS", data: data });
		}
	}

	static deleteObjects(source) {
		source.selectedObjectIds.forEach((selId) => {
			this.deleteObject(selId);
		});
	}

	static deleteObject(id) {
		store.dispatch({ type: "DELETE_OBJECT", data: id });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static disconnectNodes(source) {
		// We only disconnect links to data nodes (not links to comments).
		const selectedNodeIds = this.filterDataNodes(source.selectedObjectIds);

		const newSource = Object.assign({}, source, { selectedNodeIds: selectedNodeIds });
		store.dispatch({ type: "DISCONNECT_NODES", data: newSource });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	// Node methods

	static createNode(data) {
		const nodeType = ObjectModel.getPaletteNode(data.operator_id_ref);
		let node = {};
		if (nodeType !== null) {
			node.id = getUUID();
			node.label = nodeType.label;
			node.type = nodeType.type;
			node.operator_id_ref = nodeType.operator_id_ref;
			node.image = nodeType.image;
			node.class_name = "d3-node-body";
			node.input_ports = nodeType.input_ports || [];
			node.output_ports = nodeType.output_ports || [];
			node.x_pos = data.offsetX;
			node.y_pos = data.offsetY;
		}

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = setNodeDimensions(node, store.getState().layoutinfo);
		return node;
	}

	static cloneNode(inNode) {
		let node = Object.assign({}, inNode, { id: getUUID() });

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = setNodeDimensions(node, store.getState().layoutinfo);
		return node;
	}

	// Returns a source node for auto completion or null if no source node can be
	// detected. The source node is either:
	// 1. The selected node, if only *one* node is currently selected or
	// 2. The most recently added node, provided it has one or more output ports or
	// 3. The most-recent-but-one added node, provided it has one or more output ports
	static getAutoSourceNode() {
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

	static getAutoPositionOfTarget(sourceNode) {
		var x = 0;
		var y = 0;

		const initialMarginX = store.getState().layoutinfo.autoLayoutInitialMarginX;
		const initialMarginY = store.getState().layoutinfo.autoLayoutInitialMarginY;
		const horizontalSpacing = store.getState().layoutinfo.autoLayoutHorizontalSpacing;

		if (sourceNode === null) {
			x = initialMarginX;
			y = initialMarginY;
		} else {
			x = sourceNode.x_pos + sourceNode.width + horizontalSpacing;
			y = sourceNode.y_pos;
		}
		return { x: x, y: y };
	}

	static createNodeAtPosition(data, trgPosition) {
		data.offsetX = trgPosition.x;
		data.offsetY = trgPosition.y;
		return this.createNode(data);
	}

	static addAutoNode(newNode, srcNode) {
		const initialMarginX = store.getState().layoutinfo.autoLayoutInitialMarginX;
		const verticalSpacing = store.getState().layoutinfo.autoLayoutVerticalSpacing;

		if ((this.getNodes()).length > 0) {
			var newSourceNode = this.isIntialBindingNode(newNode);
			if (newSourceNode) {
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

		if (srcNode === null) {
			store.dispatch({ type: "ADD_NODE", data: { newNode: newNode } });

		} else if ((newNode.input_ports).length === 1 && (srcNode.output_ports).length === 1) {
			var cardinalityExceeded = this.isCardinalityExceeded(srcNode.output_ports[0].id, newNode.input_ports[0].id, srcNode, newNode);

			if (cardinalityExceeded) {
				store.dispatch({ type: "ADD_NODE", data: { newNode: newNode } });
			} else {	// Node Link is created in this case only
				store.dispatch({ type: "ADD_AUTO_NODE", data: { newNode: newNode, srcNode: srcNode, linkId: getUUID() } });
			}

		} else {
			store.dispatch({ type: "ADD_NODE", data: { newNode: newNode } });
		}

	}

	static isIntialBindingNode(node) {
		if ((node.input_ports).length === 0) {
			return true;
		}
		return false;
	}

	static isNodeOverlappingOthers(node) {

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
	static getNewCommentPosition() {
		var pos = { x_pos: 50, y_pos: 50 };

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
	static exactlyOverlaps(nodeDefs, commentDefs) {
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
	static exactlyOverlapsNodes(nodeDef) {
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
	static exactlyOverlapsComments(comment) {
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
	static isNodeIdInNodes(nodeId, inNodes) {
		if (inNodes) {
			return inNodes.findIndex((node) => {
				return node.id === nodeId;
			}) > -1;
		}
		return false;
	}

	static addNode(newNode) {
		store.dispatch({ type: "ADD_NODE", data: { newNode: newNode } });

		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static deleteNode(id) {
		this.deleteObject(id);
	}

	static getNodes() {
		return this.getCanvasInfo().nodes;
	}

	static getNodeParameters(nodeId) {
		var node = this.getNode(nodeId);
		return node.parameters;
	}

	static getNodeMessages(nodeId) {
		var node = this.getNode(nodeId);
		return node.messages;
	}

	static getNodeMessage(nodeId, controlName) {
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

	static hasErrorMessage(nodeId) {
		const messages = this.getNodeMessages(nodeId);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "error";
			}) !== "undefined");
		}
		return false;
	}

	static hasWarningMessage(nodeId) {
		const messages = this.getNodeMessages(nodeId);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "warning";
			}) !== "undefined");
		}
		return false;
	}

	static setNodeMessage(nodeId, message) {
		store.dispatch({ type: "SET_NODE_MESSAGE", data: { nodeId: nodeId, message: message } });
	}

	static setNodeMessages(nodeId, messages) {
		store.dispatch({ type: "SET_NODE_MESSAGES", data: { nodeId: nodeId, messages: messages } });
	}

	static setNodeParameters(nodeId, parameters) {
		store.dispatch({ type: "SET_NODE_PARAMETERS", data: { nodeId: nodeId, parameters: parameters } });
	}

	static addCustomAttrToNodes(objIds, attrName) {
		store.dispatch({ type: "ADD_NODE_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	static removeCustomAttrFromNodes(objIds, attrName) {
		store.dispatch({ type: "REMOVE_NODE_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	// Comment methods

	static createComment(source) {
		const info = {
			id: getUUID(),
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
				info.linkIds.push(getUUID());
			}
		});
		return info;
	}

	static cloneComment(inComment) {
		return Object.assign({}, inComment, { id: getUUID() });
	}

	static addComment(info) {
		if (typeof info.selectedObjectIds === "undefined") {
			info.selectedObjectIds = [];
		}
		store.dispatch({ type: "ADD_COMMENT", data: info });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static deleteComment(id) {
		this.deleteObject(id);
	}

	static getComments() {
		return this.getCanvasInfo().comments;
	}

	static editComment(data) {
		store.dispatch({ type: "EDIT_COMMENT", data: data });
	}

	// use updateComment when you have the comment structure from the state object.
	// this method will format the input to be compatable with editComment interface.
	static updateComment(data) {
		data.editType = "editComment";
		data.nodes = [data.id];
		data.offsetX = data.x_pos;
		data.offsetY = data.y_pos;
		data.label = data.content;
		store.dispatch({ type: "EDIT_COMMENT", data: data });
	}

	static addCustomAttrToComments(objIds, attrName) {
		store.dispatch({ type: "ADD_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	static removeCustomAttrFromComments(objIds, attrName) {
		store.dispatch({ type: "REMOVE_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	// Link methods

	static deleteLink(source) {
		store.dispatch({ type: "DELETE_LINK", data: source });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static createNodeLinks(data) {
		const linkNodeList = [];
		data.nodes.forEach((srcInfo) => {
			data.targetNodes.forEach((trgInfo) => {
				if (ObjectModel.isConnectionAllowed(srcInfo, trgInfo)) {
					const info = {};
					info.id = getUUID();
					info.type = "nodeLink";
					info.class_name = "d3-data-link";
					info.srcNodeId = srcInfo.id;
					info.srcNodePortId = srcInfo.portId;
					info.trgNodeId = trgInfo.id;
					info.trgNodePortId = trgInfo.portId;
					linkNodeList.push(info);
				}
			});
		});
		return linkNodeList;
	}

	static cloneNodeLink(link, srcNodeId, trgNodeId) {
		return {
			id: getUUID(),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			srcNodePortId: link.srcNodePortId,
			trgNodeId: trgNodeId,
			trgNodePortId: link.trgNodePortId
		};
	}

	static addLinks(linkList) {
		linkList.forEach((link) => {
			store.dispatch({ type: "ADD_LINK", data: link });
		});

		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static createCommentLinks(data) {
		const linkCommentList = [];
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				if (!ObjectModel.commentLinkAlreadyExists(srcNodeId, trgNodeId)) {
					const info = {};
					info.id = getUUID();
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

	static cloneCommentLink(link, srcNodeId, trgNodeId) {
		return {
			id: getUUID(),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			trgNodeId: trgNodeId
		};
	}

	// Returns an array of links from canvas info links which link
	// any of the nodes or comments passed in.
	static getLinksBetween(inNodes, inComments) {
		const linksList = this.getCanvasInfo().links;
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

	static getLinksContainingId(id) {
		const linksList = this.getCanvasInfo().links;
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
	static isCommentIdInComments(commentId, inComments) {
		if (inComments) {
			return inComments.findIndex((comment) => {
				return comment.id === commentId;
			}) > -1;
		}
		return false;
	}

	// Utility functions

	static getNode(nodeId) {
		const diagramNodes = ObjectModel.getCanvasInfo().nodes;
		return diagramNodes.find((node) => {
			return (node.id === nodeId);
		});
	}

	static getComment(commentId) {
		const diagramComments = ObjectModel.getCanvasInfo().comments;
		return diagramComments.find((comment) => {
			return (comment.id === commentId);
		});
	}

	static getLink(linkId) {
		const diagramLinks = this.getCanvasInfo().links;
		return diagramLinks.find((link) => {
			return (link.id === linkId);
		});
	}

	static isDataNode(objId) {
		const node = ObjectModel.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	static filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	static isConnectionAllowed(srcNodeInfo, trgNodeInfo) {
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

	static doesNodeHavePorts(node) {
		return node.input_ports && node.input_ports.length > 0;
	}

	static linkAlreadyExists(srcNodeInfo, trgNodeInfo) {
		let exists = false;

		const diagramLinks = ObjectModel.getCanvasInfo().links;

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

	static commentLinkAlreadyExists(srcNodeId, trgNodeId) {
		let exists = false;

		const diagramLinks = ObjectModel.getCanvasInfo().links;

		diagramLinks.forEach((link) => {
			if (link.srcNodeId === srcNodeId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	static isCardinalityExceeded(srcPortId, trgPortId, srcNode, trgNode) {
		const diagramLinks = ObjectModel.getCanvasInfo().links;

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

	static isFirstPort(ports, portId) {
		const index = ports.findIndex((port) => {
			return port.id === portId;
		});

		if (index === 0) {
			return true;
		}
		return false;
	}

	static getPort(ports, portId) {
		const index = ports.findIndex((port) => {
			return port.id === portId;
		});

		if (index > -1) {
			return ports[index];
		}
		return null;
	}

	// Methods to handle selections

	static clearSelection() {
		store.dispatch({ type: "CLEAR_SELECTIONS" });
	}

	static getSelectedObjectIds() {
		return store.getState().selections;
	}

	static setSelections(newSelections) {
		store.dispatch({ type: "SET_SELECTIONS", data: newSelections });
	}

	static deleteSelectedObjects() {
		this.deleteObjects({ "selectedObjectIds": this.getSelectedObjectIds() });
	}

	static getAllObjectIds() {
		var objIds = [];
		this.getCanvasInfo().nodes.forEach((node) => {
			objIds.push(node.id);
		});

		this.getCanvasInfo().comments.forEach((comment) => {
			objIds.push(comment.id);
		});

		return objIds;
	}

	static selectAll() {
		const selected = [];
		for (const node of this.getNodes()) {
			selected.push(node.id);
		}
		for (const comment of this.getComments()) {
			selected.push(comment.id);
		}
		this.setSelections(selected);
	}

	static isSelected(objectId) {
		return this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	// Either sets the target object as selected and removes any other
	// selections or leaves as selected if this object is already selected.
	static ensureSelected(objectId) {
		let alreadySelected = this.getSelectedObjectIds();

		// If the operation is about to be done to a non-selected object,
		// make it the only selected object.
		if (alreadySelected.indexOf(objectId) < 0) {
			alreadySelected = [objectId];
		}
		this.setSelections(alreadySelected);

		return this.getSelectedObjectIds();
	}

	static toggleSelection(objectId, toggleSelection) {
		let toggleSelections = [objectId];

		if (toggleSelection) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId)) {
				toggleSelections = this.getSelectedObjectIds();
				const index = toggleSelections.indexOf(objectId);
				toggleSelections.splice(index, 1);
			}	else {
				toggleSelections = this.getSelectedObjectIds().concat(objectId);
			}
		}
		this.setSelections(toggleSelections);

		return this.getSelectedObjectIds();
	}

	static selectInRegion(minX, minY, maxX, maxY) {
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

	static findNodesInSubGraph(startNodeId, endNodeId, selection) {
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			const diagramLinks = ObjectModel.getCanvasInfo().links;
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

	static selectSubGraph(endNodeId) {
		var selection = [endNodeId];
		const currentSelectedObjects = this.getSelectedObjectIds();

		// get all the nodes in the path from a currently selected object to the end node
		for (const startNodeId of currentSelectedObjects) {
			this.findNodesInSubGraph(startNodeId, endNodeId, selection);
		}

		// do not put multiple copies of a nodeId in selected nodeId list.
		const selectedObjectIds = this.getSelectedObjectIds();
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
	static getOffsetIntoNegativeSpace(action, offsetX, offsetY) {
		var selObjs = this.getSelectedNodesAndComments();
		var highlightGap = store.getState().layoutinfo.highlightGap;

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

	static getSelectedNodesAndComments() {
		var objs = this.getSelectedNodes();
		return objs.concat(this.getSelectedComments());
	}

	static getSelectedNodes() {
		var objs = [];
		this.getCanvasInfo().nodes.forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		return objs;
	}

	static getSelectedComments() {
		var objs = [];
		this.getCanvasInfo().comments.forEach((comment) => {
			if (this.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});

		return objs;
	}

	static getNoneSelectedNodesAndComments() {
		var objs = [];
		this.getCanvasInfo().nodes.forEach((node) => {
			if (!this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		this.getCanvasInfo().comments.forEach((comment) => {
			if (!this.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});
		return objs;
	}

	static getNodesAndComments() {
		var objs = [];
		this.getCanvasInfo().nodes.forEach((node) => {
			objs.push(node);
		});

		this.getCanvasInfo().comments.forEach((comment) => {
			objs.push(comment);
		});
		return objs;
	}

	static isSourceOverlappingTarget(srcNode, trgNode) {
		var highlightGap = store.getState().layoutinfo.highlightGap;
		if (((srcNode.x_pos + srcNode.width + highlightGap >= trgNode.x_pos - highlightGap &&
					trgNode.x_pos + trgNode.width + highlightGap >= srcNode.x_pos - highlightGap) &&
					(srcNode.y_pos + srcNode.height + highlightGap >= trgNode.y_pos - highlightGap &&
						trgNode.y_pos + trgNode.height + highlightGap >= srcNode.y_pos - highlightGap))) {
			return true;
		}

		return false;
	}

	// Methods to handle Layout info.

	static setLayoutType(type) {
		store.dispatch({ type: "SET_LAYOUT_INFO", layoutinfo: LayoutDimensions.getLayout(type) });
	}

	static getLayout() {
		return store.getState().layoutinfo;
	}

}

ObjectModel.fixedLayout = NONE;
