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
import * as d3Selection from "d3-selection";
const d3 = Object.assign({}, d3Drag, d3Selection);

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import { SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING, LINK_SELECTION_DETACHABLE }
	from "./constants/canvas-constants.js";

// This utility files provides a drag handler which manages drag operations to move
// and resize nodes and comments.

export default class SVGCanvasUtilsDragObjects {
	constructor(renderer) {
		this.ren = renderer;

		this.logger = new Logger("SVGCanvasUtilsDragObjects");

		// Keeps track of the size and position, at the start of the sizing event,
		// of the object (node or comment) being sized.
		this.resizeObjInitialInfo = null;

		// Allows us to track the sizing behavior of comments
		this.commentSizing = false;
		this.commentSizingDirection = null;
		this.commentSizingCursor = "";

		// Allows us to track the sizing behavior of nodes
		this.nodeSizing = false;
		this.nodeSizingDirection = null;
		this.nodeSizingCursor = "";
		this.nodeSizingObjectsInfo = {};
		this.nodeSizingDetLinksInfo = {};

		// Keeps track of the size and position, during a sizing event, of the
		// object (node or comment) being sized, before it is snapped to grid.
		this.notSnappedXPos = 0;
		this.notSnappedYPos = 0;
		this.notSnappedWidth = 0;
		this.notSnappedHeight = 0;

		// Object to store variables for drag behavior or nodes and comments.
		this.draggingObjectData = null;

		// Flag to indicate if the current drag operation is for a node that can
		// be inserted into a link. Such a node would need input and output ports.
		this.existingNodeInsertableIntoLink = false;

		// Flag to indicate if the current drag operation is for a node that can
		// be attached to a detached link.
		this.existingNodeAttachableToDetachedLinks = false;

		// Create a drag handler for resizing and moving nodes and comments.
		this.dragObjectHandler = d3.drag()
			.on("start", this.dragStartObject.bind(this))
			.on("drag", this.dragObject.bind(this))
			.on("end", this.dragEndObject.bind(this));
	}

	// Returns the dragObjectsHandler
	getDragObjectHandler() {
		return this.dragObjectHandler;
	}

	// Returns true if a sizing operation is currently underway.
	isSizing() {
		return this.nodeSizing || this.commentSizing;
	}

	// Returns truthy if a moving operation is currently underway.
	isMoving() {
		return this.draggingObjectData;
	}

	mouseEnterNodeSizingArea(d3Event, d) {
		if (this.ren.config.enableEditingActions && // Only set cursor when we are able to resize nodes
				this.isNodeResizable(d) &&
				!this.ren.isRegionSelectOrSizingInProgress()) { // Don't switch sizing direction if we are already sizing
			let cursorType = "default";
			if (!this.isPointerCloseToBodyEdge(d3Event, d)) {
				this.nodeSizingDirection = this.getSizingDirection(d3Event, d, d.layout.nodeCornerResizeArea);
				this.nodeSizingCursor = this.getCursorBasedOnDirection(this.nodeSizingDirection);
				cursorType = this.nodeSizingCursor;
			}
			d3.select(d3Event.currentTarget).style("cursor", cursorType);
		}
	}

	mouseDownNodeSizingArea(d) {
		if (this.isNodeResizable(d)) {
			this.nodeSizing = true;
			// Note - node resizing and finalization of size is handled by drag functions.
			this.ren.addTempCursorOverlay(this.nodeSizingCursor);
		}
	}

	mouseLeaveNodeSizingArea(d3Event) {
		d3.select(d3Event.currentTarget).style("cursor", "default");
	}

	mouseEnterCommentSizingArea(d3Event, d) {
		if (this.ren.config.enableEditingActions && // Only set cursor when we are able to edit comments
			!this.ren.isRegionSelectOrSizingInProgress()) { // Don't switch sizing direction if we are already sizing
			let cursorType = "default";
			if (!this.isPointerCloseToBodyEdge(d3Event, d)) {
				this.commentSizingDirection = this.getSizingDirection(d3Event, d, this.ren.canvasLayout.commentCornerResizeArea);
				this.commentSizingCursor = this.getCursorBasedOnDirection(this.commentSizingDirection);
				cursorType = this.commentSizingCursor;
			}
			d3.select(d3Event.currentTarget).style("cursor", cursorType);
		}
	}

	mouseDownCommentSizingArea() {
		// Note - comment resizing and finalization of size is handled by drag functions.
		this.commentSizing = true;
		this.ren.addTempCursorOverlay(this.commentSizingCursor);
	}

	mouseLeaveCommentSizingArea(d3Event) {
		d3.select(d3Event.currentTarget).style("cursor", "default");
	}

	dragStartObject(d3Event, d) {
		this.logger.logStartTimer("dragStartObject");

		this.ren.closeContextMenuIfOpen();

		if (this.commentSizing) {
			this.initializeResizeVariables(d);

		} else if (this.nodeSizing) {
			this.initializeResizeVariables(d);

		} else {
			this.dragObjectsStart(d3Event, d);
		}

		this.logger.logEndTimer("dragStartObject", true);
	}

	dragObject(d3Event, d) {
		this.logger.logStartTimer("dragObject");
		if (this.commentSizing) {
			this.resizeComment(d3Event, d);

		} else if (this.nodeSizing) {
			this.resizeNode(d3Event, d);

		} else {
			this.dragObjectsAction(d3Event);
		}

		this.logger.logEndTimer("dragObject", true);
	}

	dragEndObject(d3Event, d) {
		this.logger.logStartTimer("dragEndObject");

		this.ren.removeTempCursorOverlay();

		if (this.commentSizing) {
			this.endCommentSizing(d);
			this.commentSizing = false;

		} else if (this.nodeSizing) {
			this.endNodeSizing(d);
			this.nodeSizing = false;

		} else {
			this.dragObjectsEnd(d3Event, d);
		}

		this.logger.logEndTimer("dragEndObject", true);
	}

	// Records the initial starting position of the object being sized so
	// that drag increments can be added to the original starting
	// position to aid calculating the snap-to-grid position.
	initializeResizeVariables(resizeObj) {
		this.resizeObjInitialInfo = {
			x_pos: resizeObj.x_pos, y_pos: resizeObj.y_pos, width: resizeObj.width, height: resizeObj.height };
		this.notSnappedXPos = resizeObj.x_pos;
		this.notSnappedYPos = resizeObj.y_pos;
		this.notSnappedWidth = resizeObj.width;
		this.notSnappedHeight = resizeObj.height;
	}

	// This method allows us to avoid a strange behavior which only appears in the
	// Chrome browser. That is, when the mouse pointer is inside the
	// node/comment selection highlight area but is close to either the
	// right or bottom side of the node/comment body, any mousedown events will go
	// to the body instead of the highlight area. We use this method to detect
	// this situation and use the result to decide whether to display the sizing
	// cursor or not.
	isPointerCloseToBodyEdge(d3Event, d) {
		const pos = this.ren.getTransformedMousePos(d3Event);
		const rightEdge = d.x_pos + d.width;
		const bottomEdge = d.y_pos + d.height;

		// Is the pointer within 1 pixel of the right edge of the node or comment
		const rightEdgeState =
			pos.x >= rightEdge && pos.x <= rightEdge + 1 &&
			pos.y >= 0 && pos.y <= bottomEdge;

		// Is the pointer within 1 pixel of the bottom edge of the node or comment
		const bottomEdgeState =
			pos.y >= bottomEdge && pos.y <= bottomEdge + 1 &&
			pos.x >= 0 && pos.x <= rightEdge;

		return rightEdgeState || bottomEdgeState;
	}

	// Returns the comment or supernode sizing direction (i.e. one of n, s, e, w, nw, ne,
	// sw or se) based on the current mouse position and the position and
	// dimensions of the comment or node outline.
	getSizingDirection(d3Event, d, cornerResizeArea) {
		var xPart = "";
		var yPart = "";

		const transPos = this.ren.getTransformedMousePos(d3Event);
		if (transPos.x < d.x_pos + cornerResizeArea) {
			xPart = "w";
		} else if (transPos.x > d.x_pos + d.width - cornerResizeArea) {
			xPart = "e";
		}
		if (transPos.y < d.y_pos + cornerResizeArea) {
			yPart = "n";
		} else if (transPos.y > d.y_pos + d.height - cornerResizeArea) {
			yPart = "s";
		}

		return yPart + xPart;
	}

	// Returns a cursor type based on the currect comment sizing direction.
	// Possible values are: ns-resize, ew-resize, nwse-resize or nesw-resize.
	getCursorBasedOnDirection(direction) {
		var cursorType;
		switch (direction) {
		case "n":
		case "s":
			cursorType = "ns-resize";
			break;
		case "e":
		case "w":
			cursorType = "ew-resize";
			break;
		case "nw":
		case "se":
			cursorType = "nwse-resize";
			break;
		case "ne":
		case "sw":
			cursorType = "nesw-resize";
			break;
		default:
			cursorType = "";
		}

		return cursorType;
	}

	// Returns true if the node should be resizeable. Expanded supernodes are
	// always resizabele and all other nodes, except collapsed supernodes, are
	// resizeable when enableResizableNodes is switched on.
	isNodeResizable(node) {
		if (!this.ren.config.enableEditingActions ||
				CanvasUtils.isSuperBindingNode(node) ||
				CanvasUtils.isCollapsedSupernode(node) ||
				(!this.ren.config.enableResizableNodes && !CanvasUtils.isExpandedSupernode(node))) {
			return false;
		}
		return true;
	}

	// Sets the size and position of the node in the canvasInfo.nodes
	// array based on the position of the pointer during the resize action
	// then redraws the nodes and links (the link positions may move based
	// on the node size change).
	resizeNode(d3Event, resizeObj) {
		const oldSupernode = Object.assign({}, resizeObj);
		const minHeight = this.getMinHeight(resizeObj);
		const minWidth = this.getMinWidth(resizeObj);

		const delta = this.resizeObject(d3Event, resizeObj,
			this.nodeSizingDirection, minWidth, minHeight);

		if (delta && (delta.x_pos !== 0 || delta.y_pos !== 0 || delta.width !== 0 || delta.height !== 0)) {
			if (CanvasUtils.isSupernode(resizeObj) &&
					this.ren.config.enableMoveNodesOnSupernodeResize) {
				const objectsInfo = CanvasUtils.moveSurroundingObjects(
					oldSupernode,
					this.ren.activePipeline.getNodesAndComments(),
					this.nodeSizingDirection,
					resizeObj.width,
					resizeObj.height,
					true // Pass true to indicate that object positions should be updated.
				);

				const linksInfo = CanvasUtils.moveSurroundingDetachedLinks(
					oldSupernode,
					this.ren.activePipeline.links,
					this.nodeSizingDirection,
					resizeObj.width,
					resizeObj.height,
					true // Pass true to indicate that link positions should be updated.
				);

				// Overwrite the object and link info with any new info.
				this.nodeSizingObjectsInfo = Object.assign(this.nodeSizingObjectsInfo, objectsInfo);
				this.nodeSizingDetLinksInfo = Object.assign(this.nodeSizingDetLinksInfo, linksInfo);
			}

			this.logger.logStartTimer("displayObjects");

			this.ren.displayMovedComments();
			this.ren.displayMovedNodes();
			this.ren.displaySingleNode(resizeObj);
			this.ren.displayMovedLinks();
			this.ren.displayCanvasAccoutrements();

			if (CanvasUtils.isSupernode(resizeObj)) {
				if (this.ren.dispUtils.isDisplayingSubFlow()) {
					this.ren.displayBindingNodesToFitSVG();
				}
				this.ren.superRenderers.forEach((renderer) => renderer.displaySVGToFitSupernode());
			}
			this.logger.logEndTimer("displayObjects");
		}
	}

	// Sets the size and position of the comment in the canvasInfo.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and links (the link positions may move based
	// on the comment size change).
	resizeComment(d3Event, resizeObj) {
		this.resizeObject(d3Event, resizeObj, this.commentSizingDirection, 20, 20);
		this.ren.displaySingleComment(resizeObj);
		this.ren.displayMovedLinks();
		this.ren.displayCanvasAccoutrements();
	}

	// Sets the size and position of the object in the canvasInfo
	// array based on the position of the pointer during the resize action.
	resizeObject(d3Event, canvasObj, direction, minWidth, minHeight) {
		let incrementX = 0;
		let incrementY = 0;
		let incrementWidth = 0;
		let incrementHeight = 0;

		if (direction.indexOf("e") > -1) {
			incrementWidth += d3Event.dx;
		}
		if (direction.indexOf("s") > -1) {
			incrementHeight += d3Event.dy;
		}
		if (direction.indexOf("n") > -1) {
			incrementY += d3Event.dy;
			incrementHeight -= d3Event.dy;
		}
		if (direction.indexOf("w") > -1) {
			incrementX += d3Event.dx;
			incrementWidth -= d3Event.dx;
		}

		let xPos = 0;
		let yPos = 0;
		let width = 0;
		let height = 0;

		if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_DURING) {
			// Calculate where the object being resized would be and its size given
			// current increments.
			this.notSnappedXPos += incrementX;
			this.notSnappedYPos += incrementY;
			this.notSnappedWidth += incrementWidth;
			this.notSnappedHeight += incrementHeight;

			xPos = CanvasUtils.snapToGrid(this.notSnappedXPos, this.ren.canvasLayout.snapToGridXPx);
			yPos = CanvasUtils.snapToGrid(this.notSnappedYPos, this.ren.canvasLayout.snapToGridYPx);
			width = CanvasUtils.snapToGrid(this.notSnappedWidth, this.ren.canvasLayout.snapToGridXPx);
			height = CanvasUtils.snapToGrid(this.notSnappedHeight, this.ren.canvasLayout.snapToGridYPx);

			width = Math.max(width, minWidth);
			height = Math.max(height, minHeight);

		} else {
			xPos = canvasObj.x_pos + incrementX;
			yPos = canvasObj.y_pos + incrementY;
			width = canvasObj.width + incrementWidth;
			height = canvasObj.height + incrementHeight;
		}

		// Don't allow the object area to shrink below the min width and height.
		// For comment sizing, errors may occur especially if the width becomes
		// less that one character's width. For node sizing we want at least some
		// area to display the sub-flow.
		if (width < minWidth || height < minHeight) {
			return null;
		}

		const delta = {
			width: width - canvasObj.width,
			height: height - canvasObj.height,
			x_pos: xPos - canvasObj.x_pos,
			y_pos: yPos - canvasObj.y_pos
		};

		canvasObj.x_pos = xPos;
		canvasObj.y_pos = yPos;
		canvasObj.width = width;
		canvasObj.height = height;

		return delta;
	}

	// Finalises the sizing of a node by calling editActionHandler
	// with an editNode action.
	endNodeSizing(node) {
		let resizeObj = node;
		if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			resizeObj = this.snapToGridObject(resizeObj);
			resizeObj = this.restrictNodeSizingToMinimums(resizeObj);
		}

		// If the dimensions or position has changed, issue the "resizeObjects" command.
		// Note: x_pos or y_pos might change on resize if the node is sized
		// upwards or to the left.
		if (this.resizeObjInitialInfo.x_pos !== resizeObj.x_pos ||
				this.resizeObjInitialInfo.y_pos !== resizeObj.y_pos ||
				this.resizeObjInitialInfo.width !== resizeObj.width ||
				this.resizeObjInitialInfo.height !== resizeObj.height) {
			// Add the dimensions of the object being resized to the array of object infos.
			this.nodeSizingObjectsInfo[resizeObj.id] = {
				width: resizeObj.width,
				height: resizeObj.height,
				x_pos: resizeObj.x_pos,
				y_pos: resizeObj.y_pos
			};

			// If the node has been resized set the resize properties appropriately.
			// We use some padding because sometimes, when a node is sized back to its
			// original dimensions, it isn't retunred to EXACTLY its default width/height.
			if (resizeObj.height > resizeObj.layout.defaultNodeHeight + 2 ||
					resizeObj.width > resizeObj.layout.defaultNodeWidth + 2) {
				this.nodeSizingObjectsInfo[resizeObj.id].isResized = true;
				this.nodeSizingObjectsInfo[resizeObj.id].resizeWidth = resizeObj.width;
				this.nodeSizingObjectsInfo[resizeObj.id].resizeHeight = resizeObj.height;
			}

			this.ren.canvasController.editActionHandler({
				editType: "resizeObjects",
				editSource: "canvas",
				objectsInfo: this.nodeSizingObjectsInfo,
				detachedLinksInfo: this.nodeSizingDetLinksInfo,
				pipelineId: this.ren.activePipeline.id
			});

			// Clear the objects ready for next sizing action.
			this.nodeSizingObjectsInfo = {};
		}
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing(comment) {
		let resizeObj = comment;
		if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			resizeObj = this.snapToGridObject(resizeObj);
		}

		// If the dimensions or position has changed, issue the command.
		// Note: x_pos or y_pos might change on resize if the node is sized
		// upwards or to the left.
		if (this.resizeObjInitialInfo.x_pos !== resizeObj.x_pos ||
				this.resizeObjInitialInfo.y_pos !== resizeObj.y_pos ||
				this.resizeObjInitialInfo.width !== resizeObj.width ||
				this.resizeObjInitialInfo.height !== resizeObj.height) {
			const commentSizingObjectsInfo = [];
			commentSizingObjectsInfo[resizeObj.id] = {
				width: resizeObj.width,
				height: resizeObj.height,
				x_pos: resizeObj.x_pos,
				y_pos: resizeObj.y_pos
			};

			const data = {
				editType: "resizeObjects",
				editSource: "canvas",
				objectsInfo: commentSizingObjectsInfo,
				detachedLinksInfo: {}, // Comments cannot have detached links
				pipelineId: this.ren.activePipeline.id
			};
			this.ren.canvasController.editActionHandler(data);
		}
	}

	// Ensure the snap-to-grid does not make the width or height smaller than
	// the minimums allowed.
	restrictNodeSizingToMinimums(resizeObj) {
		const minHeight = this.getMinHeight(resizeObj);
		const minWidth = this.getMinWidth(resizeObj);
		resizeObj.width = Math.max(resizeObj.width, minWidth);
		resizeObj.height = Math.max(resizeObj.height, minHeight);
		return resizeObj;
	}

	// Returns the minimum allowed height for the node passed in. For supernodes
	// this means combining the bigger of the space for the inputs and output ports
	// with some space for the top of the display frame and the padding at the
	// bottom of the frame. Then the bigger of that height versus the default
	// supernode minimum height is retunred.
	getMinHeight(node) {
		if (CanvasUtils.isSupernode(node)) {
			const minHt = Math.max(node.inputPortsHeight, node.outputPortsHeight) +
				this.ren.canvasLayout.supernodeTopAreaHeight + this.ren.canvasLayout.supernodeSVGAreaPadding;
			return Math.max(this.ren.canvasLayout.supernodeMinHeight, minHt);
		}
		return node.layout.defaultNodeHeight;
	}

	// Returns the minimum allowed width for the node passed in.
	getMinWidth(node) {
		if (CanvasUtils.isSupernode(node)) {
			return this.ren.canvasLayout.supernodeMinWidth;
		}
		return node.layout.defaultNodeWidth;
	}

	// Starts the dragging action for canvas objects (nodes and comments).
	dragObjectsStart(d3Event, d) {
		// Ensure flags are false before staring a new drag.
		this.existingNodeInsertableIntoLink = false;
		this.existingNodeAttachableToDetachedLinks = false;

		this.draggingObjectData = {
			dragOffsetX: 0,
			dragOffsetY: 0,
			dragRunningX: 0,
			dragRunningY: 0,
			dragObjects: this.getDragObjects(d)
		};

		if (this.draggingObjectData.dragObjects?.length > 0) {
			this.draggingObjectData.dragStartX = this.draggingObjectData.dragObjects[0].x_pos;
			this.draggingObjectData.dragStartY = this.draggingObjectData.dragObjects[0].y_pos;
		}

		// If we are dragging an 'insertable' node, set it to be translucent so
		// that, when it is dragged over a link line, the highlightd line can be seen OK.
		if (this.isExistingNodeInsertableIntoLink()) {
			// Only style the node to be translucent if this action isn't cancelled
			// by the user releasing the mouse button within 200 ms of pressing it.
			// This stops the node flashing when the user is only selecting it.
			this.startNodeInsertingInLink = setTimeout(() => {
				this.existingNodeInsertableIntoLink = true;
				this.setNodeTranslucentState(this.draggingObjectData.dragObjects[0].id, true);
				this.ren.setDataLinkSelectionAreaWider(true);
			}, 200);
		}

		// If we are dragging an 'attachable' node, set it to be translucent so
		// that, when it is dragged over link lines, the highlightd lines can be seen OK.
		if (this.isExistingNodeAttachableToDetachedLinks()) {
			// Only style the node to be translucent if this action isn't cancelled
			// by the user releasing the mouse button within 200 ms of pressing it.
			// This stops the node from being made translucent when the user is only selecting it.
			this.startNodeAttachingToDetachedLinks = setTimeout(() => {
				this.existingNodeAttachableToDetachedLinks = true;
				this.setNodeTranslucentState(this.draggingObjectData.dragObjects[0].id, true);
			}, 200);
		}
	}

	// Performs the dragging action for canvas objects (nodes and comments).
	dragObjectsAction(d3Event) {
		this.draggingObjectData.dragOffsetX += d3Event.dx;
		this.draggingObjectData.dragOffsetY += d3Event.dy;

		// Limit the size a drag can be so, when the user is dragging objects in
		// an in-place subflow they do not drag them too far.
		// this.logger.log("Drag offset X = " + this.dragOffsetX + " y = " + this.draggingObjectData.dragOffsetY);
		if (this.ren.dispUtils.isDisplayingSubFlowInPlace() &&
				(this.draggingObjectData.dragOffsetX > 1000 || this.draggingObjectData.dragOffsetX < -1000 ||
					this.draggingObjectData.dragOffsetY > 1000 || this.draggingObjectData.dragOffsetY < -1000)) {
			this.draggingObjectData.dragOffsetX -= d3Event.dx;
			this.draggingObjectData.dragOffsetY -= d3Event.dy;

		} else {
			let	increment = { x: 0, y: 0 };

			if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_DURING) {
				const stgPos = this.snapToGridDraggedNode(this.draggingObjectData);

				increment = {
					x: stgPos.x - this.draggingObjectData.dragObjects[0].x_pos,
					y: stgPos.y - this.draggingObjectData.dragObjects[0].y_pos
				};

			} else {
				increment = {
					x: d3Event.dx,
					y: d3Event.dy
				};
			}

			this.draggingObjectData.dragRunningX += increment.x;
			this.draggingObjectData.dragRunningY += increment.y;

			this.draggingObjectData.dragObjects.forEach((d) => {
				d.x_pos += increment.x;
				d.y_pos += increment.y;
			});

			if (this.ren.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
				this.ren.activePipeline.getSelectedLinks().forEach((link) => {
					if (link.srcPos) {
						link.srcPos.x_pos += increment.x;
						link.srcPos.y_pos += increment.y;
					}
					if (link.trgPos) {
						link.trgPos.x_pos += increment.x;
						link.trgPos.y_pos += increment.y;
					}
				});
			}
		}

		this.ren.displayMovedComments();
		this.ren.displayMovedNodes();
		this.ren.displayMovedLinks();
		this.ren.displayCanvasAccoutrements();

		if (this.ren.dispUtils.isDisplayingSubFlowInPlace()) {
			this.ren.displaySVGToFitSupernode();
		}


		if (this.existingNodeInsertableIntoLink) {
			const link = this.ren.getLinkAtMousePos(d3Event.sourceEvent.clientX, d3Event.sourceEvent.clientY);
			// Set highlighting when there is no link because this will turn
			// current highlighting off. And only switch on highlighting when we are
			// over a fully attached link (not a detached link) and provided the
			// link is not to/from the node being dragged (which is possible in
			// some odd situations).
			if (!link ||
					(this.ren.isLinkFullyAttached(link) &&
						this.draggingObjectData.dragObjects[0].id !== link.srcNodeId &&
						this.draggingObjectData.dragObjects[0].id !== link.trgNodeId)) {
				this.ren.setInsertNodeIntoLinkHighlighting(link);
			}
		}

		if (this.existingNodeAttachableToDetachedLinks) {
			// const mousePos = this.ren.getTransformedMousePos(d3Event);
			const node = this.draggingObjectData.dragObjects[0];
			const ghostArea = {
				x1: node.x_pos,
				y1: node.y_pos,
				x2: node.x_pos + node.width,
				y2: node.y_pos + node.height
			};
			const links = this.ren.getAttachableLinksForNodeAtPos(node, ghostArea);
			this.ren.setDetachedLinkHighlighting(links);
		}
	}

	// Ends the dragging action for canvas objects (nodes and comments).
	dragObjectsEnd(d3Event, d) {
		// Save a local reference to this.draggingObjectData so we can set it to null before
		// calling the canvas-controller. This means the this.draggingObjectData object will
		// be null when the canvas is refreshed.
		const draggingObjectData = this.draggingObjectData;
		this.draggingObjectData = null;

		// Cancels the styling of insertable/attachable nodes if the user releases
		// the mouse button with 200 milliseconds of pressing it on the node. This
		// stops the node flashing when the user just selects the node.
		clearTimeout(this.startNodeInsertingInLink);
		clearTimeout(this.startNodeAttachingToDetachedLinks);

		// If the pointer hasn't moved and enableDragWithoutSelect is enabled we interpret
		// that as a select on the object.
		if (draggingObjectData.dragOffsetX === 0 &&
				draggingObjectData.dragOffsetY === 0 &&
				this.ren.config.enableDragWithoutSelect) {
			this.ren.selectObjectSourceEvent(d3Event, d);

		} else {
			if (draggingObjectData.dragRunningX !== 0 ||
				draggingObjectData.dragRunningY !== 0) {
				let dragFinalOffset = null;
				if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
					const stgPos = this.snapToGridDraggedNode(draggingObjectData);
					dragFinalOffset = {
						x: stgPos.x - draggingObjectData.dragStartX,
						y: stgPos.y - draggingObjectData.dragStartY
					};
				} else {
					dragFinalOffset = { x: draggingObjectData.dragRunningX, y: draggingObjectData.dragRunningY };
				}

				if (this.existingNodeInsertableIntoLink &&
						this.ren.dragOverLink) {
					this.ren.canvasController.editActionHandler({
						editType: "insertNodeIntoLink",
						editSource: "canvas",
						node: draggingObjectData.dragObjects[0],
						link: this.ren.dragOverLink,
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.ren.activePipeline.id });

				} else if (this.existingNodeAttachableToDetachedLinks &&
							this.ren.dragOverDetachedLinks.length > 0) {
					this.ren.canvasController.editActionHandler({
						editType: "attachNodeToLinks",
						editSource: "canvas",
						node: draggingObjectData.dragObjects[0],
						detachedLinks: this.ren.dragOverDetachedLinks,
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.ren.activePipeline.id });

				} else {
					this.ren.canvasController.editActionHandler({
						editType: "moveObjects",
						editSource: "canvas",
						nodes: draggingObjectData.dragObjects.map((o) => o.id),
						links: this.ren.activePipeline.getSelectedDetachedLinks(),
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.ren.activePipeline.id });
				}
			}
		}

		// Switch off any drag highlighting
		this.ren.setDataLinkSelectionAreaWider(false);
		this.unsetNodeTranslucentState(draggingObjectData.dragObjects);
		this.ren.unsetInsertNodeIntoLinkHighlighting();
		this.ren.unsetDetachedLinkHighlighting();
	}

	// Returns an array of objects to drag. If enableDragWithoutSelect is true,
	// and the object on which this drag start has initiated is not in the
	// set of selected objects, then just that object is to be dragged. Otherwise,
	// the selected objects are the objects to be dragged.
	getDragObjects(d) {
		const selectedObjects = this.ren.activePipeline.getSelectedNodesAndComments();

		if (this.ren.config.enableDragWithoutSelect &&
				selectedObjects.findIndex((o) => o.id === d.id) === -1) {
			return [d];
		}

		return selectedObjects;
	}

	// Returns true if the current drag objects array has a single node which
	// is 'insertable' into a data link between nodes on the canvas.  Returns
	// false otherwise, including if a single comment is being dragged.
	isExistingNodeInsertableIntoLink() {
		return (this.ren.config.enableInsertNodeDroppedOnLink &&
			this.draggingObjectData.dragObjects.length === 1 &&
			CanvasUtils.isNode(this.draggingObjectData.dragObjects[0]) &&
			CanvasUtils.hasInputAndOutputPorts(this.draggingObjectData.dragObjects[0]) &&
			!CanvasUtils.isNodeDefaultPortsCardinalityAtMax(this.draggingObjectData.dragObjects[0], this.ren.activePipeline.links));
	}

	// Returns true if the current drag objects array has a single node which
	// is 'attachable' to any detached link on the canvas. Returns false otherwise,
	// including if a single comment is being dragged.
	isExistingNodeAttachableToDetachedLinks() {
		return (this.ren.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
			this.draggingObjectData.dragObjects.length === 1 &&
			CanvasUtils.isNode(this.draggingObjectData.dragObjects[0]));
	}

	// Switches on or off the translucent state of the node identified by the
	// node ID passed in. This is used when an 'insertable' node is dragged on
	// the canvas. It makes is easier for the user to see the highlighted link
	// when the node is dragged over it.
	setNodeTranslucentState(nodeId, state) {
		this.ren.getNodeGroupSelectionById(nodeId).classed("d3-node-group-translucent", state);
	}

	// Switched off the translucent state of the objects being dragged (if
	// there are any).
	unsetNodeTranslucentState(dragObjects) {
		if (dragObjects?.length > 0) {
			this.setNodeTranslucentState(dragObjects[0].id, false);
		}
	}

	// Returns the snap-to-grid position of the object positioned at
	// this.draggingObjectData.dragStartX and this.draggingObjectData.dragStartY after applying the current offset of
	// this.draggingObjectData.dragOffsetX and this.draggingObjectData.dragOffsetY.
	snapToGridDraggedNode(draggingObjectData) {
		const objPosX = draggingObjectData.dragStartX + draggingObjectData.dragOffsetX;
		const objPosY = draggingObjectData.dragStartY + draggingObjectData.dragOffsetY;

		return this.ren.snapToGridPosition({ x: objPosX, y: objPosY });
	}

	// Returns the object passed in with its position and size snapped to
	// the current grid dimensions. Used when the object is being resized.
	snapToGridObject(inResizeObj) {
		const resizeObj = inResizeObj;
		resizeObj.x_pos = CanvasUtils.snapToGrid(resizeObj.x_pos, this.ren.canvasLayout.snapToGridXPx);
		resizeObj.y_pos = CanvasUtils.snapToGrid(resizeObj.y_pos, this.ren.canvasLayout.snapToGridYPx);
		resizeObj.width = CanvasUtils.snapToGrid(resizeObj.width, this.ren.canvasLayout.snapToGridXPx);
		resizeObj.height = CanvasUtils.snapToGrid(resizeObj.height, this.ren.canvasLayout.snapToGridYPx);
		return resizeObj;
	}
}
