/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import has from "lodash/has";
import LayoutDimensions from "./layout-dimensions.js";

export default class CanvasInHandler {

	static convertCanvasToCanvasInfo(canvas) {
		// There is only one pipeline in a canvas document conained in the
		// canvas.diagram field.
		const canvasInfoPipeline = {
			id: canvas.diagram.id,
			nodes: this.getNodes(canvas.diagram.nodes),
			comments: this.getComments(canvas.diagram.comments),
			links: this.getLinks(canvas.diagram.links, canvas.diagram.nodes, canvas.diagram.comments),
			runtime_ref: ""
		};
		return {
			doc_type: "pipeline",
			version: "2.0",
			json_schema: "http://api.dataplatform.ibm.com/schemas/common-pipeline/pipeline-flow/pipeline-flow-v2-schema.json",
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
				x_pos: canvasNode.x_pos ? canvasNode.x_pos : canvasNode.xPos, // Handle old field name xPos
				y_pos: canvasNode.y_pos ? canvasNode.y_pos : canvasNode.yPos, // Handle old field name yPos
				class_name: canvasNode.className,
				label: canvasNode.objectData.label,
				type: nodeType
			};
			if (canvasNode.objectData && canvasNode.objectData.description) {
				newNode.description = canvasNode.objectData.description;
			}
			if (canvasNode.inputPorts) {
				newNode.input_ports = this.getInputPorts(canvasNode.inputPorts, 1);
			}
			if (canvasNode.outputPorts) {
				newNode.output_ports = this.getOutputPorts(canvasNode.outputPorts, -1);
			}
			if (canvasNode.decorations) {
				newNode.decorations = this.getDecorations(canvasNode.decorations);
			}
			if (nodeType === "super_node") {
				// Assume WML Canvas will always use vertical format.
				const layout = LayoutDimensions.getLayout("ports-vertical");
				newNode.subflow_ref = { pipeline_id_ref: canvasNode.subDiagramId, url: "app_defined" };
				newNode.is_expanded = false;
				newNode.expanded_width = layout.supernodeDefaultWidth;
				newNode.expanded_height = layout.supernodeDefaultHeight;
			}

			if (nodeType === "model_node") {
				newNode.model_ref = "";
			}

			if (nodeType === "execution_node") {
				if (canvasNode.userData && canvasNode.userData.typeId) {
					newNode.operator_id_ref = canvasNode.userData.typeId;
				} else {
					newNode.operator_id_ref = "";
				}
			}

			return newNode;
		});
	}

	static getType(canvasNode) {
		if (canvasNode.userData && canvasNode.userData.containsModel === true) {
			return "model_node";
		}
		if (canvasNode.inputPorts && canvasNode.inputPorts.length > 0 &&
				canvasNode.outputPorts && canvasNode.outputPorts.length > 0) {
			if (canvasNode.subDiagramId) {
				return "super_node";
			}
			return "execution_node";
		}
		return "binding";
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
			image: decoration.image
		}));
	}

	static getComments(canvasComents) {
		return canvasComents.map((canvasComment) =>
			({
				id: canvasComment.id,
				class_name: canvasComment.className,
				content: canvasComment.content,
				x_pos: canvasComment.x_pos ? canvasComment.x_pos : canvasComment.xPos, // Handle old field name xPos
				y_pos: canvasComment.y_pos ? canvasComment.y_pos : canvasComment.yPos, // Handle old field name yPos
				height: canvasComment.height,
				width: canvasComment.width
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
					type: this.getLinkType(canvasLink)
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
	// Functions below are for converting old palette data to new palette data
	// used with pipeline flow.
	// ==========================================================================

	static convertPaletteToPipelineFlowPalette(canvasPalette) {
		return {
			version: "2.0",
			categories: this.getCategories(canvasPalette.categories)
		};
	}

	static getCategories(categories) {
		return categories.map((cat) =>
			({
				category: cat.category,
				label: cat.label,
				image: cat.image,
				nodetypes: this.convertNodeTypes(cat.nodetypes)
			})
		);
	}

	static convertNodeTypes(nodetypes) {
		return nodetypes.map((nodetype) => {
			var newNodeType = {
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
			if (palette.categories[idx].nodetypes.length > 0) {
				if (this.isVersion0Category(palette.categories[idx])) {
					isVersion0Palette = true;
					break;
				}
			}
		}
		return isVersion0Palette;
	}

	// If a category has a node that has a 'typeId' field then it indicates
	// a version 0 category.
	static isVersion0Category(category) {
		let isVersion0Palette = false;

		for (let idx = 0; idx < category.nodetypes.length; idx++) {
			if (category.nodetypes[idx].typeId) {
				isVersion0Palette = true;
				break;
			}
		}
		return isVersion0Palette;
	}
}
