/*
 * Copyright 2017-2026 Elyra Authors
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

import dagre from "dagre/dist/dagre.min.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";
import {
	NODE_LINK, ASSOCIATION_LINK, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL
} from "../common-canvas/constants/canvas-constants.js";

export default class LayoutDagre {

	// Performs Dagre auto-layout synchronously using dagre library
	// Static import required for backward compatibility - ensures synchronous execution
	static performLayout(canvasInfoPipeline, canvasLayout, canvasConfig, layoutDirection) {

		// Default to Dagre layout
		const direction = layoutDirection === VERTICAL ? DAGRE_VERTICAL : DAGRE_HORIZONTAL;

		var nodeLinks = canvasInfoPipeline.links.filter((link) =>
			link.type === NODE_LINK || link.type === ASSOCIATION_LINK);

		let nodesData = [];

		// Calculate some default dimensions for nodes.
		const layout = canvasConfig?.enableNodeLayout;
		const defaultWidth = layout?.defaultNodeWidth ? layout.defaultNodeWidth : 150;
		const defaultHeight = layout?.defaultNodeHeight ? layout.defaultNodeHeight : 80;

		// Create an array of edges, from the node links, to be passed to Dagre.
		// At the same time, for any semi-detached or fully-detached links we
		// create a temporary node so Dagre will also auto layout the ends of
		// detached links.
		var edges = nodeLinks.map((link) => {
			let srcNodeId = link.srcNodeId;
			let trgNodeId = link.trgNodeId;

			if (link.srcPos) {
				srcNodeId = "temp-src-node-" + link.id;
				nodesData.push({ "v": srcNodeId, "value": { width: defaultWidth, height: defaultHeight } });
			}

			if (link.trgPos) {
				trgNodeId = "temp-trg-node-" + link.id;
				nodesData.push({ "v": trgNodeId, "value": { width: defaultWidth, height: defaultHeight } });
			}
			return { "v": srcNodeId, "w": trgNodeId, "value": { "points": [] } };
		});

		// Add actual nodes to nodesData and adjust width if necessary
		nodesData = nodesData.concat(canvasInfoPipeline.nodes.map((node) => {
			let newWidth = node.width;
			if (direction === DAGRE_HORIZONTAL) {
				const padding = this.getPaddingForNode(node, canvasLayout, canvasInfoPipeline);
				newWidth = node.width +
					Math.max(padding, canvasLayout.autoLayoutHorizontalSpacing);
			}

			return { "v": node.id, "value": { width: newWidth, height: node.height } };
		}));

		// Possible values: TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
		// default TB for vertical layout
		// set to LR for horizontal layout
		var value = { };
		var directionList = ["TB", "BT", "LR", "RL"];
		if (directionList.indexOf(direction) >= 0) {
			value = { "rankDir": direction };
		}

		var inputGraph = { nodes: nodesData, edges: edges, value: value };

		const initialMarginX = canvasLayout.autoLayoutInitialMarginX;
		const initialMarginY = canvasLayout.autoLayoutInitialMarginY;
		const verticalSpacing = canvasLayout.autoLayoutVerticalSpacing;
		let horizontalSpacing = canvasLayout.autoLayoutHorizontalSpacing;
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
		const movedLinksInfo = this.convertGraphToMovedLinks(outputGraph);

		return { movedNodesInfo, movedLinksInfo };
	}

	// Returns an array of move node actions that can be used to reposition the
	// nodes based on the provided Dagre output graph. (The node width and height
	// are included in the output because the move nodes action expects them).
	static convertGraphToMovedNodes(outputGraph, canvasInfoPipelineNodes) {
		const movedNodesInfo = {};
		const lookup = {};

		for (var i = 0, len = outputGraph.nodes.length; i < len; i++) {
			lookup[outputGraph.nodes[i].v] = outputGraph.nodes[i];
		}

		// When calculating the new x_pos and y_pos of the node use the width (and
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

	// Returns an array of move link actions that can be used to reposition the
	// links based on the provided Dagre output graph.
	// Iterate nodes and check if there are any temporary nodes and if so,
	// use the x/y coordinates of those nodes as the start/end of the
	// corresponding detached link.
	static convertGraphToMovedLinks(outputGraph) {
		const movedLinksInfo = [];

		const outNodes = outputGraph.nodes;

		// Record the x and y position of temporary node to be assigned to the detached link.
		// A fully detached link can have both temp-src-node and temp-trg-node
		outNodes.forEach((node) => {
			if (node.v.startsWith("temp-src-node-")) {
				const linkId = node.v.split("temp-src-node-")[1];

				movedLinksInfo[linkId] = {
					srcPos: {
						x_pos: node.value.x - (node.value.width / 2),
						y_pos: node.value.y
					}
				};
			}
			if (node.v.startsWith("temp-trg-node-")) {
				const linkId = node.v.split("temp-trg-node-")[1];

				movedLinksInfo[linkId] = {
					// If it is a fully detached link include srcPos coordinates.
					...movedLinksInfo[linkId],
					trgPos: {
						x_pos: node.value.x - (node.value.width / 2),
						y_pos: node.value.y
					}
				};
			}
		});
		return movedLinksInfo;
	}

	// Returns a width that can be added to the node width for auto-layout.
	// This extra width is what is needed to display the connection lines
	// without then doubling back on themselves.
	static getPaddingForNode(node, layoutInfo, canvasInfoPipeline) {
		return CanvasUtils.getNodePaddingToTargetNodes(node,
			canvasInfoPipeline.nodes, canvasInfoPipeline.links, layoutInfo.linkType);
	}
}

// Refactored with Bob
