/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DeleteLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.linkInfo = [];
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
	}

	// Standard methods
	do() {
		this.linkInfo = this.apiPipeline.getLink(this.data.id);
		this.apiPipeline.deleteLink(this.data);
	}

	undo() {
		this.apiPipeline.addLinks([this.linkInfo]);
	}

	redo() {
		this.apiPipeline.deleteLink(this.data);
	}

}
