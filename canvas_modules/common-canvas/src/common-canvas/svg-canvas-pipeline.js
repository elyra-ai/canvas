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
import { COMMENT_LINK, NODE_LINK } from "./constants/canvas-constants";
import SvgCanvasAccessibility from "./svg-canvas-utils-accessibility.js";


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

		// Create an object to help us with handling accessibility, in
		// particular, handling keyboard navigation within the flow. Make
		// sure to do this after the mappedXXX arrays have been created.
		this.accessibility = null;

		this.logger.logEndTimer("initialize");
	}

	// Returns the accessibility object. This saves the accessibility object
	// from being generated until one of the keyboard navigation calls (below)
	// are made. Those calls will only be made when the config field
	// enableKeyboardNavigaiton is true.
	getAccessibility() {
		if (this.accessibility) {
			return this.accessibility;
		}
		this.accessibility = new SvgCanvasAccessibility(this);
		return this.accessibility;
	}

	getAllLinksForNode(node) {
		return this.getAccessibility().getAllLinksForNode(node);
	}

	getNextLinksFromNode(node) {
		return this.getAccessibility().getNextLinksFromNode(node);
	}

	getPreviousLinksToNode(node) {
		return this.getAccessibility().getPreviousLinksToNode(node);
	}

	getPreviousNodeFromDataLink(link) {
		return this.getAccessibility().getPreviousNodeFromDataLink(link);
	}

	getPreviousNodeFromAssocLink(link) {
		return this.getAccessibility().getPreviousNodeFromAssocLink(link);
	}

	getPreviousObjectFromCommentLink(link) {
		return this.getAccessibility().getPreviousObjectFromCommentLink(link);
	}

	getNextLinksFromComment(comment) {
		return this.getAccessibility().getNextLinksFromComment(comment);
	}

	getNextNodeFromDataLink(link) {
		return this.getAccessibility().getNextNodeFromDataLink(link);
	}

	getNextNodeFromAssocLink(link) {
		return this.getAccessibility().getNextNodeFromAssocLink(link);
	}

	getNextObjectFromCommentLink(link) {
		return this.getAccessibility().getNextObjectFromCommentLink(link);
	}

	getNextSiblingLink(link) {
		return this.getAccessibility().getNextSiblingLink(link);
	}

	getPreviousSiblingLink(link) {
		return this.getAccessibility().getPreviousSiblingLink(link);
	}

	getNextTabGroupStartObject() {
		return this.getAccessibility().getNextTabGroupStartObject();
	}

	getPreviousTabGroupStartObject() {
		return this.getAccessibility().getPreviousTabGroupStartObject();
	}

	resetTabbedStatus() {
		this.getAccessibility().resetTabbedStatus();
	}

	setTabGroupIndexForObj(d) {
		this.getAccessibility().setTabGroupIndexForObj(d);
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
	// are returned otherwise all nodes are returned.
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
						isEmpty(this.pipeline.comments) && isEmpty(this.pipeline.links);
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
