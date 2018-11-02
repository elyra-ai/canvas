/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import { SAVED_NODES_CATEGORY_ID, SAVED_NODES_FOLDER_ICON }
	from "../common-canvas/constants/canvas-constants.js";

export default class SaveToPaletteAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.data.addedNodeTypes = this.apiPipeline.createNodesForPalette(this.data.selectedObjectIds);
	}

	do() {
		// The new category will only be created if it does not already exist.
		// TODO - Make these hardcoded values for name and image configurable
		this.objectModel.addNodeTypesToPalette(
			this.data.addedNodeTypes,
			SAVED_NODES_CATEGORY_ID,
			"Saved Nodes",
			"Nodes in this category were previously saved from a flow.",
			SAVED_NODES_FOLDER_ICON);
	}

	undo() {
		const addedIds = this.data.addedNodeTypes.map((ant) => ant.id);
		this.objectModel.removeNodesFromPalette(addedIds, SAVED_NODES_CATEGORY_ID);
	}

	redo() {
		this.do();
	}
}
