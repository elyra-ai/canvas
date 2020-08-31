/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import Action from "../command-stack/action.js";

export default class DeleteObjectsAction extends Action {
	constructor(data, objectModel, enableDetachableLinks) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.objectsInfo = [];
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.nodesToDelete = this.objectModel.getSelectedNodes();
		this.commentsToDelete = this.objectModel.getSelectedComments();
		this.linksToDelete = this.objectModel.getSelectedLinks(); // There'll only be selected links if enableLinkSelection is set
		this.linksToUpdate = [];
		this.supernodesToDelete = [];
		this.nodeAndCommentsToDelete = this.nodesToDelete.concat(this.commentsToDelete);

		// Handle links to update when enableDetachableLinks is set. These are links
		// that will remain on the canvas as detached links when the nodes or
		// comments they are connected to are deleted. They need to be updated to
		// have their source and target IDs removed (as appropriate based on
		// whether the source and/or taget object is being deleted) which will
		// indictae that the node is either partailly or fully detached.
		if (enableDetachableLinks) {
			this.linksToDelete = this.getConnectedLinksToDelete(this.linksToDelete, "nodeLink");
			this.linksToUpdate = this.getLinksToUpdate();

		// Handle links to delete. When enableDetachableLinks is not set we
		// implicitely delete links connected to nodes and comments being deleted.
		// This means we find any links connected to those nodes and comments
		// and add them to the array of links to delete.
		} else {
			this.linksToDelete = this.getConnectedLinksToDelete(this.linksToDelete);
		}

		// Remember all the pipelines that are being deleted when any selected
		// supernodes are being deleted.
		this.supernodesToDelete = this.apiPipeline.getSupernodes(this.nodesToDelete);
		this.supernodePipelinesToDelete = this.getPipelinesToDelete(this.supernodesToDelete);

		// Remove the supernode(s) from list of all nodes to avoid duplicating add/delete node.
		this.nodesToDelete = this.nodesToDelete.filter((node) => !this.isSupernodeToBeDeleted(node));
	}

	// Returns an array of links to delete. This takes the current array of links
	// to delete, which will have been populated with any selected links (assuming
	// enableLinkSelection is set), and adds to it any links that are connected to
	// the nodes and comments being deleted.
	getConnectedLinksToDelete(linksToDelete, excludeType) {
		this.nodeAndCommentsToDelete.forEach((nc) => {
			const connectedLinks = this.apiPipeline.getLinksContainingId(nc.id);
			connectedLinks.forEach((conLink) => {
				if (!this.isLinkToBeDeleted(conLink, linksToDelete) &&
						conLink.type !== excludeType) {
					linksToDelete.push(conLink);
				}
			});
		});
		return linksToDelete;
	}

	// Returns an array of link info objects that indicate which links should
	// remain on the canvas as detached links when nodes they are connected to
	// are deleted. This is only relavant when config field enableDetachableLinks
	// is set. The linkInfo object contains a reference to the link and other
	// fields that can be used to: (a) reattach the link to either the source node
	// or target node from which it was detached and (b) position the source and
	// target ends of detached links, that is, the position information as x/y
	// coords for where the link will be drawn to/from in the absence of the
	// nodes that were deleted.
	// Return object contains fields:
	// link - a refrence to the link being updated
	// srcNodeId - the srcNodeId of the link being updated. This is set if the
	// source node is being deleted
	// trgNodeId - the trgNodeId of the link being updated. This is set if the
	// target node is being deleted
	// srcPos - the position from which the link should be drawn. This is set if
	// the source node ie being deldted. This contains x and y fields.
	// trgPos - the position from which the link should be drawn. This is set if
	// the target node ie being deleted. This contains x and y fields.
	getLinksToUpdate() {
		const linksToUpdate = [];
		const allCurrentLinks = this.apiPipeline.getLinks();

		allCurrentLinks.forEach((link) => {
			if (!this.isLinkToBeDeleted(link, this.linksToDelete)) {
				const src = this.isSourceToBeDeleted(link);
				const trg = this.isTargetToBeDeleted(link);

				if (src || trg) {
					const linkUpdateInfo = { link: link };
					if (src) {
						linkUpdateInfo.savedSrcNodeId = link.srcNodeId;
						linkUpdateInfo.srcPos = this.getSrcPos(link);
					}
					if (trg) {
						linkUpdateInfo.savedTrgNodeId = link.trgNodeId;
						linkUpdateInfo.trgPos = this.getTrgPos(link);
					}
					linksToUpdate.push(linkUpdateInfo);
				}
			}
		});
		return linksToUpdate;
	}

	getSrcPos(link) {
		const srcNode = this.apiPipeline.getNode(link.srcNodeId);
		let outerCenterX;
		let outerCenterY;
		if (link.trgNodeId) {
			const trgNode = this.apiPipeline.getNode(link.trgNodeId);
			outerCenterX = trgNode.x_pos + (trgNode.width / 2);
			outerCenterY = trgNode.y_pos + (trgNode.height / 2);
		} else {
			outerCenterX = link.trgPos.x_pos;
			outerCenterY = link.trgPos.y_pos;
		}

		const srcCenterX = srcNode.width / 2;
		const srcCenterY = srcNode.height / 2;

		const startPos = CanvasUtils.getOuterCoord(
			srcNode.x_pos, srcNode.y_pos, srcNode.width, srcNode.height,
			srcCenterX, srcCenterY, outerCenterX, outerCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}

	getTrgPos(link) {
		const trgNode = this.apiPipeline.getNode(link.trgNodeId);

		let outerCenterX;
		let outerCenterY;
		if (link.srcNodeId) {
			const srcNode = this.apiPipeline.getNode(link.srcNodeId);
			outerCenterX = srcNode.x_pos + (srcNode.width / 2);
			outerCenterY = srcNode.y_pos + (srcNode.height / 2);
		} else {
			outerCenterX = link.srcPos.x_pos;
			outerCenterY = link.srcPos.y_pos;
		}

		const trgCenterX = trgNode.width / 2;
		const trgCenterY = trgNode.height / 2;

		const startPos = CanvasUtils.getOuterCoord(
			trgNode.x_pos, trgNode.y_pos, trgNode.width, trgNode.height,
			trgCenterX, trgCenterY, outerCenterX, outerCenterY);

		return { x_pos: startPos.x, y_pos: startPos.y };
	}

	isLinkToBeDeleted(link, linksToDelete) {
		return linksToDelete.findIndex((l) => l.id === link.id) !== -1;
	}

	isSupernodeToBeDeleted(node) {
		return this.supernodesToDelete.findIndex((sn) => node.id === sn.id) !== -1;
	}

	isSourceToBeDeleted(link) {
		return this.nodeAndCommentsToDelete.findIndex((nc) => nc.id === link.srcNodeId) !== -1;
	}

	isTargetToBeDeleted(link) {
		return this.nodesToDelete.findIndex((nc) => nc.id === link.trgNodeId) !== -1;
	}

	getPipelinesToDelete(superNodes) {
		const pipelinesToDelete = [];
		this.supernodesToDelete.forEach((supernode) => {
			pipelinesToDelete[supernode.id] = this.objectModel.getDescendentPipelines(supernode);
		});
		return pipelinesToDelete;
	}

	// Standard methods
	do() {
		this.apiPipeline.detachLinks(this.linksToUpdate);
		this.apiPipeline.deleteLinks(this.linksToDelete);

		this.supernodesToDelete.forEach((supernode) => {
			this.apiPipeline.deleteSupernode(supernode.id);
		});
		this.apiPipeline.deleteObjects(this.data.selectedObjectIds);
	}

	undo() {
		this.supernodesToDelete.forEach((supernode) => {
			this.apiPipeline.addSupernode(supernode, this.supernodePipelinesToDelete[supernode.id]);
		});

		this.nodesToDelete.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.commentsToDelete.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.linksToDelete);
		this.apiPipeline.attachLinks(this.linksToUpdate);
	}

	redo() {
		this.do();
	}
}
