/*
 * Copyright 2025 Elyra Authors
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

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK } from "./constants/canvas-constants.js";


export default class SVGCanvasUtilsAccessibility {
	constructor(activePipeline) {
		this.logger = new Logger("SVGCanvasUtilsAccessibility");
		this.logger.log("constructor - start");

		this.ap = activePipeline;

		this.initialize();

		this.logger.log("constructor - end");
	}

	initialize() {
		this.logger.logStartTimer("initialize");

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

		// Reset the currentTabObjectIndex variable based on the current selection
		// (if there is one).
		this.resetTabGroupIndexBasedOnSelection();

		this.logger.logEndTimer("initialize");
	}

	resetTabObjectIndex() {
		this.currentTabObjectIndex = -1;
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
		if (this.ap.canvasInfo.hideComments) {
			return [];
		}
		let solitaryComments = this.ap.pipeline.comments.filter((c) => !this.commentHasLinks(c));
		solitaryComments = solitaryComments.map((sc) => ({ type: "comment", obj: sc }));
		return solitaryComments;
	}

	getEntryLinks() {
		let entryLinks = this.ap.pipeline.links.filter((l) => l.srcPos);
		entryLinks = entryLinks.map((el) => ({ type: "link", obj: el }));
		return entryLinks;
	}

	getEntryNodes() {
		let entryNodes = this.ap.pipeline.nodes.filter((n) => !this.nodeHasInputLinks(n));
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

	// Returns an array of groups of nodes, comments and links that are
	// connected. It assigns a group number to the objects in each group.
	// After processing all the nodes, it iterates over each comment in
	// the pipeline and assigns a group number to each comment that does
	// not already have one. It does the same for each link in the pipeline.
	getObjectGroups() {
		const objGroups = [];
		let grpNumber = -1;

		// Process nodes and discover the other nodes and comments that are
		// connected to that node. Assign a grp number to each attached node,
		// link and comment.
		this.ap.pipeline.nodes.forEach((n) => {
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
		this.ap.pipeline.comments.forEach((c) => {
			if (typeof c.grp === "undefined") {
				grpNumber++;
				c.grp = grpNumber;
			}
		});

		// Only detached links will be left without a grp field because all
		// connected comments will have been handled when the node groups were
		// processed in the loop above -- so assign a new group number to each.
		this.ap.pipeline.links.forEach((l) => {
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
			const srcNode = this.ap.getNode(inLink.srcNodeId);
			if (srcNode) {
				srcNodes.push(srcNode);
			}
		});
		return srcNodes;
	}

	getTrgNodes(outputLinks) {
		const trgNodes = [];
		outputLinks.forEach((outLink) => {
			const trgNode = this.ap.getNode(outLink.trgNodeId);
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
			const assocNode = this.ap.getNode(nodeId);
			if (assocNode) {
				assocNodes.push(assocNode);
			}
		});
		return assocNodes;
	}

	getConnectedComments(commentLinks) {
		const connectedComments = [];
		commentLinks.forEach((commentLink) => {
			const com = this.ap.getComment(commentLink.srcNodeId);
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
		return this.ap.pipeline.links.filter((l) => l.type === NODE_LINK && l.trgNodeId === node.id);
	}

	getOutputDataLinks(node) {
		return this.ap.pipeline.links.filter((l) => l.type === NODE_LINK && l.srcNodeId === node.id);
	}

	getAssociationLinks(node) {
		return this.ap.pipeline.links.filter((l) => l.type === ASSOCIATION_LINK && (l.srcNodeId === node.id || l.trgNodeId === node.id));
	}

	getCommentLinks(node) {
		return this.ap.pipeline.links.filter((l) => l.type === COMMENT_LINK && l.trgNodeId === node.id);
	}

	// Resets the currentTabObjectIndex variable based on the current selection
	// (if there is one).
	resetTabGroupIndexBasedOnSelection() {
		if (this.ap.selections.length > 0) {
			const lastSelectedObjectId = this.ap.selections[this.ap.selections.length - 1];

			const lastSelectedNode = this.ap.getNode(lastSelectedObjectId);
			if (lastSelectedNode) {
				this.setTabGroupIndexForObj(lastSelectedNode);
				return;
			}
			const lastSelectedComment = this.ap.getComment(lastSelectedObjectId);
			if (lastSelectedComment) {
				this.setTabGroupIndexForObj(lastSelectedComment);
				return;
			}
			const lastSelectedLink = this.ap.getLink(lastSelectedObjectId);
			if (lastSelectedLink) {
				this.setTabGroupIndexForObj(lastSelectedLink);
				return;
			}
		}
		return;
	}

	// Sets the current tab group index, for the tab group of which the object
	// passed in is a part, to be the index position of that object.
	setTabGroupIndexForObj(obj) {
		this.currentTabObjectIndex = this.tabObjects.findIndex((tg) => tg.obj.grp === obj.grp);
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

	getNextTabGroupStartObject() {
		if (this.currentTabObjectIndex === this.tabObjects.length) {
			this.currentTabObjectIndex = -1;
		}

		if (this.currentTabObjectIndex < this.tabObjects.length) {
			this.currentTabObjectIndex++;
			if (this.currentTabObjectIndex < this.tabObjects.length) {
				return this.tabObjects[this.currentTabObjectIndex].obj;
			}
		}
		return null;
	}

	getPreviousTabGroupStartObject() {
		if (this.currentTabObjectIndex === -1) {
			this.currentTabObjectIndex = this.tabObjects.length;
		}

		if (this.currentTabObjectIndex > -1) {
			this.currentTabObjectIndex--;
			if (this.currentTabObjectIndex > -1) {
				return this.tabObjects[this.currentTabObjectIndex].obj;
			}
		}
		return null;
	}

	getAllLinksForNode(node) {
		const linkInfos = [];
		const dataLinksFrom = this.getLinksFromNode(node, NODE_LINK);
		dataLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: link.srcObj }); });

		const dataLinksTo = this.getLinksToNode(node, NODE_LINK);
		dataLinksTo.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: link.trgNode }); });

		const assocLinksFrom = this.getLinksFromNode(node, ASSOCIATION_LINK);
		assocLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: link.srcObj }); });

		const assocLinksTo = this.getLinksToNode(node, ASSOCIATION_LINK);
		assocLinksTo.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: link.trgNode }); });

		const commentLinksFrom = this.getLinksToNode(node, COMMENT_LINK);
		commentLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "comment", obj: this.ap.getComment(link.srcNodeId) }); });

		return linkInfos;
	}

	getNextLinksFromNode(node) {
		const linkInfos = [];
		const dataLinksFrom = this.getLinksFromNode(node, NODE_LINK);
		dataLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.ap.getNode(link.trgNodeId) }); });

		const assocLinksFrom = this.getLinksFromNode(node, ASSOCIATION_LINK);
		assocLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.ap.getNode(node.id === link.srcNodeId ? link.trgNodeId : link.srcNodeId) }); });

		const assocLinksTo = this.getLinksToNode(node, ASSOCIATION_LINK);
		assocLinksTo.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: link.trgNode }); });

		const commentLinksFrom = this.getLinksToNode(node, COMMENT_LINK);
		commentLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "comment", obj: this.ap.getComment(link.srcNodeId) }); });

		return linkInfos;
	}

	getNextLinksFromComment(comment) {
		const linkInfos = [];
		const commentLinksFrom = this.getLinksFromComment(comment);
		commentLinksFrom.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.ap.getNode(link.trgNodeId) }); });

		return linkInfos;
	}

	getNextSiblingLink(link) {
		const navObject = link.navObject ? link.navObject : link.srcObj;

		const linkInfos = CanvasUtils.isNode(navObject)
			? this.getAllLinksForNode(navObject)
			: this.getNextLinksFromComment(navObject);

		const index = linkInfos.findIndex((li) => li.link.id === link.id);
		if (index > -1) {
			if (index === linkInfos.length - 1) {
				return linkInfos[0].link;
			}
			return linkInfos[index + 1].link;
		}
		return null;
	}

	getPreviousSiblingLink(link) {
		const navObject = link.navObject ? link.navObject : link.srcObj;

		const linkInfos = CanvasUtils.isNode(navObject)
			? this.getAllLinksForNode(navObject)
			: this.getNextLinksFromComment(navObject);

		const index = linkInfos.findIndex((li) => li.link.id === link.id);
		if (index > -1) {
			if (index === 0) {
				return linkInfos[linkInfos.length - 1].link;
			}
			return linkInfos[index - 1].link;
		}
		return null;
	}

	getNextNodeFromDataLink(link) {
		return this.ap.getNode(link.trgNodeId);
	}

	getNextNodeFromAssocLink(link) {
		if (link.srcNodeId === link.navObject.id) {
			return link.trgNode;
		}
		return link.srcObj;
	}

	getNextObjectFromCommentLink(link) {
		if (link.srcNodeId === link.navObject.id) {
			return link.trgNode;
		}
		return link.srcObj;
	}

	getPreviousLinksToNode(node) {
		const linkInfos = [];
		const dataLinksTo = this.getLinksToNode(node, NODE_LINK);
		dataLinksTo.forEach((link) => { linkInfos.push({ link: link, type: "node", obj: this.ap.getNode(link.trgNodeId) }); });

		return linkInfos;
	}

	getPreviousNodeFromDataLink(link) {
		return link.srcObj;
	}

	getPreviousNodeFromAssocLink(link) {
		if (link.srcObjId === link.navObject.id) {
			return link.srcObj;
		}
		return link.trgNode;
	}

	getPreviousObjectFromCommentLink(link) {
		if (link.srcObjId === link.navObject.id) {
			return link.srcObj;
		}
		return link.trgNode;
	}

	// Returns an array of links that go to the node passed in, of the type
	// specified.
	getLinksToNode(node, type) {
		return this.ap.pipeline.links.filter((l) => l.type === type && l.trgNodeId === node.id);
	}

	// Returns an array of links that go from the node passed in, of the type
	// specified.
	getLinksFromNode(node, type) {
		return this.ap.pipeline.links.filter((l) => l.type === type && l.srcNodeId === node.id);
	}

	getLinksFromComment(comment) {
		return this.ap.pipeline.links.filter((l) => l.srcNodeId === comment.id);
	}
}
