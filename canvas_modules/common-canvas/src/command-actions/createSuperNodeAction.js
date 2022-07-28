/*
 * Copyright 2017-2022 Elyra Authors
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

const BOUNDING_RECT_PADDING = 80;

export default class CreateSuperNodeAction extends Action {
	constructor(data, objectModel, labelUtil) {
		super(data);
		this.labelUtil = labelUtil;
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
				if ((objectLink.type === NODE_LINK || objectLink.type === ASSOCIATION_LINK) &&
						(!this.subflowLinks.find((link) => (link.id === objectLink.id)))) {
					this.subflowLinks.push(objectLink);
				// Do not add any comment links to the supernode at this moment.
				} else if (objectLink.type === COMMENT_LINK &&
								(!this.commentLinks.find((link) => (link.id === objectLink.id)))) {
					this.commentLinks.push(objectLink);
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

		// Determine supernode input and output links. These functions will also
		// add links to this.subFlowLinks and this.linksToDelete arrays.
		const subflowNodeLinks = this.apiPipeline.getNodeLinks(this.subflowNodes);
		this.subflowInputLinks = this.createOrderedSubflowInputLinks(subflowNodeLinks);
		this.subflowOutputLinks = this.createOrderedSubflowOutputLinks(subflowNodeLinks);

		// Create the new sub-pipeline which will be referenced by the supernode.
		this.subPipeline =
			this.objectModel.createPipeline(this.subflowNodes, this.subflowComments, this.subflowLinks);
		this.subAPIPipeline = this.objectModel.getAPIPipeline(this.subPipeline.id);

		// Create binding input/output data objects cotaining port and link.
		this.bindingInputData = this.getBindingInputData(this.subflowInputLinks);
		this.bindingOutputData = this.getBindingOutputData(this.subflowOutputLinks);

		// Create Supernode using previously created input and output ports.
		const supernodeInputPorts = this.bindingInputData.map((nodeData) => nodeData.port);
		const supernodeOutputPorts = this.bindingOutputData.map((nodeData) => nodeData.port);
		this.supernode = this.createSupernode(supernodeInputPorts, supernodeOutputPorts);

		// Create definitions for links to and from supernode.
		this.linkDefs = this.createLinkDefs(this.bindingInputData, this.bindingOutputData, this.supernode);

		// Keep a map of which supernode port the subflow binding node links to
		// and the link the subflow binding node needs to read from to connect
		// to the correct node in the subflow.
		this.supernodeBindingNodesMappedToParentFlowData = [];

		// Create subflow binding nodes.
		this.supernodeEntryBindingNodes = this.createEntryBindingNodes(this.bindingInputData, this.subflowRect);
		this.supernodeExitBindingNodes = this.createExitBindingNodes(this.bindingOutputData, this.subflowRect);

		// Create links to and from subflow binding nodes.
		this.bindingNodeLinkSrcDefs = [];
		this.bindingNodeLinkTrgDefs = [];
		this.supernodeEntryBindingNodes.forEach((bindingNode) => {
			const link = this.supernodeBindingNodesMappedToParentFlowData[bindingNode.id].link;
			this.bindingNodeLinkSrcDefs.push({
				id: bindingNode.id,
				portId: bindingNode.outputs[0].id
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
				portId: bindingNode.inputs[0].id
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

	// Returns an array of ordered supernode input links. These are the links
	// on the original flow that input into the set of node selected for the
	// supernode. They are ordered by
	createOrderedSubflowInputLinks(subflowNodeLinks) {
		let subflowInputLinks = [];

		subflowNodeLinks.forEach((link) => {
			if ((!this.apiPipeline.isObjectIdInObjects(link.srcNodeId, this.subflowNodes)) &&
					(!subflowInputLinks.find((inLink) => (inLink.id === link.trgNodeId)))) {
				if (link.type === ASSOCIATION_LINK) { // Break off associationLink.
					this.removeLinkFromSubflow(link, true);
				} else {
					subflowInputLinks.push(link);
					this.removeLinkFromSubflow(link, false);
				}
			}
		});
		// Reorder the supernode input links to the correct order.
		subflowInputLinks = this.reorderSubflowLinks(subflowInputLinks, "input");
		return subflowInputLinks;
	}

	// Determine supernode output links.
	createOrderedSubflowOutputLinks(subflowNodeLinks) {
		let subflowOutputLinks = [];

		subflowNodeLinks.forEach((link) => {
			if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) &&
					(!subflowOutputLinks.find((outLink) => (outLink.id === link.srcNodeId)))) {
				if (link.type === ASSOCIATION_LINK) { // Break off associationLink.
					this.removeLinkFromSubflow(link, true);
				} else {
					subflowOutputLinks.push(link);
					this.removeLinkFromSubflow(link, false);
				}
			}
		});
		// Reorder the supernode output links to the correct order.
		subflowOutputLinks = this.reorderSubflowLinks(subflowOutputLinks, "output");
		return subflowOutputLinks;
	}

	createSupernode(supernodeInputPorts, supernodeOutputPorts) {
		const supernodeTemplate = {
			label: this.labelUtil.getLabel("supernode.template.label"),
			description: this.labelUtil.getLabel("supernode.template.description"),
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

	// Reorder the links in the same vertical order as the connected nodes on
	// the canvas and, if necessary, the ports within the nodes. This helps us
	// position the ports in the supernode that will be created so that the
	// link lines do not cross.
	reorderSubflowLinks(links, type) {
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

	// Returns an array of data objects that for binding the input links. That,
	// is for each input link a binding input data object is created that contains
	// the link and a new port that can be added to the supernode. The port will
	// have a unique ID within the scope of the input ports for the supernode.
	getBindingInputData(subflowInputLinks) {
		const bindingInputData = [];

		subflowInputLinks.forEach((link) => {
			const trgNode = this.apiPipeline.getNode(link.trgNodeId);

			const newPort = Object.assign({}, this.findPort(link.trgNodePortId, trgNode.inputs));
			newPort.id = this.generateUniquePortId(newPort, link.trgNodeId, bindingInputData);
			newPort.label = this.labelUtil.getLabel("supernode.new.port.label");
			newPort.cardinality = {
				min: 0,
				max: 1
			};
			bindingInputData.push({
				link: link,
				port: newPort
			});
		});
		return bindingInputData;
	}

	// Returns an array of data objects that for binding the output links. That,
	// is for each output link a binding input data object is created that contains
	// the link and a new port that can be added to the supernode. The port will
	// have a unique ID within the scope of the output ports for the supernode.
	getBindingOutputData(subflowOutputLinks) {
		const bindingOutputData = [];

		subflowOutputLinks.forEach((link) => {
			const srcNode = this.apiPipeline.getNode(link.srcNodeId);

			const newPort = Object.assign({}, this.findPort(link.srcNodePortId, srcNode.outputs));
			newPort.id = this.generateUniquePortId(newPort, link.srcNodeId, bindingOutputData);
			newPort.label = this.labelUtil.getLabel("supernode.new.port.label");
			newPort.cardinality = {
				min: 0,
				max: 1
			};
			bindingOutputData.push({
				link: link,
				port: newPort
			});
		});
		return bindingOutputData;
	}

	findPort(nodePortId, ports) {
		if (typeof nodePortId !== "undefined" && nodePortId !== null) {
			const found = CanvasUtils.getPort(nodePortId, ports);
			if (found) {
				return found;
			}
		}
		return ports[0];
	}

	generateUniquePortId(port, nodeId, bindingNodeData) {
		let newId = port.id ? nodeId + "_" + port.id : port.id;
		const count = this.occurancesStartingWith(newId, bindingNodeData);
		if (count > 0) {
			newId += "_" + count;
		}
		return newId;
	}

	occurancesStartingWith(id, bindingNodeData) {
		const foundIds = bindingNodeData.filter((bnd) => (bnd.port.id.startsWith(id)));
		return foundIds.length;
	}

	createEntryBindingNodes(bindingInputData, subflowRect) {
		const supernodeEntryBindingNodes = [];

		// Determine relative position of the binding nodes in the subflow.
		let entryBindingYPos = subflowRect.y - BOUNDING_RECT_PADDING;

		bindingInputData.forEach((bnd) => {
			const bindingNodePort = Object.assign({}, bnd.port);

			const pos = {
				x: subflowRect.x - (BOUNDING_RECT_PADDING * 2),
				y: entryBindingYPos += BOUNDING_RECT_PADDING
			};
			bindingNodePort.id = bindingNodePort.id ? "output_" + bindingNodePort.id : bindingNodePort.id;
			const inputBindingNode = this.createBindingNode(bnd.link, { outputs: [bindingNodePort], isSupernodeInputBinding: true }, pos);
			this.supernodeBindingNodesMappedToParentFlowData[inputBindingNode.id] = {
				portId: bnd.port.id,
				link: bnd.link
			};

			supernodeEntryBindingNodes.push(inputBindingNode);
		});
		return supernodeEntryBindingNodes;
	}

	createExitBindingNodes(bindingOutputData, subflowRect) {
		const supernodeExitBindingNodes = [];

		// Determine relative position of the binding nodes in the subflow.
		let exitBindingYPos = subflowRect.y - BOUNDING_RECT_PADDING;

		bindingOutputData.forEach((bnd) => {
			const bindingNodePort = Object.assign({}, bnd.port);
			const pos = {
				x: subflowRect.x + subflowRect.width + BOUNDING_RECT_PADDING,
				y: exitBindingYPos += BOUNDING_RECT_PADDING
			};
			bindingNodePort.id = bindingNodePort.id ? "input_" + bindingNodePort.id : bindingNodePort.id;
			const outputBindingNode = this.createBindingNode(bnd.link, { inputs: [bindingNodePort], isSupernodeOutputBinding: true }, pos);
			this.supernodeBindingNodesMappedToParentFlowData[outputBindingNode.id] = {
				portId: bnd.port.id,
				link: bnd.link
			};
			supernodeExitBindingNodes.push(outputBindingNode);
		});
		return supernodeExitBindingNodes;
	}

	createBindingNode(link, portsData, pos) {
		const bindingNodeTemplate = {
			description: this.labelUtil.getLabel("supernode.binding.node.description"),
			label: this.labelUtil.getLabel("supernode.binding.node.label"),
			type: "binding"
		};

		const actionData = {
			editType: "createNode",
			nodeTemplate: Object.assign(bindingNodeTemplate, portsData),
			offsetX: pos.x,
			offsetY: pos.y
		};

		return this.subAPIPipeline.createNode(actionData);
	}

	removeLinkFromSubflow(link, deleteLink) {
		this.subflowLinks = this.subflowLinks.filter((superLink) => superLink.id !== link.id);
		if (deleteLink) {
			this.linksToDelete.push(link);
		}
	}

	// Create an array of link definitions that define the links between the
	// supernode in/out ports and surrounding input/output nodes.
	createLinkDefs(bindingInputData, bindingOutputData, supernode) {
		const linkDefs = [];

		bindingInputData.forEach((bnd) => {
			linkDefs.push({
				linkSrcDef: {
					id: bnd.link.srcNodeId,
					portId: bnd.link.srcNodePortId
				},
				linkTrgDef: {
					id: supernode.id,
					portId: bnd.port.id
				}
			});
		});

		bindingOutputData.forEach((bnd) => {
			linkDefs.push({
				linkSrcDef: {
					id: supernode.id,
					portId: bnd.port.id
				},
				linkTrgDef: {
					id: bnd.link.trgNodeId,
					portId: bnd.link.trgNodePortId
				}
			});
		});

		return linkDefs;
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

		// Create new links to and from supernode in the main flow. We can only
		// do this AFTER the supernode has been added to the canvas otherwise the
		// links cannot be created in the object model.
		this.newLinks = [];
		for (let idx = 0; idx < this.linkDefs.length; idx++) {
			const link = this.apiPipeline.createNodeLink(this.linkDefs[idx].linkSrcDef, this.linkDefs[idx].linkTrgDef, { type: NODE_LINK });
			if (link) {
				this.newLinks.push(link);
			}
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
		this.apiPipeline.addLinks(this.subflowInputLinks);
		this.apiPipeline.addLinks(this.subflowOutputLinks);
		this.apiPipeline.addLinks(this.linksToDelete);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.createSuperNode", { node_label: this.supernode.label });
	}
}
