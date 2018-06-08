/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DisplaySubPipeline extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
	}

	// Standard methods
	do() {
		this.objectModel.addNewBreadcrumb(this.data.pipelineInfo);
	}

	undo() {
		this.objectModel.setPreviousBreadcrumb();
	}

	redo() {
		this.do();
	}

}
