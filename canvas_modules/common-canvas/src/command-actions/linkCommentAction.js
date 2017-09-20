/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import ObjectModel from "../object-model/object-model.js";

export default class LinkCommentAction extends Action {
	constructor(data) {
		super(data);
		this.data = data;
	}

	// Standard methods
	do() {
		ObjectModel.addCommentLinks(this.data);
	}

	undo() {
		this.data.forEach((linkComment) => {
			ObjectModel.deleteLink(linkComment);
		});
	}

	redo() {
		ObjectModel.addCommentLinks(this.data);
	}

}
