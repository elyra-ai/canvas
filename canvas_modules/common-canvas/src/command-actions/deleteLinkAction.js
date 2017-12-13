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
	}

	// Standard methods
	do() {
		this.linkInfo = this.objectModel.getLink(this.data.id);
		this.objectModel.deleteLink(this.data);
	}

	undo() {
		this.objectModel.addLinks([this.linkInfo]);
	}

	redo() {
		this.objectModel.deleteLink(this.data);
	}

}
