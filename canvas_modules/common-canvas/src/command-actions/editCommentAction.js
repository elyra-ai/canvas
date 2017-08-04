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

export default class editCommentAction extends Action {
	constructor(data) {
		super(data);
		this.data = data;
		this.previousComment = "";
	}

// Standard methods
	do() {
		this.previousComment = ObjectModel.getComment(this.data.nodes[0]);
		ObjectModel.editComment(this.data);
	}

	undo() {
		ObjectModel.updateComment(this.previousComment);
	}

	redo() {
		ObjectModel.editComment(this.data);
	}

}
