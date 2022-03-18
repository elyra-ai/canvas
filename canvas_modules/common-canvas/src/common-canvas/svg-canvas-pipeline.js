/*
 * Copyright 2022 Elyra Authors
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
import { COMMENT_LINK } from "./constants/canvas-constants";


export default class SVGCanvasPipeline {
	constructor(pipelineId, canvasInfo) {
		this.logger = new Logger("SVGCanvasActivePipeline");
		this.canvasInfo = canvasInfo;
		this.pipeline = SVGCanvasPipeline.getPipeline(pipelineId, canvasInfo);

		// Accessed directly by svg-canvas-renderer
		this.id = this.pipeline.id;
		this.zoom = this.pipeline.zoom;
		this.nodes = this.pipeline.nodes;
		this.comments = this.pipeline.comments;
		this.links = this.pipeline.links;

		this.logger.logStartTimer("Mapping data");
		this.mappedNodes = SVGCanvasPipeline.getMappedNodes(this.pipeline);
		this.mappedComments = SVGCanvasPipeline.getMappedComments(this.pipeline);
		this.mappedLinks = SVGCanvasPipeline.getMappedLinks(this.pipeline);
		this.logger.logStartTimer("Mapping data");
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

	getNodes(nodeIds) {
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

	// Replaces the link in the links array with the one passed in.
	replaceLink(oldLink) {
		const index = this.pipeline.links.findIndex((l) => l.id === oldLink.id);
		this.pipeline.links.splice(index, 1, oldLink);
	}

	/* ----------------------------------------------------------- */
	/* Static methods below help to initialize the active pipeline */
	/* ----------------------------------------------------------- */

	static getPipeline(pipelineId, canvasInfo) {
		const pipeline = canvasInfo.pipelines.find((p) => p.id === pipelineId);
		if (pipeline) {
			return this.preProcessPipeline(pipeline);
		}
		return { id: pipelineId, nodes: [], comments: [], links: [] };
	}

	// Preprocesses the pipeline to set the connected attribute of the ports
	// for each node. This is used when rendering the connection satus of ports.
	static preProcessPipeline(pipeline) {
		this.setAllPortsDisconnected(pipeline);

		pipeline.links.forEach((link) => {
			if (link.type === COMMENT_LINK) {
				link.srcObj = this.getComment(link.srcNodeId, pipeline);
				link.trgNode = this.getNode(link.trgNodeId, pipeline);

			} else {
				link.srcObj = this.getNode(link.srcNodeId, pipeline);
				link.trgNode = this.getNode(link.trgNodeId, pipeline);

				if (link.srcObj) {
					this.setOutputPortConnected(link.srcObj, link.srcNodePortId);
				}
				if (link.trgNode) {
					this.setInputPortConnected(link.trgNode, link.trgNodePortId);
				}
			}
		});
		return pipeline;
	}

	// Sets the isConnected property of all ports in the pipeline to false.
	static setAllPortsDisconnected(pipeline) {
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
	static setInputPortConnected(trgNode, inPortId) {
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
	static setOutputPortConnected(srcNode, outPortId) {
		const portId = outPortId || CanvasUtils.getDefaultOutputPortId(srcNode);
		if (srcNode.outputs) {
			srcNode.outputs.forEach((out) => {
				if (out.id === portId) {
					out.isConnected = true;
				}
			});
		}
	}

	static getMappedNodes(pipeline) {
		const mappedNodes = {};
		pipeline.nodes.forEach((n) => { mappedNodes[n.id] = n; });
		return mappedNodes;
	}

	static getMappedComments(pipeline) {
		const mappedComments = {};
		pipeline.comments.forEach((c) => { mappedComments[c.id] = c; });
		return mappedComments;
	}

	static getMappedLinks(pipeline) {
		const mappedLinks = {};
		pipeline.links.forEach((l) => { mappedLinks[l.id] = l; });
		return mappedLinks;
	}

	// Returns the node, from the pipeline passed in, identfied by the node ID.
	static getNode(nodeId, pipeline) {
		return pipeline.nodes.find((nd) => nd.id === nodeId);
	}

	// Returns the comment, from the pipeline passed in, identfied by the comment ID.
	static getComment(commentId, pipeline) {
		return pipeline.comments.find((com) => com.id === commentId);
	}
}
