/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import SupernodeIcon from "../../assets/images/supernode.svg";

export default class CreateSuperNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		this.superNodes = this.objectModel.getSelectedNodes();
		this.superComments = this.objectModel.getSelectedComments();

		this.superLinks = [];
		this.linksToDelete = [];
		this.commentLinks = [];

		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// Ensure each link is only stored once.
			objectLinks.forEach((objectLink) => {
				if (!this.superLinks.find((link) => (link.id === objectLink.id))) {
					if (objectLink.type === "nodeLink" || objectLink.type === "associationLink") {
						this.superLinks.push(objectLink);
					// Do not add any comment links to the supernode at this moment.
					} else if ((!this.commentLinks.find((link) => (link.id === objectLink.id))) && objectLink.type === "commentLink") {
						this.commentLinks.push(objectLink);
					}
				}
			});
		});

		// Determine if the comment should be brought into the supernode.
		this.commentLinks.forEach((link) => {
			const comment = this.apiPipeline.getComment(link.srcNodeId);
			if (this.apiPipeline.isObjectIdInObjects(comment.id, this.superComments)) {
				// Include links that are connected to selected comments.
				this.superLinks.push(link);
			} else if (!this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				// Include links that are connected to nonselected comments and connected to selected nodes.
				this.superLinks.push(link);
				this.superComments.push(comment); // Add nonselected comment.
			} else {
				// Do not include link in supernode if nonselected comment have links to nonselected nodes.
				this.linksToDelete.push(link);
				// Remove the link from supernode.
				this.superLinks = this.superLinks.filter((superLink) => superLink.id !== link.id);
			}
		});

		// Comments
		this.commentsToUnlinkFromUnselectedNodes = [];

		// Do not move a selected comment to supernode if it is linked to an nonselected node or comment.
		for (const comment of this.superComments) {
			if (this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				this.commentsToUnlinkFromUnselectedNodes.push(comment);
			}
		}

		// If selected comments have links to nonselected nodes, break the links to nonselected nodes.
		this.commentsToUnlinkFromUnselectedNodes.forEach((comment) => {
			const commentLinks = this.apiPipeline.getLinksContainingId(comment.id);
			commentLinks.forEach((link) => {
				if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.superNodes)) &&
					(!this.apiPipeline.isObjectIdInObjects(link.id, this.linksToDelete))) {
					this.linksToDelete.push(link);
					// Remove the link from supernode.
					this.superLinks = this.superLinks.filter((superLink) => superLink.id !== link.id);
				}
			});
		});

		// Sub-Pipeline
		const primaryPipelineRuntimeRef = this.objectModel.getCanvasInfoPipeline(this.objectModel.getPrimaryPipelineId()).runtime_ref;
		this.subPipelineInfo = {
			"runtime_ref": primaryPipelineRuntimeRef,
			"nodes": this.superNodes,
			"comments": this.superComments,
			"links": this.superLinks
		};
		this.canvasInfoSubPipeline = this.objectModel.createCanvasInfoPipeline(this.subPipelineInfo);

		const supernodeInputNodes = [];
		const supernodeOutputNodes = [];
		const subFlowLinks = this.apiPipeline.getNodeLinks(this.superNodes);
		subFlowLinks.forEach((link) => {
			if ((!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.superNodes)) &&
				(!supernodeInputNodes.find((node) => (node.id === link.trgNodeId)))) {
				supernodeInputNodes.push(this.apiPipeline.getNode(link.trgNodeId));
			}
			if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.superNodes)) &&
				(!supernodeOutputNodes.find((node) => (node.id === link.srcNodeId)))) {
				supernodeOutputNodes.push(this.apiPipeline.getNode(link.srcNodeId));
			}
		});

		// Ports
		let supernodeInputPorts = [];
		supernodeInputNodes.forEach((node) => {
			const inputPorts = [];
			// Ensure each input portId is unique within the supernode.
			node.input_ports.forEach((port) => {
				const newPort = Object.assign({}, port);
				newPort.id = newPort.id ? node.id + "_" + newPort.id : newPort.id;
				inputPorts.push(newPort);
			});
			supernodeInputPorts = supernodeInputPorts.concat(inputPorts);
		});

		let supernodeOutputPorts = [];
		supernodeOutputNodes.forEach((node) => {
			const outputPorts = [];
			// Ensure each output portId is unique within the supernode.
			node.output_ports.forEach((port) => {
				const newPort = Object.assign({}, port);
				newPort.id = newPort.id ? node.id + "_" + newPort.id : newPort.id;
				outputPorts.push(newPort);
			});
			supernodeOutputPorts = supernodeOutputPorts.concat(outputPorts);
		});

		// SuperNode
		const supernodeTemplate = {
			description: "supernode",
			image: SupernodeIcon,
			label: "Supernode",
			operator_id_ref: "supernode",
			input_ports: supernodeInputPorts,
			output_ports: supernodeOutputPorts,
			type: "super_node",
			subflow_ref: {
				pipeline_id_ref: this.canvasInfoSubPipeline.id
			},
		};

		const supernodeData = {
			editType: "createNode",
			nodeTemplate: supernodeTemplate,
			offsetX: this.superNodes[0].x_pos,
			offsetY: this.superNodes[0].y_pos
		};

		this.supernode = this.apiPipeline.createNode(supernodeData);

		// Links to and from supernode.
		this.linkSrcDefs = [];
		this.linkTrgDefs = [];
		subFlowLinks.forEach((link) => {
			if (!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.superNodes)) {
				this.linkSrcDefs.push({
					id: link.srcNodeId,
					portId: link.srcNodePortId
				});
				this.linkTrgDefs.push({
					id: this.supernode.id,
					portId: link.trgNodePortId ? link.trgNodeId + "_" + link.trgNodePortId : link.trgNodePortId
				});
			}
			if (!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.superNodes)) {
				this.linkSrcDefs.push({
					id: this.supernode.id,
					portId: link.srcNodePortId ? link.srcNodeId + "_" + link.srcNodePortId : link.srcNodePortId
				});
				this.linkTrgDefs.push({
					id: link.trgNodeId,
					portId: link.trgNodePortId
				});
			}
		});
	}

	// Return augmented command object which will be passed to the client app.
	getData() {
		this.data.newNode = this.supernode;
		this.data.newLinks = this.newLinks;
		this.data.subPipelineId = this.canvasInfoSubPipeline.id;
		return this.data;
	}

	// Standard methods
	do() {
		// Delete selected objects from main pipeline.
		this.apiPipeline.deleteObjectsWithIds(this.superNodes);
		this.apiPipeline.deleteObjectsWithIds(this.superComments);

		// Delete links from comments that are not in the subpipeline.
		this.apiPipeline.deleteLinks(this.linksToDelete);

		this.objectModel.addPipeline(this.canvasInfoSubPipeline);
		this.apiPipeline.addNode(this.supernode);

		this.newLinks = [];
		for (let idx = 0; idx < this.linkSrcDefs.length; idx++) {
			this.newLinks.push(this.apiPipeline.createNodeLink(this.linkSrcDefs[idx], this.linkTrgDefs[idx]));
		}
		this.apiPipeline.addLinks(this.newLinks);
	}

	undo() {
		this.objectModel.deletePipeline(this.canvasInfoSubPipeline.id);
		this.apiPipeline.deleteNode(this.supernode.id);

		if (this.newLinks) {
			this.apiPipeline.deleteLinks(this.newLinks);
		}

		this.superNodes.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.superComments.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.superLinks);
		this.apiPipeline.addLinks(this.linksToDelete);
	}

	redo() {
		this.do();
	}
}
