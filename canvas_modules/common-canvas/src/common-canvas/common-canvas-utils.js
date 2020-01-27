/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// This class contains utility functions that may be used for both the canvas
// objects stored in redux and also the copy of canvas objects maintained by
// the CanvasRender objects.

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
	static getSupernodeExpandedWidth(supernode, layoutInfo) {
		return supernode.expanded_width ? supernode.expanded_width : Math.max(layoutInfo.supernodeDefaultWidth, supernode.width);
	}

	// Returns the expanded height for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended height to
	// change based on the node type selected (this is more for use in the test
	// harness than in a real application).
	static getSupernodeExpandedHeight(supernode, layoutInfo) {
		return supernode.expanded_height ? supernode.expanded_height : Math.max(layoutInfo.supernodeDefaultHeight, supernode.height);
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

		overlayDecs.forEach((od) => {
			const index = baseDecs.findIndex((bd) => bd.id === od.id);
			if (index === -1) {
				decs.push(od);
			}
		});

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


}
