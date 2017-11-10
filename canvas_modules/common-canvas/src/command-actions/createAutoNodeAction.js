/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import ObjectModel from "../object-model/object-model.js";
// import _ from "underscore";

export default class CreateAutoNodeAction extends Action {
	constructor(data) {
		super(data);
		this.data = data;

		this.sourceNode = ObjectModel.getAutoSourceNode();
		this.trgPosition = ObjectModel.getAutoPositionOfTarget(this.sourceNode);
		this.newNode = ObjectModel.createNodeAtPosition(data, this.trgPosition);

	}

	// Standard methods
	do() {
		ObjectModel.addAutoNode(this.newNode, this.sourceNode);
	}

	undo() {
		ObjectModel.deleteNode(this.newNode.id);
	}

	redo() {
		ObjectModel.addAutoNode(this.newNode, this.sourceNode);
	}
}
