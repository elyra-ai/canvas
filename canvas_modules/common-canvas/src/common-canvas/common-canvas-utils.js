/*
 * Copyright 2017-2020 Elyra Authors
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

// This class contains utility functions that may be used for both the canvas
// objects stored in redux and also the copy of canvas objects maintained by
// the CanvasRender objects.

import { get } from "lodash";
import { ASSOCIATION_LINK, NODE_LINK, SUPER_NODE }
	from "../common-canvas/constants/canvas-constants.js";


export default class CanvasUtils {

	static moveSurroundingNodes(newNodePositions, supernode, nodes, nodeSizingDirection, newWidth, newHeight, updateNodePos) {
		const oldWidth = supernode.width;
		const oldHeight = supernode.height;
		const deltaWidth = newWidth - oldWidth;
		const deltaHeight = newHeight - oldHeight;

		let xDelta;
		let yDelta;

		nodes.forEach((node) => {
			if (node.id === supernode.id) {
				return; // Ignore the supernode
			}

			xDelta = 0;
			yDelta = 0;

			if (nodeSizingDirection.indexOf("n") > -1 &&
					node.y_pos < supernode.y_pos + (supernode.height / 2)) {
				yDelta = -deltaHeight;

			} else if (nodeSizingDirection.indexOf("s") > -1 &&
									node.y_pos >= supernode.y_pos + (supernode.height / 2)) {
				yDelta = deltaHeight;
			}

			if (nodeSizingDirection.indexOf("w") > -1 &&
					node.x_pos < supernode.x_pos + (supernode.width / 2)) {
				xDelta = -deltaWidth;

			} else if (nodeSizingDirection.indexOf("e") > -1 &&
									node.x_pos >= supernode.x_pos + (supernode.width / 2)) {
				xDelta = deltaWidth;
			}

			if (xDelta !== 0 || yDelta !== 0) {
				const nodeObj = {
					id: node.id,
					x_pos: node.x_pos + xDelta,
					y_pos: node.y_pos + yDelta,
					width: node.width,
					height: node.height
				};

				this.addToNodeSizingArray(nodeObj, newNodePositions);

				if (updateNodePos) {
					node.x_pos += xDelta;
					node.y_pos += yDelta;
				}
			}
		});
	}

	static addToNodeSizingArray(nodeObj, newNodePositions) {
		newNodePositions[nodeObj.id] = {
			id: nodeObj.id,
			x_pos: nodeObj.x_pos,
			y_pos: nodeObj.y_pos,
			width: nodeObj.width,
			height: nodeObj.height
		};
	}

	// Returns the expanded width for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended width to
	// change based on the node type selected (this is more for use in the test
	// harness than in a real application).
	static getSupernodeExpandedWidth(supernode, canvasLayout) {
		return supernode.expanded_width ? supernode.expanded_width : Math.max(canvasLayout.supernodeDefaultWidth, supernode.width);
	}

	// Returns the expanded height for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended height to
	// change based on the node type selected (this is more for use in the test
	// harness than in a real application).
	static getSupernodeExpandedHeight(supernode, canvasLayout) {
		return supernode.expanded_height ? supernode.expanded_height : Math.max(canvasLayout.supernodeDefaultHeight, supernode.height);
	}

	// ---------------------------------------------------------------------------
	// The methods below calculate the padding needed to display connection lines
	// ---------------------------------------------------------------------------

	// Returns the maximum padding needed to display any elbow lines, that emanate
	// from the node passed in, to the set of target nodes passed in.
	static getNodePaddingToTargetNodes(node, targetNodes, links, linkType) {
		let padding = 0;
		if (linkType === "Elbow") {
			const maxIncrement = this.getCountOfLinksToTargetNodes(node, targetNodes, links) * node.layout.minInitialLineIncrement;
			padding = node.layout.minInitialLine + node.layout.minFinalLine + maxIncrement;
		} else {
			padding = 2 * node.layout.minInitialLine;
		}
		return padding;
	}

	// Returns the count of links from the node passed in to the set of target
	// nodes passed in.
	static getCountOfLinksToTargetNodes(node, targetNodes, links) {
		let count = 0;
		if (node.outputs && node.outputs.length > 0) {
			node.outputs.forEach((output) => {
				if (this.isNodeOutputLinkedToTargetNodes(node, output, targetNodes, links)) {
					count++;
				}
			});
		}
		return count;
	}

	// Returns true if the node and output passed in are linked to any of the
	// target nodes passed in.
	static isNodeOutputLinkedToTargetNodes(node, output, targetNodes, links) {
		let state = false;
		links.forEach((link) => {
			if (link.srcNodeId === node.id && link.srcNodePortId === output.id && this.isTargetNode(link.trgNodeId, targetNodes)) {
				state = true;
			}
		});
		return state;
	}

	// Returns true if the node identified by targetNodeId is in the set
	// of target nodes passed in.
	static isTargetNode(trgNodeId, targetNodes) {
		return targetNodes.findIndex((tn) => tn.id === trgNodeId) > -1;
	}

	// Returns an array of decorations that is a combination of the two input
	// arrays where the decorations from the overlayDecs array are overlaid on
	// top of those from the baseDecs array.
	static getCombinedDecorations(baseDecs = [], overlayDecs = []) {
		const decs = baseDecs.map((bd) => {
			const objDec = overlayDecs.find((od) => od.id === bd.id);
			if (objDec) {
				return Object.assign({}, bd, objDec);
			}
			return bd;
		});

		if (overlayDecs) {
			overlayDecs.forEach((od) => {
				const index = baseDecs.findIndex((bd) => bd.id === od.id);
				if (index === -1) {
					decs.push(od);
				}
			});
		}

		return decs;
	}

	// Returns true if either the Command Key on Mac or Control key on Windows
	// is pressed.
	static isCmndCtrlPressed(d3Event) {
		if (this.isMacintosh()) {
			return d3Event.metaKey;
		}
		return d3Event.ctrlKey;
	}

	// Returns whether user platform is Mac.
	static isMacintosh() {
		return navigator.platform.indexOf("Mac") > -1;
	}

	// Stops propagation of events and prevents any default behavior from
	// being executed.
	static stopPropagationAndPreventDefault(d3Event) {
		d3Event.stopPropagation();
		d3Event.preventDefault();
	}

	// Returns a snap-to-grid value for the value passed in based on a grid
	// size defined by the gridSize passed in.
	static snapToGrid(value, gridSize) {
		const div = value / gridSize;
		let abs = Math.trunc(div);
		const remainder = div - abs;

		if (remainder > 0.5) {
			abs++;
		}

		return abs * gridSize;
	}

	// Returns the coordinate position along the edge of a rectangle where a
	// straight line should be drawn from. The line's direction originates from a
	// point within the rectangle. The rectangle is described by the first four
	// paramters, the origin of the line's direction is described by
	// originX and originY which are an offset from the top left corener of
	// the rectangle and the end point of the line is described by endX and endY.
	static getOuterCoord(xPos, yPos, width, height, originX, originY, endX, endY) {
		const topLeft = { x: xPos, y: yPos };
		const topRight = { x: xPos + width, y: yPos };
		const botLeft = { x: xPos, y: yPos + height };
		const botRight = { x: xPos + width, y: yPos + height };
		const center = { x: originX + xPos, y: originY + yPos };

		var startPointX;
		var startPointY;

		// End point is to the right of center
		if (endX > center.x) {
			const topRightRatio = (center.y - topRight.y) / (center.x - topRight.x);
			const botRightRatio = (center.y - botRight.y) / (center.x - botRight.x);
			const ratioRight = (center.y - endY) / (center.x - endX);

			// North
			if (ratioRight < topRightRatio) {
				startPointX = center.x - (originY / ratioRight);
				startPointY = yPos;
			// South
			} else if (ratioRight > botRightRatio) {
				startPointX = center.x + ((height - originY) / ratioRight);
				startPointY = yPos + height;
			// East
			} else {
				startPointX = xPos + width;
				startPointY = center.y + (originX * ratioRight);
			}
		// End point is to the left of center
		} else {
			const topLeftRatio = (center.y - topLeft.y) / (center.x - topLeft.x);
			const botLeftRatio = (center.y - botLeft.y) / (center.x - botLeft.x);
			const ratioLeft = (center.y - endY) / (center.x - endX);

			// North
			if (ratioLeft > topLeftRatio) {
				startPointX = center.x - (originY / ratioLeft);
				startPointY = yPos;
			// South
			} else if (ratioLeft < botLeftRatio) {
				startPointX = center.x + ((height - originY) / ratioLeft);
				startPointY = yPos + height;
			// West
			} else {
				startPointX = xPos;
				startPointY = center.y - (originX * ratioLeft);
			}
		}

		return { x: startPointX, y: startPointY };
	}

	// Returns true if a link of type `type` can be created between the two
	// node/port combinations provided given the set of current links provided.
	static isConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links, type) {
		if (type === ASSOCIATION_LINK) {
			return this.isAssocConnectionAllowed(srcNode, trgNode, links);
		}
		return this.isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links);
	}

	// Returns true if a node-node data link can be created between the two
	// node/port combinations provided on a canvas where detached links are
	// allowed, given the set of current link provided.
	static isConnectionAllowedWithDetachedLinks(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {
		if (srcNode && trgNode && srcNode.id === trgNode.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		if (srcNode && trgNode && this.linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a connection is allowed to the source node and port
	// passed in given the set of current links.
	static isSrcConnectionAllowedWithDetachedLinks(srcNodePortId, srcNode, links) {
		if (srcNode && !this.doesNodeHaveOutputPorts(srcNode)) {
			return false;
		}

		if (srcNode && this.isSrcCardinalityAtMax(srcNodePortId, srcNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a connection is allowed to the target node and port
	// passed in given the set of current links.
	static isTrgConnectionAllowedWithDetachedLinks(trgNodePortId, trgNode, links) {
		if (trgNode && !this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (trgNode && this.isTrgCardinalityAtMax(trgNodePortId, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if the node has input ports.
	static doesNodeHaveInputPorts(node) {
		return node.inputs && node.inputs.length > 0;
	}

	// Returns true if the node has output ports.
	static doesNodeHaveOutputPorts(node) {
		return node.outputs && node.outputs.length > 0;
	}

	// Returns true if an existing link to the target node and port can be
	// replaced with a new link from the srcNode to the trgNode and trgPortId.
	static isDataLinkReplacementAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {

		if (!this.isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		// Link replacement is only allowed when the input port has a maximum
		// cardinality of one.
		if (this.getMaxCardinality(trgNodePortId, trgNode.inputs) !== 1) {
			return false;
		}

		if (!this.isTrgCardinalityAtMax(trgNodePortId, trgNode, links)) {
			return false;
		}
		return true;
	}

	// Returns true if a regular node-node data link can be created between the
	// two node/port combinations provided, given the current set of links
	// passed in.
	static isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {

		if (!this.isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		if (this.isCardinalityAtMax(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a regular node-node data link can be created between the
	// two node/port combinations provided, without checking on cardinalities of
	// the source or target nodes.
	static isDataConnectionAllowedNoCardinality(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {

		if (!srcNode || !trgNode) { // Source or target are not valid.
			return false;
		}

		if (srcNode.id === trgNode.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		if (!this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (this.linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if an association link can be created between two nodes
	// identified by the objects provided.
	static isAssocConnectionAllowed(srcNode, trgNode, links) {
		if (!srcNode || !trgNode) { // Source or target are not valid.
			return false;
		}

		if (srcNode.id === trgNode.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		// We don't check if the association link alrady exists because it makes
		// sense for some applications that multiple connctions bewteen nodes are
		// allowed. Uncomment this code if we decide to add a config variable
		// to allow this in the future.
		// if (this.assocLinkAlreadyExists(srcNode, trgNode, links)) {
		// 	return false;
		// }

		return true;
	}

	// Note - Uncomment this function if in the future we decide to enfore
	// preventing multiple association links to be created by providing a config
	// variable..
	// Returns true if an association link already exists between the two nodes
	// passed in given the set of links passed in.
	// static assocLinkAlreadyExists(srcNode, trgNode, links) {
	// 	let exists = false;
	//
	// 	links.forEach((link) => {
	// 		if ((link.srcNodeId === srcNode.id && link.trgNodeId === trgNode.id) ||
	// 				(link.srcNodeId === trgNode.id && link.trgNodeId === srcNode.id)) {
	// 			exists = true;
	// 		}
	// 	});
	// 	return exists;
	// }

	// Returns true if the source node passed in is available to be linked to the
	// target node and port passed in. trgNode and trgPortId may be undefined if
	// the call is being made while a detached link is being manipulated.
	static isSrcNodeAvailable(srcNode, trgNode, trgNodePortId, links) {
		// Don't disable the target node
		if (trgNode && trgNode.id === srcNode.id) {
			return true;
		}

		if (!this.doesNodeHaveOutputPorts(srcNode)) {
			return false;
		}

		if (this.isSrcNodePortsCardinalityAtMax(srcNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if the targt node passed in is available to be linked to the
	// source node and port passed in. srcNode and srcPortId may be undefined if
	// the call is being made while a detached link is being manipulated.
	static isTrgNodeAvailable(trgNode, srcNode, srcNodePortId, links) {
		// Don't disable the source node
		if (srcNode && srcNode.id === trgNode.id) {
			return true;
		}

		if (!this.doesNodeHaveInputPorts(trgNode)) {
			return false;
		}

		if (this.isTrgNodePortsCardinalityAtMax(trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if a link already exists from the source node and port to
	// the target node and port passed in given the set of links passd in.
	static linkAlreadyExists(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {
		let exists = false;

		links.forEach((link) => {
			if (link.srcNodeId === srcNode.id &&
					(!link.srcNodePortId || link.srcNodePortId === srcNodePortId) &&
					link.trgNodeId === trgNode.id &&
					(!link.trgNodePortId || link.trgNodePortId === trgNodePortId)) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns true if all the ports of the source node are at maximum cardinality.
	static isSrcNodePortsCardinalityAtMax(srcNode, links) {
		if (srcNode) {
			const index = srcNode.outputs.findIndex((output) => !this.isSrcCardinalityAtMax(output.id, srcNode, links));
			return index === -1;
		}
		return false;
	}

	// Returns true if all the ports of the target node are at maximum cardinality.
	static isTrgNodePortsCardinalityAtMax(trgNode, links) {
		if (trgNode) {
			const index = trgNode.inputs.findIndex((input) => !this.isTrgCardinalityAtMax(input.id, trgNode, links));
			return index === -1;
		}
		return false;
	}

	// Returns true if the cardinality is maxed out for the source and target
	// nodes and ports passed in. This means any additional connection would
	// not be allowed from either node/port combination.
	static isCardinalityAtMax(srcPortId, trgPortId, srcNode, trgNode, links) {
		return this.isSrcCardinalityAtMax(srcPortId, srcNode, links) ||
			this.isTrgCardinalityAtMax(trgPortId, trgNode, links);
	}

	// Returns true if the cardinality is maxed out for the source node and port
	// passed in. This means any additional connection would not be allowed
	// from this source node/port combination.
	static isSrcCardinalityAtMax(srcPortId, srcNode, links) {
		var srcCount = 0;

		links.forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.srcNodeId === srcNode.id && srcPortId) {
					if (link.srcNodePortId === srcPortId ||
							(!link.srcNodePortId && this.isFirstPort(srcNode.outputs, srcPortId))) {
						srcCount++;
					}
				}
			}
		});

		const maxCard = this.getMaxCardinality(srcPortId, srcNode.outputs);
		if (maxCard !== null && // Might be 0! So test explicitley for non null.
				maxCard !== -1 && // -1 indicates an infinite numder of ports are allowed
				srcCount >= maxCard) {
			return true;
		}

		return false;
	}

	// Returns true if the cardinality is maxed out for the taget node and port
	// passed in. This means any additional connection would not be allowed
	// to this target node/port combination.
	static isTrgCardinalityAtMax(trgPortId, trgNode, links) {
		var trgCount = 0;

		links.forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.trgNodeId === trgNode.id && trgPortId) {
					if (link.trgNodePortId === trgPortId ||
							(!link.trgNodePortId && this.isFirstPort(trgNode.inputs, trgPortId))) {
						trgCount++;
					}
				}
			}
		});

		const maxCard = this.getMaxCardinality(trgPortId, trgNode.inputs);
		if (maxCard !== null && // Might be 0! Yes believe it or not someone does set it to zero. So test explicitley for non null.
				maxCard !== -1 && // -1 indicates an infinite numder of ports are allowed
				trgCount >= maxCard) {
			return true;
		}

		return false;
	}

	// Returns true if the portId passed in specifies the first port in the
	// port array.
	static isFirstPort(portArray, portId) {
		const index = portArray.findIndex((port) => port.id === portId);

		if (index === 0) {
			return true;
		}
		return false;
	}

	// Returns the port from the port array indicated by the portId.
	static getPort(portId, portArray) {
		const index = portArray.findIndex((port) => port.id === portId);

		if (index > -1) {
			return portArray[index];
		}
		return null;
	}

	// Returns the maximum cardinality, if one exists, for the port ID passed in
	// from the array of ports provided.
	static getMaxCardinality(portId, ports) {
		const port = this.getPort(portId, ports);
		if (port &&
				port.cardinality) {
			return Number(port.cardinality.max);
		}
		return null;
	}

	// Returns true if a connection is allowed from a comment to a target node,
	// given the set of links passed in. At the moment this is only restricted
	// if a current link exists between the two.
	static isCommentLinkConnectionAllowed(commentId, trgNodeId, links) {
		return !this.commentLinkAlreadyExists(commentId, trgNodeId, links);
	}

	// Returns true if a comment link already exists from the source comment
	// to the target node, given the set of links passed in.
	static commentLinkAlreadyExists(commentId, trgNodeId, links) {
		let exists = false;

		links.forEach((link) => {
			if (link.srcNodeId === commentId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns an object containing two arrays: old links and new links. There is
	// one new link in the new links array for each old link in the old links
	// array. The new links have their properties adjusted so they are attached
	// to the first found output or input port, that is not maxed out with respect
	// to its maximum cardinality, of the provided node. The allDataLinks
	// parameter is the array of all node-node data links on the canvas.
	static getDetachedLinksToUpdate(node, detachedLinks, allNodeDataLinks) {
		const newLinks = [];
		const oldLinks = [];
		detachedLinks.forEach((link) => {
			if (link.nodeOverSrcPos && link.srcPos && node.outputs && node.outputs.length > 0) {
				let connected = false;
				node.outputs.forEach((output) => {
					if (connected === false &&
							this.isSrcConnectionAllowedWithDetachedLinks(output.id, node, this.getReplacedLinks(allNodeDataLinks, newLinks))) {
						const newLink = Object.assign({}, link, { srcNodeId: node.id, srcNodePortId: output.id });
						delete newLink.srcPos;
						newLinks.push(newLink);
						oldLinks.push(link);
						connected = true;
					}
				});

			} else if (link.nodeOverTrgPos && link.trgPos && node.inputs && node.inputs.length > 0) {
				let connected = false;
				node.inputs.forEach((input) => {
					if (connected === false &&
							this.isTrgConnectionAllowedWithDetachedLinks(input.id, node, this.getReplacedLinks(allNodeDataLinks, newLinks))) {
						const newLink = Object.assign({}, link, { trgNodeId: node.id, trgNodePortId: input.id });
						delete newLink.trgPos;
						newLinks.push(newLink);
						oldLinks.push(link);
						connected = true;
					}
				});
			}
		});
		return { newLinks, oldLinks };
	}

	// Returns an array which is a copy of the allNodeDataLinks array but with
	// any elements replaced from the newLinks array if those elements have the same ID.
	static getReplacedLinks(allNodeDataLinks, newLinks) {
		return allNodeDataLinks.map((link) => {
			const index = newLinks.findIndex((nl) => nl.id === link.id);
			return index > -1 ? newLinks[index] : link;
		});
	}

	// Returns an array of selected object IDs for nodes, comments and links
	// that are within the region provided. Links are only included if
	// includeLinks is truthy.
	static selectInRegion(region, pipeline, includeLinks) {
		var regionSelections = [];
		for (const node of pipeline.nodes) {
			if (!this.isSuperBindingNode(node) && // Don't include binding nodes in select
					region.x1 < node.x_pos + node.width &&
					region.x2 > node.x_pos &&
					region.y1 < node.y_pos + node.height &&
					region.y2 > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of pipeline.comments) {
			if (region.x1 < comment.x_pos + comment.width &&
					region.x2 > comment.x_pos &&
					region.y1 < comment.y_pos + comment.height &&
					region.y2 > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		if (includeLinks) {
			for (const link of pipeline.links) {
				let srcInRegion = false;
				if ((link.srcPos && this.isPosInArea(link.srcPos, region, 0)) ||
						this.isSelected(link.srcNodeId, regionSelections)) {
					srcInRegion = true;
				}
				let trgInRegion = false;
				if ((link.trgPos && this.isPosInArea(link.trgPos, region, 0)) ||
						this.isSelected(link.trgNodeId, regionSelections)) {
					trgInRegion = true;
				}
				if (srcInRegion && trgInRegion) {
					regionSelections.push(link.id);
				}
			}
		}

		return regionSelections;
	}

	// Returns true if the ID passed in is in the array.
	static isSelected(nodeId, array) {
		return array.findIndex((id) => id === nodeId) !== -1;
	}

	// Return true if the position provided is within the area provided.
	static isPosInArea(pos, area, pad) {
		return pos.x_pos > area.x1 - pad &&
			pos.x_pos < area.x2 + pad &&
			pos.y_pos > area.y1 - pad &&
			pos.y_pos < area.y2 + pad;
	}

	// Returns true if the node passed in is a binding node in a subflow
	// for a supernode.
	static isSuperBindingNode(d) {
		return d.isSupernodeInputBinding || d.isSupernodeOutputBinding;
	}

	// Returns an object containing the dimensions of an imaginary rectangle
	// surrounding the nodes and comments and links passed in or null if
	// no valid objects were provided.
	static getCanvasDimensions(nodes, comments, links, commentHighlightGap) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		if (nodes) {
			nodes.forEach((d) => {
				if (this.isSuperBindingNode(d)) { // Always ignore Supernode binding nodes
					return;
				}
				canvLeft = Math.min(canvLeft, d.x_pos - d.layout.nodeHighlightGap);
				canvTop = Math.min(canvTop, d.y_pos - d.layout.nodeHighlightGap);
				canvRight = Math.max(canvRight, d.x_pos + d.width + d.layout.nodeHighlightGap);
				canvBottom = Math.max(canvBottom, d.y_pos + d.height + d.layout.nodeHighlightGap);
			});
		}

		if (comments) {
			comments.forEach((d) => {
				canvLeft = Math.min(canvLeft, d.x_pos - commentHighlightGap);
				canvTop = Math.min(canvTop, d.y_pos - commentHighlightGap);
				canvRight = Math.max(canvRight, d.x_pos + d.width + commentHighlightGap);
				canvBottom = Math.max(canvBottom, d.y_pos + d.height + commentHighlightGap);
			});
		}

		// Take into account semi-detached and fully-detached links, if any.
		if (links) {
			links.forEach((link) => {
				if (link.srcPos) {
					canvLeft = Math.min(canvLeft, link.srcPos.x_pos);
					canvTop = Math.min(canvTop, link.srcPos.y_pos);
					canvRight = Math.max(canvRight, link.srcPos.x_pos);
					canvBottom = Math.max(canvBottom, link.srcPos.y_pos);
				}
				if (link.trgPos) {
					canvLeft = Math.min(canvLeft, link.trgPos.x_pos);
					canvTop = Math.min(canvTop, link.trgPos.y_pos);
					canvRight = Math.max(canvRight, link.trgPos.x_pos);
					canvBottom = Math.max(canvBottom, link.trgPos.y_pos);
				}
			});
		}
		const canvWidth = canvRight - canvLeft;
		const canvHeight = canvBottom - canvTop;

		if (canvLeft === Infinity || canvTop === Infinity ||
				canvRight === -Infinity || canvBottom === -Infinity) {
			return null;
		}

		return {
			left: canvLeft,
			top: canvTop,
			right: canvRight,
			bottom: canvBottom,
			width: canvWidth,
			height: canvHeight
		};
	}

	// Returns a subset of links from the links passed in which connect to
	// the target node and port passed in.
	static getDataLinksConnectedTo(trgPortId, trgNode, links) {
		const defTrgPortId = this.getDefaultInputPortId(trgNode);

		return links.filter((link) => {
			if (link.type === NODE_LINK) {
				const linkTrgPortId = link.trgNodePortId || defTrgPortId;
				return link.trgNodeId === trgNode.id && linkTrgPortId === trgPortId;
			}
			return false;
		});
	}

	// Returns the default input port ID for the node, which will be the ID of
	// the first port, or null if there are no inputs.
	static getDefaultInputPortId(node) {
		return (node.inputs && node.inputs.length > 0 ? node.inputs[0].id : null);
	}

	// Returns the default output port ID for the node, which will be the ID of
	// the first port, or null if there are no outputs.
	static getDefaultOutputPortId(node) {
		return (node.outputs && node.outputs.length > 0 ? node.outputs[0].id : null);
	}

	// Returns a full style string value that can be applied as an in-line style to
	// the representation of the object in the DOM. The style is based either
	// on the 'style' or 'style_temp' property of the object.
	// Parameters:
	// d - The object
	// part - A string of the part of the object to be styled. eg 'body' or 'image'
	//        This is dependent on the style spec in eiether the 'style' or
	//        'temp_style' property.
	// type = Either 'hover' or 'default'
	static getObjectStyle(d, part, type) {
		if (!d.style && !d.style_temp) {
			return null;
		}
		let style = null;

		if (type === "hover") {
			style = this.getStyleValue(d, part, "default") + ";" + this.getStyleValue(d, part, "hover");

		} else if (type === "default") {
			style = this.getStyleValue(d, part, "default");
		}
		return style;
	}

	static getStyleValue(d, part, type) {
		const style = get(d, `style_temp.${part}.${type}`, null);
		if (style !== null) {
			return style;
		}
		return get(d, `style.${part}.${type}`, null);
	}

	// Returns a subset array of supernodes from the nodes passed in.
	static filterSupernodes(inNodes) {
		return inNodes.filter((n) => n.type === SUPER_NODE);
	}

	// Returns a source position object, with x_pos and y_pos fields, that
	// decribes where a link line would be drawn from if the link's source node
	// did not exist. This is useful when doing operations (such as delete or
	// cut/copy) that cause semi-detached or fully detached links to be created.
	static getSrcPos(link, apiPipeline) {
		const srcNode = apiPipeline.getNode(link.srcNodeId);
		let outerCenterX;
		let outerCenterY;
		if (link.trgNodeId) {
			const trgNode = apiPipeline.getNode(link.trgNodeId);
			outerCenterX = trgNode.x_pos + (trgNode.width / 2);
			outerCenterY = trgNode.y_pos + (trgNode.height / 2);
		} else {
			outerCenterX = link.trgPos.x_pos;
			outerCenterY = link.trgPos.y_pos;
		}

		let srcCenterX;
		let srcCenterY;

		if (srcNode.layout && srcNode.layout.drawNodeLinkLineFromTo === "image_center") {
			srcCenterX = srcNode.layout.imagePosX + (srcNode.layout.imageWidth / 2);
			srcCenterY = srcNode.layout.imagePosY + (srcNode.layout.imageHeight / 2);

		} else {
			srcCenterX = srcNode.width / 2;
			srcCenterY = srcNode.height / 2;
		}

		const startPos = CanvasUtils.getOuterCoord(
			srcNode.x_pos, srcNode.y_pos, srcNode.width, srcNode.height,
			srcCenterX, srcCenterY, outerCenterX, outerCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}

	// Returns a target position object, with x_pos and y_pos fields, that
	// decribes where a link line would be drawn from if the link's target node
	// did not exist. This is useful when doing operations (such as delete or
	// cut/copy) that cause semi-detached or fully detached links to be created.
	static getTrgPos(link, apiPipeline) {
		const trgNode = apiPipeline.getNode(link.trgNodeId);

		let outerCenterX;
		let outerCenterY;
		if (link.srcNodeId) {
			const srcNode = apiPipeline.getNode(link.srcNodeId);
			outerCenterX = srcNode.x_pos + (srcNode.width / 2);
			outerCenterY = srcNode.y_pos + (srcNode.height / 2);
		} else {
			outerCenterX = link.srcPos.x_pos;
			outerCenterY = link.srcPos.y_pos;
		}

		let trgCenterX;
		let trgCenterY;

		if (trgNode.layout && trgNode.layout.drawNodeLinkLineFromTo === "image_center") {
			trgCenterX = trgNode.layout.imagePosX + (trgNode.layout.imageWidth / 2);
			trgCenterY = trgNode.layout.imagePosY + (trgNode.layout.imageHeight / 2);

		} else {
			trgCenterX = trgNode.width / 2;
			trgCenterY = trgNode.height / 2;
		}

		const startPos = CanvasUtils.getOuterCoord(
			trgNode.x_pos, trgNode.y_pos, trgNode.width, trgNode.height,
			trgCenterX, trgCenterY, outerCenterX, outerCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}


}
