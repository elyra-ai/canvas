/*
 * Copyright 2017-2020 IBM Corporation
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


export default class InsertNodeIntoLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.node = data.node;

		this.firstLinkSrcInfo = {
			id: data.link.srcNodeId,
			portId: data.link.srcNodePortId
		};

		this.firstLinkTrgInfo = {
			id: this.node.id
		};

		this.secondLinkSrcInfo = {
			id: this.node.id
		};

		this.secondLinkTrgInfo = {
			id: data.link.trgNodeId,
			portId: data.link.trgNodePortId
		};
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newFirstLink = this.firstLink;
		this.data.newSecondLink = this.secondLink;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.deleteLink({ id: this.data.link.id });
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: this.data.offsetX, offsetY: this.data.offsetY });

		this.firstLink = this.apiPipeline.createNodeLink(this.firstLinkSrcInfo, this.firstLinkTrgInfo, { type: "nodeLink" });
		this.secondLink = this.apiPipeline.createNodeLink(this.secondLinkSrcInfo, this.secondLinkTrgInfo, { type: "nodeLink" });
		this.apiPipeline.addLinks([this.firstLink, this.secondLink]);
	}

	undo() {
		this.apiPipeline.deleteLink({ id: this.firstLink.id });
		this.apiPipeline.deleteLink({ id: this.secondLink.id });
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: -this.data.offsetX, offsetY: -this.data.offsetY });
		this.apiPipeline.addLinks([this.data.link]);
	}

	redo() {
		this.do();
	}
}
