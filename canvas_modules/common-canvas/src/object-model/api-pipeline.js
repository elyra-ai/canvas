/*
 * Copyright 2017-2020 IBM Corporation
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
/* eslint arrow-body-style: ["off"] */

// ---------------------------------------------------------------------------
// This API Pipeline Class wrappers the pipeline specific methods which result
// in a change to the object model. It is used internally by the object-model
// and canvas-controller.
// ---------------------------------------------------------------------------

import dagre from "dagre/dist/dagre.min.js";
import has from "lodash/has";

import PipelineOutHandler from "./pipeline-out-handler.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";

import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, VERTICAL, DAGRE_HORIZONTAL,
	DAGRE_VERTICAL, CREATE_NODE, CLONE_NODE, CREATE_COMMENT, CLONE_COMMENT,
	CREATE_NODE_LINK, CLONE_NODE_LINK, CREATE_COMMENT_LINK, CLONE_COMMENT_LINK,
	SUPER_NODE } from "../common-canvas/constants/canvas-constants.js";


export default class APIPipeline {
	constructor(pipelineId, objectModel) {
		this.pipelineId = pipelineId;
		this.objectModel = objectModel;
		this.store = objectModel.store;
	}

	// ---------------------------------------------------------------------------
	// Pipeline methods
	// ---------------------------------------------------------------------------
	zoomPipeline(zoom, translate) {
		this.store.dispatch({ type: "ZOOM_PIPELINE", data: { zoom: zoom }, pipelineId: this.pipelineId });
	}

	// ---------------------------------------------------------------------------
	// Node AND comment methods
	// ---------------------------------------------------------------------------

	moveObjects(data) {
		this.store.dispatch({ type: "MOVE_OBJECTS", data: data, pipelineId: this.pipelineId });
	}

	deleteObjects(objectIds) {
		this.objectModel.executeWithSelectionChange((objIds) => {
			objIds.forEach((id) => {
				this.store.dispatch({ type: "DELETE_OBJECT", data: { id: id }, pipelineId: this.pipelineId });
			});
		}, objectIds);
	}

	// Delete an array of objects that have ids.
	deleteObjectsWithIds(objects) {
		const objectIds = [];
		objects.forEach((object) => {
			objectIds.push(object.id);
		});
		this.deleteObjects(objectIds);
	}

	deleteObject(id) {
		this.objectModel.executeWithSelectionChange(this.store.dispatch, { type: "DELETE_OBJECT", data: { id: id }, pipelineId: this.pipelineId });
	}

	getObjectStyle(objId, temporary) {
		const obj = this.getObject(objId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setObjectsClassName(objectIds, newClassName) {
		this.store.dispatch({ type: "SET_OBJECTS_CLASS_NAME", data: { objIds: objectIds, label: newClassName }, pipelineId: this.pipelineId });
	}

	disconnectObjects(objectIds) {
		let linksToDelete = [];
		objectIds.forEach((id) => {
			// save all the links associated with each node, but don't store duplicate links
			const objectLinks = this.getLinksContainingId(id);
			objectLinks.forEach((objectLink) => {
				linksToDelete = this.pushUniqueLinks(objectLink, linksToDelete);
			});
		});
		const linkIdsToDelete = linksToDelete.map((link) => link.id);
		this.store.dispatch({ type: "DELETE_LINKS", data: { linkIds: linkIdsToDelete }, pipelineId: this.pipelineId });
		return linksToDelete;
	}

	isEmpty() {
		if (this.getNodes() && this.getNodes().length === 0 &&
				this.getComments() && this.getComments().length === 0) {
			return true;
		}
		return false;
	}

	getObject(objId) {
		const node = this.getNode(objId);
		if (node) {
			return node;
		}
		const com = this.getComment(objId);
		if (com) {
			return com;
		}
		return null;
	}

	// Returns true if any of the node or comment definitions passed in exactly
	// overlap any of the existing nodes and comments. This is used by the
	// paste-from-clipboard code to detect if nodes and comments being pasted
	// overlap existing nodes and comments.
	exactlyOverlaps(nodeDefs, commentDefs) {
		var overlaps = false;

		if (nodeDefs && nodeDefs.length > 0) {
			const index = nodeDefs.findIndex((nodeDef) => {
				return this.exactlyOverlapsNodes(nodeDef);
			});
			if (index > -1) {
				overlaps = true;
			}
		}
		if (overlaps === false && commentDefs && commentDefs.length > 0) {
			const index = commentDefs.findIndex((commentDef) => {
				return this.exactlyOverlapsComments(commentDef);
			});
			if (index > -1) {
				overlaps = true;
			}
		}

		return overlaps;
	}

	// Return true if the new node definition passed in exactly overlaps any
	// of the existing nodes.
	exactlyOverlapsNodes(nodeDef) {
		var overlap = false;
		this.getNodes().forEach((canvasNode) => {
			if (canvasNode.x_pos === nodeDef.x_pos &&
					canvasNode.y_pos === nodeDef.y_pos) {
				overlap = true;
			}
		});
		return overlap;
	}

	// Returns true if any corner of the node passed in overlaps any inNodes.
	// If list of inNodes is not passed in, return true if the node passed in is
	// on top of any existing nodes.
	overlapsNodes(node, inNodes) {
		let overlap = false;
		const surroundingNodes = inNodes ? inNodes : this.getNodes();
		surroundingNodes.forEach((canvasNode) => {
			const canvasNodeWidthX = canvasNode.x_pos + canvasNode.width;
			const canvasNodeHeightY = canvasNode.y_pos + canvasNode.height;
			if (node.id !== canvasNode.id &&
				(
					(node.x_pos === canvasNode.x_pos && node.y_pos === canvasNode.y_pos) || // Exactly overlaps.
					(node.x_pos >= canvasNode.x_pos && node.x_pos <= canvasNodeWidthX && // Top left corner of node.
						node.y_pos >= canvasNode.y_pos && node.y_pos <= canvasNodeHeightY) ||
					(node.x_pos + node.width > canvasNode.x_pos && node.x_pos + node.width < canvasNodeWidthX && // Top right corner of node
						node.y_pos > canvasNode.y_pos && node.y_pos < canvasNodeHeightY) ||
					(node.x_pos > canvasNode.x_pos && node.x_pos < canvasNodeWidthX && // Bottom left corner of node.
						node.y_pos + node.height > canvasNode.y_pos && node.y_pos + node.height < canvasNodeHeightY) ||
					(node.x_pos + node.width > canvasNode.x_pos && node.x_pos + node.width < canvasNodeWidthX && // Bottom right corner of node
						node.y_pos + node.height > canvasNode.y_pos && node.y_pos + node.height < canvasNodeHeightY)
				)
			) {
				overlap = true;
			}
		});
		return overlap;
	}

	// Return true if the new comment definition passed in exactly overlaps any
	// of the existing comments.
	exactlyOverlapsComments(comment) {
		var overlap = false;
		this.getComments().forEach((canvasComment) => {
			if (canvasComment.x_pos === comment.x_pos &&
					canvasComment.y_pos === comment.y_pos) {
				overlap = true;
			}
		});
		return overlap;
	}

	// Returns true if the object ID passed in exists in the array of objects
	// passed in.
	isObjectIdInObjects(objId, inObjects) {
		if (inObjects) {
			return inObjects.findIndex((object) => {
				return object.id === objId;
			}) > -1;
		}
		return false;
	}

	// ---------------------------------------------------------------------------
	// Node methods
	// ---------------------------------------------------------------------------

	createNode(data) {
		const nodeTemplate = data.nodeTemplate;
		let node = {};
		if (nodeTemplate !== null) {
			node = Object.assign({}, nodeTemplate, {
				"id": this.objectModel.getUniqueId(CREATE_NODE, { nodeType: nodeTemplate, pipelineId: this.pipelineId }),
				"x_pos": data.offsetX,
				"y_pos": data.offsetY
			});

			// Add node height and width and, if appropriate, inputPortsHeight
			// and outputPortsHeight and layout info.
			node = this.objectModel.setNodeAttributes(node);
		}

		return node;
	}

	// Returns a source node for auto completion or null if no source node can be
	// detected. The source node is either:
	// 1. The selected node, if only *one* node is currently selected or
	// 2. The most recently added node, provided it has one or more output ports or
	// 3. The most-recent-but-one added node, provided it has one or more output ports
	getAutoSourceNode() {
		var sourceNode = null;
		var selectedNodes = this.objectModel.getSelectedNodes();

		if (selectedNodes.length === 1) {
			sourceNode = selectedNodes[0];
		} else {
			var nodesArray = this.getNodes();
			if (nodesArray.length > 0) {
				var lastNodeAdded = nodesArray[nodesArray.length - 1];
				if (lastNodeAdded.outputs) {
					sourceNode = lastNodeAdded;
				} else if (nodesArray.length > 1) {
					var lastButOneNodeAdded = nodesArray[nodesArray.length - 2];
					if (lastButOneNodeAdded.outputs) {
						sourceNode = lastButOneNodeAdded;
					}
				}
			}
		}
		return sourceNode;
	}

	// Returns a newly created 'auto node' whose position is based on the
	// source node (if one is provided) and the the other nodes on the canvas.
	createAutoNode(data, sourceNode) {
		const initialMarginX = this.objectModel.getCanvasLayout().autoLayoutInitialMarginX;
		const initialMarginY = this.objectModel.getCanvasLayout().autoLayoutInitialMarginY;
		const horizontalSpacing = this.objectModel.getCanvasLayout().autoLayoutHorizontalSpacing;
		const verticalSpacing = this.objectModel.getCanvasLayout().autoLayoutVerticalSpacing;

		var x = 0;
		var y = 0;

		if (sourceNode === null) {
			x = initialMarginX;
			y = initialMarginY;
		} else {
			x = sourceNode.x_pos + sourceNode.width + horizontalSpacing;
			y = sourceNode.y_pos;
		}

		data.offsetX = x;
		data.offsetY = y;

		const newNode = this.createNode(data);

		if (this.getNodes().length > 0) {
			if (this.isEntryBindingNode(newNode)) {
				newNode.x_pos = initialMarginX;
				newNode.y_pos += newNode.height + verticalSpacing;
			}
		}

		var newNodeOverLapping = true;

		while (newNodeOverLapping) {
			newNodeOverLapping = this.isNodeOverlappingOthers(newNode);
			if (newNodeOverLapping) {
				newNode.y_pos += newNode.height + verticalSpacing;
			}
		}

		return newNode;
	}

	cloneNodes() {
		return this.getNodes().map(function(node) {
			return Object.assign({}, node);
		});
	}

	cloneNode(inNode) {
		let node = Object.assign({}, inNode, { id: this.objectModel.getUniqueId(CLONE_NODE, { "node": inNode }) });

		// Add node height and width and, if appropriate, inputPortsHeight
		// and outputPortsHeight
		node = this.objectModel.setNodeAttributes(node);
		return node;
	}

	// Returns an array of nodes (that are in a format that conforms to the
	// schema) that can be added to a palette category. Each node is given
	// a new ID to make it unique within the palette.
	createNodesForPalette(selectedObjectIds) {
		const newNodes = [];
		selectedObjectIds.forEach((selObjId) => {
			let node = this.getNode(selObjId);
			if (node) {
				node = JSON.parse(JSON.stringify(node));
				node.id = this.objectModel.getUUID();
				node.x_pos = 0;
				node.y_pos = 0;
				node = PipelineOutHandler.createNode(node, []);
				if (node.type === SUPER_NODE) {
					if (!node.app_data) {
						node.app_data = {};
					}
					node.app_data.pipeline_data = this.objectModel.getSubPipelinesForSupernode(node);
				}
				newNodes.push(node);
			}
		});
		return newNodes;
	}

	replaceNodes(replacementNodes) {
		this.store.dispatch({ type: "REPLACE_NODES", data: replacementNodes, pipelineId: this.pipelineId });
	}

	// Returns true if a new link needs to be created with the newly created
	// auto node. A link is required when there IS a source node and the source
	// and target nodes each have a single port and the cardinality is not
	// exceeded for the ports.
	isLinkNeededWithAutoNode(newNode, srcNode) {
		let isLinkNeededWithAutoNode = false;

		if (newNode &&
				srcNode &&
				newNode.inputs &&
				srcNode.outputs &&
				newNode.inputs.length === 1 &&
				srcNode.outputs.length === 1 &&
				!this.isCardinalityExceeded(srcNode.outputs[0].id, newNode.inputs[0].id, srcNode, newNode)) {
			isLinkNeededWithAutoNode = true;
		}

		return isLinkNeededWithAutoNode;
	}

	isEntryBindingNode(node) {
		if (node.inputs && node.inputs.length > 0) {
			return false;
		}
		return true;
	}

	isExitBindingNode(node) {
		if (node.outputs && node.outputs.length > 0) {
			return false;
		}
		return true;
	}

	isNodeOverlappingOthers(node) {
		var index = this.getNodes().findIndex((arrayNode) => {
			return this.isSourceOverlappingTarget(arrayNode, node);
		});

		if (index === -1) {
			return false;
		}

		return true;
	}

	isSourceOverlappingTarget(srcNode, trgNode) {
		const srcHighlightGap = srcNode.layout.nodeHighlightGap;
		const trgHighlightGap = trgNode.layout.nodeHighlightGap;
		if (((srcNode.x_pos + srcNode.width + srcHighlightGap >= trgNode.x_pos - trgHighlightGap &&
					trgNode.x_pos + trgNode.width + trgHighlightGap >= srcNode.x_pos - srcHighlightGap) &&
					(srcNode.y_pos + srcNode.height + srcHighlightGap >= trgNode.y_pos - trgHighlightGap &&
						trgNode.y_pos + trgNode.height + trgHighlightGap >= srcNode.y_pos - srcHighlightGap))) {
			return true;
		}

		return false;
	}

	addNode(newNode) {
		if (newNode) {
			this.store.dispatch({ type: "ADD_NODE", data: { newNode: newNode }, pipelineId: this.pipelineId });
		}
	}

	// Add the newSupernode to canvasInfo and an array of newSubPipelines that it references.
	addSupernode(newSupernode, newSubPipelines) {
		const canvasInfo = this.objectModel.getCanvasInfo();
		let canvasInfoPipelines = this.objectModel.getCanvasInfo().pipelines.concat(newSubPipelines);

		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === this.pipelineId) {
				const newNodes = [
					...pipeline.nodes,
					newSupernode
				];
				return Object.assign({}, pipeline, { nodes: newNodes });
			}
			return pipeline;
		});
		const newCanvasInfo = Object.assign({}, canvasInfo, { pipelines: canvasInfoPipelines });
		this.objectModel.setCanvasInfo(newCanvasInfo);
	}

	addAutoNodeAndLink(newNode, newLink) {
		this.store.dispatch({ type: "ADD_AUTO_NODE", data: {
			newNode: newNode,
			newLink: newLink },
		pipelineId: this.pipelineId });
	}

	deleteNode(id) {
		this.deleteObject(id);
	}

	deleteSupernode(supernodeId) {
		let pipelineIds = [];
		const supernode = this.getNode(supernodeId);
		if (supernode) {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				pipelineIds = [supernode.subflow_ref.pipeline_id_ref];
				pipelineIds = pipelineIds.concat(this.objectModel.getDescendentPipelineIds(supernode.subflow_ref.pipeline_id_ref));
			}
			this.store.dispatch({
				type: "DELETE_SUPERNODE",
				data: {
					id: supernode.id,
					pipelineIds: pipelineIds
				},
				pipelineId: this.pipelineId
			});
		}
	}

	getNodes() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes;
		}
		return [];
	}

	// Returns the IDs of all nodes in the pipeline.
	getNodeIds() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes.map((node) => node.id);
		}
		return [];
	}

	getNode(nodeId) {
		return this.getNodes().find((node) => {
			return (node.id === nodeId);
		});
	}

	getSupernodes(inNodes) {
		const supernodes = [];
		const listOfNodes = inNodes ? inNodes : this.getNodes();
		listOfNodes.forEach((node) => {
			if (node.type === SUPER_NODE) {
				supernodes.push(node);
			}
		});
		return supernodes;
	}

	isDataNode(objId) {
		const node = this.getNode(objId);
		return (typeof node !== "undefined"); // node will be undefined if objId references a comment
	}

	sizeAndPositionObjects(objectsInfo) {
		this.store.dispatch({ type: "SIZE_AND_POSITION_OBJECTS", data: { objectsInfo: objectsInfo }, pipelineId: this.pipelineId });
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	expandSuperNodeInPlace(nodeId, nodePositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: true });
		node = this.objectModel.setNodeAttributes(node);
		this.store.dispatch({
			type: "SET_SUPERNODE_FLAG",
			data: {
				node: node,
				nodePositions: nodePositions
			},
			pipelineId: this.pipelineId
		});
	}

	collapseSuperNodeInPlace(nodeId, nodePositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: false });
		node = this.objectModel.setNodeAttributes(node);
		this.store.dispatch({
			type: "SET_SUPERNODE_FLAG",
			data: {
				node: node,
				nodePositions: nodePositions
			},
			pipelineId: this.pipelineId
		});
	}

	isSuperNodeExpandedInPlace(nodeId) {
		return this.getNode(nodeId).is_expanded === true;
	}

	isSupernode(nodeId) {
		return this.getNode(nodeId).type === SUPER_NODE;
	}

	doesNodeHavePorts(node) {
		return node.inputs && node.inputs.length > 0;
	}

	getNodeParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.parameters : null);
	}

	getNodeUiParameters(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.ui_parameters : null);
	}

	setNodeLabel(nodeId, newLabel) {
		this.store.dispatch({ type: "SET_NODE_LABEL", data: { nodeId: nodeId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setNodeDecorations(nodeId, newDecorations) {
		this.store.dispatch({ type: "SET_NODE_DECORATIONS", data: { nodeId: nodeId, decorations: this.ensureDecorationsHaveIds(newDecorations) }, pipelineId: this.pipelineId });
	}

	setInputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_INPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setOutputPortLabel(nodeId, portId, newLabel) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_LABEL", data: { nodeId: nodeId, portId: portId, label: newLabel }, pipelineId: this.pipelineId });
	}

	setInputPortSubflowNodeRef(nodeId, portId, subflowNodeRef) {
		this.store.dispatch({ type: "SET_INPUT_PORT_SUBFLOW_NODE_REF", data: { nodeId: nodeId, portId: portId, subflowNodeRef: subflowNodeRef }, pipelineId: this.pipelineId });
	}

	setOutputPortSubflowNodeRef(nodeId, portId, subflowNodeRef) {
		this.store.dispatch({ type: "SET_OUTPUT_PORT_SUBFLOW_NODE_REF", data: { nodeId: nodeId, portId: portId, subflowNodeRef: subflowNodeRef }, pipelineId: this.pipelineId });
	}

	setNodeMessage(nodeId, message) {
		this.store.dispatch({ type: "SET_NODE_MESSAGE", data: { nodeId: nodeId, message: message }, pipelineId: this.pipelineId });
	}

	setNodeMessages(nodeId, messages) {
		this.store.dispatch({ type: "SET_NODE_MESSAGES", data: { nodeId: nodeId, messages: messages }, pipelineId: this.pipelineId });
	}

	setNodeUiParameters(nodeId, uiParameters) {
		this.store.dispatch({ type: "SET_NODE_UI_PARAMETERS", data: { nodeId: nodeId, ui_parameters: uiParameters }, pipelineId: this.pipelineId });
	}

	setNodeParameters(nodeId, parameters) {
		this.store.dispatch({ type: "SET_NODE_PARAMETERS", data: { nodeId: nodeId, parameters: parameters }, pipelineId: this.pipelineId });
	}

	addCustomAttrToNodes(nodeIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_NODE_ATTR", data: { objIds: nodeIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.pipelineId });
	}

	removeCustomAttrFromNodes(nodeIds, attrName, attrValue) {
		this.store.dispatch({ type: "REMOVE_NODE_ATTR", data: { objIds: nodeIds, attrName: attrName }, pipelineId: this.pipelineId });
	}

	getNodeDecorations(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.decorations : null);
	}

	getNodeMessages(nodeId) {
		var node = this.getNode(nodeId);
		return (node ? node.messages : null);
	}

	getNodeMessage(nodeId, controlName) {
		var messages = this.getNodeMessages(nodeId);
		if (messages) {
			for (const message of messages) {
				if (message.id_ref === controlName) {
					return message;
				}
			}
		}
		return null;
	}

	getNodeStyle(nodeId, temporary) {
		const node = this.getNode(nodeId);
		if (temporary) {
			return (node ? node.style_temp : null);
		}
		return (node ? node.style : null);
	}

	hasErrorMessage(nodeId) {
		var node = this.getNode(nodeId);
		return this.objectModel.hasErrorMessage(node);
	}

	hasWarningMessage(nodeId) {
		var node = this.getNode(nodeId);
		return this.objectModel.hasWarningMessage(node);
	}

	isFlowValid(includeMsgTypes) {
		let validFlow = true;
		const flowNodes = this.getNodes();
		for (const node of flowNodes) {
			if (validFlow) {
				validFlow = this.isNodeValid(node, includeMsgTypes);
			}
		}
		return validFlow;
	}

	isNodeValid(node, includeMsgTypes) {
		let validNode = true;
		if (includeMsgTypes && Array.isArray(includeMsgTypes) && includeMsgTypes.length > 0) {
			for (const msg of node.messages) {
				if (includeMsgTypes.indexOf(msg.type) !== -1) {
					validNode = false;
				}
			}
		} else if (node.messages && node.messages.length > 0) {
			validNode = false;
		}
		return validNode;
	}

	getFlowMessages() {
		const flowNodes = this.getNodes();
		const nodeMsgs = {};
		flowNodes.forEach((node) => {
			if (node.messages && node.messages.length > 0) {
				nodeMsgs[node.id] = node.messages;
			}
		});
		return nodeMsgs;
	}

	autoLayout(layoutDirection) {
		const canvasInfoPipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		let movedNodesInfo = {};
		if (layoutDirection === VERTICAL) {
			movedNodesInfo = this.dagreAutolayout(DAGRE_VERTICAL, canvasInfoPipeline);
		} else {
			movedNodesInfo = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasInfoPipeline);
		}

		this.sizeAndPositionObjects(movedNodesInfo);
	}

	dagreAutolayout(direction, canvasInfoPipeline) {
		const canvasLayout = this.objectModel.getCanvasLayout();

		var nodeLinks = canvasInfoPipeline.links.filter((link) => {
			return link.type === NODE_LINK || link.type === ASSOCIATION_LINK;
		});

		var edges = nodeLinks.map((link) => {
			return { "v": link.srcNodeId, "w": link.trgNodeId, "value": { "points": [] } };
		});

		var nodesData = canvasInfoPipeline.nodes.map((node) => {
			let newWidth = node.width;
			if (direction === DAGRE_HORIZONTAL) {
				newWidth = node.width +
					Math.max(this.getPaddingForNode(node, canvasLayout, canvasInfoPipeline), canvasLayout.autoLayoutHorizontalSpacing);
			}

			return { "v": node.id, "value": { width: newWidth, height: node.height } };
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

		const initialMarginX = canvasLayout.autoLayoutInitialMarginX;
		const initialMarginY = canvasLayout.autoLayoutInitialMarginY;
		const verticalSpacing = canvasLayout.autoLayoutVerticalSpacing;
		let horizontalSpacing = canvasLayout.autoLayoutHorizontalSpacing;
		if (direction === DAGRE_HORIZONTAL) {
			horizontalSpacing = 0;
		}

		var g = dagre.graphlib.json.read(inputGraph);
		g.graph().marginx = initialMarginX;
		g.graph().marginy = initialMarginY;
		if (direction === "TB") {
			g.graph().nodesep = horizontalSpacing; // distance to separate the nodes horizontally
			g.graph().ranksep = verticalSpacing; // distance to separate the ranks vertically
		} else {
			g.graph().nodesep = verticalSpacing; // distance to separate the nodes vertically
			g.graph().ranksep = horizontalSpacing; // distance to separate the ranks horizontally
		}
		dagre.layout(g);

		const outputGraph = dagre.graphlib.json.write(g);
		const movedNodesInfo = this.convertGraphToMovedNodes(outputGraph, canvasInfoPipeline.nodes);

		return movedNodesInfo;
	}

	// Returns an array of move node actions that can be used to reposition the
	// nodes based on the provided Dagre output graph. (The node width and height
	// are included in the output because the move nodes action expects them).
	convertGraphToMovedNodes(outputGraph, canvasInfoPipelineNodes) {
		const movedNodesInfo = [];
		const lookup = {};

		for (var i = 0, len = outputGraph.nodes.length; i < len; i++) {
			lookup[outputGraph.nodes[i].v] = outputGraph.nodes[i];
		}

		// When calculaing the new x_pos and y_pos of the node use the width (and
		// height) specified in the output graph. This will be the 'newWidth' which
		// includes the space for the connecting lines calculated earlier.
		canvasInfoPipelineNodes.forEach((node) => {
			movedNodesInfo[node.id] = {
				id: node.id,
				x_pos: lookup[node.id].value.x - (lookup[node.id].value.width / 2),
				y_pos: lookup[node.id].value.y - (lookup[node.id].value.height / 2),
				width: node.width,
				height: node.height
			};
		});
		return movedNodesInfo;
	}


	// Returns a width that can be added to the node width for auto-layout.
	// This extra width is what is needed to display the connection lines
	// without then doubling back on themselves.
	getPaddingForNode(node, layoutInfo, canvasInfoPipeline) {
		return CanvasUtils.getNodePaddingToTargetNodes(node,
			canvasInfoPipeline.nodes, canvasInfoPipeline.links, layoutInfo.linkType);
	}

	// Return the dimensions of the bounding rectangle for the listOfNodes.
	getBoundingRectForNodes(listOfNodes) {
		let xLeft = listOfNodes[0].x_pos;
		let yTop = listOfNodes[0].y_pos;
		let xRight = listOfNodes[0].width + xLeft;
		let yBot = listOfNodes[0].height + yTop;

		listOfNodes.forEach((node) => {
			xLeft = Math.min(xLeft, node.x_pos);
			yTop = Math.min(yTop, node.y_pos);
			xRight = Math.max(xRight, node.x_pos + node.width);
			yBot = Math.max(yBot, node.y_pos + node.height);
		});

		return {
			x: xLeft,
			y: yTop,
			width: xRight - xLeft,
			height: yBot - yTop
		};
	}

	ensureDecorationsHaveIds(newDecorations) {
		if (newDecorations) {
			return newDecorations.map((dec) => Object.assign({}, dec, { id: dec.id || this.objectModel.getUUID() }));
		}
		return newDecorations;
	}

	// ---------------------------------------------------------------------------
	// Comment methods
	// ---------------------------------------------------------------------------

	createComment(source) {
		let comment = {
			id: this.objectModel.getUniqueId(CREATE_COMMENT),
			class_name: "d3-comment-rect",
			content: "",
			height: 42,
			width: 175,
			x_pos: source.mousePos.x,
			y_pos: source.mousePos.y,
			linkIds: [],
			selectedObjectIds: []
		};

		// Adjust for snap to grid, if necessary.
		comment = this.objectModel.setCommentAttributes(comment);

		source.selectedObjectIds.forEach((objId) => {
			if (this.isDataNode(objId)) { // Only add links to data nodes, not comments
				comment.selectedObjectIds.push(objId);
				comment.linkIds.push(this.objectModel.getUniqueId(CREATE_COMMENT_LINK, { "comment": comment, "targetNode": this.getNode(objId) }));
			}
		});

		return comment;
	}

	cloneComment(inComment) {
		// Adjust for snap to grid, if necessary.
		const comment = this.objectModel.setCommentAttributes(inComment);

		return Object.assign({}, comment, { id: this.objectModel.getUniqueId(CLONE_COMMENT, { "comment": comment }) });
	}

	addComment(data) {
		if (typeof data.selectedObjectIds === "undefined") {
			data.selectedObjectIds = [];
		}
		this.store.dispatch({ type: "ADD_COMMENT", data: data, pipelineId: this.pipelineId });
	}

	// Returns a position for a new comment added by clicking the 'add comment'
	// button on the toolbar. It searches for a position that is not already
	// occupied by an existing comment.
	getNewCommentPosition(svgPos) {
		const pos = { x_pos: svgPos.x_pos, y_pos: svgPos.y_pos };

		while (this.exactlyOverlaps(null, [pos])) {
			pos.x_pos += 10;
			pos.y_pos += 10;
		}

		return pos;
	}

	deleteComment(id) {
		this.deleteObject(id);
	}

	getComments() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.comments;
		}
		return [];

	}

	getComment(commentId) {
		return this.getComments().find((comment) => {
			return (comment.id === commentId);
		});
	}

	editComment(data) {
		this.store.dispatch({ type: "EDIT_COMMENT", data: data, pipelineId: this.pipelineId });
	}

	addCustomAttrToComments(comIds, attrName, attrValue) {
		this.store.dispatch({ type: "ADD_COMMENT_ATTR", data: { objIds: comIds, attrName: attrName, attrValue: attrValue }, pipelineId: this.pipelineId });
	}

	removeCustomAttrFromComments(comIds, attrName) {
		this.store.dispatch({ type: "REMOVE_COMMENT_ATTR", data: { objIds: comIds, attrName: attrName }, pipelineId: this.pipelineId });
	}

	getCommentStyle(commentId, temporary) {
		const comment = this.getComment(commentId);
		if (temporary) {
			return (comment ? comment.style_temp : null);
		}
		return (comment ? comment.style : null);
	}

	// ---------------------------------------------------------------------------
	// Link methods
	// ---------------------------------------------------------------------------

	createLink(trgNode, srcNode) {
		const linkId = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": srcNode, "targetNode": trgNode });
		let newLink = {
			id: linkId,
			srcNodeId: srcNode.id,
			trgNodeId: trgNode.id,
			type: NODE_LINK
		};

		if (srcNode.outputs && srcNode.outputs.length > 0) {
			newLink = Object.assign(newLink, { "srcNodePortId": srcNode.outputs[0].id });
		}
		if (trgNode.inputs && trgNode.inputs.length > 0) {
			newLink = Object.assign(newLink, { "trgNodePortId": trgNode.inputs[0].id });
		}

		return newLink;
	}

	deleteLink(link) {
		this.store.dispatch({ type: "DELETE_LINK", data: link, pipelineId: this.pipelineId });
	}

	deleteLinks(linksToDelete) {
		this.store.dispatch({ type: "DELETE_LINKS", data: { linkIds: linksToDelete }, pipelineId: this.pipelineId });
	}

	createNodeLinks(data) {
		const linkNodeList = [];
		data.nodes.forEach((srcInfo) => {
			data.targetNodes.forEach((trgInfo) => {
				const link = this.createNodeLink(srcInfo, trgInfo, data);
				if (link) {
					linkNodeList.push(link);
				}
			});
		});
		return linkNodeList;
	}

	createNodeLink(srcInfo, trgInfo, data) {
		if (this.isConnectionAllowed(srcInfo, trgInfo, data.type)) {
			const link = {};
			link.id = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": this.getNode(srcInfo.id), "targetNode": this.getNode(trgInfo.id) });
			link.type = data.type;
			link.srcNodeId = srcInfo.id;
			link.srcNodePortId = srcInfo.portId;
			link.trgNodeId = trgInfo.id;
			link.trgNodePortId = trgInfo.portId;
			if (data.class_name) {
				link.class_name = data.class_name;
			}
			if (data.linkName) {
				link.linkName = data.linkName;
			}
			return link;
		}
		return null;
	}

	cloneNodeLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.objectModel.getUniqueId(CLONE_NODE_LINK, { "link": link, "sourceNodeId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			srcNodePortId: link.srcNodePortId,
			trgNodeId: trgNodeId,
			trgNodePortId: link.trgNodePortId
		};
	}

	createCommentLinks(data) {
		const linkCommentList = [];
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				if (!this.commentLinkAlreadyExists(srcNodeId, trgNodeId)) {
					const info = {};
					info.id = this.objectModel.getUniqueId(CREATE_COMMENT_LINK, { "comment": this.getComment(srcNodeId), "targetNode": this.getNode(trgNodeId) });
					info.type = data.type;
					info.srcNodeId = srcNodeId;
					info.trgNodeId = trgNodeId;
					linkCommentList.push(info);
				}
			});
		});
		return linkCommentList;
	}

	cloneCommentLink(link, srcNodeId, trgNodeId) {
		return {
			id: this.objectModel.getUniqueId(CLONE_COMMENT_LINK, { "link": link, "commentId": srcNodeId, "targetNodeId": trgNodeId }),
			type: link.type,
			class_name: link.class_name,
			srcNodeId: srcNodeId,
			trgNodeId: trgNodeId
		};
	}

	addLinks(linkList) {
		linkList.forEach((link) => {
			this.store.dispatch({ type: "ADD_LINK", data: link, pipelineId: this.pipelineId });
		});
	}

	getLinks() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.links;
		}
		return [];

	}

	// Returns the IDs of all links in the pipeline.
	getLinkIds() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.links.map((link) => link.id);
		}
		return [];
	}

	// Returns an array of links from canvas info links which link
	// any of the nodes or comments passed in.
	getLinksBetween(inNodes, inComments) {
		const linksList = this.getLinks();
		const filteredLinks = linksList.filter((link) => {
			// All links must point to a node so look for target node first
			if (this.isObjectIdInObjects(link.trgNodeId, inNodes)) {
				// Next look for any node or comment as the source object.
				if (this.isObjectIdInObjects(link.srcNodeId, inNodes) ||
						this.isObjectIdInObjects(link.srcNodeId, inComments)) {
					return true;
				}
			}
			return false;
		});
		return filteredLinks;
	}

	getLinksContainingId(id) {
		const linksList = this.getLinks();
		const linksContaining = linksList.filter((link) => {
			return (link.srcNodeId === id || link.trgNodeId === id);
		});
		const returnLinks = linksContaining.map((link) => {
			var newLink = {};
			newLink.id = link.id;
			newLink.type = link.type;
			newLink.srcNodeId = link.srcNodeId;
			newLink.trgNodeId = link.trgNodeId;
			newLink.class_name = link.class_name;
			if (link.type === NODE_LINK) {
				newLink.srcNodePortId = link.srcNodePortId;
				newLink.trgNodePortId = link.trgNodePortId;
			}
			return newLink;
		});
		return returnLinks;
	}

	// Takes in an array of objects and returns an array of links to those objects.
	getLinksContainingIds(idArray) {
		let linksArray = [];
		idArray.forEach((objId) => {
			const linksForId = this.getLinksContainingId(objId);
			if (linksForId.length > 0) {
				linksArray = linksArray.concat(linksForId);
			}
		});
		return linksArray;
	}

	getLinksContainingSourceId(id) {
		return this.getLinks().filter((link) => {
			return (link.srcNodeId === id);
		});
	}

	getLinksContainingTargetId(id) {
		return this.getLinks().filter((link) => {
			return (link.trgNodeId === id);
		});
	}

	// Returns an array of node links for the array of nodes passed in.
	getNodeLinks(inNodes) {
		const nodeLinks = [];
		inNodes.forEach((node) => {
			const allNodeLinks = this.getLinksContainingId(node.id);
			allNodeLinks.forEach((link) => {
				if (link.type === NODE_LINK || link.type === ASSOCIATION_LINK) {
					nodeLinks.push(link);
				}
			});
		});
		return nodeLinks;
	}

	getNodeDataLinkFromInfo(srcNodeId, srcPortId, trgNodeId, trgPortId) {
		const srcNodePortId = this.getDefaultSrcPortId(srcNodeId, srcPortId);
		const trgNodePortId = this.getDefaultTrgPortId(trgNodeId, trgPortId);
		if (!srcNodePortId || !trgNodePortId) {
			return null;
		}

		return this.getLinks().find((link) => {
			if (link.type === NODE_LINK) {
				const linkSrcNodePortId = this.getDefaultSrcPortId(link.srcNodeId, link.srcNodePortId);
				const linkTrgNodePortId = this.getDefaultTrgPortId(link.trgNodeId, link.trgNodePortId);
				return (link.srcNodeId === srcNodeId &&
								linkSrcNodePortId === srcNodePortId &&
								link.trgNodeId === trgNodeId &&
								linkTrgNodePortId === trgNodePortId);
			}
			return false;
		});
	}

	getCommentLinkFromInfo(id1, id2) {
		return this.getLinks().find((link) => {
			if (link.type === COMMENT_LINK) {
				return (link.srcNodeId === id1 &&
								link.trgNodeId === id2) ||
								(link.srcNodeId === id2 &&
								link.trgNodeId === id1);

			}
			return false;
		});
	}

	getNodeAssocLinkFromInfo(id1, id2) {
		return this.getLinks().find((link) => {
			if (link.type === ASSOCIATION_LINK) {
				return (link.srcNodeId === id1 &&
								link.trgNodeId === id2) ||
								(link.srcNodeId === id2 &&
								link.trgNodeId === id1);
			}
			return false;
		});
	}

	// Returns the source port ID for the source node passed in.
	getDefaultSrcPortId(srcNodeId, srcNodePortId) {
		if (!srcNodePortId) {
			const srcNode = this.getNode(srcNodeId);
			if (srcNode && srcNode.outputs && srcNode.outputs.length > 0) {
				return srcNode.outputs[0].id;
			}
		}
		return srcNodePortId;
	}

	// Returns the target port ID for the target node passed in.
	getDefaultTrgPortId(trgNodeId, trgNodePortId) {
		if (!trgNodePortId) {
			const trgNode = this.getNode(trgNodeId);
			if (trgNode && trgNode.inputs && trgNode.inputs.length > 0) {
				return trgNode.inputs[0].id;
			}
		}
		return trgNodePortId;
	}

	getLink(linkId) {
		return this.getLinks().find((link) => {
			return (link.id === linkId);
		});
	}

	getLinkStyle(linkId, temporary) {
		const obj = this.getLink(linkId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setLinksClassName(linkIds, newClassName) {
		this.store.dispatch({ type: "SET_LINKS_CLASS_NAME", data: { linkIds: linkIds, label: newClassName }, pipelineId: this.pipelineId });
	}

	setLinkDecorations(linkId, newDecorations) {
		this.store.dispatch({ type: "SET_LINK_DECORATIONS", data: { linkId: linkId, decorations: this.ensureDecorationsHaveIds(newDecorations) }, pipelineId: this.pipelineId });
	}

	getLinkDecorations(linkId) {
		var link = this.getLink(linkId);
		return (link ? link.decorations : null);
	}

	// Returns a Boolean to indicate if a link can be created or not between
	// two nodes identified by the objects provided.
	isConnectionAllowed(srcNodeInfo, trgNodeInfo, type) {
		if (type === ASSOCIATION_LINK) {
			return this.isConnectionAllowedAssoc(srcNodeInfo, trgNodeInfo);
		}
		return this.isConnectionAllowedPorts(srcNodeInfo, trgNodeInfo);
	}

	// Returns a Boolean to indicate if an regular port-port link can be created
	// or not between two nodes identified by the objects provided.
	isConnectionAllowedPorts(srcNodeInfo, trgNodeInfo) {
		const srcNode = this.getNode(srcNodeInfo.id);
		const trgNode = this.getNode(trgNodeInfo.id);


		if (!srcNode || !trgNode) { // Source ot target are not valid.
			return false;
		}

		if (srcNodeInfo.id === trgNodeInfo.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		if (!this.doesNodeHavePorts(trgNode)) {
			return false;
		}

		if (this.linkAlreadyExists(srcNodeInfo, trgNodeInfo)) {
			return false;
		}

		if (this.isCardinalityExceeded(srcNodeInfo.portId, trgNodeInfo.portId, srcNode, trgNode)) {
			return false;
		}

		return true;
	}

	// Returns a Boolean to indicate if an association link can be created or
	// not between two nodes identified by the objects provided.
	isConnectionAllowedAssoc(srcNodeInfo, trgNodeInfo) {
		const srcNode = this.getNode(srcNodeInfo.id);
		const trgNode = this.getNode(trgNodeInfo.id);


		if (!srcNode || !trgNode) { // Source ot target are not valid.
			return false;
		}

		if (srcNodeInfo.id === trgNodeInfo.id) { // Cannot connect to ourselves, currently.
			return false;
		}

		return true;
	}

	linkAlreadyExists(srcNodeInfo, trgNodeInfo) {
		let exists = false;

		this.getLinks().forEach((link) => {
			if (link.srcNodeId === srcNodeInfo.id &&
					(!link.srcNodePortId || link.srcNodePortId === srcNodeInfo.portId) &&
					link.trgNodeId === trgNodeInfo.id &&
					(!link.trgNodePortId || link.trgNodePortId === trgNodeInfo.portId)) {
				exists = true;
			}
		});
		return exists;
	}

	commentLinkAlreadyExists(srcNodeId, trgNodeId) {
		let exists = false;

		this.getLinks().forEach((link) => {
			if (link.srcNodeId === srcNodeId &&
					link.trgNodeId === trgNodeId) {
				exists = true;
			}
		});
		return exists;
	}

	// Returns true if the comment with the commentId passed in
	// is linked to nonselected nodes.
	isCommentLinkedToNonSelectedNodes(commentId) {
		const commentLinks = this.getLinksContainingId(commentId);
		const selectedIds = this.objectModel.getSelectedObjectIds();

		let linkedToNonSelectedNodes = false;
		for (const commentLink of commentLinks) {
			linkedToNonSelectedNodes = !selectedIds.includes(commentLink.trgNodeId);
			if (linkedToNonSelectedNodes) {
				return linkedToNonSelectedNodes;
			}
		}
		return linkedToNonSelectedNodes;
	}

	isCardinalityExceeded(srcPortId, trgPortId, srcNode, trgNode) {
		var srcCount = 0;
		var trgCount = 0;

		this.getLinks().forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.srcNodeId === srcNode.id && srcPortId) {
					if (link.srcNodePortId === srcPortId ||
							(!link.srcNodePortId && this.isFirstPort(srcNode.outputs, srcPortId))) {
						srcCount++;
					}
				}

				if (link.trgNodeId === trgNode.id && trgPortId) {
					if (link.trgNodePortId === trgPortId ||
							(!link.trgNodePortId && this.isFirstPort(trgNode.inputs, trgPortId))) {
						trgCount++;
					}
				}
			}
		});

		if (srcCount > 0) {
			const srcPort = this.getPort(srcNode.outputs, srcPortId);
			if (srcPort &&
					srcPort.cardinality &&
					Number(srcPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					srcCount >= Number(srcPort.cardinality.max)) {
				return true;
			}
		}

		if (trgCount > 0) {
			const trgPort = this.getPort(trgNode.inputs, trgPortId);
			if (trgPort &&
					trgPort.cardinality &&
					Number(trgPort.cardinality.max) !== -1 && // -1 indicates an infinite numder of ports are allowed
					trgCount >= Number(trgPort.cardinality.max)) {
				return true;
			}
		}

		return false;
	}

	isFirstPort(portArray, portId) {
		const index = portArray.findIndex((port) => {
			return port.id === portId;
		});

		if (index === 0) {
			return true;
		}
		return false;
	}

	getPort(portArray, portId) {
		const index = portArray.findIndex((port) => {
			return port.id === portId;
		});

		if (index > -1) {
			return portArray[index];
		}
		return null;
	}

	pushUniqueLinks(objectLink, linksToDelete) {
		if (linksToDelete.findIndex((linkToDelete) => linkToDelete.id === objectLink.id) === -1) {
			linksToDelete.push(objectLink);
		}
		return linksToDelete;
	}
}
