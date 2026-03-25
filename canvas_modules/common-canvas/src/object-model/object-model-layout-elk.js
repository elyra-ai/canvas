/*
 * Copyright 2026 Elyra Authors
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

import SvgCanvasPorts from "../common-canvas/svg-canvas-utils-ports.js";
import { NODE_LINK, COMMENT_LINK, VERTICAL, LINK_METHOD_FREEFORM } from "../common-canvas/constants/canvas-constants.js";

export default class LayoutELK {

	// Cached ELK instance to avoid repeated imports and instantiation
	static elkInstance = null;

	// Gets or creates the ELK instance (singleton pattern)
	static async getElkInstance() {
		if (!LayoutELK.elkInstance) {
			// Dynamically import ELK only when needed (code splitting)
			const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
			LayoutELK.elkInstance = new ELK();
		}
		return LayoutELK.elkInstance;
	}

	// Helper method to get node layout options based on link method
	// Returns "FREE" for Freeform links, "FIXED_POS" for port-based links
	static getNodeLayoutOptions(canvasConfig) {
		const portConstraints = canvasConfig?.enableLinkMethod === LINK_METHOD_FREEFORM ? "FREE" : "FIXED_POS";
		return { "elk.portConstraints": portConstraints };
	}

	// Performs ELK auto-layout asynchronously using elkjs library
	static async performLayout(canvasInfoPipeline, canvasLayout, canvasConfig, layoutDirection) {
		const elk = await LayoutELK.getElkInstance();

		// Set port positions and sizes for all nodes before creating ELK nodes
		canvasInfoPipeline.nodes.forEach((node) => {
			SvgCanvasPorts.setPortPositionsAndSizesForNode(node, canvasLayout);
		});

		// Get layout options based on link method configuration
		const nodeLayoutOptions = LayoutELK.getNodeLayoutOptions(canvasConfig);

		// Build children array from canvasInfoPipeline nodes
		const children = canvasInfoPipeline.nodes.map((node) =>
			LayoutELK.createElkNode(node, nodeLayoutOptions)
		);

		// Add comments from canvasInfoPipeline as ELK comment boxes
		const commentNodes = LayoutELK.createElkComments(canvasInfoPipeline.comments);
		children.push(...commentNodes);

		// Build edges array from canvasInfoPipeline links (both node links and comment links)
		// Also collect dummy nodes for detached link endpoints
		const { edges, dummyNodes } = LayoutELK.createElkEdgesWithDummyNodes(canvasInfoPipeline.links, canvasConfig, nodeLayoutOptions);

		// Add dummy nodes to children array so ELK will layout detached link endpoints
		children.push(...dummyNodes);

		// Get margin and spacing values from canvas layout
		const marginX = canvasLayout.autoLayoutInitialMarginX || 12;
		const marginY = canvasLayout.autoLayoutInitialMarginY || 12;

		// Determine ELK direction based on layoutDirection parameter
		const elkDirection = layoutDirection === VERTICAL ? "DOWN" : "RIGHT";

		// Graph data for ELK layout
		const graph = {
			id: "root",
			layoutOptions: {
				"elk.algorithm": "layered",
				"elk.direction": elkDirection,
				"elk.layered.nodePlacement.strategy": "INTERACTIVE",
				"elk.padding": `[top=${marginY},left=${marginX},bottom=${marginY},right=${marginX}]`,
				"elk.layered.spacing.nodeNodeBetweenLayers": 80, // Gap between layers within a group
				"elk.spacing.nodeNode": 80, // Minimum gap between
				"elk.spacing.componentComponent": 100, // Space between groups of nodes
				"elk.spacing.commentComment": 200, // Space between comments connected to the same node
				"elk.spacing.commentNode": 50 // Space between a node and its comments
			},
			children: children,
			edges: edges
		};

		// Uncomment for debug
		console.log("ELK Input Graph:", JSON.stringify(graph, null, 2));

		return elk.layout(graph)
			.then((layoutResult) => LayoutELK.processLayoutResult(layoutResult, canvasInfoPipeline))
			.catch((error) => {
				console.error("ELK Layout Error:", error);
				throw error;
			});
	}

	// Processes ELK layout result and converts it to movedNodesInfo format
	// Builds lookup maps for O(1) access and handles both nodes and comments
	static processLayoutResult(layoutResult, canvasInfoPipeline) {
		// Uncomment for debug
		console.log("ELK Output Layout:", JSON.stringify(layoutResult, null, 2));

		const movedNodesInfo = {};

		// Build lookup maps for O(1) access instead of O(n) find operations
		const nodeMap = new Map(canvasInfoPipeline.nodes.map((n) => [n.id, n]));
		const commentMap = new Map((canvasInfoPipeline.comments || []).map((c) => [c.id, c]));

		layoutResult.children.forEach((elkNode) => {
			// Skip dummy nodes (they're only for layout calculation)
			if (elkNode.id.startsWith("temp-src-node-") || elkNode.id.startsWith("temp-trg-node-")) {
				return;
			}

			// Look up the original node by ID using Map
			const originalNode = nodeMap.get(elkNode.id);
			if (originalNode) {
				movedNodesInfo[originalNode.id] = {
					id: originalNode.id,
					x_pos: elkNode.x,
					y_pos: elkNode.y,
					width: originalNode.width,
					height: originalNode.height
				};
			} else {
				// Check if it's a comment
				const originalComment = commentMap.get(elkNode.id);
				if (originalComment) {
					movedNodesInfo[originalComment.id] = {
						id: originalComment.id,
						x_pos: elkNode.x,
						y_pos: elkNode.y,
						width: originalComment.width,
						height: originalComment.height
					};
				}
			}
		});

		// Extract positions for detached links from dummy nodes
		const movedLinksInfo = LayoutELK.convertGraphToMovedLinks(layoutResult);

		return { movedNodesInfo, movedLinksInfo };
	}

	// Extracts positions for detached links from temporary dummy nodes in the layout result
	// Returns an array of link position updates for semi-detached or fully-detached links
	static convertGraphToMovedLinks(layoutResult) {
		const movedLinksInfo = [];

		layoutResult.children.forEach((elkNode) => {
			// Check for temporary source node (detached source end)
			if (elkNode.id.startsWith("temp-src-node-")) {
				const linkId = elkNode.id.split("temp-src-node-")[1];
				movedLinksInfo[linkId] = {
					srcPos: {
						x_pos: elkNode.x,
						y_pos: elkNode.y + (elkNode.height / 2)
					}
				};
			}
			// Check for temporary target node (detached target end)
			if (elkNode.id.startsWith("temp-trg-node-")) {
				const linkId = elkNode.id.split("temp-trg-node-")[1];
				movedLinksInfo[linkId] = {
					// If it's a fully detached link, include srcPos coordinates
					...movedLinksInfo[linkId],
					trgPos: {
						x_pos: elkNode.x,
						y_pos: elkNode.y + (elkNode.height / 2)
					}
				};
			}
		});

		return movedLinksInfo;
	}

	// Helper method to create ELK port objects from node ports
	// Converts from center coordinates (cx, cy) to top-left corner (x, y) for ELK
	static createElkPorts(ports, nodeId) {
		if (!ports?.length) {
			return [];
		}

		return ports.map((port) => ({
			id: `${nodeId}-${port.id}`,
			width: port.width,
			height: port.height,
			// Convert center position to top-left corner
			x: port.cx - (port.width / 2),
			y: port.cy - (port.height / 2),
			labels: [{ text: port.id }]
		}));
	}

	// Helper method to create a dummy node for detached link endpoints
	static createDummyNode(id, width, height, layoutOptions) {
		return {
			id,
			width,
			height,
			layoutOptions
		};
	}

	// Helper method to create ELK edges from canvas links with support for detached links
	// For semi-detached or fully-detached links, creates temporary dummy nodes
	// For comment links, only include the first link from each comment to ensure
	// comments only ever have one link from them to a node
	static createElkEdgesWithDummyNodes(links, canvasConfig, nodeLayoutOptions) {
		const commentLinksMap = new Map();
		const edges = [];
		const dummyNodes = [];

		// Get default dimensions for dummy nodes from config (same as dagre)
		const layout = canvasConfig?.enableNodeLayout;
		const defaultWidth = layout?.defaultNodeWidth ? layout.defaultNodeWidth : 150;
		const defaultHeight = layout?.defaultNodeHeight ? layout.defaultNodeHeight : 80;

		const filteredLinks = links.filter((link) => {
			if (link.type === NODE_LINK) {
				return true;
			} else if (link.type === COMMENT_LINK) {
				// Only include the first comment link from each source comment
				if (!commentLinksMap.has(link.srcNodeId)) {
					commentLinksMap.set(link.srcNodeId, true);
					return true;
				}
				return false;
			}
			return false;
		});

		filteredLinks.forEach((link) => {
			let srcNodeId = link.srcNodeId;
			let trgNodeId = link.trgNodeId;

			// Handle semi-detached link (detached source end)
			if (link.srcPos) {
				srcNodeId = `temp-src-node-${link.id}`;
				dummyNodes.push(LayoutELK.createDummyNode(srcNodeId, defaultWidth, defaultHeight, nodeLayoutOptions));
			}

			// Handle semi-detached link (detached target end)
			if (link.trgPos) {
				trgNodeId = `temp-trg-node-${link.id}`;
				dummyNodes.push(LayoutELK.createDummyNode(trgNodeId, defaultWidth, defaultHeight, nodeLayoutOptions));
			}

			// Create edge with appropriate source and target (real nodes or dummy nodes)
			edges.push({
				id: link.id,
				sources: [link.srcNodePortId && !link.srcPos ? `${srcNodeId}-${link.srcNodePortId}` : srcNodeId],
				targets: [link.trgNodePortId && !link.trgPos ? `${trgNodeId}-${link.trgNodePortId}` : trgNodeId]
			});
		});

		return { edges, dummyNodes };
	}

	// Helper method to create ELK comment nodes from canvas comments
	static createElkComments(comments) {
		if (!comments?.length) {
			return [];
		}

		return comments.map((comment) => ({
			id: comment.id,
			width: comment.width,
			height: comment.height,
			layoutOptions: {
				"elk.commentBox": "true"
			}
		}));
	}

	// Helper method to create an ELK node from a canvas node
	static createElkNode(node, layoutOptions) {
		const elkNode = {
			id: node.id,
			width: node.width,
			height: node.height,
			layoutOptions
		};

		// Add input and output ports if they exist
		// Use the positions and sizes set by setPortPositionsAndSizesForNode
		const ports = [
			...LayoutELK.createElkPorts(node.inputs, node.id),
			...LayoutELK.createElkPorts(node.outputs, node.id)
		];

		if (ports.length > 0) {
			elkNode.ports = ports;
		}

		return elkNode;
	}
}

// Made with Bob
