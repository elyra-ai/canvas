/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.newNode = this.objectModel.createNode(data);
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newNode = this.newNode;
		return this.data;
	}

	// Standard methods
	do() {
		this.objectModel.addNode(this.newNode);
	}

	undo() {
		this.objectModel.deleteNode(this.newNode.id);
	}

	redo() {
		this.objectModel.addNode(this.newNode);
	}
}
