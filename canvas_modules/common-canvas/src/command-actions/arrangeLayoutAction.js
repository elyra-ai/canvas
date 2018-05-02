/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class ArrangeLayoutAction extends Action {
	constructor(layoutDirection, objectModel) {
		super(layoutDirection);
		this.layoutDirection = layoutDirection;
		this.objectModel = objectModel;
		this.existingNodes = this.objectModel.cloneNodes();
	}

	// Standard methods
	do() {
		this.objectModel.autoLayout(this.layoutDirection);
	}

	undo() {
		this.objectModel.replaceNodes(this.existingNodes);
	}

	redo() {
		this.objectModel.autoLayout(this.layoutDirection);
	}
}
