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


// Import just the D3 modules that are needed.
import * as d3 from "d3-selection";
import { cloneDeep } from "lodash";
import SVGCanvasRenderer from "./svg-canvas-renderer.js";
import ConfigUtils from "../object-model/config-utils.js";
import Logger from "../logging/canvas-logger.js";

export default class SVGCanvasD3 {

	constructor(canvasInfoId, canvasDivSelector, canvasController) {
		this.logger = new Logger(["SVGCanvasD3", "FlowId", canvasInfoId]);
		this.logger.logStartTimer("constructor");
		this.canvasController = canvasController;
		this.canvasDiv = d3.select(canvasDivSelector);
		this.logger.logEndTimer("constructor", true);
	}

	setCanvasInfo(canvasInfo, selectionInfo, breadcrumbs, nodeLayout, canvasLayout, config) {
		this.logger = new Logger(["SVGCanvasD3", "FlowId", canvasInfo.id]);
		if (!this.config ||
				!this.renderer ||
				!this.canvasInfo ||
				canvasInfo.id !== this.canvasInfo.id ||
				(this.renderer && this.renderer.pipelineId !== this.canvasController.getCurrentBreadcrumb().pipelineId) ||
				!ConfigUtils.compareCanvasConfigsOmitFields(this.config, config)) {
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
				selectionInfo,
				breadcrumbs,
				nodeLayout,
				canvasLayout,
				config,
				{ id: currentBreadcrumb.supernodeId, // Will be null for primary pipeline
					pipelineId: currentBreadcrumb.supernodeParentPipelineId // Will be null for primary pipeline
				}
			);

			this.logger.logEndTimer("initializing", true);

		} else {
			this.logger.logStartTimer("set canvas info");

			this.canvasInfo = this.cloneCanvasInfo(canvasInfo);
			this.config = this.cloneConfig(config);
			this.renderer.setCanvasInfoRenderer(this.canvasInfo, selectionInfo, breadcrumbs, nodeLayout, canvasLayout, this.config);

			this.logger.logEndTimer("set canvas info", true);
		}
	}

	setSelectionInfo(selectionInfo) {
		if (this.renderer) {
			this.renderer.setSelectionInfo(selectionInfo);
		}
	}

	// Returns a copy of the config object. This is necessary so that comparisons
	// with new config objects that are provided reveal differences. This will
	// not clone the contents of emptyCanvasContent, dropZoneCanvasContent nor
	// enableNodeLayout.
	cloneConfig(config) {
		return Object.assign({}, config);
	}

	// Returns a clone of the canvas info passed in.
	cloneCanvasInfo(canvasInfo) {
		return cloneDeep(canvasInfo);
	}

	isEditingText() {
		return this.renderer.isEditingText();
	}

	isDragging() {
		return this.renderer.isDragging();
	}

	convertPageCoordsToSnappedCanvasCoords(pos) {
		return this.renderer.convertPageCoordsToSnappedCanvasCoords(pos);
	}

	nodeTemplateDragStart(nodeTemplate) {
		this.renderer.nodeTemplateDragStart(nodeTemplate);
	}

	nodeTemplateDragOver(nodeTemplate, x, y) {
		this.renderer.nodeTemplateDragOver(nodeTemplate, x, y);
	}

	nodeTemplateDragEnd(nodeTemplate) {
		this.renderer.nodeTemplateDragEnd(nodeTemplate);
	}

	nodeTemplateDropped(nodeTemplate, x, y) {
		this.renderer.nodeTemplateDropped(nodeTemplate, x, y);
	}

	externalObjectDropped(dropData, x, y) {
		this.renderer.externalObjectDropped(dropData, x, y);
	}

	zoomTo(zoomObject, animateTime) {
		this.renderer.zoomTo(zoomObject, animateTime);
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

	isZoomedToMax() {
		return this.renderer ? this.renderer.isZoomedToMax() : false;
	}

	isZoomedToMin() {
		return this.renderer ? this.renderer.isZoomedToMin() : false;
	}

	getZoomToReveal(objectIds, xPos, yPos) {
		return this.renderer ? this.renderer.getZoomToReveal(objectIds, xPos, yPos) : null;
	}

	getZoom() {
		return this.renderer ? this.renderer.getZoom() : null;
	}

	setCommentEditingMode(commentId, pipelineId) {
		this.renderer.setCommentEditingMode(commentId, pipelineId);
	}

	setNodeLabelEditingMode(nodeId, pipelineId) {
		this.renderer.setNodeLabelEditingMode(nodeId, pipelineId);
	}

	setNodeDecorationLabelEditingMode(decId, nodeId, pipelineId) {
		this.renderer.setNodeDecorationLabelEditingMode(decId, nodeId, pipelineId);
	}

	setLinkDecorationLabelEditingMode(decId, linkId, pipelineId) {
		this.renderer.setLinkDecorationLabelEditingMode(decId, linkId, pipelineId);
	}

	refreshOnSizeChange() {
		if (this.renderer) {
			this.renderer.refreshOnSizeChange();
		}
	}

	getDefaultCommentOffset() {
		return this.renderer.getDefaultCommentOffset();
	}

	getTransformedViewportDimensions() {
		return this.renderer.getTransformedViewportDimensions();
	}

	getCanvasDimensionsWithPadding() {
		return this.renderer.getCanvasDimensionsWithPadding();
	}

	getGhostNode(nodeTemplate) {
		return this.renderer.getGhostNode(nodeTemplate);
	}

	setSpaceKeyPressed(state) {
		this.renderer.setSpaceKeyPressed(state);
	}

	isSpaceKeyPressed() {
		return this.renderer.isSpaceKeyPressed();
	}

	focusNextTabGroup(evt) {
		return this.renderer.focusNextTabGroup(evt);
	}

	focusPreviousTabGroup(evt) {
		return this.renderer.focusPreviousTabGroup(evt);
	}

	resetTabObjectIndex() {
		this.renderer.resetTabObjectIndex();
	}

	moveFocusTo(focusObj) {
		this.renderer.moveFocusTo(focusObj);
	}

	focusOnTextEntryElement(evt) {
		this.renderer.focusOnTextEntryElement(evt);
	}

	openCanvasContextOptions(evt) {
		this.renderer.openCanvasContextOptions(evt);
	}
}
