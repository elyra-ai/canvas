/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import { SUPER_NODE } from "../common-canvas/constants/canvas-constants.js";

import has from "lodash/has";

export default class CreateNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.newNode = this.apiPipeline.createNode(data);
		if (this.newNode.type === SUPER_NODE) {
			this.subPipelines = [];
			if (has(this.newNode, "app_data.pipeline_data")) {
				const pipelines = this.newNode.app_data.pipeline_data;
				this.subPipelines = this.objectModel.cloneSuperNodeContents(this.newNode, pipelines);
				delete this.newNode.app_data.pipeline_data; // Remove the pipeline_data so it doesn't get included in the pipelineFlow
			} else {
				this.newPipeline = this.objectModel.createEmptyPipeline();
				this.newNode.subflow_ref = {
					pipeline_id_ref: this.newPipeline.id
				};
				this.subPipelines.push(this.newPipeline);
			}
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newNode = this.newNode;
		this.data.subPipelines = this.subPipelines;
		return this.data;
	}

	// Standard methods
	do() {
		if (this.newNode.type === SUPER_NODE) {
			this.apiPipeline.addSupernode(this.newNode, this.subPipelines);
		} else {
			this.apiPipeline.addNode(this.newNode);
		}
	}

	undo() {
		if (this.newNode.type === SUPER_NODE) {
			this.apiPipeline.deleteSupernode(this.newNode.id);
		} else {
			this.apiPipeline.deleteNode(this.newNode.id);
		}
	}

	redo() {
		this.do();
	}
}
