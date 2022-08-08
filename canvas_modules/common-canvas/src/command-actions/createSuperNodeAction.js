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
	constructor(data, objectModel, labelUtil, useCardFromOriginalPorts) {
		super(data);
		this.labelUtil = labelUtil;
		this.data = data;
		this.useCardFromOriginalPorts = useCardFromOriginalPorts;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);

		this.subflowNodes = this.objectModel.getSelectedNodes();
		this.subflowComments = this.objectModel.getSelectedComments();
		this.subflowRect = this.apiPipeline.getBoundingRectForNodes(this.subflowNodes);

		this.linksToDelete = [];

		// Get the subflow links - this is all links which go to and from the nodes
		// and comments that are to be included in the subflow. No link is repeated
		// in the arrays.
		const uniqueSubflowLinks = this.getUniqueSubflowLinks(this.data.selectedObjectIds);
		this.subflowNodeLinks = this.getSubflowNodeLinks(uniqueSubflowLinks);
		this.subflowCommentLinks = this.getSubflowCommentLinks(uniqueSubflowLinks);

		// Filter comment links to remove any un-needed links
		this.subflowCommentLinks = this.filterCommentLinks(this.subflowCommentLinks, this.subflowComments);

		// Create an array with both node and comment links
		this.subflowLinks = this.subflowNodeLinks.concat(this.subflowCommentLinks);

		// Determine supernode input and output links. These functions will also
		// add links to this.subFlowLinks and this.linksToDelete arrays.
		this.subflowInputLinks = this.createOrderedSubflowInputLinks(this.subflowNodeLinks);
		this.subflowOutputLinks = this.createOrderedSubflowOutputLinks(this.subflowNodeLinks);

		// Create the new sub-pipeline which will be referenced by the supernode.
		this.subPipeline = this.objectModel.createPipeline(this.subflowNodes, this.subflowComments, this.subflowLinks);

		// Create an API pipeline for the new pipeline so we can call helper functions on it.
		this.subAPIPipeline = this.objectModel.getAPIPipeline(this.subPipeline.id);

		// Create binding input/output data objects cotaining port and link.
		this.bindingInputData = this.getBindingInputData(this.subflowInputLinks, this.subflowRect);
		this.bindingOutputData = this.getBindingOutputData(this.subflowOutputLinks, this.subflowRect);

		// Create Supernode using previously created input and output ports.
		this.supernode = this.createSupernode(this.bindingInputData, this.bindingOutputData);

		// Create definitions for links to and from supernode.
		this.supernodeLinkDefs = this.createSupernodeLinkDefs(this.bindingInputData, this.bindingOutputData, this.supernode);

		// Create links to and from subflow binding nodes.
		this.bindingNodeLinkDefs = this.createBindingNodeLinkDefs(this.bindingInputData, this.bindingOutputData);

		// Handle external subflows in supernode
		if (this.data.externalUrl) {
			this.handleExternalSubflow();
		}
	}

	// Returns an object containing two links arrays (node links and comment links)
	// for the selected nodes.
	getUniqueSubflowLinks(selectedObjectIds) {
		const uniqueSubflowLinks = [];

		// Separate the comment links and node links for each selected object.
		selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// Ensure each link is only stored once.
			objectLinks.forEach((objectLink) => {
				if (!uniqueSubflowLinks.find((link) => (link.id === objectLink.id))) {
					uniqueSubflowLinks.push(objectLink);
				}
			});
		});

		return uniqueSubflowLinks;
	}


	// Returns an object containing two links arrays (node links and comment links)
	// for the selected nodes.
	getSubflowNodeLinks(uniqueSubflowLinks) {
		return uniqueSubflowLinks.filter((link) => (link.type === NODE_LINK || link.type === ASSOCIATION_LINK));
	}

	// Returns an object containing two links arrays (node links and comment links)
	// for the selected nodes.
	getSubflowCommentLinks(uniqueSubflowLinks) {
		return uniqueSubflowLinks.filter((link) => (link.type === COMMENT_LINK));
	}

	// Filters the array of comment links passed in so that links that should
	// NOT be in the subflow are removed. This method may also adjust
	// this.subflowComments and this.linksToDelete.
	filterCommentLinks(subflowCommentLinks, subflowComments) {
		let filteredLinks = [];

		// Determine if the comment should be brought into the supernode.
		subflowCommentLinks.forEach((link) => {
			const comment = this.apiPipeline.getComment(link.srcNodeId);

			// Include links that are connected to selected comments.
			if (this.apiPipeline.isObjectIdInObjects(comment.id, this.subflowComments)) {
				filteredLinks.push(link);

			// Include links that are connected to nonselected comments and connected
			// to selected nodes AND include their comment in the subflow as well.
			} else if (!this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				filteredLinks.push(link);
				this.subflowComments.push(comment); // Intrinsically, add nonselected comment.

			// Do not include any other links in the subflow. These will be links
			// from nonselected comments to nonselected nodes. Such links will have
			// been included in the comment links if the comment has another link
			// to a selected node. These links will be deleted from the main flow
			// instead.
			} else {
				this.linksToDelete.push(link);
			}
		});

		filteredLinks = this.removeCommentLinksToUnselectedNodes(filteredLinks, subflowComments);

		return filteredLinks;
	}

	// Handles all instances where a subflow comment (that is being included in
	// the subflow) is also linked to a non-selectd node (that is, a node that is
	// NOT being inlcuded in the subflow). This method will alter
	// this.subflowLinks and this.linkToDelete.
	removeCommentLinksToUnselectedNodes(inSubflowCommentLinks, subflowComments) {
		let subflowCommentLinks = inSubflowCommentLinks;
		const commentsToUnlinkFromUnselectedNodes = [];

		// Do not move a selected comment to supernode if it is linked to an nonselected node or comment.
		for (const comment of subflowComments) {
			if (this.apiPipeline.isCommentLinkedToNonSelectedNodes(comment.id)) {
				commentsToUnlinkFromUnselectedNodes.push(comment);
			}
		}

		// If selected comments have links to nonselected nodes, break the links to nonselected nodes.
		commentsToUnlinkFromUnselectedNodes.forEach((comment) => {
			const commentLinks = this.apiPipeline.getLinksContainingId(comment.id);
			commentLinks.forEach((link) => {
				if ((!this.apiPipeline.isObjectIdInObjects(link.trgNodeId, this.subflowNodes)) &&
						(!this.apiPipeline.isObjectIdInObjects(link.id, this.linksToDelete))) {
					subflowCommentLinks = subflowCommentLinks.filter((superLink) => superLink.id !== link.id);
					this.linksToDelete.push(link);
				}
			});
		});
		return subflowCommentLinks;
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

	// Handles the subflow when an external pipeline flow is required.
	handleExternalSubflow() {
		const supernodes = CanvasUtils.filterSupernodes(this.subflowNodes);
		const descPipelines = this.objectModel.getDescendantPipelinesForSupernodes(supernodes);
		this.descPipelines = descPipelines.filter((p) => !p.parentUrl); // Filter the local pipelines

		this.newPipelineFlow =
			this.objectModel.createExternalPipelineFlowTemplate(
				this.data.externalPipelineFlowId, this.supernode.subflow_ref.pipeline_id_ref);
	}

	createSupernode(bindingInputData, bindingOutputData) {
		const supernodeInputPorts = bindingInputData.map((bnd) => bnd.supernodePort);
		const supernodeOutputPorts = bindingOutputData.map((bnd) => bnd.supernodePort);

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
	// the canvas. This helps us position the ports in the supernode so they
	// will be created so the link lines do not cross.
	reorderSubflowLinks(links, type) {
		if (links.length > 1) {
			const supernodeLinks = [...links];
			const nodeId = type === "input" ? "srcNodeId" : "trgNodeId";
			const pos = type === "input" ? "srcPos" : "trgPos";

			// Sort the nodes in the order they appear on the screen from top to bottom.
			supernodeLinks.sort((a, b) => {
				const nodeA = this.apiPipeline.getNode(a[nodeId]);
				const nodeB = this.apiPipeline.getNode(b[nodeId]);

				const aYcoord = a[pos] ? a[pos].y_pos : nodeA.y_pos;
				const bYcoord = b[pos] ? b[pos].y_pos : nodeB.y_pos;

				if (aYcoord < bYcoord) {
					return -1;
				}
				if (aYcoord > bYcoord) {
					return 1;
				}
				return 0;
			});
			return supernodeLinks;

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
	getBindingInputData(subflowInputLinks, subflowRect) {
		const bindingInputData = [];

		// Determine relative position of the binding nodes in the subflow.
		let entryBindingYPos = subflowRect.y - BOUNDING_RECT_PADDING;

		subflowInputLinks.forEach((link) => {
			const trgNode = this.apiPipeline.getNode(link.trgNodeId);

			const supernodePort = Object.assign({}, this.findPort(link.trgNodePortId, trgNode.inputs));
			supernodePort.id = this.generateUniquePortId(supernodePort, link.trgNodeId, bindingInputData);
			supernodePort.label = this.labelUtil.getLabel("supernode.new.port.label");
			if (!this.useCardFromOriginalPorts) {
				supernodePort.cardinality = {
					min: 0,
					max: 1
				};
			}

			const bindingNodePort = Object.assign({}, supernodePort);
			const pos = {
				x: subflowRect.x - (BOUNDING_RECT_PADDING * 2),
				y: entryBindingYPos += BOUNDING_RECT_PADDING
			};
			bindingNodePort.id = bindingNodePort.id ? "output_" + bindingNodePort.id : bindingNodePort.id;
			const inputBindingNode = this.createBindingNode(link, { outputs: [bindingNodePort], isSupernodeInputBinding: true }, pos);

			bindingInputData.push({
				link: link,
				supernodePort: supernodePort,
				bindingNode: inputBindingNode
			});
		});
		return bindingInputData;
	}

	// Returns an array of data objects that for binding the output links. That,
	// is for each output link a binding input data object is created that contains
	// the link and a new port that can be added to the supernode. The port will
	// have a unique ID within the scope of the output ports for the supernode.
	getBindingOutputData(subflowOutputLinks, subflowRect) {
		const bindingOutputData = [];

		// Determine relative position of the binding nodes in the subflow.
		let exitBindingYPos = subflowRect.y - BOUNDING_RECT_PADDING;

		subflowOutputLinks.forEach((link) => {
			const srcNode = this.apiPipeline.getNode(link.srcNodeId);

			const supernodePort = Object.assign({}, this.findPort(link.srcNodePortId, srcNode.outputs));
			supernodePort.id = this.generateUniquePortId(supernodePort, link.srcNodeId, bindingOutputData);
			supernodePort.label = this.labelUtil.getLabel("supernode.new.port.label");
			if (!this.useCardFromOriginalPorts) {
				supernodePort.cardinality = {
					min: 0,
					max: 1
				};
			}

			const bindingNodePort = Object.assign({}, supernodePort);
			const pos = {
				x: subflowRect.x + subflowRect.width + BOUNDING_RECT_PADDING,
				y: exitBindingYPos += BOUNDING_RECT_PADDING
			};
			bindingNodePort.id = bindingNodePort.id ? "input_" + bindingNodePort.id : bindingNodePort.id;
			const outputBindingNode = this.createBindingNode(link, { inputs: [bindingNodePort], isSupernodeOutputBinding: true }, pos);

			bindingOutputData.push({
				link: link,
				supernodePort: supernodePort,
				bindingNode: outputBindingNode
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
		const foundIds = bindingNodeData.filter((bnd) => (bnd.supernodePort.id.startsWith(id)));
		return foundIds.length;
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
	createSupernodeLinkDefs(bindingInputData, bindingOutputData, supernode) {
		const linkDefs = [];

		bindingInputData.forEach((bnd) => {
			const linkData = { srcInfo: {}, trgInfo: {} };
			if (bnd.link.srcPos) {
				linkData.srcInfo.srcPos = bnd.link.srcPos;
			} else {
				linkData.srcInfo.id = bnd.link.srcNodeId;
				linkData.srcInfo.portId = bnd.link.srcNodePortId;
			}

			linkData.trgInfo.id = supernode.id;
			linkData.trgInfo.portId = bnd.supernodePort.id;
			linkDefs.push(linkData);
		});

		bindingOutputData.forEach((bnd) => {
			const linkData = { srcInfo: {}, trgInfo: {} };
			linkData.srcInfo.id = supernode.id;
			linkData.srcInfo.portId = bnd.supernodePort.id;

			if (bnd.link.trgPos) {
				linkData.trgInfo.trgPos = bnd.link.trgPos;
			} else {
				linkData.trgInfo.id = bnd.link.trgNodeId;
				linkData.trgInfo.portId = bnd.link.trgNodePortId;
			}
			linkDefs.push(linkData);
		});

		return linkDefs;
	}

	// Create links to and from subflow binding nodes.
	createBindingNodeLinkDefs(bindingInputData, bindingOutputData) {
		const linkDefs = [];

		bindingInputData.forEach((bnd) => {
			linkDefs.push({
				srcInfo: {
					id: bnd.bindingNode.id,
					portId: bnd.bindingNode.outputs[0].id
				},
				trgInfo: {
					id: bnd.link.trgNodeId,
					portId: bnd.link.trgNodePortId
				}
			});
		});

		bindingOutputData.forEach((bnd) => {
			linkDefs.push({
				srcInfo: {
					id: bnd.link.srcNodeId,
					portId: bnd.link.srcNodePortId
				},
				trgInfo: {
					id: bnd.bindingNode.id,
					portId: bnd.bindingNode.inputs[0].id
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
		this.bindingInputData.forEach((bnd) => {
			this.apiPipeline.setInputPortSubflowNodeRef(this.supernode.id, bnd.supernodePort.id, bnd.bindingNode.id);
		});
		this.bindingOutputData.forEach((bnd) => {
			this.apiPipeline.setOutputPortSubflowNodeRef(this.supernode.id, bnd.supernodePort.id, bnd.bindingNode.id);
		});

		// Create new links to and from supernode in the main flow. We can only
		// do this AFTER the supernode has been added to the canvas otherwise the
		// links cannot be created in the object model.
		this.newLinks = [];
		this.supernodeLinkDefs.forEach((linkDef) => {
			this.newLinks.push(
				this.apiPipeline.createNodeLink(linkDef.srcInfo, linkDef.trgInfo, { type: NODE_LINK })
			);
		});
		this.apiPipeline.addLinks(this.newLinks);

		// Add the binding nodes to the subflow.
		this.bindingInputData.forEach((bnd) => {
			this.subAPIPipeline.addNode(bnd.bindingNode);
		});
		this.bindingOutputData.forEach((bnd) => {
			this.subAPIPipeline.addNode(bnd.bindingNode);
		});

		// Create links to and from the subflow binding nodes.
		this.subflowNewLinks = [];
		this.bindingNodeLinkDefs.forEach((linkDef) => {
			this.subflowNewLinks.push(
				this.subAPIPipeline.createNodeLink(linkDef.srcInfo, linkDef.trgInfo, { type: NODE_LINK })
			);
		});
		this.subAPIPipeline.addLinks(this.subflowNewLinks);

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
