/*
 * Copyright 2017-2023 Elyra Authors
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
/* eslint brace-style: "off" */

import { isEmpty } from "lodash";
import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
// import { COMMENT_LINK, NODE_LINK } from "./constants/canvas-constants";
import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK } from "./constants/canvas-constants";


export default class SVGCanvasPipeline {
	constructor(pipelineId, canvasInfo, selectionInfo) {
		this.logger = new Logger("SVGCanvasActivePipeline");
		this.logger.log("constructor - start");

		this.initialize(pipelineId, canvasInfo, selectionInfo);

		this.logger.log("constructor - end");
	}

	initialize(pipelineId, canvasInfo, selectionInfo) {
		this.logger.logStartTimer("initialize");
		this.canvasInfo = canvasInfo;
		this.selections = selectionInfo.pipelineId === pipelineId ? selectionInfo.selections : [];
		this.pipeline = this.getPipeline(pipelineId, canvasInfo);

		// These variables are accessed directly by svg-canvas-renderer
		this.id = this.pipeline.id;
		this.zoom = this.pipeline.zoom;
		this.nodes = this.pipeline.nodes;
		this.comments = this.pipeline.comments;
		this.links = this.pipeline.links;

		// We create mapped arrays for quick lookup
		this.mappedNodes = this.getMappedArray(this.pipeline.nodes);
		this.mappedComments = this.getMappedArray(this.pipeline.comments);
		this.mappedLinks = this.getMappedArray(this.pipeline.links);

		// preProcessPipeline uses the mapped objects so this needs to be done
		// after they have been created.
		this.pipeline = this.preProcessPipeline(this.pipeline);

		// Create a tab objects array for accessibility. Tab objects are the
		// set of objects that tab key will move the focus to on the canvas.
		// They are either solitary comments OR detached links OR 'starting'
		// objects (either a node or semi-detached link) for a connected group
		// of canvas objects. Once the user has tabbed to a starting object he
		// may use the arrow keys to navigate through the group of connected
		// objects.
		this.tabObjects = this.createTabObjectsArray();

		// Keeps track of which tab object is currently active during tabbing.
		this.currentTabObjectIndex = -1;

		// Keeps track of whether we have tabbed in or out of the canvas. It will
		// be false when we have tabbed out.
		this.isTabbedIn = false;

		// Reset the currentTabObjectIndex variable based on the current selection
		// (if there is one).
		this.resetTabGroupIndexBasedOnSelection();

		this.logger.logEndTimer("initialize");
	}

	// Returns an array of tab groups for the active pipeline. Each element of
	// the array is the starting object (node, comment or link) for the group.
	createTabObjectsArray() {
		const objGroups = this.getObjectGroups();

		const entryComments = this.getEntryComments();
		const entryLinks = this.getEntryLinks();
		const entryNodes = this.getEntryNodes();
		const entryNodesForLoops = this.getEntryNodesForLoops(objGroups);

		let tabGroups = [...entryComments, ...entryNodes, ...entryLinks, ...entryNodesForLoops];
		tabGroups = tabGroups.sort(this.sortTabGroups.bind(this));
		return tabGroups;
	}

	getEntryComments() {
		let solitaryComments = this.pipeline.comments.filter((c) => !this.commentHasLinks(c));
		solitaryComments = solitaryComments.map((sc) => ({ type: "comment", obj: sc }));
		return solitaryComments;
	}

	getEntryLinks() {
		let entryLinks = this.pipeline.links.filter((l) => l.srcPos);
		entryLinks = entryLinks.map((el) => ({ type: "link", obj: el }));
		return entryLinks;
	}

	getEntryNodes() {
		let entryNodes = this.pipeline.nodes.filter((n) => !this.nodeHasInputLinks(n));
		entryNodes = entryNodes.map((en) => ({ type: "node", obj: en }));
		return entryNodes;
	}

	getEntryNodesForLoops(objGroups) {
		const loopEntryNodes = [];

		objGroups.forEach((og) => {
			const entryNodes = og.filter((node) => !this.nodeHasInputLinks(node));
			if (entryNodes.length === 0) {
				const loopEntryNode = this.getLoopEntryNode(og);
				loopEntryNodes.push(loopEntryNode);
			}
		});
		return loopEntryNodes;
	}

	getLoopEntryNode(nodeGroup) {
		let entryNode = null;
		let xPos = Infinity;

		nodeGroup.forEach((node) => {
			if (node.x_pos < xPos) {
				entryNode = node;
				xPos = node.x_pos;
			}
		});
		return { type: "node", obj: entryNode };
	}

	getObjectGroups() {
		const objGroups = [];
		let grpNumber = -1;

		// Process nodes and discover the other nodes and comments that are
		// connected to that node. Assign a grp number to each attached node,
		// link and comment.
		this.pipeline.nodes.forEach((n) => {
			if (typeof n.grp === "undefined") {
				const group = [];
				grpNumber++;
				this.getNodesInGroup(n, group, grpNumber);
				objGroups.push(group);
			}
		});

		// Only solitary comments will be left without a grp field because all
		// connected comments will have been handled when the node groups were
		// processed in the loop above -- so assign a new group number to each.
		this.pipeline.comments.forEach((c) => {
			if (typeof c.grp === "undefined") {
				grpNumber++;
				c.grp = grpNumber;
			}
		});

		// Only detached links will be left without a grp field because all
		// connected comments will have been handled when the node groups were
		// processed in the loop above -- so assign a new group number to each.
		this.pipeline.links.forEach((l) => {
			if (typeof l.grp === "undefined") {
				grpNumber++;
				l.grp = grpNumber;
			}
		});

		return objGroups;
	}

	getNodesInGroup(n, group, grpNumber) {
		if (typeof n.grp === "undefined") {
			n.grp = grpNumber;
			group.push(n);

			let inputLinks = this.getInputDataLinks(n);
			inputLinks = inputLinks.map((inLink) => { inLink.grp = grpNumber; return inLink; });

			let outputLinks = this.getOutputDataLinks(n);
			outputLinks = outputLinks.map((outLink) => { outLink.grp = grpNumber; return outLink; });

			let assocLinks = this.getAssociationLinks(n);
			assocLinks = assocLinks.map((assocLink) => { assocLink.grp = grpNumber; return assocLink; });

			let commentLinks = this.getCommentLinks(n);
			commentLinks = commentLinks.map((comLink) => { comLink.grp = grpNumber; return comLink; });

			const srcNodes = this.getSrcNodes(inputLinks);
			const trgNodes = this.getTrgNodes(outputLinks);
			const assocNodes = this.getAssocNodes(assocLinks, n);
			const connComments = this.getConnectedComments(commentLinks);

			srcNodes.forEach((srcNode) => {
				if (typeof srcNode.grp === "undefined") {
					this.getNodesInGroup(srcNode, group, grpNumber);
				}
			});

			trgNodes.forEach((trgNode) => {
				if (typeof trgNode.grp === "undefined") {
					this.getNodesInGroup(trgNode, group, grpNumber);
				}
			});

			assocNodes.forEach((assocNode) => {
				if (typeof assocNode.grp === "undefined") {
					this.getNodesInGroup(assocNode, group, grpNumber);
				}
			});

			connComments.forEach((connComment) => {
				if (typeof connComment.grp === "undefined") {
					connComment.grp = grpNumber;
				}
			});
		}
	}

	getSrcNodes(inputLinks) {
		const srcNodes = [];
		inputLinks.forEach((inLink) => {
			const srcNode = this.getNode(inLink.srcNodeId);
			if (srcNode) {
				srcNodes.push(srcNode);
			}
		});
		return srcNodes;
	}

	getTrgNodes(outputLinks) {
		const trgNodes = [];
		outputLinks.forEach((outLink) => {
			const trgNode = this.getNode(outLink.trgNodeId);
			if (trgNode) {
				trgNodes.push(trgNode);
			}
		});
		return trgNodes;
	}

	getAssocNodes(assocLinks, node) {
		const assocNodes = [];
		assocLinks.forEach((assocLink) => {
			const nodeId = assocLink.srcNodeId === node.id ? assocLink.trgNodeId : assocLink.srcNodeId;
			const assocNode = this.getNode(nodeId);
			if (assocNode) {
				assocNodes.push(assocNode);
			}
		});
		return assocNodes;
	}

	getConnectedComments(commentLinks) {
		const connectedComments = [];
		commentLinks.forEach((commentLink) => {
			const com = this.getComment(commentLink.srcNodeId);
			if (com) {
				connectedComments.push(com);
			}
		});
		return connectedComments;
	}

	sortTabGroups(tg1, tg2) {
		const y1 = this.getTagGroupYCoord(tg1);
		const y2 = this.getTagGroupYCoord(tg2);

		if (y1 > y2) {
			return 1;
		} else if (y1 === y2) {
			const x1 = this.getTagGroupXCoord(tg1);
			const x2 = this.getTagGroupXCoord(tg2);
			if (x1 > x2) {
				return 1;
			}
		}
		return -1;
	}

	getTagGroupYCoord(tg) {
		if (tg.type === "link") {
			return tg.obj.srcPos.y_pos;
		}
		return tg.obj.y_pos;
	}

	getTagGroupXCoord(tg) {
		if (tg.type === "link") {
			return tg.obj.srcPos.x_pos;
		}
		return tg.obj.x_pos;
	}

	getInputDataLinks(node) {
		return this.pipeline.links.filter((l) => l.type === NODE_LINK && l.trgNodeId === node.id);
	}

	getOutputDataLinks(node) {
		return this.pipeline.links.filter((l) => l.type === NODE_LINK && l.srcNodeId === node.id);
	}

	getAssociationLinks(node) {
		return this.pipeline.links.filter((l) => l.type === ASSOCIATION_LINK && (l.srcNodeId === node.id || l.trgNodeId === node.id));
	}

	getCommentLinks(node) {
		return this.pipeline.links.filter((l) => l.type === COMMENT_LINK && l.trgNodeId === node.id);
	}

	// Resets the currentTabObjectIndex variable based on the current selection
	// (if there is one).
	resetTabGroupIndexBasedOnSelection() {
		if (this.selections.length > 0) {
			const lastSelectedObjectId = this.selections[this.selections.length - 1];

			const lastSelectedNode = this.getNode(lastSelectedObjectId);
			if (lastSelectedNode) {
				this.resetTabGroupForObj(lastSelectedNode);
				return;
			}
			const lastSelectedComment = this.getComment(lastSelectedObjectId);
			if (lastSelectedComment) {
				this.resetTabGroupForObj(lastSelectedComment);
				return;
			}
			const lastSelectedLink = this.getLink(lastSelectedObjectId);
			if (lastSelectedLink) {
				this.resetTabGroupForObj(lastSelectedLink);
				return;
			}
		}
		return;
	}

	// Sets the current tab group index to be for the starting node of the group
	// of nodes of which the node passed in is a part.
	resetTabGroupForObj(obj) {
		this.currentTabObjectIndex = this.tabObjects.findIndex((tg) => tg.obj.grp === obj.grp);
		this.isTabbedIn = true;
	}

	nodeHasInputLinks(node) {
		if (node.inputs && node.inputs.length > 0) {
			const linksTo = this.getLinksToNode(node, NODE_LINK);
			return linksTo.length > 0;
		}
		return false;
	}

	commentHasLinks(comment) {
		return this.getLinksFromComment(comment).length > 0;
	}

	resetTabbedStatus() {
		this.isTabbedIn = false;
	}

	getNextTabGroupStartObject() {
		if (!this.isTabbedIn) {
			this.currentTabObjectIndex = -1;

		} else if (this.currentTabObjectIndex === this.tabObjects.length) {
			this.currentTabObjectIndex = -1;
		}

		if (this.currentTabObjectIndex < this.tabObjects.length) {
			this.currentTabObjectIndex++;
			if (this.currentTabObjectIndex < this.tabObjects.length) {
				this.isTabbedIn = true;
				return this.tabObjects[this.currentTabObjectIndex];
			}
		}
		return null;
	}

	getPreviousTabGroupStartObject() {
		if (!this.isTabbedIn) {
			this.currentTabObjectIndex = this.tabObjects.length;

		} else if (this.currentTabObjectIndex === -1) {
			this.currentTabObjectIndex = this.tabObjects.length;
		}

		if (this.currentTabObjectIndex > -1) {
			this.currentTabObjectIndex--;
			if (this.currentTabObjectIndex > -1) {
				this.isTabbedIn = true;
				return this.tabObjects[this.currentTabObjectIndex];
			}
		}
		return null;
	}

	getNextLinksFromNode(node) {
		const linkInfos = [];
		const dataLinksFrom = this.getLinksFromNode(node, NODE_LINK);
		dataLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.getNode(link.trgNodeId) }); });

		const assocLinksFrom = this.getLinksFromNode(node, ASSOCIATION_LINK);
		assocLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.getNode(node.id === link.srcNodeId ? link.trgNodeId : link.srcNodeId) }); });

		const commentLinksFrom = this.getLinksToNode(node, COMMENT_LINK);
		commentLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "comment", obj: this.getComment(link.srcNodeId) }); });

		return linkInfos;
	}

	getNextLinksFromComment(comment) {
		const linkInfos = [];
		const commentLinksFrom = this.getLinksFromComment(comment);
		commentLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.getNode(link.trgNodeId) }); });

		return linkInfos;
	}

	getPreviousLinkToNode(node) {
		let linksFrom = this.getLinksToNode(node, NODE_LINK);
		if (linksFrom.length > 0) {
			return linksFrom[0];
		}
		linksFrom = this.getLinksToNode(node, ASSOCIATION_LINK);
		if (linksFrom.length > 0) {
			return linksFrom[0];
		}
		linksFrom = this.getLinksToNode(node, COMMENT_LINK);
		if (linksFrom.length > 0) {
			return linksFrom[0];
		}
		return null;
	}

	getNextNodeFromDataLink(link) {
		return this.getNode(link.trgNodeId);
	}

	getNextNodeFromAssocLink(link) {
		return this.getNode(link.trgNodeId);
	}

	getNextCommentFromLink(link) {
		return this.getComment(link.srcNodeId);
	}

	getPreviousNodeToLink(link) {
		return this.getNode(link.srcNodeId);
	}

	// Returns an array of links that go to the node passed in, of the type
	// specified.
	getLinksToNode(node, type) {
		return this.pipeline.links.filter((l) => l.type === type && l.trgNodeId === node.id);
	}

	// Returns an array of links that go from the node passed in, of the type
	// specified.
	getLinksFromNode(node, type) {
		return this.pipeline.links.filter((l) => l.type === type && l.srcNodeId === node.id);
	}

	getLinksFromComment(comment) {
		return this.pipeline.links.filter((l) => l.srcNodeId === comment.id);
	}

	getCanvasDimensions(gap) {
		return CanvasUtils.getCanvasDimensions(
			this.pipeline.nodes, this.pipeline.comments,
			this.pipeline.links, gap);
	}

	// Returns the name of the type of object d.
	getObjectTypeName(d) {
		if (this.getComment(d.id)) {
			return "comment";
		} else if (this.getNode(d.id)) {
			return "node";
		}
		return "link";
	}

	getNode(nodeId) {
		const node = this.mappedNodes[nodeId];
		return (typeof node === "undefined") ? null : node;
	}

	// Returns nodes from the active pipeline. If nodeIds is
	// provided as an array the nodes correspondong to those IDs
	// are returned otherwise all nodes are retunred.
	getNodes(nodeIds) {
		if (!nodeIds) {
			return this.pipeline.nodes;
		}
		const nodes = [];
		nodeIds.forEach((nId) => {
			const n = this.getNode(nId);
			if (n) {
				nodes.push(n);
			}
		});
		return nodes;
	}

	getSupernodes() {
		return this.pipeline.nodes.filter((node) => CanvasUtils.isSupernode(node));
	}

	// Returns true if the pipeline is empty except for any binding nodes.
	isEmptyOrBindingsOnly() {
		return (isEmpty(this.pipeline.nodes) || this.containsOnlyBindingNodes()) &&
						isEmpty(this.pipeline.comments);
	}

	containsOnlyBindingNodes() {
		return !this.pipeline.nodes.find((node) => !CanvasUtils.isSuperBindingNode(node));
	}

	getComment(commentId) {
		const com = this.mappedComments[commentId];
		return (typeof com === "undefined") ? null : com;
	}

	getComments(commentIds) {
		const comments = [];
		commentIds.forEach((cId) => {
			const c = this.getComment(cId);
			if (c) {
				comments.push(c);
			}
		});
		return comments;
	}

	getNodesAndComments() {
		return this.pipeline.nodes.concat(this.pipeline.comments);
	}

	getNodeOrComment(id) {
		let obj = this.getNode(id);
		if (obj === null) {
			obj = this.getComment(id);
		}
		return obj;
	}

	getLink(linkId) {
		const link = this.mappedLinks[linkId];
		return (typeof link === "undefined") ? null : link;
	}

	getLinks(linkIds) {
		const links = [];
		linkIds.forEach((lId) => {
			const l = this.getLink(lId);
			if (l) {
				links.push(l);
			}
		});
		return links;
	}

	// Replaces the link in the links array with the one passed in.
	replaceLink(oldLink) {
		const index = this.pipeline.links.findIndex((l) => l.id === oldLink.id);
		this.pipeline.links.splice(index, 1, oldLink);
		this.mappedLinks = this.getMappedArray(this.pipeline.links);
	}

	getPipeline(pipelineId, canvasInfo) {
		const pipeline = canvasInfo.pipelines.find((p) => p.id === pipelineId);
		if (pipeline) {
			return pipeline;
		}
		return { id: pipelineId, nodes: [], comments: [], links: [] };
	}

	// Preprocesses the pipeline to set the connected attribute of the ports
	// for each node. This is used when rendering the connection status of ports.
	preProcessPipeline(pipeline) {
		this.setAllPortsDisconnected(pipeline);

		pipeline.links.forEach((link) => {
			if (link.type === COMMENT_LINK) {
				link.srcObj = this.getComment(link.srcNodeId);
				link.trgNode = this.getNode(link.trgNodeId);

			} else {
				// For node (port) and association links, we need to set the srcObj
				// and trgNode field for the link.
				link.srcObj = this.getNode(link.srcNodeId);
				link.trgNode = this.getNode(link.trgNodeId);

				// For node (port) links, we need to set the isConnected field
				// for each port.
				if (link.type === NODE_LINK) {
					if (link.srcObj) {
						this.setOutputPortConnected(link.srcObj, link.srcNodePortId);
					}
					if (link.trgNode) {
						this.setInputPortConnected(link.trgNode, link.trgNodePortId);
					}
				}
			}
		});
		return pipeline;
	}

	// Sets the isConnected property of all ports in the pipeline to false.
	setAllPortsDisconnected(pipeline) {
		pipeline.nodes.forEach((n) => {
			if (n.inputs) {
				n.inputs.forEach((inp) => (inp.isConnected = false));
			}
			if (n.outputs) {
				n.outputs.forEach((out) => (out.isConnected = false));
			}
		});
	}

	// Sets the isConnected property of the port, identified by inPortId,
	// for the trgNode to true.
	setInputPortConnected(trgNode, inPortId) {
		const portId = inPortId || CanvasUtils.getDefaultInputPortId(trgNode);
		if (trgNode.inputs) {
			trgNode.inputs.forEach((inp) => {
				if (inp.id === portId) {
					inp.isConnected = true;
				}
			});
		}
	}

	// Sets the isConnected property of the port, identified by outPortId,
	// for the srcNode to true.
	setOutputPortConnected(srcNode, outPortId) {
		const portId = outPortId || CanvasUtils.getDefaultOutputPortId(srcNode);
		if (srcNode.outputs) {
			srcNode.outputs.forEach((out) => {
				if (out.id === portId) {
					out.isConnected = true;
				}
			});
		}
	}

	// Returns an object where each element in the array provided is indexed by
	// the id property of the element.
	getMappedArray(array) {
		return array.reduce((map, o) => { map[o.id] = o; return map; }, {});
	}

	// Returns the IDs of the selected objects for this pipeline.
	getSelectedObjectIds() {
		return this.selections;
	}

	// Returns an array of any currently selected nodes and comments.
	getSelectedNodesAndComments() {
		var objs = this.getSelectedNodes();

		this.comments.forEach((comment) => {
			if (this.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});
		return objs;
	}

	// Returns an array of any currently selected nodes.
	getSelectedNodes() {
		var objs = [];
		this.nodes.forEach((node) => {
			if (this.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});
		return objs;
	}

	// Returns an array of any currently selected node IDs.
	getSelectedNodeIds() {
		return this.getSelectedNodes().map((n) => n.id);
	}

	// Returns an array of any currently selected links
	getSelectedLinks() {
		var objs = [];
		this.links.forEach((link) => {
			if (this.getSelectedObjectIds().includes(link.id)) {
				objs.push(link);
			}
		});
		return objs;
	}

	// Returns an array of selected detached links. Detached links are recognized
	// if they have either a srcPos or trgPos field which holds the coordinates
	// of the source or target of the link. If they have one of these fields they
	// are semi-detached and if they have both they are fully detached.
	getSelectedDetachedLinks() {
		return this.getSelectedLinks().filter((l) => l.srcPos || l.trgPos);
	}

	// Returns the number of selected links.
	getSelectedLinksCount() {
		return this.getSelectedLinks().length;
	}

	isSelected(objId) {
		return this.getSelectedObjectIds().indexOf(objId) >= 0;
	}
}
