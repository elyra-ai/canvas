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
		this.links = [];
	}

	// Standard methods
	do() {
		this.data.selectedObjectIds.forEach((id) => {
			// save all the links associated with each node, but don't store duplicate links
			const objectLinks = ObjectModel.getLinksContainingId(id);
			objectLinks.forEach((objectLink) => {
				if (this.links.filter((link) => (link.id === objectLink.id)).length === 0) {
					this.links.push(objectLink);
				}
			});
		});
		ObjectModel.disconnectNodes(this.data);
	}

	undo() {
		ObjectModel.addLinks(this.links);
	}

	redo() {
		ObjectModel.disconnectNodes(this.data);
	}

}
