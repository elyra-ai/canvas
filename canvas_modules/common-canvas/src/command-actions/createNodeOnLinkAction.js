/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateNodeOnLinkAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.newNode = this.objectModel.createNode(data);

		this.firstLinkSrcInfo = {
			id: data.link.srcNodeId,
			portId: data.link.srcNodePortId
		};

		this.firstLinkTrgInfo = {
			id: this.newNode.id
		};

		this.secondLinkSrcInfo = {
			id: this.newNode.id
		};

		this.secondLinkTrgInfo = {
			id: data.link.trgNodeId,
			portId: data.link.trgNodePortId
		};
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newNode = this.newNode;
		this.data.newFirstLink = this.firstLink;
		this.data.newSecondLink = this.secondLink;
		return this.data;
	}

	// Standard methods
	do() {
		this.objectModel.deleteLink({ id: this.data.link.id });
		this.objectModel.addNode(this.newNode);
		// The new node must be added to the canvas before trying to create the
		// links because the link creation code requires linked nodes to exist.
		this.firstLink = this.objectModel.createNodeLink(this.firstLinkSrcInfo, this.firstLinkTrgInfo);
		this.secondLink = this.objectModel.createNodeLink(this.secondLinkSrcInfo, this.secondLinkTrgInfo);
		this.objectModel.addLinks([this.firstLink, this.secondLink]);
	}

	undo() {
		this.objectModel.deleteLink({ id: this.firstLink.id });
		this.objectModel.deleteLink({ id: this.secondLink.id });
		this.objectModel.deleteNode(this.newNode.id);
		this.objectModel.addLinks([this.data.link]);
	}

	redo() {
		this.objectModel.deleteLink({ id: this.data.link.id });
		this.objectModel.addNode(this.newNode);
		this.objectModel.addLinks([this.firstLink, this.secondLink]);
	}
}
