/*
 * Copyright 2017-2025 Elyra Authors
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

/***************************************************************************/
/* WARNING:                                                                */
/* This class is exported from Common Canvas. This means host apps can     */
/* extend the class and add to, or alter, this class's member variables.   */
/* So, if the names of any internal this.xxxx variables are changed that   */
/* needs to be communicated clearly through the release notes, Slack, etc. */
/***************************************************************************/

import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import Action from "../command-stack/action.js";
import { CANVAS_FOCUS } from "../common-canvas/constants/canvas-constants.js";

export default class DeleteObjectsAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.areDetachableLinksSupported = canvasController.areDetachableLinksInUse();
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
		// comments, they are connected to, are deleted. They need to be updated to
		// have their source and target IDs removed (as appropriate based on
		// whether the source and/or taget object is being deleted) which will
		// indicate that the node is either partailly or fully detached.
		if (this.areDetachableLinksSupported) {
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
		this.supernodesToDelete = CanvasUtils.filterSupernodes(this.nodesToDelete);
		this.pipelinesToDelete = this.objectModel.getDescPipelinesToDelete(this.supernodesToDelete, this.data.pipelineId);
		this.extPipelineFlowsToDelete =
			this.objectModel.getExternalPipelineFlowsForPipelines(this.pipelinesToDelete);

		// Remove the supernode(s) from list of all nodes to avoid duplicating add/delete node.
		this.nodesToDelete = this.nodesToDelete.filter((node) => !this.isSupernodeToBeDeleted(node));

		this.actionLabel = this.createActionLabel();
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
						newLink.srcPos = CanvasUtils.getSrcPos(link, this.apiPipeline);
					}
					if (trg) {
						delete newLink.trgNodeId;
						delete newLink.trgNodePortId;
						newLink.trgPos = CanvasUtils.getTrgPos(link, this.apiPipeline);
					}
					newLinks.push(newLink);
					oldLinks.push(link);
				}
			}
		});
		return { newLinks, oldLinks };
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

	// Standard methods
	do() {
		this.apiPipeline.deleteAndUpdateObjects({
			linksToUpdate: this.linksToUpdateInfo.newLinks,
			linksToDelete: this.linksToDelete,
			supernodesToDelete: this.supernodesToDelete,
			pipelinesToDelete: this.pipelinesToDelete,
			extPipelineFlowsToDelete: this.extPipelineFlowsToDelete,
			nodesToDelete: this.nodesToDelete,
			commentsToDelete: this.commentsToDelete
		});
		this.focusObject = CANVAS_FOCUS;
	}

	undo() {
		this.apiPipeline.addAndUpdateObjects({
			linksToUpdate: this.linksToUpdateInfo.oldLinks,
			linksToAdd: this.linksToDelete,
			supernodesToAdd: this.supernodesToDelete,
			pipelinesToAdd: this.pipelinesToDelete,
			extPipelineFlowsToAdd: this.extPipelineFlowsToDelete,
			nodesToAdd: this.nodesToDelete,
			commentsToAdd: this.commentsToDelete
		});

		this.focusObject = this.data.selectedObjects[0];
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.actionLabel;
	}

	getFocusObject() {
		return this.focusObject;
	}

	createActionLabel() {
		const stringsList = [
			{ label: "Nodes", val: this.nodesToDelete.length + this.supernodesToDelete.length },
			{ label: "Comments", val: this.commentsToDelete.length },
			{ label: "Links", val: this.linksToDelete.length }
		];
		const dynamicStringKey = "action.delete" + stringsList
			.filter((v) => v.val)
			.map((o) => o.label)
			.join("");

		return this.labelUtil.getActionLabel(this, dynamicStringKey,
			{
				nodes_count: this.nodesToDelete.length + this.supernodesToDelete.length,
				comments_count: this.commentsToDelete.length,
				links_count: this.linksToDelete.length
			});
	}
}
