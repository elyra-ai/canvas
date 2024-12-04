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

/* eslint no-lonely-if: "off" */

import * as d3Drag from "d3-drag";
import * as d3Ease from "d3-ease";
import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Drag, d3Ease, d3Selection);

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import { ASSOCIATION_LINK, COMMENT_LINK, NODE_LINK,
	LINK_TYPE_CURVE, LINK_TYPE_STRAIGHT, LINK_SELECTION_DETACHABLE,
	PORT_OBJECT_CIRCLE, PORT_OBJECT_IMAGE }
	from "./constants/canvas-constants.js";

// This utility files provides a drag handler which manages drag operations to
// create new links either between nodes or from a comment to a node.

export default class SVGCanvasUtilsDragNewLink {
	constructor(renderer) {
		this.ren = renderer;

		this.logger = new Logger("SVGCanvasUtilsDragNewLink");

		// Object to store variables for dynamically drawing a new link line. The
		// existence of this object means a new link is being drawn. A null means
		// no link is currently being drawn.
		this.drawingNewLinkData = null;

		// Create a drag handler for resizing and moving nodes and comments.
		this.dragNewLinkHandler = d3.drag()
			.on("start", this.dragStartNewLink.bind(this))
			.on("drag", this.dragMoveNewLink.bind(this))
			.on("end", this.dragEndNewLink.bind(this));
	}

	// Returns the dragResizeObjectHandler
	getDragNewLinkHandler() {
		return this.dragNewLinkHandler;
	}

	// Returns true if a new link is currently being dragged.
	isDragging() {
		return this.drawingNewLinkData;
	}

	// Initialize new link creation info when a port node is dragged.
	dragStartNewLink(d3Event, d) {
		if (this.isEventForOutputPort(d3Event)) {
			const node = this.getNodeForPort(d3Event);
			this.startOutputPortNewLink(d, node);

		} else if (this.isEventForInputPort(d3Event)) {
			const node = this.getNodeForPort(d3Event);
			this.startInputPortNewLink(d, node);

		} else if (this.ren.activePipeline.getObjectTypeName(d) === "comment") {
			this.startCommentNewLink(d);
		}
	}

	// Draws an appropriate new link line when a port is being dragged.
	dragMoveNewLink(d3Event) {
		this.drawNewLink(d3Event);
	}

	// Completes the creation (or not) of a new link line when a port has
	// finished being dragged.
	dragEndNewLink(d3Event) {
		this.completeNewLink(d3Event);
	}

	// Return true if the d3Event passed in is for an input port.
	isEventForInputPort(d3Event) {
		return this.targetContainsClass(d3Event, "d3-node-port-input") ||
			this.targetContainsClass(d3Event, "d3-node-port-input-assoc");
	}

	// Return true if the d3Event passed in is for an output port.
	isEventForOutputPort(d3Event) {
		return this.targetContainsClass(d3Event, "d3-node-port-output") ||
			this.targetContainsClass(d3Event, "d3-node-port-output-assoc");
	}

	// Returns true if the d3Event contains a current target with the spcified class name.
	targetContainsClass(d3Event, className) {
		return d3Event.sourceEvent?.currentTarget?.classList?.contains(className);
	}

	// Returns the node data for the target of the event passed in.
	getNodeForPort(d3Event) {
		return d3.select(d3Event.sourceEvent?.currentTarget?.parentNode).datum();
	}

	// Initialize this.drawingNewLinkData when dragging a comment port.
	startCommentNewLink(comment) {
		this.drawingNewLinkData = {
			srcObjId: comment.id,
			action: COMMENT_LINK,
			startPos: {
				x: comment.x_pos - this.ren.canvasLayout.commentHighlightGap,
				y: comment.y_pos - this.ren.canvasLayout.commentHighlightGap
			},
			linkArray: []
		};
	}

	// Initialize this.drawingNewLinkData when dragging an input port. This gesture
	// is only supported for association link creation.
	startInputPortNewLink(port, node) {
		if (this.ren.config.enableAssocLinkCreation) {
			const srcNode = this.ren.activePipeline.getNode(node.id);
			this.drawingNewLinkData = {
				srcObjId: node.id,
				srcPortId: port.id,
				action: this.ren.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK,
				srcNode: srcNode,
				startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
				portType: "input",
				portObject: node.layout.inputPortObject,
				portImage: node.layout.inputPortImage,
				portWidth: node.layout.inputPortWidth,
				portHeight: node.layout.inputPortHeight,
				portRadius: this.ren.getPortRadius(srcNode),
				minInitialLine: srcNode.layout.minInitialLine,
				guideObject: node.layout.inputPortGuideObject,
				guideImage: node.layout.inputPortGuideImage,
				linkArray: []
			};
		}
	}

	// Initialize this.drawingNewLinkData when dragging an output port.
	startOutputPortNewLink(port, node) {
		const srcNode = this.ren.activePipeline.getNode(node.id);
		if (!CanvasUtils.isSrcCardinalityAtMax(port.id, srcNode, this.ren.activePipeline.links)) {
			this.drawingNewLinkData = {
				srcObjId: node.id,
				srcPortId: port.id,
				action: this.ren.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK,
				srcNode: srcNode,
				startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
				portType: "output",
				portObject: node.layout.outputPortObject,
				portImage: node.layout.outputPortImage,
				portWidth: node.layout.outputPortWidth,
				portHeight: node.layout.outputPortHeight,
				portRadius: this.ren.getPortRadius(srcNode),
				minInitialLine: srcNode.layout.minInitialLine,
				guideObject: node.layout.outputPortGuideObject,
				guideImage: node.layout.outputPortGuideImage,
				linkArray: []
			};
			if (this.ren.config.enableHighlightUnavailableNodes) {
				this.ren.setUnavailableTargetNodesHighlighting(srcNode, port.id, this.ren.activePipeline.links);
			}
		}
	}

	drawNewLink(d3Event) {
		if (this.ren.config.enableEditingActions === false || !this.drawingNewLinkData) {
			return;
		}

		this.ren.closeContextMenuIfOpen();

		const transPos = this.ren.getTransformedMousePos(d3Event);

		if (this.drawingNewLinkData.action === COMMENT_LINK) {
			this.drawNewCommentLink(transPos);
		} else {
			this.drawNewNodeLink(transPos);
		}
		// Switch on an attribute to indicate a new link is being dragged
		// towards and over a target node.
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNode(d3Event);
		}
	}

	drawNewCommentLink(transPos) {
		const srcComment = this.ren.activePipeline.getComment(this.drawingNewLinkData.srcObjId);
		const startPos = this.ren.linkUtils.getNewStraightCommentLinkStartPos(srcComment, transPos);
		const linkType = COMMENT_LINK;

		this.drawingNewLinkData.linkArray = [{
			"x1": startPos.x,
			"y1": startPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		const connectionLineSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line");
		const connectionGuideSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-guide");

		connectionLineSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append("path")
			.attr("class", "d3-new-connection-line")
			.attr("linkType", linkType)
			.merge(connectionLineSel)
			.attr("d", (d) => this.ren.linkUtils.getConnectorPathInfo(d).path);

		connectionGuideSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append("circle")
			.attr("class", "d3-new-connection-guide")
			.attr("linkType", linkType)
			.merge(connectionGuideSel)
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.ren.canvasLayout.commentPortRadius);

		if (this.ren.canvasLayout.commentLinkArrowHead) {
			const connectionArrowHeadSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-arrow");

			connectionArrowHeadSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append("path")
				.attr("class", "d3-new-connection-arrow")
				.attr("linkType", linkType)
				.merge(connectionArrowHeadSel)
				.attr("d", (d) => this.ren.getArrowHead(d))
				.attr("transform", (d) => this.ren.getArrowHeadTransform(d));
		}
	}

	drawNewNodeLink(transPos) {
		const linkCategory = this.ren.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK;

		// Create a temporary link to represent the new link being created. If we are
		// creating an association link from an input port we pass in the reverse values.
		const inLink = (linkCategory === ASSOCIATION_LINK && this.drawingNewLinkData.portType === "input")
			? {
				type: linkCategory,
				trgNode: this.drawingNewLinkData.srcNode,
				trgNodeId: this.drawingNewLinkData.srcObjId,
				trgNodePortId: this.drawingNewLinkData.srcPortId,
				srcPos: {
					x_pos: transPos.x,
					y_pos: transPos.y
				}
			}
			: {
				type: linkCategory,
				srcObj: this.drawingNewLinkData.srcNode,
				srcNodeId: this.drawingNewLinkData.srcObjId,
				srcNodePortId: this.drawingNewLinkData.srcPortId,
				trgPos: {
					x_pos: transPos.x,
					y_pos: transPos.y
				}
			};

		const link = this.ren.getDetachedLinkObj(inLink);
		this.drawingNewLinkData.linkArray = this.ren.linkUtils.addConnectionPaths([link]);

		if (this.ren.config.enableAssocLinkCreation) {
			this.drawingNewLinkData.linkArray[0].assocLinkVariation =
				this.ren.getNewLinkAssocVariation(
					this.drawingNewLinkData.linkArray[0].x1,
					this.drawingNewLinkData.linkArray[0].x2,
					this.drawingNewLinkData.portType);
		}

		const pathInfo = this.ren.linkUtils.getConnectorPathInfo(
			this.drawingNewLinkData.linkArray[0], this.drawingNewLinkData.minInitialLine);

		const connectionLineSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line");
		const connectionStartSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-start");
		const connectionGuideSel = this.ren.nodesLinksGrp.selectAll(".d3-new-connection-guide");

		// For a straight node line, don't draw the new link line when the guide icon
		// or object is inside the node boundary otherwise it looks ugly when trying
		// to draw straight lines over the node.
		if (linkCategory === NODE_LINK &&
				this.ren.canvasLayout.linkType === LINK_TYPE_STRAIGHT &&
				this.ren.nodeUtils.isPointInNodeBoundary(transPos, this.drawingNewLinkData.srcNode)) {
			this.removeNewLinkLine();

		} else {
			connectionLineSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append("path")
				.attr("class", "d3-new-connection-line")
				.attr("linkType", linkCategory)
				.merge(connectionLineSel)
				.attr("d", pathInfo.path)
				.attr("transform", pathInfo.transform);
		}

		if (this.ren.canvasLayout.linkType !== LINK_TYPE_STRAIGHT) {
			connectionStartSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append(this.drawingNewLinkData.portObject)
				.attr("class", "d3-new-connection-start")
				.attr("linkType", linkCategory)
				.merge(connectionStartSel)
				.each((d, i, startSel) => {
					// No need to draw the starting object of the new line if it is an image.
					if (this.drawingNewLinkData.portObject === PORT_OBJECT_CIRCLE) {
						d3.select(startSel[i])
							.attr("cx", d.x1)
							.attr("cy", d.y1)
							.attr("r", this.drawingNewLinkData.portRadius);
					}
				});
		}

		connectionGuideSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append(this.drawingNewLinkData.guideObject)
			.attr("class", "d3-new-connection-guide")
			.attr("linkType", linkCategory)
			.merge(connectionGuideSel)
			.each((d, i, guideSel) => {
				if (this.drawingNewLinkData.guideObject === PORT_OBJECT_IMAGE) {
					d3.select(guideSel[i])
						.attr("xlink:href", this.drawingNewLinkData.guideImage)
						.attr("x", d.x2 - (this.drawingNewLinkData.portWidth / 2))
						.attr("y", d.y2 - (this.drawingNewLinkData.portHeight / 2))
						.attr("width", this.drawingNewLinkData.portWidth)
						.attr("height", this.drawingNewLinkData.portHeight)
						.attr("transform", this.ren.getLinkImageTransform(d));
				} else {
					d3.select(guideSel[i])
						.attr("cx", d.x2)
						.attr("cy", d.y2)
						.attr("r", this.drawingNewLinkData.portRadius);
				}
			});
	}

	removeNewLinkLine() {
		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line").remove();
	}

	// Handles the completion of a new link being drawn from a source node.
	completeNewLink(d3Event) {
		if (this.ren.config.enableEditingActions === false || !this.drawingNewLinkData) {
			return;
		}

		// Save a local reference to this.drawingNewLinkData so we can set it to null before
		// calling the canvas-controller. This means the this.drawingNewLinkData object will
		// be null when the canvas is refreshed.
		const drawingNewLinkData = this.drawingNewLinkData;
		this.drawingNewLinkData = null;

		if (this.ren.config.enableHighlightUnavailableNodes) {
			this.ren.unsetUnavailableNodesHighlighting();
		}
		var trgNode = this.ren.getNodeAtMousePos(d3Event);
		if (trgNode !== null) {
			this.createNewLinkFromDragData(d3Event, trgNode, drawingNewLinkData);

		} else {
			if (this.ren.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
					drawingNewLinkData.action === NODE_LINK &&
					!this.ren.config.enableAssocLinkCreation) {
				this.completeNewDetachedLink(d3Event, drawingNewLinkData);

			} else {
				this.stopDrawingNewLink(drawingNewLinkData);
			}
		}
	}

	// Handles the creation of a link when the end of a new link
	// being drawn from a source node is dropped on a target node.
	createNewLinkFromDragData(d3Event, trgNode, drawingNewLinkData) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		// Switch 'new link over node' highlighting off
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.ren.setLinkOverNodeCancel();
		}

		// Create the link.
		const type = drawingNewLinkData.action;
		const srcObjId = drawingNewLinkData.srcObjId;

		if (trgNode !== null) {
			if (type === NODE_LINK) {
				const srcNode = this.ren.activePipeline.getNode(srcObjId);
				const srcPortId = drawingNewLinkData.srcPortId;
				const trgPortId = this.ren.getInputNodePortId(d3Event, trgNode);
				this.createNewNodeLink(srcNode, srcPortId, trgNode, trgPortId);

			} else if (type === ASSOCIATION_LINK) {
				const srcObj = this.ren.activePipeline.getNode(srcObjId);
				this.createNewAssocLink(srcObj, trgNode);

			} else if (type === COMMENT_LINK) {
				const srcObj = this.ren.activePipeline.getComment(srcObjId);
				this.createNewCommentLink(srcObj, trgNode);
			}
		}
	}

	// Creates a link from the currently selected objects. This is called when
	// the user presses a keyboard shortcut to create the link. For the link to be
	// created, there must be exactly two selections and the first selection must
	// be either a comment or a node and the second selection must be a node.
	createNewLinkFromSelections() {
		const selNodes = this.ren.activePipeline.getSelectedNodes();
		const selComments = this.ren.activePipeline.getSelectedComments();

		if (selNodes.length + selComments.length === 2) {
			if (selNodes.length === 1 && selComments.length === 1) {
				this.createNewCommentLink(selComments[0], selNodes[0]);

			} else if (selNodes.length === 2) {
				if (this.ren.config.enableAssocLinkCreation) {
					this.createNewAssocLink(selNodes[0], selNodes[1]);

				} else {
					const srcPortId = CanvasUtils.getDefaultOutputPortId(selNodes[0]);
					const trgPortId = CanvasUtils.getDefaultInputPortId(selNodes[1]);
					this.createNewNodeLink(selNodes[0], srcPortId, selNodes[1], trgPortId);
					// This selects just the target object which allows the user to
					// more easily create a subsequent link to the next node.
					this.ren.canvasController.setSelections([selNodes[1].id]);
				}
			}
		}
	}

	createNewNodeLink(srcNode, srcPortId, trgNode, trgPortId) {
		if (CanvasUtils.isDataConnectionAllowed(srcPortId, trgPortId, srcNode, trgNode,
			this.ren.activePipeline.links, this.ren.config.enableSelfRefLinks)) {
			this.ren.canvasController.editActionHandler({
				editType: "linkNodes",
				editSource: "canvas",
				nodes: [{ "id": srcNode.id, "portId": srcPortId }],
				targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
				type: NODE_LINK,
				linkType: "data", // Added for historical purposes - for WML Canvas support
				pipelineId: this.ren.activePipeline.id });

		} else if (this.ren.config.enableLinkReplaceOnNewConnection &&
					CanvasUtils.isDataLinkReplacementAllowed(srcPortId, trgPortId, srcNode, trgNode,
						this.ren.activePipeline.links, this.ren.config.enableSelfRefLinks)) {
			const linksToTrgPort = CanvasUtils.getDataLinksConnectedTo(trgPortId, trgNode, this.ren.activePipeline.links);
			// We only replace a link to a maxed out cardinality port if there
			// is only one link. i.e. the input port cardinality is 0:1
			if (linksToTrgPort.length === 1) {
				this.ren.canvasController.editActionHandler({
					editType: "linkNodesAndReplace",
					editSource: "canvas",
					nodes: [{ "id": srcNode.id, "portId": srcPortId }],
					targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
					type: NODE_LINK,
					pipelineId: this.pipelineId,
					replaceLink: linksToTrgPort[0]
				});
			}
		}
	}

	createNewAssocLink(srcNode, trgNode) {
		if (CanvasUtils.isAssocConnectionAllowed(srcNode, trgNode, this.ren.activePipeline.links)) {
			this.ren.canvasController.editActionHandler({
				editType: "linkNodes",
				editSource: "canvas",
				nodes: [{ "id": srcNode.id }],
				targetNodes: [{ "id": trgNode.id }],
				type: ASSOCIATION_LINK,
				pipelineId: this.ren.activePipeline.id });
		}
	}

	createNewCommentLink(srcObj, trgNode) {
		if (CanvasUtils.isCommentLinkConnectionAllowed(srcObj.id, trgNode.id, this.ren.activePipeline.links)) {
			this.ren.canvasController.editActionHandler({
				editType: "linkComment",
				editSource: "canvas",
				nodes: [srcObj.id],
				targetNodes: [trgNode.id],
				type: COMMENT_LINK,
				linkType: "comment", // Added for historical purposes - for WML Canvas support
				pipelineId: this.ren.activePipeline.id });
		}
	}

	// Handles the completion of a new link when the end is dropped away from
	// a node (when enableLinkSelection is set to LINK_SELECTION_DETACHABLE)
	// which creates a  new detached link.
	completeNewDetachedLink(d3Event, drawingNewLinkData) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		// Switch 'new link over node' highlighting off
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.ren.setLinkOverNodeCancel();
		}

		const endPoint = this.ren.getTransformedMousePos(d3Event);
		this.ren.canvasController.editActionHandler({
			editType: "createDetachedLink",
			editSource: "canvas",
			srcNodeId: drawingNewLinkData.srcObjId,
			srcNodePortId: drawingNewLinkData.srcPortId,
			trgPos: endPoint,
			type: NODE_LINK,
			pipelineId: this.ren.activePipeline.id });
	}

	stopDrawingNewLink(drawingNewLinkData) {
		// Switch 'new link over node' highlighting off
		if (this.ren.config.enableHighlightNodeOnNewLinkDrag) {
			this.ren.setLinkOverNodeCancel();
		}

		this.stopDrawingNewLinkForPorts(drawingNewLinkData);
	}

	// Draws a 'snap-back' link with a rubber-band effect that
	// animates the cancellation of a new link's creation.
	stopDrawingNewLinkForPorts(drawingNewLinkData) {
		if (drawingNewLinkData.linkArray?.length === 0) {
			return;
		}
		let saveX1 = drawingNewLinkData.linkArray[0].x1;
		let saveY1 = drawingNewLinkData.linkArray[0].y1;
		let saveX2 = drawingNewLinkData.linkArray[0].x2;
		let saveY2 = drawingNewLinkData.linkArray[0].y2;

		// If we were creating an association link from an input port of
		// the node, we reverse the way the snap-back link is drawn by
		// switching the coordinates.
		if (drawingNewLinkData.action === ASSOCIATION_LINK &&
			drawingNewLinkData.portType === "input") {
			saveX1 = drawingNewLinkData.linkArray[0].x2;
			saveY1 = drawingNewLinkData.linkArray[0].y2;
			saveX2 = drawingNewLinkData.linkArray[0].x1;
			saveY2 = drawingNewLinkData.linkArray[0].y1;
		}

		const saveNewLinkData = Object.assign({}, drawingNewLinkData);

		// If we completed a connection successfully just remove the new line
		// objects.
		let newPath = "";
		let duration = 350;

		if (this.ren.canvasLayout.linkType === LINK_TYPE_CURVE) {
			newPath = "M " + saveX1 + " " + saveY1 +
								"C " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2;

		} else if (this.ren.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
			if (saveX1 < saveX2) {
				duration = 0;
			}
			newPath = "M " + saveX1 + " " + saveY1 +
								"L " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2;

		} else {
			newPath = "M " + saveX1 + " " + saveY1 +
								"L " + saveX2 + " " + saveY2 +
								"Q " + saveX2 + " " + saveY2 + " " + saveX2 + " " + saveY2 +
								"L " + saveX2 + " " + saveY2 +
								"Q " + saveX2 + " " + saveY2 + " " + saveX2 + " " + saveY2 +
								"L " + saveX2 + " " + saveY2 +
								"Q " + saveX2 + " " + saveY2 + " " + saveX2 + " " + saveY2 +
								"L " + saveX2 + " " + saveY2 +
								"Q " + saveX2 + " " + saveY2 + " " + saveX2 + " " + saveY2 +
								"L " + saveX2 + " " + saveY2;
		}

		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line")
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.ren.nodesLinksGrp.selectAll(".d3-new-connection-arrow").remove();

				this.ren.nodesLinksGrp.selectAll(".d3-new-connection-guide")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					// The lines below set all attributes for images AND circles even
					// though some attributes will not be relevant. This is done
					// because I could not get the .each() method to work here (which
					// would be necessary to have an if statement based on guide object)
					.attr("x", saveX1 - (saveNewLinkData.portWidth / 2))
					.attr("y", saveY1 - (saveNewLinkData.portHeight / 2))
					.attr("cx", saveX1)
					.attr("cy", saveY1)
					.attr("transform", null);
				this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("d", "M " + saveX1 + " " + saveY1 +
											"L " + saveX1 + " " + saveY1)
					.on("end", this.removeNewLink.bind(this));
			});
	}

	removeNewLink() {
		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-line").remove();
		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-start").remove();
		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-guide").remove();
		this.ren.nodesLinksGrp.selectAll(".d3-new-connection-arrow").remove();
	}

	// Switches on or off node highlighting depending on whether a node is
	// close to the new link being dragged.
	setNewLinkOverNode(d3Event) {
		const nodeNearMouse = this.ren.getNodeNearMousePos(d3Event, this.ren.canvasLayout.nodeProximity);
		const highlightState = nodeNearMouse && this.isNewLinkAllowedToNode(nodeNearMouse);
		this.ren.setHighlightingOverNode(highlightState, nodeNearMouse);
	}

	// Returns true if a connection is allowed to the node passed in based on the
	// this.drawingNewLinkData object which describes a new link being dragged.
	isNewLinkAllowedToNode(node) {
		if (this.drawingNewLinkData) {
			if (this.drawingNewLinkData.action === NODE_LINK) {
				const srcNode = this.drawingNewLinkData.srcNode;
				const trgNode = node;
				const srcNodePortId = this.drawingNewLinkData.srcPortId;
				const trgNodePortId = CanvasUtils.getDefaultInputPortId(trgNode); // TODO - make specific to nodes.
				return CanvasUtils.isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode,
					this.ren.activePipeline.links, this.ren.config.enableSelfRefLinks);

			} else if (this.drawingNewLinkData.action === ASSOCIATION_LINK) {
				const srcNode = this.drawingNewLinkData.srcNode;
				const trgNode = node;
				return CanvasUtils.isAssocConnectionAllowed(srcNode, trgNode, this.ren.activePipeline.links);

			} else if (this.drawingNewLinkData.action === COMMENT_LINK) {
				const srcObjId = this.drawingNewLinkData.srcObjId;
				const trgNodeId = node.id;
				return CanvasUtils.isCommentLinkConnectionAllowed(srcObjId, trgNodeId, this.ren.activePipeline.links);
			}
		}
		return false;
	}


}
