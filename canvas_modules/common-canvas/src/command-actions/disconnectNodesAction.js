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

export default class DisconnectNodesAction extends Action {
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
			// save all the links associated with each id
			objectInfo.links = ObjectModel.getLinksContainingId(id);
			this.objectsInfo.push(objectInfo);
		});
		ObjectModel.disconnectNodes(this.data);
	}

	undo() {
		this.objectsInfo.forEach((objectInfo) => {
			if (ObjectModel.isDataNode(objectInfo.id)) {
				ObjectModel.addNodeLinks(objectInfo.links);
			} else {
				ObjectModel.addCommentLinks(objectInfo.links);
			}
		});
	}

	redo() {
		ObjectModel.disconnectNodes(this.data);
	}

}
