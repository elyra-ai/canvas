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

export default class DeleteObjectsAction extends Action {
	constructor(data) {
		super(data);
		this.data = data;
		this.objectsInfo = [];
	}

	// Standard methods
	do() {
		this.data.selectedObjectIds.forEach((id) => {
			const objectInfo = {};
			objectInfo.id = id;

			// save all the links and node data associated with each id
			objectInfo.links = ObjectModel.getLinksContainingId(id);
			if (ObjectModel.isDataNode(id)) {
				objectInfo.type = "node";
				objectInfo.data = ObjectModel.getNode(id);
			} else {
				objectInfo.type = "comment";
				objectInfo.data = ObjectModel.getComment(id);
			}
			this.objectsInfo.push(objectInfo);
		});
		ObjectModel.deleteObjects(this.data);
	}

	undo() {
		this.objectsInfo.forEach((objectInfo) => {
			if (objectInfo.type === "node") {
				objectInfo.data.label = objectInfo.data.objectData.label;
				ObjectModel.addNode(objectInfo.data);
				ObjectModel.addNodeLinks(objectInfo.links);
			} else {
				ObjectModel.addComment(objectInfo.data);
				ObjectModel.linkComment(objectInfo.links);
			}
		});
	}

	redo() {
		ObjectModel.deleteObjects(this.data);
	}

}
