/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";


export default class InsertNodeIntoLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.node = data.node;

		this.firstLinkSrcInfo = {
			id: data.link.srcNodeId,
			portId: data.link.srcNodePortId
		};

		this.firstLinkTrgInfo = {
			id: this.node.id
		};

		this.secondLinkSrcInfo = {
			id: this.node.id
		};

		this.secondLinkTrgInfo = {
			id: data.link.trgNodeId,
			portId: data.link.trgNodePortId
		};
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newFirstLink = this.firstLink;
		this.data.newSecondLink = this.secondLink;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.deleteLink({ id: this.data.link.id });
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: this.data.offsetX, offsetY: this.data.offsetY });

		this.firstLink = this.apiPipeline.createNodeLink(this.firstLinkSrcInfo, this.firstLinkTrgInfo, { type: "nodeLink" });
		this.secondLink = this.apiPipeline.createNodeLink(this.secondLinkSrcInfo, this.secondLinkTrgInfo, { type: "nodeLink" });
		this.apiPipeline.addLinks([this.firstLink, this.secondLink]);
	}

	undo() {
		this.apiPipeline.deleteLink({ id: this.firstLink.id });
		this.apiPipeline.deleteLink({ id: this.secondLink.id });
		this.apiPipeline.moveObjects({ nodes: [this.node.id], offsetX: -this.data.offsetX, offsetY: -this.data.offsetY });
		this.apiPipeline.addLinks([this.data.link]);
	}

	redo() {
		this.do();
	}
}
