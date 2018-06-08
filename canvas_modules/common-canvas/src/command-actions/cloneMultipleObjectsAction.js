/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CloneMultipleObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.clonedNodesInfo = [];
		this.clonedCommentsInfo = [];
		this.links = [];

		if (data.objects.nodes) {
			data.objects.nodes.forEach((node) => {
				this.clonedNodesInfo.push({ originalId: node.id, node: this.apiPipeline.cloneNode(node) });
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
					if (srcClonedNode && trgClonedNode) {
						const newLink = this.apiPipeline.cloneNodeLink(link, srcClonedNode.id, trgClonedNode.id);
						this.links.push(newLink);
					}
				} else {
					const srcClonedComment = this.findClonedComment(link.srcNodeId);
					const trgClonedNode = this.findClonedNode(link.trgNodeId);
					if (srcClonedComment && trgClonedNode) {
						const newLink = this.apiPipeline.cloneCommentLink(link, srcClonedComment.id, trgClonedNode.id);
						this.links.push(newLink);
					}
				}
			});
		}
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.clonedNodesInfo = this.clonedNodesInfo;
		this.data.clonedCommentsInfo = this.clonedCommentsInfo;
		this.data.clonedLinks = this.links;
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

		this.apiPipeline.addLinks(this.links);
		this.objectModel.setSelections(addedObjectIds, this.apiPipeline.id);
	}

	undo() {
		this.clonedNodesInfo.forEach((clonedNodeInfo) => {
			this.apiPipeline.deleteNode(clonedNodeInfo.node.id);
		});
		this.clonedCommentsInfo.forEach((clonedCommentInfo) => {
			this.apiPipeline.deleteComment(clonedCommentInfo.comment.id);
		});
		this.links.forEach((link) => {
			this.apiPipeline.deleteLink(link.id);
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
