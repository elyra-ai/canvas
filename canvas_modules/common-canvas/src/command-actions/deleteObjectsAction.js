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
		this.nodes = this.objectModel.getSelectedNodes();
		this.comments = this.objectModel.getSelectedComments();
		this.links = [];
		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.objectModel.getLinksContainingId(id);
			// ensure each link is only stored once
			objectLinks.forEach((objectLink) => {
				if (!this.links.find((link) => (link.id === objectLink.id))) {
					this.links.push(objectLink);
				}
			});
		});
	}

	// Standard methods
	do() {
		this.objectModel.deleteObjects(this.data);
	}

	undo() {
		this.nodes.forEach((node) => {
			this.objectModel.addNode(node);
		});

		this.comments.forEach((comment) => {
			this.objectModel.addComment(comment);
		});

		this.objectModel.addLinks(this.links);
	}

	redo() {
		this.objectModel.deleteObjects(this.data);
	}

}
