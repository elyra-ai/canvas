/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

export default class CanvasOutHandler {

	// ==========================================================================
	// Functions below are returning canvasinfo in the old deprecated canvas
	// format based on the initial canvas passed in.
	// ==========================================================================

	static getCanvasBasedOnCanvasInfo(oldCanvas, canvasinfo) {
		return Object.assign({}, oldCanvas, { diagram: this.getDiagram(oldCanvas, canvasinfo.pipelines[0]) });
	}

	static getDiagram(oldCanvas, canvasinfoPipeline) {
		return {
			id: canvasinfoPipeline.id,
			nodes: this.getCanvasNodes(canvasinfoPipeline.nodes, oldCanvas),
			comments: this.getCanvasComments(canvasinfoPipeline.comments),
			links: this.getCanvasLinks(canvasinfoPipeline.links)
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
				description: canvasnode.description || ""
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
			let linkTypeValue = "";
			switch (canvaslink.type) {
			case "commentLink":
				linkTypeValue = "comment";
				break;
			case "associationLink":
				linkTypeValue = "object";
				break;
			default:
				linkTypeValue = "data";
				break;
			}
			newLink.userData = { linkType: linkTypeValue };

			return newLink;
		});
	}

}
