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

import * as d3Selection from "d3-selection";
import * as d3Zoom from "./d3-zoom-extension/src";
const d3 = Object.assign({}, d3Selection, d3Zoom);

import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import { INTERACTION_CARBON, INTERACTION_MOUSE, INTERACTION_TRACKPAD,
	LINK_SELECTION_NONE
} from "./constants/canvas-constants.js";

// This utility file provides a d3-zoom handler which manages zoom operations
// on the canvas as well as various utility functions to handle zoom behavior.

export default class SVGCanvasUtilsZoom {

	constructor(renderer) {
		this.ren = renderer;

		this.logger = new Logger("SVGCanvasUtilsZoom");

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 1.8;

		// Keep track of when the context menu has been closed, so we don't remove
		// selections when a context menu is closed during a zoom gesture.
		this.contextMenuClosedOnZoom = false;

		// Keep track of when text editing has been closed, so we don't remove
		// selections when that happens during a zoom gesture.
		this.textEditingClosedOnZoom = false;

		// Used to monitor the region selection rectangle.
		this.regionSelect = false;

		// Used to track the start of the zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0, startX: 0, startY: 0 };

		// Stores the previous events from D3 so we can calculate zoom increment amounts.
		this.previousD3Event = {};

		// Stores the dimensions of the canvas to save recalculating the size on
		// each zoom increment.
		this.zoomCanvasDimensions = {};

		// I was not able to figure out how to use the zoom filter method to
		// allow mousedown and mousemove messages to go through to the canvas to
		// do region selection. Therefore I had to implement region selection in
		// the zoom methods. This has the side effect that, when a region is
		// selected, d3Event.transform.x and d3Event.transform.y are incremented
		// even though the objects in the canvas have not moved. The values below
		// are used to store the current transform x and y amounts at the beginning
		// of the region selection and then restore those amounts at the end of
		// the region selection.
		this.regionStartTransformX = 0;
		this.regionStartTransformY = 0;

		// Stores the current zoom transform amounts.
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);

		// Flag to indicate when a zoom handled by zoomHandler is hapening.
		this.zooming = false;

		// Flag to indicate when a zoom is invoked programmatically.
		this.zoomingAction = false;

		// Flag to indicate when the space key is down (used when dragging).
		this.spaceKeyPressed = false;

		// Create a zoom handler for use with the canvas.
		this.zoomHandler =
			d3.zoom()
				.trackpad(this.ren.config.enableInteractionType === INTERACTION_TRACKPAD)
				.preventBackGesture(true)
				.wheelDelta((d3Event) => -d3Event.deltaY * (this.ren.config.enableInteractionType === INTERACTION_TRACKPAD ? 0.02 : 0.002))
				.scaleExtent([this.minScaleExtent, this.maxScaleExtent])
				.on("start", this.zoomStart.bind(this))
				.on("zoom", this.zoomAction.bind(this))
				.on("end", this.zoomEnd.bind(this));

	}

	// Saves the state when the user presses and holds the space bar. This
	// can be used for gestures that require the space bar to be held down.
	setSpaceKeyPressed(state) {
		this.spaceKeyPressed = state;
	}

	// Returns true if the space bar is pressed and held down.
	isSpaceKeyPressed() {
		return this.spaceKeyPressed;
	}

	// Returns the dragObjectsHandler
	getZoomHandler() {
		return this.zoomHandler;
	}

	// Returns the zoom transform object.
	getZoomTransform() {
		return this.zoomTransform;
	}

	// Returns a copy of the zoom transform object.
	getZoom() {
		return { ...this.zoomTransform };
	}

	getZoomScale() {
		return this.zoomTransform.k;
	}

	// Resets the local zoom transform object to the default (identity) zoom.
	resetZoomTransform() {
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);
	}

	// Zooms the canvas to the extent specified in the zoom object. Animate
	// the zoom by the time specified (in milliseconds) or by 500ms by default.
	zoomTo(zoomObject, animateTime) {
		const at = typeof animateTime === "undefined" ? 500 : animateTime;
		this.zoomCanvasInvokeZoomBehavior(zoomObject, at);
	}

	// Pans the canvas by the x and y amount specified in the time specified.
	translateBy(x, y, animateTime) {
		const z = this.getZoomTransform();
		const zoomObject = d3.zoomIdentity.translate(z.x + x, z.y + y).scale(z.k);
		this.zoomCanvasInvokeZoomBehavior(zoomObject, animateTime);
	}

	// Zooms in the canvas by an increment amount.
	zoomIn() {
		if (this.zoomTransform.k < this.maxScaleExtent) {
			const newScale = Math.min(this.zoomTransform.k * 1.1, this.maxScaleExtent);
			this.ren.canvasSVG.call(this.zoomHandler.scaleTo, newScale);
		}
	}

	// Zooms out the canvas by an increment amount.
	zoomOut() {
		if (this.zoomTransform.k > this.minScaleExtent) {
			const newScale = Math.max(this.zoomTransform.k / 1.1, this.minScaleExtent);
			this.ren.canvasSVG.call(this.zoomHandler.scaleTo, newScale);
		}
	}

	// Returns true if the canvas is currently zoomed to the maximum amount.
	isZoomedToMax() {
		return this.zoomTransform ? this.zoomTransform.k === this.maxScaleExtent : false;
	}

	// Returns true if the canvas is currently zoomed to the minimum amount.
	isZoomedToMin() {
		return this.zoomTransform ? this.zoomTransform.k === this.minScaleExtent : false;
	}

	// Sets the maximum zoom extent by multiplying the current extent by
	// the factor passed in.
	setMaxZoomExtent(factor) {
		// Don't allow the scale extent to be changed while in the middle of a
		// zoom operation.
		if (this.zooming) {
			return;
		}
		const newMaxExtent = this.maxScaleExtent * factor;
		this.zoomHandler = this.zoomHandler.scaleExtent([this.minScaleExtent, newMaxExtent]);
		this.ren.resetCanvasSVGBehaviors();
	}

	// Transforms the x and y fields of the pos object passed in, which
	// should be in screen pixels measured from the top left of the SVG
	// area, to canvas coordinates.
	transformPos(pos) {
		return {
			x: this.transformPosX(pos.x),
			y: this.transformPosY(pos.y)
		};
	}

	// Transforms a screen pixel X value, measured from the top left of
	// the SVG area, to canvas coordinate.
	transformPosX(posX) {
		return (posX - this.zoomTransform.x) / this.zoomTransform.k;
	}

	// Transforms a screen pixel Y value, measured from the top left of
	// the SVG area, to canvas coordinate.
	transformPosY(posY) {
		return (posY - this.zoomTransform.y) / this.zoomTransform.k;
	}

	// Transforms the x and y fields passed in which should be in
	// canvas coordinates to a position measured in screen pixels
	// from the top left of the SVG area.
	unTransformPos(pos) {
		return {
			x: (pos.x * this.zoomTransform.k) + this.zoomTransform.x,
			y: (pos.y * this.zoomTransform.k) + this.zoomTransform.y
		};
	}

	// Returns a 'rect' object for the DOM element passed in. The dimensions
	// and positions returned are in canvas coordinates. That is, transformed
	// by the current zoomTransform from page coordinates to canvas coordinates.
	getTransformedElementRect(element) {
		const vpRect = this.ren.canvasSVG.node().getBoundingClientRect();
		if (!element) {
			return null;
		}
		const elRect = element.getBoundingClientRect();

		// Remove any offset caused by where the viewport is on the page.
		const rect = {
			x: elRect.x - vpRect.x,
			y: elRect.y - vpRect.y,
			left: elRect.left - vpRect.x,
			right: elRect.right - vpRect.x,
			top: elRect.top - vpRect.y,
			bottom: elRect.bottom - vpRect.y,
			width: elRect.width,
			height: elRect.height
		};

		// Transform the positions and dimensions to canvas coordinates.
		rect.x = this.transformPosX(rect.x);
		rect.y = this.transformPosY(rect.y);
		rect.left = this.transformPosX(rect.left);
		rect.right = this.transformPosX(rect.right);
		rect.top = this.transformPosY(rect.top);
		rect.bottom = this.transformPosY(rect.bottom);
		rect.width /= this.zoomTransform.k;
		rect.height /= this.zoomTransform.k;

		return rect;
	}

	// Transforms the x, y, height and width fields of the object passed in by the
	// current zoom transformation amounts to convert coordinate positions and
	// dimensions in screen pixels to coordinate positions and dimensions in
	// zoomed pixels.
	getTransformedRect(svgRect, pad) {
		const transPad = (pad / this.zoomTransform.k);
		return {
			x: (-this.zoomTransform.x / this.zoomTransform.k) + transPad,
			y: (-this.zoomTransform.y / this.zoomTransform.k) + transPad,
			height: (svgRect.height / this.zoomTransform.k) - (2 * transPad),
			width: (svgRect.width / this.zoomTransform.k) - (2 * transPad)
		};
	}

	// Handles the beginning of a zoom action
	zoomStart(d3Event) {
		this.logger.log("zoomStart - " + JSON.stringify(d3Event.transform));

		// Ensure any open tip is closed before starting a zoom operation.
		this.ren.canvasController.closeTip();

		this.zooming = true;

		// Close the context menu, if it's open, before panning or zooming.
		// If the context menu is opened inside the expanded supernode (in-place
		// subflow), when the user zooms the canvas, the full page flow is handling
		// that zoom, which causes a refresh in the subflow, so the full page flow
		// will take care of closing the context menu. This means the in-place
		// subflow doesn’t need to do anything on zoom,
		// hence: !this.ren.dispUtils.isDisplayingSubFlowInPlace()
		if (this.ren.canvasController.isContextMenuDisplayed() &&
				!this.ren.dispUtils.isDisplayingSubFlowInPlace()) {
			this.ren.canvasController.closeContextMenu();
			this.contextMenuClosedOnZoom = true;
		}

		// Any text editing in progress will be closed by the textarea's blur event
		// if the user clicks on the canvas background. So we set this flag to
		// prevent the selection being lost in the zoomEnd (mouseup) event.
		if (this.ren.svgCanvasTextArea.isEditingText()) {
			this.textEditingClosedOnZoom = true;
		}

		this.regionSelect = this.isRegionSelectActivated(d3Event);

		if (this.regionSelect) {
			// Add a delay so, if the user just clicks, they don't see the crosshair.
			// This will be cleared in zoomEnd if the user's click takes less than 200 ms.
			this.addingCursorOverlay = setTimeout(() => this.ren.addTempCursorOverlay("crosshair"), 200);
			this.regionStartTransformX = d3Event.transform.x;
			this.regionStartTransformY = d3Event.transform.y;

		} else {
			if (this.isDragActivated(d3Event)) {
				this.addingCursorOverlay = setTimeout(() => this.ren.addTempCursorOverlay("grabbing"), 200);
			} else {
				this.addingCursorOverlay = setTimeout(() => this.ren.addTempCursorOverlay("default"), 200);
			}
		}

		const transPos = this.ren.getTransformedMousePos(d3Event);
		this.zoomStartPoint = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k, startX: transPos.x, startY: transPos.y };
		this.previousD3Event = { ...d3Event.transform };

		// Store the canvas dimensions so we don't have to recalculate
		// them for every zoom action event.
		this.zoomCanvasDimensions = this.getCanvasDimensions();
	}

	// Handles each increment of a zoom action
	zoomAction(d3Event) {
		this.logger.log("zoomAction - " + JSON.stringify(d3Event.transform));

		// If the scale amount is the same we are not zooming, so we must be panning.
		if (d3Event.transform.k === this.zoomStartPoint.k) {
			if (this.regionSelect) {
				this.drawRegionSelector(d3Event);

			} else {
				this.zoomCanvasBackground(d3Event);
			}
		} else {
			this.ren.addTempCursorOverlay("default");
			this.zoomCanvasBackground(d3Event);
			this.ren.repositionCommentToolbar();
		}
	}

	// Handles the end of a zoom action
	zoomEnd(d3Event) {
		this.logger.log("zoomEnd - " + JSON.stringify(d3Event.transform));

		// Clears the display of the cursor overlay if the user clicks within 200 ms
		clearTimeout(this.addingCursorOverlay);

		const transPos = this.ren.getTransformedMousePos(d3Event);

		// The user just clicked -- with no drag.
		if (transPos.x === this.zoomStartPoint.startX &&
			transPos.y === this.zoomStartPoint.startY &&
			!this.zoomChanged()) {
			this.zoomClick(d3Event);

		} else if (this.regionSelect) {
			this.zoomEndRegionSelect(d3Event);

		} else if (this.ren.dispUtils.isDisplayingFullPage() && this.zoomChanged()) {
			this.zoomSave();
		}

		// Remove the cursor overlay and reset the SVG background rectangle
		// cursor style, which was set in the zoom start method.
		this.ren.resetCanvasCursor(d3Event);
		this.ren.removeTempCursorOverlay();
		this.contextMenuClosedOnZoom = false;
		this.textEditingClosedOnZoom = false;
		this.regionSelect = false;
		this.zooming = false;
	}

	// Returns true if the current zoom transform is different from the
	// zoom values at the beginning of the zoom action.
	zoomChanged() {
		return (this.zoomTransform.k !== this.zoomStartPoint.k ||
			this.zoomTransform.x !== this.zoomStartPoint.x ||
			this.zoomTransform.y !== this.zoomStartPoint.y);
	}

	// Returns true if the event indicates that a drag (rather than a region
	// select) is in action. This means that, with the Carbon interation
	// option the space bar is pressed or with legacy interation the
	// shift key is NOT pressed.
	isDragActivated(d3Event) {
		if (this.ren.config.enableInteractionType === INTERACTION_CARBON) {
			return this.isSpaceKeyPressed();
		}
		return (d3Event && d3Event.sourceEvent && !d3Event.sourceEvent.shiftKey);
	}

	// Returns true if the region select gesture is requested by the user.
	isRegionSelectActivated(d3Event) {
		// The this.zoomingAction flag indicates zooming is being invoked
		// programmatically.
		if (this.zoomingAction) {
			return false;

		} else if (this.ren.config.enableInteractionType === INTERACTION_MOUSE &&
				(d3Event && d3Event.sourceEvent && d3Event.sourceEvent.shiftKey)) {
			return true;

		} else if (this.ren.config.enableInteractionType === INTERACTION_CARBON &&
					!this.isSpaceKeyPressed()) {
			return true;

		} else if (this.ren.config.enableInteractionType === INTERACTION_TRACKPAD &&
				(d3Event.sourceEvent && d3Event.sourceEvent.buttons === 1) && // Main button is pressed
				!this.isSpaceKeyPressed()) {
			return true;
		}

		return false;
	}

	drawRegionSelector(d3Event) {
		this.removeRegionSelector();
		const { x, y, width, height } = this.getRegionDimensions(d3Event);

		// Highlight objects within the region, as it is being drawn, to show
		// the user which objects will be selected. Highlighting is done by setting
		// the selection info in the (temporary) activePipeline object.
		const selections = this.getObjectsInRegion({ x, y, width, height });
		this.ren.setSelectionInfo({ selections, pipelineId: this.ren.activePipeline.id });

		this.ren.canvasGrp
			.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("x", x)
			.attr("y", y)
			.attr("class", "d3-region-selector");
	}

	// Handles the behavior when the user stops doing a region select.
	zoomEndRegionSelect(d3Event) {
		this.removeRegionSelector();

		// Reset the transform x and y to what they were before the region
		// selection action was started. This directly sets the x and y values
		// in the __zoom property of the svgCanvas DOM object.
		d3Event.transform.x = this.regionStartTransformX;
		d3Event.transform.y = this.regionStartTransformY;

		// Get the objects in the region and set them as 'selected' in the
		// object model by calling the canvas controller.
		const region = this.getRegionDimensions(d3Event);
		const selections = this.getObjectsInRegion(region);
		this.ren.canvasController.setSelections(selections, this.ren.activePipeline.id);
	}

	// Removes the region selection graphic rectangle.
	removeRegionSelector() {
		this.ren.canvasGrp.selectAll(".d3-region-selector").remove();
	}

	// Returns any objects in the region provided where region is { x, y, width, height }
	getObjectsInRegion(region) {
		return CanvasUtils.getObjectsInRegion(
			region,
			this.ren.activePipeline,
			this.ren.config.enableLinkSelection !== LINK_SELECTION_NONE,
			this.ren.canvasLayout.linkType,
			this.ren.canvasLayout.linkMethod,
			this.ren.config.enableAssocLinkType);
	}

	// Returns the x, y, width and height of the selection region
	// where x and y are always the top left corner of the region
	// and width and height are therefore always positive.
	getRegionDimensions(d3Event) {
		const transPos = this.ren.getTransformedMousePos(d3Event);
		let x = this.zoomStartPoint.startX;
		let y = this.zoomStartPoint.startY;
		let width = transPos.x - x;
		let height = transPos.y - y;

		if (width < 0) {
			width = Math.abs(width);
			x -= width;
		}
		if (height < 0) {
			height = Math.abs(height);
			y -= height;
		}

		return { x, y, width, height };
	}

	// Performs zoom behaviors for each incremental zoom action.
	zoomCanvasBackground(d3Event) {
		this.regionSelect = false;

		if (this.ren.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			const incTransform = this.getTransformIncrement(d3Event);
			this.zoomTransform = this.zoomConstrainRegular(incTransform, this.getViewportDimensions(), this.zoomCanvasDimensions);
		} else {
			this.zoomTransform = d3.zoomIdentity.translate(d3Event.transform.x, d3Event.transform.y).scale(d3Event.transform.k);
		}

		this.ren.canvasGrp.attr("transform", this.zoomTransform);
		this.ren.canvasBackground.attr("transform", this.zoomTransform);

		this.ren.displayCanvasAccoutrements();
	}

	// Handles a zoom operation that is just a click on the canvas background.
	zoomClick(d3Event) {
		// Only clear selections under these conditions:
		// * if the click was on the canvas of the current active pipeline. (This
		//   is because clicking on the canvas background of an expanded supernode
		//   should select that node.)
		// * if we have not just closed a context menu
		// * if we have not just closed text editing
		// * if editing actions are enabled OR the target is the canvas background.
		//   (This condition is necessary because when editing actions are disabled,
		//   for a read-only canvas, the mouse-up over a node can cause this method
		//   to be called.)
		if (this.ren.dispUtils.isDisplayingCurrentPipeline() &&
				!this.contextMenuClosedOnZoom &&
				!this.textEditingClosedOnZoom &&
				(this.ren.config.enableEditingActions ||
				(d3Event.sourceEvent?.target?.classList?.contains("d3-svg-background")))) {
			this.ren.canvasController.clearSelections();
		}
	}

	// Save the zoom amount. The canvas controller/object model will decide
	// how this info is saved.
	zoomSave() {
		// Set the internal zoom value for canvasSVG used by D3. This will be
		// used by d3Event next time a zoom action is initiated.
		this.ren.canvasSVG.property("__zoom", this.zoomTransform);

		const data = {
			editType: "setZoom",
			editSource: "canvas",
			zoom: this.zoomTransform,
			pipelineId: this.ren.activePipeline.id
		};
		this.ren.canvasController.editActionHandler(data);

	}

	// Returns a new zoom which is the result of incrementing the current zoom
	// by the amount since the previous d3Event event.
	// We calculate increments because d3Event.transform is not based on
	// the constrained zoom position (which is very annoying) so we keep track
	// of the current constraind zoom amount in this.zoomTransform.
	getTransformIncrement(d3Event) {
		const xInc = d3Event.transform.x - this.previousD3Event.x;
		const yInc = d3Event.transform.y - this.previousD3Event.y;

		const newTransform = { x: this.zoomTransform.x + xInc, y: this.zoomTransform.y + yInc, k: d3Event.transform.k };
		this.previousD3Event = { ...d3Event.transform };
		return newTransform;
	}

	// Returns a modifed transform object so that the canvas area (the area
	// containing nodes and comments) is constrained such that it never totally
	// disappears from the view port.
	zoomConstrainRegular(transform, viewPort, canvasDimensions) {
		if (!canvasDimensions) {
			return this.zoomTransform;
		}

		const k = transform.k;
		let x = transform.x;
		let y = transform.y;

		const canv =
			this.convertRectAdjustedForScaleWithPadding(canvasDimensions, k, this.getZoomToFitPadding());

		const rightOffsetLimit = viewPort.width - Math.min((viewPort.width * 0.25), (canv.width * 0.25));
		const leftOffsetLimit = -(Math.max((canv.width - (viewPort.width * 0.25)), (canv.width * 0.75)));

		const bottomOffsetLimit = viewPort.height - Math.min((viewPort.height * 0.25), (canv.height * 0.25));
		const topOffsetLimit = -(Math.max((canv.height - (viewPort.height * 0.25)), (canv.height * 0.75)));

		if (x > -canv.left + rightOffsetLimit) {
			x = -canv.left + rightOffsetLimit;

		} else if (x < -canv.left + leftOffsetLimit) {
			x = -canv.left + leftOffsetLimit;
		}

		if (y > -canv.top + bottomOffsetLimit) {
			y = -canv.top + bottomOffsetLimit;

		} else if (y < -canv.top + topOffsetLimit) {
			y = -canv.top + topOffsetLimit;
		}

		return d3.zoomIdentity.translate(x, y).scale(k);
	}

	// Restores the zoom of the canvas, if it has changed, based on the type
	// of 'save zoom' specified in the configuration and, if no saved zoom, was
	// provided pans the canvas area so it is always visible.
	restoreZoom() {
		let newZoom = this.ren.canvasController.getSavedZoom(this.ren.activePipeline.id);

		// If there's no saved zoom, and enablePanIntoViewOnOpen is set, pan so
		// the canvas area (containing nodes and comments) is visible in the viewport.
		if (!newZoom && this.ren.config.enablePanIntoViewOnOpen) {
			const canvWithPadding = this.getCanvasDimensionsWithPadding();
			if (canvWithPadding) {
				newZoom = { x: -canvWithPadding.left, y: -canvWithPadding.top, k: 1 };
			}
		}

		// If there's no saved zoom and we have some initial pan amounts provided use them.
		if (!newZoom && this.ren.canvasLayout.initialPanX && this.ren.canvasLayout.initialPanY) {
			newZoom = { x: this.ren.canvasLayout.initialPanX, y: this.ren.canvasLayout.initialPanY, k: 1 };
		}

		// If new zoom is different to the current zoom amount, apply it.
		if (newZoom &&
				(newZoom.k !== this.zoomTransform.k ||
					newZoom.x !== this.zoomTransform.x ||
					newZoom.y !== this.zoomTransform.y)) {
			this.zoomCanvasInvokeZoomBehavior(newZoom);
		}
	}

	// Zooms the canvas to the amount specified in newZoomTransform. Zooming the
	// canvas in this way will invoke the zoom behavior methods: zoomStart,
	// zoomAction and zoomEnd. It does not perform a zoom if newZoomTransform
	// is the same as the current zoom transform.
	zoomCanvasInvokeZoomBehavior(newZoomTransform, animateTime) {
		if (newZoomTransform &&
				isFinite(newZoomTransform.x) &&
				isFinite(newZoomTransform.y) &&
				isFinite(newZoomTransform.k) &&
				this.zoomHasChanged(newZoomTransform)) {
			this.zoomingAction = true;
			const zoomTransform = d3.zoomIdentity.translate(newZoomTransform.x, newZoomTransform.y).scale(newZoomTransform.k);
			if (animateTime) {
				this.ren.canvasSVG.call(this.zoomHandler).transition()
					.duration(animateTime)
					.call(this.zoomHandler.transform, zoomTransform);
			} else {
				this.ren.canvasSVG.call(this.zoomHandler.transform, zoomTransform);
			}
			this.zoomingAction = false;
		}
	}

	// Return true if the new zoom transform passed in is different from the
	// current zoom transform.
	zoomHasChanged(newZoomTransform) {
		return newZoomTransform.k !== this.zoomTransform.k ||
			newZoomTransform.x !== this.zoomTransform.x ||
			newZoomTransform.y !== this.zoomTransform.y;
	}

	// Zooms the canvas to fit in the current viewport.
	zoomToFit() {
		const canvasDimensions = this.getCanvasDimensionsWithPadding();
		const viewPortDimensions = this.getViewportDimensions();

		if (canvasDimensions) {
			const xRatio = viewPortDimensions.width / canvasDimensions.width;
			const yRatio = viewPortDimensions.height / canvasDimensions.height;
			const newScale = Math.min(xRatio, yRatio, 1); // Don't let the canvas be scaled more than 1 in either direction

			let x = (viewPortDimensions.width - (canvasDimensions.width * newScale)) / 2;
			let y = (viewPortDimensions.height - (canvasDimensions.height * newScale)) / 2;

			x -= newScale * canvasDimensions.left;
			y -= newScale * canvasDimensions.top;

			this.zoomCanvasInvokeZoomBehavior({ x: x, y: y, k: newScale });
		}
	}

	// Returns a zoom object that will, if applied to the canvas, zoom the objects
	// dentified in the objectIDs array so their center is at the xPos, yPos
	// position in the viewport.
	getZoomToReveal(objectIDs, xPos, yPos) {
		const transformedSVGRect = this.getTransformedViewportDimensions();
		const nodes = this.ren.activePipeline.getNodes(objectIDs);
		const comments = this.ren.activePipeline.getComments(objectIDs);
		const links = this.ren.activePipeline.getLinks(objectIDs);

		if (nodes.length > 0 || comments.length > 0 || links.length > 0) {
			const canvasDimensions = CanvasUtils.getCanvasDimensions(nodes, comments, links, 0, 0, true);
			const canv = this.convertRectAdjustedForScaleWithPadding(canvasDimensions, 1, 30);
			const xPosInt = parseInt(xPos, 10);
			const yPosInt = typeof yPos === "undefined" ? xPosInt : parseInt(yPos, 10);

			if (canv) {
				let xOffset;
				let yOffset;

				if (!Number.isNaN(xPosInt) && !Number.isNaN(yPosInt)) {
					xOffset = transformedSVGRect.x + (transformedSVGRect.width * (xPosInt / 100)) - (canv.left + (canv.width / 2));
					yOffset = transformedSVGRect.y + (transformedSVGRect.height * (yPosInt / 100)) - (canv.top + (canv.height / 2));

				} else {
					if (canv.right > transformedSVGRect.x + transformedSVGRect.width) {
						xOffset = transformedSVGRect.x + transformedSVGRect.width - canv.right;
					}
					if (canv.left < transformedSVGRect.x) {
						xOffset = transformedSVGRect.x - canv.left;
					}
					if (canv.bottom > transformedSVGRect.y + transformedSVGRect.height) {
						yOffset = transformedSVGRect.y + transformedSVGRect.height - canv.bottom;
					}
					if (canv.top < transformedSVGRect.y) {
						yOffset = transformedSVGRect.y - canv.top;
					}
				}

				if (typeof xOffset !== "undefined" || typeof yOffset !== "undefined") {
					const x = this.zoomTransform.x + ((xOffset || 0)) * this.zoomTransform.k;
					const y = this.zoomTransform.y + ((yOffset || 0)) * this.zoomTransform.k;
					return { x: x || 0, y: y || 0, k: this.zoomTransform.k };
				}
			}
		}

		return null;
	}

	// Returns the maximum amount for padding, when zooming to fit the canvas
	// objects within a subflow, to allow the connection lines to be displayed
	// without them doubling back on themselves.
	getMaxZoomToFitPaddingForConnections() {
		const paddingForInputBinding = this.getMaxPaddingForConnectionsFromInputBindingNodes();
		const paddingForOutputBinding = this.getMaxPaddingForConnectionsToOutputBindingNodes();
		const padding = Math.max(paddingForInputBinding, paddingForOutputBinding);
		return padding;
	}

	// Returns the maximum amount for padding, when zooming to fit the canvas
	// objects within a subflow, to allow the connection lines (from input binding
	// nodes to other sub-flow nodes) to be displayed without them doubling back
	// on themselves.
	getMaxPaddingForConnectionsFromInputBindingNodes() {
		let maxPadding = 0;
		const inputBindingNodes = this.ren.activePipeline.nodes.filter((n) => n.isSupernodeInputBinding);

		inputBindingNodes.forEach((n) => {
			const nodePadding = CanvasUtils.getNodePaddingToTargetNodes(n, this.ren.activePipeline.nodes,
				this.ren.activePipeline.links, this.ren.canvasLayout.linkType);
			maxPadding = Math.max(maxPadding, nodePadding);
		});

		return maxPadding;
	}

	// Returns the maximum amount for padding, when zooming to fit the canvas
	// objects within a subflow, to allow the connection lines (from sub-flow nodes
	// to output binding nodes) to be displayed without them doubling back
	// on themselves.
	getMaxPaddingForConnectionsToOutputBindingNodes() {
		let maxPadding = 0;
		const outputBindingNodes = this.ren.activePipeline.nodes.filter((n) => n.isSupernodeOutputBinding);

		this.ren.activePipeline.nodes.forEach((n) => {
			const nodePadding = CanvasUtils.getNodePaddingToTargetNodes(n, outputBindingNodes,
				this.ren.activePipeline.links, this.ren.canvasLayout.linkType);
			maxPadding = Math.max(maxPadding, nodePadding);
		});

		return maxPadding;
	}

	// Returns an object representing the viewport dimensions which have been
	// transformed for the current zoom amount.
	getTransformedViewportDimensions() {
		const svgRect = this.getViewportDimensions();
		return this.getTransformedRect(svgRect, 0);
	}

	// Returns the dimensions of the SVG area. When we are displaying a sub-flow
	// we can use the supernode's dimensions. If not we are displaying
	// full-page so we can use getBoundingClientRect() to get the dimensions
	// (for some reason that method doesn't return correct values with embedded SVG areas).
	getViewportDimensions() {
		let viewportDimensions = {};

		if (this.ren.dispUtils.isDisplayingSubFlowInPlace()) {
			const dims = this.ren.getParentSupernodeSVGDimensions();
			viewportDimensions.width = dims.width;
			viewportDimensions.height = dims.height;

		} else {
			if (this.ren.canvasSVG && this.ren.canvasSVG.node()) {
				viewportDimensions = this.ren.canvasSVG.node().getBoundingClientRect();
			} else {
				viewportDimensions = { x: 0, y: 0, width: 1100, height: 640 }; // Return a sensible default (for Jest tests)
			}
		}
		return viewportDimensions;
	}

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. It
	// does not include the 'super binding nodes' which are the binding nodes in
	// a sub-flow that map to a port in the containing supernode. The dimensions
	// include an appropriate padding amount.
	getCanvasDimensionsWithPadding() {
		return this.getCanvasDimensions(this.getZoomToFitPadding());
	}

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. It
	// does not include the 'super binding nodes' which are the binding nodes in
	// a sub-flow that map to a port in the containing supernode. If a pad is
	// provided, it is also added in to the dimensions.
	getCanvasDimensions(pad) {
		const gap = this.ren.canvasLayout.commentHighlightGap;
		const canvasDimensions = this.ren.activePipeline.getCanvasDimensions(gap);
		return this.convertRectAdjustedForScaleWithPadding(canvasDimensions, 1, pad);
	}

	// Returns a rect object describing the rect passed in but
	// scaled by k and with padding added.
	convertRectAdjustedForScaleWithPadding(rect, k, pad = 0) {
		if (rect) {
			return {
				left: (rect.left * k) - pad,
				top: (rect.top * k) - pad,
				right: (rect.right * k) + pad,
				bottom: (rect.bottom * k) + pad,
				width: (rect.width * k) + (2 * pad),
				height: (rect.height * k) + (2 * pad)
			};
		}
		return null;
	}

	// Returns the padding space for the canvas objects to be zoomed which takes
	// into account any connections that need to be made to/from any sub-flow
	// binding nodes plus any space needed for the binding nodes ports.
	getZoomToFitPadding() {
		let padding = this.ren.canvasLayout.zoomToFitPadding;

		if (this.ren.dispUtils.isDisplayingSubFlow()) {
			// Allocate some space for connecting lines and the binding node ports
			const newPadding = this.getMaxZoomToFitPaddingForConnections() + (2 * this.ren.canvasLayout.supernodeBindingPortRadius);
			padding = Math.max(padding, newPadding);
		}
		return padding;
	}
}
