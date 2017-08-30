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

export default class MoveObjectsAction extends Action {
	constructor(data) {
		super(data);
		this.data = data;
	}

	// Standard methods
	do() {
		ObjectModel.moveObjects(this.data);
	}

	undo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		ObjectModel.moveObjects(this.data);
	}

	redo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		ObjectModel.moveObjects(this.data);
	}

}
