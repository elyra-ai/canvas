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
/* eslint arrow-body-style: ["off"] */

import { SUPER_NODE } from "../../../common-canvas/constants/canvas-constants.js";
import ports from "./ports.js";

export default (state = [], action) => {
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
