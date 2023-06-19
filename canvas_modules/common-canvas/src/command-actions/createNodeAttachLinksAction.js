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
import CanvasUtils from "../common-canvas/common-canvas-utils.js";

export default class CreateNodeAttachLinksAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.newNode = this.apiPipeline.createNode(data);
		this.linksToUpdateInfo = CanvasUtils.getDetachedLinksToUpdate(
			this.newNode, this.data.detachedLinks, this.apiPipeline.getNodeDataLinks());
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newNode = this.newNode;
		this.data.linksToUpdateInfo = this.linksToUpdateInfo;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.addNode(this.newNode);
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.newLinks);
	}

	undo() {
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.oldLinks);
		this.apiPipeline.deleteNodes([this.newNode]);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.createNodeAttachLinks", { node_label: this.newNode.label });
	}
}
