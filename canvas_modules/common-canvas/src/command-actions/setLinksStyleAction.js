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

export default class SetLinksStyleAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.oldStyles = [];
		forIn(this.data.pipelineLinkIds, (linkIds, pipelineId) => {
			this.oldStyles[pipelineId] = [];
			linkIds.forEach((linkId) => {
				this.oldStyles[pipelineId].push(this.apiPipeline.getLinkStyle(linkId, this.data.temporary));
			});
		});
	}

	// Standard methods
	do() {
		this.apiPipeline.setLinksStyle(this.data.pipelineLinkIds, this.data.style, this.data.temporary);
	}

	undo() {
		this.apiPipeline.setLinksStyle(this.data.pipelineLinkIds, this.oldStyles, this.data.temporary);
	}

	redo() {
		this.do();
	}
}
