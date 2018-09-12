/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class expandSuperNodeInPlaceAction extends Action {
	constructor(data, objectModel, enableMoveNodesOnSupernodeResize) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.enableMoveNodesOnSupernodeResize = enableMoveNodesOnSupernodeResize;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		this.defaultNodePositions = [];
		this.newNodePositions = [];
		this.updatedNodes = [];

		if (this.enableMoveNodesOnSupernodeResize) {
			this.supernode = this.apiPipeline.getNode(this.data.id);
			this.nodes = this.apiPipeline.getNodes();

			this.supernodeUpdatedDimension = Object.assign({}, this.supernode, { width: this.supernode.expanded_width, height: this.supernode.expanded_height });

			// Only move surrounding nodes if there's not enough space to expand.
			const overlappedNodes = [];
			this.nodes.forEach((node) => {
				if (node.id === this.data.id) {
					return;
				}
				if (this.apiPipeline.overlapsNodes(node, [this.supernodeUpdatedDimension])) {
					overlappedNodes.push(node);
				}
			});

			const direction = this.getDirectionToMove(overlappedNodes);
			if (overlappedNodes.length > 0) {
				const deltaWidth = this.supernodeUpdatedDimension.width - this.supernode.width;
				const deltaHeight = this.supernodeUpdatedDimension.height - this.supernode.height;

				this.nodes.forEach((node) => {
					if (node.id === this.data.id) {
						return;
					}

					let positionUpdated = false;
					let newX = node.x_pos;
					let newY = node.y_pos;

					if (direction.indexOf("East") > -1 &&
						node.x_pos > this.supernode.x_pos && // Node is to the right of supernode left border.
						node.y_pos < this.supernode.y_pos + this.supernode.height && // Node is above supernode bottom border and below supernode top border.
						(node.y_pos - this.supernode.y_pos > 0 ||
							(node.y_pos + node.height) - this.supernode.y_pos > 0)) { // Need to subtract in case node is in negative coordinates.
						newX = node.x_pos + deltaWidth;
						positionUpdated = true;
					}

					if (direction.indexOf("South") > -1 &&
						node.y_pos > this.supernode.y_pos && // Node is below supernode top border.
						node.x_pos < this.supernode.x_pos + this.supernode.width && // Node is left of supernode right border and left of supernode right border.
						(node.x_pos - this.supernode.x_pos > 0 ||
							(node.x_pos + node.width) - this.supernode.x_pos > 0)) { // Need to subtract in case node is in negative coordinates.
						newY = node.y_pos + deltaHeight;
						positionUpdated = true;
					}

					if (direction.indexOf("Southeast") > -1 &&
						node.x_pos > this.supernode.x_pos + this.supernode.width && // Node is below supernode bottom border and right of supernode left border.
						node.y_pos > this.supernode.y_pos + this.supernode.width) {
						newX = node.x_pos + deltaWidth;
						newY = node.y_pos + deltaHeight;
						positionUpdated = true;
					}

					if (positionUpdated) {
						this.defaultNodePositions[node.id] = { x_pos: node.x_pos, y_pos: node.y_pos };
						const newNode = Object.assign({}, node, { x_pos: newX, y_pos: newY });
						this.newNodePositions[node.id] = newNode;
						this.updatedNodes.push(newNode);
					}
				});
			}
		}
	}

	// Determine if expanded supernode overlaps nodes below it, to the right of it, bottom right corner, or all.
	// Only move nodes in the direction needed: East | South | Southeast.
	getDirectionToMove(overlappedNodes) {
		let direction = "";
		overlappedNodes.forEach((overlappedNode) => {
			if (overlappedNode.x_pos > this.supernode.x_pos && // Node is to the right of supernode left border.
				overlappedNode.y_pos < this.supernode.y_pos + this.supernode.height && // Node is above supernode bottom border and below supernode top border.
				(overlappedNode.y_pos - this.supernode.y_pos > 0 ||
					(overlappedNode.y_pos + overlappedNode.height) - this.supernode.y_pos > 0)) { // Need to subtract in case node is in negative coordinates.
				// Only move right.
				direction = direction.indexOf("East") > -1 ? direction : direction.concat("East");
			} else if (overlappedNode.y_pos > this.supernode.y_pos && // Node is below supernode top border.
				overlappedNode.x_pos < this.supernode.x_pos + this.supernode.width && // Node is left of supernode right border and left of supernode right border.
				(overlappedNode.x_pos - this.supernode.x_pos > 0 ||
					(overlappedNode.x_pos + overlappedNode.width) - this.supernode.x_pos > 0)) { // Need to subtract in case node is in negative coordinates.
				// Only move down
				direction = direction.indexOf("South") > -1 ? direction : direction.concat("South");
			} else if (overlappedNode.x_pos > this.supernode.x_pos + this.supernode.width && // Node is below supernode bottom border and right of supernode left border.
				overlappedNode.y_pos > this.supernode.y_pos + this.supernode.width) {
				direction = direction.indexOf("Southeast") > -1 ? direction : direction.concat("Southeast");
			}
		});
		return direction;
	}

	// Standard methods
	do() {
		this.apiPipeline.expandSuperNodeInPlace(this.data.id, this.newNodePositions);
	}

	undo() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id, this.defaultNodePositions);
	}

	redo() {
		this.do();
	}
}
