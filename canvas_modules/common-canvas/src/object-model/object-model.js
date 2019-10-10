/*
 * Copyright 2017-2019 IBM Corporation
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
/* eslint arrow-body-style: ["off"] */

import { createStore, combineReducers } from "redux";
import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, ERROR, WARNING, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL,
	CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT, CREATE_NODE_LINK,
	CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK, CREATE_PIPELINE,
	CLONE_PIPELINE, SUPER_NODE, HIGHLIGHT_BRANCH, HIGHLIGHT_UPSTREAM,
	HIGHLIGHT_DOWNSTREAM } from "../common-canvas/constants/canvas-constants.js";
import LayoutDimensions from "./layout-dimensions.js";
import CanvasInHandler from "./canvas-in-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import CanvasOutHandler from "./canvas-out-handler.js"; // TODO - Remove this when WML supports PipelineFlow
import PipelineInHandler from "./pipeline-in-handler.js";
import PipelineOutHandler from "./pipeline-out-handler.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";
import dagre from "dagre/dist/dagre.min.js";
import difference from "lodash/difference";
import isEmpty from "lodash/isEmpty";
import has from "lodash/has";
import union from "lodash/union";
import mergeWith from "lodash/mergeWith";
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
				if (action.data.nodes.indexOf(node.id) > -1) {
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

				if (newNode.type === SUPER_NODE && newNode.is_expanded) {
					newNode.expanded_width = nodeObj.width;
					newNode.expanded_height = nodeObj.height;
				}
				return newNode;
			}

			return node;
		});

	case "DELETE_SUPERNODE":
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

	case "SET_NODE_UI_PARAMETERS":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				newNode.ui_parameters = action.data.ui_parameters;
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
			if (action.data.objIds.indexOf(node.id) > -1) {
				const newNode = Object.assign({}, node);
				newNode.customAttrs = newNode.customAttrs || [];
				newNode.customAttrs.push(action.data.attrName);
				return newNode;
			}
			return node;
		});

	case "REMOVE_NODE_ATTR":
		return state.map((node, index) => {
			if (action.data.objIds.indexOf(node.id) > -1) {
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

	case "SET_NODE_DECORATIONS":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				const newNode = Object.assign({}, node);
				newNode.decorations = action.data.decorations;
				return newNode;
			}
			return node;
		});

	case "SET_NODES_MULTI_DECORATIONS":
		return state.map((node) => {
			const pipelineNodeDec =
				action.data.pipelineNodeDecorations.find((entry) => entry.pipelineId === action.data.pipelineId && entry.nodeId === node.id);
			if (pipelineNodeDec) {
				const newNode = Object.assign({}, node, { decorations: pipelineNodeDec.decorations });
				return newNode;
			}
			return node;
		});

	case "SET_OBJECTS_STYLE":
		return state.map((node) => {
			if (action.data.objIds.indexOf(node.id) > -1) {
				const newNode = Object.assign({}, node);
				if (action.data.temporary) {
					newNode.style_temp = action.data.newStyle;
				} else {
					newNode.style = action.data.newStyle;
				}
				return newNode;
			}
			return node;
		});

	case "SET_OBJECTS_MULTI_STYLE":
		return state.map((node) => {
			const pipelineObjStyle =
				action.data.pipelineObjStyles.find((entry) => entry.pipelineId === action.data.pipelineId && entry.objId === node.id);
			if (pipelineObjStyle) {
				const newNode = Object.assign({}, node);
				const style = pipelineObjStyle && pipelineObjStyle.style ? pipelineObjStyle.style : null;
				if (action.data.temporary) {
					newNode.style_temp = style;
				} else {
					newNode.style = style;
				}
				return newNode;
			}
			return node;
		});

	case "REMOVE_ALL_STYLES":
		return state.map((node) => {
			if (action.data.temporary && node.style_temp) {
				const newNode = Object.assign({}, node);
				delete newNode.style_temp;
				return newNode;
			} else if (!action.data.temporary && node.style) {
				const newNode = Object.assign({}, node);
				delete newNode.style;
				return newNode;
			}
			return node;
		});

	case "SET_INPUT_PORT_LABEL":
	case "SET_INPUT_PORT_SUBFLOW_NODE_REF":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				return Object.assign({}, node, { inputs: ports(node.inputs, action) });
			}
			return node;
		});

	case "SET_OUTPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_SUBFLOW_NODE_REF":
		return state.map((node, index) => {
			if (action.data.nodeId === node.id) {
				return Object.assign({}, node, { outputs: ports(node.outputs, action) });
			}
			return node;
		});

	case "SET_SUPERNODE_FLAG":
		return state.map((node, index) => {
			if (action.data.node.id === node.id) {
				return action.data.node;
			}

			if (action.data.nodePositions && typeof action.data.nodePositions[node.id] !== "undefined") {
				const newPosition = action.data.nodePositions[node.id];
				return Object.assign({}, node, { x_pos: newPosition.x_pos, y_pos: newPosition.y_pos });
			}
			return node;
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
	case "SET_INPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_OUTPUT_PORT_SUBFLOW_NODE_REF":
		return state.map((port, index) => {
			if (action.data.portId === port.id) {
				const newPort = Object.assign({}, port);
				newPort.subflow_node_ref = action.data.subflowNodeRef;
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
				if (action.data.nodes.indexOf(comment.id) > -1) {
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
					x_pos: action.data.x_pos ? action.data.x_pos : comment.x_pos,
					y_pos: action.data.y_pos ? action.data.y_pos : comment.y_pos
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
			if (action.data.objIds.indexOf(comment.id) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.customAttrs = newComment.customAttrs || [];
				newComment.customAttrs.push(action.data.attrName);
				return newComment;
			}
			return comment;
		});

	case "REMOVE_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.indexOf(comment.id) > -1) {
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

	case "SET_OBJECTS_CLASS_NAME":
		return state.map((comment) => {
			const idx = action.data.objIds.indexOf(comment.id);
			if (idx > -1) {
				const newComment = Object.assign({}, comment);
				newComment.style =
					Array.isArray(action.data.newClassName) ? (action.data.newClassName[idx] || null) : action.data.newClassName;
				return newComment;
			}
			return comment;
		});

	case "SET_OBJECTS_STYLE":
		return state.map((comment) => {
			if (action.data.objIds.indexOf(comment.id) > -1) {
				const newComment = Object.assign({}, comment);
				if (action.data.temporary) {
					newComment.style_temp = action.data.newStyle;
				} else {
					newComment.style = action.data.newStyle;
				}
				return newComment;
			}
			return comment;
		});

	case "SET_OBJECTS_MULTI_STYLE":
		return state.map((comment) => {
			const pipelineObjStyle =
				action.data.pipelineObjStyles.find((entry) => entry.pipelineId === action.data.pipelineId && entry.objId === comment.id);
			if (pipelineObjStyle) {
				const newComment = Object.assign({}, comment);
				const style = pipelineObjStyle && pipelineObjStyle.style ? pipelineObjStyle.style : null;
				if (action.data.temporary) {
					newComment.style_temp = style;
				} else {
					newComment.style = style;
				}
				return newComment;
			}
			return comment;
		});

	case "REMOVE_ALL_STYLES":
		return state.map((comment) => {
			if (action.data.temporary && comment.style_temp) {
				const newComment = Object.assign({}, comment);
				delete newComment.style_temp;
				return newComment;
			} else if (!action.data.temporary && comment.style) {
				const newComment = Object.assign({}, comment);
				delete newComment.style;
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
	case "DELETE_SUPERNODE":
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

		if (action.data.type === NODE_LINK) {
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
		action.data.linkIds.forEach((linkIdToDelete) => {
			newLinks = newLinks.filter((link) => {
				return link.id !== linkIdToDelete;
			});
		});
		return newLinks;
	}

	case "SET_LINKS_CLASS_NAME":
		return state.map((link) => {
			const idx = action.data.linkIds.indexOf(link.id);
			if (idx > -1) {
				const newLink = Object.assign({}, link);
				newLink.style =
					Array.isArray(action.data.newClassName) ? action.data.newClassName[idx] : action.data.newClassName;
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_STYLE":
		return state.map((link) => {
			if (action.data.objIds.indexOf(link.id) > -1) {
				const newLink = Object.assign({}, link);
				if (action.data.temporary) {
					newLink.style_temp = action.data.newStyle;
				} else {
					newLink.style = action.data.newStyle;
				}
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_MULTI_STYLE":
		return state.map((link) => {
			const pipelineObjStyle =
				action.data.pipelineObjStyles.find((entry) => entry.pipelineId === action.data.pipelineId && entry.objId === link.id);
			if (pipelineObjStyle) {
				const newLink = Object.assign({}, link);
				const style = pipelineObjStyle && pipelineObjStyle.style ? pipelineObjStyle.style : null;
				if (action.data.temporary) {
					newLink.style_temp = style;
				} else {
					newLink.style = style;
				}
				return newLink;
			}
			return link;
		});

	case "SET_LINK_DECORATIONS":
		return state.map((link, index) => {
			if (action.data.linkId === link.id) {
				const newLink = Object.assign({}, link);
				newLink.decorations = action.data.decorations;
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_MULTI_DECORATIONS":
		return state.map((link) => {
			const pipelineLinkDec =
				action.data.pipelineLinkDecorations.find((entry) => entry.pipelineId === action.data.pipelineId && entry.linkId === link.id);
			if (pipelineLinkDec) {
				const newLink = Object.assign({}, link, { decorations: pipelineLinkDec.decorations });
				return newLink;
			}
			return link;
		});

	case "REMOVE_ALL_STYLES":
		return state.map((link) => {
			if (action.data.temporary && link.style_temp) {
				const newLink = Object.assign({}, link);
				delete newLink.style_temp;
				return newLink;
			} else if (!action.data.temporary && link.style) {
				const newLink = Object.assign({}, link);
				delete newLink.style;
				return newLink;
			}
			return link;
		});


	// When a comment is added, links have to be created from the comment
	// to each of the selected nodes.
	case "ADD_COMMENT": {
		const createdLinks = [];
		action.data.selectedObjectIds.forEach((objId, i) => {
			createdLinks.push({
				id: action.data.linkIds[i],
				srcNodeId: action.data.id,
				trgNodeId: action.data.selectedObjectIds[i],
				type: COMMENT_LINK
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

	default:
		return state;
	}
};

const canvasinfo = (state = {}, action) => {
	switch (action.type) {

	case "SET_CANVAS_INFO": {
		if (action.canvasInfo) {
			return action.canvasInfo;
		}
		return state;
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

	case "ZOOM_PIPELINE": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, { zoom: { "k": action.data.zoom.k, "x": action.data.zoom.x, "y": action.data.zoom.y } });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_LAYOUT_INFO": {
		return Object.assign({}, state, { pipelines: action.pipelines });
	}

	case "DELETE_SUPERNODE": {
		// Delete the supernode pipelines.
		let canvasInfoPipelines = state.pipelines;
		action.data.pipelineIds.forEach((pipelineId) => {
			canvasInfoPipelines = canvasInfoPipelines.filter((pipeline) => {
				return pipeline.id !== pipelineId;
			});
		});

		// Delete the supernode.
		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === action.pipelineId) {
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					links: links(pipeline.links, action)
				});
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}

	case "SET_SUBDUE_STYLE":
		return Object.assign({}, state, { subdueStyle: action.data.subdueStyle });

	case "ADD_NODE":
	case "ADD_AUTO_NODE":
	case "REPLACE_NODES":
	case "SIZE_AND_POSITION_OBJECTS":
	case "SET_NODE_PARAMETERS":
	case "SET_NODE_UI_PARAMETERS":
	case "SET_NODE_MESSAGE":
	case "SET_NODE_MESSAGES":
	case "SET_NODE_DECORATIONS":
	case "SET_LINK_DECORATIONS":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "SET_NODE_LABEL":
	case "SET_OBJECTS_CLASS_NAME":
	case "SET_INPUT_PORT_LABEL":
	case "SET_OUTPUT_PORT_LABEL":
	case "SET_INPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_OUTPUT_PORT_SUBFLOW_NODE_REF":
	case "SET_SUPERNODE_FLAG":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECT":
	case "ADD_LINK":
	case "DELETE_LINK":
	case "DELETE_LINKS":
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
	case "SET_OBJECTS_STYLE":
	case "SET_LINKS_STYLE": {
		const pipelineIds = Object.keys(action.data.pipelineObjIds);
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (pipelineIds.indexOf(pipeline.id) > -1) {
				action.data.objIds = action.data.pipelineObjIds[pipeline.id];
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });
	}
	case "SET_OBJECTS_MULTI_STYLE":
	case "SET_LINKS_MULTI_STYLE": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineObjStyles.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: comments(pipeline.comments, action),
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "SET_NODES_MULTI_DECORATIONS": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineNodeDecorations.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: nodes(pipeline.nodes, action),
					comments: pipeline.comments,
					links: pipeline.links });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "SET_LINKS_MULTI_DECORATIONS": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			if (action.data.pipelineLinkDecorations.findIndex((entry) => entry.pipelineId === pipeline.id) > -1) {
				action.data.pipelineId = pipeline.id;
				return Object.assign({}, pipeline, {
					nodes: pipeline.nodes,
					comments: pipeline.comments,
					links: links(pipeline.links, action) });
			}
			return pipeline;
		});
		return Object.assign({}, state, { pipelines: canvasInfoPipelines });

	}
	case "REMOVE_ALL_STYLES": {
		const canvasInfoPipelines = state.pipelines.map((pipeline) => {
			return Object.assign({}, pipeline, {
				nodes: nodes(pipeline.nodes, action),
				comments: comments(pipeline.comments, action),
				links: links(pipeline.links, action) });
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

	case "ADD_NODE_TYPES_TO_PALETTE":
	case "REMOVE_NODE_TYPES_FROM_PALETTE": {
		return Object.assign({}, state, { categories: categories(state.categories, action) });
	}
	default:
		return state;
	}
};

const categories = (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPES_TO_PALETTE": {
		let category = state.find((cat) => cat.id === action.data.categoryId);

		if (category) {
			return state.map((cat) => {
				if (action.data.categoryId === cat.id) {
					return Object.assign({}, cat, { node_types: nodetypes(cat.node_types, action) });
				}
				return cat;
			});
		}

		// If a category was not found, we create a new one using the ID and label
		// provided.
		category = {
			"id": action.data.categoryId,
			"label": action.data.categoryLabel ? action.data.categoryLabel : action.data.categoryId
		};
		if (action.data.categoryDescription) {
			category.description = action.data.categoryDescription;
		}
		if (action.data.categoryImage) {
			category.image = action.data.categoryImage;
		}
		category.node_types = [];

		return [
			...state,
			Object.assign({}, category, { node_types: nodetypes(category.node_types, action) })
		];
	}

	case "REMOVE_NODE_TYPES_FROM_PALETTE": {
		return state.map((category) => {
			if (category.id === action.data.categoryId) {
				return Object.assign({}, category, { node_types: nodetypes(category.node_types, action) });
			}
			return category;
		});
	}

	default:
		return state;
	}
};

const nodetypes = (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPES_TO_PALETTE":
		if (action.data.nodeTypes) {
			return [
				...state,
				...action.data.nodeTypes
			];
		}
		return state;

	case "REMOVE_NODE_TYPES_FROM_PALETTE": {
		return state.filter((nodeType) => {
			return action.data.selObjectIds.findIndex((objId) => objId === nodeType.id) === -1;
		});
	}

	default:
		return state;
	}
};

const selectioninfo = (state = [], action) => {
	switch (action.type) {
	case "SET_CANVAS_INFO": {
		// In some instances, with an external object model, the same canvas info may
		// be set multiple times. Consequently, we only clear the selections if
		// we're given a completely new canvas.
		if (action.canvasInfo && action.currentCanvasInfo &&
				action.canvasInfo.id !== action.currentCanvasInfo.id) {
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
	case "SET_CANVAS_INFO": {
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only reset the breadcrumbs if
		// we're given a completely new canvas or the current breadcrumb does not
		// reference a pipeline Id in the incoming pipelineFlow, which might happen
		// if the pipeline has been removed.
		if ((action.canvasInfo && action.currentCanvasInfo &&
					action.canvasInfo.id !== action.currentCanvasInfo.id) ||
				!isCurrentBreadcrumbInPipelineFlow(state, action.canvasInfo)) {
			return [{ pipelineId: action.canvasInfo.primary_pipeline, pipelineFlowId: action.canvasInfo.id }];
		}
		return state;
	}

	case "ADD_NEW_BREADCRUMB":
		return [
			...state,
			{ pipelineId: action.data.pipelineId, pipelineFlowId: action.data.pipelineFlowId }
		];

	case "SET_TO_PREVIOUS_BREADCRUMB":
		return state.length > 1 ? state.slice(0, state.length - 1) : state;

	case "RESET_BREADCRUMB":
		return [
			{ pipelineId: action.data.pipelineId, pipelineFlowId: action.data.pipelineFlowId }
		];

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

// Returns true if the 'current' breadcrumb from the breadcrumbs
// passed in is in the pipelineFlow's set of pipelines.
const isCurrentBreadcrumbInPipelineFlow = (brdcrumbs, pipelineFlow) => {
	if (pipelineFlow &&
			pipelineFlow.pipelines &&
			Array.isArray(brdcrumbs) &&
			brdcrumbs.length > 0 &&
			brdcrumbs[brdcrumbs.length - 1].pipelineId) {
		const piId = brdcrumbs[brdcrumbs.length - 1].pipelineId;
		const idx = pipelineFlow.pipelines.findIndex((pipeline) => pipeline.id === piId);
		return idx > -1;
	}
	return false;
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
			layoutinfo: {},
			canvasinfo: emptyCanvasInfo,
			breadcrumbs: [{ pipelineId: emptyCanvasInfo.primary_pipeline, pipelineFlowId: emptyCanvasInfo.id }],
			palette: {},
			notifications: []
		};
		this.store = createStore(combinedReducer, initialState);

		// TODO - Remove this global variable when WML Canvas supports pipelineFlow
		this.oldCanvas = null;

		// Optional handler to generate the id of object model objects
		this.idGeneratorHandler = null;

		// Optional callback for notification of selection changes
		this.selectionChangeHandler = null;

		// Optional callback for layout of the canvas
		this.layoutHandler = null;
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

	setLayoutHandler(layoutHandler) {
		this.layoutHandler = layoutHandler;
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

	// Deprecated  TODO - Remove this method when WML Canvas migrates to setPipelineFlowPalette() method
	setPaletteData(paletteData) {
		var newPalData = CanvasInHandler.convertPaletteToPipelineFlowPalette(paletteData);
		this.setPipelineFlowPalette(newPalData);
	}

	setPipelineFlowPalette(paletteData) {
		if (!paletteData || isEmpty(paletteData)) {
			this.store.dispatch({ type: "SET_PALETTE_DATA", data: {} });
			return;
		}
		// TODO - this method is called by App.js test harness. Remove this check and
		// code when we remove the x-* example palette files after WML Canvas migrates to use v2.0 palette.
		let palData = paletteData;
		if (CanvasInHandler.isVersion0Palette(palData)) {
			palData = CanvasInHandler.convertPaletteToPipelineFlowPalette(palData);
		}

		const newPalData = this.validateAndUpgradePalette(palData);
		this.store.dispatch({ type: "SET_PALETTE_DATA", data: newPalData });
	}

	getPaletteData() {
		return this.store.getState().palette;
	}

	addNodeTypeToPalette(nodeTypeObj, categoryId, categoryLabel, categoryDescription, categoryImage) {
		this.addNodeTypesToPalette([nodeTypeObj], categoryId, categoryLabel, categoryDescription, categoryImage);
	}

	addNodeTypesToPalette(nodeTypeObjs, categoryId, categoryLabel, categoryDescription, categoryImage) {
		const nodeTypePaletteData = {
			"nodeTypes": nodeTypeObjs,
			"categoryId": categoryId,
			"categoryLabel": categoryLabel,
			"categoryDescription": categoryDescription,
			"categoryImage": categoryImage
		};

		this.store.dispatch({ type: "ADD_NODE_TYPES_TO_PALETTE", data: nodeTypePaletteData });

		if (this.schemaValidation) {
			validatePaletteAgainstSchema(this.getPaletteData(), LATEST_PALETTE_VERSION);
		}
	}

	removeNodesFromPalette(selObjectIds, categoryId) {
		this.store.dispatch({ type: "REMOVE_NODE_TYPES_FROM_PALETTE", data: { selObjectIds: selObjectIds, categoryId: categoryId } });
	}

	// Converts a nodeTemplate from the palette (which will be in the pipelineFlow
	// format) to a nodeTemplate compatible with the internal format stored in the
	// object model.
	convertNodeTemplate(nodeTemplate) {
		if (nodeTemplate) {
			const newNodeTemplate = Object.assign({}, nodeTemplate);

			if (newNodeTemplate.app_data) {
				// Ensure we've cloned the app_data not just refer to the original from the palette.
				newNodeTemplate.app_data = JSON.parse(JSON.stringify(nodeTemplate.app_data));

				if (newNodeTemplate.app_data.ui_data) {
					newNodeTemplate.label = nodeTemplate.app_data.ui_data.label;
					newNodeTemplate.image = nodeTemplate.app_data.ui_data.image;
					newNodeTemplate.description = nodeTemplate.app_data.ui_data.description;
					newNodeTemplate.class_name = nodeTemplate.app_data.ui_data.class_name;
					newNodeTemplate.decorations = nodeTemplate.app_data.ui_data.decorations;
					newNodeTemplate.messages = nodeTemplate.app_data.ui_data.messages;

					// We can remove the app_data.ui_data
					delete newNodeTemplate.app_data.ui_data;
				}
			}

			if (nodeTemplate.inputs) {
				newNodeTemplate.inputs = newNodeTemplate.inputs.map((port) => this.convertPort(port));
			}

			if (nodeTemplate.outputs) {
				newNodeTemplate.outputs = newNodeTemplate.outputs.map((port) => this.convertPort(port));
			}

			return newNodeTemplate;
		}
		return null;
	}

	// Converts an incoming port (either input or output ) from a nodetemplate
	// from the palette to an internal format port.
	convertPort(port) {
		const newPort = Object.assign({}, port);
		if (port.app_data && port.app_data.ui_data) {
			if (port.app_data.ui_data.label) {
				newPort.label = port.app_data.ui_data.label;
			}
			if (port.app_data.ui_data.cardinality) {
				newPort.cardinality = port.app_data.ui_data.cardinality;
			}
			if (port.app_data.ui_data.class_name) {
				newPort.class_name = port.app_data.ui_data.class_name;
			}
			// We can remvove this as it is not needed in the internal format.
			delete newPort.app_data.ui_data;
		}
		return newPort;
	}

	getPaletteNode(nodeOpIdRef) {
		let outNodeType = null;
		if (!isEmpty(this.getPaletteData())) {
			this.getPaletteData().categories.forEach((category) => {
				category.node_types.forEach((nodeType) => {
					if (nodeType.op === nodeOpIdRef) {
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
			category.node_types.forEach((nodeType) => {
				if (nodeType.op === nodeOpIdRef) {
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
		const id = this.getSelectedPipelineId();
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
			"version": "3.0",
			"json_schema": "http://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json",
			"id": newFlowId,
			"primary_pipeline": newPipelineId,
			"pipelines": [
				{
					"id": newPipelineId,
					"runtime_ref": "",
					"nodes": [],
					"comments": [],
					"links": []
				}
			],
			"schemas": []
		};
	}

	setPipelineFlow(newPipelineFlow) {
		// TODO - Remove this if clause when we remove x-* test files.
		if (newPipelineFlow.objectData) { // Old canvas docs will have an 'objectData' field
			this.setCanvas(newPipelineFlow);
			return;
		}

		// If there's no current layout info then add some default layout before
		// setting canvas info. This is mainly necessary for Jest testcases.
		if (isEmpty(this.getLayoutInfo())) {
			this.setDefaultLayout();
		}

		const pipelineFlow = this.validateAndUpgrade(newPipelineFlow);
		const canvasInfo = PipelineInHandler.convertPipelineFlowToCanvasInfo(pipelineFlow, this.getLayoutInfo());

		canvasInfo.pipelines = this.prepareNodes(canvasInfo.pipelines, this.getLayoutInfo());

		this.executeWithSelectionChange(this.store.dispatch, {
			type: "SET_CANVAS_INFO",
			canvasInfo: canvasInfo,
			currentCanvasInfo: this.getCanvasInfo() });
	}

	// Does all preparation needed for nodes before they are saved into Redux.
	prepareNodes(pipelines, layoutInfo) {
		const newPipelines = this.setSupernodesBindingStatus(pipelines);
		return newPipelines.map((pipeline) => this.setPipelineNodeAttributes(pipeline, layoutInfo));
	}

	// Loops through all the pipelines and adds the appropriate supernode binding
	// attribute to any binding nodes that are referenced by the ports of a supernode.
	setSupernodesBindingStatus(pipelines) {
		// First, clear all supernode binding statuses from nodes
		pipelines.forEach((pipeline) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node) => {
					delete node.isSupernodeInputBinding;
					delete node.isSupernodeOutputBinding;
				});
			}
		});
		// Set the supernode binding statuses as appropriate.
		pipelines.forEach((pipeline) => {
			if (pipeline.nodes) {
				pipeline.nodes.forEach((node) => {
					if (node.type === SUPER_NODE && node.subflow_ref && node.subflow_ref.pipeline_id_ref) {
						if (node.inputs) {
							node.inputs.forEach((input) => {
								if (input.subflow_node_ref) {
									const subNode = this.findNode(input.subflow_node_ref, node.subflow_ref.pipeline_id_ref, pipelines);
									if (subNode) {
										subNode.isSupernodeInputBinding = true;
									}
								}
							});
						}
						if (node.outputs) {
							node.outputs.forEach((output) => {
								if (output.subflow_node_ref) {
									const subNode = this.findNode(output.subflow_node_ref, node.subflow_ref.pipeline_id_ref, pipelines);
									if (subNode) {
										subNode.isSupernodeOutputBinding = true;
									}
								}
							});
						}
					}
				});
			}
		});
		return pipelines;
	}

	setPipelineNodeAttributes(inPipeline, layoutInfo) {
		const pipeline = Object.assign({}, inPipeline);
		if (pipeline.nodes) {
			pipeline.nodes = pipeline.nodes.map((node) => this.setNodeAttributes(node, layoutInfo));
		} else {
			pipeline.nodes = [];
		}
		return pipeline;
	}

	// Returns a copy of the node passed in with additional fields which contains
	// layout, diemension and supernode binding status info.
	setNodeAttributes(node, layoutInfo) {
		let newNode = Object.assign({}, node);
		newNode = this.setNodeLayoutAttributes(newNode, layoutInfo);
		newNode = this.setNodeDimensionAttributes(newNode, layoutInfo);
		return newNode;
	}

	// Returns the node passed in with additional fields which contains
	// the layout info.
	setNodeLayoutAttributes(node, layoutInfo) {
		node.layout = layoutInfo.nodeLayout;

		// If using the layoutHandler we must make a copy of the layout for each node
		// so the original layout info doesn't get overwritten.
		if (this.layoutHandler) {
			const customLayout = this.layoutHandler(node);
			if (customLayout && !isEmpty(customLayout)) {
				const decs = CanvasUtils.getCombinedDecorations(node.layout.decorations, customLayout.decorations);
				node.layout = Object.assign({}, node.layout, customLayout, { decorations: decs });
			}
		}
		return node;
	}

	// Returns the node passed in with additional fields which contains
	// the height occupied by the input ports and output ports, based on the
	// layout info passed in, as well as the node width.
	setNodeDimensionAttributes(node, layoutInfo) {
		if (layoutInfo.connectionType === "ports") {
			node.inputPortsHeight = node.inputs
				? (node.inputs.length * (node.layout.portArcRadius * 2)) + ((node.inputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.outputPortsHeight = node.outputs
				? (node.outputs.length * (node.layout.portArcRadius * 2)) + ((node.outputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2)
				: 0;

			node.height = Math.max(node.inputPortsHeight, node.outputPortsHeight, node.layout.defaultNodeHeight);

			if (node.type === SUPER_NODE && node.is_expanded) {
				node.height += layoutInfo.supernodeTopAreaHeight + layoutInfo.supernodeSVGAreaPadding;
				// If an expanded height is provided make sure it is at least as big
				// as the node height.
				if (node.expanded_height) {
					node.expanded_height = Math.max(node.expanded_height, node.height);
				}
			}
		} else { // 'halo' connection type
			node.inputPortsHeight = 0;
			node.outputPortsHeight = 0;
			node.height = node.layout.defaultNodeHeight;
		}
		node.width = node.layout.defaultNodeWidth;

		if (node.type === SUPER_NODE && node.is_expanded) {
			node.width = CanvasUtils.getSupernodeExpandedWidth(node, layoutInfo);
			node.height = CanvasUtils.getSupernodeExpandedHeight(node, layoutInfo);
		}

		return node;
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

	// Returns an array of pipelines based on the array of pipeline IDs
	// passed in.
	getPipelines(pipelineIds) {
		const pipelines = [];
		pipelineIds.forEach((pipelineId) => {
			pipelines.push(this.getCanvasInfoPipeline(pipelineId));
		});
		return pipelines;
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

	// Returns an associative array (indexed by the node ID) of pipeline arrays.
	// The pipeline arrays are any descendent pipelines of the supernode being
	// processed from the array of supernodes passed in.
	getReferencedPipelines(supernodes) {
		const pipelines = {};
		supernodes.forEach((supernode) => {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				let pipelineIds = [supernode.subflow_ref.pipeline_id_ref];
				pipelineIds = pipelineIds.concat(this.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));
				pipelines[supernode.id] = this.getPipelines(pipelineIds);
			}
		});
		return pipelines;
	}

	getDescendentPipelineIds(pipelineId) {
		let pipelineIds = [];
		this.getAPIPipeline(pipelineId).getSupernodes()
			.forEach((supernode) => {
				const subPipelineId = this.getSupernodePipelineID(supernode);
				if (subPipelineId) {
					pipelineIds.push(subPipelineId);
					pipelineIds = pipelineIds.concat(this.getDescendentPipelineIds(subPipelineId));
				}
			});
		return pipelineIds;
	}

	// Returns a list of the given pipelineId ancestors, from "oldest" to "youngest".
	// This is a list of objects containing the pipeline id and its corresponding supernode label and id.
	// Includes itself.
	getAncestorPipelineIds(pipelineId) {
		const primaryPipelineId = this.getPrimaryPipelineId();
		if (primaryPipelineId === pipelineId) {
			return [{ pipelineId: primaryPipelineId }];
		}
		const ancestors = [{ pipelineId: primaryPipelineId }];
		return ancestors.concat(this.getAncestorsBetween(primaryPipelineId, pipelineId));
	}

	getAncestorsBetween(upperPipelineId, lowerPipelineId) {
		let ancestors = [];
		this.getAPIPipeline(upperPipelineId).getSupernodes()
			.forEach((supernode) => {
				const subPipelineId = this.getSupernodePipelineID(supernode);
				if (subPipelineId) {
					if (this.isAncestorOfPipeline(subPipelineId, lowerPipelineId) || subPipelineId === lowerPipelineId) {
						ancestors.push({ pipelineId: subPipelineId, label: supernode.label, supernodeId: supernode.id, parentPipelineId: upperPipelineId });
					}
					ancestors = ancestors.concat(this.getAncestorsBetween(subPipelineId, lowerPipelineId));
				}
			});
		return ancestors;
	}

	// Returns true if ancestorId is an ancestor pipeline of pipelineId.
	isAncestorOfPipeline(ancestorId, pipelineId) {
		const decendents = this.getDescendentPipelineIds(ancestorId);
		if (decendents.indexOf(pipelineId) > -1) {
			return true;
		}
		return false;
	}

	getSupernodePipelineID(supernode) {
		if (has(supernode, "subflow_ref.pipeline_id_ref")) {
			return supernode.subflow_ref.pipeline_id_ref;
		}
		return null;
	}

	// Return the supernode object that has a subflow_ref to the given pipelineId.
	// There should only be one supernode referencing the pipeline.
	getSupernodeObjReferencing(pipelineId) {
		let supernodeRef;
		if (pipelineId === this.getPrimaryPipelineId()) {
			const supernodes = this.getAPIPipeline(pipelineId).getSupernodes();
			supernodeRef = supernodes.find((supernode) => has(supernode, "subflow_ref.pipeline_id_ref") && supernode.subflow_ref.pipeline_id_ref === pipelineId).id;
		} else {
			const ancestorPipelines = this.getAncestorPipelineIds(pipelineId);
			const supernodePipelineObj = ancestorPipelines.find((pipelineObj) => pipelineObj.pipelineId === pipelineId && has(pipelineObj, "supernodeId"));
			supernodeRef = supernodePipelineObj;
		}
		return supernodeRef;
	}

	setCanvasInfo(inCanvasInfo) {
		// If there's no current layout info then add some default layout before
		// setting canvas info. This is mainly necessary for Jest testcases.
		if (isEmpty(this.getLayoutInfo())) {
			this.setDefaultLayout();
		}
		const canvasInfo = Object.assign({}, inCanvasInfo);
		canvasInfo.pipelines = this.prepareNodes(canvasInfo.pipelines, this.getLayoutInfo());
		this.store.dispatch({ type: "SET_CANVAS_INFO", canvasInfo: canvasInfo, currentCanvasInfo: this.getCanvasInfo() });
	}

	isPrimaryPipelineEmpty() {
		const primaryPipeline = this.getAPIPipeline(this.getCanvasInfo().primary_pipeline);
		return primaryPipeline.isEmpty();
	}

	getPipelineFlowId() {
		return this.getCanvasInfo().id;
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

	// Clones the contents of the input node (which is expected to be a supernode)
	// and returns an array of cloned pipelines from the inPipelines array that
	// correspond to descendents of the supernode passed in. The returned
	// pipelines are in the internal 'canvasinfo' format.
	cloneSuperNodeContents(node, inPipelines) {
		let subPipelines = [];
		if (node.type === SUPER_NODE &&
				has(node, "subflow_ref.pipeline_id_ref")) {
			const targetPipeline = inPipelines.find((inPipeline) => inPipeline.id === node.subflow_ref.pipeline_id_ref);
			const clonedPipeline = this.clonePipelineWithNewId(targetPipeline);
			node.subflow_ref.pipeline_id_ref = clonedPipeline.id;
			const canvInfoPipeline =
				PipelineInHandler.convertPipelineToCanvasInfoPipeline(clonedPipeline, this.getLayoutInfo());

			subPipelines.push(canvInfoPipeline);

			clonedPipeline.nodes.forEach((clonedNode) => {
				if (clonedNode.type === SUPER_NODE) {
					const extraPipelines = this.cloneSuperNodeContents(clonedNode, inPipelines);
					subPipelines = subPipelines.concat(extraPipelines);
				}
			});
		}
		return subPipelines;
	}

	// Clone the pipeline and assigns it a new id.
	clonePipelineWithNewId(pipeline) {
		const clonedPipeline = JSON.parse(JSON.stringify(pipeline));
		return Object.assign({}, clonedPipeline, { id: this.getUniqueId(CLONE_PIPELINE, { "pipeline": clonedPipeline }) });
	}

	// Returns an array of pipelines, that conform to the schema, for the
	// supernode passed in or an empty array if the supernode doesn't reference
	// a pipeline.
	getSubPipelinesForSupernode(supernode) {
		const schemaPipelines = [];
		if (supernode.type === SUPER_NODE &&
				has(supernode, "subflow_ref.pipeline_id_ref")) {
			let subPipelines = [supernode.subflow_ref.pipeline_id_ref];
			subPipelines = subPipelines.concat(this.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));

			subPipelines.forEach((subPiplineId) => {
				const canvInfoPipeline = this.getCanvasInfoPipeline(subPiplineId);
				const schemaPipeline = PipelineOutHandler.createPipeline(canvInfoPipeline);
				schemaPipelines.push(schemaPipeline);
			});
		}
		return schemaPipelines;
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

	setSubdueStyle(newStyle) {
		this.store.dispatch({ type: "SET_SUBDUE_STYLE", data: { subdueStyle: newStyle } });
	}

	removeAllStyles(temporary) {
		this.store.dispatch({ type: "REMOVE_ALL_STYLES", data: { temporary: temporary } });
	}

	findNode(nodeId, pipelineId, pipelines) {
		const targetPipeline = pipelines.find((p) => {
			return (p.id === pipelineId);
		});

		if (targetPipeline && targetPipeline.nodes) {
			return targetPipeline.nodes.find((node) => {
				return (node.id === nodeId);
			});
		}
		return null;
	}

	// ---------------------------------------------------------------------------
	// Breadcrumbs methods
	// ---------------------------------------------------------------------------

	// Adds a new breadcrumb, for the pipelineInfo passed in, to the array of
	// breadcrumbs, or reset the breadcrumbs to the primary pipeline if navigating
	// to the primary pipeline.
	addNewBreadcrumb(pipelineInfo) {
		if (pipelineInfo && pipelineInfo.pipelineId !== this.getPrimaryPipelineId()) {
			this.store.dispatch({ type: "ADD_NEW_BREADCRUMB", data: pipelineInfo });
		} else {
			this.resetBreadcrumb();
		}
	}

	// Sets the breadcrumbs to the previous breadcrumb in the breadcrumbs array.
	setPreviousBreadcrumb() {
		this.store.dispatch({ type: "SET_TO_PREVIOUS_BREADCRUMB" });
	}

	// Sets the breadcrumbs to the primary pipeline in the breadcrumbs array.
	resetBreadcrumb() {
		this.store.dispatch({ type: "RESET_BREADCRUMB", data: { pipelineId: this.getPrimaryPipelineId(), pipelineFlowId: this.getPipelineFlowId() } });
	}

	getBreadcrumbs() {
		return this.store.getState().breadcrumbs;
	}

	getCurrentBreadcrumb() {
		const crumbs = this.getBreadcrumbs();
		return crumbs[crumbs.length - 1];
	}

	getPreviousBreadcrumb() {
		const crumbs = this.getBreadcrumbs();
		if (crumbs.length < 2) {
			return null;
		}
		return crumbs[crumbs.length - 2];
	}

	// Returns true if the pipelineId passed in is not the primary pipeline
	// breadcrumb. In other words, we are showing a sub-flow full screen.
	isInSubFlowBreadcrumb(pipelineId) {
		const idx = this.getBreadcrumbs().findIndex((crumb) => {
			return crumb.pipelineId === pipelineId;
		});
		return (idx > 0); // Return true if index is not the parent
	}


	// ---------------------------------------------------------------------------
	// Layout Info methods
	// ---------------------------------------------------------------------------

	setLayoutType(type, config) {
		const layoutInfo = Object.assign({}, LayoutDimensions.getLayout(type, config));
		const newPipelines = this.prepareNodes(this.getCanvasInfo().pipelines, layoutInfo);

		this.store.dispatch({ type: "SET_LAYOUT_INFO",
			layoutinfo: layoutInfo,
			pipelines: newPipelines
		});
	}

	setDefaultLayout() {
		const layoutInfo = LayoutDimensions.getLayout();
		const newPipelines = this.prepareNodes(this.getCanvasInfo().pipelines, layoutInfo);

		this.store.dispatch({ type: "SET_LAYOUT_INFO",
			layoutinfo: layoutInfo,
			pipelines: newPipelines
		});
	}

	getLayoutInfo() {
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
		return this.getAPIPipeline(this.getSelectedPipelineId());
	}

	getSelectedPipelineId() {
		return this.getSelectionInfo().pipelineId;
	}

	clearSelections() {
		this.executeWithSelectionChange(this.store.dispatch, { type: "CLEAR_SELECTIONS" });
	}

	isSelected(objectId, pipelineId) {
		return pipelineId === this.getSelectedPipelineId() &&
			this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	toggleSelection(objectId, toggleRequested, pipelineId) {
		let newSelections = [objectId];

		if (pipelineId === this.getSelectedPipelineId() &&
				toggleRequested) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId, pipelineId)) {
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
		const pipeId = pipelineId ? pipelineId : this.getAPIPipeline().pipelineId; // If no pipelineId is provided use the default pipelineId.
		const pipeline = this.getAPIPipeline(pipeId);
		for (const node of pipeline.getNodes()) {
			if (!this.isSupernodeBinding(node)) { // Dont allow supernode binding nodes to be selected
				selected.push(node.id);
			}
		}
		for (const comment of pipeline.getComments()) {
			selected.push(comment.id);
		}
		this.setSelections(selected, pipeId);
	}

	isSupernodeBinding(node) {
		return node.isSupernodeInputBinding || node.isSupernodeOutputBinding;
	}

	selectInRegion(minX, minY, maxX, maxY, pipelineId) {
		const pipeline = this.getAPIPipeline(pipelineId);
		var regionSelections = [];
		for (const node of pipeline.getNodes()) {
			if (!this.isSupernodeBinding(node) && // Don't include binding nodes in select
					minX < node.x_pos + node.width &&
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
					// This handles the case where there are multiple outward paths.
					// Some of the outward paths could be true and some false. This
					// will make sure that the node in the selection list of one of the
					// paths contains the end nodeId.
					retval = retval || newRetval;
				}
			}
		}

		return retval;
	}

	selectSubGraph(endNodeId, pipelineId) {
		const selection = [];
		let selectedObjectIds = [endNodeId];

		if (pipelineId === this.getSelectedPipelineId()) {
			const currentSelectedObjects = this.getSelectedObjectIds();

			// Get all the nodes in the path from a currently selected object to the end node
			let foundPath = false;
			for (const startNodeId of currentSelectedObjects) {
				foundPath = foundPath || this.findNodesInSubGraph(startNodeId, endNodeId, selection, pipelineId);
			}
			if (!foundPath) {
				// If no subgraph found which is also the case if current selection was empty, just select endNode
				selection.push(endNodeId);
			}

			// Do not put multiple copies of a nodeId in selected nodeId list.
			selectedObjectIds = this.getSelectedObjectIds().slice();
			for (const selected of selection) {
				if (!this.isSelected(selected, pipelineId)) {
					selectedObjectIds.push(selected);
				}
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
				return link.type === NODE_LINK || link.type === ASSOCIATION_LINK;
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

	// Creates an empty pipeline.  Used for shaper and supernodes without sub pipeline defined
	createEmptyPipeline() {
		const primaryPipeline = this.getCanvasInfoPipeline(this.getPrimaryPipelineId());
		const subPipelineInfo = {
			"runtime_ref": primaryPipeline.runtime_ref,
			"nodes": [],
			"comments": [],
			"links": []
		};
		const canvasInfoSubPipeline = this.createCanvasInfoPipeline(subPipelineInfo);
		return canvasInfoSubPipeline;
	}

	executeWithSelectionChange(func, arg) {
		let previousSelection = {
			nodes: [],
			comments: [],
			pipelineId: ""
		};

		if (this.selectionChangeHandler) {
			previousSelection = {
				nodes: this.getSelectedNodes(),
				comments: this.getSelectedComments(),
				pipelineId: this.getSelectedPipelineId()
			};
		}

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
				deselectedComments: difference(previousSelection.comments, selectedComments),
				previousPipelineId: previousSelection.pipelineId,
				selectedPipelineId: this.getSelectedPipelineId()
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
				return msg.type === ERROR;
			}) !== "undefined");
		}
		return false;
	}

	hasWarningMessage(node) {
		const messages = this.getNodeMessages(node);
		if (messages) {
			return (typeof messages.find((msg) => {
				return msg.type === WARNING;
			}) !== "undefined");
		}
		return false;
	}

	getNodeMessages(node) {
		return node ? node.messages : null;
	}

	// ---------------------------------------------------------------------------
	// Add decorations in batch
	// ---------------------------------------------------------------------------

	setNodesMultiDecorations(pipelineNodeDecorations) {
		this.store.dispatch({ type: "SET_NODES_MULTI_DECORATIONS", data: { pipelineNodeDecorations: pipelineNodeDecorations } });
	}

	setLinksMultiDecorations(pipelineLinkDecorations) {
		this.store.dispatch({ type: "SET_LINKS_MULTI_DECORATIONS", data: { pipelineLinkDecorations: pipelineLinkDecorations } });
	}

	// ---------------------------------------------------------------------------
	// Styling methods
	// ---------------------------------------------------------------------------

	setObjectsStyle(pipelineObjIds, newStyle, temporary) {
		this.store.dispatch({ type: "SET_OBJECTS_STYLE", data: { pipelineObjIds: pipelineObjIds, newStyle: newStyle, temporary: temporary } });
	}

	setObjectsMultiStyle(pipelineObjStyles, temporary) {
		this.store.dispatch({ type: "SET_OBJECTS_MULTI_STYLE", data: { pipelineObjStyles: pipelineObjStyles, temporary: temporary } });
	}

	setLinksStyle(pipelineLinkIds, newStyle, temporary) {
		this.store.dispatch({ type: "SET_LINKS_STYLE", data: { pipelineObjIds: pipelineLinkIds, newStyle: newStyle, temporary: temporary } });
	}

	setLinksMultiStyle(pipelineLinkStyles, temporary) {
		this.store.dispatch({ type: "SET_LINKS_MULTI_STYLE", data: { pipelineObjStyles: pipelineLinkStyles, temporary: temporary } });
	}

	getObjectStyle(objectId, temporary) {
		const obj = this.getObject(objectId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	// ---------------------------------------------------------------------------
	// Highlighting methods
	// ---------------------------------------------------------------------------

	getHighlightObjectIds(pipelineId, nodeIds, operator) {
		let highlightNodeIds = [];
		let highlightLinkIds = [];

		nodeIds.forEach((nodeId) => {
			if (this.getAPIPipeline(pipelineId).isSupernode(nodeId)) {
				highlightNodeIds = mergeWith(highlightNodeIds, this.getSupernodeNodeIds(nodeId, pipelineId), this.mergeWithUnion);
				highlightLinkIds = mergeWith(highlightLinkIds, this.getSupernodeLinkIds(nodeId, pipelineId), this.mergeWithUnion);
			}

			switch (operator) {
			case HIGHLIGHT_BRANCH:
				highlightNodeIds = mergeWith(highlightNodeIds, this.getNodeIdsInBranchContaining(nodeId, pipelineId), this.mergeWithUnion);
				highlightLinkIds = mergeWith(highlightLinkIds, this.getLinkIdsInBranchContaining(nodeId, pipelineId), this.mergeWithUnion);
				break;
			case HIGHLIGHT_UPSTREAM:
				highlightNodeIds = mergeWith(highlightNodeIds, this.getUpstreamNodeIdsFrom(nodeId, pipelineId), this.mergeWithUnion);
				highlightNodeIds[pipelineId] = union(highlightNodeIds[pipelineId], [nodeId]);
				highlightLinkIds = mergeWith(highlightLinkIds, this.getUpstreamLinkIdsFrom(nodeId, pipelineId), this.mergeWithUnion);
				break;
			case HIGHLIGHT_DOWNSTREAM:
				highlightNodeIds = mergeWith(highlightNodeIds, this.getDownstreamNodeIdsFrom(nodeId, pipelineId), this.mergeWithUnion);
				highlightNodeIds[pipelineId] = union(highlightNodeIds[pipelineId], [nodeId]);
				highlightLinkIds = mergeWith(highlightLinkIds, this.getDownstreamLinkIdsFrom(nodeId, pipelineId), this.mergeWithUnion);
				break;
			default:
			}
		});

		return {
			nodes: highlightNodeIds,
			links: highlightLinkIds
		};
	}

	// Returns an associative array of the supernode's subpipeline IDs to its node IDs.
	getSupernodeNodeIds(nodeId, pipelineId) {
		const supernodeNodeIds = [];
		const supernode = this.getAPIPipeline(pipelineId).getNode(nodeId);
		const supernodePipelineRef = this.getSupernodePipelineID(supernode);
		supernodeNodeIds[supernodePipelineRef] = this.getAPIPipeline(supernodePipelineRef).getNodeIds();

		const subPipelineIds = this.getDescendentPipelineIds(supernodePipelineRef);
		subPipelineIds.forEach((subPipelineId) => {
			supernodeNodeIds[subPipelineId] = this.getAPIPipeline(subPipelineId).getNodeIds();
		});
		return supernodeNodeIds;
	}

	// Returns an associative array of the supernode's subpipeline IDs to its link IDs.
	getSupernodeLinkIds(nodeId, pipelineId) {
		const getSupernodeLinkIds = [];
		const supernode = this.getAPIPipeline(pipelineId).getNode(nodeId);
		const supernodePipelineRef = this.getSupernodePipelineID(supernode);
		getSupernodeLinkIds[supernodePipelineRef] = this.getAPIPipeline(supernodePipelineRef).getLinkIds();

		const subPipelineIds = this.getDescendentPipelineIds(supernodePipelineRef);
		subPipelineIds.forEach((subPipelineId) => {
			getSupernodeLinkIds[subPipelineId] = this.getAPIPipeline(subPipelineId).getLinkIds();
		});
		return getSupernodeLinkIds;
	}

	getNodeIdsInBranchContaining(nodeId, pipelineId) {
		const upstreamNodes = this.getUpstreamNodeIdsFrom(nodeId, pipelineId);
		upstreamNodes[pipelineId].push(nodeId);
		const downstreamNodes = this.getDownstreamNodeIdsFrom(nodeId, pipelineId);
		return mergeWith(upstreamNodes, downstreamNodes, this.mergeWithUnion);
	}

	getLinkIdsInBranchContaining(nodeId, pipelineId) {
		const upstreamLinks = this.getUpstreamLinkIdsFrom(nodeId, pipelineId);
		const downstreamLinks = this.getDownstreamLinkIdsFrom(nodeId, pipelineId);
		return mergeWith(upstreamLinks, downstreamLinks, this.mergeWithUnion);
	}

	getUpstreamNodeIdsFrom(nodeId, pipelineId) {
		return this.getUpstreamObjIdsFrom(nodeId, pipelineId, "nodes");
	}

	getUpstreamLinkIdsFrom(nodeId, pipelineId) {
		return this.getUpstreamObjIdsFrom(nodeId, pipelineId, "links");
	}

	getUpstreamObjIdsFrom(nodeId, pipelineId, objectType) {
		let upstreamObjIds = [];
		if (typeof upstreamObjIds[pipelineId] === "undefined") {
			upstreamObjIds[pipelineId] = [];
		}
		const currentPipeline = this.getAPIPipeline(pipelineId);
		const node = currentPipeline.getNode(nodeId);
		const nodeLinks = currentPipeline.getLinksContainingTargetId(nodeId);
		if (nodeLinks.length > 0) {
			nodeLinks.forEach((link) => {
				if (link.type === NODE_LINK) {
					if (objectType === "nodes") {
						upstreamObjIds[pipelineId] = union(upstreamObjIds[pipelineId], [link.srcNodeId]);
					} else if (objectType === "links") {
						upstreamObjIds[pipelineId].push(link.id);
					}

					const srcNode = currentPipeline.getNode(link.srcNodeId);
					const srcNodeOutputPort = this.getSupernodeOutputPortForLink(srcNode, link);
					if (srcNodeOutputPort) {
						const subflowRef = srcNode.subflow_ref.pipeline_id_ref;
						if (typeof upstreamObjIds[subflowRef] === "undefined") {
							upstreamObjIds[subflowRef] = [];
						}
						const bindingNode = this.getAPIPipeline(subflowRef).getNode(srcNodeOutputPort.subflow_node_ref);
						if (bindingNode) {
							if (objectType === "nodes") {
								upstreamObjIds[subflowRef] = union(upstreamObjIds[subflowRef], [bindingNode.id]);
							}
							const subUpstreamObjs = this.getUpstreamObjIdsFrom(bindingNode.id, subflowRef, objectType);
							upstreamObjIds = mergeWith(upstreamObjIds, subUpstreamObjs, this.mergeWithUnion);
						}
					}

					const upstreamIds = this.getUpstreamObjIdsFrom(link.srcNodeId, pipelineId, objectType);
					upstreamObjIds = mergeWith(upstreamObjIds, upstreamIds, this.mergeWithUnion);
				}
			});
		} else if (currentPipeline.isEntryBindingNode(node)) {
			if (this.isSupernodeBinding(node)) {
				// Check if this is a binding node within a supernode.
				const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
				const parentPipelineId = supernodeObj.parentPipelineId;
				const parentPipeline = this.getAPIPipeline(parentPipelineId);
				const supernode = parentPipeline.getNode(supernodeObj.supernodeId);
				supernode.inputs.forEach((inputPort) => {
					if (inputPort.subflow_node_ref === nodeId) {
						const supernodeLinks = parentPipeline.getLinksContainingTargetId(supernode.id);
						supernodeLinks.forEach((supernodeLink) => {
							if (supernodeLink.trgNodePortId === inputPort.id) {
								if (typeof upstreamObjIds[parentPipelineId] === "undefined") {
									upstreamObjIds[parentPipelineId] = [];
								}
								if (objectType === "nodes") {
									upstreamObjIds[parentPipelineId] = union(upstreamObjIds[parentPipelineId], [supernodeLink.srcNodeId]);
								} else if (objectType === "links") {
									upstreamObjIds[parentPipelineId] = union(upstreamObjIds[parentPipelineId], [supernodeLink.id]);
								}
								// If srcNodeId is supernode, need to find the corresponding exit binding node.
								let upstreamIds = {};
								if (parentPipeline.isSupernode(supernodeLink.srcNodeId)) {
									if (objectType === "nodes") {
										upstreamObjIds[parentPipelineId] = union(upstreamObjIds[parentPipelineId], [supernodeLink.srcNodeId]);
									} else if (objectType === "links") {
										upstreamObjIds[parentPipelineId] = union(upstreamObjIds[parentPipelineId], [supernodeLink.id]);
									}
									const upstreamSupernode = parentPipeline.getNode(supernodeLink.srcNodeId);
									const upstreamSupernodeOutputPort = this.getSupernodeOutputPortForLink(upstreamSupernode, supernodeLink);
									if (upstreamSupernodeOutputPort) {
										const upstreamBindingNodeId = upstreamSupernodeOutputPort.subflow_node_ref;
										upstreamIds = this.getUpstreamObjIdsFrom(upstreamBindingNodeId, upstreamSupernode.subflow_ref.pipeline_id_ref, objectType);
									}
								} else {
									upstreamIds = this.getUpstreamObjIdsFrom(supernodeLink.srcNodeId, parentPipelineId, objectType);
								}
								upstreamObjIds = mergeWith(upstreamObjIds, upstreamIds, this.mergeWithUnion);
							}
						});
					}
				});
			} else if (objectType === "nodes") {
				upstreamObjIds[pipelineId] = union(upstreamObjIds[pipelineId], [nodeId]);
			}
		}
		return upstreamObjIds;
	}

	getDownstreamNodeIdsFrom(nodeId, pipelineId) {
		return this.getDownstreamObjIdsFrom(nodeId, pipelineId, "nodes");
	}

	getDownstreamLinkIdsFrom(nodeId, pipelineId) {
		return this.getDownstreamObjIdsFrom(nodeId, pipelineId, "links");
	}

	getDownstreamObjIdsFrom(nodeId, pipelineId, objectType) {
		let downstreamObjIds = [];
		if (typeof downstreamObjIds[pipelineId] === "undefined") {
			downstreamObjIds[pipelineId] = [];
		}
		const currentPipeline = this.getAPIPipeline(pipelineId);
		const node = currentPipeline.getNode(nodeId);
		const nodeLinks = currentPipeline.getLinksContainingSourceId(nodeId);
		if (nodeLinks.length > 0) {
			nodeLinks.forEach((link) => {
				if (link.type === NODE_LINK) {
					if (objectType === "nodes") {
						downstreamObjIds[pipelineId] = union(downstreamObjIds[pipelineId], [link.trgNodeId]);
					} else if (objectType === "links") {
						downstreamObjIds[pipelineId].push(link.id);
					}

					const trgNode = currentPipeline.getNode(link.trgNodeId);
					const trgNodeInputPort = this.getSupernodeInputPortForLink(trgNode, link);
					if (trgNodeInputPort) {
						const subflowRef = trgNode.subflow_ref.pipeline_id_ref;
						if (typeof downstreamObjIds[subflowRef] === "undefined") {
							downstreamObjIds[subflowRef] = [];
						}
						const bindingNode = this.getAPIPipeline(subflowRef).getNode(trgNodeInputPort.subflow_node_ref);
						if (bindingNode) {
							if (objectType === "nodes") {
								downstreamObjIds[subflowRef] = union(downstreamObjIds[subflowRef], [bindingNode.id]);
							}
							const subDownstreamObjs = this.getDownstreamObjIdsFrom(bindingNode.id, subflowRef, objectType);
							downstreamObjIds = mergeWith(downstreamObjIds, subDownstreamObjs, this.mergeWithUnion);
						}
					}

					const downstreamIds = this.getDownstreamObjIdsFrom(link.trgNodeId, pipelineId, objectType);
					downstreamObjIds = mergeWith(downstreamObjIds, downstreamIds, this.mergeWithUnion);
				}
			});
		} else if (currentPipeline.isExitBindingNode(node)) {
			if (this.isSupernodeBinding(node)) {
				const supernodeObj = this.getSupernodeObjReferencing(pipelineId);
				const parentPipelineId = supernodeObj.parentPipelineId;
				const parentPipeline = this.getAPIPipeline(parentPipelineId);
				const supernode = parentPipeline.getNode(supernodeObj.supernodeId);

				supernode.outputs.forEach((outputPort) => {
					if (outputPort.subflow_node_ref === nodeId) {
						const supernodeLinks = parentPipeline.getLinksContainingSourceId(supernode.id);
						supernodeLinks.forEach((supernodeLink) => {
							if (supernodeLink.srcNodePortId === outputPort.id) {
								if (typeof downstreamObjIds[parentPipelineId] === "undefined") {
									downstreamObjIds[parentPipelineId] = [];
								}
								if (objectType === "nodes") {
									downstreamObjIds[parentPipelineId] = union(downstreamObjIds[parentPipelineId], [supernodeLink.trgNodeId]);
								} else if (objectType === "links") {
									downstreamObjIds[parentPipelineId] = union(downstreamObjIds[parentPipelineId], [supernodeLink.id]);
								}

								let downstreamIds = {};
								if (parentPipeline.isSupernode(supernodeLink.trgNodeId)) {
									if (objectType === "nodes") {
										downstreamIds[parentPipelineId] = union(downstreamIds[parentPipelineId], [supernodeLink.trgNodeId]);
									} else if (objectType === "links") {
										downstreamIds[parentPipelineId] = union(downstreamIds[parentPipelineId], [supernodeLink.id]);
									}
									const downstreamSupernode = parentPipeline.getNode(supernodeLink.trgNodeId);
									const downstreamSupernodeInputPort = this.getSupernodeInputPortForLink(downstreamSupernode, supernodeLink);
									if (downstreamSupernodeInputPort) {
										const downstreamBindingNodeId = downstreamSupernodeInputPort.subflow_node_ref;
										downstreamIds = this.getDownstreamObjIdsFrom(downstreamBindingNodeId, downstreamSupernode.subflow_ref.pipeline_id_ref, objectType);
									}
								} else {
									downstreamIds = this.getDownstreamObjIdsFrom(supernodeLink.trgNodeId, parentPipelineId, objectType);
								}
								downstreamObjIds = mergeWith(downstreamObjIds, downstreamIds, this.mergeWithUnion);
							}
						});
					}
				});
			} else if (objectType === "nodes") {
				downstreamObjIds[pipelineId] = union(downstreamObjIds[pipelineId], [nodeId]);
			}
		}
		return downstreamObjIds;
	}

	// Returns an input port from the node passed in (provided it is a supernode) which is
	// referenced by the link passed in. Returns null if the node is not a supernode or the link
	// does not have a reference to one of the node's input ports.
	getSupernodeInputPortForLink(trgNode, link) {
		let port = null;
		if (has(trgNode, "subflow_ref.pipeline_id_ref") && link.trgNodePortId) {
			trgNode.inputs.forEach((inputPort) => {
				if (inputPort.id === link.trgNodePortId) {
					port = inputPort;
					return;
				}
			});
		}
		return port;
	}

	// Returns an output port from the node passed in (provided it is a supernode) which is
	// referenced by the link passed in. Returns null if the node is not a supernode or the link
	// does not have a reference to one of the node's output ports.
	getSupernodeOutputPortForLink(srcNode, link) {
		let port = null;
		if (has(srcNode, "subflow_ref.pipeline_id_ref") && link.srcNodePortId) {
			srcNode.outputs.forEach((outputPort) => {
				if (outputPort.id === link.srcNodePortId) {
					port = outputPort;
					return;
				}
			});
		}
		return port;
	}

	// Lodash mergeWith() Customizer function. Merge objects of arrays by taking the union.
	// ex: mergeWith({ a: [1, 2] }, {a: [2, 3], b: [1, 4] }) => { a: [1, 2, 3], b: [1, 4]}
	mergeWithUnion(objValue, srcValue) {
		return union(objValue, srcValue);
	}

	// Pythagorean Theorem.
	getDistanceFromPosition(x, y, node) {
		const a = node.x_pos - x;
		const b = node.y_pos - y;
		return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
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
	// Pipeline methods
	// ---------------------------------------------------------------------------
	zoomPipeline(zoom, translate) {
		this.store.dispatch({ type: "ZOOM_PIPELINE", data: { zoom: zoom }, pipelineId: this.pipelineId });
	}

	// ---------------------------------------------------------------------------
	// Node AND comment methods
	// ---------------------------------------------------------------------------

	moveObjects(data) {
		this.store.dispatch({ type: "MOVE_OBJECTS", data: data, pipelineId: this.pipelineId });
	}

	deleteObjects(source) {
		this.objectModel.executeWithSelectionChange((src) => {
			src.selectedObjectIds.forEach((selId) => {
				this.store.dispatch({ type: "DELETE_OBJECT", data: { id: selId }, pipelineId: this.pipelineId });
			});
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
	}

	getObjectStyle(objId, temporary) {
		const obj = this.getObject(objId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setObjectsClassName(objectIds, newClassName) {
		this.store.dispatch({ type: "SET_OBJECTS_CLASS_NAME", data: { objIds: objectIds, label: newClassName }, pipelineId: this.pipelineId });
	}

	disconnectObjects(source) {
		let linksToDelete = [];
		source.selectedObjectIds.forEach((id) => {
			// save all the links associated with each node, but don't store duplicate links
			const objectLinks = this.getLinksContainingId(id);
			objectLinks.forEach((objectLink) => {
				linksToDelete = this.pushUniqueLinks(objectLink, linksToDelete);
			});
		});
		const linkIdsToDelete = linksToDelete.map((link) => link.id);
		this.store.dispatch({ type: "DELETE_LINKS", data: { linkIds: linkIdsToDelete }, pipelineId: this.pipelineId });
		return linksToDelete;
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

	// Returns true if any corner of the node passed in overlaps any inNodes.
	// If list of inNodes is not passed in, return true if the node passed in is
	// on top of any existing nodes.
	overlapsNodes(node, inNodes) {
		let overlap = false;
		const surroundingNodes = inNodes ? inNodes : this.getNodes();
		surroundingNodes.forEach((canvasNode) => {
			const canvasNodeWidthX = canvasNode.x_pos + canvasNode.width;
			const canvasNodeHeightY = canvasNode.y_pos + canvasNode.height;
			if (node.id !== canvasNode.id &&
				(
					(node.x_pos === canvasNode.x_pos && node.y_pos === canvasNode.y_pos) || // Exactly overlaps.
					(node.x_pos >= canvasNode.x_pos && node.x_pos <= canvasNodeWidthX && // Top left corner of node.
						node.y_pos >= canvasNode.y_pos && node.y_pos <= canvasNodeHeightY) ||
					(node.x_pos + node.width > canvasNode.x_pos && node.x_pos + node.width < canvasNodeWidthX && // Top right corner of node
						node.y_pos > canvasNode.y_pos && node.y_pos < canvasNodeHeightY) ||
					(node.x_pos > canvasNode.x_pos && node.x_pos < canvasNodeWidthX && // Bottom left corner of node.
						node.y_pos + node.height > canvasNode.y_pos && node.y_pos + node.height < canvasNodeHeightY) ||
					(node.x_pos + node.width > canvasNode.x_pos && node.x_pos + node.width < canvasNodeWidthX && // Bottom right corner of node
						node.y_pos + node.height > canvasNode.y_pos && node.y_pos + node.height < canvasNodeHeightY)
				)
			) {
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
				"id": this.objectModel.getUniqueId(CREATE_NODE, { nodeType: nodeTemplate, pipelineId: this.pipelineId }),
				"x_pos": data.offsetX,
				"y_pos": data.offsetY
			});

			// Add node height and width and, if appropriate, inputPortsHeight
			// and outputPortsHeight and layout info.
			node = this.objectModel.setNodeAttributes(node, this.objectModel.getLayoutInfo());
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
				if (lastNodeAdded.outputs) {
					sourceNode = lastNodeAdded;
				} else if (nodesArray.length > 1) {
					var lastButOneNodeAdded = nodesArray[nodesArray.length - 2];
					if (lastButOneNodeAdded.outputs) {
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
		const initialMarginX = this.objectModel.getLayoutInfo().autoLayoutInitialMarginX;
		const initialMarginY = this.objectModel.getLayoutInfo().autoLayoutInitialMarginY;
		const horizontalSpacing = this.objectModel.getLayoutInfo().autoLayoutHorizontalSpacing;
		const verticalSpacing = this.objectModel.getLayoutInfo().autoLayoutVerticalSpacing;

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
		node = this.objectModel.setNodeAttributes(node, this.objectModel.getLayoutInfo());
		return node;
	}

	// Returns an array of nodes (that are in a format that conforms to the
	// schema) that can be added to a palette category. Each node is given
	// a new ID to make it unique within the palette.
	createNodesForPalette(selectedObjectIds) {
		const newNodes = [];
		selectedObjectIds.forEach((selObjId) => {
			let node = this.getNode(selObjId);
			if (node) {
				node = JSON.parse(JSON.stringify(node));
				node.id = this.objectModel.getUUID();
				node.x_pos = 0;
				node.y_pos = 0;
				node = PipelineOutHandler.createNode(node, []);
				if (node.type === SUPER_NODE) {
					if (!node.app_data) {
						node.app_data = {};
					}
					node.app_data.pipeline_data = this.objectModel.getSubPipelinesForSupernode(node);
				}
				newNodes.push(node);
			}
		});
		return newNodes;
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
				newNode.inputs &&
				srcNode.outputs &&
				newNode.inputs.length === 1 &&
				srcNode.outputs.length === 1 &&
				!this.isCardinalityExceeded(srcNode.outputs[0].id, newNode.inputs[0].id, srcNode, newNode)) {
			isLinkNeededWithAutoNode = true;
		}

		return isLinkNeededWithAutoNode;
	}

	isEntryBindingNode(node) {
		if (node.inputs && node.inputs.length > 0) {
			return false;
		}
		return true;
	}

	isExitBindingNode(node) {
		if (node.outputs && node.outputs.length > 0) {
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
		const srcHighlightGap = srcNode.layout.nodeHighlightGap;
		const trgHighlightGap = trgNode.layout.nodeHighlightGap;
		if (((srcNode.x_pos + srcNode.width + srcHighlightGap >= trgNode.x_pos - trgHighlightGap &&
					trgNode.x_pos + trgNode.width + trgHighlightGap >= srcNode.x_pos - srcHighlightGap) &&
					(srcNode.y_pos + srcNode.height + srcHighlightGap >= trgNode.y_pos - trgHighlightGap &&
						trgNode.y_pos + trgNode.height + trgHighlightGap >= srcNode.y_pos - srcHighlightGap))) {
			return true;
		}

		return false;
	}

	addNode(newNode) {
		if (newNode) {
			this.store.dispatch({ type: "ADD_NODE", data: { newNode: newNode }, pipelineId: this.pipelineId });
		}
	}

	// Add the newSupernode to canvasInfo and an array of newSubPipelines that it references.
	addSupernode(newSupernode, newSubPipelines) {
		const canvasInfo = this.objectModel.getCanvasInfo();
		let canvasInfoPipelines = this.objectModel.getCanvasInfo().pipelines.concat(newSubPipelines);

		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === this.pipelineId) {
				const newNodes = [
					...pipeline.nodes,
					newSupernode
				];
				return Object.assign({}, pipeline, { nodes: newNodes });
			}
			return pipeline;
		});
		const newCanvasInfo = Object.assign({}, canvasInfo, { pipelines: canvasInfoPipelines });
		this.objectModel.setCanvasInfo(newCanvasInfo);
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

	deleteSupernode(supernodeId) {
		let pipelineIds = [];
		const supernode = this.getNode(supernodeId);
		if (supernode) {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				pipelineIds = [supernode.subflow_ref.pipeline_id_ref];
				pipelineIds = pipelineIds.concat(this.objectModel.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));
			}
			this.store.dispatch({
				type: "DELETE_SUPERNODE",
				data: {
					id: supernode.id,
					pipelineIds: pipelineIds
				},
				pipelineId: this.pipelineId
			});
		}
	}

	getNodes() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes;
		}
		return [];
	}

	// Returns the IDs of all nodes in the pipeline.
	getNodeIds() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes.map((node) => node.id);
		}
		return [];
	}

	getNode(nodeId) {
		return this.getNodes().find((node) => {
			return (node.id === nodeId);
		});
	}

	getSupernodes(inNodes) {
		const supernodes = [];
		const listOfNodes = inNodes ? inNodes : this.getNodes();
		listOfNodes.forEach((node) => {
			if (node.type === SUPER_NODE) {
				supernodes.push(node);
			}
		});
		return supernodes;
	}

	isDataNode(objId) {
		const node = this.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	sizeAndPositionObjects(objectsInfo) {
		this.store.dispatch({ type: "SIZE_AND_POSITION_OBJECTS", data: { objectsInfo: objectsInfo }, pipelineId: this.pipelineId });
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	expandSuperNodeInPlace(nodeId, nodePositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: true });
		node = this.objectModel.setNodeAttributes(node, this.objectModel.getLayoutInfo());
		this.store.dispatch({
			type: "SET_SUPERNODE_FLAG",
			data: {
				node: node,
				nodePositions: nodePositions
			},
			pipelineId: this.pipelineId
		});
	}

	collapseSuperNodeInPlace(nodeId, nodePositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: false });
		node = this.objectModel.setNodeAttributes(node, this.objectModel.getLayoutInfo());
		this.store.dispatch({
			type: "SET_SUPERNODE_FLAG",
			data: {
				node: node,
				nodePositions: nodePositions
			},
			pipelineId: this.pipelineId
		});
	}

	isSuperNodeExpandedInPlace(nodeId) {
		return this.getNode(nodeId).is_expanded === true;
	}

	isSupernode(nodeId) {
		return this.getNode(nodeId).type === SUPER_NODE;
	}

	doesNodeHavePorts(node) {
		return node.inputs && node.inputs.length > 0;
	}

	getNodeParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.parameters : null);
	}

	getNodeUiParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.ui_parameters : null);
	}

	setNodeLabel(nodeId, newLabel) {
		this.store.dispatch({ type: "SET_NODE_LABEL", data: { nodeId: nodeId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setNodeDecorations(nodeId, newDecorations) {
		this.store.dispatch({ type: "SET_NODE_DECORATIONS", data: { nodeId: nodeId, decorations: this.ensureDecorationsHaveIds(newDecorations) }, pipelineId: this.pipelineId });
	}

	setInputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_INPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setOutputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setInputPortSubflowNodeRef(nodeId, portId, subflowNodeRef) {
		this.store.dispatch({ type: "SET_INPUT_PORT_SUBFLOW_NODE_REF", data: { nodeId: nodeId, portId: portId, subflowNodeRef: subflowNodeRef }, pipelineId: this.pipelineId });
	}

	setOutputPortSubflowNodeRef(nodeId, portId, subflowNodeRef) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_SUBFLOW_NODE_REF", data: { nodeId: nodeId, portId: portId, subflowNodeRef: subflowNodeRef }, pipelineId: this.pipelineId });
	}

	setNodeMessage(nodeId, message) {
		this.store.dispatch({ type: "SET_NODE_MESSAGE", data: { nodeId: nodeId, message: message }, pipelineId: this.pipelineId });
	}

	setNodeMessages(nodeId, messages) {
		this.store.dispatch({ type: "SET_NODE_MESSAGES", data: { nodeId: nodeId, messages: messages }, pipelineId: this.pipelineId });
	}

	setNodeUiParameters(nodeId, uiParameters) {
		this.store.dispatch({ type: "SET_NODE_UI_PARAMETERS", data: { nodeId: nodeId, ui_parameters: uiParameters }, pipelineId: this.pipelineId });
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

	getNodeDecorations(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.decorations : null);
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

	getNodeStyle(nodeId, temporary) {
		const node = this.getNode(nodeId);
		if (temporary) {
			return (node ? node.style_temp : null);
		}
		return (node ? node.style : null);
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
		let movedNodesInfo = {};
		if (layoutDirection === VERTICAL) {
			movedNodesInfo = this.dagreAutolayout(DAGRE_VERTICAL, canvasInfoPipeline);
		} else {
			movedNodesInfo = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasInfoPipeline);
		}

		this.sizeAndPositionObjects(movedNodesInfo);
	}

	dagreAutolayout(direction, canvasInfoPipeline) {
		const layoutInfo = this.objectModel.getLayoutInfo();

		var nodeLinks = canvasInfoPipeline.links.filter((link) => {
			return link.type === NODE_LINK || link.type === ASSOCIATION_LINK;
		});

		var edges = nodeLinks.map((link) => {
			return { "v": link.srcNodeId, "w": link.trgNodeId, "value": { "points": [] } };
		});

		var nodesData = canvasInfoPipeline.nodes.map((node) => {
			let newWidth = node.width;
			if (direction === DAGRE_HORIZONTAL) {
				newWidth = node.width +
					Math.max(this.getPaddingForNode(node, layoutInfo, canvasInfoPipeline), layoutInfo.autoLayoutHorizontalSpacing);
			}

			return { "v": node.id, "value": { width: newWidth, height: node.height } };
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

		const initialMarginX = layoutInfo.autoLayoutInitialMarginX;
		const initialMarginY = layoutInfo.autoLayoutInitialMarginY;
		const verticalSpacing = layoutInfo.autoLayoutVerticalSpacing;
		let horizontalSpacing = layoutInfo.autoLayoutHorizontalSpacing;
		if (direction === DAGRE_HORIZONTAL) {
			horizontalSpacing = 0;
		}

		var g = dagre.graphlib.json.read(inputGraph);
		g.graph().marginx = initialMarginX;
		g.graph().marginy = initialMarginY;
		if (direction === "TB") {
			g.graph().nodesep = horizontalSpacing; // distance to separate the nodes horizontally
			g.graph().ranksep = verticalSpacing; // distance to separate the ranks vertically
		} else {
			g.graph().nodesep = verticalSpacing; // distance to separate the nodes vertically
			g.graph().ranksep = horizontalSpacing; // distance to separate the ranks horizontally
		}
		dagre.layout(g);

		const outputGraph = dagre.graphlib.json.write(g);
		const movedNodesInfo = this.convertGraphToMovedNodes(outputGraph, canvasInfoPipeline.nodes);

		return movedNodesInfo;
	}

	// Returns an array of move node actions that can be used to reposition the
	// nodes based on the provided Dagre output graph. (The node width and height
	// are included in the output because the move nodes action expects them).
	convertGraphToMovedNodes(outputGraph, canvasInfoPipelineNodes) {
		const movedNodesInfo = [];
		const lookup = {};

		for (var i = 0, len = outputGraph.nodes.length; i < len; i++) {
			lookup[outputGraph.nodes[i].v] = outputGraph.nodes[i];
		}

		// When calculaing the new x_pos and y_pos of the node use the width (and
		// height) specified in the output graph. This will be the 'newWidth' which
		// includes the space for the connecting lines calculated earlier.
		canvasInfoPipelineNodes.forEach((node) => {
			movedNodesInfo[node.id] = {
				id: node.id,
				x_pos: lookup[node.id].value.x - (lookup[node.id].value.width / 2),
				y_pos: lookup[node.id].value.y - (lookup[node.id].value.height / 2),
				width: node.width,
				height: node.height
			};
		});
		return movedNodesInfo;
	}


	// Returns a width that can be added to the node width for auto-layout.
	// This extra width is what is needed to display the connection lines
	// without then doubling back on themselves.
	getPaddingForNode(node, layoutInfo, canvasInfoPipeline) {
		return CanvasUtils.getNodePaddingToTargetNodes(node,
			canvasInfoPipeline.nodes, canvasInfoPipeline.links, layoutInfo.linkType);
	}

	// Return the dimensions of the bounding rectangle for the listOfNodes.
	getBoundingRectForNodes(listOfNodes) {
		let xLeft = listOfNodes[0].x_pos;
		let yTop = listOfNodes[0].y_pos;
		let xRight = listOfNodes[0].width + xLeft;
		let yBot = listOfNodes[0].height + yTop;

		listOfNodes.forEach((node) => {
			xLeft = Math.min(xLeft, node.x_pos);
			yTop = Math.min(yTop, node.y_pos);
			xRight = Math.max(xRight, node.x_pos + node.width);
			yBot = Math.max(yBot, node.y_pos + node.height);
		});

		return {
			x: xLeft,
			y: yTop,
			width: xRight - xLeft,
			height: yBot - yTop
		};
	}

	ensureDecorationsHaveIds(newDecorations) {
		if (newDecorations) {
			return newDecorations.map((dec) => Object.assign({}, dec, { id: dec.id || this.objectModel.getUUID() }));
		}
		return newDecorations;
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

	getCommentStyle(commentId, temporary) {
		const comment = this.getComment(commentId);
		if (temporary) {
			return (comment ? comment.style_temp : null);
		}
		return (comment ? comment.style : null);
	}

	// ---------------------------------------------------------------------------
	// Link methods
	// ---------------------------------------------------------------------------

	createLink(trgNode, srcNode) {
		const linkId = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": srcNode, "targetNode": trgNode });
		let newLink = {
			id: linkId,
			srcNodeId: srcNode.id,
			trgNodeId: trgNode.id,
			type: NODE_LINK
		};

		if (srcNode.outputs && srcNode.outputs.length > 0) {
			newLink = Object.assign(newLink, { "srcNodePortId": srcNode.outputs[0].id });
		}
		if (trgNode.inputs && trgNode.inputs.length > 0) {
			newLink = Object.assign(newLink, { "trgNodePortId": trgNode.inputs[0].id });
		}

		return newLink;
	}

	deleteLink(link) {
		this.store.dispatch({ type: "DELETE_LINK", data: link, pipelineId: this.pipelineId });
	}

	deleteLinks(linksToDelete) {
		this.store.dispatch({ type: "DELETE_LINKS", data: { linkIds: linksToDelete }, pipelineId: this.pipelineId });
	}

	createNodeLinks(data) {
		const linkNodeList = [];
		data.nodes.forEach((srcInfo) => {
			data.targetNodes.forEach((trgInfo) => {
				const link = this.createNodeLink(srcInfo, trgInfo, data);
				if (link) {
					linkNodeList.push(link);
				}
			});
		});
		return linkNodeList;
	}

	createNodeLink(srcInfo, trgInfo, data) {
		if (this.isConnectionAllowed(srcInfo, trgInfo, data.type)) {
			const link = {};
			link.id = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": this.getNode(srcInfo.id), "targetNode": this.getNode(trgInfo.id) });
			link.type = data.type;
			link.srcNodeId = srcInfo.id;
			link.srcNodePortId = srcInfo.portId;
			link.trgNodeId = trgInfo.id;
			link.trgNodePortId = trgInfo.portId;
			if (data.class_name) {
				link.class_name = data.class_name;
			}
			if (data.linkName) {
				link.linkName = data.linkName;
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
					info.type = data.type;
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
	}

	getLinks() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.links;
		}
		return [];

	}

	// Returns the IDs of all links in the pipeline.
	getLinkIds() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.links.map((link) => link.id);
		}
		return [];
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
			if (link.type === NODE_LINK) {
				newLink.srcNodePortId = link.srcNodePortId;
				newLink.trgNodePortId = link.trgNodePortId;
			}
			return newLink;
		});
		return returnLinks;
	}

	// Takes in an array of objects and returns an array of links to those objects.
	getLinksContainingIds(idArray) {
		let linksArray = [];
		idArray.forEach((objId) => {
			const linksForId = this.getLinksContainingId(objId);
			if (linksForId.length > 0) {
				linksArray = linksArray.concat(linksForId);
			}
		});
		return linksArray;
	}

	getLinksContainingSourceId(id) {
		return this.getLinks().filter((link) => {
			return (link.srcNodeId === id);
		});
	}

	getLinksContainingTargetId(id) {
		return this.getLinks().filter((link) => {
			return (link.trgNodeId === id);
		});
	}

	// Returns an array of node links for the array of nodes passed in.
	getNodeLinks(inNodes) {
		const nodeLinks = [];
		inNodes.forEach((node) => {
			const allNodeLinks = this.getLinksContainingId(node.id);
			allNodeLinks.forEach((link) => {
				if (link.type === NODE_LINK || link.type === ASSOCIATION_LINK) {
					nodeLinks.push(link);
				}
			});
		});
		return nodeLinks;
	}

	getNodeDataLinkFromInfo(srcNodeId, srcPortId, trgNodeId, trgPortId) {
		const srcNodePortId = this.getDefaultSrcPortId(srcNodeId, srcPortId);
		const trgNodePortId = this.getDefaultTrgPortId(trgNodeId, trgPortId);
		if (!srcNodePortId || !trgNodePortId) {
			return null;
		}

		return this.getLinks().find((link) => {
			if (link.type === NODE_LINK) {
				const linkSrcNodePortId = this.getDefaultSrcPortId(link.srcNodeId, link.srcNodePortId);
				const linkTrgNodePortId = this.getDefaultTrgPortId(link.trgNodeId, link.trgNodePortId);
				return (link.srcNodeId === srcNodeId &&
								linkSrcNodePortId === srcNodePortId &&
								link.trgNodeId === trgNodeId &&
								linkTrgNodePortId === trgNodePortId);
			}
			return false;
		});
	}

	getCommentLinkFromInfo(id1, id2) {
		return this.getLinks().find((link) => {
			if (link.type === COMMENT_LINK) {
				return (link.srcNodeId === id1 &&
								link.trgNodeId === id2) ||
								(link.srcNodeId === id2 &&
								link.trgNodeId === id1);

			}
			return false;
		});
	}

	getNodeAssocLinkFromInfo(id1, id2) {
		return this.getLinks().find((link) => {
			if (link.type === ASSOCIATION_LINK) {
				return (link.srcNodeId === id1 &&
								link.trgNodeId === id2) ||
								(link.srcNodeId === id2 &&
								link.trgNodeId === id1);
			}
			return false;
		});
	}

	// Returns the source port ID for the source node passed in.
	getDefaultSrcPortId(srcNodeId, srcNodePortId) {
		if (!srcNodePortId) {
			const srcNode = this.getNode(srcNodeId);
			if (srcNode && srcNode.outputs && srcNode.outputs.length > 0) {
				return srcNode.outputs[0].id;
			}
		}
		return srcNodePortId;
	}

	// Returns the target port ID for the target node passed in.
	getDefaultTrgPortId(trgNodeId, trgNodePortId) {
		if (!trgNodePortId) {
			const trgNode = this.getNode(trgNodeId);
			if (trgNode && trgNode.inputs && trgNode.inputs.length > 0) {
				return trgNode.inputs[0].id;
			}
		}
		return trgNodePortId;
	}

	getLink(linkId) {
		return this.getLinks().find((link) => {
			return (link.id === linkId);
		});
	}

	getLinkStyle(linkId, temporary) {
		const obj = this.getLink(linkId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setLinksClassName(linkIds, newClassName) {
		this.store.dispatch({ type: "SET_LINKS_CLASS_NAME", data: { linkIds: linkIds, label: newClassName }, pipelineId: this.pipelineId });
	}

	setLinkDecorations(linkId, newDecorations) {
		this.store.dispatch({ type: "SET_LINK_DECORATIONS", data: { linkId: linkId, decorations: this.ensureDecorationsHaveIds(newDecorations) }, pipelineId: this.pipelineId });
	}

	getLinkDecorations(linkId) {
		var link = this.getLink(linkId);
		return (link ? link.decorations : null);
	}

	// Returns a Boolean to indicate if a link can be created or not between
	// two nodes identified by the objects provided.
	isConnectionAllowed(srcNodeInfo, trgNodeInfo, type) {
		if (type === ASSOCIATION_LINK) {
			return this.isConnectionAllowedAssoc(srcNodeInfo, trgNodeInfo);
		}
		return this.isConnectionAllowedPorts(srcNodeInfo, trgNodeInfo);
	}

	// Returns a Boolean to indicate if an regular port-port link can be created
	// or not between two nodes identified by the objects provided.
	isConnectionAllowedPorts(srcNodeInfo, trgNodeInfo) {
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

	// Returns a Boolean to indicate if an association link can be created or
	// not between two nodes identified by the objects provided.
	isConnectionAllowedAssoc(srcNodeInfo, trgNodeInfo) {
		const srcNode = this.getNode(srcNodeInfo.id);
		const trgNode = this.getNode(trgNodeInfo.id);


		if (!srcNode || !trgNode) { // Source ot target are not valid.
			return false;
		}

		if (srcNodeInfo.id === trgNodeInfo.id) { // Cannot connect to ourselves, currently.
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
			if (link.type === NODE_LINK) {
				if (link.srcNodeId === srcNode.id && srcPortId) {
					if (link.srcNodePortId === srcPortId ||
							(!link.srcNodePortId && this.isFirstPort(srcNode.outputs, srcPortId))) {
						srcCount++;
					}
				}

				if (link.trgNodeId === trgNode.id && trgPortId) {
					if (link.trgNodePortId === trgPortId ||
							(!link.trgNodePortId && this.isFirstPort(trgNode.inputs, trgPortId))) {
						trgCount++;
					}
				}
			}
		});

		if (srcCount > 0) {
			const srcPort = this.getPort(srcNode.outputs, srcPortId);
			if (srcPort &&
					srcPort.cardinality &&
					Number(srcPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					srcCount >= Number(srcPort.cardinality.max)) {
				return true;
			}
		}

		if (trgCount > 0) {
			const trgPort = this.getPort(trgNode.inputs, trgPortId);
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

	pushUniqueLinks(objectLink, linksToDelete) {
		if (linksToDelete.findIndex((linkToDelete) => linkToDelete.id === objectLink.id) === -1) {
			linksToDelete.push(objectLink);
		}
		return linksToDelete;
	}
}
