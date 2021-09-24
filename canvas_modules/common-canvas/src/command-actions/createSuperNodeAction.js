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
import CanvasUtils from "../common-canvas/common-canvas-utils";
import { ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK,
	SUPER_NODE, USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON }
	from "../common-canvas/constants/canvas-constants.js";
import defaultMessages from "../../locales/command-actions/locales/en.json";

export default class CreateSuperNodeAction extends Action {
	constructor(data, objectModel, intl) {
		super(data);
		this.intl = intl;
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		this.subflowNodes = this.objectModel.getSelectedNodes();
		this.subflowComments = this.objectModel.getSelectedComments();
		this.subflowRect = this.apiPipeline.getBoundingRectForNodes(this.subflowNodes);

		this.subflowLinks = [];
		this.linksToDelete = [];
		this.commentLinks = [];

		// Separate the comment links and node links for each selected object.
		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// Ensure each link is only stored once.
			objectLinks.forEach((objectLink) => {
				if (!this.subflowLinks.find((link) => (link.id === objectLink.id))) {
					if (objectLink.type === NODE_LINK || objectLink.type === ASSOCIATION_LINK) {
						this.subflowLinks.push(objectLink);
					// Do not add any comment links to the supernode at this moment.
					} else if ((!this.commentLinks.find((link) => (link.id === objectLink.id))) && objectLink.type === COMMENT_LINK) {
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
					this.removeLinkFromSubflow(link, true);
				}
			});
		});

		// Determine supernode input and output links.
		this.supernodeInputLinks = [];
		this.supernodeOutputLinks = [];
		// This returns a list of links in random order.
		const subflowNodeLinks = this.apiPipeline.getNodeLinks(this.subflowNodes);
		subflowNodeLinks.forEach((link) => {
			if ((!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.subflowNodes)) &&
				(!this.supernodeInputLinks.find((supernodeInputLink) => (supernodeInputLink.id === link.trgNodeId)))) {
				if (link.type === ASSOCIATION_LINK) { // Break off associationLink.
					this.removeLinkFromSubflow(link, true);
				} else {
					this.supernodeInputLinks.push(link);
				}
			}
			if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) &&
				(!this.supernodeOutputLinks.find((supernodeOutputLink) => (supernodeOutputLink.id === link.srcNodeId)))) {
				if (link.type === ASSOCIATION_LINK) { // Break off associationLink.
					this.removeLinkFromSubflow(link, true);
				} else {
					this.supernodeOutputLinks.push(link);
				}
			}
		});

		// Reorder the supernode input and output links to the correct order.
		this.supernodeInputLinksModified = this.reorderSupernodeLinks(this.supernodeInputLinks, "input");
		this.supernodeOutputLinksModified = this.reorderSupernodeLinks(this.supernodeOutputLinks, "output");

		// Remove input/output links from edge nodes in sub-pipline.
		this.supernodeInputLinksModified.forEach((inputLink) => {
			this.removeLinkFromSubflow(inputLink, false);
		});
		this.supernodeOutputLinksModified.forEach((outputLink) => {
			this.removeLinkFromSubflow(outputLink, false);
		});

		// Sub-Pipeline
		this.subPipeline =
			this.objectModel.createPipeline(this.subflowNodes, this.subflowComments, this.subflowLinks);
		this.subAPIPipeline = this.objectModel.getAPIPipeline(this.subPipeline.id);

		this.createBindingNodeData = [];

		// Supernode
		this.supernode = this.createSupernode();

		// Links to and from supernode.
		this.linkSrcDefs = [];
		this.linkTrgDefs = [];
		this.supernodeInputLinksModified.forEach((link) => {
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
		});
		this.supernodeOutputLinksModified.forEach((link) => {
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
		const boundingRectPadding = 80;
		let entryBindingYPos = this.subflowRect.y - boundingRectPadding;
		let exitBindingYPos = this.subflowRect.y - boundingRectPadding;

		this.createBindingNodeData.forEach((bindingNodeData) => {
			const bindingNodePort = Object.assign({}, bindingNodeData.port);
			if (bindingNodeData.type === "entry") {
				const pos = { x: this.subflowRect.x - (boundingRectPadding * 2), y: entryBindingYPos += boundingRectPadding };
				bindingNodePort.id = bindingNodePort.id ? "output_" + bindingNodePort.id : bindingNodePort.id;
				const inputBindingNode = this.createBindingNode(bindingNodeData.link, { outputs: [bindingNodePort] }, pos);

				this.supernodeBindingNodesMappedToParentFlowData[inputBindingNode.id] = {
					portId: bindingNodeData.port.id,
					link: bindingNodeData.link
				};
				inputBindingNode.isSupernodeInputBinding = true;
				this.supernodeEntryBindingNodes.push(inputBindingNode);
			} else {
				const pos = { x: this.subflowRect.x + this.subflowRect.width + boundingRectPadding, y: exitBindingYPos += boundingRectPadding };
				bindingNodePort.id = bindingNodePort.id ? "input_" + bindingNodePort.id : bindingNodePort.id;
				const outputBindingNode = this.createBindingNode(bindingNodeData.link, { inputs: [bindingNodePort] }, pos);
				this.supernodeBindingNodesMappedToParentFlowData[outputBindingNode.id] = {
					portId: bindingNodeData.port.id,
					link: bindingNodeData.link
				};
				outputBindingNode.isSupernodeOutputBinding = true;
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

		if (this.data.externalUrl) {
			const supernodes = CanvasUtils.filterSupernodes(this.subflowNodes);
			const descPipelines = this.objectModel.getDescendantPipelinesForSupernodes(supernodes);
			this.descPipelines = descPipelines.filter((p) => !p.parentUrl); // Filter the local pipelines

			this.newPipelineFlow =
				this.objectModel.createExternalPipelineFlowTemplate(
					this.data.externalPipelineFlowId, this.supernode.subflow_ref.pipeline_id_ref);
		}
	}

	createSupernode() {
		// Determine which port from input link's target node should be a supernode input port
		// and create a binding node for the port in the supernode.
		const supernodeInputPorts = [];
		this.supernodeInputLinksModified.forEach((link) => {
			const node = this.apiPipeline.getNode(link.trgNodeId);
			this.createSupernodePorts(node, link, supernodeInputPorts, "entry");
		});

		// Determine which port from output link's source node should be a supernode output port
		// and create a binding node for the port in the supernode.
		const supernodeOutputPorts = [];
		this.supernodeOutputLinksModified.forEach((link) => {
			const node = this.apiPipeline.getNode(link.srcNodeId);
			this.createSupernodePorts(node, link, supernodeOutputPorts, "exit");
		});

		const supernodeTemplate = {
			label: this.getLabel("supernode.template.label"),
			description: this.getLabel("supernode.template.description"),
			image: this.data.externalUrl ? USE_DEFAULT_EXT_ICON : USE_DEFAULT_ICON,
			inputs: supernodeInputPorts,
			outputs: supernodeOutputPorts,
			type: SUPER_NODE,
			subflow_ref: {
				pipeline_id_ref: this.subPipeline.id
			},
		};

		if (this.data.externalUrl) {
			supernodeTemplate.subflow_ref.url = this.data.externalUrl;
		}

		const topLeftNode = this.getTopLeftNode(this.subflowNodes);

		// Place the new supernode at the same position as the node which is
		// closest to the top left corner of the rectangle surrounding the
		// selected nodes.
		const supernodeData = {
			nodeTemplate: supernodeTemplate,
			offsetX: topLeftNode.x_pos,
			offsetY: topLeftNode.y_pos
		};

		return this.apiPipeline.createNode(supernodeData);
	}

	// Reorder the links in the same order the ports are defined in the binding nodes.
	reorderSupernodeLinks(links, type) {
		if (links.length > 1) {
			const supernodeLinks = [...links];

			const portType = type === "input" ? "inputs" : "outputs";
			const linkNodeType = type === "input" ? "trgNodeId" : "srcNodeId";
			const linkNodePortType = type === "input" ? "trgNodePortId" : "srcNodePortId";

			const subBindingNodes = [];
			supernodeLinks.forEach((link) => {
				if (!subBindingNodes.find((subBindingNode) => (subBindingNode.id === link[linkNodeType]))) {
					subBindingNodes.push(this.apiPipeline.getNode(link[linkNodeType]));
				}
			});

			// Sort the nodes in the order they appear on the screen from top to bottom.
			subBindingNodes.sort((a, b) => {
				if (a.y_pos < b.y_pos) {
					return -1;
				}
				if (a.y_pos > b.y_pos) {
					return 1;
				}
				return 0;
			});

			let reorderedSupernodeLinks = [];
			subBindingNodes.forEach((bindingNode) => {
				const nodePorts = bindingNode[portType];
				const firstPort = nodePorts[0];
				nodePorts.forEach((port) => {
					let correspondingLinks = supernodeLinks.filter((link) =>
						(link[linkNodePortType] === port.id || typeof link[linkNodePortType] === "undefined" || link[linkNodePortType] === null) &&
							link[linkNodeType] === bindingNode.id);
					// If any link has an undefined nodePortId, assign the first portId.
					correspondingLinks = correspondingLinks.map((link) => {
						const newLink = Object.assign({}, link);
						newLink[linkNodePortType] = newLink[linkNodePortType] ? newLink[linkNodePortType] : firstPort.id;
						return newLink;
					});

					correspondingLinks.forEach((correspondingLink) => {
						if (!reorderedSupernodeLinks.find((reorderedSupernodeLink) => (reorderedSupernodeLink.id === correspondingLink.id))) {
							reorderedSupernodeLinks = reorderedSupernodeLinks.concat(correspondingLink);
						}
					});
				});
			});
			return reorderedSupernodeLinks;
		}
		return links;
	}

	// Returns the node positioned closest to the top left corner of the
	// bounding rectangle for all selected nodes.
	getTopLeftNode(listOfNodes) {
		let closestNode = listOfNodes[0];
		let shortestDistance = this.getDistanceFromPosition(this.subflowRect.x, this.subflowRect.y, listOfNodes[0]);
		listOfNodes.forEach((node) => {
			const distance = this.getDistanceFromPosition(this.subflowRect.x, this.subflowRect.y, node);
			if (distance < shortestDistance) {
				shortestDistance = distance;
				closestNode = node;
			}
		});

		return closestNode;
	}

	// Pythagorean Theorem.
	getDistanceFromPosition(x, y, node) {
		const a = node.x_pos - x;
		const b = node.y_pos - y;
		return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	}

	createSupernodePorts(node, link, supernodePorts, type) {
		const portType = type === "entry" ? "inputs" : "outputs";
		const linkNodePortType = type === "entry" ? "trgNodePortId" : "srcNodePortId";

		if (typeof link[linkNodePortType] !== "undefined" && link[linkNodePortType] !== null) {
			node[portType].forEach((port) => {
				if (link[linkNodePortType] === port.id) {
					const newPort = Object.assign({}, port);
					newPort.id = port.id ? node.id + "_" + port.id : port.id;
					newPort.label = this.getLabel("supernode.new.port.label");
					this.addToCreateBindingNodeData(node.id, newPort, link, supernodePorts, type);
				}
			});
		} else { // Add the first port.
			const newPort = Object.assign({}, node[portType][0]);
			newPort.id = newPort.id ? node.id + "_" + newPort.id : newPort.id;
			newPort.label = this.getLabel("supernode.new.port.label");
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
			description: this.getLabel("supernode.binding.node.description"),
			label: this.getLabel("supernode.binding.node.label"),
			type: "binding"
		};

		const bindingNodeData = {
			editType: "createNode",
			nodeTemplate: Object.assign(bindingNodeTemplate, bindingNodePort),
			offsetX: pos.x,
			offsetY: pos.y
		};

		return this.subAPIPipeline.createNode(bindingNodeData);
	}

	getLabel(labelId) {
		return this.intl.formatMessage({ id: labelId, defaultMessage: defaultMessages[labelId] });
	}

	removeLinkFromSubflow(link, deleteLink) {
		this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== link.id);
		if (deleteLink) {
			this.linksToDelete.push(link);
		}
	}

	// Return augmented command object which will be passed to the client app.
	getData() {
		this.data.newNode = this.supernode;
		this.data.newLinks = this.newLinks;
		this.data.subPipelineId = this.subPipeline.id;
		return this.data;
	}

	// Standard methods
	do() {
		// Delete selected objects from main pipeline.
		this.apiPipeline.deleteNodes(this.subflowNodes, false); // false => don't remove pipelines any supernodes refer to
		this.apiPipeline.deleteComments(this.subflowComments);

		// Delete links from comments that are not in the subpipeline.
		this.apiPipeline.deleteLinks(this.linksToDelete);

		this.apiPipeline.addSupernode(this.supernode, [this.subPipeline]);

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
			this.newLinks.push(this.apiPipeline.createNodeLink(this.linkSrcDefs[idx], this.linkTrgDefs[idx], { type: NODE_LINK }));
		}
		this.apiPipeline.addLinks(this.newLinks);

		// Add the binding nodes to the subflow.
		this.supernodeEntryBindingNodes.forEach((bindingNode) => {
			this.subAPIPipeline.addNode(bindingNode);
		});
		this.supernodeExitBindingNodes.forEach((bindingNode) => {
			this.subAPIPipeline.addNode(bindingNode);
		});

		// Create links to and from the subflow binding nodes.
		this.supernodeNewLinks = [];
		for (let idx = 0; idx < this.bindingNodeLinkSrcDefs.length; idx++) {
			this.supernodeNewLinks.push(
				this.subAPIPipeline.createNodeLink(this.bindingNodeLinkSrcDefs[idx], this.bindingNodeLinkTrgDefs[idx], { type: NODE_LINK }));
		}
		this.subAPIPipeline.addLinks(this.supernodeNewLinks);

		// If we are creating an external supernode create the external flow
		// header info and switch the parentUrls for descendant pipelines (including
		// the newly created pipeline for the newly created supernode).
		if (this.data.externalUrl) {
			this.objectModel.addExternalPipelineFlow(this.newPipelineFlow, this.data.externalUrl, null, false);
			const pipelines = [this.subPipeline].concat(this.descPipelines);
			this.objectModel.setParentUrl(pipelines, this.data.externalUrl);
		}
	}

	undo() {
		if (this.data.externalUrl) {
			// Delete the parentUrl from the pipelines and make them local again.
			this.objectModel.setParentUrl(this.descPipelines);
			this.objectModel.removeExternalPipelineFlow(this.data.externalUrl);
		}

		// Delete the supernode and also the sub-pipeline it references. We do
		// not delete lower level sub-pipelines (i.e. ones that supernodes
		// in this sub-pipeline refer to) because any supernodes
		// added back in the next step will need them.
		this.apiPipeline.deleteSupernodes([this.supernode], [this.subPipeline], []);

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
