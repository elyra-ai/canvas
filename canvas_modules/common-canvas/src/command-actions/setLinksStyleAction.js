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
		this.oldStyles = [];
		forIn(this.data.pipelineLinkIds, (linkIds, pipelineId) => {
			const apiPipeline = this.objectModel.getAPIPipeline(pipelineId);
			this.oldStyles[pipelineId] = [];
			linkIds.forEach((linkId) => {
				this.oldStyles[pipelineId].push(apiPipeline.getLinkStyle(linkId, this.data.temporary));
			});
		});
	}

	// Standard methods
	do() {
		this.objectModel.setLinksStyle(this.data.pipelineLinkIds, this.data.style, this.data.temporary);
	}

	undo() {
		this.objectModel.setLinksStyle(this.data.pipelineLinkIds, this.oldStyles, this.data.temporary);
	}

	redo() {
		this.do();
	}
}
