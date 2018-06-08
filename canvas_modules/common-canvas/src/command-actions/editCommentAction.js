/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class EditCommentAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.previousComment = this.apiPipeline.getComment(this.data.id);
	}

	// Standard methods
	do() {
		this.apiPipeline.editComment(this.data);
	}

	undo() {
		this.apiPipeline.editComment(this.previousComment);
	}

	redo() {
		this.apiPipeline.editComment(this.data);
	}

}
