/*
 * Copyright 2017-2020 IBM Corporation
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

/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

// Import just the D3 modules that are needed. Doing this means that the
// d3Event object needs to be explicitly imported.
var d3 = Object.assign({}, require("d3-drag"), require("d3-ease"), require("d3-selection"), require("d3-zoom"));
import { event as d3Event } from "d3-selection";
import isMatch from "lodash/isMatch";
import SVGCanvasRenderer from "./svg-canvas-renderer.js";
import CanvasUtils from "./common-canvas-utils.js";
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
		this.logger.logStartTimer("Constructor");

		this.canvasController = canvasController;
		this.objectModel = this.canvasController.getObjectModel();

		// Initialize the canvas div object
		this.canvasDiv = this.initializeCanvasDiv(canvasDivSelector);

		// Save the config
		this.config = this.cloneConfig(config);

		// Initialize dimension and layout variables
		this.initializeLayoutInfo(config);

		// Make a copy of canvasInfo because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasInfo in the objectModel. The objectModel canvasInfo is only updated
		// when the operation is complete. We get the info from the canvas controller
		// because it may have been changed by the initializeLayoutInfo() above.
		this.canvasInfo = this.cloneCanvasInfo(this.canvasController.getCanvasInfo());

		// Create a renderer object for the primary pipeline
		this.renderer = new SVGCanvasRenderer(
			this.canvasInfo.primary_pipeline,
			this.canvasDiv,
			this.canvasController,
			this.canvasInfo,
			this.config);

		this.logger.logEndTimer("Constructor", true);
	}

	setCanvasInfo(canvasInfo, config) {
		this.logger = new Logger(["SVGCanvasD3", "FlowId", canvasInfo.id]);
		if (canvasInfo.id !== this.canvasInfo.id ||
				(this.renderer && this.renderer.pipelineId !== this.canvasController.getCurrentBreadcrumb().pipelineId) ||
				this.config.enableInteractionType !== config.enableInteractionType ||
				this.config.enableSnapToGridType !== config.enableSnapToGridType ||
				this.config.enableSnapToGridX !== config.enableSnapToGridX ||
				this.config.enableSnapToGridY !== config.enableSnapToGridY ||
				this.config.enableAutoLayoutVerticalSpacing !== config.enableAutoLayoutVerticalSpacing ||
				this.config.enableAutoLayoutHorizontalSpacing !== config.enableAutoLayoutHorizontalSpacing ||
				this.config.enableConnectionType !== config.enableConnectionType ||
				this.config.enableNodeFormatType !== config.enableNodeFormatType ||
				this.config.enableLinkType !== config.enableLinkType ||
				this.config.enableLinkDirection !== config.enableLinkDirection ||
				this.config.enableDisplayFullLabelOnHover !== config.enableDisplayFullLabelOnHover ||
				this.config.enableInsertNodeDroppedOnLink !== config.enableInsertNodeDroppedOnLink ||
				this.config.enableMoveNodesOnSupernodeResize !== config.enableMoveNodesOnSupernodeResize ||
				this.config.enableBoundingRectangles !== config.enableBoundingRectangles ||
				this.config.enableSaveZoom !== config.enableSaveZoom ||
				this.config.enableZoomIntoSubFlows !== config.enableZoomIntoSubFlows ||
				this.config.enableAssocLinkCreation !== config.enableAssocLinkCreation ||
				this.config.enableAssocLinkType !== config.enableAssocLinkType ||
				this.config.enableDragWithoutSelect !== config.enableDragWithoutSelect ||
				this.config.enableParentClass !== config.enableParentClass ||
				this.config.enableHightlightNodeOnNewLinkDrag !== config.enableHightlightNodeOnNewLinkDrag ||
				!this.enableCanvasLayoutExactlyMatches(this.config.enableCanvasLayout, config.enableCanvasLayout) ||
				!this.enableNodeLayoutExactlyMatches(this.config.enableNodeLayout, config.enableNodeLayout)) {
			this.logger.logStartTimer("Initializing Canvas");

			// The canvasInfo does not need to be cloned here because the two
			// calls below will cause the objectModel to be updated which will
			// cause this method to be called again and the else clasue of this if
			// will be executed which will clone the canvasInfo.
			this.canvasInfo = canvasInfo;
			// Save the config
			this.config = this.cloneConfig(config);

			// Both these methods will result in the canvas being refreshed through
			// updates to the object model so there is no need to call displayCanvas
			// from here. Setting this.renderer to null causes a new SVGCanvasRenderer
			// to be created when this method is called on the refresh.
			this.renderer.clearCanvas();
			this.initializeLayoutInfo(config);
			this.renderer = null;

			this.logger.logEndTimer("Initializing Canvas", true);

		} else {
			this.logger.logStartTimer("Set Canvas Info");

			this.canvasInfo = this.cloneCanvasInfo(canvasInfo);

			if (this.renderer) {
				this.renderer.setCanvasInfoRenderer(this.canvasInfo);
				this.renderer.displayCanvas();
			} else {
				this.renderer = new SVGCanvasRenderer(
					this.canvasController.getCurrentBreadcrumb().pipelineId,
					this.canvasDiv,
					this.canvasController,
					this.canvasInfo,
					config);
			}

			this.logger.logEndTimer("Set Canvas Info", true);
		}
	}

	// Returns a copy of the config object. This is necessary so that comparisons
	// with new config objects that are provided reveal differences. This will
	// not clone the contents of emptyCanvasContent, dropZoneCanvasContent nor
	// enableNodeLayout.
	cloneConfig(config) {
		return Object.assign({}, config);
	}

	// Returns true if the contents of enableLayout1 and enableLayout2 are
	// exactly the same.
	enableCanvasLayoutExactlyMatches(enableLayout1, enableLayout2) {
		if (!enableLayout1 && !enableLayout2) {
			return true;
		} else if (isMatch(enableLayout1, enableLayout2) && isMatch(enableLayout2, enableLayout1)) {
			return true;
		}
		return false;
	}

	// Returns true if the contents of enableLayout1 and enableLayout2 including
	// their decorations arrays are exactly the same.
	enableNodeLayoutExactlyMatches(enableLayout1, enableLayout2) {
		if (!enableLayout1 && !enableLayout2) {
			return true;
		} else if (isMatch(enableLayout1, enableLayout2) && isMatch(enableLayout2, enableLayout1) &&
			this.decorationsArraysExactlyMatches(enableLayout1.decorations, enableLayout2.decorations)) {
			return true;
		}
		return false;
	}

	// Returns true if two decorations arrays passed in are identical or false
	// otherwise.
	decorationsArraysExactlyMatches(decorations1, decorations2) {
		if (!decorations1 && !decorations2) {
			return true;
		}
		else if (!decorations1 || !decorations2) {
			return false;
		}
		let state = true;
		decorations1.forEach((dec1, i) => {
			const dec2 = decorations2[i];
			if (dec2) {
				if (!isMatch(dec1, dec2) || !isMatch(dec2, dec1)) {
					state = false;
				}
			} else {
				state = false;
			}
		});
		return state;
	}

	// Copies canvasInfo because we will need to update it (when moving
	// nodes and comments and when sizing comments in real time) without updating
	// the canvasInfo in the ObjectModel. The objectModel canvasInfo is only
	// updated when the real-time operation is complete.
	cloneCanvasInfo(canvasInfo) {
		this.logger.logStartTimer("Cloning canvasInfo");
		const cloneCanvasInfo = JSON.parse(JSON.stringify(canvasInfo));
		this.logger.logEndTimer("Cloning canvasInfo");
		return cloneCanvasInfo;
	}

	initializeCanvasDiv(canvasDivSelector) {
		// Add a listener to canvas div to catch key presses. The containing
		// canvas div must have tabindex set and the focus set on the div.
		const canvasDiv = d3.select(canvasDivSelector)
			.on("keydown", () => {
				// Make sure no tip is displayed, because having one displayed
				// will interfere with drawing of the canvas as the result of any
				// keyboard action.
				this.canvasController.closeTip();

				const actions = this.canvasController.getKeyboardConfig().actions;

				// Only catch key pressses when NOT editing because, while editing,
				// the text area needs to receive key presses for undo, redo, delete etc.
				if (!this.renderer.isEditingComment()) {
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
						this.canvasController.keyboardActionHandler("paste");

					} else if (CanvasUtils.isCmndCtrlPressed(d3Event) && d3Event.shiftKey && d3Event.altKey && d3Event.keyCode === P_KEY) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						Logger.switchLoggingState(); // Switch the logging on and off
					}
				}
			});
		return canvasDiv;
	}

	// Initializes the dimensions for nodes, comments layout etc.
	initializeLayoutInfo(config) {

		if (config.enableConnectionType === "Halo") {
			this.objectModel.setLayoutType("halo", config);

		} else { // Ports connection type
			if (config.enableNodeFormatType === "Horizontal") {
				this.objectModel.setLayoutType("ports-horizontal", config);

			} else { // Vertical
				this.objectModel.setLayoutType("ports-vertical", config);
			}
		}
	}

	paletteNodeDraggedOver(nodeTemplate, x, y) {
		this.renderer.paletteNodeDraggedOver(nodeTemplate, x, y);
	}

	nodeTemplateDropped(nodeTemplate, mousePos) {
		this.renderer.nodeTemplateDropped(nodeTemplate, mousePos);
	}

	externalObjectDropped(dropData, mousePos) {
		this.renderer.externalObjectDropped(dropData, mousePos);
	}

	zoomTo(zoomObject) {
		this.renderer.zoomTo(zoomObject);
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

	getZoomToReveal(objectIds) {
		return this.renderer ? this.renderer.getZoomToReveal(objectIds) : null;
	}

	refreshOnSizeChange() {
		this.renderer.refreshOnSizeChange();
	}

	getSvgViewportOffset() {
		return this.renderer.getSvgViewportOffset();
	}
}
