/*
 * Copyright 2017-2025 Elyra Authors
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

export default class SetNodeLabelAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.node = this.apiPipeline.getNode(data.nodeId);
		this.previousLabel = this.node.label;
	}

	// Standard methods
	do() {
		this.apiPipeline.setNodeLabel(this.data.nodeId, this.data.label);
	}

	undo() {
		this.apiPipeline.setNodeLabel(this.data.nodeId, this.previousLabel);
	}

	redo() {
		this.apiPipeline.setNodeLabel(this.data.nodeId, this.data.label);
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.setNodeLabel");
	}

	getFocusObject() {
		return this.node;
	}
}
