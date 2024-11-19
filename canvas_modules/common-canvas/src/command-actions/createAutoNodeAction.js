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

/***************************************************************************/
/* WARNING:                                                                */
/* This class is exported from Common Canvas. This means host apps can     */
/* extend the class and add to, or alter, this class's member variables.   */
/* So, if the names of any internal this.xxxx variables are changed that   */
/* needs to be communicated clearly through the release notes, Slack, etc. */
/***************************************************************************/

import Action from "../command-stack/action.js";

export default class CreateAutoNodeAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		const autoLinkOnlyFromSelNodes = canvasController.getCanvasConfig().enableAutoLinkOnlyFromSelNodes;
		this.srcNode = this.apiPipeline.getAutoSourceNode(autoLinkOnlyFromSelNodes);
		this.newNode = this.apiPipeline.createAutoNode(data, this.srcNode);
		this.newLink = null;
		if (this.data.addLink && this.apiPipeline.isLinkNeededWithAutoNode(this.newNode, this.srcNode)) {
			this.newLink = this.apiPipeline.createLink(this.newNode, this.srcNode);
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.sourceNode = this.srcNode;
		this.data.newNode = this.newNode;
		this.data.newLink = this.newLink;
		this.data.subPipeline = this.subPipelines;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.addNode(this.newNode);

		if (this.newLink) {
			this.apiPipeline.addLink(this.newLink);
		}

		this.objectModel.setSelections([this.newNode.id], this.data.pipelineId);
	}

	undo() {
		this.apiPipeline.deleteNodes([this.newNode]);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.createNode", { node_label: this.newNode.label });
	}
}
