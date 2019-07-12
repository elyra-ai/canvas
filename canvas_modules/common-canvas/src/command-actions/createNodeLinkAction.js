/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateNodeLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.linkNodeList = this.apiPipeline.createNodeLinks(data);
	}

	getData() {
		this.data.linkIds = this.linkNodeList.map((link) => link.id);
		this.data.linkType = "data"; // Added for historical purposes - for WML Canvas support
		return this.data;
	}

	do() {
		this.apiPipeline.addLinks(this.linkNodeList);
	}

	undo() {
		this.linkNodeList.forEach((link) => {
			this.apiPipeline.deleteLink(link);
		});
	}

	redo() {
		this.do();
	}

}
