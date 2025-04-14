/*
 * Copyright 2025 Elyra Authors
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

/* eslint no-unneeded-ternary: "off" */

import * as d3Drag from "d3-drag";
import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Drag, d3Selection);

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";

// This utility files provides a drag handler which manages drag operations on
// the middle part of a link when it is dragged to a node to convert the link
// being dragged into two new links into and out of the node.

export default class SVGCanvasUtilsDragLink {
	constructor(renderer) {
		this.ren = renderer;

		this.logger = new Logger("SVGCanvasUtilsDragLink");

		this.isDraggingLink = false;

		// Create a drag handler for dragging on a link.
		this.dragLinkHandler = d3.drag()
			.on("start", this.dragLinkStart.bind(this))
			.on("drag", this.dragLink.bind(this))
			.on("end", this.dragLinkEnd.bind(this));
	}

	// Returns the dragLinkHandler
	getDragLinkHandler() {
		return this.dragLinkHandler;
	}

	isDragging() {
		return this.isDraggingLink;
	}

	dragLinkStart(d3Event, d) {
		this.logger.logStartTimer("dragLinkStart");

		this.ren.closeContextMenuIfOpen();

		this.isDraggingLink = true;
		this.dragLink = this.ren.activePipeline.getLink(d.id);

		this.logger.logEndTimer("dragLinkStart", true);
	}

	dragLink(d3Event) {
		this.logger.logStartTimer("dragLink");

		this.dragLink.centerDragPos = this.ren.getTransformedMousePos(d3Event);
		this.ren.displayLinks();
		this.ren.raiseLinkToTopById(this.dragLink.id);

		const nodeNearMouse = this.ren.getNodeNearMousePos(d3Event, this.ren.canvasLayout.nodeProximity);

		const links = this.ren.activePipeline.links;
		const srcNode = this.dragLink.srcObj;
		const trgNode = this.dragLink.trgNode;

		this.targetNode = nodeNearMouse &&
			CanvasUtils.isNodeAttachableToDefaultPorts(nodeNearMouse, links) &&
			!CanvasUtils.linkAlreadyExists(srcNode.outputs[0].id, nodeNearMouse.inputs[0].id, srcNode, nodeNearMouse, links) &&
			!CanvasUtils.linkAlreadyExists(nodeNearMouse.outputs[0].id, trgNode.inputs[0].id, nodeNearMouse, trgNode, links)
			? nodeNearMouse
			: null;

		const highlight = this.targetNode ? true : false;
		this.ren.setHighlightingOverNode(highlight, this.targetNode);

		this.logger.logEndTimer("dragLink", true);
	}

	dragLinkEnd() {
		this.logger.logStartTimer("dragLinkEnd");

		this.ren.removeTempCursorOverlay();
		this.isDraggingLink = false;

		if (this.targetNode) {
			delete this.dragLink.centerDragPos;
			this.ren.setLinkOverNodeCancel();

			this.ren.canvasController.editActionHandler({
				editType: "insertNodeIntoLink",
				editSource: "canvas",
				node: this.targetNode,
				srcPort: this.targetNode.outputs[0],
				trgPort: this.targetNode.inputs[0],
				link: this.dragLink,
				offsetX: 0,
				offsetY: 0,
				pipelineId: this.ren.activePipeline.id });
		} else {
			this.dragLink.centerDragPos = "revertLink";
			this.ren.displayLinks();
		}

		this.logger.logEndTimer("dragLinkEnd", true);
	}
}
