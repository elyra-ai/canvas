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
import CanvasUtils from "../common-canvas/common-canvas-utils.js";

export default class AttachNodeToLinksAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.node = data.node;
		this.linksToUpdateInfo = CanvasUtils.getDetachedLinksToUpdate(
			this.node, this.data.detachedLinks, this.apiPipeline.getNodeDataLinks());
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.linksToUpdateInfo = this.linksToUpdateInfo;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: this.data.offsetX, offsetY: this.data.offsetY });
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.newLinks);
	}

	undo() {
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.oldLinks);
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: -this.data.offsetX, offsetY: -this.data.offsetY });
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.attachNodeToLinks", { node_label: this.node.label });
	}

}
