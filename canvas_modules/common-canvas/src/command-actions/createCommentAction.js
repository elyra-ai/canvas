/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateCommentAction extends Action {
	constructor(data, objectModel, svgPos) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		// If we are provided with a svgPos then we are being called from the
		// toolbar and therefore need to calculate the position of the comment.
		if (svgPos) {
			const comPos = this.apiPipeline.getNewCommentPosition(svgPos);
			this.data.mousePos = {
				x: comPos.x_pos,
				y: comPos.y_pos
			};
		}

		this.comment = this.apiPipeline.createComment(data);
	}

	getData() {
		this.data.commentId = this.comment.id;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.addComment(this.comment);
	}

	undo() {
		this.apiPipeline.deleteComment(this.comment.id);
	}

	redo() {
		this.apiPipeline.addComment(this.comment);
	}

}
