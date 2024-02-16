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

export default class CreateNodeLinkAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.actionLabel = this.createActionLabel();
	}

	getData() {
		this.data.linkIds = this.linkNodeList.map((link) => link.id);
		this.data.linkType = "data"; // Added for historical purposes - for WML Canvas support
		return this.data;
	}

	do() {
		if (this.data.replaceLink) {
			this.apiPipeline.deleteLink(this.data.replaceLink);
		}
		// Create links here because in a replace-link scenario we need to delete
		// the replaceLink before creating new links.
		this.linkNodeList = this.apiPipeline.createNodeLinks(this.data);
		this.apiPipeline.addLinks(this.linkNodeList);
	}

	undo() {
		this.linkNodeList.forEach((link) => {
			this.apiPipeline.deleteLink(link);
		});
		if (this.data.replaceLink) {
			this.apiPipeline.addLinks([this.data.replaceLink]);
		}
	}

	redo() {
		if (this.data.replaceLink) {
			this.apiPipeline.deleteLink(this.data.replaceLink);
		}
		this.apiPipeline.addLinks(this.linkNodeList);
	}

	getLabel() {
		return this.actionLabel;
	}

	createActionLabel() {
		const targetNodeLabel = this.getTargetNodeLabel();
		if (this.data.replaceLink) {
			return this.labelUtil.getActionLabel(this, "action.replaceNodeLink", { node_label: targetNodeLabel });
		}
		return this.labelUtil.getActionLabel(this, "action.createNodeLink", { node_label: targetNodeLabel });
	}

	// Returns the target node label. It makes sure the target node is there just
	// to be safe: it would be a bug if target node wasnt there. Also,
	// although targetNodes is an array this is a historical artifact and in
	// reality targetNodes will only even have one element.
	getTargetNodeLabel() {
		const targetNode = this.data.targetNodes && this.data.targetNodes.length > 0
			? this.apiPipeline.getNode(this.data.targetNodes[0].id)
			: {};
		return targetNode.label;
	}
}
