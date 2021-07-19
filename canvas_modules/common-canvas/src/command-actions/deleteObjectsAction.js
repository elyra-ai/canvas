/*
 * Copyright 2017-2020 Elyra Authors
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
	constructor(data, objectModel, areDetachableLinksSupported) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.objectsInfo = [];
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.nodesToDelete = this.objectModel.getSelectedNodes();
		this.commentsToDelete = this.objectModel.getSelectedComments();
		this.linksToDelete = this.objectModel.getSelectedLinks(); // There'll only be selected links if enableLinkSelection is set
		this.linksToUpdateInfo = {};
		this.supernodesToDelete = [];
		this.nodeAndCommentsToDelete = this.nodesToDelete.concat(this.commentsToDelete);

		// Handle links to update when detachable links are enabled. These are links
		// that will remain on the canvas as detached links when the nodes or
		// comments they are connected to are deleted. They need to be updated to
		// have their source and target IDs removed (as appropriate based on
		// whether the source and/or taget object is being deleted) which will
		// indicate that the node is either partailly or fully detached.
		if (areDetachableLinksSupported) {
			this.linksToDelete = this.getConnectedLinksToDelete(this.linksToDelete, "nodeLink");
			this.linksToUpdateInfo = this.getLinksToUpdateInfo();

		// Handle links to delete. When detachable links are not enabled we
		// implicitely delete links connected to nodes and comments being deleted.
		// This means we find any links connected to those nodes and comments
		// and add them to the array of links to delete.
		} else {
			this.linksToDelete = this.getConnectedLinksToDelete(this.linksToDelete);
		}

		// Remember all the pipelines that are being deleted when any selected
		// supernodes are being deleted.
		this.supernodesToDelete = this.apiPipeline.getSupernodes(this.nodesToDelete);
		this.supernodePipelinesToDelete = this.objectModel.getDescendantPipelines(this.supernodesToDelete);
		this.extPipelineFlowsToDelete = this.getExternalPipelineFlowsToDelete(this.supernodesToDelete);

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

	// Returns an array of 'link info' objects that indicate which links should
	// remain on the canvas as detached links when nodes they are connected to
	// are deleted. There is one linkInfo object for each link that needs to be
	// updated. This is only relavant when detachable links are enabled.
	// The linkInfo object contains:
	// newLinks - An array of new links to update existing links with detached info
	// oldLinks - A corresponding array of original links.
	// Note: when a link is detached, as the result of its source or target node
	// being deleted, the srcNodeId and/or trgNodeId in the link will be set to
	// undefined. This indicates which end of the link is detached. The srcPos
	// and trgPos coordinates will be set on the link to indicate where the line
	// is drawn to or from.
	getLinksToUpdateInfo() {
		const newLinks = [];
		const oldLinks = [];
		const allCurrentLinks = this.apiPipeline.getLinks();

		allCurrentLinks.forEach((link) => {
			if (!this.isLinkToBeDeleted(link, this.linksToDelete)) {
				const src = this.isSourceToBeDeleted(link);
				const trg = this.isTargetToBeDeleted(link);

				if (src || trg) {
					const newLink = Object.assign({}, link);
					if (src) {
						delete newLink.srcNodeId;
						delete newLink.srcNodePortId;
						newLink.srcPos = this.getSrcPos(link);
					}
					if (trg) {
						delete newLink.trgNodeId;
						delete newLink.trgNodePortId;
						newLink.trgPos = this.getTrgPos(link);
					}
					newLinks.push(newLink);
					oldLinks.push(link);
				}
			}
		});
		return { newLinks, oldLinks };
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

		let srcCenterX;
		let srcCenterY;

		if (srcNode.layout && srcNode.layout.drawNodeLinkLineFromTo === "image_center") {
			srcCenterX = srcNode.layout.imagePosX + (srcNode.layout.imageWidth / 2);
			srcCenterY = srcNode.layout.imagePosY + (srcNode.layout.imageHeight / 2);

		} else {
			srcCenterX = srcNode.width / 2;
			srcCenterY = srcNode.height / 2;
		}

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

		let trgCenterX;
		let trgCenterY;

		if (trgNode.layout && trgNode.layout.drawNodeLinkLineFromTo === "image_center") {
			trgCenterX = trgNode.layout.imagePosX + (trgNode.layout.imageWidth / 2);
			trgCenterY = trgNode.layout.imagePosY + (trgNode.layout.imageHeight / 2);

		} else {
			trgCenterX = trgNode.width / 2;
			trgCenterY = trgNode.height / 2;
		}

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

	getExternalPipelineFlowsToDelete(superNodes) {
		const extPipelineFlowsToDelete = [];
		this.supernodesToDelete.forEach((supernode) => {
			const extUrl = supernode.subflow_ref.url;
			if (extUrl) {
				const extFlow = this.objectModel.getExternalPipelineFlow(extUrl);
				// extFlow may not yet be loaded if the supernode has not been expanded.
				if (extFlow) {
					extPipelineFlowsToDelete[extUrl] = extFlow;
				}
			}
		});
		return extPipelineFlowsToDelete;
	}

	// Standard methods
	do() {
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.newLinks);
		this.apiPipeline.deleteLinks(this.linksToDelete);

		this.supernodesToDelete.forEach((supernode) => {
			this.apiPipeline.deleteSupernode(supernode.id);
		});
		this.apiPipeline.deleteObjects(this.data.selectedObjectIds);
	}

	undo() {
		this.supernodesToDelete.forEach((supernode) => {
			this.apiPipeline.addSupernode(supernode, this.supernodePipelinesToDelete[supernode.id]);

			const extUrl = supernode.subflow_ref.url;
			if (extUrl) {
				const extPF = this.extPipelineFlowsToDelete[extUrl];
				// External pipeline flow may be missing if the external supernode that
				// was deleted was never expanded (meaning the pipeline flow would
				// not have been loaded).
				if (extPF) {
					this.objectModel.addExternalPipelineFlow(extPF, extUrl, false); // false indicates pipelines should not be added
				}
			}
		});

		this.nodesToDelete.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.commentsToDelete.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.linksToDelete);
		this.apiPipeline.updateLinks(this.linksToUpdateInfo.oldLinks);
	}

	redo() {
		this.do();
	}
}
