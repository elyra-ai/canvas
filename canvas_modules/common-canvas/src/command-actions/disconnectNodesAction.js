/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class DisconnectNodesAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.links = [];
	}

	// Standard methods
	do() {
		this.data.selectedObjectIds.forEach((id) => {
			// save all the links associated with each node, but don't store duplicate links
			const objectLinks = this.objectModel.getLinksContainingId(id);
			objectLinks.forEach((objectLink) => {
				if (this.links.filter((link) => (link.id === objectLink.id)).length === 0) {
					this.links.push(objectLink);
				}
			});
		});
		this.objectModel.disconnectNodes(this.data);
	}

	undo() {
		this.objectModel.addLinks(this.links);
	}

	redo() {
		this.objectModel.disconnectNodes(this.data);
	}

}
