/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint arrow-body-style: ["off"] */
/* eslint complexity: ["error", 31] */

import { createStore, combineReducers } from "redux";
import { NONE, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL,
	CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT, CREATE_NODE_LINK,
	CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK, CREATE_PIPELINE } from "../common-canvas/constants/canvas-constants.js";
import dagre from "dagre/dist/dagre.min.js";
import LayoutDimensions from "./layout-dimensions.js";
import CanvasInHandler from "./canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import CanvasOutHandler from "./canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import PipelineInHandler from "./pipeline-in-handler.js";
import PipelineOutHandler from "./pipeline-out-handler.js";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
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

	case "SIZE_AND_POSITION_OBJECTS":
		return state.map((node, index) => {
			const nodeObj = action.data.objectsInfo[node.id];
			if (typeof nodeObj !== "undefined") {
				const newNode = Object.assign({}, node, {
					height: nodeObj.height,
					width: nodeObj.width,
					x_pos: nodeObj.x_pos,
					y_pos: nodeObj.y_pos
				});
				return newNode;
			}

			return node;
		});

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

	case "SET_SUPERNODE_FLAG":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				let newNode = Object.assign({}, node);
				newNode.super_node_expanded = action.data.expanded;
				newNode = setNodeDimensions(newNode, action.layoutinfo);
				return newNode;
			}
			return node;
		});

	case "SET_PIPELINE_FLOW":
	case "SET_LAYOUT_INFO":
	case "SET_CANVAS_INFO":
		return state.map((node, index) => {
			let newNode = Object.assign({}, node);
			// When changing node types we throw away any previous node width and heights
			// This is mainly to satisfy the test harness.
			if (action.previousLayout &&
					action.previousLayout.nodeFormatType !== action.layoutinfo.nodeFormatType) {
				newNode.width = null;
				newNode.height = null;
			}
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
			if (action.data.id === comment.id) {
				const newComment = Object.assign({}, comment, {
					content: action.data.content,
					height: action.data.height,
					width: action.data.width,
					x_pos: action.data.x_pos,
					y_pos: action.data.y_pos
				});
				return newComment;
			}
			return comment;
		});

	case "SIZE_AND_POSITION_OBJECTS":
		return state.map((com, index) => {
			const comObj = action.data.objectsInfo[com.id];
			if (typeof comObj !== "undefined") {
				const newCom = Object.assign({}, com, {
					height: comObj.height,
					width: comObj.width,
					x_pos: comObj.x_pos,
					y_pos: comObj.y_pos
				});
				return newCom;
			}

			return com;
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
			Object.assign(newLink, {
				"srcNodePortId": action.data.srcNodePortId,
				"trgNodePortId": action.data.trgNodePortId,
				"linkName": action.data.linkName });
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

	case "DELETE_LINKS": {
		let newLinks = [...state];
		action.data.forEach((linkToDelete) => {
			newLinks = newLinks.filter((link) => {
				return link.id !== action.data.id;
			});
		});
		return newLinks;
	}

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
	// Save incoming sub-pipeline to the pipeline flow pipelines array.
	case "ADD_PIPELINE": {
		return Object.assign({}, state, { pipelines: state.pipelines.concat(action.data) });
	}
	// Delete a pipeline from the pipeline flow pipelines array.
	case "DELETE_PIPELINE": {
		const canvasInfoPipelines = state.pipelines.filter((pipeline) => {
			return pipeline.id !== action.data.id;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
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
	case "SIZE_AND_POSITION_OBJECTS":
	case "SET_NODE_PARAMETERS":
	case "SET_NODE_MESSAGE":
	case "SET_NODE_MESSAGES":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "SET_NODE_LABEL":
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
	case "SET_SUPERNODE_FLAG":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECT":
	case "ADD_LINK":
	case "DELETE_LINK":
	case "DELETE_LINKS":
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

const selectioninfo = (state = [], action) => {
	switch (action.type) {
	case "SET_PIPELINE_FLOW": {
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only clear the selections if
		// we're given a completely new canvas.
		if (action.data && action.currentCanvasInfo &&
				action.data.id !== action.currentCanvasInfo.id) {
			return {};
		}
		return state;
	}

	case "CLEAR_SELECTIONS":
		return {};

	case "SET_SELECTIONS":
		return {
			pipelineId: action.data.pipelineId,
			selections: [...action.data.selections]
		};

	case "DELETE_OBJECT": {
		if (state.selections) {
			const newSelections = state.selections.filter((objId) => {
				return action.data.id !== objId;
			});
			return {
				pipelineId: state.pipelineId,
				selections: newSelections
			};
		}
		return state;
	}

	default:
		return state;
	}
};

const breadcrumbs = (state = [], action) => {
	switch (action.type) {
	case "SET_PIPELINE_FLOW":
		return [{ pipelineId: action.data.primary_pipeline, pipelineFlowId: action.data.id }];

	case "SET_CANVAS_INFO":
		return [{ pipelineId: action.data.primary_pipeline, pipelineFlowId: action.data.id }];

	case "ADD_NEW_BREADCRUMB":
		return [
			...state,
			{ pipelineId: action.data.pipelineId, pipelineFlowId: action.data.pipelineFlowId }
		];

	case "SET_TO_PREVIOUS_BREADCRUMB":
		return state.length > 1 ? state.slice(0, state.length - 1) : state;

	default:
		return state;
	}
};

const layoutinfo = (state = LayoutDimensions.getLayout(), action) => {
	switch (action.type) {
	case "SET_LAYOUT_INFO":
		return Object.assign({}, action.layoutinfo, { linkType: action.linkType });

	default:
		return state;
	}
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

	if (newNode.type === "super_node" && newNode.super_node_expanded === true) {
		newNode.height = Math.max(newNode.height, layoutInfo.superNodeDefaultWidth);
		newNode.width = Math.max(newNode.width, layoutInfo.superNodeDefaultHeight);
	}

	return newNode;
};


export default class ObjectModel {

	constructor() {
		// Put selectioninfo reducer first so selections are handled before
		// canvasinfo actions. Also, put layoutinfo reducer before canvasinfo
		// because node heights and width are calculated based on layoutinfo.
		var combinedReducer = combineReducers({ selectioninfo, layoutinfo, canvasinfo, breadcrumbs, palette, notifications });
		const emptyCanvasInfo = this.getEmptyCanvasInfo();
		const initialState = {
			selectioninfo: {},
			layoutinfo: LayoutDimensions.getLayout(),
			canvasinfo: emptyCanvasInfo,
			breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
			palette: {},
			notifications: []
		};
		this.store = createStore(combinedReducer, initialState);

		// Default value for fixed layout behavior
		this.fixedLayout = NONE;

		// TODO - Remove this global variable when WML Canvas supports pipelineFlow
		this.oldCanvas = null;

		// Optional handler to generate the id of object model objects
		this.idGeneratorHandler = null;

		// Optional callback for notification of selection changes
		this.selectionChangeHandler = null;
	}

	// ---------------------------------------------------------------------------
	// Standard methods
	// ---------------------------------------------------------------------------

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

	setSelectionChangeHandler(selectionChangeHandler) {
		this.selectionChangeHandler = selectionChangeHandler;
	}

	setFixedAutoLayout(fixedLayoutDirection) {
		this.fixedLayout = fixedLayoutDirection;
		this.getAPIPipeline().autoLayout(fixedLayoutDirection);
	}

	// ---------------------------------------------------------------------------
	// Unique ID generation
	// ---------------------------------------------------------------------------

	getUUID() {
		return uuid4();
	}

	setIdGeneratorHandler(idGeneratorHandler) {
		this.idGeneratorHandler = idGeneratorHandler;
	}

	getUniqueId(action, data) {
		let uniqueId;
		if (this.idGeneratorHandler) {
			uniqueId = this.idGeneratorHandler(action, data);
		}
		// generate v4 uuid if no custom id was generated
		return uniqueId ? uniqueId : this.getUUID();
	}

	// ---------------------------------------------------------------------------
	// Palette methods
	// ---------------------------------------------------------------------------

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

	// ---------------------------------------------------------------------------
	// Pipeline Flow and Canvas methods
	// ---------------------------------------------------------------------------

	getAPIPipeline(pipelineId) {
		if (pipelineId) {
			return new APIPipeline(pipelineId, this);
		}
		return new APIPipeline(this.getCurrentBreadcrumb().pipelineId, this);
	}

	getSelectionAPIPipeline() {
		const id = this.getSelectionInfo().pipelineId;
		if (id) {
			return this.getAPIPipeline(id);
		}
		return null;
	}

	clearPipelineFlow() {
		this.setCanvasInfo(this.getEmptyCanvasInfo());
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
		const newFlowId = this.getUUID();
		const newPipelineId = this.getUUID();

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
			currentCanvasInfo: this.getCanvasInfo() });
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

	// Returns the pipeline for the ID passed or the primary pipeline if no
	// pipeline ID was provided otherwise null.
	getCanvasInfoPipeline(pipelineId) {
		const canvasInfo = this.getCanvasInfo();
		if (!canvasInfo) {
			return null;
		}
		let pId = pipelineId;
		if (!pId) {
			pId = this.getPrimaryPipelineId();
		}

		const pipeline = canvasInfo.pipelines.find((p) => {
			return p.id === pId;
		});

		return (typeof pipeline === "undefined") ? null : pipeline;
	}

	setCanvasInfo(canvasInfo) {
		this.store.dispatch({ type: "SET_CANVAS_INFO", data: canvasInfo, layoutinfo: this.getLayout() });
	}

	isPrimaryPipelineEmpty() {
		const primaryPipeline = this.getAPIPipeline(this.getCanvasInfo().primary_pipeline);
		return primaryPipeline.isEmpty();
	}

	getPrimaryPipelineId() {
		return this.getCanvasInfo().primary_pipeline;
	}

	addPipeline(pipeline) {
		this.store.dispatch({ type: "ADD_PIPELINE", data: pipeline });
	}

	deletePipeline(pipelineId) {
		this.store.dispatch({ type: "DELETE_PIPELINE", data: { id: pipelineId } });
	}

	createCanvasInfoPipeline(pipelineInfo) {
		const newPipelineId = this.getUniqueId(CREATE_PIPELINE, { pipeline: pipelineInfo });
		const newCanvasInfoPipeline = Object.assign({}, pipelineInfo);
		newCanvasInfoPipeline.id = newPipelineId;
		return newCanvasInfoPipeline;
	}

	getCanvasInfo() {
		return this.store.getState().canvasinfo;
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	// Adds a new breadcrumb, for the pipelineInfo passed in, to the array of
	// breadcrumbs.
	addNewBreadcrumb(pipelineInfo) {
		if (pipelineInfo) {
			this.store.dispatch({ type: "ADD_NEW_BREADCRUMB", data: pipelineInfo });
		}
	}

	// Sets the breadcrumbs to the previous breadcrumb in the breadcrumbs array.
	setPreviousBreadcrumb() {
		this.store.dispatch({ type: "SET_TO_PREVIOUS_BREADCRUMB" });
	}

	getBreadcrumbs() {
		return this.store.getState().breadcrumbs;
	}

	getCurrentBreadcrumb() {
		const crumbs = this.getBreadcrumbs();
		return crumbs[crumbs.length - 1];
	}

	// Returns true if the pipelineId passed in is not the primary Pipeline
	// breadcrumb. In other words, we are shwoing a sub-flow full screen.
	isInSubFlowBreadcrumb(pipelineId) {
		const idx = this.getBreadcrumbs().findIndex((crumb) => {
			return crumb.pipelineId === pipelineId;
		});
		return (idx > 0); // Return true if index is not the parent
	}


	// ---------------------------------------------------------------------------
	// Layout Info methods
	// ---------------------------------------------------------------------------

	setLayoutType(type, linkType) {
		this.store.dispatch({ type: "SET_LAYOUT_INFO",
			layoutinfo: LayoutDimensions.getLayout(type),
			linkType: linkType,
			previousLayout: this.getLayout() });
	}

	getLayout() {
		return this.store.getState().layoutinfo;
	}

	// ---------------------------------------------------------------------------
	// Notification Messages methods
	// ---------------------------------------------------------------------------

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

	// ---------------------------------------------------------------------------
	// Selection methods
	// ---------------------------------------------------------------------------

	getSelectedObjectIds() {
		return this.getSelectionInfo().selections || [];
	}

	getSelectedNodesIds() {
		var objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getNodes().forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node.id);
			}
		});
		return objs;
	}

	getSelectedNodes() {
		const objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getNodes().forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		return objs;
	}

	getSelectedComments() {
		const objs = [];
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.getComments().forEach((com) => {
			if (this.getSelectedObjectIds().includes(com.id)) {
				objs.push(com);
			}
		});

		return objs;
	}

	getSelectionInfo() {
		return this.store.getState().selectioninfo;
	}

	getSelectedPipeline() {
		return this.getAPIPipeline(this.getSelectionInfo().pipelineId);
	}

	clearSelections() {
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_SELECTIONS" });
	}

	isSelected(objectId) {
		return this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	toggleSelection(objectId, toggleRequested, pipelineId) {
		let newSelections = [objectId];

		if (pipelineId === this.getSelectionInfo().pipelineId &&
				toggleRequested) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId)) {
				newSelections = this.getSelectedObjectIds().slice();
				const index = newSelections.indexOf(objectId);
				newSelections.splice(index, 1);
			}	else {
				newSelections = this.getSelectedObjectIds().concat(objectId);
			}
		}
		this.setSelections(newSelections, pipelineId);
	}

	setSelections(newSelections, pipelineId) {
		this.executeWithSelectionChange(this.store.dispatch, { type: "SET_SELECTIONS", data: { pipelineId: pipelineId, selections: newSelections } });
	}

	deleteSelectedObjects() {
		const apiPipeline = this.getSelectedPipeline();
		apiPipeline.deleteObjects({ "selectedObjectIds": this.getSelectedObjectIds() });
	}

	selectAll(pipelineId) {
		const selected = [];
		const pipeline = this.getAPIPipeline(pipelineId);
		for (const node of pipeline.getNodes()) {
			selected.push(node.id);
		}
		for (const comment of pipeline.getComments()) {
			selected.push(comment.id);
		}
		this.setSelections(selected, pipelineId);
	}

	selectInRegion(minX, minY, maxX, maxY, pipelineId) {
		const pipeline = this.getAPIPipeline(pipelineId);
		var regionSelections = [];
		for (const node of pipeline.getNodes()) {
			if (minX < node.x_pos + node.width &&
					maxX > node.x_pos &&
					minY < node.y_pos + node.height &&
					maxY > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of pipeline.getComments()) {
			if (minX < comment.x_pos + comment.width &&
					maxX > comment.x_pos &&
					minY < comment.y_pos + comment.height &&
					maxY > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		this.setSelections(regionSelections, pipelineId);
	}

	findNodesInSubGraph(startNodeId, endNodeId, selection, pipelineId) {
		const pipeline = this.getAPIPipeline(pipelineId);
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			for (const link of pipeline.getLinks()) {
				if (link.srcNodeId === startNodeId) {
					const newRetval = this.findNodesInSubGraph(link.trgNodeId, endNodeId, selection, pipelineId);
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

	selectSubGraph(endNodeId, pipelineId) {
		const selection = [];
		const currentSelectedObjects = this.getSelectedObjectIds();

		// get all the nodes in the path from a currently selected object to the end node
		let foundPath = false;
		for (const startNodeId of currentSelectedObjects) {
			foundPath = foundPath || this.findNodesInSubGraph(startNodeId, endNodeId, selection, pipelineId);
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

		this.setSelections(selectedObjectIds, pipelineId);
	}

	// Return true is nodeIds are contiguous.
	// Depth-first search algorithm to determine if selected nodes ids all belong
	// in one group. If selected nodes does not belong in the same group, then
	// nodeIds are not contiguous.
	areSelectedNodesContiguous() {
		const nodeIds = this.getSelectedNodesIds();
		const connectedNodesIdsGroup = [nodeIds[0]];
		const apiPipeline = this.getSelectedPipeline();
		for (const nodeId of nodeIds) {
			this.addConnectedNodeIdToGroup(nodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
		}
		return connectedNodesIdsGroup.length === nodeIds.length;
	}

	// Recursive function to add all connected nodes into the group.
	addConnectedNodeIdToGroup(nodeId, connectedNodesIdsGroup, nodeIds, apiPipeline) {
		if (connectedNodesIdsGroup.includes(nodeId)) {
			const nodeLinks = apiPipeline.getLinksContainingId(nodeId).filter((link) => {
				return link.type === "nodeLink" || link.type === "associationLink";
			});

			for (const link of nodeLinks) {
				if (nodeIds.includes(link.trgNodeId) && nodeIds.includes(link.srcNodeId)) {
					if (!connectedNodesIdsGroup.includes(link.trgNodeId)) {
						connectedNodesIdsGroup.push(link.trgNodeId);
						this.addConnectedNodeIdToGroup(link.trgNodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
					}
					if (!connectedNodesIdsGroup.includes(link.srcNodeId)) {
						connectedNodesIdsGroup.push(link.srcNodeId);
						this.addConnectedNodeIdToGroup(link.srcNodeId, connectedNodesIdsGroup, nodeIds, apiPipeline);
					}
				}
			}
		}
	}

	// Returns an offset object containing the x and y distances into negative
	// coordinate space that that the action would encroach. For the
	// 'moveObjects' action this is the distance the selected objects would encroach
	// into negative space. For other actions is is simply the offset amounts
	// passed in, provided either one is negative.
	// getOffsetIntoNegativeSpace(action, offsetX, offsetY) {
	// 	var selObjs = this.getSelectedNodesAndComments();
	// 	var highlightGap = this.store.getState().layoutinfo.highlightGap;
	//
	// 	var offset = { "x": 0, "y": 0 };
	//
	// 	if (action === "moveObjects") {
	// 		selObjs.forEach((obj) => {
	// 			offset.x = Math.min(offset.x, obj.x_pos + offsetX - highlightGap);
	// 			offset.y = Math.min(offset.y, obj.y_pos + offsetY - highlightGap);
	// 		});
	//
	// 		var noneSelObjs = this.getNoneSelectedNodesAndComments();
	// 		noneSelObjs.forEach((obj) => {
	// 			offset.x = Math.min(offset.x, obj.x_pos - highlightGap);
	// 			offset.y = Math.min(offset.y, obj.y_pos - highlightGap);
	// 		});
	// 	} else {
	// 		offset = { "x": Math.min(0, offsetX), "y": Math.min(0, offsetY) };
	//
	// 		var objs = this.getNodesAndComments();
	// 		objs.forEach((obj) => {
	// 			offset.x = Math.min(offset.x, obj.x_pos - highlightGap);
	// 			offset.y = Math.min(offset.y, obj.y_pos - highlightGap);
	// 		});
	// 	}
	//
	// 	return offset;
	// }

	// getSelectedNodesAndComments() {
	// 	var objs = this.getSelectedNodes();
	// 	return objs.concat(this.getSelectedComments());
	// }


	// getNoneSelectedNodesAndComments() {
	// 	var objs = [];
	// 	this.pipeline.getNodes().forEach((node) => {
	// 		if (!this.getSelectedObjectIds().includes(node.id)) {
	// 			objs.push(node);
	// 		}
	// 	});
	//
	// 	this.pipeline.getComments().forEach((comment) => {
	// 		if (!this.getSelectedObjectIds().includes(comment.id)) {
	// 			objs.push(comment);
	// 		}
	// 	});
	// 	return objs;
	// }

	// getNodesAndComments() {
	// 	var objs = [];
	// 	this.pipeline.getNodes().forEach((node) => {
	// 		objs.push(node);
	// 	});
	//
	// 	this.pipeline.getComments().forEach((comment) => {
	// 		objs.push(comment);
	// 	});
	// 	return objs;
	// }

	executeWithSelectionChange(func, arg) {
		let previousSelection = {
			nodes: [],
			comments: [],
			pipelineId: ""
		};

		const prevPipelineId = this.getSelectionInfo().pipelineId;
		if (this.selectionChangeHandler && prevPipelineId) {
			previousSelection = {
				nodes: this.getSelectedNodes(),
				comments: this.getSelectedComments(),
				pipelineId: prevPipelineId
			};
		}

		func(arg);

		const pipelineId = this.getSelectionInfo().pipelineId;
		if (this.selectionChangeHandler && pipelineId) {

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
				deselectedComments: difference(previousSelection.comments, selectedComments),
				pipelineId: pipelineId
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

	// ---------------------------------------------------------------------------
	// Utility methods
	// ---------------------------------------------------------------------------

	hasErrorMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "error";
			}) !== "undefined");
		}
		return false;
	}

	hasWarningMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === "warning";
			}) !== "undefined");
		}
		return false;
	}

	getNodeMessages(node) {
		return node ? node.messages : null;
	}

}

// ---------------------------------------------------------------------------
// API Pipeline Class
// ---------------------------------------------------------------------------
export class APIPipeline {

	constructor(pipelineId, objectModel) {
		this.pipelineId = pipelineId;
		this.objectModel = objectModel;
		this.store = objectModel.store;
	}

	// ---------------------------------------------------------------------------
	// Node AND comment methods
	// ---------------------------------------------------------------------------

	moveObjects(data) {
		if (this.objectModel.fixedLayout === NONE) {
			this.store.dispatch({ type: "MOVE_OBJECTS", data: data, pipelineId: this.pipelineId });
		}
	}

	deleteObjects(source) {
		this.objectModel.executeWithSelectionChange((src) => {
			src.selectedObjectIds.forEach((selId) => {
				this.store.dispatch({ type: "DELETE_OBJECT", data: { id: selId }, pipelineId: this.pipelineId });
			});
			if (this.objectModel.fixedLayout !== NONE) {
				this.autoLayout(this.objectModel.fixedLayout);
			}
		}, source);
	}

	// Delete an array of objects that have ids.
	deleteObjectsWithIds(objects) {
		const objectIds = [];
		objects.forEach((object) => {
			objectIds.push(object.id);
		});
		this.deleteObjects({ selectedObjectIds: objectIds });
	}

	deleteObject(id) {
		this.objectModel.executeWithSelectionChange(this.store.dispatch, { type: "DELETE_OBJECT", data: { id: id }, pipelineId: this.pipelineId });
		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	disconnectNodes(source) {
		// We only disconnect links to data nodes (not links to comments).
		const selectedNodeIds = this.filterDataNodes(source.selectedObjectIds);
		const newSource = Object.assign({}, source, { selectedNodeIds: selectedNodeIds });

		this.store.dispatch({ type: "DISCONNECT_NODES", data: newSource, pipelineId: this.pipelineId });
		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	isEmpty() {
		if (this.getNodes() && this.getNodes().length === 0 &&
				this.getComments() && this.getComments().length === 0) {
			return true;
		}
		return false;
	}

	getObject(objId) {
		const node = this.getNode(objId);
		if (node) {
			return node;
		}
		const com = this.getComment(objId);
		if (com) {
			return com;
		}
		return null;
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

	// Returns true if the object ID passed in exists in the array of objects
	// passed in.
	isObjectIdInObjects(objId, inObjects) {
		if (inObjects) {
			return inObjects.findIndex((object) => {
				return object.id === objId;
			}) > -1;
		}
		return false;
	}

	// ---------------------------------------------------------------------------
	// Node methods
	// ---------------------------------------------------------------------------

	createNode(data) {
		const nodeTemplate = data.nodeTemplate;
		let node = {};
		if (nodeTemplate !== null) {
			node = Object.assign({}, nodeTemplate, {
				"id": this.objectModel.getUniqueId(CREATE_NODE, { "nodeType": nodeTemplate }),
				"x_pos": data.offsetX,
				"y_pos": data.offsetY
			});

			// Add node height and width and, if appropriate, inputPortsHeight
			// and outputPortsHeight
			node = setNodeDimensions(node, this.store.getState().layoutinfo);
		}

		return node;
	}

	// Returns a source node for auto completion or null if no source node can be
	// detected. The source node is either:
	// 1. The selected node, if only *one* node is currently selected or
	// 2. The most recently added node, provided it has one or more output ports or
	// 3. The most-recent-but-one added node, provided it has one or more output ports
	getAutoSourceNode() {
		var sourceNode = null;
		var selectedNodes = this.objectModel.getSelectedNodes();

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

	cloneNode(inNode) {
		let node = Object.assign({}, inNode, { id: this.objectModel.getUniqueId(CLONE_NODE, { "node": inNode }) });

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = setNodeDimensions(node, this.store.getState().layoutinfo);
		return node;
	}

	replaceNodes(replacementNodes) {
		this.store.dispatch({ type: "REPLACE_NODES", data: replacementNodes, pipelineId: this.pipelineId });
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

	addNode(newNode) {
		this.store.dispatch({ type: "ADD_NODE", data: { newNode: newNode }, pipelineId: this.pipelineId });

		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	addAutoNodeAndLink(newNode, newLink) {
		this.store.dispatch({ type: "ADD_AUTO_NODE", data: {
			newNode: newNode,
			newLink: newLink },
		pipelineId: this.pipelineId });
	}

	deleteNode(id) {
		this.deleteObject(id);
	}

	getNodes() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes;
		}
		return [];
	}

	getNode(nodeId) {
		return this.getNodes().find((node) => {
			return (node.id === nodeId);
		});
	}

	isDataNode(objId) {
		const node = this.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	sizeAndPositionObjects(data) {
		this.store.dispatch({ type: "SIZE_AND_POSITION_OBJECTS", data: data, pipelineId: this.pipelineId });
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	expandSuperNodeInPlace(nodeId) {
		this.store.dispatch({ type: "SET_SUPERNODE_FLAG", data: { nodeId: nodeId, expanded: true }, pipelineId: this.pipelineId, layoutinfo: this.objectModel.getLayout() });
	}

	collapseSuperNodeInPlace(nodeId) {
		this.store.dispatch({ type: "SET_SUPERNODE_FLAG", data: { nodeId: nodeId, expanded: false }, pipelineId: this.pipelineId, layoutinfo: this.objectModel.getLayout() });
	}

	doesNodeHavePorts(node) {
		return node.input_ports && node.input_ports.length > 0;
	}

	getNodeParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.parameters : null);
	}

	setNodeLabel(nodeId, newLabel) {
		this.store.dispatch({ type: "SET_NODE_LABEL", data: { nodeId: nodeId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setInputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_INPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setOutputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setNodeMessage(nodeId, message) {
		this.store.dispatch({ type: "SET_NODE_MESSAGE", data: { nodeId: nodeId, message: message }, pipelineId: this.pipelineId });
	}

	setNodeMessages(nodeId, messages) {
		this.store.dispatch({ type: "SET_NODE_MESSAGES", data: { nodeId: nodeId, messages: messages }, pipelineId: this.pipelineId });
	}

	setNodeParameters(nodeId, parameters) {
		this.store.dispatch({ type: "SET_NODE_PARAMETERS", data: { nodeId: nodeId, parameters: parameters }, pipelineId: this.pipelineId });
	}

	addCustomAttrToNodes(nodeIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_NODE_ATTR", data: { objIds: nodeIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.pipelineId });
	}

	removeCustomAttrFromNodes(nodeIds, attrName, attrValue) {
		this.store.dispatch({ type: "REMOVE_NODE_ATTR", data: { objIds: nodeIds, attrName: attrName }, pipelineId: this.pipelineId });
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
		var node = this.getNode(nodeId);
		return this.objectModel.hasErrorMessage(node);
	}

	hasWarningMessage(nodeId) {
		var node = this.getNode(nodeId);
		return this.objectModel.hasWarningMessage(node);
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
				if (includeMsgTypes.indexOf(msg.type) !== -1) {
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

	autoLayout(layoutDirection) {
		const canvasInfoPipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		let lookup = {};
		if (layoutDirection === VERTICAL) {
			lookup = this.dagreAutolayout(DAGRE_VERTICAL, canvasInfoPipeline);
		} else {
			lookup = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasInfoPipeline);
		}
		var newNodes = canvasInfoPipeline.nodes.map((node) => {
			return Object.assign({}, node, { x_pos: lookup[node.id].value.x, y_pos: lookup[node.id].value.y });
		});

		// TODO -- All code below can be moved to Redux reducers
		const canvasInfo = this.objectModel.getCanvasInfo();

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

		this.objectModel.setCanvasInfo(newCanvasInfo);
	}

	dagreAutolayout(direction, canvasInfoPipeline) {
		var nodeLinks = canvasInfoPipeline.links.filter((link) => {
			return link.type === "nodeLink" || link.type === "associationLink";
		});

		var edges = nodeLinks.map((link) => {
			return { "v": link.srcNodeId, "w": link.trgNodeId, "value": { "points": [] } };
		});

		var nodesData = canvasInfoPipeline.nodes.map((node) => {
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

		if (this.objectModel.getCanvasInfo() &&
				this.getNodes()) {
			this.getNodes().forEach((node) => {
				maxWidth = Math.max(maxWidth, node.width);
				maxHeight = Math.max(maxHeight, node.height);
			});
		}

		return { width: maxWidth, height: maxHeight };
	}

	// ---------------------------------------------------------------------------
	// Comment methods
	// ---------------------------------------------------------------------------

	createComment(source) {
		const info = {
			id: this.objectModel.getUniqueId(CREATE_COMMENT),
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
				info.linkIds.push(this.objectModel.getUniqueId(CREATE_COMMENT_LINK, { "comment": info, "targetNode": this.getNode(objId) }));
			}
		});
		return info;
	}

	cloneComment(inComment) {
		return Object.assign({}, inComment, { id: this.objectModel.getUniqueId(CLONE_COMMENT, { "comment": inComment }) });
	}

	addComment(data) {
		if (typeof data.selectedObjectIds === "undefined") {
			data.selectedObjectIds = [];
		}
		this.store.dispatch({ type: "ADD_COMMENT", data: data, pipelineId: this.pipelineId });
		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
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

	deleteComment(id) {
		this.deleteObject(id);
	}

	getComments() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.comments;
		}
		return [];

	}

	getComment(commentId) {
		return this.getComments().find((comment) => {
			return (comment.id === commentId);
		});
	}

	editComment(data) {
		this.store.dispatch({ type: "EDIT_COMMENT", data: data, pipelineId: this.pipelineId });
	}

	addCustomAttrToComments(comIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_COMMENT_ATTR", data: { objIds: comIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.pipelineId });
	}

	removeCustomAttrFromComments(comIds, attrName) {
		this.store.dispatch({ type: "REMOVE_COMMENT_ATTR", data: { objIds: comIds, attrName: attrName }, pipelineId: this.pipelineId });
	}

	// ---------------------------------------------------------------------------
	// Link methods
	// ---------------------------------------------------------------------------

	createLink(newNode, srcNode) {
		const linkId = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": srcNode, "targetNode": newNode });
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
		this.store.dispatch({ type: "DELETE_LINK", data: link, pipelineId: this.pipelineId });
		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	deleteLinks(linksToDelete) {
		this.store.dispatch({ type: "DELETE_LINKS", data: linksToDelete, pipelineId: this.pipelineId });
		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	createNodeLinks(data) {
		const linkNodeList = [];
		data.nodes.forEach((srcInfo) => {
			data.targetNodes.forEach((trgInfo) => {
				const link = this.createNodeLink(srcInfo, trgInfo, data.linkName);
				if (link) {
					linkNodeList.push(link);
				}
			});
		});
		return linkNodeList;
	}

	createNodeLink(srcInfo, trgInfo, linkName) {
		if (this.isConnectionAllowed(srcInfo, trgInfo)) {
			const link = {};
			link.id = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": this.getNode(srcInfo.id), "targetNode": this.getNode(trgInfo.id) });
			link.type = "nodeLink";
			link.class_name = "d3-data-link";
			link.srcNodeId = srcInfo.id;
			link.srcNodePortId = srcInfo.portId;
			link.trgNodeId = trgInfo.id;
			link.trgNodePortId = trgInfo.portId;
			if (linkName) {
				link.linkName = linkName;
			}
			return link;
		}
		return null;
	}

	cloneNodeLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.objectModel.getUniqueId(CLONE_NODE_LINK, { "link": link, "sourceNodeId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			srcNodePortId: link.srcNodePortId,
			trgNodeId: trgNodeId,
			trgNodePortId: link.trgNodePortId
		};
	}

	createCommentLinks(data) {
		const linkCommentList = [];
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				if (!this.commentLinkAlreadyExists(srcNodeId, trgNodeId)) {
					const info = {};
					info.id = this.objectModel.getUniqueId(CREATE_COMMENT_LINK, { "comment": this.getComment(srcNodeId), "targetNode": this.getNode(trgNodeId) });
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
			id: this.objectModel.getUniqueId(CLONE_COMMENT_LINK, { "link": link, "commentId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			trgNodeId: trgNodeId
		};
	}

	addLinks(linkList) {
		linkList.forEach((link) => {
			this.store.dispatch({ type: "ADD_LINK", data: link, pipelineId: this.pipelineId });
		});

		if (this.objectModel.fixedLayout !== NONE) {
			this.autoLayout(this.objectModel.fixedLayout);
		}
	}

	getLinks() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.links;
		}
		return [];

	}

	canNodeBeDroppedOnLink(nodeType) {
		if (nodeType.input_ports && nodeType.input_ports.length > 0 &&
				nodeType.output_ports && nodeType.output_ports.length > 0) {
			return true;
		}
		return false;
	}

	// Returns an array of links from canvas info links which link
	// any of the nodes or comments passed in.
	getLinksBetween(inNodes, inComments) {
		const linksList = this.getLinks();
		const filteredLinks = linksList.filter((link) => {
			// All links must point to a node so look for target node first
			if (this.isObjectIdInObjects(link.trgNodeId, inNodes)) {
				// Next look for any node or comment as the source object.
				if (this.isObjectIdInObjects(link.srcNodeId, inNodes) ||
						this.isObjectIdInObjects(link.srcNodeId, inComments)) {
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

	// Returns an array of node links for the array of nodes passed in.
	getNodeLinks(inNodes) {
		const nodeLinks = [];
		inNodes.forEach((node) => {
			const allNodeLinks = this.getLinksContainingId(node.id);
			allNodeLinks.forEach((link) => {
				if (link.type === "nodeLink") {
					nodeLinks.push(link);
				}
			});
		});
		return nodeLinks;
	}

	getLink(linkId) {
		return this.getLinks().find((link) => {
			return (link.id === linkId);
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

	linkAlreadyExists(srcNodeInfo, trgNodeInfo) {
		let exists = false;

		this.getLinks().forEach((link) => {
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

		this.getLinks().forEach((link) => {
			if (link.srcNodeId === srcNodeId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns true if the comment with the commentId passed in
	// is linked to nonselected nodes.
	isCommentLinkedToNonSelectedNodes(commentId) {
		const commentLinks = this.getLinksContainingId(commentId);
		const selectedIds = this.objectModel.getSelectedObjectIds();

		let linkedToNonSelectedNodes = false;
		for (const commentLink of commentLinks) {
			linkedToNonSelectedNodes = !selectedIds.includes(commentLink.trgNodeId);
			if (linkedToNonSelectedNodes) {
				return linkedToNonSelectedNodes;
			}
		}
		return linkedToNonSelectedNodes;
	}

	isCardinalityExceeded(srcPortId, trgPortId, srcNode, trgNode) {
		var srcCount = 0;
		var trgCount = 0;

		this.getLinks().forEach((link) => {
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
}
