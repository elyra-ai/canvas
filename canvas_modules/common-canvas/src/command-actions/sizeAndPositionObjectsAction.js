/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class SizeAndPositionObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.previousData = {};
		this.previousData.objectsInfo = this.getPreviousNodesInfo(data);
	}

	// Standard methods
	do() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo);
	}

	undo() {
		this.apiPipeline.sizeAndPositionObjects(this.previousData.objectsInfo);
	}

	redo() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo);
	}

	getPreviousNodesInfo(data) {
		const previousNodesInfo = [];
		Object.keys(data.objectsInfo).forEach((nodeId) => {
			const obj = this.apiPipeline.getObject(nodeId);
			if (obj) {
				previousNodesInfo[nodeId] = {
					id: obj.id,
					x_pos: obj.x_pos,
					y_pos: obj.y_pos,
					width: obj.width,
					height: obj.height
				};
			}
		});
		return previousNodesInfo;
	}
}
