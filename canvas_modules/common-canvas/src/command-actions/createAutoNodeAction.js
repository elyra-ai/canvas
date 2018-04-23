/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateAutoNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.srcNode = this.objectModel.getAutoSourceNode();
		this.newNode = this.objectModel.createAutoNode(data, this.srcNode);
		this.newLink = null;
		if (this.objectModel.isLinkNeededWithAutoNode(this.newNode, this.srcNode)) {
			this.newLink = this.objectModel.createLink(this.newNode, this.srcNode);
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.sourceNode = this.srcNode;
		this.data.newNode = this.newNode;
		this.data.newLink = this.newLink;
		return this.data;
	}

	// Standard methods
	do() {
		if (this.newLink) {
			this.objectModel.addAutoNodeAndLink(this.newNode, this.newLink);
		} else {
			this.objectModel.addNode(this.newNode);
		}
		this.objectModel.setSelections([this.newNode.id]);
	}

	undo() {
		this.objectModel.deleteNode(this.newNode.id);
	}

	redo() {
		this.do();
	}
}
