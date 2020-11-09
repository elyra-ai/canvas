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

// This class contains utility functions that may be used for both the canvas
// objects stored in redux and also the copy of canvas objects maintained by
// the CanvasRender objects.

import { ASSOCIATION_LINK, NODE_LINK } from "../common-canvas/constants/canvas-constants.js";


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
	// straight should be drawn from. The line's direction originates from a
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

	// Returns true if a regular node-node data link can be created between the
	// two node/port combinations provided, given the current set of links
	// passed in.
	static isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, links) {

		if (!srcNode || !trgNode) { // Source ot target are not valid.
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

		if (this.isCardinalityAtMax(srcNodePortId, trgNodePortId, srcNode, trgNode, links)) {
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

		if (this.assocLinkAlreadyExists(srcNode, trgNode, links)) {
			return false;
		}

		return true;
	}

	// Returns true if an association link already exists between the two nodes
	// passed in given the set of links passd in.
	static assocLinkAlreadyExists(srcNode, trgNode, links) {
		let exists = false;

		links.forEach((link) => {
			if ((link.srcNodeId === srcNode.id && link.trgNodeId === trgNode.id) ||
					(link.srcNodeId === trgNode.id && link.trgNodeId === srcNode.id)) {
				exists = true;
			}
		});
		return exists;
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

		if (srcCount > 0) {
			const srcPort = this.getPort(srcNode.outputs, srcPortId);
			if (srcPort &&
					srcPort.cardinality &&
					Number(srcPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					srcCount >= Number(srcPort.cardinality.max)) {
				return true;
			}
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
	static getPort(portArray, portId) {
		const index = portArray.findIndex((port) => port.id === portId);

		if (index > -1) {
			return portArray[index];
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

	// Returns an array of info objects that describe how links need to be updated
	// during attach actions. The array is based on the array of
	// detached links passed in and has one entry for each detached link that can
	// be added to the node passed in. The output object contains the array of
	// new links and an array of the original links. allDataLinks is the array of
	// all node-node data links on the canvas.
	static getDetachedLinksToUpdate(node, detachedLinks, allNodeDataLinks) {
		const newLinks = [];
		const oldLinks = [];
		detachedLinks.forEach((link) => {
			if (link.nodeOverSrcPos && link.srcPos && node.outputs && node.outputs.length > 0) {
				node.outputs.forEach((output) => {
					if (this.isSrcConnectionAllowedWithDetachedLinks(output.id, node, allNodeDataLinks)) {
						const newLink = Object.assign({}, link, { srcNodeId: node.id, srcNodePortId: output.id });
						delete newLink.srcPos;
						newLinks.push(newLink);
						oldLinks.push(link);
					}
				});

			} else if (link.nodeOverTrgPos && link.trgPos && node.inputs && node.inputs.length > 0) {
				node.inputs.forEach((input) => {
					if (this.isTrgConnectionAllowedWithDetachedLinks(input.id, node, allNodeDataLinks)) {
						const newLink = Object.assign({}, link, { trgNodeId: node.id, trgNodePortId: input.id });
						delete newLink.trgPos;
						newLinks.push(newLink);
						oldLinks.push(link);
					}
				});
			}
		});
		return { newLinks, oldLinks };
	}


	// Returns an array of selected object IDs for nodes, comments and links
	// that are within the region provided. Links are only included if
	// includeLinks is truthy.
	static selectInRegion(region, pipeline, includeLinks) {
		var regionSelections = [];
		for (const node of pipeline.nodes) {
			if (!this.isSupernodeBinding(node) && // Don't include binding nodes in select
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

	// Returns true if the node passed in a binding node within a supernode's
	// subflow.
	static isSupernodeBinding(node) {
		return node.isSupernodeInputBinding || node.isSupernodeOutputBinding;
	}

	// Returns true if the node passd in is a binding node in a subflow
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

}
