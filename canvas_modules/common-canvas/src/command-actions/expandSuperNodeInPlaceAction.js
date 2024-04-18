/*
 * Copyright 2017-2024 Elyra Authors
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
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.oldObjectPositions = [];
		this.newObjectPositions = [];
		this.oldLinkPositions = [];
		this.newLinkPositions = [];
		this.enableMoveNodesOnSupernodeResize = canvasController.getCanvasConfig().enableMoveNodesOnSupernodeResize;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.supernode = this.apiPipeline.getNode(this.data.id);

		if (this.enableMoveNodesOnSupernodeResize) {
			this.oldObjectPositions = CanvasUtils.getObjectPositions(this.apiPipeline.getObjects());
			this.oldLinkPositions = CanvasUtils.getLinkPositions(this.apiPipeline.getLinks());

			this.newObjectPositions = CanvasUtils.moveSurroundingObjects(
				this.supernode,
				this.apiPipeline.getObjects(),
				"se",
				CanvasUtils.getSupernodeExpandedWidth(this.supernode, this.objectModel.getCanvasLayout()),
				CanvasUtils.getSupernodeExpandedHeight(this.supernode, this.objectModel.getCanvasLayout()),
				false); // Pass false to indicate that object positions should not be updated.

			this.newLinkPositions = CanvasUtils.moveSurroundingDetachedLinks(
				this.supernode,
				this.apiPipeline.getLinks(),
				"se",
				CanvasUtils.getSupernodeExpandedWidth(this.supernode, this.objectModel.getCanvasLayout()),
				CanvasUtils.getSupernodeExpandedHeight(this.supernode, this.objectModel.getCanvasLayout()),
				false); // Pass false to indicate that link positions should not be updated.
		}
	}

	// Standard methods
	do() {
		// Make sure pipeline is loaded in case it is part of an external pipeline flow.
		this.objectModel.ensurePipelineIsLoaded(this.data);
		this.apiPipeline.expandSuperNodeInPlace(this.data.id, this.newObjectPositions, this.newLinkPositions);
	}

	undo() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id, this.oldObjectPositions, this.oldLinkPositions);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.expandSuperNodeInPlace", { node_label: this.supernode.label });
	}
}
