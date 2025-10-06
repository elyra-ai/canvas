/*
 * Copyright 2024-2025 Elyra Authors
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
import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, CANVAS_FOCUS } from "./constants/canvas-constants.js";


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

		// Keeps track of which sub-object with the currently focused node or link
		// is being focused.
		this.focusSubObjectIndex = -1;

		this.logger.logEndTimer("initialize");
	}

	// Returns an array of tab groups for the active pipeline. Each element of
	// the array is the starting object (node, comment or link) for the group.
	createTabObjectsArray() {
		this.removeGrpProperties();

		const objGroups = this.getObjectGroups();

		const entryComments = this.getEntryComments();
		const entryLinks = this.getEntryLinks();
		const entryNodes = this.getEntryNodes();
		const entryNodesForLoops = this.getEntryNodesForLoops(objGroups);

		let tabGroups = [...entryComments, ...entryNodes, ...entryLinks, ...entryNodesForLoops];
		tabGroups = tabGroups.sort(this.sortTabGroups.bind(this));
		return tabGroups;
	}

	// Prepares the canvas objects for processing into tab groups by removing
	// the 'grp' properties from each object. 'grp' is used to keep track of
	// which tab group an object is allocted to.
	removeGrpProperties() {
		this.ap.pipeline.nodes.forEach((n) => delete n.grp);
		this.ap.pipeline.links.forEach((l) => delete l.grp);
		this.ap.pipeline.comments.forEach((c) => delete c.grp);
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
		let entryLinks = this.ap.pipeline.links.filter((l) => l.srcPos && l.trgPos);
		entryLinks = entryLinks.map((el) => ({ type: "link", obj: el }));
		return entryLinks;
	}

	getEntryNodes() {
		let entryNodes = this.ap.pipeline.nodes.filter((n) => !this.nodeHasInputLinks(n) && !this.nodeHasAssocLinks(n));
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
		// connected links will have been handled when the node groups were
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

	nodeHasInputLinks(node) {
		if (node.inputs && node.inputs.length > 0) {
			const linksTo = this.getLinksToNode(node, NODE_LINK);
			return linksTo.length > 0;
		}
		return false;
	}

	nodeHasAssocLinks(node) {
		const links = this.getAssocLinksForNode(node);
		return (links.length > 0);
	}

	commentHasLinks(comment) {
		return this.getLinksFromComment(comment).length > 0;
	}

	getNextTabGroupStartObject(focusObj) {
		if (this.tabObjects.length === 0) {
			return null;
		}
		if (!focusObj || focusObj === CANVAS_FOCUS) {
			return this.tabObjects[0].obj;
		}

		const localObj = this.getLocalObject(focusObj);
		const index = this.tabObjects.findIndex((tg) => tg.obj.grp === localObj?.grp);

		if (index === this.tabObjects.length - 1) {
			return null;
		}
		return this.tabObjects[index + 1].obj;
	}

	getPreviousTabGroupStartObject(focusObj) {
		if (this.tabObjects.length === 0) {
			return null;
		}
		if (!focusObj || focusObj === CANVAS_FOCUS) {
			return this.tabObjects[this.tabObjects.length - 1].obj;
		}

		const localObj = this.getLocalObject(focusObj);
		const index = this.tabObjects.findIndex((tg) => tg.obj.grp === localObj?.grp);

		if (index === 0) {
			return null;
		}
		return this.tabObjects[index - 1].obj;
	}

	getLocalObject(focusObj) {
		return this.ap.pipeline.nodes.find((n) => n.id === focusObj.id) ||
			this.ap.pipeline.links.find((l) => l.id === focusObj.id) ||
			this.ap.pipeline.comments.find((c) => c.id === focusObj.id);
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

	getAssocLinksForNode(node) {
		return this.ap.pipeline.links.filter((l) => l.type === ASSOCIATION_LINK && (l.srcNodeId === node.id || l.trgNodeId === node.id));
	}

	getLinksFromComment(comment) {
		return this.ap.pipeline.links.filter((l) => l.srcNodeId === comment.id);
	}

	/* ------------------------------------------------------------------------------- */
	/* Focus functions for sub-objects.                                                */
	/* ------------------------------------------------------------------------------- */

	// Returns the next sub-object from the set of focusable sub-objects.
	getNextSubObject(d) {
		const subObjs = this.getFocusableSubObjects(d);

		this.focusSubObjectIndex++;

		if (this.focusSubObjectIndex >= subObjs.length) {
			this.focusSubObjectIndex = 0;
		}

		return subObjs[this.focusSubObjectIndex];
	}

	// Returns the previous sub-object from the set of focusable sub-objects.
	getPreviousSubObject(d) {
		const subObjs = this.getFocusableSubObjects(d);

		this.focusSubObjectIndex--;

		if (this.focusSubObjectIndex < 0) {
			this.focusSubObjectIndex = subObjs.length - 1;
		}

		return subObjs[this.focusSubObjectIndex];
	}

	// Resets the index for the current sub-object.
	resetFocusSubObjectIndex() {
		this.focusSubObjectIndex = -1;
	}

	// Returns an arry of focuable sub-elements of a node or link. These are items within
	// the node or link that the user might want to interact with using the keyboard such
	// as: visible, focusable ports or focuable decorations
	getFocusableSubObjects(d) {
		const focusableSubElements = [];

		if (CanvasUtils.getObjectTypeName(d) === "node") {
			if (d.inputs && d.layout.inputPortDisplay && d.layout.inputPortFocusable) {
				d.inputs.forEach((ip) => {
					focusableSubElements.push({ type: "inputPort", obj: ip });
				});
			}

			if (d.outputs && d.layout.outputPortDisplay && d.layout.outputPortFocusable) {
				d.outputs.forEach((op) => {
					focusableSubElements.push({ type: "outputPort", obj: op });
				});
			}

			if (d.focusFunction) {
				focusableSubElements.push({ type: "reactObject", obj: d });
			}
		}

		// Decorations apply for nodes AND links
		if (d.decorations) {
			d.decorations.forEach((dec) => {
				if (dec.focusable) {
					focusableSubElements.push({ type: "decoration", obj: dec });
				}
			});
		}

		return focusableSubElements;
	}
}
