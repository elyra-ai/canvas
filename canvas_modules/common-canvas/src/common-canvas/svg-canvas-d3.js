/*
 * Copyright 2017-2021 Elyra Authors
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


// Import just the D3 modules that are needed.
var d3 = Object.assign({}, require("d3-selection"));
import SVGCanvasRenderer from "./svg-canvas-renderer.js";
import CanvasUtils from "./common-canvas-utils.js";
import ConfigUtils from "../object-model/config-utils.js";
import Logger from "../logging/canvas-logger.js";

const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const A_KEY = 65;
const C_KEY = 67;
const P_KEY = 80;
const V_KEY = 86;
const X_KEY = 88;
const Y_KEY = 89;
const Z_KEY = 90;
// TODO - Implement nudge behavior for moving nodes and comments
// const LEFT_ARROW_KEY = 37;
// const UP_ARROW_KEY = 38;
// const RIGHT_ARROW_KEY = 39;
// const DOWN_ARROW_KEY = 40;

export default class SVGCanvasD3 {

	constructor(canvasInfo, canvasDivSelector, config, canvasController) {
		this.logger = new Logger(["SVGCanvasD3", "FlowId", canvasInfo.id]);
		this.logger.logStartTimer("constructor");
		this.mousePos = {
			x: 0,
			y: 0
		};
		this.canvasController = canvasController;
		this.canvasDiv = this.initializeCanvasDiv(canvasDivSelector);
		this.logger.logEndTimer("constructor", true);
		document.addEventListener("mousemove", this.onMouseUpdate.bind(this), true);
	}

	close() {
		document.removeEventListener("mousemove", this.onMouseUpdate, true);
	}

	setCanvasInfo(canvasInfo, config) {
		this.logger = new Logger(["SVGCanvasD3", "FlowId", canvasInfo.id]);
		if (!this.config ||
				!this.renderer ||
				!this.canvasInfo ||
				canvasInfo.id !== this.canvasInfo.id ||
				(this.renderer && this.renderer.pipelineId !== this.canvasController.getCurrentBreadcrumb().pipelineId) ||
				!ConfigUtils.compareCanvasConfigs(this.config, config)) {
			this.logger.logStartTimer("initializing");

			this.canvasInfo = this.cloneCanvasInfo(canvasInfo);
			this.config = this.cloneConfig(config);

			if (this.renderer) {
				this.renderer.clearCanvas();
				this.renderer = null;
			}

			const currentBreadcrumb = this.canvasController.getCurrentBreadcrumb();
			this.renderer = new SVGCanvasRenderer(
				currentBreadcrumb.pipelineId,
				this.canvasDiv,
				this.canvasController,
				this.canvasInfo,
				config,
				{ id: currentBreadcrumb.supernodeId, // Will be null for primary pipeline
					pipelineId: currentBreadcrumb.supernodeParentPipelineId // Will be null for primary pipeline
				}
			);

			this.logger.logEndTimer("initializing", true);

		} else {
			this.logger.logStartTimer("set canvas info");

			this.canvasInfo = this.cloneCanvasInfo(canvasInfo);
			this.renderer.setCanvasInfoRenderer(this.canvasInfo);

			this.logger.logEndTimer("set canvas info", true);
		}
	}

	// Returns a copy of the config object. This is necessary so that comparisons
	// with new config objects that are provided reveal differences. This will
	// not clone the contents of emptyCanvasContent, dropZoneCanvasContent nor
	// enableNodeLayout.
	cloneConfig(config) {
		return Object.assign({}, config);
	}

	cloneCanvasInfo(canvasInfo) {
		return JSON.parse(JSON.stringify(canvasInfo));
	}

	// Keeps tracking mouse positions only within canvasUI & constantly feeds the
	// mousePos object with {x,y} values otherwise(mouse positions outside of canvasUI)
	// mousePos will get null.
	onMouseUpdate(e) {
		if (e.target.className.baseVal === "svg-area" || e.target.className.baseVal === "d3-svg-background") {
			this.mousePos = {
				x: e.clientX,
				y: e.clientY
			};
		} else {
			this.mousePos = null;
		}
	}

	initializeCanvasDiv(canvasDivSelector) {

		// Add a listener to canvas div to catch key presses. The containing
		// canvas div must have tabindex set and the focus set on the div.
		const canvasDiv = d3.select(canvasDivSelector)
			.on("keydown", (d3Event) => {
				// Make sure no tip is displayed, because having one displayed
				// will interfere with drawing of the canvas as the result of any
				// keyboard action.
				this.canvasController.closeTip();
				const actions = this.canvasController.getKeyboardConfig().actions;
				// Only catch key pressses when NOT editing because, while editing,
				// the text area needs to receive key presses for undo, redo, delete etc.
				if (!this.renderer.isEditingText()) {
					if ((d3Event.keyCode === BACKSPACE_KEY || d3Event.keyCode === DELETE_KEY) && actions.delete) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Some browsers interpret Delete as 'Back to previous page'. So prevent that.
						this.canvasController.keyboardActionHandler("deleteSelectedObjects");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && !d3Event.shiftKey && d3Event.keyCode === Z_KEY && actions.undo) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.keyboardActionHandler("undo");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) &&
							((d3Event.shiftKey && d3Event.keyCode === Z_KEY) || d3Event.keyCode === Y_KEY && actions.redo)) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.keyboardActionHandler("redo");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.keyCode === A_KEY && actions.selectAll) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.keyboardActionHandler("selectAll");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.keyCode === C_KEY && actions.copyToClipboard) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.keyboardActionHandler("copy");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.keyCode === X_KEY && actions.cutToClipboard) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.keyboardActionHandler("cut");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.keyCode === V_KEY && actions.pasteFromClipboard) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						if (this.mousePos) {
							this.mousePos = this.renderer.convertPageCoordsToCanvasCoords(this.mousePos.x, this.mousePos.y);
							this.mousePos = this.renderer.getMousePosSnapToGrid(this.mousePos);
							this.canvasController.keyboardActionHandler("paste", this.mousePos);
						} else {
							this.canvasController.keyboardActionHandler("paste");
						}
					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.shiftKey && d3Event.altKey && d3Event.keyCode === P_KEY) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						Logger.switchLoggingState(); // Switch the logging on and off
					}
				}
			});
		return canvasDiv;
	}

	nodeTemplateDraggedOver(nodeTemplate, x, y) {
		this.renderer.nodeTemplateDraggedOver(nodeTemplate, x, y);
	}

	nodeTemplateDropped(nodeTemplate, x, y) {
		this.renderer.nodeTemplateDropped(nodeTemplate, x, y);
	}

	externalObjectDropped(dropData, x, y) {
		this.renderer.externalObjectDropped(dropData, x, y);
	}

	zoomTo(zoomObject) {
		this.renderer.zoomTo(zoomObject);
	}

	translateBy(x, y, animateTime) {
		this.renderer.translateBy(x, y, animateTime);
	}

	zoomIn() {
		this.renderer.zoomIn();
	}

	zoomOut() {
		this.renderer.zoomOut();
	}

	zoomToFit() {
		this.renderer.zoomToFit();
	}

	getZoomToReveal(objectIds, xPos, yPos) {
		return this.renderer ? this.renderer.getZoomToReveal(objectIds, xPos, yPos) : null;
	}

	getZoom() {
		return this.renderer ? this.renderer.getZoom() : null;
	}

	refreshOnSizeChange() {
		if (this.renderer) {
			this.renderer.refreshOnSizeChange();
		}
	}

	getSvgViewportOffset() {
		return this.renderer.getSvgViewportOffset();
	}

	getTransformedViewportDimensions() {
		return this.renderer.getTransformedViewportDimensions();
	}

	getGhostNode(nodeTemplate) {
		return this.renderer.getGhostNode(nodeTemplate);
	}
}
