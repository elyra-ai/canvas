/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class expandSuperNodeInPlaceAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
	}

	// Standard methods
	do() {
		this.apiPipeline.expandSuperNodeInPlace(this.data.id);
	}

	undo() {
		this.apiPipeline.collapseSuperNodeInPlace(this.data.id);
	}

	redo() {
		this.do();
	}
}
