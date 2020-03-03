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

import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
import { BINDING, EXECUTION_NODE,
	SUPER_NODE, MODEL_NODE } from "../common-canvas/constants/canvas-constants.js";


export default class PipelineOutHandler {

	// Creates a new pipeline flow using the canvasInfo. The top level fields
	// in the canvasInfo are the same as those for the pipelineFlow.
	static createPipelineFlow(canvasInfo) {
		const copyCanvasInfo = JSON.parse(JSON.stringify(canvasInfo));
		delete copyCanvasInfo.subdueStyle;
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
			id: canvasInfoPipeline.id
		};
		if (canvasInfoPipeline.name) {
			newPipeline.name = canvasInfoPipeline.name;
		}
		newPipeline.nodes = this.createNodes(canvasInfoPipeline);
		newPipeline.app_data = this.createPipelineAppData(canvasInfoPipeline);
		newPipeline.runtime_ref = canvasInfoPipeline.runtime_ref;

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

		if (ciNode.type === EXECUTION_NODE ||
				ciNode.type === BINDING) {
			if (ciNode.op || ciNode.op === "") {
				newNode.op = ciNode.op; // Write out op even if it is "" to allow our tests to work.
			}
		}

		if (ciNode.type === SUPER_NODE) {
			if (ciNode.open_with_tool) {
				newNode.open_with_tool = ciNode.open_with_tool;
			}
			newNode.subflow_ref = ciNode.subflow_ref;
		}

		if (ciNode.type === MODEL_NODE) {
			newNode.model_ref = ciNode.model_ref;
		}

		newNode.app_data =
			Object.assign({}, ciNode.app_data, { ui_data: this.createNodeUiData(ciNode) });

		if (ciNode.inputs && ciNode.inputs.length > 0) {
			newNode.inputs = this.createInputs(ciNode, ciLinks);
		}
		if (ciNode.outputs && ciNode.outputs.length > 0) {
			newNode.outputs = this.createOutputs(ciNode);
		}

		if (ciNode.parameters && !isEmpty(ciNode.parameters)) {
			newNode.parameters = ciNode.parameters;
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

		if (ciNode.style) {
			uiData.style = ciNode.style;
		}

		if (ciNode.description) {
			uiData.description = ciNode.description;
		}

		if (ciNode.type === SUPER_NODE) {
			uiData.is_expanded = ciNode.is_expanded;
			uiData.expanded_width = ciNode.expanded_width;
			uiData.expanded_height = ciNode.expanded_height;
		}

		if (ciNode.messages && !isEmpty(ciNode.messages)) {
			uiData.messages = ciNode.messages;
		}

		if (ciNode.ui_parameters && !isEmpty(ciNode.ui_parameters)) {
			uiData.ui_parameters = ciNode.ui_parameters;
		}

		if (ciNode.decorations) {
			var newDecorations = this.createDecorations(ciNode.decorations);
			if (newDecorations.length > 0) {
				uiData.decorations = newDecorations;
			}
		}


		return uiData;
	}

	static createDecorations(decorations) {
		var newDecorations = [];
		if (decorations) {
			decorations.forEach((decoration) => {
				const dec = Object.assign({}, decoration); // This will only copy over set values and ignore undefineds
				newDecorations.push(dec);
			});
		}
		return newDecorations;
	}

	static createInputs(ciNode, canvasLinks) {
		var newInputs = [];
		ciNode.inputs.forEach((ciInputPort, portIndex) => {
			const newInput = {
				id: ciInputPort.id
			};

			if (ciNode.type === SUPER_NODE) {
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
		ciNode.outputs.forEach((ciOutputPort) => {
			var newOutput = {
				id: ciOutputPort.id
			};

			if (ciNode.type === SUPER_NODE) {
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
		const port = {};
		if (ciPort.cardinality) {
			port.cardinality = ciPort.cardinality;
		}
		if (ciPort.class_name) {
			port.class_name = ciPort.class_name;
		}
		port.label = ciPort.label;
		return port;
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

		if (link.app_data) {
			set(newNodeLink, "app_data", link.app_data);
		}

		if (link.class_name) {
			set(newNodeLink, "app_data.ui_data.class_name", link.class_name);
		}

		if (link.style) {
			set(newNodeLink, "app_data.ui_data.style", link.style);
		}

		if (link.decorations) {
			var newDecorations = this.createDecorations(link.decorations);
			if (newDecorations.length > 0) {
				set(newNodeLink, "app_data.ui_data.decorations", newDecorations);
			}
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
		let uiData = null;
		if (canvasInfoPipeline.app_data && canvasInfoPipeline.app_data.ui_data) {
			uiData = Object.assign({}, canvasInfoPipeline.app_data.ui_data, {
				comments: this.createComments(canvasInfoPipeline.comments, canvasInfoPipeline.links) });
		} else {
			uiData = { comments: this.createComments(canvasInfoPipeline.comments, canvasInfoPipeline.links) };
		}

		if (canvasInfoPipeline.zoom) {
			uiData.zoom = canvasInfoPipeline.zoom;
		}
		return uiData;
	}

	static createComments(canvasInfoComments, canvasInfoLinks) {
		return canvasInfoComments.map((comment) => {
			const newCom = {
				id: comment.id,
				x_pos: comment.x_pos,
				y_pos: comment.y_pos,
				width: comment.width,
				height: comment.height,
				class_name: comment.class_name,
				content: comment.content,
				associated_id_refs: this.createCommentLinks(canvasInfoLinks, comment.id)
			};
			if (comment.style) {
				newCom.style = comment.style;
			}
			return newCom;
		});
	}

	static createCommentLinks(canvasInfoLinks, commentId) {
		var newLinks = [];
		canvasInfoLinks.forEach((link) => {
			if (link.type === "commentLink" &&
					link.srcNodeId === commentId) {
				const newLink = { node_ref: link.trgNodeId };
				if (link.class_name) {
					newLink.class_name = link.class_name;
				}
				if (link.style) {
					newLink.style = link.style;
				}
				newLinks.push(newLink);
			}
		});
		return newLinks;
	}

	static createAssociationLinks(ciNode, ciLinks) {
		const associationsLinks = [];
		ciLinks.forEach((link) => {
			if (link.type === "associationLink" &&
					link.srcNodeId === ciNode.id) {
				const assoc = {
					id: link.id,
					node_ref: link.trgNodeId
				};
				if (link.class_name) {
					assoc.class_name = link.class_name;
				}
				if (link.style) {
					assoc.style = link.style;
				}
				if (link.decorations) {
					var newDecorations = this.createDecorations(link.decorations);
					if (newDecorations.length > 0) {
						assoc.decorations = newDecorations;
					}
				}
				associationsLinks.push(assoc);
			}
		});
		return associationsLinks;
	}
}
