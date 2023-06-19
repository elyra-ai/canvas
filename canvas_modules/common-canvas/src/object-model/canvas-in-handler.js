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

import { has } from "lodash";
import { BINDING, EXECUTION_NODE,
	SUPER_NODE, MODEL_NODE } from "../common-canvas/constants/canvas-constants.js";

export default class CanvasInHandler {

	static convertCanvasToCanvasInfo(canvas) {
		// There is only one pipeline in a canvas document contained in the
		// canvas.diagram field.
		const canvasInfoPipeline = {
			id: canvas.diagram.id,
			nodes: this.getNodes(canvas.diagram.nodes),
			comments: this.getComments(canvas.diagram.comments),
			links: this.getLinks(canvas.diagram.links, canvas.diagram.nodes, canvas.diagram.comments),
			runtime_ref: ""
		};

		// The canvas zoom can be specified as a single number which needs to be
		// converted to our zoom object if it is not 100. If it is 100 we leave out
		// the zoom object because it will default to k = 1, x = 0, y = 0.
		if (canvas.zoom && typeof canvas.zoom === "number" && canvas.zoom !== 100) {
			canvasInfoPipeline.zoom = {
				k: canvas.zoom / 100,
				x: 0,
				y: 0
			};
		}
		return {
			doc_type: "pipeline",
			version: "3.0",
			json_schema: "https://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json",
			id: canvas.id,
			primary_pipeline: canvas.diagram.id,
			pipelines: [canvasInfoPipeline]
		};
	}

	static getNodes(canvasNodes) {
		return canvasNodes.map((canvasNode) => {
			const nodeType = this.getType(canvasNode);
			var newNode = {
				id: canvasNode.id,
				image: canvasNode.image,
				x_pos: typeof canvasNode.x_pos !== "undefined" ? canvasNode.x_pos : canvasNode.xPos, // Handle old field name xPos
				y_pos: typeof canvasNode.y_pos !== "undefined" ? canvasNode.y_pos : canvasNode.yPos, // Handle old field name yPos
				class_name: canvasNode.className,
				label: canvasNode.objectData.label,
				type: nodeType,
				style: canvasNode.style
			};
			if (canvasNode.objectData && canvasNode.objectData.description) {
				newNode.description = canvasNode.objectData.description;
			}
			if (canvasNode.inputPorts) {
				newNode.inputs = this.getInputPorts(canvasNode.inputPorts, 1);
			}
			if (canvasNode.outputPorts) {
				newNode.outputs = this.getOutputPorts(canvasNode.outputPorts, -1);
			}
			if (canvasNode.decorations) {
				newNode.decorations = this.getDecorations(canvasNode.decorations);
			}
			if (nodeType === SUPER_NODE) {
				newNode.subflow_ref = { pipeline_id_ref: canvasNode.subDiagramId, url: "app_defined" };
				newNode.open_with_tool = "canvas";
				newNode.is_expanded = false;
				// WML Canvas doesn't use common-canvas expanded supernodes so just set some dummy values.
				newNode.expanded_width = 200;
				newNode.expanded_height = 200;
			}

			if (nodeType === MODEL_NODE) {
				newNode.model_ref = "";
			}

			if (nodeType === EXECUTION_NODE || nodeType === BINDING || nodeType === MODEL_NODE) {
				if (canvasNode.userData && canvasNode.userData.typeId) {
					newNode.op = canvasNode.userData.typeId;
				} else {
					newNode.op = "";
				}
			}

			return newNode;
		});
	}

	static getType(canvasNode) {
		if (canvasNode.userData && canvasNode.userData.containsModel === true) {
			return MODEL_NODE;
		}
		if (canvasNode.inputPorts && canvasNode.inputPorts.length > 0 &&
				canvasNode.outputPorts && canvasNode.outputPorts.length > 0) {
			if (canvasNode.subDiagramId) {
				return SUPER_NODE;
			}
			return EXECUTION_NODE;
		}
		return BINDING;
	}

	static getInputPorts(canvasInputPorts, defaultMaxCard) {
		return canvasInputPorts.map((canvasInputPort) =>
			({
				id: canvasInputPort.name,
				label: canvasInputPort.label,
				cardinality: {
					min: this.getMinCard(canvasInputPort.cardinality),
					max: this.getMaxCard(canvasInputPort.cardinality, defaultMaxCard)
				}
			})
		);
	}

	static getOutputPorts(canvasOutputPorts, defaultMaxCard) {
		return canvasOutputPorts.map((canvasOutputPort) =>
			({
				id: canvasOutputPort.name,
				label: canvasOutputPort.label,
				cardinality: {
					min: this.getMinCard(canvasOutputPort.cardinality),
					max: this.getMaxCard(canvasOutputPort.cardinality, defaultMaxCard)
				}
			})
		);
	}

	static getMinCard(card) {
		if (card) {
			return Number(card.split(":")[0]);
		}
		return 0;
	}

	static getMaxCard(card, defaultMaxCard) {
		if (card) {
			return Number(card.split(":")[1]);
		}
		return defaultMaxCard;
	}

	static getDecorations(decorations) {
		return decorations.map((decoration) => ({
			position: decoration.position,
			class_name: decoration.className,
			hotspot: decoration.hotspot,
			id: decoration.id,
			image: decoration.image,
			outline: decoration.outline,
			x_pos: decoration.x_pos,
			y_pos: decoration.y_pos,
			width: decoration.width,
			height: decoration.height
		}));
	}

	static getComments(canvasComents) {
		return canvasComents.map((canvasComment) =>
			({
				id: canvasComment.id,
				class_name: canvasComment.className,
				content: canvasComment.content,
				x_pos: typeof canvasComment.x_pos !== "undefined" ? canvasComment.x_pos : canvasComment.xPos, // Handle old field name xPos
				y_pos: typeof canvasComment.y_pos !== "undefined" ? canvasComment.y_pos : canvasComment.yPos, // Handle old field name yPos
				height: canvasComment.height,
				width: canvasComment.width,
				style: canvasComment.style
			})
		);
	}

	static getLinks(canvasLinks, nodes, comments) {
		const newLinks = [];
		canvasLinks.forEach((canvasLink) => {
			if (this.isValidLink(canvasLink, nodes, comments)) {
				var newLink = {
					id: canvasLink.id,
					class_name: canvasLink.className,
					srcNodeId: canvasLink.source,
					trgNodeId: canvasLink.target,
					type: this.getLinkType(canvasLink),
					style: canvasLink.style
				};
				if (canvasLink.sourcePort) {
					newLink.srcNodePortId = canvasLink.sourcePort;
				}
				if (canvasLink.targetPort) {
					newLink.trgNodePortId = canvasLink.targetPort;
				}
				newLinks.push(newLink);
			}
		});
		return newLinks;
	}

	static isValidLink(canvasLink, nodes, comments) {
		let isValid = false;

		if ((this.getLinkType(canvasLink) === "nodeLink" || this.getLinkType(canvasLink) === "associationLink") &&
				(nodes.findIndex((node) => node.id === canvasLink.source) > -1) &&
				(nodes.findIndex((node) => node.id === canvasLink.target) > -1)) {
			isValid = true;
		}

		if (this.getLinkType(canvasLink) === "commentLink" &&
				(comments.findIndex((comment) => comment.id === canvasLink.source) > -1) &&
				(nodes.findIndex((node) => node.id === canvasLink.target) > -1)) {
			isValid = true;
		}

		return isValid;
	}

	static getLinkType(canvasLink) {
		if (has(canvasLink, "userData.linkType")) {
			switch (canvasLink.userData.linkType) {
			case "comment":
				return "commentLink";
			case "object":
				return "associationLink";
			default:
				return "nodeLink";
			}
		}
		return "nodeLink";
	}

	// ==========================================================================
	// Functions below are for converting old palette data to new v1.0 palette
	// data used with pipeline flow. The upgrade-palette.js file will do all
	// necessary conversions from v1.0 to the latest version.
	// ==========================================================================

	static convertPaletteToPipelineFlowPalette(canvasPalette) {
		return {
			version: "1.0",
			categories: this.getCategories(canvasPalette.categories)
		};
	}

	static getCategories(categories) {
		return categories.map((cat) =>
			({
				category: cat.category,
				label: cat.label,
				description: cat.description,
				image: cat.image,
				nodetypes: this.convertNodeTypes(cat.nodetypes)
			})
		);
	}

	static convertNodeTypes(nodetypes) {
		return nodetypes.map((nodetype) => {
			var newNodeType = {
				type: this.getType(nodetype),
				label: nodetype.label,
				description: nodetype.description,
				operator_id_ref: nodetype.typeId,
				image: nodetype.image
			};
			if (nodetype.inputPorts) {
				newNodeType.input_ports = this.convertPalettePorts(nodetype.inputPorts, 1);
			}
			if (nodetype.outputPorts) {
				newNodeType.output_ports = this.convertPalettePorts(nodetype.outputPorts, -1);
			}
			return newNodeType;
		});
	}

	static convertPalettePorts(ports, defaultMaxCard) {
		return ports.map((port) =>
			({
				id: port.name,
				label: port.label,
				cardinality: this.convertPaletteCardinality(port.cardinality, defaultMaxCard)
			})
		);
	}

	static convertPaletteCardinality(cardinality, defaultMaxCard) {
		return {
			min: this.getMinCard(cardinality),
			max: this.getMaxCard(cardinality, defaultMaxCard)
		};
	}

	// ==========================================================================
	// Functions below are for detecting if the palette data is version 0 or not.
	// ==========================================================================

	// Returns true if the palette passed in is version 0.  Version 0 is indicated
	// if any node in the categories of the palette has a 'typeId' field.
	static isVersion0Palette(palette) {
		let isVersion0Palette = false;

		for (let idx = 0; idx < palette.categories.length; idx++) {
			if (this.isVersion0Category(palette.categories[idx])) {
				isVersion0Palette = true;
				break;
			}
		}
		return isVersion0Palette;
	}

	// If a category has a node that has a 'typeId' field then it indicates
	// a version 0 category.
	static isVersion0Category(category) {
		let isVersion0Palette = false;

		if (category.nodetypes) {
			for (let idx = 0; idx < category.nodetypes.length; idx++) {
				if (category.nodetypes[idx].typeId) {
					isVersion0Palette = true;
					break;
				}
			}
		}
		return isVersion0Palette;
	}
}
