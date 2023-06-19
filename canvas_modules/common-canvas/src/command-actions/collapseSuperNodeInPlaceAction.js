/*
 * Copyright 2017-2023 Elyra Authors
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

export default class CollapseSuperNodeInPlaceAction extends Action {
	constructor(data, objectModel, labelUtil, enableMoveNodesOnSupernodeResize) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldObjectPositions = [];
		this.newObjectPositions = [];
		this.oldLinkPositions = [];
		this.newLinkPositions = [];
		this.enableMoveNodesOnSupernodeResize = enableMoveNodesOnSupernodeResize;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		if (this.enableMoveNodesOnSupernodeResize) {
			this.supernode = this.apiPipeline.getNode(this.data.id);

			this.oldObjectPositions = CanvasUtils.getObjectPositions(this.apiPipeline.getObjects());
			this.oldLinkPositions = CanvasUtils.getLinkPositions(this.apiPipeline.getLinks());

			this.newObjectPositions = CanvasUtils.moveSurroundingObjects(
				this.supernode,
				this.apiPipeline.getObjects(),
				"se",
				this.supernode.layout.defaultNodeWidth,
				this.supernode.layout.defaultNodeHeight,
				false); // Pass false to indicate that object positions should not be updated.

			this.newLinkPositions = CanvasUtils.moveSurroundingDetachedLinks(
				this.supernode,
				this.apiPipeline.getLinks(),
				"se",
				this.supernode.layout.defaultNodeWidth,
				this.supernode.layout.defaultNodeHeight,
				false); // Pass false to indicate that link positions should not be updated.
		}
	}

	// Standard methods
	do() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id, this.newObjectPositions, this.newLinkPositions);
	}

	undo() {
		this.apiPipeline.expandSuperNodeInPlace(this.data.id, this.oldObjectPositions, this.oldLinkPositions);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.collapseSuperNodeInPlace");
	}
}
