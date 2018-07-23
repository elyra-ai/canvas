/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DisplayPreviousPipeline extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.oldPipelineInfo = this.objectModel.getCurrentBreadcrumb();
	}

	// Standard methods
	do() {
		this.objectModel.setPreviousBreadcrumb();
	}

	undo() {
		this.objectModel.addNewBreadcrumb(this.oldPipelineInfo);
	}

	redo() {
		this.do();
	}

}
