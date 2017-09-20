/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

export default class SVGCanvasInHandler {

	static convertCanvasToCanvasInfo(canvas) {
		return {
			id: canvas.id,
			nodes: this.getNodes(canvas.diagram.nodes),
			comments: this.getComments(canvas.diagram.comments),
			links: this.getLinks(canvas.diagram.links, canvas.diagram.comments)
		};
	}

	static getNodes(canvasNodes) {
		return canvasNodes.map((canvasNode) => {
			var newNode = {
				id: canvasNode.id,
				image: canvasNode.image,
				x_pos: canvasNode.x_pos,
				y_pos: canvasNode.y_pos,
				class_name: canvasNode.className,
				label: canvasNode.objectData.label,
				type: this.getType(canvasNode)
			};
			if (canvasNode.inputPorts) {
				newNode.input_ports = this.getInputPorts(canvasNode.inputPorts, 1);
			}
			if (canvasNode.outputPorts) {
				newNode.output_ports = this.getOutputPorts(canvasNode.outputPorts, -1);
			}
			if (canvasNode.decorations) {
				newNode.decorations = this.getDecorations(canvasNode.decorations);
			}

			return newNode;
		});
	}

	static getType(canvasNode) {
		if (canvasNode.inputPorts && canvasNode.inputPorts.length > 0 &&
				canvasNode.outputPorts && canvasNode.outputPorts.length > 0) {
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
			return card.split(":")[0];
		}
		return 0;
	}

	static getMaxCard(card, defaultMaxCard) {
		if (card) {
			return card.split(":")[1];
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
				x_pos: canvasComment.x_pos,
				y_pos: canvasComment.y_pos,
				height: canvasComment.height,
				width: canvasComment.width
			})
		);
	}

	static getLinks(canvasLinks, canvasComments) {
		return canvasLinks.map((canvasLink) => {
			var newLink = {
				id: canvasLink.id,
				class_name: canvasLink.className,
				srcNodeId: canvasLink.source,
				trgNodeId: canvasLink.target,
				type: this.getLinkType(canvasLink, canvasComments)
			};
			if (canvasLink.sourcePort) {
				newLink.srcNodePortId = canvasLink.sourcePort;
			}
			if (canvasLink.targetPort) {
				newLink.trgNodePortId = canvasLink.targetPort;
			}
			return newLink;
		});
	}

	static getLinkType(canvasLink, canvasComments) {
		if (canvasComments) {
			var index = canvasComments.findIndex((com) => com.id === canvasLink.source);
			if (index > -1) {
				return "commentLink";
			}
		}
		return "nodeLink";
	}

	// ==========================================================================
	// Functions below are for converting old palette data to new palette data
	// used with pipeline flow.
	// ==========================================================================

	static convertPaletteToPipelineFlowPalette(canvasPalette) {
		return canvasPalette.categories.map((cat) =>
			({
				category: cat.category,
				label: cat.label,
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
}
