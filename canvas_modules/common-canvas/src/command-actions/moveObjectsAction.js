/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class MoveObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
	}

	// Standard methods
	do() {
		this.objectModel.moveObjects(this.data);
	}

	undo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		this.objectModel.moveObjects(this.data);
	}

	redo() {
		this.data.offsetX = -(this.data.offsetX);
		this.data.offsetY = -(this.data.offsetY);
		this.objectModel.moveObjects(this.data);
	}

}
