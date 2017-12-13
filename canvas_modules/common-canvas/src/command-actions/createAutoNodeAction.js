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

		this.sourceNode = this.objectModel.getAutoSourceNode();
		this.trgPosition = this.objectModel.getAutoPositionOfTarget(this.sourceNode);
		this.newNode = this.objectModel.createNodeAtPosition(data, this.trgPosition);

	}

	// Standard methods
	do() {
		this.objectModel.addAutoNode(this.newNode, this.sourceNode);
		this.objectModel.setSelections([this.newNode.id]);
	}

	undo() {
		this.objectModel.deleteNode(this.newNode.id);
	}

	redo() {
		this.objectModel.addAutoNode(this.newNode, this.sourceNode);
		this.objectModel.setSelections([this.newNode.id]);
	}
}
