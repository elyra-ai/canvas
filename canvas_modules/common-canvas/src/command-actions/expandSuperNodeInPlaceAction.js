/*
 * Copyright 2017-2019 IBM Corporation
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
import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";

export default class expandSuperNodeInPlaceAction extends Action {
	constructor(data, objectModel, enableMoveNodesOnSupernodeResize) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
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
				CanvasUtils.getSupernodeExpandedWidth(this.supernode, this.objectModel.getLayoutInfo()),
				CanvasUtils.getSupernodeExpandedHeight(this.supernode, this.objectModel.getLayoutInfo()),
				false); // Pass false to indicate that node positions should not be updated.
		}
	}

	// Standard methods
	do() {
		this.apiPipeline.expandSuperNodeInPlace(this.data.id, this.newNodePositions);
	}

	undo() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id, this.oldNodePositions);
	}

	redo() {
		this.do();
	}
}
