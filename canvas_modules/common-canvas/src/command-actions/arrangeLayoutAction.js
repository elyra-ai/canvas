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

export default class ArrangeLayoutAction extends Action {
	constructor(layoutDirection) {
		super(layoutDirection);
		this.layoutDirection = layoutDirection;
		this.existingNodesData = {};
	}

	// Standard methods
	do() {
		var currentNodes = ObjectModel.getNodes().map(function(node) {
			return Object.assign({}, node);
		});
		this.existingNodesData = currentNodes;
		ObjectModel.autoLayout(this.layoutDirection);
	}

	undo() {
		const currentCanvasData = ObjectModel.getCanvasInfo();
		const newCanvasData = Object.assign({}, currentCanvasData, { nodes: this.existingNodesData });
		ObjectModel.setCanvasInfo(newCanvasData);
	}

	redo() {
		ObjectModel.autoLayout(this.layoutDirection);
	}

}
