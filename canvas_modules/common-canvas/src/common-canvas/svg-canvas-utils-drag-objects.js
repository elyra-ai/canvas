/*
 * Copyright 2017-2025 Elyra Authors
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
import KeyboardUtils from "./keyboard-utils.js";
import CanvasUtils from "./common-canvas-utils.js";
import { SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING, LINK_SELECTION_DETACHABLE,
	NORTH, SOUTH, EAST, WEST,
	SINGLE_CLICK }
	from "./constants/canvas-constants.js";

// This utility files provides a drag handler which manages drag operations to move
// and resize nodes and comments. Also, it provides utility functions to handle
// those same operations performed by the keyboard user.

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

		// Object to store variables for move behavior or nodes and comments.
		this.movingObjectData = null;

		// Flag to indicate if the current move operation is for a node that can
		// be inserted into a link. Such a node would need input and output ports.
		this.existingNodeInsertableIntoLink = false;

		// Flag to indicate if the current move operation is for a node that can
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
		return this.movingObjectData;
	}

	mouseEnterNodeSizingArea(d3Event, d) {
		if (CanvasUtils.isNodeResizable(d, this.ren.config) &&
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
		if (CanvasUtils.isNodeResizable(d, this.ren.config)) {
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

	// Moves the object passed in (and any other selected objects) by the
	// x and y amounts provided. This is called when the user moves an
	// object using the keyboard.
	moveObject(d, dir) {
		if (!this.isObjectMovable(d)) {
			return;
		}

		let xInc = 0;
		let yInc = 0;

		({ xInc, yInc } = this.getMoveIncrements(dir));

		if (this.endMove) {
			clearTimeout(this.endMove);
			this.endMove = null;
		}

		if (!this.isMoving()) {
			this.startObjectsMoving(d);
		}

		const x = d.x_pos + (d.width / 2);
		const y = d.y_pos + (d.height / 2);
		const pagePos = this.ren.convertCanvasCoordsToPageCoords(x, y);

		this.moveObjects(xInc, yInc, pagePos.x, pagePos.y);

		this.endMove = setTimeout(() => {
			this.endObjectsMoving(d, false, false);
		}, 500);
	}

	// Sizes the object passed in (either a node or comment) in the
	// direction specified. This is called when the user sizes an object
	//	using the keyboard.
	sizeObject(d, direction) {
		let xInc = 0;
		let yInc = 0;
		let dir = direction;

		({ xInc, yInc } = this.getMoveIncrements(dir));

		// When direction is NORTH this will cause the bottom border of
		// the object to be decrease and when the direction is WEST
		// the right brorder of the object will be decreased.
		if (dir === NORTH) {
			dir = SOUTH;
		} else if (dir === WEST) {
			dir = EAST;
		}

		if (this.endSize) {
			clearTimeout(this.endSize);
			this.endSize = null;
		}

		if (!this.isSizing()) {
			const objType = CanvasUtils.getObjectTypeName(d);
			if (objType === "node") {
				this.nodeSizing = true;
			} else {
				this.commentSizing = true;
			}
			this.initializeResizeVariables(d);
		}

		if (this.nodeSizing) {
			this.resizeNode(xInc, yInc, d, dir);

		} else if (this.commentSizing) {
			this.resizeComment(xInc, yInc, d, dir);
		}

		this.endSize = setTimeout(() => {
			if (this.nodeSizing) {
				this.endNodeSizing(d);
				this.nodeSizing = false;

			} else if (this.commentSizing) {
				this.endCommentSizing(d);
				this.commentSizing = false;
			}
		}, 500);
	}

	dragStartObject(d3Event, d) {
		this.logger.logStartTimer("dragStartObject");

		this.ren.closeContextMenuIfOpen();

		if (this.commentSizing) {
			this.initializeResizeVariables(d);

		} else if (this.nodeSizing) {
			this.initializeResizeVariables(d);

		} else {
			if (this.isObjectMovable(d)) {
				this.startObjectsMoving(d);
			}
		}

		this.logger.logEndTimer("dragStartObject", true);
	}

	dragObject(d3Event, d) {
		this.logger.logStartTimer("dragObject");
		if (this.commentSizing) {
			this.resizeComment(d3Event.dx, d3Event.dy, d, this.commentSizingDirection);

		} else if (this.nodeSizing) {
			this.resizeNode(d3Event.dx, d3Event.dy, d, this.nodeSizingDirection);

		} else {
			if (this.isObjectMovable(d)) {
				this.moveObjects(d3Event.dx, d3Event.dy, d3Event.sourceEvent.clientX, d3Event.sourceEvent.clientY);
			}
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
			if (this.isObjectMovable(d)) {
				this.endObjectsMoving(d, d3Event.sourceEvent.shiftKey, KeyboardUtils.isMetaKey(d3Event.sourceEvent));
			}
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

	// Sets the size and position of the node in the canvasInfo.nodes
	// array based on the position of the pointer during the resize action
	// then redraws the nodes and links (the link positions may move based
	// on the node size change).
	resizeNode(dx, dy, resizeObj, dir) {
		const oldSupernode = Object.assign({}, resizeObj);
		const minHeight = this.getMinHeight(resizeObj);
		const minWidth = this.getMinWidth(resizeObj);

		const delta = this.resizeObject(dx, dy, resizeObj, dir, minWidth, minHeight);

		if (delta && (delta.x_pos !== 0 || delta.y_pos !== 0 || delta.width !== 0 || delta.height !== 0)) {
			if (CanvasUtils.isExpandedSupernode(resizeObj) &&
					this.ren.config.enableMoveNodesOnSupernodeResize) {
				const objectsInfo = CanvasUtils.moveSurroundingObjects(
					oldSupernode,
					this.ren.activePipeline.getNodesAndComments(),
					dir,
					resizeObj.width,
					resizeObj.height,
					true // Pass true to indicate that object positions should be updated.
				);

				const linksInfo = CanvasUtils.moveSurroundingDetachedLinks(
					oldSupernode,
					this.ren.activePipeline.links,
					dir,
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

			if (CanvasUtils.isExpandedSupernode(resizeObj)) {
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
	resizeComment(dx, dy, resizeObj, dir) {
		this.resizeObject(dx, dy, resizeObj, dir, 20, 20);
		this.ren.displaySingleComment(resizeObj);
		this.ren.displayMovedLinks();
		this.ren.displayCanvasAccoutrements();
	}

	// Sets the size and position of the object in the canvasInfo
	// array based on the position of the pointer during the resize action.
	resizeObject(dx, dy, canvasObj, direction, minWidth, minHeight) {
		let incrementX = 0;
		let incrementY = 0;
		let incrementWidth = 0;
		let incrementHeight = 0;

		if (direction.indexOf("e") > -1) {
			incrementWidth += dx;
		}
		if (direction.indexOf("s") > -1) {
			incrementHeight += dy;
		}
		if (direction.indexOf("n") > -1) {
			incrementY += dy;
			incrementHeight -= dy;
		}
		if (direction.indexOf("w") > -1) {
			incrementX += dx;
			incrementWidth -= dx;
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
		if (CanvasUtils.isExpandedSupernode(node)) {
			const minHt = Math.max(node.inputPortsHeight, node.outputPortsHeight) +
				this.ren.canvasLayout.supernodeTopAreaHeight + this.ren.canvasLayout.supernodeSVGAreaPadding;
			return Math.max(this.ren.canvasLayout.supernodeMinHeight, minHt);
		}
		return node.layout.defaultNodeHeight;
	}

	// Returns the minimum allowed width for the node passed in.
	getMinWidth(node) {
		if (CanvasUtils.isExpandedSupernode(node)) {
			return this.ren.canvasLayout.supernodeMinWidth;
		}
		return node.layout.defaultNodeWidth;
	}

	// Starts the moving action for canvas objects (nodes and comments).
	// Can be called when the mouse is dragging the object OR when a
	// keyboard event moves the object.
	startObjectsMoving(d) {
		// Ensure flags are false before staring a new move operation.
		this.existingNodeInsertableIntoLink = false;
		this.existingNodeAttachableToDetachedLinks = false;

		this.movingObjectData = {
			offsetX: 0,
			offsetY: 0,
			runningX: 0,
			runningY: 0,
			objects: this.getMoveObjects(d).filter((obj) => this.isObjectMovable(obj))
		};

		if (this.movingObjectData.objects?.length > 0) {
			this.movingObjectData.startX = this.movingObjectData.objects[0].x_pos;
			this.movingObjectData.startY = this.movingObjectData.objects[0].y_pos;

			// Apply the 'd3-is-moving' class to the objects being moved.
			this.switchIsMovingClass(this.movingObjectData.objects, true);
		}

		// If we are moving an 'insertable' node, set it to be translucent so
		// that, when it is moved over a link line, the highlighted line can be seen OK.
		if (this.isExistingNodeInsertableIntoLink()) {
			// Only style the node to be translucent if this action isn't cancelled
			// by the user releasing the mouse button within 200 ms of pressing it.
			// This stops the node flashing when the user is only selecting it.
			this.startNodeInsertingInLink = setTimeout(() => {
				this.existingNodeInsertableIntoLink = true;
				this.setNodeTranslucentState(this.movingObjectData.objects[0].id, true);
				this.ren.setDataLinkSelectionAreaWider(true);
			}, 200);
		}

		// If we are moving an 'attachable' node, set it to be translucent so
		// that, when it is moved over link lines, the highlighted lines can be seen OK.
		if (this.isExistingNodeAttachableToDetachedLinks()) {
			// Only style the node to be translucent if this action isn't cancelled
			// by the user releasing the mouse button within 200 ms of pressing it.
			// This stops the node from being made translucent when the user is only selecting it.
			this.startNodeAttachingToDetachedLinks = setTimeout(() => {
				this.existingNodeAttachableToDetachedLinks = true;
				this.setNodeTranslucentState(this.movingObjectData.objects[0].id, true);
			}, 200);
		}
	}

	// Performs the moving action for canvas objects (nodes and comments).
	// This occurs either as the user is moving the mouse pointer OR each time the user
	// presses a key on the keyboard, within the timeout value, to move the object.
	// The dx and dy parameters are the amount to move the object in the x and y directions.
	// The pagePosX and pagePosY parameters are the current page coordinates of either
	// the mouse in the context of a drag operation OR the current page coordinates of the
	// center of the object in the context of a keyboard operation.
	moveObjects(dx, dy, pagePosX, pagePosY) {
		this.movingObjectData.offsetX += dx;
		this.movingObjectData.offsetY += dy;

		// Limit the size a move (typically a drag) can be so, when the user
		// is dragging objects in an in-place subflow they do not drag them too far.
		// this.logger.log("Move offset x = " + this.movingObjectData.offsetX + " y = " + this.movingObjectData.offsetY);
		if (this.ren.dispUtils.isDisplayingSubFlowInPlace() &&
				(this.movingObjectData.offsetX > 1000 || this.movingObjectData.offsetX < -1000 ||
					this.movingObjectData.offsetY > 1000 || this.movingObjectData.offsetY < -1000)) {
			this.movingObjectData.offsetX -= dx;
			this.movingObjectData.offsetY -= dy;

		} else {
			let	increment = { x: 0, y: 0 };

			if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_DURING) {
				const stgPos = this.snapToGridMovedNode(this.movingObjectData);

				increment = {
					x: stgPos.x - this.movingObjectData.objects[0].x_pos,
					y: stgPos.y - this.movingObjectData.objects[0].y_pos
				};

			} else {
				increment = {
					x: dx,
					y: dy
				};
			}

			this.movingObjectData.runningX += increment.x;
			this.movingObjectData.runningY += increment.y;

			this.movingObjectData.objects.forEach((d) => {
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

		// If enableDragWithoutSelect is enabled and the mouse pointer
		// hasn't moved very much, we don't move the objects.
		if (this.ren.config.enableDragWithoutSelect &&
			CanvasUtils.isTinyMovement({ x: 0, y: 0 }, { x: this.movingObjectData.offsetX, y: this.movingObjectData.offsetY })) {
			return;
		}

		this.ren.displayMovedComments();
		this.ren.displayMovedNodes();
		this.ren.displayMovedLinks();
		this.ren.displayCanvasAccoutrements();

		if (this.ren.dispUtils.isDisplayingSubFlowInPlace()) {
			this.ren.displaySVGToFitSupernode();
		}

		if (this.existingNodeInsertableIntoLink) {
			const link = this.ren.getLinkAtMousePos(pagePosX, pagePosY);
			// Set highlighting when there is no link because this will turn
			// current highlighting off. And only switch on highlighting when we are
			// over a fully attached link (not a detached link) and provided the
			// link is not to/from the node being moved (which is possible in
			// some odd situations).
			if (!link ||
					(this.ren.isLinkFullyAttached(link) &&
						this.movingObjectData.objects[0].id !== link.srcNodeId &&
						this.movingObjectData.objects[0].id !== link.trgNodeId)) {
				this.ren.setInsertNodeIntoLinkHighlighting(link);
			}
		}

		if (this.existingNodeAttachableToDetachedLinks) {
			const node = this.movingObjectData.objects[0];
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

	// Ends the moving action for canvas objects (nodes and comments).
	// This happens either when the user releases the mouse button when
	// dragging OR when the timeout value has expired when moving the
	// object using the keyboard.
	endObjectsMoving(d, range, augment) {

		// Save a local reference to this.movingObjectData so we can set it to null before
		// calling the canvas-controller. This means the this.movingObjectData object will
		// be null when the canvas is refreshed.
		const movingObjectData = this.movingObjectData;
		this.movingObjectData = null;

		// Cancels the styling of insertable/attachable nodes if the user releases
		// the mouse button with 200 milliseconds of pressing it on the node. This
		// stops the node flashing when the user just selects the node.
		clearTimeout(this.startNodeInsertingInLink);
		clearTimeout(this.startNodeAttachingToDetachedLinks);

		// Remove the 'd3-is-moving' class from the objects being moved.
		this.switchIsMovingClass(movingObjectData.objects, false);

		// If enableDragWithoutSelect is enabled and the pointer hasn't moved
		// very much, we interpret that as a select on the object.
		if (this.ren.config.enableDragWithoutSelect &&
				CanvasUtils.isTinyMovement({ x: 0, y: 0 }, { x: movingObjectData.offsetX, y: movingObjectData.offsetY })) {
			this.ren.selectObject(d, SINGLE_CLICK, range, augment);

		} else {
			if (movingObjectData.runningX !== 0 ||
				movingObjectData.runningY !== 0) {
				let finalOffset = null;
				if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
					const stgPos = this.snapToGridMovedNode(movingObjectData);
					finalOffset = {
						x: stgPos.x - movingObjectData.startX,
						y: stgPos.y - movingObjectData.startY
					};
				} else {
					finalOffset = { x: movingObjectData.runningX, y: movingObjectData.runningY };
				}

				if (this.existingNodeInsertableIntoLink &&
						this.ren.dragOverLink) {
					this.ren.canvasController.editActionHandler({
						editType: "insertNodeIntoLink",
						editSource: "canvas",
						node: movingObjectData.objects[0],
						link: this.ren.dragOverLink,
						offsetX: finalOffset.x,
						offsetY: finalOffset.y,
						pipelineId: this.ren.activePipeline.id });

				} else if (this.existingNodeAttachableToDetachedLinks &&
							this.ren.dragOverDetachedLinks.length > 0) {
					this.ren.canvasController.editActionHandler({
						editType: "attachNodeToLinks",
						editSource: "canvas",
						node: movingObjectData.objects[0],
						detachedLinks: this.ren.dragOverDetachedLinks,
						offsetX: finalOffset.x,
						offsetY: finalOffset.y,
						pipelineId: this.ren.activePipeline.id });

				} else {
					this.ren.canvasController.editActionHandler({
						editType: "moveObjects",
						editSource: "canvas",
						nodes: movingObjectData.objects.map((o) => o.id),
						links: this.ren.activePipeline.getSelectedDetachedLinks(),
						offsetX: finalOffset.x,
						offsetY: finalOffset.y,
						pipelineId: this.ren.activePipeline.id });
				}
			}
		}

		// Switch off any move highlighting
		this.ren.setDataLinkSelectionAreaWider(false);
		this.unsetNodeTranslucentState(movingObjectData.objects);
		this.ren.unsetInsertNodeIntoLinkHighlighting();
		this.ren.unsetDetachedLinkHighlighting();
	}

	// Returns an array of objects to move which is typically the selected set of
	// nodes and comments. However, if enableDragWithoutSelect is true, and the
	// object being moved is not one of the selected objects, then just that
	// object is to be moved.
	getMoveObjects(d) {
		const selectedObjects = this.ren.activePipeline.getSelectedNodesAndComments();

		if (this.ren.config.enableDragWithoutSelect &&
				selectedObjects.findIndex((o) => o.id === d.id) === -1) {
			return [d];
		}

		return selectedObjects;
	}

	// Switches the 'd3-is-moving' class on and off for the objects passed
	// in, based on the state passed in.
	switchIsMovingClass(objs, state) {
		objs.forEach((obj) => {
			if (CanvasUtils.isNode(obj)) {
				this.ren.getNodeGroupSelectionById(obj.id).classed("d3-is-moving", state);
			} else {
				this.ren.getCommentGroupSelectionById(obj.id).classed("d3-is-monving", state);
			}
		});
	}

	// Returns true if the object passed in is movable or false if not.
	isObjectMovable(obj) {
		return CanvasUtils.isComment(obj) ||
			CanvasUtils.isNode(obj) && obj.layout?.nodeMovable;
	}

	// Returns true if the current move objects array has a single node which
	// is 'insertable' into a data link between nodes on the canvas.  Returns
	// false otherwise, including if a single comment is being moved.
	isExistingNodeInsertableIntoLink() {
		return (this.ren.config.enableInsertNodeDroppedOnLink &&
			this.movingObjectData.objects.length === 1 &&
			CanvasUtils.isNode(this.movingObjectData.objects[0]) &&
			CanvasUtils.hasInputAndOutputPorts(this.movingObjectData.objects[0]) &&
			!CanvasUtils.isNodeDefaultPortsCardinalityAtMax(this.movingObjectData.objects[0], this.ren.activePipeline.links));
	}

	// Returns true if the current move objects array has a single node which
	// is 'attachable' to any detached link on the canvas. Returns false otherwise,
	// including if a single comment is being moved.
	isExistingNodeAttachableToDetachedLinks() {
		return (this.ren.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
			this.movingObjectData.objects.length === 1 &&
			CanvasUtils.isNode(this.movingObjectData.objects[0]));
	}

	// Switches on or off the translucent state of the node identified by the
	// node ID passed in. This is used when an 'insertable' node is moved on
	// the canvas. It makes is easier for the user to see the highlighted link
	// when the node is moved over it.
	setNodeTranslucentState(nodeId, state) {
		this.ren.getNodeGroupSelectionById(nodeId).classed("d3-node-group-translucent", state);
	}

	// Switched off the translucent state of the objects being moved (if
	// there are any).
	unsetNodeTranslucentState(objs) {
		if (objs?.length > 0) {
			this.setNodeTranslucentState(objs[0].id, false);
		}
	}

	// Returns the snap-to-grid position of the object positioned at
	// this.movingObjectData.startX and this.movingObjectData.startY
	// after applying the current offset of this.movingObjectData.offsetX
	// and this.movingObjectData.offsetY.
	snapToGridMovedNode(movingObjectData) {
		const x = movingObjectData.startX + movingObjectData.offsetX;
		const y = movingObjectData.startY + movingObjectData.offsetY;

		return this.ren.snapToGridPosition({ x, y });
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

	// Returns an object containing the x and y increments used to move or size
	// an object in the direction provided taking into account whether snap
	// to grid has been switched on or not.
	getMoveIncrements(dir) {
		// If no snap-to-grid we just increment by 10px.
		let x = 10;
		let y = 10;

		if (this.ren.config.enableSnapToGridType === SNAP_TO_GRID_DURING ||
			this.ren.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			x = this.ren.canvasLayout.snapToGridXPx;
			y = this.ren.canvasLayout.snapToGridYPx;
		}

		let xInc = 0;
		let yInc = 0;

		switch (dir) {
		case NORTH:
			xInc = 0;
			yInc = -y;
			break;
		case SOUTH:
			xInc = 0;
			yInc = y;
			break;
		case EAST:
			xInc = x;
			yInc = 0;
			break;
		default:
		case WEST:
			xInc = -x;
			yInc = 0;
			break;
		}
		return { xInc, yInc };
	}
}
