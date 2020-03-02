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
import has from "lodash/has";

export default class DeleteObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.objectsInfo = [];
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.nodes = this.objectModel.getSelectedNodes();
		this.comments = this.objectModel.getSelectedComments();
		this.links = [];
		this.supernodes = [];

		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// ensure each link is only stored once
			objectLinks.forEach((objectLink) => {
				if (!this.links.find((link) => (link.id === objectLink.id))) {
					this.links.push(objectLink);
				}
			});
		});

		// Remember all the pipelines that are being deleted when any selected
		// supernodes are being deleted.
		this.deletedSupernodePipelines = [];
		this.supernodes = this.apiPipeline.getSupernodes(this.nodes);
		this.supernodes.forEach((supernode) => {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				const deletedPipeline = this.objectModel.getCanvasInfoPipeline(supernode.subflow_ref.pipeline_id_ref);
				this.deletedSupernodePipelines[supernode.id] = [deletedPipeline];
				this.deleteNestedPipelines(supernode.id, supernode.subflow_ref.pipeline_id_ref);
			}

			// Remove the supernode(s) from list of all nodes to avoid duplicating add/delete node.
			this.nodes = this.nodes.filter((node) => node.id !== supernode.id);
		});
	}

	// Standard methods
	do() {
		this.supernodes.forEach((supernode) => {
			this.apiPipeline.deleteSupernode(supernode.id);
		});
		this.apiPipeline.deleteObjects(this.data);
	}

	undo() {
		this.supernodes.forEach((supernode) => {
			this.apiPipeline.addSupernode(supernode, this.deletedSupernodePipelines[supernode.id]);
		});

		this.nodes.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.comments.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.links);
	}

	redo() {
		this.do();
	}

	deleteNestedPipelines(supernodeId, pipelineId) {
		this.objectModel.getDescendentPipelineIds(pipelineId).forEach((subPipelineId) => {
			const deletedPipeline = this.objectModel.getCanvasInfoPipeline(subPipelineId);
			this.deletedSupernodePipelines[supernodeId].push(deletedPipeline);
		});
	}
}
