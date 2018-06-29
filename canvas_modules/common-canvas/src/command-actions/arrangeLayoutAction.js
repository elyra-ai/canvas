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
		this.apiPipeline = this.objectModel.getAPIPipeline();
		// Clone the nodes to remember their original positions.
		this.existingNodes = this.apiPipeline.cloneNodes();
	}

	// Standard methods
	do() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}

	undo() {
		this.apiPipeline.replaceNodes(this.existingNodes);
	}

	redo() {
		this.apiPipeline.autoLayout(this.layoutDirection);
	}
}
