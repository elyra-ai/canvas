/*
 * Copyright 2024 Elyra Authors
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

import CanvasUtils from "../common-canvas/common-canvas-utils";
import { isEmpty } from "lodash";

import {
	SUPER_NODE,
	SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING,
} from "../common-canvas/constants/canvas-constants.js";

// Does all preparation needed for nodes in all pipelines before they are saved into Redux. This includes:
// * setting isSupernodeInputBinding and isSupernodeOutputBinding booleans if approrpiate
// * calculating snap-to-grid positions
// * calculating the dimensions of nodes based on the space needed to accomodate the ports
export function prepareNodes(pipelines, nodeLayout, canvasLayout, layoutHandler, supernode) {
	const newPipelines = setSupernodesBindingStatus(pipelines, supernode);
	return newPipelines.map((pipeline) => setPipelineObjectAttributes(pipeline, nodeLayout, canvasLayout, layoutHandler));
}

// Loops through all the pipelines and adds the appropriate supernode binding
// attribute to any binding nodes that are referenced by the ports of a supernode.
function setSupernodesBindingStatus(pipelines, supernode) {
	// First, clear all supernode binding statuses from nodes
	pipelines.forEach((pipeline) => {
		if (pipeline.nodes) {
			pipeline.nodes.forEach((node) => {
				delete node.isSupernodeInputBinding;
				delete node.isSupernodeOutputBinding;
			});
		}
	});

	if (supernode) {
		setSupernodesBindingStatusForNode(supernode, pipelines);
	}

	// Set the supernode binding statuses as appropriate.
	pipelines.forEach((pipeline) => {
		if (pipeline.nodes) {
			CanvasUtils.filterSupernodes(pipeline.nodes).forEach((node) => {
				setSupernodesBindingStatusForNode(node, pipelines);
			});
		}
	});
	return pipelines;
}


function setSupernodesBindingStatusForNode(node, pipelines) {
	const snPipelineId = CanvasUtils.getSupernodePipelineId(node);
	if (snPipelineId) {
		if (node.inputs) {
			node.inputs.forEach((input) => {
				if (input.subflow_node_ref) {
					const subNode = findNode(input.subflow_node_ref, snPipelineId, pipelines);
					if (subNode) {
						subNode.isSupernodeInputBinding = true;
					}
				}
			});
		}
		if (node.outputs) {
			node.outputs.forEach((output) => {
				if (output.subflow_node_ref) {
					const subNode = findNode(output.subflow_node_ref, snPipelineId, pipelines);
					if (subNode) {
						subNode.isSupernodeOutputBinding = true;
					}
				}
			});
		}
	}
}


// Sets the auto-calculated attributes for nodes and comments based on different layout
// informaiton for the pipeline passed in.
function setPipelineObjectAttributes(inPipeline, nodeLayout, canvasLayout, layoutHandler) {
	const pipeline = Object.assign({}, inPipeline);
	if (pipeline.nodes) {
		pipeline.nodes = pipeline.nodes.map((node) => setNodeAttributesWithLayout(node, nodeLayout, canvasLayout, layoutHandler));
	} else {
		pipeline.nodes = [];
	}

	if (pipeline.comments) {
		pipeline.comments = pipeline.comments.map((comment) => setCommentAttributesWithLayout(comment, canvasLayout));
	} else {
		pipeline.comments = [];
	}

	return pipeline;
}

// Returns a copy of the node passed in using the layout info provided. The
// returned node is augmented with additional fields which contain
// layout, dimension and supernode binding status info.
export function setNodeAttributesWithLayout(node, nodeLayout, canvasLayout, layoutHandler) {
	let newNode = Object.assign({}, node);
	newNode = setNodeLayoutAttributes(newNode, nodeLayout, layoutHandler);

	if (canvasLayout.linkDirection === "TopBottom" ||
			canvasLayout.linkDirection === "BottomTop") {
		newNode = setNodeDimensionAttributesVertical(newNode, canvasLayout);
	} else {
		newNode = setNodeDimensionAttributesHoriz(newNode, canvasLayout);
	}
	if (canvasLayout.snapToGridType === SNAP_TO_GRID_DURING ||
			canvasLayout.snapToGridType === SNAP_TO_GRID_AFTER) {
		newNode.x_pos = CanvasUtils.snapToGrid(newNode.x_pos, canvasLayout.snapToGridXPx);
		newNode.y_pos = CanvasUtils.snapToGrid(newNode.y_pos, canvasLayout.snapToGridYPx);
	}
	return newNode;
}

// Returns the node passed in with additional fields which contains
// the layout info.
function setNodeLayoutAttributes(node, nodeLayout, layoutHandler) {
	node.layout = nodeLayout;

	if (layoutHandler) {
		let customLayout = layoutHandler(node);

		// If using the layoutHandler we must make a copy of the layout info
		// for each node so the original single version of layout info attached
		// to the node doesn't get overwritten.
		if (customLayout && !isEmpty(customLayout)) {
			// TODO - This should be removed in a future major release.
			// This method converts now deprecated layout variables from customLayout
			// to the new port positions arrays for input and output ports.
			customLayout = CanvasUtils.convertPortPosInfo(customLayout);

			// TODO - This should be removed in a future major release.
			// This method converts now deprecated port object variables from customLayout
			// to the new port object info arrays for input and output ports.
			customLayout = CanvasUtils.convertPortDisplayInfo(customLayout);

			const decs = CanvasUtils.getCombinedDecorations(node.layout.decorations, customLayout.decorations);
			node.layout = Object.assign({}, node.layout, customLayout, { decorations: decs });
		}
	}
	return node;
}

// Returns the node passed in with additional fields which contains
// the height occupied by the input ports and output ports, based on the
// layout info passed in, as well as the node width.
function setNodeDimensionAttributesHoriz(node, canvasLayout) {
	node.inputPortsHeight = node.inputs ? getInputPortsHeight(node) : 0;
	node.outputPortsHeight = node.outputs ? getOutputPortsHeight(node) : 0;

	if (node.layout.autoSizeNode) {
		node.height = Math.max(node.inputPortsHeight, node.outputPortsHeight, node.layout.defaultNodeHeight);

	} else {
		node.height = node.layout.defaultNodeHeight;
	}

	node.width = node.layout.defaultNodeWidth;

	if (node.type === SUPER_NODE && node.is_expanded) {
		node.height += canvasLayout.supernodeTopAreaHeight + canvasLayout.supernodeSVGAreaPadding;
		// If an expanded height is provided make sure it is at least as big
		// as the node height.
		if (node.expanded_height) {
			node.expanded_height = Math.max(node.expanded_height, node.height);
		}

		node.width = CanvasUtils.getSupernodeExpandedWidth(node, canvasLayout);
		node.height = CanvasUtils.getSupernodeExpandedHeight(node, canvasLayout);

	} else if (node.isResized) {
		node.height = node.resizeHeight ? node.resizeHeight : node.height;
		node.width = node.resizeWidth ? node.resizeWidth : node.width;
	}

	return node;
}

// Returns the height of the input ports for the node if they are automatically
// positioned by common-canvas.
function getInputPortsHeight(node) {
	return (node.inputs.length * (node.layout.portArcRadius * 2)) +
		((node.inputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2);
}

// Returns the height of the output ports for the node if they are automatically
// positioned by common-canvas.
function getOutputPortsHeight(node) {
	return (node.outputs.length * (node.layout.portArcRadius * 2)) +
		((node.outputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2);
}

// Returns the node passed in with additional fields which contains
// the width occupied by the input ports and output ports, based on the
// layout info passed in, as well as the node height.
function setNodeDimensionAttributesVertical(node, canvasLayout) {
	node.inputPortsWidth = node.inputs ? getInputPortsWidth(node) : 0;
	node.outputPortsWidth = node.outputs ? getOutputPortsWidth(node) : 0;

	node.height = node.layout.defaultNodeHeight;

	if (node.layout.autoSizeNode) {
		node.width = Math.max(node.inputPortsWidth, node.outputPortsWidth, node.layout.defaultNodeWidth);

	} else {
		node.width = node.layout.defaultNodeWidth;
	}

	if (node.type === SUPER_NODE && node.is_expanded) {
		node.width += (2 * canvasLayout.supernodeSVGAreaPadding);
		// If an expanded width is provided make sure it is at least as big
		// as the node width.
		if (node.expanded_width) {
			node.expanded_width = Math.max(node.expanded_width, node.width);
		}

		node.width = CanvasUtils.getSupernodeExpandedWidth(node, canvasLayout);
		node.height = CanvasUtils.getSupernodeExpandedHeight(node, canvasLayout);

	} else if (node.isResized) {
		node.height = node.resizeHeight ? node.resizeHeight : node.height;
		node.width = node.resizeWidth ? node.resizeWidth : node.width;
	}

	return node;
}

// Returns the width of the input ports for the node if they are automatically
// positioned by common-canvas or zero if ports will be manually positioned..
function getInputPortsWidth(node) {
	return (node.inputs.length * (node.layout.portArcRadius * 2)) +
		((node.inputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2);
}

// Returns the width of the output ports for the node if they are automatically
// positioned by common-canvas or zero if ports will be manually positioned..
function getOutputPortsWidth(node) {
	return (node.outputs.length * (node.layout.portArcRadius * 2)) +
		((node.outputs.length - 1) * node.layout.portArcSpacing) + (node.layout.portArcOffset * 2);
}

function findNode(nodeId, pipelineId, pipelines) {
	const targetPipeline = pipelines.find((p) => p.id === pipelineId);

	if (targetPipeline && targetPipeline.nodes) {
		return targetPipeline.nodes.find((node) => node.id === nodeId);
	}
	return null;
}

// Returns a copy of the comment passed using the layout info provided. The
// returned comment has its position adjusted for snap to grid, if necessary.
export function setCommentAttributesWithLayout(comment, canvasLayout) {
	const newComment = Object.assign({}, comment);
	if (canvasLayout.snapToGridType === SNAP_TO_GRID_DURING ||
			canvasLayout.snapToGridType === SNAP_TO_GRID_AFTER) {
		newComment.x_pos = CanvasUtils.snapToGrid(newComment.x_pos, canvasLayout.snapToGridXPx);
		newComment.y_pos = CanvasUtils.snapToGrid(newComment.y_pos, canvasLayout.snapToGridYPx);
	}
	return newComment;
}
