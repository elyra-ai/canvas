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
		this.previousComment = "";
	}

	// Standard methods
	do() {
		this.previousComment = this.objectModel.getComment(this.data.nodes[0]);
		this.objectModel.editComment(this.data);
	}

	undo() {
		this.objectModel.updateComment(this.previousComment);
	}

	redo() {
		this.objectModel.editComment(this.data);
	}

}
