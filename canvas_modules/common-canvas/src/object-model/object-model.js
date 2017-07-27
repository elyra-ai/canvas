/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { createStore, combineReducers } from "redux";
import uuid from "node-uuid";
import { NONE, VERTICAL, DAGRE_HORIZONTAL, DAGRE_VERTICAL } from "../../constants/common-constants.js";
import dagre from "dagre";

/* eslint arrow-body-style: ["error", "always"] */
/* eslint complexity: ["error", 15] */

const nodes = (state = [], action) => {
	switch (action.type) {
	case "ADD_NODE": {
		const newNode = {
			id: action.data.id,
			className: "canvas-node",
			image: action.data.image,
			outputPorts: action.data.outputPorts,
			inputPorts: action.data.inputPorts,
			x_pos: action.data.x_pos,
			y_pos: action.data.y_pos,
			objectData: { description: "", label: action.data.label }
		};
		return [
			...state,
			newNode
		];
	}

	case "MOVE_OBJECTS":
		// action.data.nodes contains an array of node and comment Ids
		if (action.data.nodes) {
			return state.map((node, index) => {
				if (action.data.nodes.findIndex((actionNodeId) => {
					return (actionNodeId === node.id);
				}) > -1) {
					const xPos = node.x_pos + action.data.offsetX;
					const yPos = node.y_pos + action.data.offsetY;
					return Object.assign({}, node, { x_pos: xPos, y_pos: yPos });
				}
				return node;
			});
		}
		return state;

	case "DELETE_OBJECTS":
		return state.filter((node) => {
			const index =
			action.data.selectedObjectIds.findIndex((selId) => {
				return (node.id === selId);
			});
			return index === -1; // filter will return all objects NOT found in selectedObjectIds
		});

	case "ADD_NODE_ATTR":
		return state.map((node, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === node.id);
			}) > -1) {
				const newNode = Object.assign({}, node);
				newNode.customAttrs = newNode.customAttrs || [];
				newNode.customAttrs.push(action.data.attrName);
				return newNode;
			}
			return node;
		});

	case "REMOVE_NODE_ATTR":
		return state.map((node, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === node.id);
			}) > -1) {
				const newNode = Object.assign({}, node);
				if (newNode.customAttrs) {
					newNode.customAttrs = newNode.customAttrs.filter((a) => {
						return a !== action.data.attrName;
					});
				}
				return newNode;
			}
			return node;
		});


	default:
		return state;
	}
};


const comments = (state = [], action) => {
	switch (action.type) {
	case "MOVE_OBJECTS":
		// action.data.nodes contains an array of node and comment Ids
		if (action.data.nodes) {
			return state.map((comment, index) => {
				if (action.data.nodes.findIndex((actionNodeId) => {
					return (actionNodeId === comment.id);
				}) > -1) {
					const xPos = comment.x_pos + action.data.offsetX;
					const yPos = comment.y_pos + action.data.offsetY;
					return Object.assign({}, comment, { x_pos: xPos, y_pos: yPos });
				}
				return comment;
			});
		}
		return state;

	case "DELETE_OBJECTS":
		return state.filter((node) => {
			const index =
			action.data.selectedObjectIds.findIndex((selId) => {
				return (node.id === selId);
			});
			return index === -1; // filter will return all objects NOT found in selectedObjectIds
		});

	case "ADD_COMMENT": {
		const newComment = {
			id: action.data.id,
			className: "canvas-comment",
			content: " ",
			height: 32,
			width: 128,
			x_pos: action.data.mousePos.x,
			y_pos: action.data.mousePos.y
		};
		return [
			...state,
			newComment
		];
	}

	case "EDIT_COMMENT":
		return state.map((comment, index) => {
			if (action.data.nodes.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.content = action.data.label;
				newComment.height = action.data.height;
				newComment.width = action.data.width;
				newComment.x_pos = action.data.offsetX;
				newComment.y_pos = action.data.offsetY;
				return newComment;
			}
			return comment;
		});


	case "ADD_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.customAttrs = newComment.customAttrs || [];
				newComment.customAttrs.push(action.data.attrName);
				return newComment;
			}
			return comment;
		});

	case "REMOVE_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.findIndex((actionId) => {
				return (actionId === comment.id);
			}) > -1) {
				const newComment = Object.assign({}, comment);
				if (newComment.customAttrs) {
					newComment.customAttrs = newComment.customAttrs.filter((a) => {
						return a !== action.data.attrName;
					});
				}
				return newComment;
			}
			return comment;
		});

	default:
		return state;
	}
};


const links = (state = [], action) => {
	switch (action.type) {
	case "DELETE_OBJECTS":
		return state.filter((link) => {
			const index =
			action.data.selectedObjectIds.findIndex((selId) => {
				return (link.source === selId ||  // If node being deleted is either source or target of link remove this link
					link.target === selId);
			});

			return index === -1; // filter will return all links NOT involved in selectedObjectIds
		});

	case "ADD_LINK": {
		let className = "canvas-data-link";
		if (action.data.linkType === "comment") {
			className = "canvas-comment-link";
		}

		const newLink = {
			id: action.data.id,
			className: className,
			source: action.data.srcNodeId,
			target: action.data.trgNodeId
		};
		return [
			...state,
			newLink
		];
	}

	case "DELETE_LINK":
		return state.filter((link) => {
			return link.id !== action.data.id;
		});

	// When a comment is added, links have to be created from the comment
	// to each of the selected nodes.
	case "ADD_COMMENT": {
		const createdLinks = [];
		action.data.selectedObjectIds.forEach((objId, i) => {
			createdLinks.push({
				id: action.data.linkIds[i],
				className: "canvas-comment-link",
				source: action.data.id,
				target: action.data.selectedObjectIds[i]
			});
		});
		return [
			...state,
			...createdLinks
		];
	}

	case "DISCONNECT_NODES":
		return state.filter((link) => {
			const index = action.data.selectedNodeIds.findIndex((selId) => {
				return (selId === link.source ||
					selId === link.target);
			});
			return index === -1;
		});

	default:
		return state;
	}
};


const diagram = (state = {}, action) => {
	switch (action.type) {
	case "ADD_NODE":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action) });

	case "MOVE_OBJECTS":
	case "DELETE_OBJECTS":
		return Object.assign({}, state, { nodes: nodes(state.nodes, action),
                   comments: comments(state.comments, action),
                   links: links(state.links, action) });

	case "ADD_LINK":
	case "DELETE_LINK":
	case "DISCONNECT_NODES":
		return Object.assign({}, state, { links: links(state.links, action) });

	case "ADD_COMMENT":
		return Object.assign({}, state, { comments: comments(state.comments, action) },
                  { links: links(state.links, action) });

	case "EDIT_COMMENT":
	case "ADD_COMMENT_ATTR":
	case "REMOVE_COMMENT_ATTR":
		return Object.assign({}, state, { comments: comments(state.comments, action) });

	default:
		return state;
	}
};


const canvas = (state = getInitialCanvas(), action) => {
	switch (action.type) {
	case "CLEAR_CANVAS":
		return null;

	case "SET_CANVAS":
		return Object.assign({}, action.data);

	case "ADD_NODE":
	case "DISCONNECT_NODES":
	case "ADD_NODE_ATTR":
	case "REMOVE_NODE_ATTR":
	case "MOVE_OBJECTS":
	case "DELETE_OBJECTS":
	case "ADD_LINK":
	case "DELETE_LINK":
	case "ADD_COMMENT":
	case "EDIT_COMMENT":
	case "ADD_COMMENT_ATTR":
	case "REMOVE_COMMENT_ATTR":
		return Object.assign({}, state, { diagram: diagram(state.diagram, action) });
	default:
		return state;
	}
};

const palette = (state = {}, action) => {
	switch (action.type) {
	case "CLEAR_PALETTE_DATA":
		return null;

	case "SET_PALETTE_DATA":
		return Object.assign({}, action.data);

	default:
		return state;
	}
};

const selections = (state = [], action) => {
	switch (action.type) {
	case "CLEAR_SELECTIONS":
		return [];

	case "SET_SELECTIONS":
		return [...action.data];

	case "DELETE_OBJECTS":
		return state.filter((objId) => {
			return action.data.selectedObjectIds.indexOf(objId) === -1;
		});

	default:
		return state;
	}
};

const getInitialCanvas = () => {
	const newUuid = getUUID();
	const time = new Date().milliseconds;
	const label = "New Canvas";

	return {
		className: "canvas-image",
		id: newUuid,
		diagram: {},
		objectData: { created: time, updated: time, description: "", label: label },
		parents: [{ id: newUuid, label: label }],
		userData: {},
		zoom: 100
	};
};

const getUUID = () => {
	return uuid.v4();
};

const combinedReducer = combineReducers({ canvas, palette, selections });
const store = createStore(combinedReducer);

store.dispatch({ type: "CLEAR_CANVAS" });
store.dispatch({ type: "CLEAR_PALETTE_DATA" });


export default class ObjectModel {

// Standard methods

	static dispatch(action) {
		store.dispatch(action);
	}

	static subscribe(callback) {
		store.subscribe(callback);
	}

// Palette methods

	static clearPaletteData() {
		store.dispatch({ type: "CLEAR_PALETTE_DATA" });
	}

	static setPaletteData(paletteData) {
		store.dispatch({ type: "SET_PALETTE_DATA", data: paletteData });
	}

	static getPaletteData() {
		return store.getState().palette;
	}

	static getPaletteNode(nodeTypeId) {
		let outNodeType = null;
		ObjectModel.getPaletteData().categories.forEach((category) => {
			category.nodetypes.forEach((nodeType) => {
				if (nodeType.typeId === nodeTypeId) {
					outNodeType = nodeType;
				}
			});
		});
		return outNodeType;
	}

// Canvas methods

	static clearCanvas() {
		this.clearSelection();
		store.dispatch({ type: "CLEAR_CANVAS" });
	}

	static setCanvas(newCanvas) {
		const currentCanvas = this.getCanvas();
		// In some instances, with an external object model, the same canvas may
		// be set multiple times. Consequently, we only clear the selections if
		// we're given a completely new canvas.
		if (newCanvas && currentCanvas && newCanvas.id !== currentCanvas.id) {
			this.clearSelection();
		}
		store.dispatch({ type: "SET_CANVAS", data: newCanvas });
	}

	static getCanvas() {
		return store.getState().canvas;
	}

	static fixedAutoLayout(fixedLayoutDirection) {
		this.autoLayout(fixedLayoutDirection);
		ObjectModel.fixedLayout = fixedLayoutDirection;
	}

	static autoLayout(layoutDirection) {
		var canvasData = this.getCanvas();
		var lookup = {};
		if (layoutDirection === VERTICAL) {
			lookup = this.dagreAutolayout(DAGRE_VERTICAL, canvasData);
		} else {
			lookup = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasData);
		}
		var newNodes = canvasData.diagram.nodes.map((node) => {
			return Object.assign({}, node, { x_pos: lookup[node.id].value.x, y_pos: lookup[node.id].value.y });
		});
		var newDiagram = Object.assign({ }, canvasData.diagram, { nodes: newNodes });
		var newCanvas = Object.assign({ }, canvasData, { diagram: newDiagram });
		this.setCanvas(newCanvas);
	}

	static dagreAutolayout(direction, canvasData) {
		var edges = canvasData.diagram.links.map((link) => {
			return { "v": link.source, "w": link.target, "value": { "points": [] } };
		});

		var nodesData = canvasData.diagram.nodes.map((node) => {
			return { "v": node.id, "value": { } };
		});

		// possible values: TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
		// default TB for vertical layout
		// set to LR for horizontal layout
		var value = { };
		var directionList = ["TB", "BT", "LR", "RL"];
		if (directionList.indexOf(direction) >= 0) {
			value = { "rankDir": direction };
		}

		var inputGraph = { nodes: nodesData, edges: edges, value: value };

		var g = dagre.graphlib.json.read(inputGraph);
		g.graph().marginx = 100;
		g.graph().marginy = 25;
		g.graph().nodesep = 150; // distance to separate the nodes horiziontally
		g.graph().ranksep = 150; // distance between each rank of nodes
		dagre.layout(g);

		var outputGraph = dagre.graphlib.json.write(g);

		var lookup = { };
		for (var i = 0, len = outputGraph.nodes.length; i < len; i++) {
			lookup[outputGraph.nodes[i].v] = outputGraph.nodes[i];
		}
		return lookup;
	}

// Node AND comment methods

	static moveObjects(data) {
		if (ObjectModel.fixedLayout === NONE) {
			store.dispatch({ type: "MOVE_OBJECTS", data: data });
		}
	}

	static deleteObjects(source) {
		store.dispatch({ type: "DELETE_OBJECTS", data: source });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static disconnectNodes(source) {
		// We only disconnect links to data nodes (not links to comments).
		const selectedNodeIds = this.filterDataNodes(source.selectedObjectIds);

		const newSource = Object.assign({}, source, { selectedNodeIds: selectedNodeIds });
		store.dispatch({ type: "DISCONNECT_NODES", data: newSource });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

// Node methods

	static createNode(data) {
		const nodeType = ObjectModel.getPaletteNode(data.nodeTypeId);
		if (nodeType !== null) {
			const info = {};
			info.id = getUUID();
			info.label = data.label;
			info.x_pos = data.offsetX;
			info.y_pos = data.offsetY;
			info.image = nodeType.image;
			info.inputPorts = nodeType.inputPorts || [];
			info.outputPorts = nodeType.outputPorts || [];
			store.dispatch({ type: "ADD_NODE", data: info });
		}
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static getNodes() {
		return this.getCanvas().diagram.nodes;
	}

	static addCustomAttrToNodes(objIds, attrName) {
		store.dispatch({ type: "ADD_NODE_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	static removeCustomAttrFromNodes(objIds, attrName) {
		store.dispatch({ type: "REMOVE_NODE_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

// Comment methods

	static createComment(source) {
		const info = {};
		info.id = getUUID();
		info.linkIds = [];
		info.mousePos = source.mousePos;
		info.selectedObjectIds = [];
		source.selectedObjectIds.forEach((objId) => {
			if (this.isDataNode(objId)) { // Only add links to data nodes, not comments
				info.selectedObjectIds.push(objId);
				info.linkIds.push(getUUID());
			}
		});
		store.dispatch({ type: "ADD_COMMENT", data: info });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static getComments() {
		return this.getCanvas().diagram.comments;
	}

	static editComment(data) {
		store.dispatch({ type: "EDIT_COMMENT", data: data });
	}

	static addCustomAttrToComments(objIds, attrName) {
		store.dispatch({ type: "ADD_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

	static removeCustomAttrFromComments(objIds, attrName) {
		store.dispatch({ type: "REMOVE_COMMENT_ATTR", data: { objIds: objIds, attrName: attrName } });
	}

// Link methods

	static deleteLink(source) {
		store.dispatch({ type: "DELETE_LINK", data: source });
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static linkNodes(data) {
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				this.linkNodesById(srcNodeId, trgNodeId, data.linkType);
			});
		});
	}

	static linkNodesById(srcNodeId, trgNodeId, linkType) {
		if (ObjectModel.connectionIsAllowed(srcNodeId, trgNodeId)) {
			const info = {};
			info.id = getUUID();
			info.linkType = linkType;
			info.srcNodeId = srcNodeId;
			info.trgNodeId = trgNodeId;
			store.dispatch({ type: "ADD_LINK", data: info });
		}
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

	static linkComment(data) {
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				const info = {};
				info.id = getUUID();
				info.linkType = data.linkType;
				info.srcNodeId = srcNodeId;
				info.trgNodeId = trgNodeId;
				store.dispatch({ type: "ADD_LINK", data: info });
			});
		});
		if (ObjectModel.fixedLayout !== NONE) {
			this.autoLayout(ObjectModel.fixedLayout);
		}
	}

// Utility functions

	static getNode(nodeId) {
		const diagramNodes = ObjectModel.getCanvas().diagram.nodes;
		return diagramNodes.find((node) => {
			return (node.id === nodeId);
		});
	}

	static isDataNode(objId) {
		const node = ObjectModel.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	static filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	static connectionIsAllowed(srcNodeId, trgNodeId) {
		if (srcNodeId === trgNodeId) {
			return false;
		}

		const diagramLinks = ObjectModel.getCanvas().diagram.links;

		const srcNode = ObjectModel.getNode(srcNodeId);
		const trgNode = ObjectModel.getNode(trgNodeId);

		if (this.linkAlreadyExists(srcNodeId, trgNodeId, diagramLinks)) {
			return false;
		}

		let srcCount = 0;
		let trgCount = 0;
		diagramLinks.forEach((link) => {
			// Only count for links that are between data nodes
			// i.e. don't count for links from/to comments.
			if (this.isDataNode(link.source) &&
			this.isDataNode(link.target)) {
				if (link.source === srcNodeId) {
					srcCount++;
				}
				if (link.target === trgNodeId) {
					trgCount++;
				}
			}
		});

		// TODO - Remove these two lines below whe we've decided how to disallow
		// connections. Should this be based on cardinality? If more than one
		// input or output port is allowed we will need the link to
		// know which port it is linking.
		srcCount = 0;
		trgCount = 0;

		if (srcNode.outputPorts && srcCount < srcNode.outputPorts.length &&
				trgNode.inputPorts && trgCount < trgNode.inputPorts.length) {
			return true;
		}

		return false;
	}

	static linkAlreadyExists(srcNodeId, trgNodeId, diagramLinks) {
		let exists = false;

		diagramLinks.forEach((link) => {
			if (link.source === srcNodeId &&
					link.target === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

// Methods to handle selections

	static clearSelection() {
		store.dispatch({ type: "CLEAR_SELECTIONS" });
	}

	static getSelectedObjectIds() {
		return store.getState().selections;
	}

	static selectAll() {
		const selected = [];
		for (const node of this.getNodes()) {
			selected.push(node.id);
		}
		for (const comment of this.getComments()) {
			selected.push(comment.id);
		}
		store.dispatch({ type: "SET_SELECTIONS", data: selected });
	}

	static isSelected(objectId) {
		return this.getSelectedObjectIds().indexOf(objectId) >= 0;
	}

	static selectInRegion(minX, minY, maxX, maxY) {
		var regionSelections = [];
		for (const node of this.getNodes()) {
			if (node.x_pos > minX && node.x_pos < maxX && node.y_pos > minY && node.y_pos < maxY) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of this.getComments()) {
			if (comment.x_pos > minX && comment.x_pos < maxX && comment.y_pos > minY && comment.y_pos < maxY) {
				regionSelections.push(comment.id);
			}
		}
		store.dispatch({ type: "SET_SELECTIONS", data: regionSelections });

		return this.getSelectedObjectIds();
	}

	// Either sets the target object as selected and removes any other
	// selections or leaves as selected if this object is already selected.
	static ensureSelected(objectId) {
		let alreadySelected = this.getSelectedObjectIds();

		// If the operation is about to be done to a non-selected object,
		// make it the only selected object.
		if (alreadySelected.indexOf(objectId) < 0) {
			alreadySelected = [objectId];
		}
		store.dispatch({ type: "SET_SELECTIONS", data: alreadySelected });

		return this.getSelectedObjectIds();
	}

	static toggleSelection(objectId, toggleSelection) {
		let toggleSelections = [objectId];

		if (toggleSelection) {
			// If already selected then remove otherwise add
			if (this.isSelected(objectId)) {
				toggleSelections = this.getSelectedObjectIds();
				const index = toggleSelections.indexOf(objectId);
				toggleSelections.splice(index, 1);
			}	else {
				toggleSelections = this.getSelectedObjectIds().concat(objectId);
			}
		}
		store.dispatch({ type: "SET_SELECTIONS", data: toggleSelections });

		return this.getSelectedObjectIds();
	}

	static findNodesInSubGraph(startNodeId, endNodeId, selection) {
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			const diagramLinks = ObjectModel.getCanvas().diagram.links;
			for (const link of diagramLinks) {
				if (link.source === startNodeId) {
					const newRetval = this.findNodesInSubGraph(link.target, endNodeId, selection);
					if (newRetval !== true) {
						selection.pop();
					}
					// this handles the case where there are multiple outward paths.
					// some of the outward paths coule be true and some false
					// this will make sure that the node is in the selection list of one of the paths
					// contains the end nodeId.
					retval = retval || newRetval;
				}
			}
		}

		return retval;
	}


	static selectSubGraph(endNodeId) {
		var selection = [endNodeId];
		const currentSelectedObjects = this.getSelectedObjectIds();

		// get all the nodes in the path from a currently selected object to the end node
		for (const startNodeId of currentSelectedObjects) {
			this.findNodesInSubGraph(startNodeId, endNodeId, selection);
		}

		// do not put multiple copies of a nodeId in selected nodeId list.
		const selectedObjectIds = this.getSelectedObjectIds();
		for (const selected of selection) {
			if (!this.isSelected(selected)) {
				selectedObjectIds.push(selected);
			}
		}

		store.dispatch({ type: "SET_SELECTIONS", data: selectedObjectIds });

		return this.getSelectedObjectIds();
	}
}

ObjectModel.fixedLayout = NONE;
