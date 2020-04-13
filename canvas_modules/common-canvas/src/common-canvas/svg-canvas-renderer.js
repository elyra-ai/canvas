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

/* eslint no-invalid-this: "off" */
/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

// Import just the D3 modules that are needed. Doing this means that the
// d3Event object needs to be explicitly imported.
var d3 = Object.assign({}, require("d3-drag"), require("d3-ease"), require("d3-selection"), require("d3-zoom"));
import { event as d3Event } from "d3-selection";
import union from "lodash/union";
import forIn from "lodash/forIn";
import get from "lodash/get";
import set from "lodash/set";
import isEmpty from "lodash/isEmpty";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, ERROR,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_CURVE, LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_LEFT_RIGHT, LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP,
	WARNING, CONTEXT_MENU_BUTTON, DEC_LINK, DEC_NODE, LEFT_ARROW_ICON,
	NODE_MENU_ICON, SUPER_NODE_EXPAND_ICON, NODE_ERROR_ICON, NODE_WARNING_ICON, PORT_OBJECT_CIRCLE, PORT_OBJECT_IMAGE,
	TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK, TRACKPAD_INTERACTION, SUPER_NODE, USE_DEFAULT_ICON }
	from "./constants/canvas-constants";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";
import Logger from "../logging/canvas-logger.js";
import LocalStorage from "./local-storage.js";
import CanvasUtils from "./common-canvas-utils.js";
import SvgCanvasLinks from "./svg-canvas-links.js";

const showLinksTime = false;

const NINETY_DEGREES_IN_RADIANS = 90 * (Math.PI / 180);


export default class SVGCanvasRenderer {
	constructor(pipelineId, canvasDiv, canvasController, canvasInfo, config, parentRenderer, parentSupernodeD3Selection) {
		this.logger = new Logger(["SVGCanvasRenderer", "PipeId", pipelineId]);
		this.logger.logStartTimer("Constructor");
		this.pipelineId = pipelineId;
		this.canvasDiv = canvasDiv;
		this.canvasInfo = canvasInfo;
		this.config = config;
		this.canvasController = canvasController;
		this.objectModel = this.canvasController.getObjectModel();
		this.parentRenderer = parentRenderer; // Optional parameter, only provided with sub-flow in-place display.
		this.parentSupernodeD3Selection = parentSupernodeD3Selection; // Optional parameter, only provided with sub-flow in-place display.
		this.activePipeline = this.getPipeline(pipelineId); // Must come after line setting this.canvasInfo
		this.setDisplayState();

		// An array of renderers for the supernodes on the canvas.
		this.superRenderers = [];

		// Our instance ID for adding to DOM element IDs
		this.instanceId = this.canvasController.getInstanceId();

		// Get the canvas layout info
		this.canvasLayout = this.objectModel.getCanvasLayout();

		// Initialize zoom variables
		this.initializeZoomVariables();

		this.linkUtils = new SvgCanvasLinks(this.canvasLayout, this.config);

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 2;

		// Allows us to track the sizing behavior of comments
		this.commentSizing = false;
		this.commentSizingId = 0;
		this.commentSizingDirection = "";

		// Allows us to track the sizing behavior of supernodes
		this.nodeSizing = false;
		this.nodeSizingId = 0;
		this.nodeSizingDirection = "";
		this.nodeSizingMovedNodes = [];

		// General purpose variables to allow us to hanlde resize and snap to grid
		this.resizeObjXPos = 0;
		this.resizeObjYPos = 0;
		this.resizeObjWidth = 0;
		this.resizeObjHeight = 0;

		// Allows us to track the editing of comments
		this.editingComment = false;
		this.editingCommentId = "";
		this.editingCommentChangesPending = false;

		// Allows us to record the drag behavior or nodes and comments.
		this.dragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		this.dragRunningX = 0;
		this.dragRunningY = 0;
		this.dragObjects = [];
		this.dragStartX = 0;
		this.dragStartY = 0;

		// The data link a node is currently being dragged over. It will be null
		// when the node being dragged is not over a data link.
		this.dragOverLink = null;

		// The node and port over which the 'guide' object for a new link is
		// being dragged. Used when enableHightlightPortOnNewLinkDrag config
		// option is switched on.
		this.dragNewLinkOverNode = null;
		this.dragNewLinkOverPort = null;

		// Allow us to track when a selection is being made so there is
		// no need to re-render whole canvas
		this.selecting = false;

		// Allows us to track when the binding nodes in a subflow are being moved.
		this.movingBindingNodes = false;

		// Used to monitor the region selection rectangle.
		this.regionSelect = false;
		this.region = { startX: 0, startY: 0, width: 0, height: 0 };

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

		// Object to store variables for dynamically drawing a new link line. The
		// existence of this object means a new link is being drawn. A null means
		// no link is currently being drawn.
		this.drawingNewLinkData = null;

		// Create a drag object for use with nodes and comments.
		this.drag = d3.drag()
			.on("start", this.dragStart.bind(this))
			.on("drag", this.dragMove.bind(this))
			.on("end", this.dragEnd.bind(this));

		// Create a zoom object for use with the canvas.
		this.zoom =
			d3.zoom()
				.scaleExtent([this.minScaleExtent, this.maxScaleExtent])
				.on("start", this.zoomStart.bind(this))
				.on("zoom", this.zoomAction.bind(this))
				.on("end", this.zoomEnd.bind(this));

		this.canvasSVG = this.createCanvasSVG();
		this.canvasGrp = this.createCanvasGroup(this.canvasSVG);

		this.resetCanvasSVGBehaviors();

		this.displayCanvas();

		// If we are showing a sub-flow in full screen mode, or the options is
		// switched on to alwas display it, show the back to parent control.
		if (this.isDisplayingSubFlowFullPage() ||
				this.canvasLayout.alwaysDisplayBackToParentFlow) {
			this.addBackToParentFlowArrow(this.canvasSVG);
		}

		// If we are showing a sub-flow in full screen mode, zoom it to fit the
		// screen so it looks similar to the in-place sub-flow view unless there
		// is a saved zoom for this pipeline.
		if (this.isDisplayingSubFlowFullPage()) {
			if (!this.config.enableSaveZoom ||
					this.config.enableSaveZoom === "None" ||
					(this.config.enableSaveZoom === "LocalStorage" && !this.getSavedZoom()) ||
					(this.config.enableSaveZoom === "Pipelineflow" && !this.activePipeline.zoom)) {
				this.zoomToFit();
			}
		}
		this.logger.logEndTimer("Constructor");
	}

	setDisplayState() {
		if (this.canvasController.getBreadcrumbs().length > 1 &&
				this.isDisplayingCurrentPipeline()) {
			this.displayState = "sub-flow-full-page";

		} else if (this.parentSupernodeD3Selection) { // Existence of this varable means we are rendering an in-place sub-flow
			this.displayState = "sub-flow-in-place";

		} else {
			this.displayState = "primary-flow-full-page";
		}
		this.logger.log("Display state set to " + this.displayState);
	}

	isDisplayingPrimaryFlowFullPage() {
		return this.displayState === "primary-flow-full-page";
	}

	isDisplayingSubFlow() {
		return this.displayState === "sub-flow-in-place" || this.displayState === "sub-flow-full-page";
	}

	isDisplayingSubFlowInPlace() {
		return this.displayState === "sub-flow-in-place";
	}

	isDisplayingSubFlowFullPage() {
		return this.displayState === "sub-flow-full-page";
	}

	isDisplayingFullPage() {
		return this.displayState === "primary-flow-full-page" || this.displayState === "sub-flow-full-page";
	}

	isCanvasEmptyOrBindingsOnly() {
		return (isEmpty(this.activePipeline.nodes) || this.containsOnlyBindingNodes(this.activePipeline)) &&
						isEmpty(this.activePipeline.comments);
	}

	containsOnlyBindingNodes(pipeline) {
		return !pipeline.nodes.find((node) => !this.isSuperBindingNode(node));
	}

	getParentSupernodeDatum() {
		return this.getSupernodeReferencing(this.activePipeline.id);
	}

	getParentRenderer() {
		return this.parentRenderer;
	}

	getSupernodeReferencing(targetPipelineId) {
		let node = null;
		this.canvasInfo.pipelines.forEach((pipeline) => {
			if (!node) {
				node = this.getSupernodeReferencingTarget(pipeline, targetPipelineId);
			}
		});
		return node;
	}

	getSupernodeReferencingTarget(pipeline, targetPipelineId) {
		return this.getSupernodes(pipeline).find((sn) => sn.subflow_ref.pipeline_id_ref === targetPipelineId);
	}

	getSupernodes(pipeline) {
		return pipeline.nodes.filter((node) => this.isSupernode(node));
	}

	getZoomTransform() {
		return this.zoomTransform;
	}

	initializeZoomVariables() {
		// Allows us to record the current zoom amounts.
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);

		// Allows us to record the start point of the current zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0 };
	}

	getPipeline(pipelineId) {
		const pipeline = this.canvasInfo.pipelines.find((p) => p.id === pipelineId);
		if (pipeline) {
			return pipeline;
		}
		return { id: pipelineId, nodes: [], comments: [], links: [] };
	}

	setCanvasInfoRenderer(canvasInfo) {
		this.logger.logStartTimer("setCanvasInfoRenderer");
		this.canvasInfo = canvasInfo;
		this.activePipeline = this.getPipeline(this.pipelineId);
		this.canvasLayout = this.objectModel.getCanvasLayout(); // Refresh the canvas layout info in case it changed.

		// Set the display state incase we changed from in-place to full-page
		// sub-flow display.
		this.setDisplayState();

		// Reset the SVG area's zoom behaviors. We do this in case the canvas has
		// changed from empty (no nodes/comments) where we do not need any zoom
		// behavior to populated (with at least one node or comment) where we do
		// need to zoom behavior, or vice versa.
		this.resetCanvasSVGBehaviors();

		// Reset the canvas cursor, in case we went from an empty canvas
		// (default cursor) to one with nodes and/or comments (hand cursor).
		this.resetCanvasCursor();

		// If a supernode and its corresponding pipeline has been deleted in the
		// object model we need to make sure the renderer is removed.
		this.superRenderers = this.cleanUpSuperRenderers();

		if (!this.canvasController.isTipOpening() && // No need to render if opening
				!this.canvasController.isTipClosing()) { // or closing a tip
			this.superRenderers.forEach((superRenderer) => {
				superRenderer.setCanvasInfoRenderer(canvasInfo);
			});
		}

		this.logger.logEndTimer("setCanvasInfoRenderer");
	}

	// Returns a subset of renderers, from the current set of super renderers,
	// that correspond to the supernodes for the active pipeline. This will
	// remove any renderers that do not have a corresponding supernode which
	// might happen when a supernode is deleted directly, or removed through an
	// undo action.
	cleanUpSuperRenderers() {
		const newSuperRenderers = [];
		const supernodes = this.getSupernodes(this.activePipeline);

		supernodes.forEach((supernode) => {
			const ren = this.getRendererForSupernode(supernode);
			if (ren) {
				newSuperRenderers.push(ren);
			}
		});
		return newSuperRenderers;
	}

	isExistingPipeline(pipelineId) {
		return this.canvasInfo.pipelines.find((p) => p.id === pipelineId);
	}

	clearCanvas() {
		this.canvasController.clearSelections();
		this.initializeZoomVariables();
		this.canvasSVG.remove();
	}

	isDisplayingCurrentPipeline() {
		return this.canvasController.getCurrentBreadcrumb().pipelineId === this.pipelineId;
	}

	// This is called when the user changes the size of the canvas area.
	refreshOnSizeChange() {
		if (this.isDisplayingSubFlowFullPage()) {
			this.displayBindingNodesToFitSVG();
		}
	}

	hideCanvas() {
		this.canvasSVG.style("display", "none");
	}

	displayCanvas() {
		this.logger.logStartTimer("displayCanvas");

		// Ensure the SVG area is displayed, incase it was previously hidden.
		this.canvasSVG.style("display", "inherit");

		this.displayComments(); // Show comments first so they appear under nodes, if there is overlap.
		this.displayNodes();
		this.displayLinks();

		if (this.isDisplayingSubFlowInPlace()) {
			this.displaySVGToFitSupernode();

		} else {
			this.restoreZoom();
		}

		// The supernode will not have any calculated port positions when the
		// subflow is being displayed full screen, so calculate them first.
		if (this.isDisplayingSubFlowFullPage()) {
			this.displayPortsForSubFlowFullPage();
		}

		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}
		this.logger.logEndTimer("displayCanvas");
	}

	// Ensures the binding ports for a full-page sub-flow are calculated
	// and displayed correctly.
	displayPortsForSubFlowFullPage() {
		this.setPortPositionsForNode(this.getParentSupernodeDatum());
		this.displayBindingNodesToFitSVG();
	}

	// Called during a resize.
	displaySVGToFitSupernode() {
		this.logger.log("displaySVGToFitSupernode - start");
		const dims = this.getParentSupernodeSVGDimensions();
		this.canvasSVG.attr("width", dims.width);
		this.canvasSVG.attr("height", dims.height);
		this.canvasSVG.attr("x", dims.x);
		this.canvasSVG.attr("y", dims.y);

		// Keep the background rectangle the same size as the SVG area.
		const background = this.canvasSVG.selectAll(this.getSelectorForClass("d3-svg-background"));
		background.attr("width", dims.width);
		background.attr("height", dims.height);

		this.zoomToFit();
		this.displayBindingNodesToFitSVG();
		this.logger.log("displaySVGToFitSupernode - end");
	}

	displayBindingNodesToFitSVG() {
		this.logger.log("displayBindingNodesToFitSVG - start");
		// Need to set port positions before moving super binding nodes because
		// we need ports poitioned correctly on the supernode so binding nodes are
		// moved to the right place.
		this.setPortPositionsAllNodes();
		this.moveSuperBindingNodes();
		this.movingBindingNodes = true;
		this.displayNodes();
		this.displayLinks();
		this.movingBindingNodes = false;
		this.logger.log("displayBindingNodesToFitSVG - end");
	}

	getSupernodeSVGDimensionsFor(pipelineId) {
		const datum = this.getSupernodeReferencing(pipelineId);
		return this.getSupernodeSVGDimensions(datum);
	}

	getParentSupernodeSVGDimensions() {
		const datum = this.getParentSupernodeDatum();
		return this.getSupernodeSVGDimensions(datum);
	}

	getSupernodeSVGDimensions(datum) {
		return {
			width: datum.width - (2 * this.canvasLayout.supernodeSVGAreaPadding),
			height: datum.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding,
			x: this.canvasLayout.supernodeSVGAreaPadding,
			y: this.canvasLayout.supernodeTopAreaHeight,
			x_pos: datum.x_pos + this.canvasLayout.supernodeSVGAreaPadding,
			y_pos: datum.y_pos + this.canvasLayout.supernodeTopAreaHeight
		};
	}

	// Moves the binding nodes in a sub-flow, which map to nodes in the parent
	// supernode, to the edge of the SVG area.
	moveSuperBindingNodes() {
		const svgRect = this.getViewPortDimensions();
		const transformedSVGRect = this.getTransformedSVGRect(svgRect, 0);

		// this.logger.log("transformedSVGRect" +
		// 	" x = " + transformedSVGRect.x +
		// 	" y = " + transformedSVGRect.y +
		// 	" width = " + transformedSVGRect.width +
		// 	" height = " + transformedSVGRect.height);

		const nodeSelector = this.getSelectorForClass("d3-node-group");
		const supernodeDatum = this.getParentSupernodeDatum();

		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM ||
				this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			const svgWid = supernodeDatum.width - (2 * this.canvasLayout.supernodeSVGAreaPadding);
			this.canvasGrp.selectAll(nodeSelector).each((d) => {
				if (d.isSupernodeInputBinding) {
					const x = this.getSupernodePortXOffset(d.id, supernodeDatum.inputs);
					d.x_pos = (transformedSVGRect.width * (x / svgWid)) + transformedSVGRect.x - d.outputs[0].cx;
					d.y_pos = this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM
						? transformedSVGRect.y - d.height
						: transformedSVGRect.y + transformedSVGRect.height;
				}
				if (d.isSupernodeOutputBinding) {
					const x = this.getSupernodePortXOffset(d.id, supernodeDatum.outputs);
					d.x_pos = (transformedSVGRect.width * (x / svgWid)) + transformedSVGRect.x - d.inputs[0].cx;
					d.y_pos = this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM
						? d.y_pos = transformedSVGRect.y + transformedSVGRect.height
						: d.y_pos = transformedSVGRect.y - d.height;
				}
			});

		} else {
			const svgHt = supernodeDatum.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding;
			this.canvasGrp.selectAll(nodeSelector).each((d) => {
				if (d.isSupernodeInputBinding) {
					d.x_pos = transformedSVGRect.x - d.width;
					const y = this.getSupernodePortYOffset(d.id, supernodeDatum.inputs);
					d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.outputs[0].cy;
				}
				if (d.isSupernodeOutputBinding) {
					d.x_pos = transformedSVGRect.x + transformedSVGRect.width;
					const y = this.getSupernodePortYOffset(d.id, supernodeDatum.outputs);
					d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.inputs[0].cy;
				}
			});
		}
	}

	getSupernodePortXOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cx - this.canvasLayout.supernodeSVGAreaPadding;
		}
		return 0;
	}

	getSupernodePortYOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cy - this.canvasLayout.supernodeTopAreaHeight;
		}
		return 0;
	}

	// Display bounding rectangles around the SVG area and the canvas area defined
	// by the nodes and comments.
	displayBoundingRectangles() {
		if (!this.activePipeline) {
			return;
		}
		const svgRect = this.getViewPortDimensions();
		const transformedSVGRect = this.getTransformedSVGRect(svgRect, 1);
		const canv = this.getCanvasDimensionsAdjustedForScale(1);
		const canvWithPadding = this.getCanvasDimensionsAdjustedForScale(1, this.getZoomToFitPadding());

		this.canvasGrp.selectAll(this.getSelectorForId("br_svg_rect")).remove();
		this.canvasGrp.selectAll(this.getSelectorForId("br_svg_rect_trans")).remove();
		this.canvasGrp.selectAll(this.getSelectorForId("br_canvas_rect")).remove();
		this.canvasGrp.selectAll(this.getSelectorForId("br_canvas_rect_with_padding")).remove();

		this.canvasGrp
			.append("rect")
			.attr("data-id", this.getId("br_svg_rect"))
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("height", svgRect.height)
			.attr("width", svgRect.width)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "none")
			.style("stroke", "black");

		this.canvasGrp
			.append("rect")
			.attr("data-id", this.getId("br_svg_rect_trans"))
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("height", transformedSVGRect.height)
			.attr("width", transformedSVGRect.width)
			.attr("x", transformedSVGRect.x)
			.attr("y", transformedSVGRect.y)
			.style("fill", "none")
			.style("stroke", "red");


		if (canv) {
			this.canvasGrp
				.append("rect")
				.attr("data-id", this.getId("br_canvas_rect"))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("height", canv.height)
				.attr("width", canv.width)
				.attr("x", canv.left)
				.attr("y", canv.top)
				.style("fill", "none")
				.style("stroke", "blue")
				.lower();
		}

		if (canvWithPadding) {
			this.canvasGrp
				.append("rect")
				.attr("data-id", this.getId("br_canvas_rect_with_padding"))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("height", canvWithPadding.height)
				.attr("width", canvWithPadding.width)
				.attr("x", canvWithPadding.left)
				.attr("y", canvWithPadding.top)
				.style("fill", "none")
				.style("stroke", "green")
				.lower();
		}

		if (this.config.enableBoundingRectangles &&
				this.superRenderers.length > 0) {
			this.superRenderers.forEach((sr) => sr.displayBoundingRectangles());
		}
	}

	isEditingComment() {
		if (this.editingComment) {
			return true;
		}
		let state = false;
		this.superRenderers.forEach((superRen) => {
			if (!state) {
				state = superRen.isEditingComment();
			}
		});
		return state;
	}

	// Returns a selector for the ID string like one of the following:
	// * [data-id='prefix_instanceID'][data-pipeline-id='1234']
	// * [data-id='prefix_instanceID_suffix'][data-pipeline-id='1234']
	// * [data-id='prefix_instanceID_suffix_suffix2'][data-pipeline-id='1234']
	// depending on what parameters are provided.
	getSelectorForId(prefix, suffix, suffix2) {
		let sel = this.getSelectorForIdWithoutPipeline(prefix, suffix, suffix2);
		sel += `[data-pipeline-id='${this.activePipeline.id}']`;
		return sel;
	}

	// Returns a selector for the ID string like one of the following:
	// * [data-id='prefix_instanceID']
	// * [data-id='prefix_instanceID_suffix']
	// * [data-id='prefix_instanceID_suffix_suffix2']
	// depending on what parameters are provided.
	getSelectorForIdWithoutPipeline(prefix, suffix, suffix2) {
		return `[data-id='${this.getId(prefix, suffix, suffix2)}']`;
	}

	// Returns a selector for the class name passed in which includes a
	// condition for selecting on the current pipelineId.
	getSelectorForClass(classs) {
		return `.${classs}[data-pipeline-id='${this.activePipeline.id}']`; // Add a '.' when selecting on a class
	}

	// Returns an ID string like one of the following:
	// * 'prefix_instanceID'
	// * 'prefix_instanceID_suffix'
	// * 'prefix_instanceID_suffix_suffix2'
	// depending on what parameters are provided.
	getId(prefix, suffix, suffix2) {
		let id = `${prefix}_${this.instanceId}`;
		if (suffix) {
			id += `_${suffix}`;
		}
		if (suffix2) {
			id += `_${suffix2}`;
		}
		return id;
	}

	// Returns the current mouse position transformed by the current zoom
	// transformation amounts based on the local SVG -- that is, if we're
	// displaying a sub-flow it is based on the SVG in the supernode.
	getTransformedMousePos() {
		return this.transformPos(this.getMousePos(this.canvasSVG));
	}

	// Returns the current mouse position. Note: Using d3.mouse is better than
	// calling d3Event.offsetX and d3Event.offsetX because in Firefox d3.mouse
	// provides an offset within the SVG area whereas in Firefox the d3Event
	// offset variables provide an offset from within the object the mouse is over.
	// Note: added checks for event to prevent error in FF when building in production:
	// TypeError: Value being assigned to SVGPoint.x is not a finite floating-point value.
	// Note: d3Event.scale added to the if below because that property will exist
	// on Safari when processing a 'gesturechange' event.
	getMousePos(svg) {
		if (d3Event instanceof MouseEvent || (d3Event && d3Event.sourceEvent) || d3Event.scale) {
			// Get mouse position relative to the top level SVG in the Div because,
			// when we're rendering a sub-flow this.canvasSVG will be the SVG in the supernode.
			const mousePos = d3.mouse(svg.node());
			return { x: mousePos[0], y: mousePos[1] };
		}
		return { x: 0, y: 0 };
	}

	// Transforms the x and y fields of the object passed in by the current zoom
	// transformation amounts to convert a coordinate position in screen pixels
	// to a coordinate position in zoomed pixels.
	transformPos(pos) {
		return {
			x: (pos.x - this.zoomTransform.x) / this.zoomTransform.k,
			y: (pos.y - this.zoomTransform.y) / this.zoomTransform.k
		};
	}

	// Transforms the x, y, height and width fields of the object passed in by the
	// current zoom transformation amounts to convert coordinate positions and
	// dimensions in screen pixels to coordinate positions and dimensions in
	// zoomed pixels.
	getTransformedSVGRect(svgRect, pad) {
		const transPad = (pad / this.zoomTransform.k);
		return {
			x: (-this.zoomTransform.x / this.zoomTransform.k) + transPad,
			y: (-this.zoomTransform.y / this.zoomTransform.k) + transPad,
			height: (svgRect.height / this.zoomTransform.k) - (2 * transPad),
			width: (svgRect.width / this.zoomTransform.k) - (2 * transPad)
		};
	}

	// Highlights any data link, that an 'insertable' nodeTemplate from the
	// palette, is dragged over.
	paletteNodeDraggedOver(nodeTemplate, x, y) {
		if (this.isNodeTemplateInsertableIntoLink(nodeTemplate)) {
			const link = this.getLinkAtMousePos(x, y);
			this.setLinkHighlighting(link);
		}
	}

	// Switches on or off data link highlighting depending on the element
	// passed in and keeps track of the currently highlighted link.
	setLinkHighlighting(link) {
		if (link) {
			if (!this.dragOverLink) {
				this.dragOverLink = link;
				this.setLinkDragOverHighlighting(this.dragOverLink, true);

			} else if (link.id !== this.dragOverLink.id) {
				this.setLinkDragOverHighlighting(this.dragOverLink, false);
				this.dragOverLink = link;
				this.setLinkDragOverHighlighting(this.dragOverLink, true);
			}
		} else {
			if (this.dragOverLink) {
				this.setLinkDragOverHighlighting(this.dragOverLink, false);
				this.dragOverLink = null;
			}
		}
	}

	// Switches on or off the drop-node highlighting on the link passed in.
	// This is called when the user drags an 'insertable' node over a link.
	setLinkDragOverHighlighting(link, state) {
		this.canvasGrp
			.select(this.getSelectorForId("link_line", link.id))
			.classed("d3-link-drop-node-highlight", state);
	}

	// Switches on or off node port highlighting depending on the node
	// passed in and keeps track of the currently highlighted node. This is
	// called as a new link is being drawn towards a target node to highlight
	// the target node.
	setNewLinkOverNode() {
		const node = this.getNodeAtMousePos(30);
		if (node && node.id !== this.drawingNewLinkData.srcObjId &&
				((this.drawingNewLinkData.action === "node-node" && !this.isPortConnected(node)) ||
					(this.drawingNewLinkData.action === "comment-node" && !this.isSrcObjConnectedToNode(this.drawingNewLinkData.srcObjId, node.id)))) {
			if (!this.dragNewLinkOverNode) {
				this.dragNewLinkOverNode = node;
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, true);

			} else if (node.id !== this.dragNewLinkOverNode.id) {
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = node;
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, true);
			}

		} else {
			if (this.dragNewLinkOverNode) {
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = null;
			}
		}
	}

	// Switches on or off the input-port highlighting on the node passed in.
	// This is called when the user drags a new link towards a target node.
	setNewLinkOverNodeHighlighting(node, state) {
		if (node &&
				((this.drawingNewLinkData.action === "node-node" && node.inputs && node.inputs.length > 0) ||
					this.drawingNewLinkData.action === "comment-node")) {
			this.canvasGrp.selectAll(this.getSelectorForId("node_grp", node.id))
				.attr("data-new-link-over", state ? "yes" : "no");
		}
	}

	// Removes the data-new-link-over attribute used for highlighting a node
	// that a new link is being dragged towards or over.
	setNewLinkOverNodeCancel() {
		const node = this.getNodeAtMousePos(40);
		this.setNewLinkOverNodeHighlighting(node, false);
		this.dragNewLinkOverNode = null;
	}

	// Returns true if the first port of the node passed in is in connected state
	// or false if it isn't connected.
	isPortConnected(node) {
		const connected = this.canvasGrp.selectAll(this.getSelectorForId("node_grp", node.id))
			.selectAll(this.getSelectorForClass(this.getNodeInputPortClassName()))
			.attr("connected");
		return connected === "yes";
	}

	// Returns true if the object for the src node ID passed in is currently
	// connected to the node for the trgNodeId passed in.
	isSrcObjConnectedToNode(srcObjId, trgNodeId) {
		const ret = this.activePipeline.links.filter((link) =>
			link.srcNodeId === srcObjId && link.trgNodeId === trgNodeId);
		return ret.length > 0;
	}

	// Processes the drop of a palette node template onto the canvas.
	nodeTemplateDropped(nodeTemplate, mousePos) {
		if (nodeTemplate === null) {
			return;
		}
		const transPos = this.transformMousePosForNode(mousePos);
		this.canvasController.createDroppedPalettedNode(nodeTemplate, this.dragOverLink, transPos, this.pipelineId);
	}

	// Processes the drop of an 'external' object onto the canvas. This may be
	// either a node from the desktop or even from elsewhere on the browser page.
	externalObjectDropped(dropData, mousePos) {
		if (dropData === null) {
			return;
		}
		const transPos = this.transformMousePosForNode(mousePos);
		this.canvasController.createDroppedExternalObject(dropData, transPos, this.pipelineId);
	}

	// Transforms the mouse position passed in to be appropriate for a palette
	// node or external object being dragged over the canvas.
	transformMousePosForNode(mousePos) {
		// Offset mousePos so new node appers in center of mouse location.
		mousePos.x -= (this.objectModel.getNodeLayout().defaultNodeWidth / 2) * this.zoomTransform.k;
		mousePos.y -= (this.objectModel.getNodeLayout().defaultNodeHeight / 2) * this.zoomTransform.k;

		let transPos = this.transformPos(mousePos);

		if (this.config.enableSnapToGridType === "During" ||
				this.config.enableSnapToGridType === "After") {
			transPos = this.snapToGridObject(transPos);
		}
		return transPos;
	}

	// Returns true if the nodeTemplate passed in is 'insertable' into a data
	// link between nodes on the canvas.
	isNodeTemplateInsertableIntoLink(nodeTemplate) {
		return this.config.enableInsertNodeDroppedOnLink &&
			this.isNonBindingNode(nodeTemplate);
	}

	// Returns true if the current drag objects array has a single node which
	// is 'insertable' into a data link between nodes on the canvas.
	isExistingNodeInsertableIntoLink() {
		return (this.config.enableInsertNodeDroppedOnLink &&
			this.dragObjects.length === 1 &&
			this.isNonBindingNode(this.dragObjects[0]));
	}

	getNode(nodeId) {
		const node = this.activePipeline.nodes.find((nd) => nd.id === nodeId);
		return (typeof node === "undefined") ? null : node;
	}

	getNodes(nodeIds) {
		const nodes = [];
		nodeIds.forEach((nId) => {
			const n = this.getNode(nId);
			if (n) {
				nodes.push(n);
			}
		});
		return nodes;
	}

	getNodePort(nodeId, portId, type) {
		const node = this.activePipeline.nodes.find((nd) => nd.id === nodeId);
		if (node) {
			let ports;
			if (type === "input") {
				ports = node.inputs;
			} else {
				ports = node.outputs;
			}
			const port = ports.find((p) => p.id === portId);
			return (typeof port === "undefined") ? null : port;
		}
		return null;
	}

	getComment(commentId) {
		const comment = this.activePipeline.comments.find((com) => com.id === commentId);
		return (typeof comment === "undefined") ? null : comment;
	}

	getNodeOrComment(id) {
		let obj = this.getNode(id);
		if (obj === null) {
			obj = this.getComment(id);
		}
		return obj;
	}

	// Sets the maximum zoom extent if we are the renderer of the top level flow
	// or calls the same method on our parent renderer if we are a sub-flow. This
	// means the factors will multiply as they percolate up to the top flow.
	setMaxZoomExtent(factor) {
		if (this.isDisplayingFullPage()) {
			const newMaxExtent = this.maxScaleExtent * factor;

			this.zoom.scaleExtent([this.minScaleExtent, newMaxExtent]);
		} else {
			const newFactor = Number(factor) * 1 / this.zoomTransform.k;
			this.parentRenderer.setMaxZoomExtent(newFactor);
		}
	}

	createCanvasSVG() {
		this.logger.log("Create Canvas SVG.");

		// For full screen display of primary or sub flows we use the canvasDiv as
		// the parent for the svg object and set width and height to fill the
		// containing Div.
		let parentObject = this.canvasDiv;
		let dims = {
			width: "100%",
			height: "100%",
			x: 0,
			y: 0
		};

		// When rendering supernode contents we use the parent supernode as the
		// parent for the svg object.
		if (this.isDisplayingSubFlowInPlace()) {
			parentObject = this.parentSupernodeD3Selection;
			dims = this.getParentSupernodeSVGDimensions();
		}

		const canvasSVG = parentObject
			.append("svg")
			.attr("class", "svg-area") // svg-area used by Chimp tests.
			.attr("width", dims.width)
			.attr("height", dims.height)
			.attr("x", dims.x)
			.attr("y", dims.y)
			.on("mouseenter", (d) => {
				// If we are a sub-flow (i.e we have a parent renderer) set the max
				// zoom extent with a factor calculated from our zoom amount.
				if (this.parentRenderer && this.config.enableZoomIntoSubFlows) {
					this.parentRenderer.setMaxZoomExtent(1 / this.zoomTransform.k);
				}
			})
			.on("mouseleave", (d) => {
				// If we are a sub-flow (i.e we have a parent renderer) set the max
				// zoom extent with a factor of 1.
				if (this.parentRenderer && this.config.enableZoomIntoSubFlows) {
					this.parentRenderer.setMaxZoomExtent(1);
				}
			});

		// This rectangle is added for two reasons:
		// 1. On Safari, wheel events will not go to the SVG unless there is an
		//    SVG object under the mouse pointer. Therefore we open this rectangle
		//    to fill the SVG area to catch those events in Safari. See this stack
		//    overflow issue for details:
		//    https://stackoverflow.com/questions/40887193/d3-js-zoom-is-not-working-with-mousewheel-in-safari
		// 2. If we're displaying a sub-flow inside a supernode (on any browser)
		//    we need a background rectangle to display the same color as
		//    the background of the main canvas.
		// So this rectangle is not needed on Chrome and Firefox with full page
		// display but we open it anyway, for consistency.
		canvasSVG
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", dims.width)
			.attr("height", dims.height)
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("class", "d3-svg-background")
			.attr("pointer-events", "all")
			.style("cursor", this.getCanvasCursor());

		// Only attach the 'defs' to the top most SVG area when we are displaying
		// either the primary pipeline full page or a sub-pipeline full page.
		if (this.isDisplayingFullPage()) {
			// Add defs element to allow a filter for the drop shadow
			// This only needs to be done once for the whole page.
			var defs = canvasSVG.append("defs");
			this.createDropShadow(defs);
		}

		return canvasSVG;
	}

	// Sets the canvas zoom and mouse behaviors on the canvas SVG area. This is
	// done when the SVG area is created and also when set new canvas info is
	// called. This is necessary because the canvas may transition between an
	// empty canvas and a populated canvas (i.e. a canvas with at least one node
	// or comment). In the empty case we do not want any zoom behavior and in
	// the populated case we do.
	resetCanvasSVGBehaviors() {
		// Remove zoom behaviors from canvasSVG area.
		this.canvasSVG.on(".zoom", null);

		// If there are no nodes or comments we don't apply any zoom behaviors
		// to the SVG area. We only attach the zoom behaviour to the top most SVG
		//  area i.e. when we are displaying either the primary pipeline full page
		// or a sub-pipeline full page.
		if (!this.isCanvasEmptyOrBindingsOnly() &&
				this.isDisplayingFullPage()) {
			// In mouse interaction mode the zoom behavior will hande all zooming
			// but in trackpad interaction mode we only need the zoom behavior to
			// handle region select
			this.canvasSVG
				.call(this.zoom);

			if (this.config.enableInteractionType === TRACKPAD_INTERACTION) {
				// On Safari, gesturestart, gesturechange, and gestureend will be
				// called for the pinch/spread gesture. This code not only implements
				// zoom on pinch/spread but also stops the whole browser page being
				// zoomed which is the default behavior for that gesture on Safari.
				// https://stackoverflow.com/questions/36458954/prevent-pinch-zoom-in-safari-for-osx
				this.canvasSVG
					.on("gesturestart", () => {
						this.scale = d3Event.scale;
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					})
					.on("gesturechange", () => {
						const delta = this.scale - d3Event.scale;
						this.scale = d3Event.scale;
						this.pinchZoom(delta);
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					})
					.on("gestureend", () => {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					})
					// On Chrome and Firefox, the wheel event will be called for
					// pinch/spread gesture with ctrlKey set to true (even when the
					// ctrl key is not pressed). See this stack overflow issue for details:
					// https://stackoverflow.com/questions/52130484/how-to-catch-pinch-and-stretch-gesture-events-in-d3-zoom-d3v4-v5
					// On Chrome, Firefox and Safari, the wheel event will be called
					// for two finger scroll.
					.on("wheel.zoom", () => {
						if (d3Event.ctrlKey) {
							const wheelDelta = (d3Event.deltaY * 0.01);
							this.pinchZoom(wheelDelta);
						} else {
							this.panCanvasBackground(
								this.zoomTransform.x - d3Event.deltaX,
								this.zoomTransform.y - d3Event.deltaY,
								this.zoomTransform.k
							);
						}
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					});
			}
		}

		// These behaviors will be applied to SVG areas at the top level and
		// SVG areas displaying an in-place subflow
		this.canvasSVG
			.on("mousemove.zoom", () => {
				// this.logger.log("Zoom - mousemove - drawingNewLink = " + this.drawingNewLinkData ? "yes" : "no");
				if (this.drawingNewLinkData) {
					this.drawNewLink();
				}
			})
			// Don't use mousedown.zoom here as it will replace the zoom start behavior
			// and prevent panning of canvas background.
			.on("mousedown", () => {
				this.logger.log("Canvas - mousedown");
				// When displaying inplace subflow and a context menu is requested
				// suppress the mouse down which would go to the containing supernode.
				// This prevents the deselection of any selected nodes in the subflow.
				if (this.isDisplayingSubFlowInPlace() &&
						d3Event.button === CONTEXT_MENU_BUTTON) {
					d3Event.stopPropagation();
				}
			})
			.on("mouseup.zoom", () => {
				this.logger.log("Canvas - mouseup-zoom");
				if (this.drawingNewLinkData) {
					this.stopDrawingNewLink();
				}
			})
			.on("click.zoom", () => {
				this.logger.log("Canvas - click-zoom");
				this.selecting = true;
				// Only clear selections if clicked on the canvas of the current active pipeline.
				// Clicking the canvas of an expanded supernode will select that node.
				if (this.isDisplayingCurrentPipeline()) {
					this.canvasController.clearSelections();
				}
				// Ensure 'selecting' flag is off before calling click action callback.
				this.selecting = false;
				this.canvasController.clickActionHandler({
					clickType: d3Event.type === "contextmenu" ? "SINGLE_CLICK_CONTEXTMENU" : "SINGLE_CLICK",
					objectType: "canvas",
					selectedObjectIds: this.objectModel.getSelectedObjectIds()
				});
			})
			.on("dblclick.zoom", () => {
				this.logger.log("Zoom - double click");
				this.canvasController.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "canvas",
					selectedObjectIds: this.objectModel.getSelectedObjectIds() });
			})
			.on("contextmenu.zoom", (d) => {
				this.logger.log("Zoom - context menu");
				this.openContextMenu("canvas");
			});
	}

	// Resets the pointer cursor on the background rectangle in the Canvas SVG area.
	resetCanvasCursor() {
		const selector = ".d3-svg-background[data-pipeline-id='" + this.activePipeline.id + "']";
		this.canvasSVG.select(selector).style("cursor", this.getCanvasCursor());
	}

	// Retuens the appropriate cursor for the canvas SVG area.
	getCanvasCursor() {
		if (this.isDisplayingFullPage()) {
			if (this.config.enableInteractionType === TRACKPAD_INTERACTION ||
					this.isCanvasEmptyOrBindingsOnly()) {
				return "default";
			}
			return "grab";
		}
		return "pointer";
	}

	pinchZoom(zoomDelta) {
		const canv = this.getCanvasDimensionsAdjustedForScale(1);
		const transMousePos = this.getTransformedMousePos();
		const k = this.zoomTransform.k - zoomDelta;

		if (k > this.minScaleExtent && k < this.maxScaleExtent) {
			let x = this.zoomTransform.x + (canv.left * zoomDelta);
			let y = this.zoomTransform.y + (canv.top * zoomDelta);

			x += ((transMousePos.x - canv.left) * zoomDelta);
			y += ((transMousePos.y - canv.top) * zoomDelta);

			this.zoomCanvasBackground(x, y, k);
		}
	}

	createCanvasGroup(canvasSVG) {
		return canvasSVG.append("g");
	}

	addBackToParentFlowArrow(canvasSVG) {
		const g = canvasSVG
			.append("g")
			.attr("transform", "translate(15, 15)")
			.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "yes");
			})
			.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "no");
			})
			.on("click", () => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				this.canvasController.displayPreviousPipeline();
			});

		g.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 210)
			.attr("height", 40)
			.attr("class", "d3-back-to-previous-flow-box");

		g.append("svg")
			.attr("x", 16)
			.attr("y", 11)
			.attr("width", 16)
			.attr("height", 16)
			.html(LEFT_ARROW_ICON)
			.attr("class", "d3-back-to-previous-flow-text");

		g.append("text")
			.attr("x", 40)
			.attr("y", 24)
			.attr("class", "d3-back-to-previous-flow-text")
			.text("Return to previous flow");
	}

	createDropShadow(defs) {
		var dropShadowFilter = defs.append("filter")
			.attr("id", this.getId("node_drop_shadow"))
			.attr("x", "-20%")
			.attr("y", "-20%")
			.attr("width", "200%")
			.attr("height", "200%");

		dropShadowFilter.append("feOffset")
			.attr("in", "SourceAlpha")
			.attr("dx", 1)
			.attr("dy", 1)
			.attr("result", "offOut");

		dropShadowFilter.append("feGaussianBlur")
			.attr("in", "offOut")
			.attr("stdDeviation", "3")
			.attr("result", "blurOut");

		dropShadowFilter.append("feBlend")
			.attr("in", "SourceGraphic")
			.attr("in2", "blurOut")
			.attr("mode", "normal");

		dropShadowFilter.append("feComponentTransfer")
			.append("feFuncA")
			.attr("type", "linear")
			.attr("slope", "0.2");

		var feMerge = dropShadowFilter.append("feMerge");
		feMerge.append("feMergeNode");
		feMerge.append("feMergeNode").attr("in", "SourceGraphic");
	}

	getMessageLevel(messages) {
		let messageLevel = "";
		if (messages && messages.length > 0) {
			for (const message of messages) {
				if (message.type === ERROR) {
					return message.type;
				} else if (message.type === WARNING) {
					messageLevel = message.type;
				}
			}
		}
		return messageLevel;
	}

	getMessageLabelClass(messages) {
		const messageLevel = this.getMessageLevel(messages);
		let labelClass = "";
		switch (messageLevel) {
		case ERROR:
			labelClass = "d3-node-error-label";
			break;
		case WARNING:
			labelClass = "d3-node-warning-label";
			break;
		default:
			break;
		}
		return labelClass;
	}

	getErrorMarkerClass(messages) {
		const messageLevel = this.getMessageLevel(messages);
		let labelClass = "d3-error-circle-off";
		switch (messageLevel) {
		case ERROR:
			labelClass = "d3-error-circle";
			break;
		case WARNING:
			labelClass = "d3-warning-circle";
			break;
		default:
			break;
		}
		return labelClass;
	}

	// Restores the zoom of the canvas, if it has changed, based on the type
	// of 'save zoom' specified in the configuration.
	restoreZoom() {
		let newZoom = null;

		if (this.config.enableSaveZoom === "Pipelineflow" &&
				this.activePipeline.zoom &&
				this.activePipeline.zoom.k &&
				this.activePipeline.zoom.x &&
				this.activePipeline.zoom.y &&
				this.activePipeline.zoom.k !== this.zoomTransform.k &&
				this.activePipeline.zoom.x !== this.zoomTransform.x &&
				this.activePipeline.zoom.y !== this.zoomTransform.y) {
			newZoom = this.activePipeline.zoom;

		} else if (this.config.enableSaveZoom === "LocalStorage") {
			const savedZoom = this.getSavedZoom();
			if (savedZoom &&
					(savedZoom.k !== this.zoomTransform.k ||
						savedZoom.x !== this.zoomTransform.x ||
						savedZoom.y !== this.zoomTransform.y)) {
				newZoom = savedZoom;
			}
		}

		if (newZoom) {
			this.zoomCanvasInvokeZoomBehavior(newZoom);
		}
	}

	// Zooms the canvas to amount specified in zoomTransform. Zooming the canvas
	// in this way will invoke the zoom behavior methods (zoomStart, zoomAction
	// and zoomEnd).
	zoomCanvasInvokeZoomBehavior(newZoomTransform, animateTime) {
		if (isFinite(newZoomTransform.x) &&
				isFinite(newZoomTransform.y) &&
				isFinite(newZoomTransform.k)) {
			const zoomTransform = d3.zoomIdentity.translate(newZoomTransform.x, newZoomTransform.y).scale(newZoomTransform.k);
			if (animateTime) {
				this.canvasSVG.call(this.zoom).transition()
					.duration(animateTime)
					.call(this.zoom.transform, zoomTransform);
			} else {
				this.canvasSVG.call(this.zoom.transform, zoomTransform);
			}
		}
	}

	// Saves the zoom object passed in for this pipeline in local storage.
	setSavedZoom(zoom) {
		const canvasSavedZoomValues = LocalStorage.get("canvasSavedZoomValues");
		const savedZooms = canvasSavedZoomValues ? JSON.parse(canvasSavedZoomValues) : {};
		set(savedZooms, [this.canvasInfo.id, this.pipelineId], zoom);
		LocalStorage.set("canvasSavedZoomValues", JSON.stringify(savedZooms));
	}

	// Returns the zoom for this pipeline saved in local storage
	getSavedZoom() {
		const canvasSavedZoomValues = LocalStorage.get("canvasSavedZoomValues");
		if (canvasSavedZoomValues) {
			const savedZoom = JSON.parse(canvasSavedZoomValues);
			return get(savedZoom, [this.canvasInfo.id, this.pipelineId]);
		}
		return null;
	}

	zoomToFit() {
		const padding = this.getZoomToFitPadding();
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1, padding);
		this.zoomToFitCanvas(canvasDimensions);
	}

	// Returns the padding space for the canvas objects to be zoomed which takes
	// into account any connections that need to be made to/from any sub-flow
	// binding nodes plus any space needed for the binding nodes ports.
	getZoomToFitPadding() {
		let padding = this.canvasLayout.zoomToFitPadding;

		if (this.isDisplayingSubFlow()) {
			// Allocate some space for connecting lines and the binding node ports
			const newPadding = this.getMaxZoomToFitPaddingForConnections() + (2 * this.canvasLayout.supernodeBindingPortRadius);
			padding = Math.max(padding, newPadding);
		}
		return padding;
	}

	zoomToFitCanvas(canvasDimensions) {
		const viewPortDimensions = this.getViewPortDimensions();

		if (canvasDimensions) {
			const xRatio = viewPortDimensions.width / canvasDimensions.width;
			const yRatio = viewPortDimensions.height / canvasDimensions.height;
			const newScale = Math.min(xRatio, yRatio, 1); // Don't let the canvas be scaled more than 1 in either direction

			this.zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions);
		}
	}

	zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions) {
		if (canvasDimensions) {
			let x = (viewPortDimensions.width - (canvasDimensions.width * newScale)) / 2;
			let y = (viewPortDimensions.height - (canvasDimensions.height * newScale)) / 2;

			x -= newScale * canvasDimensions.left;
			y -= newScale * canvasDimensions.top;

			this.zoomingToFitForScale = true;
			this.zoomCanvasInvokeZoomBehavior({ x: x, y: y, k: newScale });
			this.zoomingToFitForScale = false;
		}
	}

	zoomTo(zoomObject) {
		const animateTime = 500;
		this.zoomCanvasInvokeZoomBehavior(zoomObject, animateTime);
	}

	zoomIn() {
		if (this.zoomTransform.k < this.maxScaleExtent) {
			const newScale = Math.min(this.zoomTransform.k * 1.1, this.maxScaleExtent);
			this.zoomCanvasToViewPortCenter(newScale);
		}
	}

	zoomOut() {
		if (this.zoomTransform.k > this.minScaleExtent) {
			const newScale = Math.max(this.zoomTransform.k / 1.1, this.minScaleExtent);
			this.zoomCanvasToViewPortCenter(newScale);
		}
	}

	zoomCanvasToViewPortCenter(newScale) {
		const viewPortDimensions = this.getViewPortDimensions();
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1);

		this.zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions);
	}

	getZoomToReveal(nodeIDs) {
		const svgRect = this.getViewPortDimensions();
		const transformedSVGRect = this.getTransformedSVGRect(svgRect, 0);
		const nodes = this.getNodes(nodeIDs);
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScaleForObjs(nodes, [], 1, 10);

		if (canvasDimensions) {
			let xOffset;
			let yOffset;

			if (canvasDimensions.right > transformedSVGRect.x + transformedSVGRect.width) {
				xOffset = transformedSVGRect.x + transformedSVGRect.width - canvasDimensions.right;
			}
			if (canvasDimensions.left < transformedSVGRect.x) {
				xOffset = transformedSVGRect.x - canvasDimensions.left;
			}
			if (canvasDimensions.bottom > transformedSVGRect.y + transformedSVGRect.height) {
				yOffset = transformedSVGRect.y + transformedSVGRect.height - canvasDimensions.bottom;
			}
			if (canvasDimensions.top < transformedSVGRect.y) {
				yOffset = transformedSVGRect.y - canvasDimensions.top;
			}

			if (typeof xOffset !== "undefined" || typeof yOffset !== "undefined") {
				const x = this.zoomTransform.x + ((xOffset || 0)) * this.zoomTransform.k;
				const y = this.zoomTransform.y + ((yOffset || 0)) * this.zoomTransform.k;
				return { x: x || 0, y: y || 0, k: this.zoomTransform.k };
			}
		}

		return null;
	}

	// Returns the dimensions of the SVG area. When we are displaying a sub-flow
	// we can use the supernode's dimensions. If not we are displaying
	// full-page so we can use getBoundingClientRect() to get the dimensions
	// (for some reason that method doesn't return correct values with embedded SVG areas).
	getViewPortDimensions() {
		let viewPortDimensions = {};

		if (this.isDisplayingSubFlowInPlace()) {
			const dims = this.getParentSupernodeSVGDimensions();
			viewPortDimensions.width = dims.width;
			viewPortDimensions.height = dims.height;

		} else {
			viewPortDimensions = this.canvasSVG.node().getBoundingClientRect();
		}
		return viewPortDimensions;
	}

	zoomStart() {
		this.logger.log("zoomStart - " + JSON.stringify(d3Event.transform));

		// Ensure any open tip is closed before starting a zoom operation.
		this.canvasController.closeTip();

		// this.zoomingToFitForScale flag is used to avoid redo actions initialized
		// by Cmd+Shift+Z (where the shift key has been pressed) causing a region
		// selection to start. So whenever it is set, make sure we do a scale
		// operation.
		// Also, below, we must check the d3Event.sourceEvent because for a zoom
		// operation d3Event does not contain info about the shift key.
		if (this.zoomingToFitForScale) {
			this.regionSelect = false;
		} else if (d3Event.sourceEvent && d3Event.sourceEvent.shiftKey) {
			this.regionSelect = !(this.config.enableInteractionType === TRACKPAD_INTERACTION);
		} else {
			this.regionSelect = (this.config.enableInteractionType === TRACKPAD_INTERACTION);
		}

		if (this.regionSelect) {
			this.regionStartTransformX = d3Event.transform.x;
			this.regionStartTransformY = d3Event.transform.y;
			const transPos = this.getTransformedMousePos();
			this.region = {
				startX: transPos.x,
				startY: transPos.y,
				width: 0,
				height: 0
			};
		}

		// To make the new cursor style appear *immediately* on mousedown we set the
		// appropriate cursor style on the SVG background rectanagle. The cursor
		// overlay will handle the cursor style as the mouse is moved.
		const selector = ".d3-svg-background[data-pipeline-id='" + this.activePipeline.id + "']";
		if (this.regionSelect) {
			this.canvasSVG.select(selector).style("cursor", "crosshair");
		} else {
			this.canvasSVG.select(selector).style("cursor", "grabbing");
		}

		this.zoomStartPoint = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k };
	}

	zoomAction() {
		this.logger.log("zoomAction - " + JSON.stringify(d3Event.transform));

		// If the scale amount is the same we are not zooming, so we must be panning.
		if (d3Event.transform.k === this.zoomStartPoint.k) {
			if (this.regionSelect) {
				this.addTempCursorOverlay("crosshair");
				this.drawRegionSelector();

			} else {
				this.addTempCursorOverlay("grabbing");
				this.panCanvasBackground(d3Event.transform.x, d3Event.transform.y, d3Event.transform.k);
			}
		} else {
			this.zoomCanvasBackground(d3Event.transform.x, d3Event.transform.y, d3Event.transform.k);
		}
	}

	zoomEnd() {
		this.logger.log("zoomEnd - " + JSON.stringify(d3Event.transform));

		if (this.drawingNewLinkData) {
			this.stopDrawingNewLink();
			this.drawingNewLinkData = null;
		}

		if (d3Event.transform.k === this.zoomStartPoint.k &&
				this.regionSelect === true) {
			this.removeRegionSelector();

			// Reset the transform x and y to what they were before the region
			// selection action was started.
			d3Event.transform.x = this.regionStartTransformX;
			d3Event.transform.y = this.regionStartTransformY;

			// Only select objects if region selector area dimensions are > 5.
			if (Math.abs(this.region.width) > 5 &&
					Math.abs(this.region.height) > 5) {
				var { startX, startY, width, height } = this.getRegionDimensions();
				this.isSelecting = true;
				this.objectModel.selectInRegion(startX, startY, startX + width, startY + height, this.activePipeline.id);
			}
			this.regionSelect = false;

		} else if (this.isDisplayingFullPage()) {
			if (this.config.enableSaveZoom === "Pipelineflow") {
				const data = {
					editType: "zoomPipeline",
					editSource: "canvas",
					zoom: this.zoomTransform,
					pipelineId: this.activePipeline.id
				};
				this.canvasController.editActionHandler(data);

			} else if (this.config.enableSaveZoom === "LocalStorage") {
				this.setSavedZoom(this.zoomTransform);
			}
		}

		// Remove the cursor overlay and reset the SVG background rectangle
		// cursor style, which was set in the zoom start method.
		this.resetCanvasCursor();
		this.removeTempCursorOverlay();
	}

	panCanvasBackground(panX, panY, panK) {
		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		let x = panX;
		let y = panY;
		const k = panK;

		// If the canvas rectangle (nodes and comments) is smaller than the
		// SVG area then don't let the canvas be dragged out of the SVG area.
		// let canv;
		const canv = this.getCanvasDimensionsAdjustedForScale(k, this.canvasLayout.zoomToFitPadding);
		const zoomSvgRect = this.getViewPortDimensions();

		if (canv && canv.width < zoomSvgRect.width) {
			x = Math.max(-canv.left, Math.min(x, zoomSvgRect.width - canv.width - canv.left));
		}
		if (canv && canv.height < zoomSvgRect.height) {
			y = Math.max(-canv.top, Math.min(y, zoomSvgRect.height - canv.height - canv.top));
		}

		// Readjust the d3Event properties to the newly calculated values so d3Event
		// stays in sync with the actual pan amount. This is only needed when this
		// method is called from zoomAction as a result of the d3 zoom behavior when
		// using the Mouse interaction behavior. It is not needed when using the
		// Trackpad interaction behavior.
		if (d3Event && d3Event.transform) {
			d3Event.transform.x = x;
			d3Event.transform.y = y;
		}

		this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(k);
		this.canvasGrp.attr("transform", this.zoomTransform);

		// The supernode will not have any calculated port positions when the
		// subflow is being displayed full screen, so calculate them first.
		if (this.isDisplayingSubFlowFullPage()) {
			this.displayPortsForSubFlowFullPage();
		}
	}

	zoomCanvasBackground(x, y, k) {
		this.regionSelect = false;

		this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(k);
		this.canvasGrp.attr("transform", this.zoomTransform);

		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		// If this zoom is for a full page display (for either primary pipelines
		// or sub-pipeline) and there is a textarea (for comment entry) open,
		// apply the zoom transform to it.
		if (this.isDisplayingFullPage()) {
			const ta = this.canvasDiv.select(".d3-comment-entry");
			if (!ta.empty()) {
				const pipelineId = ta.attr("data-pipeline-id");
				const ren = this.getRendererForPipelineIdRecursively(pipelineId);
				ta.style("transform", ren.getTextAreaTransform(ta.datum()));
			}
		}

		// The supernode will not have any calculated port positions when the
		// subflow is being displayed full screen, so calculate them first.
		if (this.isDisplayingSubFlowFullPage()) {
			this.displayPortsForSubFlowFullPage();
		}
	}


	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. It
	// does not include the 'super binding nodes' which are the binding nodes in
	// a sub-flow that map to a port in the containing supernode. The dimensions
	// are scaled by k and padded by pad (if provided).
	getCanvasDimensionsAdjustedForScale(k, pad) {
		return this.getCanvasDimensionsAdjustedForScaleForObjs(this.activePipeline.nodes, this.activePipeline.comments, k, pad);
	}

	getCanvasDimensionsAdjustedForScaleForObjs(nodes, comments, k, pad) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		nodes.forEach((d) => {
			if (this.isSuperBindingNode(d)) { // Always ignore Supernode binding nodes
				return;
			}
			canvLeft = Math.min(canvLeft, d.x_pos - d.layout.nodeHighlightGap);
			canvTop = Math.min(canvTop, d.y_pos - d.layout.nodeHighlightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + d.layout.nodeHighlightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + d.layout.nodeHighlightGap);
		});

		comments.forEach((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.canvasLayout.commentHighlightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.canvasLayout.commentHighlightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.canvasLayout.commentHighlightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.canvasLayout.commentHighlightGap);
		});

		const canvWidth = canvRight - canvLeft;
		const canvHeight = canvBottom - canvTop;

		if (canvLeft === Infinity || canvTop === Infinity ||
				canvRight === -Infinity || canvBottom === -Infinity) {
			return null;
		}

		var padding = pad || 0;

		return {
			left: (canvLeft * k) - padding,
			top: (canvTop * k) - padding,
			right: (canvRight * k) + padding,
			bottom: (canvBottom * k) + padding,
			width: (canvWidth * k) + (2 * padding),
			height: (canvHeight * k) + (2 * padding)
		};
	}

	drawRegionSelector() {
		const transPos = this.getTransformedMousePos();
		this.region.width = transPos.x - this.region.startX;
		this.region.height = transPos.y - this.region.startY;

		this.removeRegionSelector();
		var { startX, startY, width, height } = this.getRegionDimensions();

		this.canvasGrp
			.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("x", startX)
			.attr("y", startY)
			.attr("class", "d3-region-selector");
	}

	removeRegionSelector() {
		this.canvasGrp.selectAll(".d3-region-selector").remove();
	}

	// Returns the startX, startY, width and height of the selction region
	// where startX and startY are always the top left corner of the region
	// and width and height are therefore always positive.
	getRegionDimensions() {
		var startX = this.region.startX;
		var startY = this.region.startY;
		var width = this.region.width;
		var height = this.region.height;

		if (width < 0) {
			width = Math.abs(width);
			startX = this.region.startX - width;
		}
		if (height < 0) {
			height = Math.abs(height);
			startY = this.region.startY - height;
		}

		return { startX, startY, width, height };
	}

	// Records the initial starting position of the object being dragged so
	// that drag increments can be added to the original starting
	// position to aide calculating the snap-to-grid position.
	initializeResizeVariables(resizeObj) {
		this.resizeObjXPos = resizeObj.x_pos;
		this.resizeObjYPos = resizeObj.y_pos;
		this.resizeObjWidth = resizeObj.width;
		this.resizeObjHeight = resizeObj.height;
	}

	// Returns an array of objects to drag. If enableDragWithoutSelect is true,
	// and the object on which this drag start has initiated is not in the
	// set of selected objects, then just that object is to be dragged. Otherwise,
	// the selected objects are the objects to be dragged.
	getDragObjects(d) {
		const selectedObjects = this.getSelectedNodesAndComments();

		if (this.config.enableDragWithoutSelect &&
				selectedObjects.findIndex((o) => o.id === d.id) === -1) {
			return [d];
		}

		return selectedObjects;
	}

	dragStart(d) {
		this.logger.logStartTimer("dragStart");
		if (this.commentSizing) {
			this.resizeObj = this.getComment(this.commentSizingId);
			this.initializeResizeVariables(this.resizeObj);

		} else if (this.nodeSizing) {
			this.resizeObj = this.getNode(this.nodeSizingId);
			this.initializeResizeVariables(this.resizeObj);

		} else {
			this.dragging = true;
			this.dragOffsetX = 0;
			this.dragOffsetY = 0;
			this.dragRunningX = 0;
			this.dragRunningY = 0;
			this.dragObjects = this.getDragObjects(d);
			this.dragStartX = this.dragObjects[0].x_pos;
			this.dragStartY = this.dragObjects[0].y_pos;

			// If we are dragging an 'insertable' node, set it to be translucent so
			// that, when it is dragged over a link line, the highlightd line can be seen OK.
			if (this.isExistingNodeInsertableIntoLink()) {
				this.setNodeTranslucentState(this.dragObjects[0].id, true);
			}
		}
		// Note: Comment and supernode resizing is started by the comment/supernode highlight rectangle.
		this.logger.logEndTimer("dragStart", true);
	}

	dragMove() {
		this.logger.logStartTimer("dragMove");
		if (this.commentSizing) {
			this.resizeComment();
		} else if (this.nodeSizing) {
			this.resizeNode();
		} else {
			this.dragOffsetX += d3Event.dx;
			this.dragOffsetY += d3Event.dy;

			// Limit the size a drag can be so, when the user is dragging objects in
			// an in-place subflow they do not drag them too far.
			// this.logger.log("Drag offset X = " + this.dragOffsetX + " y = " + this.dragOffsetY);
			if (this.dragOffsetX < 1000 && this.dragOffsetX > -1000 &&
					this.dragOffsetY < 1000 && this.dragOffsetY > -1000) {
				let	increment = { x: 0, y: 0 };

				if (this.config.enableSnapToGridType === "During") {
					const stgPos = this.snapToGridDraggedNode();

					increment = {
						x: stgPos.x - this.dragObjects[0].x_pos,
						y: stgPos.y - this.dragObjects[0].y_pos
					};

				} else {
					increment = {
						x: d3Event.dx,
						y: d3Event.dy
					};
				}

				this.dragRunningX += increment.x;
				this.dragRunningY += increment.y;

				this.dragObjects.forEach((d) => {
					d.x_pos += increment.x;
					d.y_pos += increment.y;
				});
			} else {
				this.dragOffsetX -= d3Event.dx;
				this.dragOffsetY -= d3Event.dy;
			}

			this.displayCanvas();

			if (this.isExistingNodeInsertableIntoLink()) {
				const link = this.getLinkAtMousePos(d3Event.sourceEvent.clientX, d3Event.sourceEvent.clientY);
				this.setLinkHighlighting(link);
			}
		}

		this.logger.logEndTimer("dragMove", true);
	}

	dragEnd(d) {
		this.logger.logStartTimer("dragEnd");

		this.removeTempCursorOverlay();

		if (this.commentSizing) {
			this.endCommentSizing();

		} else if (this.nodeSizing) {
			this.endNodeSizing();

		} else if (this.dragging) {
			// Set to false before updating object model so main body of displayNodes is run.
			this.dragging = false;

			// If we are dragging an 'insertable' node switch the translucent state off.
			if (this.isExistingNodeInsertableIntoLink()) {
				this.setNodeTranslucentState(this.dragObjects[0].id, false);
			}

			// If the pointer hasn't moved and enableDragWithoutSelect we interpret
			// that as a select on the object.
			if (this.dragOffsetX === 0 &&
					this.dragOffsetY === 0 &&
					this.config.enableDragWithoutSelect) {
				this.selectObject(
					d,
					d3Event.type,
					d3Event.sourceEvent.shiftKey,
					CanvasUtils.isCmndCtrlPressed(d3Event.sourceEvent));

			} else {
				if (this.dragRunningX !== 0 ||
						this.dragRunningY !== 0) {
					let dragFinalOffset = null;
					if (this.config.enableSnapToGridType === "After") {
						const stgPos = this.snapToGridDraggedNode();
						dragFinalOffset = {
							x: stgPos.x - this.dragStartX,
							y: stgPos.y - this.dragStartY
						};
					} else {
						dragFinalOffset = { x: this.dragRunningX, y: this.dragRunningY };
					}
					if (this.isExistingNodeInsertableIntoLink() &&
							this.dragOverLink) {
						this.canvasController.editActionHandler({
							editType: "insertNodeIntoLink",
							editSource: "canvas",
							node: this.dragObjects[0],
							link: this.dragOverLink,
							offsetX: dragFinalOffset.x,
							offsetY: dragFinalOffset.y,
							pipelineId: this.activePipeline.id });
					} else {
						this.canvasController.editActionHandler({
							editType: "moveObjects",
							editSource: "canvas",
							nodes: this.dragObjects.map((o) => o.id),
							offsetX: dragFinalOffset.x,
							offsetY: dragFinalOffset.y,
							pipelineId: this.activePipeline.id });
					}
				}
			}
		}
		this.logger.logEndTimer("dragEnd", true);
	}

	// Switches on or off the translucent state of the node identified by the
	// node ID passed in. This is used when an 'insertable' node is dragged on
	// the canvas. It makes is easier for the user to see the highlighted link
	// when the node is dragged over it.
	setNodeTranslucentState(nodeId, state) {
		const nodeGrpSelector = this.getSelectorForId("node_grp", nodeId);
		const nodeGrpSel = this.canvasSVG.select(nodeGrpSelector);
		nodeGrpSel.classed("d3-node-group-translucent", state);
	}

	// Returns the snap-to-grid position of the object positioned at
	// this.dragStartX and this.dragStartY after applying the current offset of
	// this.dragOffsetX and this.dragOffsetY.
	snapToGridDraggedNode() {
		const objPosX = this.dragStartX + this.dragOffsetX;
		const objPosY = this.dragStartY + this.dragOffsetY;

		return this.snapToGridObject({ x: objPosX, y: objPosY });
	}

	// Returns the snap-to-grid position of the object positioned at objPos.x
	// and objPos.y. The grid that is snapped to is defined by this.snapToGridX
	// and this.snapToGridY.
	snapToGridObject(objPos) {
		const stgPosX = CanvasUtils.snapToGrid(objPos.x, this.canvasLayout.snapToGridX);
		const stgPosY = CanvasUtils.snapToGrid(objPos.y, this.canvasLayout.snapToGridY);

		return { x: stgPosX, y: stgPosY };
	}

	displayNodes() {
		this.logger.logStartTimer("displayNodes " + this.getFlags());

		// Do not return from here if there are no nodes because there may
		// be still nodes on display that need to be deleted.

		const that = this;

		// Set the port positions for all ports - these will be needed when displaying
		// nodes and links. This needs to be done here because resizing the supernode
		// will cause its ports to move.
		this.setPortPositionsAllNodes();

		const nodeSelector = this.getSelectorForClass("d3-node-group");

		var nodeGroupSel = this.canvasGrp
			.selectAll(nodeSelector)
			.data(this.activePipeline.nodes, function(d) { return d.id; });

		// For any of these activities we don't need to do anything to the nodes.
		if (this.canvasController.isTipOpening() || this.canvasController.isTipClosing() || this.commentSizing) {
			this.logger.logEndTimer("displayNodes " + this.getFlags());
			return;

		} else if ((this.dragging && !this.nodeSizing && !this.commentSizing) || this.movingBindingNodes) {
			nodeGroupSel
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.datum((d) => that.getNode(d.id)); // Set the __data__ to the updated data

			if (this.isDisplayingSubFlow()) {
				nodeGroupSel
					.each(function(d) { // Use function so the 'this' pointer refers to the node.
						if (d.isSupernodeInputBinding) {
							that.updatePortRadiusAndPos(this, d, "d3-node-port-output");
						}
						if (d.isSupernodeOutputBinding) {
							that.updatePortRadiusAndPos(this, d, "d3-node-port-input");
							that.updatePortArrowPath(this, d, "d3-node-port-input-arrow");
						}
					});
			}

		} else if (this.selecting || this.regionSelect) {
			nodeGroupSel.each(function(d) {
				const nodeGrp = d3.select(this);
				nodeGrp.select(that.getSelectorForId("node_sel_outline", d.id))
					.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
					.attr("class", "d3-node-selection-highlight");
				that.setNodeStyles(d, "default", nodeGrp);
			});

			this.superRenderers.forEach((renderer) => {
				renderer.selecting = true;
				renderer.displayNodes();
				renderer.selecting = false;
			});

		} else {
			// Handle new nodes
			var newNodeGroups = nodeGroupSel.enter()
				.append("g")
				.attr("data-id", (d) => that.getId("node_grp", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "d3-node-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.setNodeStyles(d, "hover", d3.select(this));
					that.addDynamicNodeIcons(d, this);
					if (that.canOpenTip(TIP_TYPE_NODE)) {
						that.canvasController.closeTip(); // Ensure existing tip is removed when moving pointer within an in-place supernode
						that.canvasController.openTip({
							id: that.getId("node_tip", d.id),
							type: TIP_TYPE_NODE,
							targetObj: this,
							pipelineId: that.activePipeline.id,
							node: d
						});
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					const nodeGrp = d3.select(this);
					that.setNodeStyles(d, "default", nodeGrp);
					nodeGrp.select(that.getSelectorForId("node_body", d.id)).attr("hover", "no");
					that.removeDynamicNodeIcons(d, nodeGrp);
					that.canvasController.closeTip();
				})
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.logger.log("Node Group - mouse down");
					if (!this.config.enableDragWithoutSelect) {
						this.selectObject(
							d,
							d3Event.type,
							d3Event.shiftKey,
							CanvasUtils.isCmndCtrlPressed(d3Event));
					}
					this.logger.log("Node Group - finished mouse down");
				})
				.on("mousemove", (d) => {
					// this.logger.log("Node Group - mouse move");
					// Don't stop propogation. Mouse move messages must be allowed to
					// propagate to canvas zoom operation.
				})
				.on("mouseup", (d) => {
					d3Event.stopPropagation();
					this.logger.log("Node Group - mouse up");
					if (this.drawingNewLinkData) {
						this.completeNewLink(d);
					}
				})
				.on("click", (d) => {
					this.logger.log("Node Group - click");
					d3Event.stopPropagation();
				})
				.on("dblclick", (d) => {
					this.logger.log("Node Group - double click");
					d3Event.stopPropagation();
					var selObjIds = this.objectModel.getSelectedObjectIds();
					this.canvasController.clickActionHandler({
						clickType: "DOUBLE_CLICK",
						objectType: "node",
						id: d.id,
						selectedObjectIds: selObjIds,
						pipelineId: this.activePipeline.id
					});
				})
				.on("contextmenu", (d) => {
					this.logger.log("Node Group - context menu");
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					if (!this.isSuperBindingNode(d)) {
						// With enableDragWithoutSelect set to true, the object for which the
						// context menu is being requested needs to be implicitely selected.
						if (this.config.enableDragWithoutSelect) {
							this.selectObject(d, d3Event.type, d3Event.shiftKey, CanvasUtils.isCmndCtrlPressed(d3Event));
						}
						that.openContextMenu("node", d);
					}
				})
				.call(this.drag); // Must put drag after mousedown listener so mousedown gets called first.

			// Node sizing area.
			newNodeGroups.filter((d) => this.isSupernode(d))
				.append("path")
				.attr("data-id", (d) => this.getId("node_sizing", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.on("mousedown", (d) => {
					if (this.isExpandedSupernode(d)) {
						this.nodeSizing = true;
						this.nodeSizingInitialSize = { width: d.width, height: d.height };
						this.nodeSizingId = d.id;
						// Note - node resizing and finalization of size is handled by drag functions.
						this.addTempCursorOverlay(this.nodeSizingCursor);
					}
				})
				// Use mousemove as well as mouseenter so the cursor will change
				// if the pointer moves from one area of the node outline to another
				// (eg. from east area to north-east area) without exiting the node outline.
				// A mouseenter is triggered when the sizing operation stops and the
				// pointer leaves the temporary overlay (which is removed) and enters
				// the node outline.
				.on("mousemove mouseenter", function(d) {
					if (that.isExpandedSupernode(d) &&
							!that.isRegionSelectOrSizingInProgress()) { // Don't switch sizing direction if we are already sizing
						let cursorType = "pointer";
						if (!that.isPointerCloseToBodyEdge(d)) {
							that.nodeSizingDirection = that.getSizingDirection(d, d.layout.nodeCornerResizeArea);
							that.nodeSizingCursor = that.getCursorBasedOnDirection(that.nodeSizingDirection);
							cursorType = that.nodeSizingCursor;
						}
						d3.select(this).style("cursor", cursorType);
					}
				});

			// Node selection highlighting outline.
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("path")
				.attr("data-id", (d) => this.getId("node_sel_outline", d.id))
				.attr("data-pipeline-id", this.activePipeline.id);

			// Node body
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("path")
				.attr("data-id", (d) => this.getId("node_body", d.id))
				.attr("data-pipeline-id", this.activePipeline.id);

			// Image outline - this code used for debugging purposes
			// newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
			//	.append("rect")
			// 	.attr("width", (d) => d.layout.imageWidth)
			// 	.attr("height", (d) => d.layout.imageHeight)
			// 	.attr("x", (d) => d.layout.imagePosX)
			// 	.attr("y", (d) => d.layout.imagePosY)
			// 	.attr("class", "d3-node-image-outline");

			// Node image
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d) && d.layout.imageDisplay)
				.append("image")
				.attr("data-id", (d) => this.getId("node_image", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "node-image");

			// Label outline - this code used for debugging purposes
			// newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
			// 	.append("rect")
			// 	.attr("width", (d) => d.layout.labelMaxWidth)
			// 	.attr("height", (d) => d.layout.labelHeight)
			// 	.attr("x", (d) => this.getLabelOutlinePosX(d))
			// 	.attr("y", (d) => this.getLabelOutlinePosY(d))
			// 	.attr("class", "d3-label-outline");

			// Node Label
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("text")
				.attr("data-id", (d) => this.getId("node_label", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					const labelObj = d3.select(this);
					if (that.config.enableDisplayFullLabelOnHover &&
							this.textContent.endsWith("...")) {
						labelObj
							.attr("abbr-label", this.textContent) // Do this before setting the new label
							.text(d.label);
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					const labelObj = d3.select(this);
					const abbrLabel = labelObj.attr("abbr-label");
					if (abbrLabel && abbrLabel !== "") {
						labelObj.text(abbrLabel).attr("abbr-label", "");
					}
				});

			// Create Supernode renderers for any super nodes. Display/hide will be handled in 'new and existing'.
			newNodeGroups.filter((d) => this.isSupernode(d))
				.each(function(d) {
					that.createSupernodeRenderer(d, d3.select(this));
				});

			// Halo
			if (this.canvasLayout.connectionType === "halo") {
				newNodeGroups.append("circle")
					.filter((d) => d.layout.haloDisplay)
					.attr("data-id", (d) => this.getId("node_halo", d.id))
					.attr("data-pipeline-id", this.activePipeline.id)
					.attr("class", "d3-node-halo")
					.attr("cx", (d) => d.layout.haloCenterX)
					.attr("cy", (d) => d.layout.haloCenterY)
					.attr("r", (d) => d.layout.haloRadius)
					.on("mousedown", (d) => {
						this.logger.log("Halo - mouse down");
						d3Event.stopPropagation();
						this.drawingNewLinkData = {
							srcObjId: d.id,
							action: "node-node",
							startPos: this.getTransformedMousePos(),
							linkArray: []
						};
						this.drawNewLink();
					});
			}

			const newAndExistingNodeGrps =
				nodeGroupSel.enter().merge(nodeGroupSel);

			newAndExistingNodeGrps
				.each((d) => {
					const nodeGrp = this.canvasGrp.selectAll(this.getSelectorForId("node_grp", d.id));
					const node = this.getNode(d.id);

					nodeGrp
						.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
						.attr("style", that.getNodeGrpStyle(d))
						.datum(node); // Set the __data__ to the updated data

					// Node sizing area
					nodeGrp.select(this.getSelectorForId("node_sizing", d.id))
						.attr("d", (nd) => this.getNodeShapePathSizing(nd))
						.attr("class", "d3-node-sizing")
						.datum(node); // Set the __data__ to the updated data

					// Node selection highlighting
					nodeGrp.select(this.getSelectorForId("node_sel_outline", d.id))
						.attr("d", (nd) => this.getNodeShapePathOutline(nd))
						.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
						.attr("class", (nd) => "d3-node-selection-highlight")
						.datum(node); // Set the __data__ to the updated data

					// Move the dynamic icons (if any exist)
					nodeGrp.select(this.getSelectorForId("node_ellipsis_group", d.id))
						.attr("transform", (nd) => `translate(${this.getEllipsisPosX(nd)}, ${this.getEllipsisPosY(nd)})`);

					nodeGrp.select(this.getSelectorForId("node_exp_group", d.id))
						.attr("transform", (nd) => `translate(${this.getExpansionIconPosX(nd)}, ${this.canvasLayout.supernodeExpansionIconPosY})`);

					// Node styles
					this.setNodeStyles(d, "default", nodeGrp);

					// This code will remove custom attributes from a node. This might happen when
					// the user clicks the canvas background to remove the greyed out appearance of
					// a node that was 'cut' to the clipboard.
					// TODO - Remove this code if/when common canvas supports cut (which removes nodes
					// from the canvas) and when WML Canvas uses that clipboard support in place
					// of its own.
					nodeGrp.select(this.getSelectorForId("node_image", d.id))
						.attr("xlink:href", (nd) => this.getNodeImage(nd))
						.attr("x", (nd) => this.getNodeImagePosX(nd))
						.attr("y", (nd) => this.getNodeImagePosY(nd))
						.attr("width", (nd) => this.getNodeImageWidth(nd))
						.attr("height", (nd) => this.getNodeImageHeight(nd))
						.datum(node) // Set the __data__ to the updated data
						.each(function(nd) {
							var imageObj = d3.select(this);
							if (nd.customAttrs && nd.customAttrs.length > 0) {
								nd.customAttrs.forEach((customAttr) => {
									imageObj.attr(customAttr, "");
								});
							} else {
								imageObj.attr("data-is-cut", null); // TODO - This should be made generic
							}
						});

					// Set y for node label in new and existing nodes
					nodeGrp.select(this.getSelectorForId("node_label", d.id))
						.datum(node) // Set the __data__ to the updated data
						.attr("x", (nd) => this.getLabelPosX(nd))
						.attr("y", (nd) => this.getLabelPosY(nd))
						.text(function(nd) {
							var textObj = d3.select(this);
							return that.getNodeLabelText(nd, textObj);
						})
						.attr("class", (nd) => this.getLabelClass(nd));

					// Supernode sub-flow display
					if (this.isSupernode(d)) {
						const ren = this.getRendererForSupernode(d);
						if (ren) {
							if (this.isExpanded(d)) {
								ren.displayCanvas();
							} else {
								ren.hideCanvas(d);
							}
						}
					}

					// Node body updates
					nodeGrp.select(this.getSelectorForId("node_body", d.id))
						.datum(node) // Set the __data__ to the updated data
						.attr("d", (cd) => this.getNodeShapePath(cd))
						.attr("class", (cd) => this.getNodeBodyClass(cd));

					// Handle port related objects
					if (this.canvasLayout.connectionType === "ports") {
						// Input ports
						if (d.layout.inputPortDisplay && d.inputs && d.inputs.length > 0) {
							// This selector will select all input ports which are for the currently
							// active pipeline. It is necessary to select them by the active pipeline
							// because an expanded super node will include its own input ports as well
							// as those of the sub-flow nodes displayed in the supernode container and
							// when selecting for a supernode we need to exclude the ones from the sub-flow.
							const inSelector = this.getSelectorForClass(this.getNodeInputPortClassName());

							var inputPortSelection =
								nodeGrp.selectAll(inSelector)
									.data(d.inputs, function(p) { return p.id; });

							// Input port object
							inputPortSelection.enter()
								.append(d.layout.inputPortObject)
								.attr("data-id", (port) => this.getId("node_inp_port", d.id, port.id))
								.attr("data-pipeline-id", this.activePipeline.id)
								.attr("data-port-id", (port) => port.id) // This is needed by getNodeInputPortAtMousePos
								.attr("connected", "no")
								.attr("isSupernodeBinding", this.isSuperBindingNode(d) ? "yes" : "no")
								.on("mousedown", (port) => {
									if (this.config.enableAssocLinkCreation) {
										// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
										if (d3Event.button === 0) {
											CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
											const srcNode = this.getNode(d.id);
											this.drawingNewLinkData = {
												srcObjId: d.id,
												srcPortId: port.id,
												action: "node-node",
												srcNode: srcNode,
												startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
												portType: "input",
												portObject: d.layout.inputPortObject,
												portImage: d.layout.inputPortImage,
												portWidth: d.layout.inputPortWidth,
												portHeight: d.layout.inputPortHeight,
												portRadius: this.getPortRadius(srcNode),
												minInitialLine: srcNode.layout.minInitialLine,
												guideObject: d.layout.inputPortGuideObject,
												guideImage: d.layout.inputPortGuideImage,
												linkArray: []
											};
											this.drawNewLink();
										}
									}
								})
								.on("mouseenter", function(port) {
									CanvasUtils.stopPropagationAndPreventDefault(d3Event); // stop event propagation, otherwise node tip is shown
									if (that.canOpenTip(TIP_TYPE_PORT)) {
										that.canvasController.closeTip();
										that.canvasController.openTip({
											id: that.getId("node_port_tip", port.id),
											type: TIP_TYPE_PORT,
											targetObj: this,
											pipelineId: that.activePipeline.id,
											node: d,
											port: port
										});
									}
								})
								.on("mouseleave", (port) => {
									this.canvasController.closeTip();
								})
								.on("contextmenu", (port) => {
									this.logger.log("Input Port Circle - context menu");
									CanvasUtils.stopPropagationAndPreventDefault(d3Event);
									// With enableDragWithoutSelect set to true, the object for which the
									// context menu is being requested needs to be implicitely selected.
									if (this.config.enableDragWithoutSelect) {
										this.selectObject(d, d3Event.type, d3Event.shiftKey, CanvasUtils.isCmndCtrlPressed(d3Event));
									}

									this.openContextMenu("input_port", d, port);
								})
								.merge(inputPortSelection)
								.each(function(port) {
									const obj = d3.select(this);
									if (d.layout.inputPortObject === PORT_OBJECT_IMAGE) {
										obj
											.attr("xlink:href", d.layout.inputPortImage)
											.attr("x", port.cx - (d.layout.inputPortWidth / 2))
											.attr("y", port.cy - (d.layout.inputPortHeight / 2))
											.attr("width", d.layout.inputPortWidth)
											.attr("height", d.layout.inputPortHeight);
									} else {
										obj
											.attr("r", that.getPortRadius(d))
											.attr("cx", port.cx)
											.attr("cy", port.cy);
									}
								})
								.attr("class", (port) =>
									this.getNodeInputPortClassName() + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => that.getNodePort(d.id, port.id, "input"));

							inputPortSelection.exit().remove();

							// Don't show the port arrow when we are supporting association
							// link creation
							if (!this.config.enableAssocLinkCreation &&
									d.layout.inputPortObject === "circle" &&
									!this.isSuperBindingNode(d)) {
								const inArrSelector = this.getSelectorForClass("d3-node-port-input-arrow");

								var inputPortArrowSelection =
									nodeGrp.selectAll(inArrSelector)
										.data(d.inputs, function(p) { return p.id; });

								// Input port arrow in circle for nodes which are not supernode binding nodes.
								inputPortArrowSelection.enter()
									.append("path")
									.attr("data-id", (port) => this.getId("node_inp_port_arrow", d.id, port.id))
									.attr("data-pipeline-id", this.activePipeline.id)
									.attr("class", "d3-node-port-input-arrow")
									.attr("connected", "no")
									.attr("isSupernodeBinding", this.isSuperBindingNode(d) ? "yes" : "no")
									.on("mouseenter", function(port) {
										CanvasUtils.stopPropagationAndPreventDefault(d3Event); // stop event propagation, otherwise node tip is shown
										if (that.canOpenTip(TIP_TYPE_PORT)) {
											that.canvasController.openTip({
												id: that.getId("node_port_tip", port.id),
												type: TIP_TYPE_PORT,
												targetObj: this,
												pipelineId: that.activePipeline.id,
												node: d,
												port: port
											});
										}
									})
									.on("mouseleave", (port) => {
										this.canvasController.closeTip();
									})
									.on("contextmenu", (port) => {
										this.logger.log("Input Port Arrow - context menu");
										CanvasUtils.stopPropagationAndPreventDefault(d3Event);
										// With enableDragWithoutSelect set to true, the object for which the
										// context menu is being requested needs to be implicitely selected.
										if (this.config.enableDragWithoutSelect) {
											this.selectObject(d, d3Event.type, d3Event.shiftKey, CanvasUtils.isCmndCtrlPressed(d3Event));
										}
										this.openContextMenu("input_port", d, port);
									})
									.merge(inputPortArrowSelection)
									.attr("d", (port) => this.getPortArrowPath(port))
									.datum((port) => this.getNodePort(d.id, port.id, "input"));

								inputPortArrowSelection.exit().remove();
							}
						}

						// Output ports
						if (d.layout.outputPortDisplay && d.outputs && d.outputs.length > 0) {
							// This selector will select all output ports which are for the currently
							// active pipeline. It is necessary to select them by the active pipeline
							// because an expanded super node will include its own output ports as well
							// as those of the sub-flow nodes displayed in the supernode container and
							// when selecting for a supernode we need to exclude the ones from the sub-flow.
							const outSelector = this.getSelectorForClass("d3-node-port-output");

							var outputPortSelection = nodeGrp.selectAll(outSelector)
								.data(d.outputs, function(p) { return p.id; });

							outputPortSelection.enter()
								.append(d.layout.outputPortObject)
								.attr("data-id", (port) => this.getId("node_out_port", d.id, port.id))
								.attr("data-pipeline-id", this.activePipeline.id)
								.on("mousedown", (port) => {
									// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
									if (d3Event.button === 0) {
										CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
										const srcNode = this.getNode(d.id);
										this.drawingNewLinkData = {
											srcObjId: d.id,
											srcPortId: port.id,
											action: "node-node",
											srcNode: srcNode,
											startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
											portType: "output",
											portObject: d.layout.outputPortObject,
											portImage: d.layout.outputPortImage,
											portWidth: d.layout.outputPortWidth,
											portHeight: d.layout.outputPortHeight,
											portRadius: this.getPortRadius(srcNode),
											minInitialLine: srcNode.layout.minInitialLine,
											guideObject: d.layout.outputPortGuideObject,
											guideImage: d.layout.outputPortGuideImage,
											linkArray: []
										};
										this.drawNewLink();
									}
								})
								.on("mouseenter", function(port) {
									CanvasUtils.stopPropagationAndPreventDefault(d3Event); // stop event propagation, otherwise node tip is shown
									if (that.canOpenTip(TIP_TYPE_PORT)) {
										that.canvasController.closeTip();
										that.canvasController.openTip({
											id: that.getId("node_port_tip", port.id),
											type: TIP_TYPE_PORT,
											targetObj: this,
											pipelineId: that.activePipeline.id,
											node: d,
											port: port
										});
									}
								})
								.on("mouseleave", (port) => {
									this.canvasController.closeTip();
								})
								.on("contextmenu", (port) => {
									this.logger.log("Output Port Circle - context menu");
									CanvasUtils.stopPropagationAndPreventDefault(d3Event);
									// With enableDragWithoutSelect set to true, the object for which the
									// context menu is being requested needs to be implicitely selected.
									if (this.config.enableDragWithoutSelect) {
										this.selectObject(d, d3Event.type, d3Event.shiftKey, CanvasUtils.isCmndCtrlPressed(d3Event));
									}
									this.openContextMenu("output_port", d, port);
								})
								.merge(outputPortSelection)
								.each(function(port) {
									const obj = d3.select(this);
									if (d.layout.outputPortObject === PORT_OBJECT_IMAGE) {
										obj
											.attr("xlink:href", d.layout.outputPortImage)
											.attr("x", port.cx - (d.layout.outputPortWidth / 2))
											.attr("y", port.cy - (d.layout.outputPortHeight / 2))
											.attr("width", d.layout.outputPortWidth)
											.attr("height", d.layout.outputPortHeight);
									} else {
										obj
											.attr("r", that.getPortRadius(d))
											.attr("cx", port.cx)
											.attr("cy", port.cy);
									}
								})
								.attr("class", (port) => "d3-node-port-output" + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => this.getNodePort(d.id, port.id, "output"));

							outputPortSelection.exit().remove();
						}
					}

					if (!this.isSuperBindingNode(d)) {
						// Display error indicator
						this.addErrorMarker(d, nodeGrp);

						// Display decorators
						const decorations = CanvasUtils.getCombinedDecorations(d.layout.decorations, d.decorations);
						this.addDecorations(d, DEC_NODE, nodeGrp, decorations);
					}
				});

			// Remove any nodes that are no longer in the diagram.nodes array.
			nodeGroupSel.exit().remove();
		}
		this.logger.logEndTimer("displayNodes " + this.getFlags());
	}

	// Performs required action for when either a comment or node is selected.
	// This may mean: simply selecting the object; or adding the object to the
	// currently selected set of objects; or even toggling the object's selection
	// off. This method also sends a SINGLE_CLICK action to the
	// clickActionHandler callback in the host application.
	selectObject(d, d3EventType, isShiftKeyPressed, isCmndCtrlPressed) {
		this.selecting = true;

		if (!this.objectModel.isSelected(d.id, this.activePipeline.id)) {
			if (isShiftKeyPressed) {
				this.objectModel.selectSubGraph(d.id, this.activePipeline.id);
			} else {
				this.objectModel.toggleSelection(d.id, isCmndCtrlPressed, this.activePipeline.id);
			}
		} else {
			if (isCmndCtrlPressed) {
				this.objectModel.toggleSelection(d.id, isCmndCtrlPressed, this.activePipeline.id);
			}
		}
		// Ensure 'selecting' flag is off before calling click action callback.
		this.selecting = false;

		// Even though the single click message below should be emitted
		// from common canvas for comments, if we uncomment this line it prevents
		// the double click event going to the comment group object. This seems
		// to be a timing issue since the same problem is not evident with the
		// similar code for the node group object.
		// TODO - Issue 2465 - Find out why this problem occurs.
		const objectTypeName = this.getComment(d.id) ? "comment" : "node";
		if (objectTypeName === "node") {
			this.canvasController.clickActionHandler({
				clickType: d3EventType === "contextmenu" || this.ellipsisClicked ? "SINGLE_CLICK_CONTEXTMENU" : "SINGLE_CLICK",
				objectType: objectTypeName,
				id: d.id,
				selectedObjectIds: this.objectModel.getSelectedObjectIds(),
				pipelineId: this.activePipeline.id });
			this.ellipsisClicked = false;
		}
	}

	// Adds a set of decorations to either a node or link object.
	// d       - This is a node or link object.
	// objType - A string set to either DEC_NODE or DEC_LINK.
	// trgGrp  - A D3 selection object that references the node or link to
	//           which the decorations are to be attached.
	// decs    - An array of decorations to be applied to the node or link.
	//           This is a combination of the object's decorations with any
	//           decorations from the layout config information.
	addDecorations(d, objType, trgGrp, decs) {
		const decorations = decs || [];
		const decGrpClassName = `d3-${objType}-dec-group`;
		const decGrpSelector = this.getSelectorForClass(decGrpClassName);
		const decGroupsSel = trgGrp.selectAll(decGrpSelector)
			.data(decorations, function(dec) { return dec.id; });

		const newDecGroups = decGroupsSel.enter()
			.append("g")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_group`, dec.id)) // Used in Chimp tests
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("class", decGrpClassName);

		newDecGroups
			.filter((dec) => dec.hotspot)
			.on("mousedown", (dec) => this.callDecoratorCallback(d, dec, objType));

		newDecGroups.filter((dec) => !dec.label && dec.outline !== false)
			.append("rect")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_outln`, dec.id)); // Used in Chimp tests

		newDecGroups.filter((dec) => dec.image)
			.append("image")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_image`, dec.id)); // Used in Chimp tests

		newDecGroups.filter((dec) => dec.label)
			.append("text")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_label`, dec.id)); // Used in Chimp tests

		const newAndExistingDecGrps =
			decGroupsSel.enter().merge(decGroupsSel);

		newAndExistingDecGrps
			.each((dec) => {
				const decGrp = trgGrp.selectAll(this.getSelectorForId(`${objType}_dec_group`, dec.id));
				const decDatum = this.getDecorator(dec.id, decorations);
				decGrp
					.attr("transform", `translate(${this.getDecoratorX(dec, d, objType)}, ${this.getDecoratorY(dec, d, objType)})`);

				// We didn't add pipeline ID to these sub-objects so don't include it in
				// the predicate of the selector.
				const outlnSelector = this.getSelectorForIdWithoutPipeline(`${objType}_dec_outln`, dec.id);
				const imageSelector = this.getSelectorForIdWithoutPipeline(`${objType}_dec_image`, dec.id);
				const labelSelector = this.getSelectorForIdWithoutPipeline(`${objType}_dec_label`, dec.id);

				decGrp.select(outlnSelector)
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", this.getDecoratorWidth(dec, d, objType))
					.attr("height", this.getDecoratorHeight(dec, d, objType))
					.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-outline`))
					.datum(decDatum);

				decGrp.select(imageSelector)
					.attr("x", this.getDecoratorPadding(dec, d, objType))
					.attr("y", this.getDecoratorPadding(dec, d, objType))
					.attr("width", this.getDecoratorWidth(dec, d, objType) - (2 * this.getDecoratorPadding(dec, d, objType)))
					.attr("height", this.getDecoratorHeight(dec, d, objType) - (2 * this.getDecoratorPadding(dec, d, objType)))
					.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-image`))
					.attr("xlink:href", this.getDecoratorImage(dec))
					.datum(decDatum);

				decGrp.select(labelSelector)
					.attr("x", 0)
					.attr("y", 0)
					.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-label`))
					.text(dec.label)
					.datum(decDatum);
			});

		decGroupsSel.exit().remove();
	}

	addErrorMarker(d, nodeGrp) {
		const errorMarkerSelector = this.getSelectorForClass("node-error-marker");
		const errorMarkerSelection = nodeGrp.selectAll(errorMarkerSelector);

		if (d.messages && d.messages.length > 0) {
			if (errorMarkerSelection.empty()) {
				nodeGrp
					.append("svg")
					.attr("data-id", this.getId("node_error_marker", d.id))
					.attr("data-pipeline-id", this.activePipeline.id)
					.attr("class", () => "node-error-marker"); // Need to set this so following selection will work
			}

			nodeGrp.selectAll(errorMarkerSelector)
				.attr("class", () => "node-error-marker " + this.getErrorMarkerClass(d.messages))
				.html(this.getErrorMarkerIcon(d))
				.attr("width", d.layout.errorWidth)
				.attr("height", d.layout.errorHeight)
				.attr("x", this.getErrorPosX(d, nodeGrp))
				.attr("y", this.getErrorPosY(d));

		} else {
			if (!errorMarkerSelection.empty()) {
				errorMarkerSelection.remove();
			}
		}
	}

	getNodeInputPortClassName(port) {
		if (this.config.enableAssocLinkCreation) {
			return "d3-node-port-input-assoc";
		}
		return "d3-node-port-input";
	}

	getNodeImage(d) {
		if (!d.image) {
			return null;
		} else if (d.image === USE_DEFAULT_ICON) {
			if (this.isSupernode(d)) {
				return SUPERNODE_ICON;
			}
		}
		return d.image;
	}

	getNodeImageWidth(d) {
		if (this.isExpandedSupernode(d)) {
			return this.canvasLayout.supernodeImageWidth;
		}
		return d.layout.imageWidth;
	}

	getNodeImageHeight(d) {
		if (this.isExpandedSupernode(d)) {
			return this.canvasLayout.supernodeImageHeight;
		}
		return d.layout.imageHeight;
	}

	getNodeImagePosX(d) {
		if (this.isExpandedSupernode(d)) {
			return this.canvasLayout.supernodeImagePosX;
		}
		return d.layout.imagePosX;
	}

	setNodeStyles(d, type, nodeGrp) {
		this.setNodeBodyStyles(d, type, nodeGrp);
		this.setNodeSelectionOutlineStyles(d, type, nodeGrp);
		this.setNodeImageStyles(d, type, nodeGrp);
		this.setNodeLabelStyles(d, type, nodeGrp);
	}

	setNodeBodyStyles(d, type, nodeGrp) {
		let style = this.getObjectStyle(d, "body", type);
		// For port-arcs display we reapply the drop shadow if no styles is provided
		if (style === null && d.layout.dropShadow) {
			style = `filter:url(${this.getId("#node_drop_shadow")})`;
		}
		nodeGrp.select(this.getSelectorForId("node_body", d.id)).attr("style", style);
	}

	setNodeSelectionOutlineStyles(d, type, nodeGrp) {
		const style = this.getObjectStyle(d, "selection_outline", type);
		nodeGrp.select(this.getSelectorForId("node_sel_outline", d.id)).attr("style", style);
	}

	setNodeImageStyles(d, type, nodeGrp) {
		const style = this.getObjectStyle(d, "image", type);
		nodeGrp.select(this.getSelectorForId("node_image", d.id)).attr("style", style);
	}

	setNodeLabelStyles(d, type, nodeGrp) {
		const style = this.getObjectStyle(d, "label", type);
		nodeGrp.select(this.getSelectorForId("node_label", d.id)).attr("style", style);
	}

	getNodeGrpStyle(d) {
		return !d.style_temp && !d.style && this.canvasInfo.subdueStyle && !this.doesExpandedSupernodeHaveStyledNodes(d)
			? this.canvasInfo.subdueStyle
			: null;
	}

	getLinkGrpStyle(d) {
		return !d.style_temp && !d.style && this.canvasInfo.subdueStyle
			? this.canvasInfo.subdueStyle
			: null;
	}

	doesExpandedSupernodeHaveStyledNodes(d) {
		let expandedSupernodeHaveStyledNodes = false;
		if (this.isExpandedSupernode(d) && d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			const subflow = this.getPipeline(d.subflow_ref.pipeline_id_ref);
			const nodeGrp = subflow.nodes;
			nodeGrp.forEach((node) => {
				if (node.style || node.style_temp) {
					expandedSupernodeHaveStyledNodes = true;
					return;
				} else if (!expandedSupernodeHaveStyledNodes && this.isExpandedSupernode(node)) {
					expandedSupernodeHaveStyledNodes = this.doesExpandedSupernodeHaveStyledNodes(node);
				}
			});
		}
		return expandedSupernodeHaveStyledNodes;
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
		const inputBindingNodes = this.activePipeline.nodes.filter((n) => n.isSupernodeInputBinding);

		inputBindingNodes.forEach((n) => {
			const nodePadding = CanvasUtils.getNodePaddingToTargetNodes(n, this.activePipeline.nodes,
				this.activePipeline.links, this.canvasLayout.linkType);
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
		const outputBindingNodes = this.activePipeline.nodes.filter((n) => n.isSupernodeOutputBinding);

		this.activePipeline.nodes.forEach((n) => {
			const nodePadding = CanvasUtils.getNodePaddingToTargetNodes(n, outputBindingNodes,
				this.activePipeline.links, this.canvasLayout.linkType);
			maxPadding = Math.max(maxPadding, nodePadding);
		});

		return maxPadding;
	}

	getPortRadius(d) {
		return this.isSuperBindingNode(d) ? this.getBindingPortRadius() : d.layout.portRadius;
	}

	// Returns the radius size of the supernode binding ports scaled up by
	// the zoom scale amount to give the actual size.
	getBindingPortRadius() {
		return this.canvasLayout.supernodeBindingPortRadius / this.zoomTransform.k;
	}

	isSuperBindingNode(d) {
		return d.isSupernodeInputBinding || d.isSupernodeOutputBinding;
	}

	addDynamicNodeIcons(d, nodeGrpSrc) {
		if (!this.nodeSizing && !this.isSuperBindingNode(d)) {
			const nodeGrp = d3.select(nodeGrpSrc);
			nodeGrp.select(this.getSelectorForId("node_body", d.id)).attr("hover", "yes");

			const ellipsisGrp = nodeGrp
				.append("g")
				.filter(() => d.layout.ellipsisDisplay)
				.attr("data-id", this.getId("node_ellipsis_group", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "d3-node-ellipsis-group")
				.attr("transform", (nd) => `translate(${this.getEllipsisPosX(nd)}, ${this.getEllipsisPosY(nd)})`)
				.on("mousedown", (nd) => {
					this.ellipsisClicked = true;
				})
				.on("click", () => {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.openContextMenu("node", d);
				});

			ellipsisGrp
				.append("rect")
				.attr("class", "d3-node-ellipsis-background")
				.attr("width", (nd) => this.getEllipsisWidth(nd))
				.attr("height", (nd) => this.getEllipsisHeight(nd))
				.attr("x", 0)
				.attr("y", 0);

			ellipsisGrp
				.append("svg")
				.attr("class", "d3-node-ellipsis")
				.html(NODE_MENU_ICON)
				.attr("width", (nd) => this.getEllipsisWidth(nd) - (2 * nd.layout.ellipsisHoverAreaPadding))
				.attr("height", (nd) => this.getEllipsisHeight(nd) - (2 * nd.layout.ellipsisHoverAreaPadding))
				.attr("x", (nd) => nd.layout.ellipsisHoverAreaPadding)
				.attr("y", (nd) => nd.layout.ellipsisHoverAreaPadding);


			// Add Supernode expansion icon and background for expanded supernodes
			if (this.isExpandedSupernode(d)) {
				const expGrp = nodeGrp
					.append("g")
					.attr("data-id", this.getId("node_exp_group", d.id))
					.attr("data-pipeline-id", this.activePipeline.id)
					.attr("transform", (nd) => `translate(${this.getExpansionIconPosX(nd)}, ${this.canvasLayout.supernodeExpansionIconPosY})`)
					.attr("class", "d3-node-super-expand-icon-group")
					.on("click", () => {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.displaySupernodeFullPage(d);
					})
					.on("mouseenter", function(nd) { // Use function keyword so 'this' pointer references the DOM text object
						d3.select(this).attr("data-pointer-hover", "yes");
					})
					.on("mouseleave", function(nd) { // Use function keyword so 'this' pointer references the DOM text object
						d3.select(this).attr("data-pointer-hover", "no");
					});

				expGrp
					.append("rect")
					.attr("class", "d3-node-super-expand-icon-background")
					.attr("width", this.canvasLayout.supernodeExpansionIconWidth)
					.attr("height", this.canvasLayout.supernodeExpansionIconHeight)
					.attr("x", 0)
					.attr("y", 0);

				expGrp
					.append("svg")
					.attr("class", "d3-node-super-expand-icon")
					.html(SUPER_NODE_EXPAND_ICON)
					.attr("width", this.canvasLayout.supernodeExpansionIconWidth - (2 * this.canvasLayout.supernodeExpansionIconHoverAreaPadding))
					.attr("height", this.canvasLayout.supernodeExpansionIconHeight - (2 * this.canvasLayout.supernodeExpansionIconHoverAreaPadding))
					.attr("x", this.canvasLayout.supernodeExpansionIconHoverAreaPadding)
					.attr("y", this.canvasLayout.supernodeExpansionIconHoverAreaPadding);
			}
		}
	}

	updatePortRadiusAndPos(node, d, cssNodePort) {
		const nodeGrp = d3.select(node);
		const selector = this.getSelectorForClass(cssNodePort);
		nodeGrp.selectAll(selector)
			.attr("r", () => this.getPortRadius(d))
			.attr("cx", (port) => port.cx)
			.attr("cy", (port) => port.cy); // Port position may change for binding nodes with multiple-ports.
	}

	updatePortArrowPath(node, d, cssNodePortArrow) {
		const nodeGrp = d3.select(node);
		const selector = this.getSelectorForClass(cssNodePortArrow);
		nodeGrp.selectAll(selector)
			.attr("d", (port) => this.getPortArrowPath(port));
	}

	isEntryBindingNode(node) {
		return node.type === "binding" && node.outputs && node.outputs.length > 0;
	}

	isExitBindingNode(node) {
		return node.type === "binding" && node.inputs && node.inputs.length > 0;
	}

	isNonBindingNode(node) {
		return (node.inputs &&
						node.inputs.length > 0 &&
						node.outputs &&
						node.outputs.length > 0);
	}

	removeDynamicNodeIcons(d, nodeGrp) {
		if (d.layout.ellipsisDisplay) {
			nodeGrp.selectAll(this.getSelectorForId("node_ellipsis_group", d.id)).remove();
		}
		nodeGrp.selectAll(this.getSelectorForId("node_exp_group", d.id)).remove();
	}

	createSupernodeRenderer(d, supernodeD3Object) {
		if (d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			if (!this.getRendererForSupernode(d)) { // If a renderer exists from a previous run, no need to create new one.
				const superRenderer = new SVGCanvasRenderer(
					d.subflow_ref.pipeline_id_ref,
					this.canvasDiv,
					this.canvasController,
					this.canvasInfo,
					this.config,
					this,
					supernodeD3Object);
				this.superRenderers.push(superRenderer);
			}
		}
	}

	deleteSupernodeRenderer(d) {
		// TODO - using pipelineId as unique identifier for renderer may be
		// a problem if two super nodes are displayed for the same sub-flow pipeline
		const idx = this.indexOfSuperRenderer(d);
		if (idx > -1) {
			this.superRenderers[idx].clearCanvas();
			this.superRenderers = this.superRenderers.splice(idx, 1);
		}
	}

	getRendererForSupernode(d) {
		const idx = this.indexOfRendererForSupernode(d);
		if (idx > -1) {
			return this.superRenderers[idx];
		}
		return null;
	}

	// Returns a renderer for the pipelineId passed in by first checking its own
	// pipelineId and then searching this renderer's child supernode renderers
	// and then searching down through those renderers. Returns null if no render
	// can be found.
	getRendererForPipelineIdRecursively(pipelineId) {
		if (this.pipelineId === pipelineId) {
			return this;
		}
		let ren = this.getRendererForPipelineId(pipelineId);

		if (!ren) {
			this.superRenderers.forEach((superRen) => {
				if (!ren) {
					ren = superRen.getRendererForPipelineIdRecursively(pipelineId);
				}
			});
		}
		return ren;
	}

	// Returns a renderer for the pipelineId passed in by searching this
	// renderer's child supernode renderers. Returns null if no render can be found.
	getRendererForPipelineId(pipelineId) {
		const idx = this.indexOfRendererForPipelineId(pipelineId);
		if (idx > -1) {
			return this.superRenderers[idx];
		}
		return null;
	}

	indexOfRendererForSupernode(d) {
		// We assume that there cannot be more than one renderer for the
		// same sub-flow pipeline
		return this.superRenderers.findIndex((sr) => sr.pipelineId === d.subflow_ref.pipeline_id_ref);
	}

	indexOfRendererForPipelineId(pipelineId) {
		return this.superRenderers.findIndex((sr) => sr.pipelineId === pipelineId);
	}

	displaySupernodeFullPage(d) {
		this.canvasController.displaySubPipeline({ pipelineId: d.subflow_ref.pipeline_id_ref, pipelineFlowId: this.pipelineFlowId });
	}

	getNodeImagePosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.canvasLayout.supernodeImagePosY;
		}
		if (data.layout.labelAndIconVerticalJustification === "center") {
			if (data.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (data.layout.imageHeight / 2);

			} else if (data.layout.nodeFormatType === "vertical") {
				const imageLabelGap = this.getImageLabelVerticalGap(data);
				return (data.height / 2) - ((data.layout.imageHeight + data.layout.labelHeight + imageLabelGap) / 2);
			}
		}
		return data.layout.imagePosY;
	}

	getNodeLabelText(data, textObj) {
		let labelMaxWidth = data.layout.labelMaxWidth;
		if (this.isExpandedSupernode(data)) {
			labelMaxWidth = data.width - this.canvasLayout.supernodeLabelPosX -
				(4 * this.canvasLayout.supernodeIconSeparation) -
				this.canvasLayout.supernodeExpansionIconWidth -
				this.canvasLayout.supernodeEllipsisWidth;

			// Reduce the available space for the label by the error icon width.
			if (this.getMessageLevel(data.messages) !== "") {
				labelMaxWidth -= data.layout.errorWidth;
			}
		}
		const className = this.getLabelClass(data);
		return this.trimLabelToWidth(data.label, labelMaxWidth, className, textObj);
	}

	getLabelPosX(data) {
		if (this.isExpandedSupernode(data)) {
			return this.canvasLayout.supernodeLabelPosX;
		}
		return data.layout.labelPosX;
	}

	// Returns an X position for the outline of the label which is used for
	// debugging.
	getLabelOutlinePosX(data) {
		return data.layout.nodeFormatType === "horizontal" ? this.getLabelPosX(data) : this.getLabelPosX(data) - (data.layout.labelMaxWidth / 2);
	}

	// Returns a Y position for the outline of the label which is used for
	// debugging.
	getLabelOutlinePosY(data) {
		return this.getLabelPosY(data) - data.layout.labelHeight;
	}

	getLabelPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.canvasLayout.supernodeLabelPosY;
		} else if (data.layout.labelAndIconVerticalJustification === "center") {
			if (data.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) + ((data.layout.labelHeight - data.layout.labelDescent) / 2);

			} else if (data.layout.nodeFormatType === "vertical") {
				const imageLabelGap = this.getImageLabelVerticalGap(data);
				return (data.height / 2) + ((data.layout.imageHeight + data.layout.labelHeight + imageLabelGap) / 2);
			}
		}

		return data.layout.labelPosY;
	}

	getLabelClass(data) {
		if (this.isExpandedSupernode(data)) {
			return "d3-supernode-label " + this.getMessageLabelClass(data.messages);
		}
		const justificationClass = data.layout.nodeFormatType === "vertical" ? " d3-node-label-middle" : "";
		return "d3-node-label " + this.getMessageLabelClass(data.messages) + justificationClass;
	}

	// Returns the gap between the image and the label, when they are arranged
	// vertically, based on the position of each of those elements as described
	// by labelPosY and imagePosY.
	getImageLabelVerticalGap(data) {
		return data.layout.labelPosY - data.layout.labelHeight - (data.layout.imagePosY + data.layout.imageHeight);
	}

	getErrorPosX(data, nodeGrp) {
		if (this.isExpandedSupernode(data)) {
			const nodeText = nodeGrp.select(this.getSelectorForId("node_label", data.id)).node();
			return this.canvasLayout.supernodeLabelPosX + nodeText.getComputedTextLength() + this.canvasLayout.supernodeIconSeparation;
		}
		return data.layout.errorXPos;
	}

	getErrorPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return (this.canvasLayout.supernodeTopAreaHeight / 2) - (data.layout.errorHeight / 2);
		} else
		if (data.layout.labelAndIconVerticalJustification === "center") {
			if (data.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (data.layout.imageHeight / 2);

			} else if (data.layout.nodeFormatType === "vertical") {
				const imageLabelGap = this.getImageLabelVerticalGap(data);
				return (data.height / 2) - ((data.layout.imageHeight + data.layout.labelHeight + imageLabelGap) / 2);
			}
		}
		return data.layout.errorYPos;
	}

	getEllipsisWidth(d) {
		if (this.isExpandedSupernode(d)) {
			return this.canvasLayout.supernodeEllipsisWidth;
		}
		return d.layout.ellipsisWidth;
	}

	getEllipsisHeight(d) {
		if (this.isExpandedSupernode(d)) {
			return this.canvasLayout.supernodeEllipsisHeight;
		}
		return d.layout.ellipsisHeight;
	}

	getEllipsisPosX(data) {
		if (this.isExpandedSupernode(data)) {
			return data.width - (2 * this.canvasLayout.supernodeIconSeparation) -
				this.canvasLayout.supernodeExpansionIconWidth -
				this.canvasLayout.supernodeEllipsisWidth;
		}

		return data.layout.ellipsisPosX;
	}

	getEllipsisPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.canvasLayout.supernodeEllipsisPosY;
		}

		if (data.layout.labelAndIconVerticalJustification === "center") {
			if (data.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (data.layout.ellipsisHeight / 2);

			} else if (data.layout.nodeFormatType === "vertical") {
				return this.getNodeImagePosY(data) - (data.layout.ellipsisPosY - data.layout.imagePosY);
			}
		}
		return data.layout.ellipsisPosY;
	}

	getExpansionIconPosX(data) {
		return data.width - this.canvasLayout.supernodeIconSeparation - this.canvasLayout.supernodeExpansionIconWidth;
	}

	isExpandedSupernode(data) {
		return this.isSupernode(data) && this.isExpanded(data);
	}

	isExpanded(data) {
		return data.is_expanded === true;
	}

	isSupernode(data) {
		return data.type === SUPER_NODE;
	}

	openContextMenu(type, d, port) {
		CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stop the browser context menu appearing
		this.canvasController.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			pipelineId: this.activePipeline.id,
			cmPos: this.getMousePos(this.canvasDiv.selectAll("svg")), // Get mouse pos relative to top most SVG area.
			mousePos: this.getTransformedMousePos(),
			selectedObjectIds: this.objectModel.getSelectedObjectIds(),
			port: port,
			zoom: this.zoomTransform.k });
	}

	setTrgPortStatus(trgId, trgPortId, newStatus) {
		const nodeGrp = this.canvasGrp.selectAll(this.getSelectorForId("node_grp", trgId));
		const trgPrtSelector = this.getSelectorForId("node_inp_port", trgId, trgPortId);
		const trgPrtArrSelector = this.getSelectorForId("node_inp_port_arrow", trgId, trgPortId);
		nodeGrp.selectAll(trgPrtSelector).attr("connected", newStatus);
		nodeGrp.selectAll(trgPrtArrSelector).attr("connected", newStatus);
	}

	setSrcPortStatus(srcId, srcPortId, newStatus) {
		const nodeGrp = this.canvasGrp.selectAll(this.getSelectorForId("node_grp", srcId));
		const srcPrtSelector = this.getSelectorForId("node_out_port", srcId, srcPortId);
		nodeGrp.selectAll(srcPrtSelector).attr("connected", newStatus);
	}

	getDecorator(id, decorations) {
		if (decorations) {
			const dec = decorations.find((nd) => nd.id === id);
			return dec;
		}
		return null;
	}

	getDecoratorX(dec, data, objType) {
		if (objType === DEC_LINK) {
			return this.getLinkDecoratorX(dec, data);
		}
		return this.getNodeDecoratorX(dec, data);
	}

	getNodeDecoratorX(dec, node) {
		const position = dec.position || "topLeft";
		let x = 0;
		if (position === "topLeft" || position === "middleLeft" || position === "bottomLeft") {
			x = typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorLeftX;
		} else if (position === "topCenter" || position === "middleCenter" || position === "bottomCenter") {
			x = (node.width / 2) + (typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorCenterX);
		} else if (position === "topRight" || position === "middleRight" || position === "bottomRight") {
			x = node.width + (typeof dec.x_pos !== "undefined" ? Number(dec.x_pos) : node.layout.decoratorRightX);
		}
		return x;
	}

	getLinkDecoratorX(dec, link) {
		const position = dec.position || "middle";
		let x = 0;
		if (position === "middle") {
			x = link.pathInfo.centerPoint ? link.pathInfo.centerPoint.x : link.x1 + ((link.x2 - link.x1) / 2);
		} else if (position === "source") {
			x = link.pathInfo.sourcePoint ? link.pathInfo.sourcePoint.x : link.x1;
		} else if (position === "target") {
			x = link.pathInfo.targetPoint ? link.pathInfo.targetPoint.x : link.x2;
		}
		x = typeof dec.x_pos !== "undefined" ? x + Number(dec.x_pos) : x;
		return x;
	}

	getDecoratorY(dec, data, objType) {
		if (objType === DEC_LINK) {
			return this.getLinkDecoratorY(dec, data);
		}
		return this.getNodeDecoratorY(dec, data);
	}

	getNodeDecoratorY(dec, node) {
		const position = dec.position || "topLeft";
		let y = 0;
		if (position === "topLeft" || position === "topCenter" || position === "topRight") {
			y = typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorTopY;
		} else if (position === "middleLeft" || position === "middleCenter" || position === "middleRight") {
			y = (node.height / 2) + (typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorMiddleY);
		} else if (position === "bottomLeft" || position === "bottomCenter" || position === "bottomRight") {
			y = node.height + (typeof dec.y_pos !== "undefined" ? Number(dec.y_pos) : node.layout.decoratorBottomY);
		}
		return y;
	}

	getLinkDecoratorY(dec, link) {
		const position = dec.position || "middle";
		let y = 0;
		if (position === "middle") {
			y = link.pathInfo.centerPoint ? link.pathInfo.centerPoint.y : link.y1 + ((link.y2 - link.y1) / 2);
		} else if (position === "source") {
			y = link.pathInfo.sourcePoint ? link.pathInfo.sourcePoint.y : link.y1;
		} else if (position === "target") {
			y = link.pathInfo.targetPoint ? link.pathInfo.targetPoint.y : link.y2;
		}
		y = typeof dec.y_pos !== "undefined" ? y + Number(dec.y_pos) : y;
		return y;
	}

	getDecoratorPadding(dec, obj, objType) {
		// If outline is set to false we don't pad the decorator image.
		if (dec.outline === false) {
			return 0;
		}
		if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorPadding;
		}
		return obj.layout.decoratorPadding;
	}

	getDecoratorWidth(dec, obj, objType) {
		if (typeof dec.width !== "undefined") {
			return Number(dec.width);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorWidth;
		}
		return obj.layout.decoratorWidth;
	}

	getDecoratorHeight(dec, obj, objType) {
		if (typeof dec.height !== "undefined") {
			return Number(dec.height);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorHeight;
		}
		return obj.layout.decoratorHeight;
	}

	getDecoratorClass(dec, inClassName) {
		let className = inClassName;
		if (dec && dec.class_name) {
			className += " " + dec.class_name;
		}
		return className;
	}

	getDecoratorImage(dec) {
		if (dec) {
			if (dec.class_name === "node-zoom") { // TODO - Remove this if when WML external model supports decorator image field.
				return "/images/decorators/zoom-in_32.svg";
			}
			return dec.image;
		}
		return "";
	}

	callDecoratorCallback(node, dec) {
		d3Event.stopPropagation();
		if (this.canvasController.decorationActionHandler) {
			this.canvasController.decorationActionHandler(node, dec.id, this.activePipeline.id);
		}
	}

	drawNewLink() {
		const transPos = this.getTransformedMousePos();

		if (this.canvasLayout.connectionType === "halo") {
			this.drawNewLinkForHalo(transPos);
		} else {
			if (this.drawingNewLinkData.action === "comment-node") {
				this.drawNewCommentLinkForPorts(transPos);
			} else {
				this.drawNewNodeLinkForPorts(transPos);
			}
			// Switch on an attribute to indicate a new link is being dragged
			// towards and over a target node.
			if (this.config.enableHightlightNodeOnNewLinkDrag) {
				this.setNewLinkOverNode();
			}
		}
	}

	drawNewLinkForHalo(transPos) {
		this.removeNewLink();
		this.canvasGrp
			.append("line")
			.attr("x1", this.drawingNewLinkData.startPos.x)
			.attr("y1", this.drawingNewLinkData.startPos.y)
			.attr("x2", transPos.x - 2) // Offset mouse position so mouse messages don't go to link line
			.attr("y2", transPos.y - 2) // Offset mouse position so mouse messages don't go to link line
			.attr("class", "d3-new-halo-connection");
	}

	drawNewNodeLinkForPorts(transPos) {
		var that = this;
		const linkType = this.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK;

		let startPos;
		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
			startPos = this.linkUtils.getNewStraightNodeLinkStartPos(this.drawingNewLinkData.srcNode, transPos);
		} else {
			startPos = {
				x: this.drawingNewLinkData.startPos.x,
				y: this.drawingNewLinkData.startPos.y };
		}

		this.drawingNewLinkData.linkArray = [{
			"x1": startPos.x,
			"y1": startPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		if (this.config.enableAssocLinkCreation) {
			this.drawingNewLinkData.linkArray[0].assocLinkVariation =
				this.getNewLinkAssocVariation(this.drawingNewLinkData.linkArray[0].x1, this.drawingNewLinkData.linkArray[0].x2);
		}

		const pathInfo = this.linkUtils.getConnectorPathInfo(this.drawingNewLinkData.linkArray[0], this.drawingNewLinkData.minInitialLine);

		const connectionLineSel = this.canvasGrp.selectAll(".d3-new-connection-line");
		const connectionStartSel = this.canvasGrp.selectAll(".d3-new-connection-start");
		const connectionGuideSel = this.canvasGrp.selectAll(".d3-new-connection-guide");

		connectionLineSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append("path")
			.attr("class", "d3-new-connection-line")
			.attr("linkType", linkType)
			.merge(connectionLineSel)
			.attr("d", pathInfo.path)
			.attr("transform", pathInfo.transform);

		if (this.canvasLayout.linkType !== LINK_TYPE_STRAIGHT) {
			connectionStartSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append(this.drawingNewLinkData.portObject)
				.attr("class", "d3-new-connection-start")
				.attr("linkType", linkType)
				.merge(connectionStartSel)
				.each(function(d) {
					// No need to draw the starting object of the new line if it is an image.
					if (that.drawingNewLinkData.portObject === PORT_OBJECT_CIRCLE) {
						d3.select(this)
							.attr("cx", d.x1)
							.attr("cy", d.y1)
							.attr("r", that.drawingNewLinkData.portRadius);
					}
				});
		}

		connectionGuideSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append(this.drawingNewLinkData.guideObject)
			.attr("class", "d3-new-connection-guide")
			.attr("linkType", linkType)
			.on("mouseup", () => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			})
			.merge(connectionGuideSel)
			.each(function(d) {
				if (that.drawingNewLinkData.guideObject === PORT_OBJECT_IMAGE) {
					d3.select(this)
						.attr("xlink:href", that.drawingNewLinkData.guideImage)
						.attr("x", d.x2 - (that.drawingNewLinkData.portWidth / 2))
						.attr("y", d.y2 - (that.drawingNewLinkData.portHeight / 2))
						.attr("width", that.drawingNewLinkData.portWidth)
						.attr("height", that.drawingNewLinkData.portHeight);
				} else {
					d3.select(this)
						.attr("cx", d.x2)
						.attr("cy", d.y2)
						.attr("r", that.drawingNewLinkData.portRadius);
				}
			});
	}

	drawNewCommentLinkForPorts(transPos) {
		const that = this;
		const srcComment = this.getComment(this.drawingNewLinkData.srcObjId);
		const startPos = this.linkUtils.getNewStraightCommentLinkStartPos(srcComment, transPos);
		const linkType = COMMENT_LINK;

		this.drawingNewLinkData.linkArray = [{
			"x1": startPos.x,
			"y1": startPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		const connectionLineSel = this.canvasGrp.selectAll(".d3-new-connection-line");
		const connectionGuideSel = this.canvasGrp.selectAll(".d3-new-connection-guide");

		connectionLineSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append("path")
			.attr("class", "d3-new-connection-line")
			.attr("linkType", linkType)
			.merge(connectionLineSel)
			.attr("d", (d) => that.linkUtils.getConnectorPathInfo(d).path);

		connectionGuideSel
			.data(this.drawingNewLinkData.linkArray)
			.enter()
			.append("circle")
			.attr("class", "d3-new-connection-guide")
			.attr("linkType", linkType)
			.on("mouseup", () => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			})
			.merge(connectionGuideSel)
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.canvasLayout.commentPortRadius);

		if (this.canvasLayout.commentLinkArrowHead) {
			const connectionArrowHeadSel = this.canvasGrp.selectAll(".d3-new-connection-arrow");

			connectionArrowHeadSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append("path")
				.attr("class", "d3-new-connection-arrow")
				.attr("linkType", linkType)
				.on("mouseup", () => {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					var trgNode = this.getNodeAtMousePos();
					if (trgNode !== null) {
						this.completeNewLink(trgNode);
					} else {
						this.stopDrawingNewLink();
					}
				})
				.merge(connectionArrowHeadSel)
				.attr("d", (d) => this.getArrowHead(d));
		}
	}

	completeNewLink(trgNode) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		// Switch 'new link over node' highlighting off
		if (this.config.enableHightlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		if (trgNode !== null) {
			if (this.drawingNewLinkData.action === "node-node") {
				var trgPortId = this.getNodeInputPortAtMousePos();
				trgPortId = trgPortId || (trgNode.inputs && trgNode.inputs.length > 0 ? trgNode.inputs[0].id : null);
				this.canvasController.editActionHandler({
					editType: "linkNodes",
					editSource: "canvas",
					nodes: [{ "id": this.drawingNewLinkData.srcObjId, "portId": this.drawingNewLinkData.srcPortId }],
					targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
					type: (this.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK),
					linkType: "data", // Added for historical purposes - for WML Canvas support
					pipelineId: this.pipelineId });
			} else {
				this.canvasController.editActionHandler({
					editType: "linkComment",
					editSource: "canvas",
					nodes: [this.drawingNewLinkData.srcObjId],
					targetNodes: [trgNode.id],
					type: COMMENT_LINK,
					linkType: "comment", // Added for historical purposes - for WML Canvas support
					pipelineId: this.pipelineId });
			}
		}

		this.drawingNewLinkData = null;
	}

	stopDrawingNewLink() {
		// Switch 'new link over node' highlighting off
		if (this.config.enableHightlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		if (this.canvasLayout.connectionType === "halo") {
			this.stopDrawingNewLinkForHalo();
		} else {
			this.stopDrawingNewLinkForPorts();
		}
	}

	stopDrawingNewLinkForHalo() {
		this.removeNewLink();
		this.drawingNewLinkData = null;
	}

	stopDrawingNewLinkForPorts() {
		const saveX1 = this.drawingNewLinkData.linkArray[0].x1;
		const saveY1 = this.drawingNewLinkData.linkArray[0].y1;
		const saveX2 = this.drawingNewLinkData.linkArray[0].x2;
		const saveY2 = this.drawingNewLinkData.linkArray[0].y2;

		const saveNewLinkData = Object.assign({}, this.drawingNewLinkData);

		this.drawingNewLinkData = null;

		// If we completed a connection successfully just remove the new line
		// objects.
		let newPath = "";
		let duration = 350;

		if (this.canvasLayout.linkType === LINK_TYPE_CURVE) {
			newPath = "M " + saveX1 + " " + saveY1 +
								"C " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2;

		} else if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
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

		this.canvasGrp.selectAll(".d3-new-connection-line")
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.canvasGrp.selectAll(".d3-new-connection-arrow").remove();

				this.canvasGrp.selectAll(".d3-new-connection-guide")
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
					.attr("cy", saveY1);

				this.canvasGrp.selectAll(".d3-new-connection-line")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("d", "M " + saveX1 + " " + saveY1 +
											"L " + saveX1 + " " + saveY1)
					.on("end", this.removeNewLink.bind(this));
			});
	}

	removeNewLink() {
		if (this.canvasLayout.connectionType === "halo") {
			this.canvasGrp.selectAll(".d3-new-halo-connection").remove();
		} else {
			this.canvasGrp.selectAll(".d3-new-connection-line").remove();
			this.canvasGrp.selectAll(".d3-new-connection-start").remove();
			this.canvasGrp.selectAll(".d3-new-connection-guide").remove();
			this.canvasGrp.selectAll(".d3-new-connection-arrow").remove();
		}
	}

	// Returns a link, if one can be found, at the position indicated by x and y
	// coordinates.
	getLinkAtMousePos(x, y) {
		const element = this.getLinkElementAtMousePos(x, y);
		const link = this.getNodeLinkForElement(element);
		return link;
	}

	// Returns a link-selection-area DOM element, if one can be found, at the
	// position indicated by x and y coordinates. Note: It may not be the
	// top-most element so we have to search through the array for it.
	getLinkElementAtMousePos(x, y) {
		this.setDataLinkSelectionAreaWider(true);
		const elements = document.elementsFromPoint(x, y);
		const element = elements.find((el) => el.className && el.className.baseVal && el.className.baseVal.includes("d3-data-link-selection-area"));
		this.setDataLinkSelectionAreaWider(false);
		return element;
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeLinkForElement(element) {
		if (element && element.nodeName === "path") {
			const datum = d3.select(element).datum();
			if (datum) {
				var foundLink = this.canvasController.getLink(datum.id, this.pipelineId);
				if (foundLink && foundLink.type === NODE_LINK) {
					return foundLink;
				}
			}
		}
		return null;
	}

	setDataLinkSelectionAreaWider(state) {
		this.canvasSVG.selectAll(".d3-data-link-selection-area").classed("d3-extra-width", state);
	}

	// Returns the node that is at the current mouse position. If nodeProximity
	// is provided it will be used as additional space beyond the node boundary
	// to decide if the node is under the current mouse position.
	getNodeAtMousePos(proximity) {
		const that = this;
		var pos = this.getTransformedMousePos();
		var node = null;
		const prox = proximity || 0;
		const selector = this.getSelectorForClass("d3-node-group");
		this.canvasGrp.selectAll(selector)
			.each(function(d) {
				let portRadius = d.layout.portRadius;
				if (that.isSuperBindingNode(d)) {
					portRadius = that.canvasLayout.supernodeBindingPortRadius / that.zoomTransform.k;
				}

				if (pos.x >= d.x_pos - portRadius - prox && // Target port sticks out by its radius so need to allow for it.
						pos.x <= d.x_pos + d.width + portRadius + prox &&
						pos.y >= d.y_pos - prox &&
						pos.y <= d.y_pos + d.height + prox) {
					node = d;
				}
			});
		return node;
	}

	// Returns the input port that is at the current mouse position. If
	// nodeProximity and portProximity are provided they will be used as
	// additional space beyond the node and port boundaries to decide if the
	// node or port are under the current mouse position.
	getNodeInputPortAtMousePos(nodeProximity, portProximity) {
		if (this.canvasLayout.connectionType === "halo") {
			return null;
		}

		const pos = this.getTransformedMousePos();
		const node = this.getNodeAtMousePos(nodeProximity);
		const portProx = portProximity || 0;
		let portId = null;
		if (node) {
			this.canvasGrp.selectAll(this.getSelectorForId("node_grp", node.id)).selectAll("." + this.getNodeInputPortClassName())
				.each(function(p) { // Use function keyword so 'this' pointer references the dom object
					const portObj = d3.select(this);
					if (node.layout.inputPortObject === PORT_OBJECT_IMAGE) {
						const xx = node.x_pos + Number(portObj.attr("x"));
						const yy = node.y_pos + Number(portObj.attr("y"));
						const wd = Number(portObj.attr("width"));
						const ht = Number(portObj.attr("height"));
						if (pos.x >= xx - portProx &&
								pos.x <= xx + wd + portProx &&
								pos.y >= yy - portProx &&
								pos.y <= yy + ht + portProx) {
							portId = this.getAttribute("data-port-id");
						}
					} else { // Port must be a circle
						const cx = node.x_pos + Number(portObj.attr("cx"));
						const cy = node.y_pos + Number(portObj.attr("cy"));
						if (pos.x >= cx - node.layout.portRadius - portProx && // Target port sticks out by its radius so need to allow for it.
								pos.x <= cx + node.layout.portRadius + portProx &&
								pos.y >= cy - node.layout.portRadius - portProx &&
								pos.y <= cy + node.layout.portRadius + portProx) {
							portId = this.getAttribute("data-port-id");
						}
					}
				});
		}
		return portId;
	}

	// Returns a sizing rectangle for nodes and comments. This extends an
	// invisible area out beyond the highlight sizing line to improve usability
	// when sizing.
	getNodeShapePathSizing(data) {
		return this.getRectangleNodeShapePath(data, data.layout.nodeSizingArea);
	}

	// Returns a path string that will draw the outline shape of the node.
	getNodeShapePathOutline(data) {
		if (data.layout.selectionPath) {
			return data.layout.selectionPath;

		} else if (data.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data); // Port-arc outline does not have a highlight gap

		}
		return this.getRectangleNodeShapePath(data, data.layout.nodeHighlightGap);
	}

	// Returns a path string that will draw the body shape of the node.
	getNodeShapePath(data) {
		if (data.layout.bodyPath) {
			return data.layout.bodyPath;

		} else if (data.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data);

		}
		return this.getRectangleNodeShapePath(data);
	}

	// Returns a path that will draw the shape for the rectangle node
	// display. This is draw as a path rather than an SVG rectangle to make the
	// calling code more generic.
	getRectangleNodeShapePath(data, highlightGap) {
		const gap = highlightGap ? highlightGap : 0;
		const x = 0 - gap;
		const y = 0 - gap;
		const width = data.width + gap;
		const height = data.height + gap;

		let path = "M " + x + " " + y + " L " + width + " " + y;
		path += " L " + width + " " + height;
		path += " L " + x + " " + height;
		path += " Z"; // Draw a straight line back to origin.

		return path;
	}

	// Returns a path that will draw the outline shape for the 'port-arcs' display
	// which shows arcs around each of the node circles.
	getPortArcsNodeShapePath(data) {
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			return this.getPortArcsNodeShapePathVertical(data, data.inputs, data.inputPortsWidth, data.outputs, data.outputPortsWidth);
		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			return this.getPortArcsNodeShapePathVertical(data, data.outputs, data.outputPortsWidth, data.inputs, data.inputPortsWidth);
		}

		return this.getPortArcsNodeShapePathLeftRight(data);
	}

	// Returns a path that will draw the outline shape for the 'port-arcs' display
	// which shows arcs around each of the node circles for left to right link direction.
	getPortArcsNodeShapePathLeftRight(data) {
		let path = "M 0 0 L " + data.width + " 0 "; // Draw line across the top of the node

		if (data.outputs && data.outputs.length > 0) {
			let endPoint = data.layout.portArcOffset;

			// Draw straight segment down to ports (if needed)
			if (data.outputPortsHeight < data.height) {
				endPoint = data.outputs[0].cy - data.layout.portArcRadius;
			}

			path += " L " + data.width + " " + endPoint;

			// Draw port arcs
			data.outputs.forEach((port, index) => {
				endPoint += (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 1 " + data.width + " " + endPoint;
				if (index < data.outputs.length - 1) {
					endPoint += data.layout.portArcSpacing;
					path += " L " + data.width + " " + endPoint;
				}
			});

			// Draw finishing segment to bottom right corner
			path += " L " + data.width + " " + data.height;

		// If no output ports just draw a straight line.
		} else {
			path += " L " + data.width + " " + data.height;
		}

		path += " L 0 " + data.height; // Draw line across the bottom of the node

		if (data.inputs && data.inputs.length > 0) {
			let endPoint2 = data.height - data.layout.portArcOffset;

			if (data.inputPortsHeight < data.height) {
				endPoint2 = data.inputs[data.inputs.length - 1].cy + data.layout.portArcRadius;
			}

			path += " L 0 " + endPoint2;

			data.inputs.forEach((port, index) => {
				endPoint2 -= (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 1 0 " + endPoint2;
				if (index < data.inputs.length - 1) {
					endPoint2 -= data.layout.portArcSpacing;
					path += " L 0 " + endPoint2;
				}
			});

			path += " Z"; // Draw finishing segment back to origin
		} else {
			path += " Z"; // If no input ports just draw a straight line.
		}
		return path;
	}

	// Returns a path that will draw the outline shape for the 'port-arcs' display
	// which shows arcs around each of the node circles for vertical link directions.
	getPortArcsNodeShapePathVertical(data, topPorts, topPortsWidth, bottomPorts, bottomPortsWidth) {
		let path = "M 0 0 L 0 " + data.height; // Draw line down the left of the node

		if (bottomPorts && bottomPorts.length > 0) {
			let endPoint = data.layout.portArcOffset;

			// Draw straight segment across to ports (if needed)
			if (bottomPortsWidth < data.width) {
				endPoint = bottomPorts[0].cx - data.layout.portArcRadius;
			}

			path += " L " + endPoint + " " + data.height;

			// Draw port arcs
			bottomPorts.forEach((port, index) => {
				endPoint += (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 0 " + endPoint + " " + data.height;
				if (index < bottomPorts.length - 1) {
					endPoint += data.layout.portArcSpacing;
					path += " L " + endPoint + " " + data.height;
				}
			});

			// Draw finishing segment to bottom right corner
			path += " L " + data.width + " " + data.height;

		// If no output ports just draw a straight line.
		} else {
			path += " L " + data.width + " " + data.height;
		}

		path += " L " + data.width + " 0 "; // Draw line up the right side of the node

		if (topPorts && topPorts.length > 0) {
			let endPoint2 = data.width - data.layout.portArcOffset;

			if (topPortsWidth < data.width) {
				endPoint2 = topPorts[topPorts.length - 1].cx + data.layout.portArcRadius;
			}

			path += " L " + endPoint2 + " 0 ";

			topPorts.forEach((port, index) => {
				endPoint2 -= (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 0 " + endPoint2 + " 0 ";
				if (index < topPorts.length - 1) {
					endPoint2 -= data.layout.portArcSpacing;
					path += " L " + endPoint2 + " 0 ";
				}
			});

			path += " Z"; // Draw finishing segment back to origin
		} else {
			path += " Z"; // If no input ports just draw a straight line.
		}
		return path;
	}

	// Sets the port positions on nodes for use when displaying nodes and links
	setPortPositionsAllNodes() {
		this.activePipeline.nodes.forEach((node) => {
			this.setPortPositionsForNode(node);
		});
	}

	setPortPositionsForNode(node) {
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			this.setPortPositionsVertical(node, node.inputs, node.inputPortsWidth, node.layout.inputPortTopPosX, node.layout.inputPortTopPosY);
			this.setPortPositionsVertical(node, node.outputs, node.outputPortsWidth, node.layout.outputPortBottomPosX, this.getOutputPortBottomPosY(node));
		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			this.setPortPositionsVertical(node, node.inputs, node.inputPortsWidth, node.layout.inputPortBottomPosX, this.getInputPortBottomPosY(node));
			this.setPortPositionsVertical(node, node.outputs, node.outputPortsWidth, node.layout.outputPortTopPosX, node.layout.outputPortTopPosY);
		} else {
			this.setPortPositionsLeftRight(node, node.inputs, node.inputPortsHeight, node.layout.inputPortLeftPosX, node.layout.inputPortLeftPosY);
			this.setPortPositionsLeftRight(node, node.outputs, node.outputPortsHeight, this.getOutputPortRightPosX(node), node.layout.outputPortRightPosY);
		}
	}

	getOutputPortRightPosX(node) {
		return node.width + node.layout.outputPortRightPosX;
	}

	getOutputPortBottomPosY(node) {
		return node.height + node.layout.outputPortBottomPosY;
	}

	getInputPortBottomPosY(node) {
		return node.height + node.layout.inputPortBottomPosY;
	}

	setPortPositionsVertical(data, ports, portsWidth, xPos, yPos) {
		if (ports && ports.length > 0) {
			if (data.width <= data.layout.defaultNodeWidth &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
			} else {
				let xPosition = 0;

				if (this.isExpandedSupernode(data)) {
					const widthSvgArea = data.width - (2 * this.canvasLayout.supernodeSVGAreaPadding);
					const remainingSpace = widthSvgArea - portsWidth;
					xPosition = (2 * this.canvasLayout.supernodeSVGAreaPadding) + (remainingSpace / 2);

				} else if (portsWidth < data.width) {
					xPosition = (data.width - portsWidth) / 2;
				}

				xPosition += data.layout.portArcOffset;

				// Sub-flow binding node ports need to be spaced by the inverse of the
				// zoom amount so that, after zoomToFit on the in-place sub-flow the
				// binding node ports line up with those on the supernode. This is only
				// necessary with binding nodes with mutiple ports.
				let multiplier = 1;
				if (this.isSuperBindingNode(data)) {
					multiplier = 1 / this.zoomTransform.k;
				}

				ports.forEach((p) => {
					xPosition += (data.layout.portArcRadius * multiplier);
					p.cx = xPosition;
					p.cy = yPos;
					xPosition += ((data.layout.portArcRadius + data.layout.portArcSpacing) * multiplier);
				});
			}
		}
	}

	setPortPositionsLeftRight(data, ports, portsHeight, xPos, yPos) {
		if (ports && ports.length > 0) {
			if (data.height <= data.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
			} else {
				let yPosition = 0;

				if (this.isExpandedSupernode(data)) {
					const heightSvgArea = data.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding;
					const remainingSpace = heightSvgArea - portsHeight;
					yPosition = this.canvasLayout.supernodeTopAreaHeight + this.canvasLayout.supernodeSVGAreaPadding + (remainingSpace / 2);

				} else if (portsHeight < data.height) {
					yPosition = (data.height - portsHeight) / 2;
				}

				yPosition += data.layout.portArcOffset;

				// Sub-flow binding node ports need to be spaced by the inverse of the
				// zoom amount so that, after zoomToFit on the in-place sub-flow the
				// binding node ports line up with those on the supernode. This is only
				// necessary with binding nodes with mutiple ports.
				let multiplier = 1;
				if (this.isSuperBindingNode(data)) {
					multiplier = 1 / this.zoomTransform.k;
				}

				ports.forEach((p) => {
					yPosition += (data.layout.portArcRadius * multiplier);
					p.cx = xPos;
					p.cy = yPosition;
					yPosition += ((data.layout.portArcRadius + data.layout.portArcSpacing) * multiplier);
				});
			}
		}
	}

	displayComments() {
		this.logger.logStartTimer("displayComments " + this.getFlags());

		// Do not return from here if there are no comments because there may
		// be still comments on display that need to be deleted.

		const that = this;
		const comSelector = this.getSelectorForClass("d3-comment-group");

		var commentGroupSel = this.canvasGrp
			.selectAll(comSelector)
			.data(this.activePipeline.comments, function(d) { return d.id; });

		if (this.canvasController.isTipOpening() || this.canvasController.isTipClosing() || this.nodeSizing) {
			this.logger.logEndTimer("displayComments " + this.getFlags());
			return;

		} else if (this.dragging && !this.commentSizing && !this.nodeSizing) {
			commentGroupSel
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.datum((d) => that.getComment(d.id)); // Set the __data__ to the updated data

		} else if (this.selecting || this.regionSelect) {
			commentGroupSel.each(function(d) {
				const comOutlineSelector = that.getSelectorForId("comment_sel_outline", d.id);
				that.canvasGrp.selectAll(comOutlineSelector)
					.attr("height", d.height + (2 * that.canvasLayout.commentHighlightGap))
					.attr("width", d.width + (2 * that.canvasLayout.commentHighlightGap))
					.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
					.attr("class", "d3-comment-selection-highlight")
					.datum(() => that.getComment(d.id)); // Set the __data__ to the updated data

				// This code will remove custom attributes from a comment. This might happen when
				// the user clicks the canvas background to remove the greyed out appearance of
				// a comment that was 'cut' to the clipboard.
				// TODO - Remove this code if/when common canvas supports cut (which removes comments
				// from the canvas) and when WML Canvas uses that clipboard support in place
				// of its own.
				const comBodySelector = that.getSelectorForId("comment_body", d.id);
				that.canvasGrp.selectAll(comBodySelector)
					.datum(() => that.getComment(d.id)) // Set the __data__ to the updated data
					.each(function(cd) {
						var imageObj = d3.select(this);
						if (cd.customAttrs && cd.customAttrs.length > 0) {
							cd.customAttrs.forEach((customAttr) => {
								imageObj.attr(customAttr, "");
							});
						} else {
							imageObj.attr("data-is-cut", null); // TODO - This should be made generic
						}
					});
				that.setCommentStyles(d, "default", d3.select(this));
			});

			this.superRenderers.forEach((renderer) => {
				renderer.selecting = true;
				renderer.displayComments();
				renderer.selecting = false;
			});

		} else {
			// Handle new comments
			var newCommentGroups = commentGroupSel.enter()
				.append("g")
				.attr("data-id", (d) => this.getId("comment_grp", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "d3-comment-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				// Use mouse down instead of click because it gets called before drag start.
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.setCommentStyles(d, "hover", d3.select(this));
					if (that.canvasLayout.connectionType === "ports") {
						d3.select(this)
							.append("circle")
							.attr("data-id", that.getId("comment_port", d.id))
							.attr("data-pipeline-id", that.activePipeline.id)
							.attr("cx", 0 - that.canvasLayout.commentHighlightGap)
							.attr("cy", 0 - that.canvasLayout.commentHighlightGap)
							.attr("r", that.canvasLayout.commentPortRadius)
							.attr("class", "d3-comment-port-circle")
							.on("mousedown", function(cd) {
								CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
								that.drawingNewLinkData = {
									srcObjId: d.id,
									action: "comment-node",
									startPos: { x: d.x_pos - that.canvasLayout.commentHighlightGap, y: d.y_pos - that.canvasLayout.commentHighlightGap },
									linkArray: []
								};
								that.drawNewLink();
							});
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.setCommentStyles(d, "default", d3.select(this));
					if (that.canvasLayout.connectionType === "ports") {
						that.canvasGrp.selectAll(that.getSelectorForId("comment_port", d.id)).remove();
					}
				})
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.logger.log("Comment Group - mouse down");

					if (!this.config.enableDragWithoutSelect) {
						this.selectObject(
							d,
							d3Event.type,
							d3Event.shiftKey,
							CanvasUtils.isCmndCtrlPressed(d3Event));
					}
					this.logger.log("Comment Group - finished mouse down");
				})
				.on("click", (d) => {
					this.logger.log("Comment Group - click");
					d3Event.stopPropagation();
				})
				.on("dblclick", (d) => {
					that.logger.log("Comment Group - double click");
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);

					that.displayTextArea(d);

					that.canvasController.clickActionHandler({
						clickType: "DOUBLE_CLICK",
						objectType: "comment",
						id: d.id,
						selectedObjectIds: that.objectModel.getSelectedObjectIds(),
						pipelineId: that.activePipeline.id });
				})
				.on("contextmenu", (d) => {
					this.logger.log("Comment Group - context menu");
					// With enableDragWithoutSelect set to true, the object for which the
					// context menu is being requested needs to be implicitely selected.
					if (this.config.enableDragWithoutSelect) {
						this.selectObject(d, d3Event.type, d3Event.shiftKey, CanvasUtils.isCmndCtrlPressed(d3Event));
					}
					this.openContextMenu("comment", d);
				})
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

			// Comment sizing area
			newCommentGroups.append("rect")
				.attr("data-id", (d) => this.getId("comment_sizing", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.on("mousedown", (d) => {
					this.commentSizing = true;
					this.commentSizingId = d.id;
					// Note - comment resizing and finalization of size is handled by drag functions.
					this.addTempCursorOverlay(this.commentSizingCursor);
				})
				// Use mousemove here rather than mouseenter so the cursor will change
				// if the pointer moves from one area of the node outline to another
				// (eg. from east area to north-east area) without exiting the node outline.
				// A mouseenter is triggered when the sizing operation stops and the
				// pointer leaves the temporary overlay (which is removed) and enters
				// the node outline.
				.on("mousemove mouseenter", function(d) {
					if (!that.isRegionSelectOrSizingInProgress()) // Don't switch sizing direction if we are already sizing
					{
						let cursorType = "pointer";
						if (!that.isPointerCloseToBodyEdge(d)) {
							that.commentSizingDirection = that.getSizingDirection(d, that.canvasLayout.commentCornerResizeArea);
							that.commentSizingCursor = that.getCursorBasedOnDirection(that.commentSizingDirection);
							cursorType = that.commentSizingCursor;
						}
						d3.select(this).style("cursor", cursorType);
					}
				});

			// Comment selection highlighting outline
			newCommentGroups.append("rect")
				.attr("data-id", (d) => this.getId("comment_sel_outline", d.id))
				.attr("data-pipeline-id", this.activePipeline.id);

			// Background rectangle for comment
			newCommentGroups.append("rect")
				.attr("data-id", (d) => this.getId("comment_body", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("width", (d) => d.width)
				.attr("height", (d) => d.height)
				.attr("x", 0)
				.attr("y", 0)
				.attr("class", (d) => this.getCommentRectClass(d))
				.each(function(d) {
					if (d.customAttrs) {
						var imageObj = d3.select(this);
						d.customAttrs.forEach((customAttr) => {
							imageObj.attr(customAttr, "");
						});
					}
				});

			// Comment text
			// The clip area for the text is set when the inline styles are set
			// in the setCommentStyles method.
			newCommentGroups.append("text")
				.attr("data-id", (d) => that.getId("comment_text", d.id))
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "d3-comment-text")
				.attr("xml:space", "preserve")
				.attr("x", 0) // Text position is controlled by x and y
				.attr("y", 0); // of the tspan objects inside this text object.

			// Halo
			if (this.canvasLayout.connectionType === "halo") {
				newCommentGroups.append("rect")
					.attr("data-id", (d) => that.getId("comment_halo", d.id))
					.attr("data-pipeline-id", this.activePipeline.id)
					.attr("class", "d3-comment-halo")
					.on("mousedown", (d) => {
						this.logger.log("Comment Halo - mouse down");
						d3Event.stopPropagation();
						this.drawingNewLinkData = {
							srcObjId: d.id,
							action: "comment-node",
							startPos: this.getTransformedMousePos(),
							linkArray: []
						};
						this.drawNewLink();
					});
			}

			const newAndExistingCommentGrps =
				commentGroupSel.enter().merge(commentGroupSel);

			newAndExistingCommentGrps
				.each((d) => {
					const commentGrp = this.canvasGrp.selectAll(that.getSelectorForId("comment_grp", d.id));
					const comment = this.getComment(d.id);

					commentGrp
						.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
						.datum(comment); // Set the __data__ to the updated data

					// Comment sizing area
					commentGrp.select(this.getSelectorForId("comment_sizing", d.id))
						.attr("x", -this.canvasLayout.commentSizingArea)
						.attr("y", -this.canvasLayout.commentSizingArea)
						.attr("height", d.height + (2 * that.canvasLayout.commentSizingArea))
						.attr("width", d.width + (2 * that.canvasLayout.commentSizingArea))
						.attr("class", "d3-comment-sizing")
						.datum(comment); // Set the __data__ to the updated data

					// Comment selection highlighting outline
					commentGrp.select(this.getSelectorForId("comment_sel_outline", d.id))
						.attr("x", -this.canvasLayout.commentHighlightGap)
						.attr("y", -this.canvasLayout.commentHighlightGap)
						.attr("height", d.height + (2 * that.canvasLayout.commentHighlightGap))
						.attr("width", d.width + (2 * that.canvasLayout.commentHighlightGap))
						.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
						.attr("class", "d3-comment-selection-highlight")
						.datum(comment); // Set the __data__ to the updated data

					// Set comments styles
					this.setCommentStyles(d, "default", commentGrp);

					// Background rectangle for comment
					commentGrp.select(this.getSelectorForId("comment_body", d.id))
						.attr("height", d.height)
						.attr("width", d.width)
						.attr("class", (cd) => that.getCommentRectClass(cd))
						.datum(comment) // Set the __data__ to the updated data
						.each(function(cd) {
							if (cd.customAttrs) {
								var imageObj = d3.select(this);
								cd.customAttrs.forEach((customAttr) => {
									imageObj.attr(customAttr, "");
								});
							}
						});

					// Comment text
					commentGrp.select(this.getSelectorForId("comment_text", d.id))
						.datum(comment) // Set the __data__ to the updated data
						.each(function(cd) {
							var textObj = d3.select(this);
							textObj.selectAll("tspan").remove();
							that.displayWordWrappedText(textObj, cd.content, cd.width - (2 * that.canvasLayout.commentWidthPadding));
						});

					// Comment halo
					// We need to dynamically set size of the halo here becasue the size
					// of the text object maye be changed by the user.
					if (that.canvasLayout.connectionType === "halo") {
						commentGrp.select(this.getSelectorForId("comment_halo", d.id))
							.attr("x", 0 - this.canvasLayout.haloCommentGap)
							.attr("y", 0 - this.canvasLayout.haloCommentGap)
							.attr("width", d.width + (2 * that.canvasLayout.haloCommentGap))
							.attr("height", d.height + (2 * that.canvasLayout.haloCommentGap))
							.datum(comment); // Set the __data__ to the updated data
					}
				});

			// Remove any comments that are no longer in the diagram.nodes array.
			commentGroupSel.exit().remove();
		}
		this.logger.logEndTimer("displayComments " + this.getFlags());
	}

	setCommentStyles(d, type, comGrp) {
		this.setCommentBodyStyles(d, type, comGrp);
		this.setCommentSelectionOutlineStyles(d, type, comGrp);
		this.setCommentTextStyles(d, type, comGrp);
	}

	setCommentBodyStyles(d, type, comGrp) {
		const style = this.getObjectStyle(d, "body", type);
		comGrp.select(this.getSelectorForId("comment_body", d.id)).attr("style", style);
	}

	setCommentSelectionOutlineStyles(d, type, comGrp) {
		const style = this.getObjectStyle(d, "selection_outline", type);
		comGrp.select(this.getSelectorForId("comment_sel_outline", d.id)).attr("style", style);
	}

	setCommentTextStyles(d, type, comGrp) {
		let style = this.getObjectStyle(d, "text", type);
		const clipRectStyle = this.getClipRectStyle(d);
		style = style ? clipRectStyle + style : clipRectStyle;
		// When editing a comment always override the text fill color with
		// 'transparent' so the SVG text becomes invisible and the user only sees
		// the text in the textarea which is open during editing.
		if (d.id === this.editingCommentId && this.editingComment) {
			style = style ? style + " fill: transparent" : "fill: transparent";
		}
		comGrp.select(this.getSelectorForId("comment_text", d.id)).attr("style", style);
	}

	getObjectStyle(d, part, type) {
		let style = null;

		if (type === "hover") {
			style = this.getStyleValue(d, part, "default") + ";" + this.getStyleValue(d, part, "hover");

		} else if (type === "default") {
			style = this.getStyleValue(d, part, "default");
		}
		return style;
	}

	getStyleValue(d, part, type) {
		const style = get(d, `style_temp.${part}.${type}`, null);
		if (style !== null) {
			return style;
		}
		return get(d, `style.${part}.${type}`, null);
	}

	// Returns a clip-path string that can be set as an inline style for clipping
	// comment text vertically when the bounding box is smaller than the space the
	// full text occupies. We use polygon here because 'inset' which is supposed to
	// provide a rectangle clipping area doesn't seem to work on the current browsers.
	// Also, -webkit-clip-path has to be provided as well as clip-path because
	// Safari doesn't recognize clip-path. FF and Chrome do.
	getClipRectStyle(d) {
		const x2 = d.width + 20;
		const y2 = d.height - (2 * (this.canvasLayout.commentHeightPadding - 2));
		const poly = `polygon(0px 0px, ${x2}px 0px, ${x2}px ${y2}px, 0px ${y2}px)`;
		return `clip-path:${poly}; -webkit-clip-path:${poly}; `;
	}

	autoSizeTextArea(textArea, datum) {
		this.logger.log("autoSizeTextArea - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);
		if (this.textAreaHeight < textArea.scrollHeight) {
			this.textAreaHeight = textArea.scrollHeight;
			var comment = this.getComment(datum.id);
			comment.height = this.textAreaHeight;
			datum.height = this.textAreaHeight;
			this.canvasDiv.select(this.getSelectorForId("comment_text_area", datum.id))
				.style("height", this.textAreaHeight + "px")
				.style("transform", this.getTextAreaTransform(datum)); // Since the height has changed the translation needs to be reapplied.
			this.displayComments();
			this.displayLinks();
		}
	}

	saveCommentChanges(textArea) {
		if (this.editingComment === true &&
				this.editingCommentChangesPending === true) {
			this.editingCommentChangesPending = false;
			const commentDatum = d3.select(textArea).datum();
			const data = {
				editType: "editComment",
				editSource: "canvas",
				id: commentDatum.id,
				content: textArea.value,
				width: commentDatum.width,
				height: commentDatum.height,
				x_pos: commentDatum.x_pos,
				y_pos: commentDatum.y_pos,
				pipelineId: this.activePipeline.id
			};
			this.canvasController.editActionHandler(data);
		}
	}

	displayTextArea(d) {
		const that = this;
		const datum = d;

		this.textAreaHeight = 0; // Save for comparison during auto-resize
		this.editingComment = true;
		this.editingCommentId = datum.id;

		this.canvasDiv
			.append("textarea")
			.attr("data-id", this.getId("comment_text_area", datum.id))
			.attr("data-pipeline-id", that.activePipeline.id)
			.attr("class", "d3-comment-entry")
			.text(datum.content)
			.style("width", datum.width + "px")
			.style("height", datum.height + "px")
			.style("left", "0px") // Open text area at 0,0 and use
			.style("top", "0px") //  transform to move into place
			.style("transform", this.getTextAreaTransform(datum))
			.datum(datum)
			.on("keyup", function() {
				that.editingCommentChangesPending = true;
				that.autoSizeTextArea(this, datum);
			})
			.on("paste", function() {
				that.logger.log("Text area - Paste - Scroll Ht = " + this.scrollHeight);
				that.editingCommentChangesPending = true;
				// Allow some time for pasted text (from context menu) to be
				// loaded into the text area. Otherwise the text is not there
				// and the auto size does not increase the height correctly.
				setTimeout(that.autoSizeTextArea.bind(that), 500, this, datum);
			})
			.on("blur", function(cd) {
				that.logger.log("Text area - blur");
				var commentObj = that.getComment(datum.id);
				commentObj.content = this.value;
				that.saveCommentChanges(this);
				that.closeCommentTextArea();
				that.displayComments();
			});

		// Note: Couldn't get focus to work through d3, so used dom instead.
		document.querySelector(this.getSelectorForId("comment_text_area", datum.id)).focus();
	}

	// Returns the transform amount for the text area control that positions the
	// text area based on the current zoom (translate and scale) amount.
	getTextAreaTransform(d) {
		let transform = { x: 0, y: 0, k: 1 };

		transform = {
			x: this.zoomTransform.x + (d.x_pos * this.zoomTransform.k),
			y: this.zoomTransform.y + (d.y_pos * this.zoomTransform.k),
			k: this.zoomTransform.k
		};

		const parentRenderer = this.getParentRenderer();
		if (parentRenderer) {
			transform = parentRenderer.getSupernodeTransformAmount(this.activePipeline.id, transform);
		}

		// Adjust the position of the text area to be over the comment group object
		transform.x -= (d.width - (d.width * transform.k)) / 2;
		transform.y -= (d.height - (d.height * transform.k)) / 2;

		return `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
	}

	// Returns a transform based on the transform passed in which includes the
	// cumulative offset and scale amount for the pipeline identified by the
	// pipeline Id passed in for the current renderer.
	getSupernodeTransformAmount(pipelineId, transform) {
		const dimensions = this.getSupernodeSVGDimensionsFor(pipelineId);

		transform.k *= this.zoomTransform.k;
		transform.x = this.zoomTransform.x + ((transform.x + dimensions.x_pos) * this.zoomTransform.k);
		transform.y = this.zoomTransform.y + ((transform.y + dimensions.y_pos) * this.zoomTransform.k);

		const parentRenderer = this.getParentRenderer();
		if (parentRenderer) {
			return parentRenderer.getSupernodeTransformAmount(this.activePipeline.id, transform);
		}

		return transform;
	}

	// Closes the text area and switched off all flags connected with text editing.
	closeCommentTextArea() {
		this.editingComment = false;
		this.editingCommentId = "";
		this.editingCommentChangesPending = false;
		this.canvasDiv.select("textarea").remove();
	}

	// Adds a rectangle over the top of the canvas which is used to display a
	// temporary pointer cursor style (like the crosshair while doing a region
	// select operation). This allows the same cursor to be displayed even when
	// the pointer is moved over the top of objects that have their own cursor
	// styles set in the CSS because the style for the overlay rectangle overrides
	// any cursor styles of the underlying objects.
	addTempCursorOverlay(cursorStyle) {
		if (this.isDisplayingFullPage()) {
			if (this.canvasDiv.selectAll(".d3-temp-cursor-overlay").size() > 0) {
				this.removeTempCursorOverlay();
			}

			this.canvasSVG
				.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("data-pipeline-id", this.activePipeline.id)
				.attr("class", "d3-temp-cursor-overlay")
				.attr("pointer-events", "all")
				.style("cursor", cursorStyle);
		}
	}

	// Removes the temporary cursor overlay.
	removeTempCursorOverlay() {
		if (this.isDisplayingFullPage()) {
			this.canvasDiv.selectAll(".d3-temp-cursor-overlay").remove();
		}
	}

	// Returns true if this renderer or any of its ancestors are currently in the
	// process of selecting a region or sizing a node or comment.
	isRegionSelectOrSizingInProgress() {
		if (this.regionSelect || this.nodeSizing || this.commentSizing) {
			return true;
		}
		const parentRenderer = this.getParentRenderer();
		if (parentRenderer) {
			if (parentRenderer.isRegionSelectOrSizingInProgress()) {
				return true;
			}
		}
		return false;
	}

	// This method allows us to avoid a strange behavior which only appears in the
	// Chrome browser. That is, when the mouse pointer is inside the
	// node/comment selection highlight area but is close to either the
	// right or bottom side of the node/comment body, any mousedown events will go
	// to the body instead of the highlight area. We use this method to detect
	// this situation and use the result to decide whether to display the sizing
	// cursor or not.
	isPointerCloseToBodyEdge(d) {
		const pos = this.getTransformedMousePos();
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
	getSizingDirection(d, cornerResizeArea) {
		var xPart = "";
		var yPart = "";

		const transPos = this.getTransformedMousePos();

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
	resizeNode() {
		const oldSupernode = Object.assign({}, this.resizeObj);
		const minSupernodeHeight = Math.max(this.resizeObj.inputPortsHeight, this.resizeObj.outputPortsHeight) +
			this.canvasLayout.supernodeTopAreaHeight + this.canvasLayout.supernodeSVGAreaPadding;
		const delta = this.resizeObject(this.resizeObj, this.nodeSizingDirection,
			this.canvasLayout.supernodeMinWidth,
			Math.max(this.canvasLayout.supernodeMinHeight, minSupernodeHeight));

		if (delta && (delta.x_pos !== 0 || delta.y_pos !== 0 || delta.width !== 0 || delta.height !== 0)) {
			CanvasUtils.addToNodeSizingArray(this.resizeObj, this.nodeSizingMovedNodes);

			if (this.config.enableMoveNodesOnSupernodeResize) {
				CanvasUtils.moveSurroundingNodes(
					this.nodeSizingMovedNodes,
					oldSupernode,
					this.activePipeline.nodes,
					this.nodeSizingDirection,
					this.resizeObj.width,
					this.resizeObj.height,
					true // Pass true to indicate that node positions should be updated.
				);
			}
			this.displayNodes();
			this.displayLinks();
			if (this.isDisplayingSubFlow()) {
				this.displayBindingNodesToFitSVG();
			}
			this.superRenderers.forEach((renderer) => renderer.displaySVGToFitSupernode());
		}
	}

	// Sets the size and position of the comment in the canvasInfo.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and links (the link positions may move based
	// on the comment size change).
	resizeComment() {
		this.resizeObject(this.resizeObj, this.commentSizingDirection, 20, 20);
		this.displayComments();
		this.displayLinks();
	}

	// Sets the size and position of the object in the canvasInfo
	// array based on the position of the pointer during the resize action.
	resizeObject(canvasObj, direction, minWidth, minHeight) {
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

		if (this.config.enableSnapToGridType === "During") {
			// Calculate where the object being resized would be and its size given
			// current increments.
			this.resizeObjXPos += incrementX;
			this.resizeObjYPos += incrementY;
			this.resizeObjWidth += incrementWidth;
			this.resizeObjHeight += incrementHeight;

			xPos = CanvasUtils.snapToGrid(this.resizeObjXPos, this.canvasLayout.snapToGridX);
			yPos = CanvasUtils.snapToGrid(this.resizeObjYPos, this.canvasLayout.snapToGridY);
			width = CanvasUtils.snapToGrid(this.resizeObjWidth, this.canvasLayout.snapToGridX);
			height = CanvasUtils.snapToGrid(this.resizeObjHeight, this.canvasLayout.snapToGridY);

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
	endNodeSizing() {
		if (this.config.enableSnapToGridType === "After") {
			const sizedNode = this.nodeSizingMovedNodes[this.nodeSizingId];
			sizedNode.x_pos = CanvasUtils.snapToGrid(sizedNode.x_pos, this.snapToGridX);
			sizedNode.y_pos = CanvasUtils.snapToGrid(sizedNode.y_pos, this.snapToGridY);
			sizedNode.width = CanvasUtils.snapToGrid(sizedNode.width, this.snapToGridX);
			sizedNode.height = CanvasUtils.snapToGrid(sizedNode.height, this.snapToGridY);
		}
		if (Object.keys(this.nodeSizingMovedNodes).length > 0) {
			const data = {
				editType: "resizeObjects",
				editSource: "canvas",
				objectsInfo: this.nodeSizingMovedNodes,
				pipelineId: this.pipelineId
			};
			this.canvasController.editActionHandler(data);
		}
		this.nodeSizingMovedNodes = [];
		this.nodeSizing = false;
		this.nodeSizingInitialSize = {};
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing() {
		const commentObj = this.getComment(this.commentSizingId);
		let xPos = commentObj.x_pos;
		let yPos = commentObj.y_pos;
		let width = commentObj.width;
		let height = commentObj.height;

		if (this.config.enableSnapToGridType === "After") {
			xPos = CanvasUtils.snapToGrid(xPos, this.canvasLayout.snapToGridX);
			yPos = CanvasUtils.snapToGrid(yPos, this.canvasLayout.snapToGridY);
			width = CanvasUtils.snapToGrid(width, this.canvasLayout.snapToGridX);
			height = CanvasUtils.snapToGrid(height, this.canvasLayout.snapToGridY);
		}

		// Update the object model comment if the new position or size is different
		// from the comment's original position and size.
		if (this.resizeObjXPos !== xPos ||
				this.resizeObjYPos !== yPos ||
				this.resizeObjWidth !== width ||
				this.resizeObjHeight !== height) {
			const data = {
				editType: "editComment",
				editSource: "canvas",
				id: commentObj.id,
				content: commentObj.content,
				width: width,
				height: height,
				x_pos: xPos,
				y_pos: yPos,
				pipelineId: this.pipelineId
			};
			this.canvasController.editActionHandler(data);
		}
		this.commentSizing = false;
	}

	// Formats the text string passed in as a set of lines of text and displays
	// those lines as tspans in the text object passed in.
	displayWordWrappedText(textObj, text, width) {
		// Create a dummy tspan for use in calculating display lengths for text.
		// This will also be used by displayLinesAsTspan() to display the first line of text.
		var tspan = this.createTspan(" ", 1, "d3-comment-text-tspan", textObj);
		var lines = this.splitOnLineBreak(text);
		lines = this.splitLinesOnWords(lines, width, tspan);

		this.displayLinesAsTspan(lines, "d3-comment-text-tspan", textObj, tspan);
	}

	// Returns an array of lines which is the text passed in broken up by
	// the occurrence of new line characters.
	splitOnLineBreak(text) {
		var newLines = [];
		var line = "";
		for (var i = 0; i < text.length; i++) {
			if (text[i] === "\n") {
				newLines.push(line);
				line = "";
			} else {
				line += text[i];
			}
		}
		newLines.push(line);
		return newLines;
	}

	// Splits the lines passed in into more lines where the lines are
	// controlled by word wrapping etc.
	splitLinesOnWords(lines, width, tspan) {
		let newLines = [];

		lines.forEach((line) => {
			if (line === "") {
				newLines.push(" ");
			} else {
				newLines = newLines.concat(this.splitLineOnWords(line, width, tspan));
			}
		});

		return newLines;
	}

	// Splits the single line passed in into more lines where the lines are
	// controlled by word wrapping etc.
	splitLineOnWords(line, width, tspan) {
		var newLines = [];
		var text = "";
		var oldText = "";
		var textLen = 0;
		var wordLen = 0;
		var words = this.splitIntoWords(line);

		words.forEach((word, i) => {
			oldText = text;
			text += word;

			textLen = this.getTextLen(text, tspan);

			if (textLen >= width) {
				// If this is a 'word' that is made up of one or more spaces just push
				// it to the newLines array because it doesn't matter if the spaces run
				// off the end of the line since that is the same as how the textarea behaves.
				if (word.startsWith(" ")) {
					newLines.push(text);
					text = "";
				// If the 'word' is made up of text ...
				} else {
					if (oldText !== " " && oldText !== "") {
						newLines.push(oldText);
					}
					wordLen = this.getTextLen(word, tspan);
					if (wordLen >= width) {
						var split = this.splitWord(word, oldText, width, tspan);
						newLines = newLines.concat(split.lines);
						text = split.tailEnd;
					} else {
						text = word;
					}
				}
			}
		});

		if (text !== "") {
			newLines.push(text);
		}

		return newLines;
	}

	// Split the line passed in into words where a word is either a series of
	// non-space characters or a series of space characters. Or character words
	// can be split by hyphen as well.
	splitIntoWords(line) {
		var words = [];
		var word = "";

		for (var i = 0; i < line.length; i++) {
			if (i > 0 &&
					((line[i - 1] === " " && line[i] !== " ") ||
						(line[i - 1] !== " " && line[i] === " ") ||
						(line[i - 1] === "-" && line[i] !== "-"))) {
				words.push(word);
				word = "";
			}
			word += line[i];
		}
		words.push(word);

		return words;
	}

	// Returns an array of text lines which is the single word passed in wrapped
	// to the width passed in.
	splitWord(word, oldText, width, tspan) {
		var newLines = [];
		var subWord = "";
		var start = 0;
		var end = 1;
		var textLen = 0;
		var extraText = "";
		if (oldText === " ") { // If the oldText is a single space, we need to add that into the first
			extraText = " "; // line we're processing -- because this is the textarea behavior.
		}

		while (end <= word.length) {
			subWord = word.substring(start, end);

			textLen = this.getTextLen(extraText + subWord, tspan);

			if (textLen > width) {
				if (start === end - 1) { // If a single character doesn't fit in the width adjust
					end++; // end so the character is written into a line on its own.
				}
				newLines.push(extraText + word.substring(start, end - 1));
				extraText = ""; // After first line has been pushed set extraSpace to "" so it's no longer used.
				start = end - 1;
				end = start + 1;
			} else {
				end++;
			}
		}
		// Return the lines the word passed in was split into and the remaining
		// part of the word passed in as the tailEnd.
		return { lines: newLines, tailEnd: extraText + word.substring(start, end - 1) };
	}

	// Returns a label to be displayed for a node. The label is trimmed,
	// if necessary, to fit the label width with a ... suffix added.
	trimLabelToWidth(text, width, className, textObj) {
		var tspan = this.createTspan(text, 1, className, textObj);
		var textLen = tspan.node().getComputedTextLength();
		let outText = text;

		if (textLen > width) {
			var oldTxt = "...";
			for (var i = 0; i < text.length; i++) {
				var txt = text.substring(0, i) + "...";
				tspan.text(txt);
				textLen = tspan.node().getComputedTextLength();
				if (textLen > width) {
					outText = oldTxt;
					break;
				} else {
					oldTxt = txt;
				}
			}
		}
		return outText;
	}

	// Returns the length of the word passed in.
	getTextLen(word, tspan) {
		tspan.text(word);
		return tspan.node().getComputedTextLength();
	}

	// Displays the array of lines of text passed in as tspans within the
	// text object passed in. Uses the tspan passed in for the first line since
	// that has already been created.
	displayLinesAsTspan(lines, className, textObj, tspan) {
		lines.forEach((line, i) => {
			if (i === 0) {
				tspan.text(line); // Use the existing tspan for the first line of text.
			} else {
				this.createTspan(line, i + 1, className, textObj);
			}
		});
	}

	// Returns a tspan containing the text passed in created in the text object
	// passed in at the vertical position described by dy.
	createTspan(text, dy, className, textObj) {
		return textObj
			.append("tspan")
			.attr("class", className)
			.attr("x", 0 + this.canvasLayout.commentWidthPadding)
			.attr("y", 0 + this.canvasLayout.commentHeightPadding - 2) // Move text up a bit to match position in textarea
			.attr("dy", dy + "em")
			.attr("xml:space", "preserve") // Preserves the white
			.text(text);
	}

	displayLinks() {
		this.logger.logStartTimer("displayLinks " + this.getFlags());

		// Do not return from here if there are no links because there may
		// be still links on display that need to be deleted.

		var startTimeDrawingLines = Date.now();
		const that = this;
		const linkSelector = this.getSelectorForClass("link-group");

		if (this.selecting || this.regionSelect || this.canvasController.isTipOpening() || this.canvasController.isTipClosing()) {
			// no lines update needed when selecting objects/region
			this.logger.logEndTimer("displayLinks " + this.getFlags());
			return;
		} else if (this.dragging || this.nodeSizing || this.commentSizing || this.movingBindingNodes) {
			// while dragging etc. only remove lines that are affected by moving nodes/comments
			let affectLinks;
			if (this.nodeSizing) {
				affectLinks = this.getConnectedLinksFromNodeSizingArray(this.nodeSizingMovedNodes);

			} else if (this.commentSizing) {
				affectLinks = this.getConnectedLinksFromCommentBeingSized(this.resizeObj);

			} else {
				let affectedNodesAndComments;
				if (this.dragging) {
					affectedNodesAndComments = this.dragObjects;
				} else {
					affectedNodesAndComments = this.getSelectedNodesAndComments();
				}
				// For sub-flow rendering, we need to add the supernode binding nodes
				// because their links will also need to be refreshed when dragging is ocurring.
				if (this.isDisplayingSubFlow()) {
					affectedNodesAndComments = affectedNodesAndComments.concat(this.getSupernodeBindingNodes());
				}

				if (this.canvasLayout.linkType === LINK_TYPE_ELBOW) {
					affectedNodesAndComments = this.addAffectedNodesForElbow(affectedNodesAndComments);
				}

				affectLinks = this.getConnectedLinks(affectedNodesAndComments);
			}

			this.canvasGrp.selectAll(linkSelector)
				.filter(
					(linkGroupLink) => typeof affectLinks.find(
						(link) => link.id === linkGroupLink.id) !== "undefined")
				.remove();
		} else {
			this.canvasGrp.selectAll(linkSelector).remove();
		}

		var timeAfterDelete = Date.now();
		var lineArray = this.buildLineArray();
		var afterLineArray = Date.now();

		var linkGroup = this.canvasGrp.selectAll(linkSelector)
			.data(lineArray, function(line) { return line.id; })
			.enter()
			.append("g")
			.attr("data-id", (d) => this.getId("link_grp", d.id))
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("class", "link-group")
			.attr("style", (d) => this.getLinkGrpStyle(d))
			.on("mousedown", () => {
				// The context menu gesture will cause a mouse down event which
				// will go through to canvas unless stopped.
				d3Event.stopPropagation(); // Prevent mousedown event going through to canvas
			})
			.on("mouseup", () => {
				this.logger.log("Line - mouse up");
			})
			.on("contextmenu", (d) => {
				this.logger.log("Context menu on canvas background.");
				this.openContextMenu("link", d);
			})
			.on("mouseenter", function(link) {
				if (that.canOpenTip(TIP_TYPE_LINK)) {
					that.canvasController.openTip({
						id: that.getId("link_tip", link.id),
						type: TIP_TYPE_LINK,
						targetObj: this,
						mousePos: { x: d3Event.clientX, y: d3Event.clientY },
						pipelineId: that.activePipeline.id,
						link: link
					});
				}
			})
			.on("mouseleave", (d) => {
				this.canvasController.closeTip();
			});

		// Link selection area
		linkGroup.append("path")
			.attr("d", (d) => d.pathInfo.path)
			.attr("class", (d) => this.getLinkSelectionAreaClass(d))
			.on("mouseenter", function(link) {
				that.setLinkLineStyles(link, "hover");
			})
			.on("mouseleave", function(link) {
				that.setLinkLineStyles(link, "default");
			});

		// Link line
		linkGroup.append("path")
			.attr("d", (d) => d.pathInfo.path)
			.attr("data-id", (d) => this.getId("link_line", d.id))
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("class", (d) => "d3-selectable-link " + this.getLinkClass(d))
			.attr("style", (d) => that.getObjectStyle(d, "line", "default"))
			.on("mouseenter", function(d) {
				that.setLinkLineStyles(d, "hover");
			})
			.on("mouseleave", function(d) {
				that.setLinkLineStyles(d, "default");
			});

		// Arrow head
		linkGroup.filter((d) => (d.type === NODE_LINK && this.canvasLayout.dataLinkArrowHead) ||
														(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead) ||
														(d.type === NODE_LINK && this.canvasLayout.linkType === LINK_TYPE_STRAIGHT))
			.append("path")
			.attr("d", (d) => this.getArrowHead(d))
			.attr("class", (d) => "d3-selectable-link " + this.getLinkClass(d))
			.style("stroke-dasharray", "0"); // Ensure arrow head is always solid line style

		// Add decorations to the node-node or association links.
		linkGroup.each(function(d) {
			if (d.type === NODE_LINK || d.type === ASSOCIATION_LINK) {
				that.addDecorations(d, DEC_LINK, d3.select(this), d.decorations);
			}
		});

		// Set connection status of output ports and input ports plus arrow.
		if (this.canvasLayout.connectionType === "ports") {
			const portOutSelector = this.getSelectorForClass("d3-node-port-output");
			const portInSelector = this.getSelectorForClass(this.getNodeInputPortClassName());
			const portInArrSelector = this.getSelectorForClass("d3-node-port-input-arrow");
			this.canvasGrp.selectAll(portOutSelector).attr("connected", "no");
			this.canvasGrp.selectAll(portInSelector).attr("connected", "no");
			this.canvasGrp.selectAll(portInArrSelector).attr("connected", "no");
			lineArray.forEach((line) => {
				if (line.type === NODE_LINK) {
					this.setTrgPortStatus(line.trg.id, line.trgPortId, "yes");
					this.setSrcPortStatus(line.src.id, line.srcPortId, "yes");
				}
			});
		}

		this.setDisplayOrder(linkGroup);

		var endTimeDrawingLines = Date.now();

		if (showLinksTime) {
			this.logger.log("displayLinks R " + (timeAfterDelete - startTimeDrawingLines) +
			" B " + (afterLineArray - timeAfterDelete) + " D " + (endTimeDrawingLines - afterLineArray));
		}
		this.logger.logEndTimer("displayLinks " + this.getFlags());
	}

	setLinkLineStyles(link, type) {
		const style = this.getObjectStyle(link, "line", type);
		this.canvasGrp.select(this.getSelectorForId("link_line", link.id)).attr("style", style);
	}

	// Adds the binding nodes, which map to the containing supernode's ports, to
	// the set of affected nodes and comments.
	getSupernodeBindingNodes() {
		const snBindingNodes = [];
		this.activePipeline.nodes.forEach((node) => {
			if (this.isSuperBindingNode(node)) {
				snBindingNodes.push(node);
			}
		});

		return snBindingNodes;
	}

	getLinkSelectionAreaClass(d) {
		if (d.type === ASSOCIATION_LINK) {
			return "d3-association-link-selection-area";
		} else if (d.type === COMMENT_LINK) {
			return "d3-comment-link-selection-area";
		}
		return "d3-data-link-selection-area";
	}

	getDataLinkClass(d) {
		// If the data has a classname that isn't the historical default use it!
		if (d.class_name && d.class_name !== "canvas-data-link" && d.class_name !== "d3-data-link") {
			return d.class_name;
		}
		// If the class name provided IS the historical default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		return "d3-data-link";
	}

	getLinkClass(d) {
		if (d.type === ASSOCIATION_LINK) {
			return this.getAssociationLinkClass(d);
		} else if (d.type === COMMENT_LINK) {
			return this.getCommentLinkClass(d);
		}
		return this.getDataLinkClass(d);
	}

	getAssociationLinkClass(d) {
		// If the data has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-object-link") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		if (this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
			return "d3-association-link";
		}
		return "d3-object-link";
	}

	getCommentLinkClass(d) {
		// If the data has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-comment-link") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		return "d3-comment-link";
	}

	getCommentRectClass(d) {
		// If the comment has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-comment") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		return "d3-comment-rect";
	}

	getNodeBodyClass(d) {
		// If the node has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-node" && d.class_name !== "d3-node-body") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name.
		return "d3-node-body-outline";
	}

	// Pushes the links to be below nodes and then pushes comments to be below
	// nodes and links. This lets the user put a large comment underneath a set
	// of nodes and links for annotation purposes.
	setDisplayOrder(linkGroup) {
		// Force those links without decorations to be behind those with decorations
		// in case the links overlap we don't want the decorations to be overwritten.
		linkGroup.filter((lnk) => this.hasOneDecorationOrMore(lnk)).lower();
		linkGroup.filter((lnk) => !this.hasOneDecorationOrMore(lnk)).lower();

		// We push comments to the back in the reverse order they were added to the
		// comments array. This is to ensure that pasted comments get displayed on
		// top of previously existing comments.
		const comments = this.activePipeline.comments;

		for (var idx = comments.length - 1; idx > -1; idx--) {
			this.canvasGrp.selectAll(this.getSelectorForId("comment_grp", comments[idx].id)).lower();
		}
	}

	// Returns true if the link passed in has one or more decorations.
	hasOneDecorationOrMore(link) {
		return link.decorations && link.decorations.length > 0;
	}

	buildLineArray() {
		let lineArray = [];

		this.activePipeline.links.forEach((link) => {
			const trgNode = this.getNode(link.trgNodeId);
			const srcObj = link.type === COMMENT_LINK ? this.getComment(link.srcNodeId) : this.getNode(link.srcNodeId);

			if (srcObj === null) {
				this.logger.error(
					"Common Canvas error trying to draw a link. A link was specified for source " + link.srcNodeId +
					" in the Canvas data that does not have a valid source node/comment.");
			}

			if (trgNode === null) {
				this.logger.error(
					"Common Canvas error trying to draw a link. A link was specified for target " + link.trgNodeId +
					" in the Canvas data that does not have a valid target node.");
			}

			// Only proceed if we have a source and a target node/comment and the
			// conditions are right for displaying the link.
			if (srcObj && trgNode && this.shouldDisplayLink(srcObj, trgNode, link.type)) {
				const srcPortId = this.getSourcePortId(link, srcObj);
				const trgPortId = this.getTargetPortId(link, trgNode);
				const assocLinkVariation =
					link.type === ASSOCIATION_LINK && this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE
						? this.getAssocLinkVariation(srcObj, trgNode)
						: null;
				const coords = this.linkUtils.getLinkCoords(link.type, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation);

				lineArray.push({
					"id": link.id,
					"class_name": link.class_name,
					"style": link.style,
					"style_temp": link.style_temp,
					"type": link.type,
					"decorations": link.decorations,
					"assocLinkVariation": assocLinkVariation,
					"src": srcObj,
					"srcPortId": srcPortId,
					"trg": trgNode,
					"trgPortId": trgPortId,
					"x1": coords.x1,
					"y1": coords.y1,
					"x2": coords.x2,
					"y2": coords.y2
				});
			}
		});

		// Adjust the minInitialLine for elbow type connections to prevent overlapping
		if (this.canvasLayout.linkType === LINK_TYPE_ELBOW) {
			lineArray = this.addMinInitialLineForElbow(lineArray);
		}

		// Add conneciton path info to the line objects.
		lineArray = this.linkUtils.addConnectionPaths(lineArray);

		return lineArray;
	}

	// Returns a source port Id if one exists in the link, otherwise defaults
	// to the first available port on the source node.
	getSourcePortId(link, srcNode) {
		var srcPortId;
		if (link.srcNodePortId) {
			srcPortId = link.srcNodePortId;
		} else if (srcNode.outputs && srcNode.outputs.length > 0) {
			srcPortId = srcNode.outputs[0].id;
		} else {
			srcPortId = null;
		}
		return srcPortId;
	}

	// Returns a target port Id if one exists in the link, otherwise defaults
	// to the first available port on the target node.
	getTargetPortId(link, trgNode) {
		var trgPortId;
		if (link.trgNodePortId) {
			trgPortId = link.trgNodePortId;
		} else if (trgNode.inputs && trgNode.inputs.length > 0) {
			trgPortId = trgNode.inputs[0].id;
		} else {
			trgPortId = null;
		}
		return trgPortId;
	}

	// Returns true if a link should be displayed and false if not. The link
	// should not be displayed if the displayLinkOnOverlap flag is false and the
	// nodes are overlapping.
	shouldDisplayLink(srcNode, trgNode, linkType) {
		if (this.canvasLayout.displayLinkOnOverlap === false) {
			return !this.areLinkedObjectsOverlapping(srcNode, trgNode, linkType);
		}

		return true;
	}

	// Returns true if the linked objects overlap. srcObj can be either a comment
	// or node while trgNode is always a node.
	areLinkedObjectsOverlapping(srcObj, trgNode, linkType) {
		const srcHightlightGap = linkType === COMMENT_LINK ? this.canvasLayout.commentHighlightGap : srcObj.layout.nodeHighlightGap;
		const trgHightlightGap = trgNode.layout.nodeHighlightGap;

		const srcLeft = srcObj.x_pos - srcHightlightGap;
		const srcRight = srcObj.x_pos + srcObj.width + srcHightlightGap;
		const trgLeft = trgNode.x_pos - trgHightlightGap;
		const trgRight = trgNode.x_pos + trgNode.width + trgHightlightGap;

		const srcTop = srcObj.y_pos - srcHightlightGap;
		const srcBottom = srcObj.y_pos + srcObj.height + srcHightlightGap;
		const trgTop = trgNode.y_pos - trgHightlightGap;
		const trgBottom = trgNode.y_pos + trgNode.height + trgHightlightGap;

		if (srcRight >= trgLeft && trgRight >= srcLeft &&
				srcBottom >= trgTop && trgBottom >= srcTop) {
			return true;
		}
		return false;
	}

	// Loops through the current nodes and for each node that has multiple
	// output ports:
	// 1. Gets the line-data objects associated with those ports.
	// 2. Sorts those line-data objects based on the vertical separation from
	//    the source to the target.
	// 3. Applies ever increasing minInitialLine values to the line-data objects
	//    based on their sort order.
	// The result is that the elbow lines emantating the ports of the node do not
	// overlap.
	addMinInitialLineForElbow(lineArray) {
		this.activePipeline.nodes.forEach((node) => {
			if (node.outputs && node.outputs.length > 1) {
				const nodeLineData = this.getNodeOutputLines(node, lineArray);
				const sortedNodeLineData = this.sortNodeLineData(nodeLineData);
				this.applyMinInitialLine(node, sortedNodeLineData);
			}
		});
		return lineArray;
	}

	// Returns a new array of line-data objects that are for links that
	// emenate from the output ports of the source node passed in.
	getNodeOutputLines(srcNode, lineArray) {
		const outArray = [];
		lineArray.forEach((lineData) => {
			if (lineData.src.id === srcNode.id) {
				outArray.push(lineData);
			}
		});
		return outArray;
	}

	// Returns the input array of line-data objects sorted by the differences
	// between the absolute distance from the source port position to the
	// target port position. This means the lines connecting source node ports
	// to target node ports over the furthest distance (in the y direction with
	// Left -> Right linkDirection) will be sorted first and the lines connecting
	// source to target ports over the shortest y direction distance will be sorted last.
	sortNodeLineData(nodeLineData) {
		return nodeLineData.sort((nodeLineData1, nodeLineData2) => {
			let first;
			let second;
			if (this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT) {
				first = Math.abs(nodeLineData1.y1 - nodeLineData1.y2);
				second = Math.abs(nodeLineData2.y1 - nodeLineData2.y2);
			} else {
				first = Math.abs(nodeLineData1.x1 - nodeLineData1.x2);
				second = Math.abs(nodeLineData2.x1 - nodeLineData2.x2);
			}
			if (first === second) {
				if (this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT) {
					return (nodeLineData1.y1 < nodeLineData1.y2) ? 1 : -1; // Tie breaker
				}
				return (nodeLineData1.x1 < nodeLineData1.x2) ? 1 : -1; // Tie breaker

			} else if (first < second) {
				return 1;
			}
			return -1;
		});
	}

	// Loops through the line-data objects associated with the output ports of
	// the node passed in and applies an ever increasing minInitialLine value to
	// each one. This means that, because the line data objects are sorted by
	// vertical separation, the line with greatest vertical separation will get
	// the smallest minInitialLine and the line with the smallest vertical
	// separation will get the biggest minInitialLine.
	applyMinInitialLine(node, sortedNodeLineData) {
		let runningInitialLine = node.layout.minInitialLine;
		sortedNodeLineData.forEach((lineData) => {
			lineData.minInitialLineForElbow = runningInitialLine;
			runningInitialLine += lineData.src.layout.minInitialLineIncrement;
		});
	}

	// Returns a variation of association link to draw when a new link is being
	// drawn outwards from a port. startX is the beginning point of the line
	// at the port. endX is the position where the mouse is currently positioned.
	getNewLinkAssocVariation(startX, endX) {
		if (this.drawingNewLinkData.portType === "input" && startX > endX) {
			return ASSOC_VAR_CURVE_LEFT;

		} else if (this.drawingNewLinkData.portType === "output" && startX < endX) {
			return ASSOC_VAR_CURVE_RIGHT;
		}
		return ASSOC_VAR_DOUBLE_BACK_RIGHT;
	}

	// Returns a variation of association link to draw between a source node and a
	// target node based on their relative positions.
	getAssocLinkVariation(srcNode, trgNode) {
		const gap = srcNode.layout.minInitialLine;
		if (trgNode.x_pos >= srcNode.x_pos + srcNode.width + gap) {
			return ASSOC_VAR_CURVE_RIGHT;

		} else if (srcNode.x_pos >= trgNode.x_pos + trgNode.width + gap) {
			return ASSOC_VAR_CURVE_LEFT;

		// TODO - If we decide to optionally also support doubleBackLeft for
		// association links at some point uncomment this code.
		// } else if (trgNode.x_pos + (trgNode.width / 2) >= srcNode.x_pos + (srcNode.width / 2)) {
		// 	return DOUBLE_BACK_LEFT;
		}
		return ASSOC_VAR_DOUBLE_BACK_RIGHT;
	}

	// Returns path for arrow head
	getPortArrowPath(port) {
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			return `M ${port.cx - 3} ${port.cy - 2} L ${port.cx} ${port.cy + 2} ${port.cx + 3} ${port.cy - 2}`;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			return `M ${port.cx - 3} ${port.cy + 2} L ${port.cx} ${port.cy - 2} ${port.cx + 3} ${port.cy + 2}`;
		}

		return `M ${port.cx - 2} ${port.cy - 3} L ${port.cx + 2} ${port.cy} ${port.cx - 2} ${port.cy + 3}`;
	}

	// Returns arrow head path. If the linkType is Elbow it makes sure
	// the arrow head is for a horizontal line because the end of those types of
	// line is always horizontal. Otherwise it returns an arrow head
	// path relevant to the slope of the straight link being drawn.
	getArrowHead(d) {
		const angle =
			this.canvasLayout.linkType === LINK_TYPE_ELBOW
				? this.getElbowArrowHeadAngle()
				: Math.atan2((d.y2 - d.y1), (d.x2 - d.x1));

		const clockwiseAngle = angle - 0.3;
		const x3 = d.x2 - Math.cos(clockwiseAngle) * 10;
		const y3 = d.y2 - Math.sin(clockwiseAngle) * 10;

		const antiClockwiseAngle = angle + 0.3;
		const x4 = d.x2 - Math.cos(antiClockwiseAngle) * 10;
		const y4 = d.y2 - Math.sin(antiClockwiseAngle) * 10;

		return `M ${d.x2} ${d.y2} L ${x3} ${y3} M ${d.x2} ${d.y2} L ${x4} ${y4}`;
	}

	// Returns the angle the arrow head, for an elbow type link, should point.
	getElbowArrowHeadAngle() {
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			return NINETY_DEGREES_IN_RADIANS;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			return -NINETY_DEGREES_IN_RADIANS;
		}
		return 0;
	}

	getErrorMarkerIcon(data) {
		const messageLevel = this.getMessageLevel(data.messages);
		let iconPath = "";
		switch (messageLevel) {
		case ERROR:
			iconPath = NODE_ERROR_ICON;
			break;
		case WARNING:
			iconPath = NODE_WARNING_ICON;
			break;
		default:
			break;
		}
		return iconPath;
	}

	getConnectedLinks(selectedObjects) {
		var links = [];
		selectedObjects.forEach((selectedObject) => {
			const linksContaining = this.activePipeline.links.filter(function(link) {
				return (link.srcNodeId === selectedObject.id || link.trgNodeId === selectedObject.id);
			});
			links = union(links, linksContaining);
		});
		return links;
	}

	// Adds to the array of nodes and comments passed in, any nodes that are
	// connected to the nodes in the input array provided they have multiple
	// output ports. This is necessary for the Elbow link type because the
	// minInitialIne of links emanating from multiple output ports of a node
	// are affected by each other.
	addAffectedNodesForElbow(affectedNodesAndComments) {
		let newAffectedNodesAndComments = affectedNodesAndComments.map((obj) => obj);
		affectedNodesAndComments.forEach((object) => {
			const addObjects = [];
			this.activePipeline.links.forEach((link) => {
				if (link.trgNodeId === object.id) {
					const srcNode = this.getNode(link.srcNodeId);
					if (srcNode && srcNode.outputs && srcNode.outputs.length > 1) {
						addObjects.push(srcNode);
					}
				}
			});
			newAffectedNodesAndComments = union(newAffectedNodesAndComments, addObjects);
		});
		return newAffectedNodesAndComments;
	}

	getConnectedLinksFromNodeSizingArray(selectedObjects) {
		var links = [];
		forIn(selectedObjects, (selectedObject, selectedObjectId) => {
			const linksContaining = this.activePipeline.links.filter(function(link) {
				return (link.srcNodeId === selectedObjectId || link.trgNodeId === selectedObjectId);
			});
			links = union(links, linksContaining);
		});
		return links;
	}

	getConnectedLinksFromCommentBeingSized(resizedComment) {
		const links = this.activePipeline.links.filter(function(link) {
			return (link.srcNodeId === resizedComment.id || link.trgNodeId === resizedComment.id);
		});
		return links;
	}

	getSelectedNodesAndComments() {
		var objs = [];
		this.activePipeline.nodes.forEach((node) => {
			if (this.objectModel.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		this.activePipeline.comments.forEach((comment) => {
			if (this.objectModel.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});
		return objs;
	}

	canOpenTip(tipType) {
		return this.canvasController.isTipEnabled(tipType) &&
			!this.selecting && !this.regionSelect && !this.dragging &&
			!this.commentSizing && !this.nodeSizing && !this.drawingNewLinkData;
	}

	// Return the x,y coordinates of the svg group relative to the window's viewport
	// This is used when a new comment is created from the toolbar to make sure the
	// new comment always appears in the view port.
	getSvgViewportOffset() {
		let xPos = this.canvasLayout.addCommentOffset;
		let yPos = this.canvasLayout.addCommentOffset;

		if (this.zoomTransform) {
			xPos = this.zoomTransform.x / this.zoomTransform.k;
			yPos = this.zoomTransform.y / this.zoomTransform.k;

			// The window's viewport is in the opposite direction of zoomTransform
			xPos = -xPos + this.canvasLayout.addCommentOffset;
			yPos = -yPos + this.canvasLayout.addCommentOffset;
		}

		return {
			x_pos: xPos,
			y_pos: yPos
		};
	}

	// Returns a string that explains which flags are set to true.
	getFlags() {
		let str = "Flags:";
		if (this.canvasController.isTipOpening()) {
			str += " tipOpening = true";
		}
		if (this.canvasController.isTipClosing()) {
			str += " tipClosing = true";
		}
		if (this.dragging) {
			str += " dragging = true";
		}
		if (this.nodeSizing) {
			str += " nodeSizing = true";
		}
		if (this.commentSizing) {
			str += " commentSizing = true";
		}
		if (this.movingBindingNodes) {
			str += " movingBindingNodes = true";
		}
		if (this.selecting) {
			str += " selecting = true";
		}
		if (this.regionSelect) {
			str += " regionSelect = true";
		}
		if (str === "Flags:") {
			str += " None set to true";
		}
		return str;
	}
}
