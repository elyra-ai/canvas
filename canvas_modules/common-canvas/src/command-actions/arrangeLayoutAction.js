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
		this.existingNodesData = {};
	}

	// Standard methods
	do() {
		var currentNodes = this.objectModel.getNodes().map(function(node) {
			return Object.assign({}, node);
		});
		this.existingNodesData = currentNodes;
		this.objectModel.autoLayout(this.layoutDirection);
	}

	undo() {
		const currentCanvasData = this.objectModel.getCanvasInfo();
		const newCanvasData = Object.assign({}, currentCanvasData, { nodes: this.existingNodesData });
		this.objectModel.setCanvasInfo(newCanvasData);
	}

	redo() {
		this.objectModel.autoLayout(this.layoutDirection);
	}

}
