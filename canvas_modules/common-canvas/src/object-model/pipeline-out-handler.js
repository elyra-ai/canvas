/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import isEmpty from "lodash/isEmpty";

export default class PipelineOutHandler {

	// Creates a new pipeline flow using the canvasInfo. The top level fields
	// in the canvasInfo are the same as those for the pipelineFlow.
	static createPipelineFlow(canvasInfo) {
		const copyCanvasInfo = JSON.parse(JSON.stringify(canvasInfo));
		const pipelineFlow = Object.assign({}, copyCanvasInfo,
			{
				"pipelines": this.createPipelinesFromCanvasInfo(copyCanvasInfo)
			});

		return pipelineFlow;
	}

	static createPipelinesFromCanvasInfo(canvasInfo) {
		if (canvasInfo) {
			return canvasInfo.pipelines.map((canvasInfoPipeline) => this.createPipeline(canvasInfoPipeline));
		}
		return {};
	}

	static createPipeline(canvasInfoPipeline) {
		const newPipeline = {
			id: canvasInfoPipeline.id,
			name: canvasInfoPipeline.name,
			nodes: this.createNodes(canvasInfoPipeline),
			app_data: this.createPipelineAppData(canvasInfoPipeline),
			runtime_ref: canvasInfoPipeline.runtime_ref
		};

		if (canvasInfoPipeline.parameters) {
			newPipeline.parameters = canvasInfoPipeline.parameters;
		}

		return newPipeline;
	}

	static createNodes(canvasInfoPipeline) {
		return canvasInfoPipeline.nodes.map((canvasInfoNode) =>
			this.createNode(canvasInfoNode, canvasInfoPipeline.links)
		);
	}

	static createNode(ciNode, ciLinks) {
		var newNode = {
			id: ciNode.id,
			type: ciNode.type
		};

		if (ciNode.type === "execution_node" ||
				ciNode.type === "binding") {
			newNode.op = ciNode.operator_id_ref;
		}

		if (ciNode.type === "super_node") {
			newNode.sub_type = ciNode.sub_type;
			newNode.subflow_ref = ciNode.subflow_ref;
		}

		if (ciNode.type === "model_node") {
			newNode.model_ref = ciNode.model_ref;
		}

		newNode.app_data =
			Object.assign({}, ciNode.app_data, { ui_data: this.createNodeUiData(ciNode) });

		if (ciNode.messages && !isEmpty(ciNode.messages)) {
			newNode.app_data.ui_data.messages = ciNode.messages;
		}

		if (ciNode.uiParameters && !isEmpty(ciNode.uiParameters)) {
			newNode.app_data.ui_data.ui_parameters = ciNode.uiParameters;
		}

		if (ciNode.input_ports && ciNode.input_ports.length > 0) {
			newNode.inputs = this.createInputs(ciNode, ciLinks);
		}
		if (ciNode.output_ports && ciNode.output_ports.length > 0) {
			newNode.outputs = this.createOutputs(ciNode);
		}

		if (ciNode.parameters && !isEmpty(ciNode.parameters)) {
			newNode.parameters = ciNode.parameters;
		}

		var newDecorations = this.createDecorations(ciNode.decorations);
		if (newDecorations.length > 0) {
			newNode.app_data.ui_data.decorations = newDecorations;
		}

		const assocationLinks = this.createAssociationLinks(ciNode, ciLinks);
		if (!isEmpty(assocationLinks)) {
			newNode.app_data.ui_data.associations = assocationLinks;
		}

		return newNode;
	}

	static createNodeUiData(ciNode) {
		const uiData = {
			label: ciNode.label,
			image: ciNode.image,
			x_pos: ciNode.x_pos,
			y_pos: ciNode.y_pos
		};
		if (ciNode.class_name) {
			uiData.class_name = ciNode.class_name;
		}

		if (ciNode.description) {
			uiData.description = ciNode.description;
		}

		// Only save the width, height, and isExpanded fields if the node is a
		// supernode that is expanded in-place.
		if (ciNode.type === "super_node") {
			uiData.is_expanded = ciNode.is_expanded;
			uiData.expanded_width = ciNode.expanded_width;
			uiData.expanded_height = ciNode.expanded_height;
		}

		return uiData;
	}

	static createDecorations(decorations) {
		var newDecorations = [];
		if (decorations) {
			decorations.forEach((decoration) => {
				newDecorations.push({
					position: decoration.position,
					class_name: decoration.class_name,
					hotspot: decoration.hotspot,
					id: decoration.id,
					image: decoration.image
				});
			});
		}
		return newDecorations;
	}

	static createInputs(ciNode, canvasLinks) {
		var newInputs = [];
		ciNode.input_ports.forEach((ciInputPort, portIndex) => {
			const newInput = {
				id: ciInputPort.id
			};

			if (ciNode.type === "super_node") {
				if (ciInputPort.subflow_node_ref) {
					newInput.subflow_node_ref = ciInputPort.subflow_node_ref;
				}
			}

			if (ciInputPort.schema_ref) {
				newInput.schema_ref = ciInputPort.schema_ref;
			}

			newInput.app_data =
				Object.assign({}, ciInputPort.app_data, { ui_data: this.createPortUiData(ciInputPort) });

			var newLinks = this.createLinks(canvasLinks, ciNode.id, ciInputPort.id, portIndex);
			if (newLinks.length > 0) {
				newInput.links = newLinks;
			}

			if (ciInputPort.parameters) {
				newInput.parameters = ciInputPort.parameters;
			}

			newInputs.push(newInput);
		});
		return newInputs;
	}

	static createOutputs(ciNode) {
		var newOutputs = [];
		ciNode.output_ports.forEach((ciOutputPort) => {
			var newOutput = {
				id: ciOutputPort.id
			};

			if (ciNode.type === "super_node") {
				if (ciOutputPort.subflow_node_ref) {
					newOutput.subflow_node_ref = ciOutputPort.subflow_node_ref;
				}
			}

			if (ciOutputPort.schema_ref) {
				newOutput.schema_ref = ciOutputPort.schema_ref;
			}

			newOutput.app_data =
				Object.assign({}, ciOutputPort.app_data, { ui_data: this.createPortUiData(ciOutputPort) });

			if (ciOutputPort.parameters) {
				newOutput.parameters = ciOutputPort.parameters;
			}

			newOutputs.push(newOutput);
		});
		return newOutputs;
	}

	static createPortUiData(ciPort) {
		return {
			cardinality: ciPort.cardinality,
			class_name: ciPort.class_name,
			label: ciPort.label
		};
	}

	static createLinks(ciLinks, ciNodeId, ciInputPortId, portIndex) {
		var newLinks = [];
		if (ciLinks) {
			// Returns the canvas links that are applicable for the target node info passed in.
			var filteredCanvasLinks = this.getFilteredCanvasLinks(ciLinks, ciNodeId, ciInputPortId, portIndex);

			filteredCanvasLinks.forEach((link) => {
				newLinks.push(this.createNewNodeLink(link));
			});
		}
		return newLinks;
	}

	// Returns the canvas links that are applicable for the target node info passed in.
	static getFilteredCanvasLinks(ciLinks, ciNodeId, ciInputPortId, portIndex) {
		return ciLinks.filter((canvasLink) => {
			if (canvasLink.type === "nodeLink" &&
					canvasLink.trgNodeId === ciNodeId) {
				if (canvasLink.trgNodePortId) {
					if (canvasLink.trgNodePortId === ciInputPortId) {
						return true;
					}
				} else if (portIndex === 0) { // If port info is unknown, make this link only for the first port
					return true;
				}
			}
			return false;
		});
	}

	static createNewNodeLink(link) {
		var newNodeLink = {
			node_id_ref: link.srcNodeId
		};

		let uiData = {};

		if (link.class_name) {
			uiData = {
				class_name: link.class_name
			};
		}

		const appData = Object.assign({}, link.app_data, { ui_data: uiData });

		if (!isEmpty(appData)) {
			newNodeLink.app_data = appData;
		}

		if (link.srcNodePortId) {
			newNodeLink.port_id_ref = link.srcNodePortId;
		}

		if (link.linkName) {
			newNodeLink.link_name = link.linkName;
		}
		return newNodeLink;
	}

	static createPipelineAppData(canvasInfoPipeline) {
		if (canvasInfoPipeline.app_data) {
			return Object.assign({}, canvasInfoPipeline.app_data, { ui_data: this.createPipelineUiData(canvasInfoPipeline) });
		}
		return { ui_data: this.createPipelineUiData(canvasInfoPipeline) };
	}

	static createPipelineUiData(canvasInfoPipeline) {
		if (canvasInfoPipeline.app_data && canvasInfoPipeline.app_data.ui_data) {
			return Object.assign({}, canvasInfoPipeline.app_data.ui_data, { comments: this.createComments(canvasInfoPipeline.comments, canvasInfoPipeline.links) });
		}
		return { comments: this.createComments(canvasInfoPipeline.comments, canvasInfoPipeline.links) };
	}

	static createComments(canvasInfoComments, canvasInfoLinks) {
		return canvasInfoComments.map((comment) =>
			({
				id: comment.id,
				x_pos: comment.x_pos,
				y_pos: comment.y_pos,
				width: comment.width,
				height: comment.height,
				class_name: comment.class_name,
				content: comment.content,
				associated_id_refs: this.createCommentLinks(canvasInfoLinks, comment.id)
			})
		);
	}

	static createCommentLinks(canvasInfoLinks, commentId) {
		var newLinks = [];
		canvasInfoLinks.forEach((link) => {
			if (link.type === "commentLink" &&
					link.srcNodeId === commentId) {
				newLinks.push({ node_ref: link.trgNodeId, class_name: link.class_name });
			}
		});
		return newLinks;
	}

	static createAssociationLinks(ciNode, ciLinks) {
		const associationsLinks = [];
		ciLinks.forEach((link) => {
			if (link.type === "associationLink" &&
					link.srcNodeId === ciNode.id) {
				associationsLinks.push({
					id: link.id,
					node_ref: link.trgNodeId,
					class_name: link.class_name
				});
			}
		});
		return associationsLinks;
	}
}
