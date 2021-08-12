/*
 * Copyright 2017-2020 Elyra Authors
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
/* eslint no-lonely-if: ["off"] */

import Action from "../command-stack/action.js";
import { SUPER_NODE } from "../common-canvas/constants/canvas-constants.js";

export default class CreateAutoNodeAction extends Action {
	constructor(data, objectModel, autoLinkOnlyFromSelNodes) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.srcNode = this.apiPipeline.getAutoSourceNode(autoLinkOnlyFromSelNodes);
		this.newNode = this.apiPipeline.createAutoNode(data, this.srcNode);
		this.newLink = null;
		if (this.apiPipeline.isLinkNeededWithAutoNode(this.newNode, this.srcNode)) {
			this.newLink = this.apiPipeline.createLink(this.newNode, this.srcNode);
		}
		if (this.newNode.type === SUPER_NODE) {
			const { supernode, subPipelines } = this.objectModel.createSubPipelinesFromData(this.newNode);
			this.subPipelines = subPipelines;
			this.newNode = supernode;
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
		if (this.newLink) {
			if (this.newNode.type === SUPER_NODE) {
				this.apiPipeline.addSupernode(this.newNode, this.subPipelines, this.newLink);
			} else {
				this.apiPipeline.addAutoNodeAndLink(this.newNode, this.newLink);
			}

		} else {
			if (this.newNode.type === SUPER_NODE) {
				this.apiPipeline.addSupernode(this.newNode, this.subPipelines);
			} else {
				this.apiPipeline.addNode(this.newNode);
			}
		}
		this.objectModel.setSelections([this.newNode.id], this.data.pipelineId);
	}

	undo() {
		if (this.newNode.type === SUPER_NODE) {
			this.apiPipeline.deleteSupernodesAndDescPipelines([this.newNode]);
		} else {
			this.apiPipeline.deleteNode(this.newNode.id);
		}
	}

	redo() {
		this.do();
	}
}
