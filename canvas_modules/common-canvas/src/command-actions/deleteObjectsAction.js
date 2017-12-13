/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DeleteObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.objectsInfo = [];
	}

	// Standard methods
	do() {
		this.data.selectedObjectIds.forEach((id) => {
			const objectInfo = {};
			objectInfo.id = id;

			// save all the links and node data associated with each id
			objectInfo.links = this.objectModel.getLinksContainingId(id);
			if (this.objectModel.isDataNode(id)) {
				objectInfo.type = "node";
				objectInfo.data = this.objectModel.getNode(id);
			} else {
				objectInfo.type = "comment";
				objectInfo.data = this.objectModel.getComment(id);
			}
			this.objectsInfo.push(objectInfo);
		});
		this.objectModel.deleteObjects(this.data);
	}

	undo() {
		this.objectsInfo.forEach((objectInfo) => {
			if (objectInfo.type === "node") {
				this.objectModel.addNode(objectInfo.data);
			} else {
				this.objectModel.addComment(objectInfo.data);
			}
			this.objectModel.addLinks(objectInfo.links);
		});
	}

	redo() {
		this.objectModel.deleteObjects(this.data);
	}

}
