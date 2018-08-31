/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import forIn from "lodash/forIn";

export default class SetObjectsStyleAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldStyles = [];
		forIn(this.data.pipelineObjectIds, (objectIds, pipelineId) => {
			this.oldStyles[pipelineId] = [];
			objectIds.forEach((objId) => {
				this.oldStyles[pipelineId].push(this.apiPipeline.getObjectStyle(objId, this.data.temporary));
			});
		});
	}

	// Standard methods
	do() {
		this.apiPipeline.setObjectsStyle(this.data.pipelineObjectIds, this.data.style, this.data.temporary);
	}

	undo() {
		this.apiPipeline.setObjectsStyle(this.data.pipelineObjectIds, this.oldStyles, this.data.temporary);
	}

	redo() {
		this.do();
	}
}
