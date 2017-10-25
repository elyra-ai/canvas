/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-invalid-this: "off" */
/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

import _ from "lodash";

export default class SVGPipelineInHandler {

	// Returns the 'canvas info', stored internally in the object model, by extracting
	// that info from the pipeline provided. 'Canvas info' consists of three
	// arrays: nodes, comments and links.
	static convertPipelineToCanvasInfo(pipeline) {
		const nodes = _.has(pipeline, "nodes") ? pipeline.nodes : [];
		const comments = _.has(pipeline, "app_data.ui_data.comments") ? pipeline.app_data.ui_data.comments : [];

		var canvas = {
			"sub_id": pipeline.id,
			"nodes": this.convertNodes(nodes),
			"comments": this.convertComments(comments),
			"links": this.convertLinks(nodes, comments),
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
				"label": node.app_data.ui_data.label.default, // TODO Add code to check existence of these fields
				"image": node.app_data.ui_data.image,
				"x_pos": node.app_data.ui_data.x_pos,
				"y_pos": node.app_data.ui_data.y_pos,
				"class_name": node.app_data.ui_data.class_name,
				"decorations": this.convertDecorations(node.app_data.ui_data.decorations),
				"parameters": node.parameters
			})
		);
	}

	static convertOutputs(node) {
		let outputs;
		if (node.output) {
			outputs = [node.output];
		} else if (node.outputs) {
			outputs = node.outputs;
		} else {
			outputs = [];
		}
		return outputs.map((output) => this.getPortObject(output));
	}

	static convertInputs(node) {
		let inputs;
		if (node.input) {
			inputs = [node.input];
		} else if (node.inputs) {
			inputs = node.inputs;
		} else {
			inputs = [];
		}
		return inputs.map((input) => this.getPortObject(input));
	}

	static getPortObject(port) {
		const portObj = {
			"id": port.id,
			"label": _.has(port, "app_data.ui_data.label.default")
				? port.app_data.ui_data.label.default : ""
		};
		if (_.has(port, "app_data.ui_data.cardinality")) {
			portObj.cardinality = {
				"min": port.app_data.ui_data.cardinality.min,
				"max": port.app_data.ui_data.cardinality.max
			};
		}
		if (_.has(port, "app_data.ui_data.class_name")) {
			portObj.class_name = port.app_data.ui_data.class_name;
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
					_.has(comment, "class_name")
						? comment.class_name : "canvas-comment",
			})
		);
	}

	static convertLinks(nodes, comments) {
		const links = [];
		let id = 1;

		nodes.forEach((node) => {
			// Regular nodes have a inputs (plural) field containing links (plural)
			if (node.inputs) {
				node.inputs.forEach((input) => {
					if (input.links) {
						input.links.forEach((link) => {
							if (this.isNode(nodes, link.node_id_ref)) {
								const newLink = {
									"id": "canvas_link_" + id++,
									"class_name":
										_.has(link, "app_data.ui_data.class_name")
											? link.app_data.ui_data.class_name : "canvas-data-link",
									"srcNodeId": link.node_id_ref,
									"trgNodeId": node.id,
									"trgNodePortId": input.id,
									"type": "nodeLink"
								};
								if (link.port_id_ref) {
									newLink.srcNodePortId = link.port_id_ref;
								}
								links.push(newLink);
							}
						});
					}
				});
			}
			// Binding nodes have a input (singular) field containing a link (singular)
			if (node.input) {
				if (node.input.link) {
					if (this.isNode(nodes, node.input.link.node_id_ref)) {
						const newLink = {
							"id": "canvas_link_" + id++,
							"class_name":
								_.has(node, "input.link.app_data.ui_data.class_name")
									? node.input.link.app_data.ui_data.class_name : "canvas-data-link",
							"srcNodeId": node.input.link.node_id_ref,
							"trgNodeId": node.id,
							"trgNodePortId": node.input.id,
							"type": "nodeLink"
						};
						if (node.input.link.port_id_ref) {
							newLink.srcNodePortId = node.input.link.port_id_ref;
						}
						links.push(newLink);
					}
				}
			}
		});

		comments.forEach((comment) => {
			if (comment.associated_id_refs) {
				comment.associated_id_refs.forEach((assocRef) => {
					if (this.isNode(nodes, assocRef.node_ref)) {
						const newLink = {
							"id": "canvas_link_" + id++,
							"class_name":
								_.has(assocRef, "class_name")
									? assocRef.class_name : "canvas-comment-link",
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
}
