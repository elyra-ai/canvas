/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";

export default class CollapseSuperNodeInPlaceAction extends Action {
	constructor(data, objectModel, enableMoveNodesOnSupernodeResize) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldNodePositions = [];
		this.newNodePositions = [];
		this.enableMoveNodesOnSupernodeResize = enableMoveNodesOnSupernodeResize;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		if (this.enableMoveNodesOnSupernodeResize) {
			this.supernode = this.apiPipeline.getNode(this.data.id);

			this.apiPipeline.getNodes().forEach((node) => {
				if (node.id === this.supernode.id) {
					return; // Ignore the supernode
				}
				this.oldNodePositions[node.id] = { x_pos: node.x_pos, y_pos: node.y_pos };
			});

			CanvasUtils.moveSurroundingNodes(
				this.newNodePositions,
				this.supernode,
				this.apiPipeline.getNodes(),
				"se",
				this.supernode.layout.defaultNodeWidth,
				this.supernode.layout.defaultNodeHeight,
				false); // Pass false to indicate that node positions should not be updated.
		}
	}

	// Standard methods
	do() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id, this.newNodePositions);
	}

	undo() {
		this.apiPipeline.expandSuperNodeInPlace(this.data.id, this.oldNodePositions);
	}

	redo() {
		this.do();
	}
}
