/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import uuid4 from "uuid/v4";
import { BINDING, EXECUTION_NODE, SUPER_NODE, MODEL_NODE } from "../common-canvas/constants/canvas-constants.js";

export default class PipelineInHandler {

	// Returns the 'canvas info' pipeline, stored internally in the object model,
	// by extracting that info from the pipeline-flow pipeline provided. A
	// 'canvas info' pipeline consists of an ID and three arrays: nodes,
	// comments and links.
	static convertPipelineToCanvasInfoPipeline(pipeline, layoutInfo) {
		const nodes = has(pipeline, "nodes") ? pipeline.nodes : [];
		const comments = has(pipeline, "app_data.ui_data.comments") ? pipeline.app_data.ui_data.comments : [];

		var canvas = {
			"id": pipeline.id,
			"name": pipeline.name,
			"nodes": this.convertNodes(nodes, layoutInfo),
			"comments": this.convertComments(comments),
			"links": this.convertLinks(nodes, comments),
			"runtime_ref": pipeline.runtime_ref,
			"app_data": pipeline.app_data,
			"parameters": pipeline.parameters
		};

		if (has(pipeline, "app_data.ui_data.zoom")) {
			canvas.zoom = pipeline.app_data.ui_data.zoom;
		}

		// Remove comments from app_data.ui_data as it's now stored in canvas obj.
		if (has(canvas, "app_data.ui_data.comments")) {
			delete canvas.app_data.ui_data.comments;
		}
		return canvas;
	}

	static convertNodes(nodes, layoutInfo) {
		return nodes.map((node) => {
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
				"app_data": has(node, "app_data") ? this.removeUiDataFromAppData(node.app_data) : [],

			};
			if (node.type === EXECUTION_NODE || node.type === BINDING) {
				obj.op = node.op;
			}
			if (node.type === SUPER_NODE) {
				// Separate initialization needed to ensure field is only created when present.
				if (has(node, "open_with_tool")) {
					obj.open_with_tool = node.open_with_tool;
				}
				obj.subflow_ref = has(node, "subflow_ref") ? node.subflow_ref : {};
				obj.is_expanded = has(node, "app_data.ui_data.is_expanded") ? node.app_data.ui_data.is_expanded : false;
				obj.expanded_width = has(node, "app_data.ui_data.expanded_width") ? node.app_data.ui_data.expanded_width : layoutInfo.supernodeDefaultWidth;
				obj.expanded_height = has(node, "app_data.ui_data.expanded_height") ? node.app_data.ui_data.expanded_height : layoutInfo.supernodeDefaultHeight;
			}
			if (node.type === MODEL_NODE) {
				obj.model_ref = has(node, "model_ref") ? node.model_ref : "";
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
			if (has(node, "isSupernodeInputBinding")) {
				obj.isSupernodeInputBinding = true;
			}
			if (has(node, "isSupernodeOutputBinding")) {
				obj.isSupernodeOutputBinding = true;
			}
			return obj;
		});
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
		const outputs = node.outputs || [];
		return outputs.map((output) => this.convertPortObject(output));
	}

	static convertInputs(node) {
		const inputs = node.inputs || [];
		return inputs.map((input) => this.convertPortObject(input));
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
				"y_pos": comment.y_pos,
				"class_name":
					has(comment, "class_name")
						? comment.class_name : "d3-comment-rect"
			};

			if (has(comment, "style")) {
				newComment.style = comment.style;
			}
			return newComment;
		});
	}

	static convertLinks(nodes, comments) {
		const links = [];

		nodes.forEach((node) => {
			if (node.inputs) {
				node.inputs.forEach((input) => {
					if (input.links) {
						input.links.forEach((link) => {
							if (this.isNode(nodes, link.node_id_ref)) {
								const newLink = {
									"id":
										has(link, "app_data.ui_data.id")
											? link.app_data.ui_data.id : this.getUUID(),
									"class_name":
										has(link, "app_data.ui_data.class_name")
											? link.app_data.ui_data.class_name : "d3-data-link",
									"srcNodeId": link.node_id_ref,
									"trgNodeId": node.id,
									"trgNodePortId": input.id,
									"type": "nodeLink"
								};
								if (has(link, "app_data.ui_data.style")) {
									newLink.style = link.app_data.ui_data.style;
								}
								if (link.app_data) {
									newLink.app_data = this.removeUiDataFromAppData(link.app_data);
								}
								if (link.port_id_ref) { // according to the spec, port_id_ref is optional for links
									newLink.srcNodePortId = link.port_id_ref;
								}
								if (link.link_name) { // link_name is also optional
									newLink.linkName = link.link_name;
								}
								links.push(newLink);
							}
						});
					}
				});
			}

			// association links are defined in UI data
			if (has(node, "app_data.ui_data.associations") && !isEmpty(node.app_data.ui_data.associations)) {
				node.app_data.ui_data.associations.forEach((association) => {
					if (this.isNode(nodes, association.node_ref)) {
						const newLink = {
							"id": association.id ? association.id : this.getUUID(),
							"class_name": association.class_name ? association.class_name : "d3-object-link",
							"srcNodeId": node.id,
							"trgNodeId": association.node_ref,
							"type": "associationLink"
						};

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
							"class_name":
								has(assocRef, "class_name")
									? assocRef.class_name : "d3-comment-link",
							"srcNodeId": comment.id,
							"trgNodeId": assocRef.node_ref,
							"type": "commentLink"
						};
						if (assocRef.style) {
							newLink.style = assocRef.style;
						}

						links.push(newLink);
					}
				});
			}
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

	// Removes ui_data field from appData passed in and returns the resulting
	// object or returns undefined if no appData is provided.
	static removeUiDataFromAppData(appData) {
		let newAppData;
		if (appData) {
			newAppData = JSON.parse(JSON.stringify(appData));
			delete newAppData.ui_data;
		}
		return newAppData;
	}
}
