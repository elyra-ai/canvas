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
/* eslint arrow-body-style: ["off"] */

// ---------------------------------------------------------------------------
// This API Pipeline Class wrappers the pipeline specific methods which result
// in a change to the object model. It is used internally by the object-model
// and canvas-controller.
// ---------------------------------------------------------------------------

import PipelineOutHandler from "./pipeline-out-handler.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";

import dagre from "dagre/dist/dagre.min.js";
import { cloneDeep, get, has, set } from "lodash";

import { ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, VERTICAL,
	DAGRE_HORIZONTAL, DAGRE_VERTICAL,
	CREATE_NODE, CREATE_COMMENT, CREATE_NODE_LINK, CREATE_COMMENT_LINK,
	SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING,
	BINDING, SUPER_NODE }
	from "../common-canvas/constants/canvas-constants.js";

export default class APIPipeline {
	constructor(pipelineId, objectModel) {
		this.pipelineId = pipelineId;
		this.objectModel = objectModel;
		this.store = objectModel.store;
	}

	// ---------------------------------------------------------------------------
	// Pipeline methods
	// ---------------------------------------------------------------------------
	getPipeline() {
		return this.objectModel.getCanvasInfoPipeline(this.pipelineId);
	}

	isPipelineExternal() {
		return this.objectModel.getCanvasInfoPipeline(this.pipelineId).parentUrl;
	}

	// ---------------------------------------------------------------------------
	// Node AND comment methods
	// ---------------------------------------------------------------------------

	getObjects() {
		const pipeline = this.objectModel.getCanvasInfoPipeline(this.pipelineId);
		if (pipeline) {
			return pipeline.nodes.concat(pipeline.comments);
		}
		return [];

	}

	moveObjects(data) {
		this.store.dispatch({ type: "MOVE_OBJECTS", data: data, pipelineId: this.pipelineId });
	}

	// Deletes the object (which can be a node or a comment) identified
	// by the objId passed in.
	deleteObject(objId) {
		this.deleteObjects([objId]);
	}

	// Deletes the objects (which can be a mix of nodes and comments) identified
	// by the array of IDs passed in and calls the selection changed handler.
	deleteObjects(objectIds) {
		this.objectModel.executeWithSelectionChange((inObjectIds) => {
			const { nodes, comments } = this.filterNodesAndComments(inObjectIds);
			this.deleteNodesInternal(nodes);
			this.deleteCommentsInternal(comments);
		}, objectIds);
	}

	addAndUpdateObjects(data) {
		this.objectModel.executeWithSelectionChange((inData) => {
			this.store.dispatch({ type: "ADD_AND_UPDATE_OBJECTS", data: inData, pipelineId: this.pipelineId });
		}, data);
	}

	deleteAndUpdateObjects(data) {
		this.objectModel.executeWithSelectionChange((inData) => {
			this.store.dispatch({ type: "DELETE_AND_UPDATE_OBJECTS", data: inData, pipelineId: this.pipelineId });
		}, data);
	}

	addPastedObjects(data) {
		this.objectModel.executeWithSelectionChange((inData) => {
			this.store.dispatch({ type: "ADD_PASTED_OBJECTS", data: inData, pipelineId: this.pipelineId });
		}, data);
	}

	deletePastedObjects(data) {
		this.objectModel.executeWithSelectionChange((inData) => {
			this.store.dispatch({ type: "DELETE_PASTED_OBJECTS", data: inData, pipelineId: this.pipelineId });
		}, data);
	}

	// Returns an object containing and array of nodes and an array of comments
	// that match the array of objectIds passed in.
	filterNodesAndComments(objectIds) {
		const nodes = [];
		const comments = [];
		objectIds.forEach((oId) => {
			const comment = this.getComment(oId);
			if (comment) {
				comments.push(comment);
			} else {
				nodes.push(this.getNode(oId));
			}
		});
		return { nodes, comments };
	}

	getObjectStyle(objId, temporary) {
		const obj = this.getObject(objId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setObjectsClassName(objectIds, newClassName) {
		this.store.dispatch({ type: "SET_OBJECTS_CLASS_NAME", data: { objIds: objectIds, newClassName: newClassName }, pipelineId: this.pipelineId });
	}

	setObjectsColorClassName(objectIds, newColorClass) {
		this.store.dispatch({ type: "SET_OBJECTS_COLOR_CLASS_NAME", data: { objIds: objectIds, newColorClass: newColorClass }, pipelineId: this.pipelineId });
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
		this.store.dispatch({ type: "DELETE_LINKS", data: { linksToDelete: linksToDelete }, pipelineId: this.pipelineId });
		return linksToDelete;
	}

	isEmpty() {
		return this.store.isEmpty(this.pipelineId);
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

	// Returns true if any of the node, comment or link definitions passed in
	// exactly overlap any of the existing nodes, comments or links. This is used
	// by the paste-from-clipboard code to detect if nodes, comments and links
	// being pasted overlap existing nodes, comments and links.
	exactlyOverlaps(nodeDefs, commentDefs, linkDefs) {
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
		if (overlaps === false && linkDefs && linkDefs.length > 0) {
			const index = linkDefs.findIndex((linkDef) => {
				return this.exactlyOverlapsLinks(linkDef);
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

	// Return true if the comment definition passed in exactly overlaps any
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

	// Return true if the link definition passed in exactly overlaps any
	// of the existing links in its coordinate positions (if any) identified by
	// the srcPos and trgPos properties.
	exactlyOverlapsLinks(link) {
		var overlap = false;
		this.getLinks().forEach((canvasLink) => {
			if (canvasLink.srcPos &&
					link.srcPos &&
					canvasLink.srcPos.x_pos === link.srcPos.x_pos &&
					canvasLink.srcPos.y_pos === link.srcPos.y_pos) {
				overlap = true;
			}
			if (canvasLink.trgPos &&
					link.trgPos &&
					canvasLink.trgPos.x_pos === link.trgPos.x_pos &&
					canvasLink.trgPos.y_pos === link.trgPos.y_pos) {
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
		let nodeTemplate = data.nodeTemplate;
		// If the nodeTemplate has app_data.ui_data field then it will be a
		// template that conforms to the pipelineFlow schema and needs to be
		// converted to the internal format for a node.
		if (has(data.nodeTemplate, "app_data.ui_data")) {
			nodeTemplate = this.objectModel.convertNodeTemplate(nodeTemplate);
		}
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
	getAutoSourceNode(autoLinkOnlyFromSelNodes) {
		var sourceNode = null;
		var selectedNodes = this.objectModel.getSelectedNodes();

		if (selectedNodes.length === 1 &&
				this.isViableAutoSourceNode(selectedNodes[0])) {
			sourceNode = selectedNodes[0];

		} else if (!autoLinkOnlyFromSelNodes) {
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

	// Returns true if the node passed in is OK to be used as a source node
	// for a node which is to be auto-added to the canvas.
	isViableAutoSourceNode(node) {
		return node.outputs &&
			node.outputs.length > 0 &&
			!CanvasUtils.isSrcCardinalityAtMax(node.outputs[0].id, node, this.getLinks());
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

	// Returns an array of nodes (that are in a format that conforms to the
	// schema) that can be added to a palette category. Each node is given
	// a new ID to make it unique within the palette.
	createNodesForPalette(selectedObjectIds) {
		const newNodes = [];
		selectedObjectIds.forEach((selObjId) => {
			let node = this.getNode(selObjId);
			if (node) {
				node = cloneDeep(node);
				node.id = this.objectModel.getUUID();
				node.x_pos = 0;
				node.y_pos = 0;
				node = PipelineOutHandler.createSchemaNode(node, []);
				if (node.type === SUPER_NODE) {
					const pData = this.objectModel.getSchemaPipelinesForSupernode(node);
					set(node, "app_data.ui_data.sub_pipelines", pData);
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
				!CanvasUtils.isCardinalityAtMax(srcNode.outputs[0].id, newNode.inputs[0].id, srcNode, newNode, this.getLinks())) {
			isLinkNeededWithAutoNode = true;
		}

		return isLinkNeededWithAutoNode;
	}

	// Returns true if the node passed in is an entry binding node. We detect
	// this by checking that there are no inputs.
	isEntryBindingNode(node) {
		if (node.type === BINDING && (!node.inputs || node.inputs.length === 0)) {
			return true;
		}
		return false;
	}

	// Returns true if the node passed in is an exit binding node. We detect
	// this by checking that the node *has* inputs because an exit binding node
	// might have outputs.
	isExitBindingNode(node) {
		if (node.type === BINDING && node.inputs && node.inputs.length > 0) {
			return true;
		}
		return false;
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
			if (newNode.type === SUPER_NODE) {
				this.addSupernode(newNode, get(newNode, "sub_pipelines"));
			} else {
				this.store.dispatch({ type: "ADD_NODE", data: { newNode: newNode }, pipelineId: this.pipelineId });
			}
		}
	}

	addSupernodes(supernodesToAdd, pipelinesToAdd, extPipelineFlowsToAdd) {
		this.store.dispatch({ type: "ADD_SUPERNODES", data: {
			supernodesToAdd: supernodesToAdd,
			pipelinesToAdd: pipelinesToAdd,
			extPipelineFlowsToAdd: extPipelineFlowsToAdd,
			pipelineId: this.pipelineId
		} });
	}

	// Add the newSupernode to canvasInfo and an array of newSubPipelines that
	// it references. Optionally, a link may also be added.
	addSupernode(newSupernode, newSubPipelines) {
		const canvasInfo = this.objectModel.getCanvasInfo();
		let canvasInfoPipelines = this.objectModel.getCanvasInfo().pipelines.concat(newSubPipelines || []);

		canvasInfoPipelines = canvasInfoPipelines.map((pipeline) => {
			if (pipeline.id === this.pipelineId) {
				const newNodes = [
					...pipeline.nodes,
					this.cloneSupernodeRemovePipelineData(newSupernode)
				];
				return Object.assign({}, pipeline, { nodes: newNodes });
			}
			return pipeline;
		});
		const newCanvasInfo = Object.assign({}, canvasInfo, { pipelines: canvasInfoPipelines });
		this.objectModel.setCanvasInfo(newCanvasInfo);
	}

	cloneSupernodeRemovePipelineData(supernode) {
		const sn = Object.assign({}, supernode);
		if (sn.app_data) {
			sn.app_data = Object.assign({}, sn.app_data);
			if (sn.app_data.ui_data) {
				delete sn.app_data.ui_data.sub_pipelines;
			}
		}
		return sn;
	}

	// Deletes the node identified by the nodeId. If the node is a Supernode, the
	// relevant pipelines and external pipeline flows will be deleted.
	deleteNode(nodeId) {
		const node = this.getNode(nodeId);
		if (node) {
			this.deleteNodes([node]);
		}
	}

	// Deletes the nodes identified by the nodes array. If any of the the nodes
	// are supernodes, the relevant pipelines and external pipeline flows will
	// be deleted if removePipelines is true. It also calls the selection changed
	// handler.
	deleteNodes(nodes, removePipelines = true) {
		if (nodes && nodes.length > 0) {
			this.objectModel.executeWithSelectionChange((obj) => {
				this.deleteNodesInternal(obj.nodes, obj.removePipelines);
			}, { nodes, removePipelines });
		}
	}

	// Deletes the nodes identified by the nodes array. If any of the the nodes
	// are supernodes, the relevant pipelines and external pipeline flows will
	// be deleted if removePipelines is true. It does not call the selection
	// changed handler.
	deleteNodesInternal(nodes, removePipelines) {
		// Handle regular nodes
		const regularNodes = nodes.filter((n) => n.type !== SUPER_NODE);
		regularNodes.forEach((n) => {
			this.store.dispatch({ type: "DELETE_OBJECT", data: { id: n.id }, pipelineId: this.pipelineId });
		});

		// Handle supernodes
		const supernodes = nodes.filter((n) => n.type === SUPER_NODE);
		if (removePipelines) {
			this.deleteSupernodesAndDescPipelines(supernodes);
		} else {
			this.deleteSupernodes(supernodes, [], []);
		}
	}

	// Deletes the supernodes passed in and also any descending pipelines. It
	// makes sure it doesn't delete any external pipelines that are referenced by
	// other supernodes in the canvas info.
	deleteSupernodesAndDescPipelines(supernodes) {
		const pipelinesToDelete = this.objectModel.getDescPipelinesToDelete(supernodes, this.pipelineId);
		const extPipelineFlowsToDelete =
			this.objectModel.getExternalPipelineFlowsForPipelines(pipelinesToDelete);
		this.deleteSupernodes(supernodes, pipelinesToDelete, extPipelineFlowsToDelete);
	}

	// Deletes the supernodes passed in along with any pipelines and external flows.
	deleteSupernodes(supernodesToDelete, pipelinesToDelete, extPipelineFlowsToDelete) {
		this.store.dispatch({
			type: "DELETE_SUPERNODES",
			data: {
				supernodesToDelete: supernodesToDelete,
				pipelinesToDelete: pipelinesToDelete,
				extPipelineFlowsToDelete: extPipelineFlowsToDelete,
				pipelineId: this.pipelineId
			}
		});
	}

	deconstructSupernode(data) {
		this.store.dispatch({ type: "DECONSTRUCT_SUPERNODE", data: data });
	}

	reconstructSupernode(data) {
		this.store.dispatch({ type: "RECONSTRUCT_SUPERNODE", data: data });
	}

	getNodes() {
		return this.store.getNodes(this.pipelineId);
	}

	// Returns the IDs of all nodes in the pipeline.
	getNodeIds() {
		return this.getNodes().map((n) => n.id);
	}

	getNode(nodeId) {
		return this.store.getNode(nodeId, this.pipelineId);
	}

	getSupernodes() {
		return CanvasUtils.filterSupernodes(this.getNodes());
	}

	isDataNode(objId) {
		return this.getNode(objId);
	}

	sizeAndPositionObjects(objectsInfo, linksInfo) {
		this.store.dispatch({ type: "SIZE_AND_POSITION_OBJECTS",
			data: { objectsInfo, linksInfo }, pipelineId: this.pipelineId });
	}

	// Filters data node IDs from the list of IDs passed in and returns them
	// in a new array. That is, the result array doesn't contain any comment IDs.
	filterDataNodes(objectIds) {
		return objectIds.filter((objId) => {
			return this.isDataNode(objId);
		});
	}

	expandSuperNodeInPlace(nodeId, objectPositions, linkPositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: true });
		node = this.objectModel.setNodeAttributes(node);
		this.store.dispatch({
			type: "SET_SUPERNODE_EXPAND_STATE",
			data: { node, objectPositions, linkPositions },
			pipelineId: this.pipelineId
		});
	}

	collapseSuperNodeInPlace(nodeId, objectPositions, linkPositions) {
		let node = Object.assign({}, this.getNode(nodeId), { is_expanded: false });
		node = this.objectModel.setNodeAttributes(node);
		this.store.dispatch({
			type: "SET_SUPERNODE_EXPAND_STATE",
			data: { node, objectPositions, linkPositions },
			pipelineId: this.pipelineId
		});
	}

	isSuperNodeExpandedInPlace(nodeId) {
		return this.getNode(nodeId).is_expanded === true;
	}

	isSupernode(nodeId) {
		return this.getNode(nodeId).type === SUPER_NODE;
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

	setNodeProperties(nodeId, properties) {
		let newNode = cloneDeep(this.getNode(nodeId));
		newNode = Object.assign(newNode, properties);
		newNode = this.objectModel.setNodeAttributes(newNode);
		this.store.dispatch({ type: "REPLACE_NODE", data: { node: newNode }, pipelineId: this.pipelineId });
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

	setNodeInputPorts(nodeId, inputs) {
		this.setNodeProperties(nodeId, { inputs });
	}

	setNodeOutputPorts(nodeId, outputs) {
		this.setNodeProperties(nodeId, { outputs });
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

	getNodeInputPorts(nodeId) {
		const node = this.getNode(nodeId);
		return node ? node.inputs : null;
	}

	getNodeOutputPorts(nodeId) {
		const node = this.getNode(nodeId);
		return node ? node.outputs : null;
	}

	getNodeClassName(nodeId) {
		const node = this.getNode(nodeId);
		return node ? node.class_name : null;
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
		let movedLinksInfo = {};
		if (layoutDirection === VERTICAL) {
			[movedNodesInfo, movedLinksInfo] = this.dagreAutolayout(DAGRE_VERTICAL, canvasInfoPipeline);
		} else {
			[movedNodesInfo, movedLinksInfo] = this.dagreAutolayout(DAGRE_HORIZONTAL, canvasInfoPipeline);
		}

		this.sizeAndPositionObjects(movedNodesInfo, movedLinksInfo);
	}

	dagreAutolayout(direction, canvasInfoPipeline) {
		const canvasLayout = this.objectModel.getCanvasLayout();

		var nodeLinks = canvasInfoPipeline.links.filter((link) => {
			return link.type === NODE_LINK || link.type === ASSOCIATION_LINK;
		});

		const dummyNodeIds = [];
		let nodesData = [];

		nodeLinks.forEach((link) => {
			// If there is no srcNodeId create a dummy node id and attach to the detached link
			if (!link.srcNodeId) {
				link.srcNodeId = "temp-src-node-" + link.id;
				dummyNodeIds.push(link.srcNodeId);
			}
			// If there is no trgNodeId create a dummy node id and attach to the detached link
			if (!link.trgNodeId) {
				link.trgNodeId = "temp-trg-node-" + link.id;
				dummyNodeIds.push(link.trgNodeId);
			}
		});

		// Push the dummy Nodes to nodeData so that dagre treats them as nodes attached to detached links
		dummyNodeIds.forEach((dummyNodeId) => {
			nodesData.push({ "v": dummyNodeId, "value": { width: 150, height: 80 } });
		});

		var edges = nodeLinks.map((link) => {
			return { "v": link.srcNodeId, "w": link.trgNodeId, "value": { "points": [] } };
		});

		// Add actual nodes to nodesData and adjust width if necessary
		nodesData = nodesData.concat(canvasInfoPipeline.nodes.map((node) => {
			let newWidth = node.width;
			if (direction === DAGRE_HORIZONTAL) {
				newWidth = node.width +
					Math.max(this.getPaddingForNode(node, canvasLayout, canvasInfoPipeline), canvasLayout.autoLayoutHorizontalSpacing);
			}

			return { "v": node.id, "value": { width: newWidth, height: node.height } };
		}));

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
		const movedLinksInfo = this.convertGraphToMoveLinks(outputGraph, canvasInfoPipeline.links);

		return [movedNodesInfo, movedLinksInfo];
	}

	// Returns an array of move node actions that can be used to reposition the
	// nodes based on the provided Dagre output graph. (The node width and height
	// are included in the output because the move nodes action expects them).
	convertGraphToMovedNodes(outputGraph, canvasInfoPipelineNodes) {
		const movedNodesInfo = {};
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

	// Returns an array of move link actions that can be used to reposition the
	// links based on the provided Dagre output graph.
	// Iterate nodes and check if there are any dummy nodes.
	// If there are dummy nodes then links should have x/y cordinates as per dummy_nodes.
	convertGraphToMoveLinks(outputGraph, canvasInfoPipelineLinks) {
		const movedLinksInfo = {};
		const linksPos = [];

		const nodes = outputGraph.nodes;

		nodes.forEach((node) => {
			// Record the x and y position of dummy node to be assigned to the detached link.
			// A fully detached link can have both temp-src-node and temp-trg-node
			if (node.v.startsWith("temp-src-node-")) {
				const linkId = node.v.split("temp-src-node-")[1];

				linksPos[linkId] = {
					srcPos: {
						x_pos: node.value.x,
						y_pos: node.value.y
					}
				};
			}
			if (node.v.startsWith("temp-trg-node-")) {
				const linkId = node.v.split("temp-trg-node-")[1];

				linksPos[linkId] = {
					// If it is a fully detached link include srcPos cordinates.
					...linksPos[linkId],
					trgPos: {
						x_pos: node.value.x,
						y_pos: node.value.y
					}
				};
			}
		});

		canvasInfoPipelineLinks.forEach((link) => {
			// If it is a semi detached or a detached link update its src/trg pos based on dummy node cordinates.
			if (link?.srcPos || link?.trgPos) {
				movedLinksInfo[link.id] = Object.assign({ id: link.id }, linksPos[link.id]);
				delete movedLinksInfo[link.id].srcNodeId;
				delete movedLinksInfo[link.id].trgNodeId;
			} else {
				// If it is not a detached/semi-detached link retain its original properties.
				movedLinksInfo[link.id] = link;
			}
		});

		return movedLinksInfo;
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

	addComment(data) {
		this.store.dispatch({ type: "ADD_COMMENT", data: data, pipelineId: this.pipelineId });
		this.store.dispatch({ type: "SHOW_COMMENTS" });
	}

	// Returns a position for a new comment added by clicking the 'add comment'
	// button on the toolbar. It searches for a position that is not already
	// occupied by an existing comment.
	getAdjustedCommentPosition(comPos) {
		const stgType = this.objectModel.getCanvasConfig().enableSnapToGridType;
		const pos = { x_pos: comPos.x, y_pos: comPos.y };

		while (this.exactlyOverlaps(null, [pos], null)) {
			if (stgType === SNAP_TO_GRID_DURING || stgType === SNAP_TO_GRID_AFTER) {
				pos.x_pos += this.objectModel.getCanvasLayout().snapToGridXPx;
				pos.y_pos += this.objectModel.getCanvasLayout().snapToGridYPx;
			} else {
				pos.x_pos += 10;
				pos.y_pos += 10;
			}
		}

		return pos;
	}

	// Deletes the comment specified by the id passed in.
	deleteComment(id) {
		const comment = this.getComment(id);
		if (comment) {
			this.deleteComments([comment]);
		}
	}

	// Deletes the comments in the array passed in and calls the selection
	// changed handler.
	deleteComments(comments) {
		if (comments && comments.length > 0) {
			this.objectModel.executeWithSelectionChange((inComments) => {
				this.deleteCommentsInternal(inComments);
			}, comments);
		}
	}

	// Deletes the comments in the array passed in. It does not call the
	// selection changed handler.
	deleteCommentsInternal(inComments) {
		inComments.forEach((n) => {
			this.store.dispatch({ type: "DELETE_OBJECT", data: { id: n.id }, pipelineId: this.pipelineId });
		});
	}

	getComments() {
		return this.store.getComments(this.pipelineId);
	}

	getComment(commentId) {
		return this.store.getComment(commentId, this.pipelineId);
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

	getCommentClassName(commentId) {
		const comment = this.getComment(commentId);
		return (comment ? comment.class_name : null);
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

	createLinkFromInfo(linkInfo) {
		const linkId = this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNodeId": linkInfo.srcNodeId, "targetNodeId": linkInfo.trgNodeId });
		return Object.assign({ id: linkId, type: NODE_LINK }, linkInfo);
	}

	deleteLink(link) {
		this.store.dispatch({ type: "DELETE_LINK", data: link, pipelineId: this.pipelineId });
	}

	deleteLinks(linksToDelete) {
		this.store.dispatch({ type: "DELETE_LINKS", data: { linksToDelete: linksToDelete }, pipelineId: this.pipelineId });
	}

	updateLinks(links) {
		this.store.dispatch({ type: "UPDATE_LINKS", data: { linksToUpdate: links }, pipelineId: this.pipelineId });
	}

	updateLink(link) {
		this.updateLinks([link]);
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

	// Creates a node link from the srcInfo and trgInfo and other link 'data'
	// passed in.
	createNodeLink(srcInfo, trgInfo, data) {
		const srcNode = this.getNode(srcInfo.id);
		const trgNode = this.getNode(trgInfo.id);
		const links = this.getLinks();

		if ((srcInfo.srcPos && trgInfo.trgPos) || // Fully detached
				(srcInfo.srcPos && CanvasUtils.isTrgConnectionAllowedWithDetachedLinks(trgInfo.portId, trgNode, links)) || // Semi-detached
				(trgInfo.trgPos && CanvasUtils.isSrcConnectionAllowedWithDetachedLinks(srcInfo.portId, srcNode, links)) || // Semi-detached
				(CanvasUtils.isConnectionAllowed(srcInfo.portId, trgInfo.portId, srcNode, trgNode, links, data.type))) { // Fully attached
			const link = {};
			link.id = data.id ? data.id : this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": srcNode, "targetNode": trgNode });
			link.type = data.type;
			if (srcInfo.srcPos) {
				link.srcPos = srcInfo.srcPos;
			} else {
				link.srcNodeId = srcInfo.id;
				link.srcNodePortId = srcInfo.portId;
			}
			if (trgInfo.trgPos) {
				link.trgPos = trgInfo.trgPos;
			} else {
				link.trgNodeId = trgInfo.id;
				link.trgNodePortId = trgInfo.portId;
			}
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

	// Creates a new link objct which is attached to a source node but detached
	// at the target end. The input data object may contain some or all of the
	// link properties because they may be populatd by the host application
	// in the beforeEditActionHandler.
	createNodeLinkDetached(data) {
		const link = {};
		link.id = data.id ? data.id : this.objectModel.getUniqueId(CREATE_NODE_LINK, { "sourceNode": this.getNode(data.srcNodeId) });
		link.type = data.type;
		link.srcNodeId = data.srcNodeId;
		link.srcNodePortId = data.srcNodePortId;
		link.trgPos = { x_pos: data.trgPos.x, y_pos: data.trgPos.y };

		if (data.class_name) {
			link.class_name = data.class_name;
		}
		if (data.linkName) {
			link.linkName = data.linkName;
		}
		if (data.typeAttr) {
			link.typeAttr = data.typeAttr;
		}
		if (data.description) {
			link.description = data.description;
		}
		return link;
	}

	createCommentLinks(data) {
		const linkCommentList = [];
		data.nodes.forEach((srcNodeId) => {
			data.targetNodes.forEach((trgNodeId) => {
				if (CanvasUtils.isCommentLinkConnectionAllowed(srcNodeId, trgNodeId, this.getLinks())) {
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

	addLinks(linkList) {
		linkList.forEach((link) => {
			this.addLink(link);
		});
	}

	addLink(link) {
		this.store.dispatch({ type: "ADD_LINK", data: link, pipelineId: this.pipelineId });
	}

	setLinks(linkList) {
		this.store.dispatch({ type: "SET_LINKS", data: linkList, pipelineId: this.pipelineId });
	}

	getLinks() {
		return this.store.getLinks(this.pipelineId);
	}

	// Returns the IDs of all links in the pipeline.
	getLinkIds() {
		return this.getLinks().map((l) => l.id);
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

	// Returns an array of cloned links that refer to the id passed in as either
	// the source node or the target node.
	getLinksContainingId(id) {
		return this.getLinks()
			.filter((link) => link.srcNodeId === id || link.trgNodeId === id)
			.map((link) => Object.assign({}, link));
	}

	// Returns an array of cloned links that reference one of the objects (nodes
	// and/or comments) identified by the array of object IDs passed in. The links
	// returned may be of any type.
	getLinksContainingIds(objIdArray) {
		let linksArray = [];
		objIdArray.forEach((objId) => {
			const linksForId = this.getLinksContainingId(objId);
			if (linksForId.length > 0) {
				linksArray = CanvasUtils.concatUniqueBasedOnId(linksForId, linksArray);
			}
		});
		return linksArray;
	}

	// Returns an array of cloned node data links that reference one of the
	// objects (nodes and/or comments) identified by the array of object IDs
	// passed in. The links returned may be of any type.
	getNodeDataLinksContainingIds(objIdArray) {
		return this.getLinksContainingIds(objIdArray)
			.filter((link) => link.type === NODE_LINK);
	}

	// Returns an array of links with id as the source ID.
	getLinksContainingSourceId(id) {
		return this.getLinks().filter((link) => {
			return (link.srcNodeId === id);
		});
	}

	// Returns an array of links with id as the target ID.
	getLinksContainingTargetId(id) {
		return this.getLinks().filter((link) => {
			return (link.trgNodeId === id);
		});
	}

	// Returns an array of 'attached' links with id as the source ID.
	// Note If the link has a srcNodeId and trgNodeId it is attached.
	getAttachedLinksContainingSourceId(id) {
		return this.getLinks().filter((link) => {
			return (link.srcNodeId === id && link.trgNodeId);
		});
	}

	// Returns an array of 'attached' links with id as the target ID.
	// Note: If the link has a trgNodeId and srcNodeId it is attached.
	getAttachedLinksContainingTargetId(id) {
		return this.getLinks().filter((link) => {
			return (link.trgNodeId === id && link.srcNodeId);
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

	// Returns an array of current data links.
	getNodeDataLinks() {
		return this.getLinks().filter((l) => l.type === NODE_LINK);
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

	setCommentProperties(commentId, commentProperties) {
		this.store.dispatch({ type: "SET_COMMENT_PROPERTIES", data: { commentId: commentId, commentProperties: commentProperties }, pipelineId: this.pipelineId });
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
		return this.store.getLink(linkId, this.pipelineId);
	}

	setLinkProperties(linkId, linkProperties) {
		this.store.dispatch({ type: "SET_LINK_PROPERTIES", data: { linkId: linkId, linkProperties: linkProperties }, pipelineId: this.pipelineId });
	}

	setNodeDataLinkSrcInfo(linkId, srcNodeId, srcNodePortId) {
		this.store.dispatch({ type: "SET_LINK_SRC_INFO", data: { linkId: linkId, srcNodeId: srcNodeId, srcNodePortId: srcNodePortId }, pipelineId: this.pipelineId });
	}

	setNodeDataLinkTrgInfo(linkId, trgNodeId, trgNodePortId) {
		this.store.dispatch({ type: "SET_LINK_TRG_INFO", data: { linkId: linkId, trgNodeId: trgNodeId, trgNodePortId: trgNodePortId }, pipelineId: this.pipelineId });
	}

	getLinkClassName(linkId) {
		const obj = this.getLink(linkId);
		return (obj && obj.class_name ? obj.class_name : null);
	}

	getLinkStyle(linkId, temporary) {
		const obj = this.getLink(linkId);
		if (temporary) {
			return (obj && obj.style_temp ? obj.style_temp : null);
		}
		return (obj && obj.style ? obj.style : null);
	}

	setLinksClassName(linkIds, newClassName) {
		this.store.dispatch({ type: "SET_LINKS_CLASS_NAME", data: { linkIds: linkIds, newClassName: newClassName }, pipelineId: this.pipelineId });
	}

	setLinkDecorations(linkId, newDecorations) {
		this.store.dispatch({ type: "SET_LINK_DECORATIONS", data: { linkId: linkId, decorations: this.ensureDecorationsHaveIds(newDecorations) }, pipelineId: this.pipelineId });
	}

	getLinkDecorations(linkId) {
		var link = this.getLink(linkId);
		return (link ? link.decorations : null);
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

	pushUniqueLinks(objectLink, linksToDelete) {
		if (linksToDelete.findIndex((linkToDelete) => linkToDelete.id === objectLink.id) === -1) {
			linksToDelete.push(objectLink);
		}
		return linksToDelete;
	}
}
