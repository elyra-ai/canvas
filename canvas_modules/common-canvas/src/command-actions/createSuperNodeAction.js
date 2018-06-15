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

		this.subflowNodes = this.objectModel.getSelectedNodes();
		this.subflowComments = this.objectModel.getSelectedComments();

		this.subflowLinks = [];
		this.linksToDelete = [];
		this.commentLinks = [];

		// Separate the comment links and node links for each selected object.
		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// Ensure each link is only stored once.
			objectLinks.forEach((objectLink) => {
				if (!this.subflowLinks.find((link) => (link.id === objectLink.id))) {
					if (objectLink.type === "nodeLink" || objectLink.type === "associationLink") {
						this.subflowLinks.push(objectLink);
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
			if (this.apiPipeline.isObjectIdInObjects(comment.id, this.subflowComments)) {
				// Include links that are connected to selected comments.
				this.subflowLinks.push(link);
			} else if (!this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				// Include links that are connected to nonselected comments and connected to selected nodes.
				this.subflowLinks.push(link);
				this.subflowComments.push(comment); // Add nonselected comment.
			} else {
				// Do not include link in supernode if nonselected comment have links to nonselected nodes.
				this.linksToDelete.push(link);
				// Remove the link from supernode.
				this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== link.id);
			}
		});

		// Comments
		this.commentsToUnlinkFromUnselectedNodes = [];

		// Do not move a selected comment to supernode if it is linked to an nonselected node or comment.
		for (const comment of this.subflowComments) {
			if (this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				this.commentsToUnlinkFromUnselectedNodes.push(comment);
			}
		}

		// If selected comments have links to nonselected nodes, break the links to nonselected nodes.
		this.commentsToUnlinkFromUnselectedNodes.forEach((comment) => {
			const commentLinks = this.apiPipeline.getLinksContainingId(comment.id);
			commentLinks.forEach((link) => {
				if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) &&
					(!this.apiPipeline.isObjectIdInObjects(link.id, this.linksToDelete))) {
					this.linksToDelete.push(link);
					// Remove the link from supernode.
					this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== link.id);
				}
			});
		});

		// Determine supernode input and output links.
		this.supernodeInputLinks = [];
		this.supernodeOutputLinks = [];
		const subflowNodeLinks = this.apiPipeline.getNodeLinks(this.subflowNodes);
		subflowNodeLinks.forEach((link) => {
			if ((!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.subflowNodes)) &&
				(!this.supernodeInputLinks.find((supernodeInputLink) => (supernodeInputLink.id === link.trgNodeId)))) {
				this.supernodeInputLinks.push(link);
			}
			if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) &&
				(!this.supernodeOutputLinks.find((supernodeOutputLink) => (supernodeOutputLink.id === link.srcNodeId)))) {
				this.supernodeOutputLinks.push(link);
			}
		});

		// Remove input/output links from edge nodes in sub-pipline.
		this.supernodeInputLinks.forEach((inputLink) => {
			this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== inputLink.id);
		});
		this.supernodeOutputLinks.forEach((outputLink) => {
			this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== outputLink.id);
		});

		// Sub-Pipeline
		const primaryPipelineRuntimeRef = this.objectModel.getCanvasInfoPipeline(this.objectModel.getPrimaryPipelineId()).runtime_ref;
		this.subPipelineInfo = {
			"runtime_ref": primaryPipelineRuntimeRef,
			"nodes": this.subflowNodes,
			"comments": this.subflowComments,
			"links": this.subflowLinks
		};
		this.canvasInfoSubPipeline = this.objectModel.createCanvasInfoPipeline(this.subPipelineInfo);
		this.subPipeline = this.objectModel.getAPIPipeline(this.canvasInfoSubPipeline.id);

		this.createBindingNodeData = [];

		// Determine which port from input link's target node should be a supernode input port
		// and create a binding node for the port in the supernode.
		const supernodeInputPorts = [];
		this.supernodeInputLinks.forEach((link) => {
			const node = this.apiPipeline.getNode(link.trgNodeId);
			this.createSupernodePorts(node, link, supernodeInputPorts, "entry");
		});

		// Determine which port from output link's source node should be a supernode output port
		// and create a binding node for the port in the supernode.
		const supernodeOutputPorts = [];
		this.supernodeOutputLinks.forEach((link) => {
			const node = this.apiPipeline.getNode(link.srcNodeId);
			this.createSupernodePorts(node, link, supernodeOutputPorts, "exit");
		});

		// Supernode
		const supernodeTemplate = {
			description: "This supernode was created by common-canvas.",
			image: SupernodeIcon,
			label: "Supernode",
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
			offsetX: this.subflowNodes[0].x_pos,
			offsetY: this.subflowNodes[0].y_pos
		};

		this.supernode = this.apiPipeline.createNode(supernodeData);

		// Links to and from supernode.
		this.linkSrcDefs = [];
		this.linkTrgDefs = [];
		subflowNodeLinks.forEach((link) => {
			if (!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.subflowNodes)) {
				this.linkSrcDefs.push({
					id: link.srcNodeId,
					portId: link.srcNodePortId
				});
				this.linkTrgDefs.push({
					id: this.supernode.id,
					portId: link.trgNodePortId ? link.trgNodeId + "_" + link.trgNodePortId : link.trgNodePortId
				});
			}
			if (!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) {
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

		// Keep a map of which supernode port the subflow binding node links to
		// and the link the subflow binding node needs to read from to connect
		// to the correct node in the subflow.
		this.supernodeBindingNodesMappedToParentFlowData = [];

		// Create subflow binding nodes.
		this.supernodeEntryBindingNodes = [];
		this.supernodeExitBindingNodes = [];

		// Determine relative position of the binding nodes in the subflow.
		const subflowRect = this.apiPipeline.getBoundingRectForNodes(this.subflowNodes);
		const boundingRectPadding = 80;
		let entryBindingYPos = subflowRect.y - boundingRectPadding;
		let exitBindingYPos = subflowRect.y - boundingRectPadding;

		this.createBindingNodeData.forEach((bindingNodeData) => {
			const bindingNodePort = Object.assign({}, bindingNodeData.port);
			if (bindingNodeData.type === "entry") {
				const pos = { x: subflowRect.x - (boundingRectPadding * 2), y: entryBindingYPos += boundingRectPadding };
				bindingNodePort.id = bindingNodePort.id ? "output_" + bindingNodePort.id : bindingNodePort.id;
				const inputBindingNode = this.createBindingNode(bindingNodeData.link, { output_ports: [bindingNodePort] }, pos);
				this.supernodeBindingNodesMappedToParentFlowData[inputBindingNode.id] = {
					portId: bindingNodeData.port.id,
					link: bindingNodeData.link
				};
				this.supernodeEntryBindingNodes.push(inputBindingNode);
			} else {
				const pos = { x: subflowRect.x + subflowRect.width + boundingRectPadding, y: exitBindingYPos += boundingRectPadding };
				bindingNodePort.id = bindingNodePort.id ? "input_" + bindingNodePort.id : bindingNodePort.id;
				const outputBindingNode = this.createBindingNode(bindingNodeData.link, { input_ports: [bindingNodePort] }, pos);
				this.supernodeBindingNodesMappedToParentFlowData[outputBindingNode.id] = {
					portId: bindingNodeData.port.id,
					link: bindingNodeData.link
				};
				this.supernodeExitBindingNodes.push(outputBindingNode);
			}
		});

		// Create links to and from subflow binding nodes.
		this.bindingNodeLinkSrcDefs = [];
		this.bindingNodeLinkTrgDefs = [];
		this.supernodeEntryBindingNodes.forEach((bindingNode) => {
			const link = this.supernodeBindingNodesMappedToParentFlowData[bindingNode.id].link;
			this.bindingNodeLinkSrcDefs.push({
				id: bindingNode.id,
				portId: link.trgNodePortId ? "output_" + link.trgNodeId + "_" + link.trgNodePortId : link.trgNodePortId
			});
			this.bindingNodeLinkTrgDefs.push({
				id: link.trgNodeId,
				portId: link.trgNodePortId
			});
		});
		this.supernodeExitBindingNodes.forEach((bindingNode) => {
			const link = this.supernodeBindingNodesMappedToParentFlowData[bindingNode.id].link;
			this.bindingNodeLinkSrcDefs.push({
				id: link.srcNodeId,
				portId: link.srcNodePortId
			});
			this.bindingNodeLinkTrgDefs.push({
				id: bindingNode.id,
				portId: link.srcNodePortId ? "input_" + link.srcNodeId + "_" + link.srcNodePortId : link.srcNodePortId
			});
		});
	}

	createSupernodePorts(node, link, supernodePorts, type) {
		const portType = type === "entry" ? "input_ports" : "output_ports";
		const linkNodePortType = type === "entry" ? "trgNodePortId" : "srcNodePortId";

		if (typeof link[linkNodePortType] !== "undefined") {
			node[portType].forEach((port) => {
				if (link[linkNodePortType] === port.id) {
					const newPort = Object.assign({}, port);
					newPort.id = port.id ? node.id + "_" + port.id : port.id;
					newPort.label = "Binding port for supernode";
					this.addToCreateBindingNodeData(node.id, newPort, link, supernodePorts, type);
				}
			});
		} else { // Add the first port.
			const newPort = Object.assign({}, node[portType][0]);
			newPort.id = newPort.id ? node.id + "_" + newPort.id : newPort.id;
			this.addToCreateBindingNodeData(node.id, newPort, link, supernodePorts, type);
		}
	}

	addToCreateBindingNodeData(nodeId, newPort, link, supernodePorts, type) {
		if (!supernodePorts.find((supernodePort) => (supernodePort.id === newPort.id))) {
			supernodePorts.push(newPort);
			this.createBindingNodeData.push({
				bindindNodeForNodeId: nodeId,
				type: type,
				link: link,
				port: newPort
			});
		}
	}

	createBindingNode(link, bindingNodePort, pos) {
		const bindingNodeTemplate = {
			description: "supernode binding node",
			label: "Binding",
			type: "binding"
		};

		const bindingNodeData = {
			editType: "createNode",
			nodeTemplate: Object.assign(bindingNodeTemplate, bindingNodePort),
			offsetX: pos.x,
			offsetY: pos.y
		};

		return this.subPipeline.createNode(bindingNodeData);
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
		this.apiPipeline.deleteObjectsWithIds(this.subflowNodes);
		this.apiPipeline.deleteObjectsWithIds(this.subflowComments);

		// Delete links from comments that are not in the subpipeline.
		this.apiPipeline.deleteLinks(this.linksToDelete);

		this.objectModel.addPipeline(this.canvasInfoSubPipeline);
		this.apiPipeline.addNode(this.supernode);

		// Add subflow_node_ref to supernode ports.
		this.supernodeEntryBindingNodes.forEach((bindingNode) => {
			const portId = this.supernodeBindingNodesMappedToParentFlowData[bindingNode.id].portId;
			this.apiPipeline.setInputPortSubflowNodeRef(this.supernode.id, portId, bindingNode.id);
		});
		this.supernodeExitBindingNodes.forEach((bindingNode) => {
			const portId = this.supernodeBindingNodesMappedToParentFlowData[bindingNode.id].portId;
			this.apiPipeline.setOutputPortSubflowNodeRef(this.supernode.id, portId, bindingNode.id);
		});

		// Create new links to and from supernode in the main flow.
		this.newLinks = [];
		for (let idx = 0; idx < this.linkSrcDefs.length; idx++) {
			this.newLinks.push(this.apiPipeline.createNodeLink(this.linkSrcDefs[idx], this.linkTrgDefs[idx]));
		}
		this.apiPipeline.addLinks(this.newLinks);

		// Add the binding nodes to the subflow.
		this.supernodeEntryBindingNodes.forEach((bindingNode) => {
			this.subPipeline.addNode(bindingNode);
		});
		this.supernodeExitBindingNodes.forEach((bindingNode) => {
			this.subPipeline.addNode(bindingNode);
		});

		// Create links to and from the subflow binding nodes.
		this.supernodeNewLinks = [];
		for (let idx = 0; idx < this.bindingNodeLinkSrcDefs.length; idx++) {
			this.supernodeNewLinks.push(
				this.subPipeline.createNodeLink(this.bindingNodeLinkSrcDefs[idx], this.bindingNodeLinkTrgDefs[idx]));
		}
		this.subPipeline.addLinks(this.supernodeNewLinks);
	}

	undo() {
		this.objectModel.deletePipeline(this.canvasInfoSubPipeline.id);
		this.apiPipeline.deleteNode(this.supernode.id);

		if (this.newLinks) {
			this.apiPipeline.deleteLinks(this.newLinks);
		}

		this.subflowNodes.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.subflowComments.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.subflowLinks);
		this.apiPipeline.addLinks(this.supernodeInputLinks);
		this.apiPipeline.addLinks(this.supernodeOutputLinks);
		this.apiPipeline.addLinks(this.linksToDelete);
	}

	redo() {
		this.do();
	}
}
