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
			sub_id: canvas.diagram.id,
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
			if (canvasNode.subDiagramId) {
				newNode.subflow_ref = { pipeline_id_ref: canvasNode.subDiagramId, url: "app_defined" };

			} else if (canvasNode.userData && canvasNode.userData.typeId) {
				newNode.operator_id_ref = canvasNode.userData.typeId;
			}

			return newNode;
		});
	}

	static getType(canvasNode) {
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
		return {
			categories: this.getCategories(canvasPalette.categories)
		};
	}

	static getCategories(categories) {
		return categories.map((cat) =>
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

	// ==========================================================================
	// Functions below are returning canvasinfo in the old deprectaed canvas
	// format based on the initial canvas passed in.
	// ==========================================================================

	static getCanvasBasedOnCanvas(oldCanvas, canvasinfo) {
		return Object.assign({}, oldCanvas, { diagram: this.getDiagram(oldCanvas, canvasinfo) });
	}

	static getDiagram(oldCanvas, canvasinfo) {
		return {
			id: canvasinfo.sub_id,
			nodes: this.getCanvasNodes(canvasinfo.nodes, oldCanvas),
			comments: this.getCanvasComments(canvasinfo.comments),
			links: this.getCanvasLinks(canvasinfo.links)
		};
	}

	static getCanvasNodes(canvasnodes, oldCanvas) {
		return canvasnodes.map((canvasnode) => {
			var newNode = {
				id: canvasnode.id
			};
			if (canvasnode.input_ports) {
				newNode.inputPorts = this.getCanvasPorts(canvasnode.input_ports);
			}
			if (canvasnode.output_ports) {
				newNode.outputPorts = this.getCanvasPorts(canvasnode.output_ports);
			}
			newNode.image = canvasnode.image;
			newNode.x_pos = canvasnode.x_pos;
			newNode.y_pos = canvasnode.y_pos;
			newNode.className = canvasnode.class_name;
			newNode.objectData = {
				label: canvasnode.label,
				description: ""
			};
			if (canvasnode.decorations) {
				newNode.decorations = this.getCanvasDecorations(canvasnode.decorations);
			}
			var oldNode = this.getOldNode(canvasnode.id, oldCanvas);
			if (oldNode && oldNode.userData) {
				newNode.userData = oldNode.userData;
			}
			return newNode;
		});
	}

	static getCanvasPorts(canvasports) {
		return canvasports.map((canvasport) => {
			var newPort = {
				name: canvasport.id,
				label: canvasport.label
			};
			if (canvasport.cardinality) {
				newPort.cardinality = canvasport.cardinality.min + ":" + canvasport.cardinality.max;
			}
			return newPort;
		});
	}

	static getCanvasDecorations(canvasdecorations) {
		return canvasdecorations.map((decoration) => {
			var newDecoration = {};
			if (decoration.position) {
				newDecoration.position = decoration.position;
			}
			if (decoration.class_name) {
				newDecoration.className = decoration.class_name;
			}
			if (decoration.image) {
				newDecoration.image = decoration.image;
			}
			if (decoration.hotspot) {
				newDecoration.hotspot = decoration.hotspot;
			}
			if (decoration.id) {
				newDecoration.id = decoration.id;
			}
			return newDecoration;
		});
	}

	static getOldNode(nodeId, oldCanvas) {
		if (oldCanvas && oldCanvas.diagram && oldCanvas.diagram.nodes) {
			var index = oldCanvas.diagram.nodes.findIndex((node) => node.id === nodeId);
			if (index > -1) {
				return oldCanvas.diagram.nodes[index];
			}
		}
		return null;
	}

	static getCanvasComments(canvascomments) {
		return canvascomments.map((canvascomment) => {
			var newCom = {
				id: canvascomment.id,
				className: canvascomment.class_name,
				content: canvascomment.content,
				height: canvascomment.height,
				width: canvascomment.width,
				x_pos: canvascomment.x_pos,
				y_pos: canvascomment.y_pos
			};
			return newCom;
		});
	}

	static getCanvasLinks(canvaslinks) {
		return canvaslinks.map((canvaslink) => {
			var newLink = {
				id: canvaslink.id,
				className: canvaslink.class_name,
				source: canvaslink.srcNodeId
			};
			if (canvaslink.srcNodePortId) {
				newLink.sourcePort = canvaslink.srcNodePortId;
			}
			newLink.target = canvaslink.trgNodeId;

			if (canvaslink.trgNodePortId) {
				newLink.targetPort = canvaslink.trgNodePortId;
			}
			if (canvaslink.type === "nodeLink") {
				newLink.userData = { linkType: "data" };
			}
			return newLink;
		});
	}

}
