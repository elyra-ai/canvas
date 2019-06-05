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
	// change based on the node type selected (this is mre for use in the test
	// harness than in a real application).
	static getSupernodeExpandedWidth(supernode, layoutInfo) {
		return supernode.expanded_width ? supernode.expanded_width : Math.max(layoutInfo.supernodeDefaultWidth, supernode.width);
	}

	// Returns the expanded height for the supernode passed in. This might be
	// stored in the supernode itself or, if not, it needs to be calculated.
	// It may not be assigned to the supernode to allow the extended height to
	// change based on the node type selected (this is mre for use in the test
	// harness than in a real application).
	static getSupernodeExpandedHeight(supernode, layoutInfo) {
		return supernode.expanded_height ? supernode.expanded_height : Math.max(layoutInfo.supernodeDefaultHeight, supernode.height);
	}
}
