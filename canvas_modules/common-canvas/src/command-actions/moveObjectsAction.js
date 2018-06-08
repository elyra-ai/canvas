/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class MoveObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
	}

	// Standard methods
	do() {
		this.apiPipeline.moveObjects(this.data);
	}

	undo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		this.apiPipeline.moveObjects(this.data);
	}

	redo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		this.apiPipeline.moveObjects(this.data);
	}

}
