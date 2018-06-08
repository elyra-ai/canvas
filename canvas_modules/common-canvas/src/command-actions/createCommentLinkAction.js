/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateCommentLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.linkCommentList = this.apiPipeline.createCommentLinks(data);
	}

	getData() {
		this.data.linkIds = this.linkCommentList.map((link) => link.id);
		return this.data;
	}

	do() {
		this.apiPipeline.addLinks(this.linkCommentList);
	}

	undo() {
		this.linkCommentList.forEach((link) => {
			this.apiPipeline.deleteLink(link);
		});
	}

	redo() {
		this.do();
	}

}
