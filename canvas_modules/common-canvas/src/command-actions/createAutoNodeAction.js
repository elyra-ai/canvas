/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateAutoNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.srcNode = this.apiPipeline.getAutoSourceNode();
		this.newNode = this.apiPipeline.createAutoNode(data, this.srcNode);
		this.newLink = null;
		if (this.apiPipeline.isLinkNeededWithAutoNode(this.newNode, this.srcNode)) {
			this.newLink = this.apiPipeline.createLink(this.newNode, this.srcNode);
		}
		this.newPipeline = null;
		if (this.newNode && this.newNode.sub_type === "shaper") {
			this.newPipeline = this.objectModel.createEmptyPipeline();
			this.newNode.subflow_ref = {
				pipeline_id_ref: this.newPipeline.id
			};
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.sourceNode = this.srcNode;
		this.data.newNode = this.newNode;
		this.data.newLink = this.newLink;
		this.data.newPipeline = this.newPipeline;
		return this.data;
	}

	// Standard methods
	do() {
		if (this.newLink) {
			this.apiPipeline.addAutoNodeAndLink(this.newNode, this.newLink);
		} else {
			this.apiPipeline.addNode(this.newNode);
		}
		this.objectModel.setSelections([this.newNode.id], this.data.pipelineId);
		if (this.newPipeline) {
			this.objectModel.addPipeline(this.newPipeline);
		}
	}

	undo() {
		this.apiPipeline.deleteNode(this.newNode.id);
		if (this.newPipeline) {
			this.objectModel.deletePipeline(this.newPipeline.id);
		}
	}

	redo() {
		this.do();
	}
}
