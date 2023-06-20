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
import { USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON }
	from "../common-canvas/constants/canvas-constants.js";

export default class ConvertSuperNodeExternalToLocal extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.labelUtil = labelUtil;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		// To do a complete conversion of the supernode's contents to local, we need
		// to make sure the pipeline is loaded. This will load the pipeline flow,
		// if it is not already loaded.
		this.pipelineFlowLoaded = this.objectModel.ensurePipelineIsLoaded(this.data);

		this.oldSupernode = this.apiPipeline.getNode(this.data.targetObject.id);

		// Find the pipelines and flows to remove. This will only return pipelines
		// that are NOT referenced by other supernodes on the canvas.
		this.oldPipelines = this.objectModel.getDescPipelinesToDelete([this.oldSupernode], this.data.pipelineId);
		this.oldPipelines = this.oldPipelines.filter((p) => p.parentUrl === this.data.externalUrl);
		this.oldExtPipelineFlows = this.objectModel.getExternalPipelineFlowsForPipelines(this.oldPipelines);

		// Clone the supernode
		this.newSupernode = Object.assign({}, this.oldSupernode, { subflow_ref: Object.assign({}, this.oldSupernode.subflow_ref) });
		this.newSupernode.image =
			this.newSupernode.image === USE_DEFAULT_EXT_ICON ? USE_DEFAULT_ICON : this.newSupernode.image;
		delete this.newSupernode.subflow_ref.url;

		// Clone pipelines
		const pipelinesToClone = this.objectModel.getDescendantPipelinesForSupernode(this.newSupernode)
			.filter((p) => p.parentUrl === this.data.externalUrl);
		this.newPipelines = this.objectModel.cloneSupernodeContents(this.newSupernode, pipelinesToClone);
		this.newPipelines = this.newPipelines.map((p) => {
			delete p.parentUrl;
			return p;
		});
	}

	do() {
		// Replace the supernode, pipelines and external flows
		this.objectModel.replaceSupernodeAndPipelines({
			pipelineId: this.data.pipelineId, // Used by canvasinfo reducer
			topSupernode: this.newSupernode, // Used by nodes reducer
			pipelinesToAdd: this.newPipelines, // Used by canvasinfo reducer
			pipelinesToRemove: this.oldPipelines, // Used by canvasinfo reducer
			extPipelineFlowsToAdd: [], // Used by externalpipelineflows reducer
			extPipelineFlowsToDelete: this.oldExtPipelineFlows // Used by externalpipelineflows reducer
		});
	}

	undo() {
		// Replace the supernode, pipelines and external flows
		this.objectModel.replaceSupernodeAndPipelines({
			pipelineId: this.data.pipelineId, // Used by canvasinfo reducer
			topSupernode: this.oldSupernode, // Used by nodes reducer
			pipelinesToAdd: this.oldPipelines, // Used by canvasinfo reducer
			pipelinesToRemove: this.newPipelines, // Used by canvasinfo reducer
			extPipelineFlowsToAdd: this.oldExtPipelineFlows, // Used by externalpipelineflows reducer
			extPipelineFlowsToDelete: [] // Used by externalpipelineflows reducer
		});
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.convertSuperNodeExternalToLocal", { node_label: this.oldSupernode.label });
	}
}
