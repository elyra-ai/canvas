/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import uuid4 from "uuid/v4";

export default class PipelineInHandler {

	// Returns the 'canvas info' pipeline, stored internally in the object model,
	// by extracting that info from the pipeline-flow pipeline provided. A
	// 'canvas info' pipeline consists of an ID and three arrays: nodes,
	// comments and links.
	static convertPipelineToCanvasInfoPipeline(pipeline) {
		const nodes = has(pipeline, "nodes") ? pipeline.nodes : [];
		const comments = has(pipeline, "app_data.ui_data.comments") ? pipeline.app_data.ui_data.comments : [];

		var canvas = {
			"sub_id": pipeline.id,
			"nodes": this.convertNodes(nodes),
			"comments": this.convertComments(comments),
			"links": this.convertLinks(nodes, comments),
			"runtime_ref": pipeline.runtime_ref,
			"app_data": pipeline.app_data,
			"parameters": pipeline.parameters
		};

		return canvas;
	}

	static convertNodes(nodes) {
		return nodes.map((node) =>
			({
				"id": node.id,
				"type": node.type,
				"operator_id_ref": node.op,
				"output_ports": this.convertOutputs(node),
				"input_ports": this.convertInputs(node),
				"label": this.convertLabel(node),
				"description": has(node, "app_data.ui_data.description") ? node.app_data.ui_data.description : "",
				"image": has(node, "app_data.ui_data.image") ? node.app_data.ui_data.image : "",
				"x_pos": has(node, "app_data.ui_data.x_pos") ? node.app_data.ui_data.x_pos : 10,
				"y_pos": has(node, "app_data.ui_data.y_pos") ? node.app_data.ui_data.y_pos : 10,
				"class_name": has(node, "app_data.ui_data.class_name") ? node.app_data.ui_data.class_name : "",
				"decorations": has(node, "app_data.ui_data.decorations") ? this.convertDecorations(node.app_data.ui_data.decorations) : [],
				"parameters": has(node, "parameters") ? node.parameters : [],
				"messages": has(node, "app_data.ui_data.messages") ? node.app_data.ui_data.messages : [],
				"app_data": has(node, "app_data") ? this.removeUiDataFromAppData(node.app_data) : [],
				"subflow_ref": has(node, "subflow_ref") ? node.subflow_ref : {},
				"model_ref": has(node, "model_ref") ? node.model_ref : ""
			})
		);
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
				var newDecoration = {
					position: decoration.position,
					class_name: decoration.class_name,
					hotspot: decoration.hotspot,
					id: decoration.id,
					image: decoration.image
				};
				newDecorations.push(newDecoration);
			});
		}
		return newDecorations;
	}

	static convertComments(comments) {
		return comments.map((comment) =>
			({
				"id": comment.id,
				"content": comment.content,
				"height": comment.height,
				"width": comment.width,
				"x_pos": comment.x_pos,
				"y_pos": comment.y_pos,
				"class_name":
					has(comment, "class_name")
						? comment.class_name : "d3-comment-rect",
			})
		);
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
								if (link.app_data) {
									newLink.app_data = this.removeUiDataFromAppData(link.app_data);
								}
								if (link.port_id_ref) { // according to the spec, port_id_ref is optional for links
									newLink.srcNodePortId = link.port_id_ref;
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
