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
import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils.js";
import { SUPER_NODE } from "../common-canvas/constants/canvas-constants.js";

export default class CloneMultipleObjectsAction extends Action {
	constructor(data, objectModel, viewportDimensions, areDetachableLinksSupported) {
		super(data);
		this.data = data;
		this.viewportDimensions = viewportDimensions;
		this.areDetachableLinksSupported = areDetachableLinksSupported;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.clonedNodesInfo = [];
		this.clonedCommentsInfo = [];
		this.clonedLinks = [];

		// Make sure objects to be pasted are in an appropriate position for them
		// to appear within the viewport.
		this.adjustObjectsPositions();

		if (data.objects.nodes) {
			data.objects.nodes.forEach((node) => {
				let clonedNode = this.apiPipeline.cloneNode(node);
				// Pipelines in app_data.pipeline_data in supernodes will be in schema
				// format (conforming to the pipeline flow schema) so they must be converted.
				if (clonedNode.type === SUPER_NODE) {
					clonedNode = this.objectModel.convertPipelineData(clonedNode);
				}
				this.clonedNodesInfo.push({ originalId: node.id, node: clonedNode });
			});
		}

		if (data.objects.comments) {
			data.objects.comments.forEach((comment) => {
				this.clonedCommentsInfo.push({ originalId: comment.id, comment: this.apiPipeline.cloneComment(comment) });
			});
		}

		if (data.objects.links) {
			data.objects.links.forEach((link) => {
				if (link.type === "nodeLink" || link.type === "associationLink") {
					const srcClonedNode = this.findClonedNode(link.srcNodeId);
					const trgClonedNode = this.findClonedNode(link.trgNodeId);
					const newLink = this.apiPipeline.cloneNodeLink(link, srcClonedNode, trgClonedNode);
					this.clonedLinks.push(newLink);
				} else {
					const srcClonedComment = this.findClonedComment(link.srcNodeId);
					const trgClonedNode = this.findClonedNode(link.trgNodeId);
					if (srcClonedComment && trgClonedNode) {
						const newLink = this.apiPipeline.cloneCommentLink(link, srcClonedComment.id, trgClonedNode.id);
						this.clonedLinks.push(newLink);
					}
				}
			});
		}
	}

	// Adjusts the positions of the cloned objects appropriately. If the data
	// object contains a mousePos property it will be the position on the canvas
	// where the paste was requested, using a context menu, and we will paste the
	// objects at that position. If no mousePos is specified then the user will
	// have pasted using the toolbar button or keyboard. In this case, we paste
	// the objects in their original coordinate positions or, if that position is
	// not visible in the viewport, we paste them in the center of the viewport.
	adjustObjectsPositions() {
		const objects = this.data.objects;
		const pastedObjDimensions = CanvasUtils.getCanvasDimensions(objects.nodes, objects.comments, objects.links, 0);
		if (pastedObjDimensions) {
			if (this.data.mousePos && this.data.mousePos.x && this.data.mousePos.y) {
				const xDelta = this.data.mousePos.x - pastedObjDimensions.left;
				const yDelta = this.data.mousePos.y - pastedObjDimensions.top;
				this.moveObjectsPositions(objects, xDelta, yDelta);
			} else {
				const transRect = this.viewportDimensions;
				if (transRect.x < pastedObjDimensions.left &&
						transRect.y < pastedObjDimensions.top &&
						transRect.x + transRect.width > pastedObjDimensions.left &&
						transRect.y + transRect.height > pastedObjDimensions.top) {
					this.ensureNoOverlap(objects);
				} else {
					const xDelta = transRect.x + (transRect.width / 2) - (pastedObjDimensions.width / 2) - pastedObjDimensions.left;
					const yDelta = transRect.y + (transRect.height / 2) - (pastedObjDimensions.height / 2) - pastedObjDimensions.top;
					this.moveObjectsPositions(objects, xDelta, yDelta);
					this.ensureNoOverlap(objects);
				}
			}
		}
	}

	// Offsets the positions of the canvas objects (nodes, comments and links)
	// if they exactly overlap any existing nodes, comments and links.
	// Exact overlap can happen when pasting over the top of the canvas from
	// which the canvas objects  were copied.
	ensureNoOverlap(objects) {
		while (this.apiPipeline.exactlyOverlaps(objects.nodes, objects.comments, objects.links)) {
			this.moveObjectsPositions(objects, 10, 10);
		}
	}

	// Moves the coordinate positions of the canvas objects specified by the
	// x and y amounts specified.
	moveObjectsPositions(objects, xDelta, yDelta) {
		if (objects.nodes) {
			objects.nodes.forEach((node) => {
				node.x_pos += xDelta;
				node.y_pos += yDelta;
			});
		}
		if (objects.comments) {
			objects.comments.forEach((comment) => {
				comment.x_pos += xDelta;
				comment.y_pos += yDelta;
				comment.selectedObjectIds = [];
			});
		}
		// Only semi-detached or fully-detached links (which will have srcPos or
		// trgPos properties) need to be moved. Other links will be moved due to
		// their relationship with their source and target node/comment.
		if (objects.links) {
			objects.links.forEach((link) => {
				if (link.srcPos) {
					link.srcPos.x_pos += xDelta;
					link.srcPos.y_pos += yDelta;
				}
				if (link.trgPos) {
					link.trgPos.x_pos += xDelta;
					link.trgPos.y_pos += yDelta;
				}
			});
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.clonedNodesInfo = this.clonedNodesInfo;
		this.data.clonedCommentsInfo = this.clonedCommentsInfo;
		this.data.clonedLinks = this.clonedLinks;
		return this.data;
	}

	// Standard methods
	do() {
		const addedObjectIds = [];

		this.clonedNodesInfo.forEach((clonedNodeInfo) => {
			this.apiPipeline.addNode(clonedNodeInfo.node);
			addedObjectIds.push(clonedNodeInfo.node.id);
		});

		this.clonedCommentsInfo.forEach((clonedCommentInfo) => {
			this.apiPipeline.addComment(clonedCommentInfo.comment);
			addedObjectIds.push(clonedCommentInfo.comment.id);
		});


		this.apiPipeline.addLinks(this.clonedLinks);
		if (this.areDetachableLinksSupported) {
			this.clonedLinks.forEach((clonedLink) => addedObjectIds.push(clonedLink.id));
		}

		this.objectModel.setSelections(addedObjectIds, this.apiPipeline.pipelineId);
	}

	undo() {
		// Handle regular nodes
		const nodeInfos = this.clonedNodesInfo.filter((cn) => cn.node.type !== SUPER_NODE);
		nodeInfos.forEach((clonedNodeInfo) => {
			this.apiPipeline.deleteNode(clonedNodeInfo.node.id);
		});

		// Handle supernodes
		const supernodeInfos = this.clonedNodesInfo.filter((cn) => cn.node.type === SUPER_NODE);
		const supernodes = supernodeInfos.map((si) => si.node);
		this.apiPipeline.deleteSupernodesAndDescPipelines(supernodes);

		// Handle comments
		this.clonedCommentsInfo.forEach((clonedCommentInfo) => {
			this.apiPipeline.deleteComment(clonedCommentInfo.comment.id);
		});

		// Handle links
		this.clonedLinks.forEach((clonedLink) => {
			this.apiPipeline.deleteLink(clonedLink);
		});
	}

	redo() {
		this.do();
	}

	// Returns the cloned node from the array of cloned nodes, identified
	// by the node ID passed in which is the ID of the original node.
	findClonedNode(nodeId) {
		var clonedNodeInfo =
			this.clonedNodesInfo.find((clnedNodeInf) => clnedNodeInf.originalId === nodeId);
		if (clonedNodeInfo) {
			return clonedNodeInfo.node;
		}
		return null;
	}

	// Returns the cloned comment from the array of cloned comments, identified
	// by the comment ID passed in which is the ID of the original comment.
	findClonedComment(commentId) {
		var clonedCommentInfo =
			this.clonedCommentsInfo.find((clnedCmntInf) => clnedCmntInf.originalId === commentId);
		if (clonedCommentInfo) {
			return clonedCommentInfo.comment;
		}
		return null;
	}
}
