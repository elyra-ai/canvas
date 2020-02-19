/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DisconnectObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.links = [];
	}

	// Standard methods
	do() {
		this.links = this.apiPipeline.disconnectObjects(this.data.selectedObjectIds);
	}

	undo() {
		this.apiPipeline.addLinks(this.links);
	}

	redo() {
		this.do();
	}

}
