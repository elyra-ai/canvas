/*
 * Copyright 2017-2025 Elyra Authors
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

import { cloneDeep, isEmpty, isObject, has } from "lodash";
import { v4 as uuid4 } from "uuid";
import { BINDING, EXECUTION_NODE, SUPER_NODE, MODEL_NODE } from "../common-canvas/constants/canvas-constants.js";

export default class PipelineInHandler {

	// Returns the 'canvas info' pipeline, stored internally in the object model,
	// by extracting that info from the pipeline-flow provided.
	static convertPipelineFlowToCanvasInfo(pipelineFlow, canvasLayout) {
		const canvasInfoPipelines = this.convertPipelinesToCanvasInfoPipelines(pipelineFlow.pipelines, canvasLayout);
		const newPipelineFlow = Object.assign({}, pipelineFlow, { pipelines: canvasInfoPipelines });
		return newPipelineFlow;
	}

	// Returns an array of pipelines that conform to the internal 'canvas info'
	// format based on the array of pipelines passed in that are expected to
	// conform to the pipeline-flow format'.
	static convertPipelinesToCanvasInfoPipelines(pipelines, canvasLayout) {
		let canvasInfoPipelines = [];
		if (pipelines) {
			canvasInfoPipelines = pipelines.map((pFlowPipline) =>
				this.convertPipelineToCanvasInfoPipeline(pFlowPipline, canvasLayout)
			);
		}
		return canvasInfoPipelines;
	}

	// Returns the 'canvas info' pipeline, stored internally in the object model,
	// by extracting that info from the pipeline-flow pipeline provided. A
	// 'canvas info' pipeline consists of an ID and three arrays: nodes,
	// comments and links.
	static convertPipelineToCanvasInfoPipeline(pipeline, canvasLayout) {
		const nodes = has(pipeline, "nodes") ? pipeline.nodes : [];
		const comments = has(pipeline, "app_data.ui_data.comments") ? pipeline.app_data.ui_data.comments : [];
		const detachedLinks = has(pipeline, "app_data.ui_data.detached_links") ? pipeline.app_data.ui_data.detached_links : [];

		var canvas = {
			"id": pipeline.id,
			"name": pipeline.name,
			"nodes": this.convertNodes(nodes, canvasLayout),
			"comments": this.convertComments(comments),
			"links": this.convertLinks(nodes, comments, detachedLinks),
			"runtime_ref": pipeline.runtime_ref,
			"app_data": pipeline.app_data,
			"parameters": pipeline.parameters
		};

		if (has(pipeline, "app_data.ui_data.zoom")) {
			if (typeof pipeline.app_data.ui_data.zoom === "number") {
				canvas.zoom = { x: 0, y: 0, k: pipeline.app_data.ui_data.zoom / 100 };
			} else {
				canvas.zoom = pipeline.app_data.ui_data.zoom;
			}
		}

		// Remove comments from app_data.ui_data as it's now stored in canvas obj.
		if (has(canvas, "app_data.ui_data.comments")) {
			delete canvas.app_data.ui_data.comments;
		}

		// Remove detached_links from app_data.ui_data as it's now stored in canvas obj.
		if (has(canvas, "app_data.ui_data.detached_links")) {
			delete canvas.app_data.ui_data.detached_links;
		}
		return canvas;
	}

	static convertNodes(nodes, canvasLayout) {
		return nodes.map((node) => this.convertNode(node, canvasLayout));
	}

	static convertNode(node, canvasLayout) {
		const obj = {
			"id": node.id,
			"type": node.type,
			"outputs": this.convertOutputs(node),
			"inputs": this.convertInputs(node),
			"label": this.convertLabel(node),
			"x_pos": has(node, "app_data.ui_data.x_pos") ? node.app_data.ui_data.x_pos : 10,
			"y_pos": has(node, "app_data.ui_data.y_pos") ? node.app_data.ui_data.y_pos : 10,
			"decorations": has(node, "app_data.ui_data.decorations") ? this.convertDecorations(node.app_data.ui_data.decorations) : [],
			"parameters": has(node, "parameters") ? node.parameters : [],
			"messages": has(node, "app_data.ui_data.messages") ? node.app_data.ui_data.messages : [],
			"ui_parameters": has(node, "app_data.ui_data.ui_parameters") ? node.app_data.ui_data.ui_parameters : [],
			"app_data": has(node, "app_data") ? this.removeUiDataFromAppData(node.app_data) : []
		};

		if (node.type === EXECUTION_NODE ||
				node.type === BINDING ||
				node.type === MODEL_NODE) {
			obj.op = node.op;
		}
		if (node.type === SUPER_NODE) {
			// Separate initialization needed to ensure field is only created when present.
			if (has(node, "open_with_tool")) {
				obj.open_with_tool = node.open_with_tool;
			}
			obj.subflow_ref = has(node, "subflow_ref") ? this.convertSubFlowRef(node.subflow_ref) : {};
			obj.is_expanded = has(node, "app_data.ui_data.is_expanded") ? node.app_data.ui_data.is_expanded : false;
			obj.expanded_width = has(node, "app_data.ui_data.expanded_width") ? node.app_data.ui_data.expanded_width : canvasLayout.supernodeDefaultWidth;
			obj.expanded_height = has(node, "app_data.ui_data.expanded_height") ? node.app_data.ui_data.expanded_height : canvasLayout.supernodeDefaultHeight;
		}
		if (node.type === MODEL_NODE) {
			obj.model_ref = has(node, "model_ref") ? node.model_ref : "";
		}
		if (has(node, "app_data.ui_data.is_resized")) {
			obj.isResized = node.app_data.ui_data.is_resized;
			obj.resizeHeight = node.app_data.ui_data.resize_height;
			obj.resizeWidth = node.app_data.ui_data.resize_width;
		}
		if (has(node, "app_data.ui_data.description")) {
			obj.description = node.app_data.ui_data.description;
		}
		if (has(node, "app_data.ui_data.image")) {
			obj.image = node.app_data.ui_data.image;
		}
		if (has(node, "app_data.ui_data.class_name")) {
			obj.class_name = node.app_data.ui_data.class_name;
		}
		if (has(node, "app_data.ui_data.style")) {
			obj.style = node.app_data.ui_data.style;
		}
		if (has(node, "app_data.ui_data.sub_pipelines")) {
			obj.sub_pipelines = node.app_data.ui_data.sub_pipelines;
		}
		if (has(node, "isSupernodeInputBinding")) {
			obj.isSupernodeInputBinding = true;
		}
		if (has(node, "isSupernodeOutputBinding")) {
			obj.isSupernodeOutputBinding = true;
		}
		if (has(node, "connection")) {
			obj.connection = node.connection;
		}
		if (has(node, "data_asset")) {
			obj.data_asset = node.data_asset;
		}
		return obj;
	}

	static convertSubFlowRef(subFlowRef) {
		const sfr = {
			pipeline_id_ref: subFlowRef.pipeline_id_ref
		};
		if (subFlowRef.url) {
			sfr.url = subFlowRef.url;
		}
		return sfr;
	}

	static convertLabel(obj) {
		// node label in pipeline-flow-ui schema is not a resource_def anymore, but just a string
		const label = has(obj, "app_data.ui_data.label") ? obj.app_data.ui_data.label : "";
		if (isObject(label) && label.default) {
			return label.default;
		}
		return label;
	}

	static convertOutputs(node) {
		if (node.outputs) {
			return node.outputs.map((output) => this.convertPortObject(output));
		}
		return node.outputs; // Return undefined if no outputs property
	}

	static convertInputs(node) {
		if (node.inputs) {
			return node.inputs.map((input) => this.convertPortObject(input));
		}
		return node.inputs; // Return undefined if no inputs property
	}

	static convertPortObject(port) {
		const portObj = {
			"id": port.id,
			"label": this.convertLabel(port)
		};

		if (has(port, "subflow_node_ref")) {
			portObj.subflow_node_ref = port.subflow_node_ref;
		}
		if (has(port, "schema_ref")) {
			portObj.schema_ref = port.schema_ref;
		}
		if (has(port, "app_data.ui_data.cardinality")) {
			portObj.cardinality = {
				"min": port.app_data.ui_data.cardinality.min,
				"max": port.app_data.ui_data.cardinality.max
			};
		}
		if (has(port, "app_data.ui_data.class_name")) {
			portObj.class_name = port.app_data.ui_data.class_name;
		}
		if (has(port, "parameters")) {
			portObj.parameters = port.parameters;
		}
		if (port.app_data) {
			portObj.app_data = this.removeUiDataFromAppData(port.app_data);
		}

		return portObj;
	}

	static convertDecorations(decorations) {
		var newDecorations = [];
		if (decorations) {
			decorations.forEach((decoration) => {
				var newDecoration = Object.assign({}, decoration, { id: decoration.id || this.getUUID() });
				newDecorations.push(newDecoration);
			});
		}
		return newDecorations;
	}

	static convertComments(comments) {
		return comments.map((comment) => {
			const newComment = {
				"id": comment.id,
				"content": comment.content,
				"height": comment.height,
				"width": comment.width,
				"x_pos": comment.x_pos,
				"y_pos": comment.y_pos
			};

			if (has(comment, "class_name")) {
				newComment.class_name = comment.class_name;
			}

			if (has(comment, "contentType")) {
				newComment.contentType = comment.contentType;
			}

			if (has(comment, "formats")) {
				newComment.formats = comment.formats;
			}

			if (has(comment, "style")) {
				newComment.style = comment.style;
			}

			return newComment;
		});
	}

	static convertLinks(nodes, comments, detachedLinks) {
		const links = [];

		nodes.forEach((node) => {
			if (node.inputs) {
				node.inputs.forEach((input) => {
					if (input.links) {
						input.links.forEach((link) => {
							if (this.isNode(nodes, link.node_id_ref)) {
								const newLink =
									this.createDataLink(link, link.node_id_ref, link.port_id_ref, node.id, input.id);
								links.push(newLink);
							}
						});
					}
				});
			}

			// Association links are defined in UI data
			if (has(node, "app_data.ui_data.associations") && !isEmpty(node.app_data.ui_data.associations)) {
				node.app_data.ui_data.associations.forEach((association) => {
					if (this.isNode(nodes, association.node_ref)) {
						const newLink = {
							"id": association.id ? association.id : this.getUUID(),
							"srcNodeId": node.id,
							"trgNodeId": association.node_ref,
							"type": "associationLink",
							"decorations": association.decorations
						};

						if (has(association, "class_name")) {
							newLink.class_name = association.class_name;
						}

						links.push(newLink);
					}
				});
			}
		});

		comments.forEach((comment) => {
			if (comment.associated_id_refs) {
				comment.associated_id_refs.forEach((assocRef) => {
					if (this.isNode(nodes, assocRef.node_ref)) {
						const newLink = {
							"id": assocRef.id ? assocRef.id : this.getUUID(),
							"srcNodeId": comment.id,
							"trgNodeId": assocRef.node_ref,
							"type": "commentLink"
						};

						if (has(assocRef, "class_name")) {
							newLink.class_name = assocRef.class_name;
						}

						if (assocRef.style) {
							newLink.style = assocRef.style;
						}

						links.push(newLink);
					}
				});
			}
		});

		// Detached links are defined in the UI data
		detachedLinks.forEach((detLink) => {
			const newDetLink = this.createDataLink(detLink,
				detLink.src_node_id, detLink.src_node_port_id,
				detLink.trg_node_id, detLink.trg_node_port_id);

			if (detLink.src_pos) {
				newDetLink.srcPos = detLink.src_pos;
			}
			if (detLink.trg_pos) {
				newDetLink.trgPos = detLink.trg_pos;
			}
			links.push(newDetLink);
		});

		return links;
	}

	static isNode(nodes, id) {
		const index = nodes.findIndex((node) => node.id === id);
		if (index === -1) {
			return false;
		}
		return true;
	}

	static getUUID() {
		return uuid4();
	}

	// Creates a new internal link from the pipelineFlow link and node and port
	// info passed in. This is used for create a regular data link and also a
	// detached data link. For a detached data link the node and port info passed
	// in is undefined.
	static createDataLink(link, srcNodeId, srcNodePortId, trgNodeId, trgNodePortId) {
		const newLink = {
			"id": has(link, "id") ? link.id : this.getUUID(),
			"srcNodeId": srcNodeId,
			"trgNodeId": trgNodeId,
			"trgNodePortId": trgNodePortId,
			"type": "nodeLink"
		};
		if (has(link, "app_data.ui_data.class_name")) {
			newLink.class_name = link.app_data.ui_data.class_name;
		}
		if (has(link, "app_data.ui_data.style")) {
			newLink.style = link.app_data.ui_data.style;
		}
		if (has(link, "app_data.ui_data.decorations")) {
			newLink.decorations = link.app_data.ui_data.decorations;
		}
		if (link.app_data) {
			newLink.app_data = this.removeUiDataFromAppData(link.app_data);
		}
		if (srcNodePortId) { // according to the spec, port_id_ref is optional for links
			newLink.srcNodePortId = srcNodePortId;
		}
		if (link.link_name) { // link_name is also optional
			newLink.linkName = link.link_name;
		}
		if (link.type_attr) { // type_attr is also optional
			newLink.typeAttr = link.type_attr;
		}
		if (link.description) { // description is also optional
			newLink.description = link.description;
		}

		return newLink;
	}

	// Removes ui_data field from appData passed in and returns the resulting
	// object or returns undefined if no appData is provided.
	static removeUiDataFromAppData(appData) {
		let newAppData;
		if (appData) {
			newAppData = cloneDeep(appData);
			delete newAppData.ui_data;
		}
		return newAppData;
	}
}
