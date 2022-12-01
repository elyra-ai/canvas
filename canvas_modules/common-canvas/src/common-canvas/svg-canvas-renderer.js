/*
 * Copyright 2017-2022 Elyra Authors
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

// Import just the D3 modules that are needed and combine them as the 'd3' object.
import * as d3Drag from "d3-drag";
import * as d3Ease from "d3-ease";
import * as d3Selection from "d3-selection";
import * as d3Fetch from "d3-fetch";
import * as d3Zoom from "./d3-zoom-extension/src";
const d3 = Object.assign({}, d3Drag, d3Ease, d3Selection, d3Fetch, d3Zoom);

const markdownIt = require("markdown-it")({
	html: false, // Don't allow HTML to be executed in comments.
	linkify: false, // Don't convert strings, in URL format, to be links.
	typographer: true
});

import { cloneDeep, escape as escapeText, forOwn, get } from "lodash";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_CURVE, LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_LEFT_RIGHT, LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP,
	LINK_SELECTION_NONE, LINK_SELECTION_HANDLES, LINK_SELECTION_DETACHABLE,
	CONTEXT_MENU_BUTTON, DEC_LINK, DEC_NODE, LEFT_ARROW_ICON, EDIT_ICON,
	NODE_MENU_ICON, SUPER_NODE_EXPAND_ICON, PORT_OBJECT_CIRCLE, PORT_OBJECT_IMAGE,
	TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_DEC, TIP_TYPE_LINK,
	INTERACTION_MOUSE, INTERACTION_TRACKPAD, INTERACTION_CARBON,
	USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON,
	SUPER_NODE, SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING,
	NORTH, SOUTH, EAST, WEST }
	from "./constants/canvas-constants";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";
import SUPERNODE_EXT_ICON from "../../assets/images/supernode_ext.svg";
import Logger from "../logging/canvas-logger.js";
import CanvasUtils from "./common-canvas-utils.js";
import SvgCanvasDisplay from "./svg-canvas-utils-display.js";
import SvgCanvasNodes from "./svg-canvas-utils-nodes.js";
import SvgCanvasComments from "./svg-canvas-utils-comments.js";
import SvgCanvasLinks from "./svg-canvas-utils-links.js";
import SvgCanvasDecs from "./svg-canvas-utils-decs.js";
import SvgCanvasTextArea from "./svg-canvas-utils-textarea.js";
import SVGCanvasPipeline from "./svg-canvas-pipeline";

const NINETY_DEGREES = 90;

const INPUT_TYPE = "input_type";
const OUTPUT_TYPE = "output_type";


export default class SVGCanvasRenderer {
	constructor(pipelineId, canvasDiv, canvasController, canvasInfo, config, supernodeInfo = {}) {
		this.logger = new Logger(["SVGCanvasRenderer", "PipeId", pipelineId]);
		this.logger.logStartTimer("constructor" + pipelineId.substring(0, 5));
		this.pipelineId = pipelineId;
		this.supernodeInfo = supernodeInfo; // Contents will be undefined in case of primary pipeline renderer
		this.canvasDiv = canvasDiv;
		this.canvasInfo = canvasInfo;
		this.config = config;
		this.canvasController = canvasController;
		this.objectModel = this.canvasController.getObjectModel();
		this.activePipeline = new SVGCanvasPipeline(pipelineId, canvasInfo);

		// An array of renderers for the supernodes on the canvas.
		this.superRenderers = [];

		// Our instance ID for adding to DOM element IDs
		this.instanceId = this.canvasController.getInstanceId();

		// Get the canvas layout info
		this.canvasLayout = this.objectModel.getCanvasLayout();

		this.dispUtils = new SvgCanvasDisplay(this.canvasController, this.supernodeInfo.d3Selection, this.pipelineId);
		this.nodeUtils = new SvgCanvasNodes(this.canvasLayout);
		this.commentUtils = new SvgCanvasComments();
		this.linkUtils = new SvgCanvasLinks(this.config, this.canvasLayout, this.nodeUtils, this.commentUtils);
		this.decUtils = new SvgCanvasDecs(this.canvasLayout);
		this.svgCanvasTextArea = new SvgCanvasTextArea(
			this.config,
			this.dispUtils,
			this.nodeUtils,
			this.decUtils,
			this.canvasController,
			this.canvasDiv,
			this.activePipeline,
			this.displayComments.bind(this), // Function
			this.displayLinks.bind(this), // Function
			this.getCommentToolbarPos.bind(this) // Function
		);

		this.dispUtils.setDisplayState();
		this.logger.log(this.dispUtils.getDisplayStateMsg());

		// Initialize zoom variables
		this.initializeZoomVariables();

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 1.8;

		// Allows us to track the sizing behavior of comments
		this.commentSizing = false;
		this.commentSizingDirection = "";

		// Allows us to track the sizing behavior of nodes
		this.nodeSizing = false;
		this.nodeSizingDirection = "";
		this.nodeSizingObjectsInfo = {};
		this.nodeSizingDetLinksInfo = {};

		// Keeps track of the size and position, at the start of the sizing event,
		// of the object (node or comment) being sized.
		this.resizeObjInitialInfo = null;

		// Keeps track of the size and position, during a sizing event, of the
		// object (node or comment) being sized, before it is snapped to grid.
		this.notSnappedXPos = 0;
		this.notSnappedYPos = 0;
		this.notSnappedWidth = 0;
		this.notSnappedHeight = 0;

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

		// The detached data links a node is currently being dragged over. It will
		// be empty when the node being dragged is not over any data links.
		// When dragging a node over detached links there may be more than one
		// entry in this array.
		this.dragOverDetachedLinks = [];

		// An object containing the x and y offset of the position of the mouse
		// pointer from the top left corner of the node that is being dragged.
		this.dragPointerOffsetInNode = null;

		// The node over which the 'guide' object for a new link or a link handle
		// is being dragged. Used when enableHighlightNodeOnNewLinkDrag config
		// option is switched on.
		this.dragNewLinkOverNode = null;

		// Flag to indicate if the current drag operation is for a node that can
		// be inserted into a link. Such a node would need input and output ports.
		this.existingNodeInsertableIntoLink = false;

		// Flag to indicate if the current drag operation is for a node that can
		// be attached to a detached link.
		this.existingNodeAttachableToDetachedLinks = false;

		// Allow us to track when a selection is being made so there is
		// no need to re-render whole canvas
		this.selecting = false;

		// Flag to indicate when the space key is down (used when dragging).
		this.spaceKeyPressed = false;

		// Flag to indicate when a zoom is invoked programmatically.
		this.zoomingAction = false;

		// Keep track of when the context menu has been closed, so we don't remove
		// selections when a context menu is closed during a zoom gesture.
		this.contextMenuClosedOnZoom = false;

		// Keep track of when text editing has been closed, so we don't remove
		// selections when that happens during a zoom gesture.
		this.textEditingClosedfOnZoom = false;

		// Used to monitor the region selection rectangle.
		this.regionSelect = false;

		// Used to track the start of the zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0, startX: 0, startY: 0 };

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

		this.draggingLinkData = null;

		this.dragSelectionHandle = d3.drag()
			.on("start", this.dragStartLinkHandle.bind(this))
			.on("drag", this.dragMoveLinkHandle.bind(this))
			.on("end", this.dragEndLinkHandle.bind(this));

		// Create a zoom object for use with the canvas.
		this.zoom =
			d3.zoom()
				.trackpad(this.config.enableInteractionType === INTERACTION_TRACKPAD)
				.preventBackGesture(true)
				.wheelDelta((d3Event) => -d3Event.deltaY * (this.config.enableInteractionType === INTERACTION_TRACKPAD ? 0.02 : 0.002))
				.scaleExtent([this.minScaleExtent, this.maxScaleExtent])
				.on("start", this.zoomStart.bind(this))
				.on("zoom", this.zoomAction.bind(this))
				.on("end", this.zoomEnd.bind(this));

		this.initializeGhostDiv();

		this.canvasSVG = this.createCanvasSVG();
		this.canvasGrp = this.createCanvasGroup(this.canvasSVG, "d3-canvas-group"); // Group to contain all canvas objects
		this.canvasUnderlay = this.createCanvasUnderlay(this.canvasGrp, "d3-canvas-underlay"); // Put underlay rectangle under comments, nodes and links
		this.commentsGrp = this.createCanvasGroup(this.canvasGrp, "d3-comments-group"); // Group to always position comments under nodes and links
		this.nodesLinksGrp = this.createCanvasGroup(this.canvasGrp, "d3-nodes-links-group"); // Group to position nodes and links over comments
		this.boundingRectsGrp = this.createBoundingRectanglesGrp(this.canvasGrp, "d3-bounding-rect-group"); // Group to optionally add bounding rectangles over all objects


		this.resetCanvasSVGBehaviors();

		this.displayCanvas();

		if (this.dispUtils.isDisplayingFullPage()) {
			this.restoreZoom();
		}

		// If we are showing a sub-flow in full screen mode, or the options is
		// switched on to always display it, show the 'back to parent' control.
		if (this.dispUtils.isDisplayingSubFlowFullPage() ||
				this.canvasLayout.alwaysDisplayBackToParentFlow) {
			this.addBackToParentFlowArrow(this.canvasSVG);
		}

		// If we are showing a sub-flow in full screen mode and there
		// is no saved zoom for this pipeline, zoom it to fit the
		// screen so it looks similar to the in-place sub-flow view.
		if (this.dispUtils.isDisplayingSubFlowFullPage() &&
				!this.canvasController.getSavedZoom(this.pipelineId)) {
			this.zoomToFit();
		}

		// If we are showing an in-place subflow make sure any already existing
		// port on the parent supernode overlap on top of our SVG area.
		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			this.supernodeInfo.d3Selection.selectAll(".d3-node-port-input").raise();
			this.supernodeInfo.d3Selection.selectAll(".d3-node-port-output").raise();
		}

		this.logger.logEndTimer("constructor" + pipelineId.substring(0, 5));
	}

	setSpaceKeyPressed(state) {
		this.spaceKeyPressed = state;
		this.resetCanvasCursor();
	}

	// Returns true if the space bar is pressed and held down. This is called
	// from outside canvas via svg-canvas-d3 as well as internally.
	isSpaceKeyPressed() {
		return this.spaceKeyPressed;
	}

	// Returns true if the event indicates that a drag is in action. This means
	// with regular Mouse interation that the space bar is pressed or with
	// legacy interation it means the shift key is NOT pressed.
	isDragActivated(d3Event) {
		if (this.config.enableInteractionType === INTERACTION_CARBON) {
			return this.isSpaceKeyPressed();
		}
		return (d3Event && d3Event.sourceEvent && !d3Event.sourceEvent.shiftKey);
	}

	// Returns the data object for the parent supernode that references the
	// active pipeline (managed by this renderer). We get the supernode by
	// looking through the overall canvas info objects.
	// Don't be tempted into thinking you can retrieve the supernode datum by
	// calling the parent renderer because there is no parent renderer when we
	// are showing a sub-flow in full page mode.
	getParentSupernodeDatum() {
		let node = null;
		this.canvasInfo.pipelines.forEach((pipeline) => {
			if (pipeline.id === this.supernodeInfo.pipelineId) {
				if (!node) {
					node =
						pipeline.nodes.find((n) =>
							CanvasUtils.isSupernode(n) && n.id === this.supernodeInfo.id);
				}
			}
		});
		return node;
	}

	getZoomTransform() {
		return this.zoomTransform;
	}

	initializeZoomVariables() {
		// Allows us to record the current zoom amounts.
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);
	}

	setCanvasInfoRenderer(canvasInfo) {
		this.logger.logStartTimer("setCanvasInfoRenderer" + this.pipelineId.substring(0, 5));
		this.canvasInfo = canvasInfo;
		this.activePipeline.initialize(this.pipelineId, canvasInfo);
		this.canvasLayout = this.objectModel.getCanvasLayout(); // Refresh the canvas layout info in case it changed.

		// Set the display state incase we changed from in-place to full-page
		// sub-flow display.
		this.dispUtils.setDisplayState();
		this.logger.log(this.dispUtils.getDisplayStateMsg());

		// Reset the SVG area's zoom behaviors. We do this in case the canvas has
		// changed from empty (no nodes/comments) where we do not need any zoom
		// behavior to populated (with at least one node or comment) where we do
		// need the zoom behavior, or vice versa.
		this.resetCanvasSVGBehaviors();

		// If a supernode and its corresponding pipeline has been deleted in the
		// object model we need to make sure the renderer is removed.
		this.superRenderers = this.cleanUpSuperRenderers();

		// Display all objects for this renderer's pipeline. When supernodes in
		// this pipeline are rendered they will pass on the new canvasinfo to their
		// associated renderer.
		this.displayCanvas();

		this.logger.logEndTimer("setCanvasInfoRenderer" + this.pipelineId.substring(0, 5));
	}

	// Returns a subset of renderers, from the current set of super renderers,
	// that correspond to the supernodes for the active pipeline. This will
	// remove any renderers that do not have a corresponding supernode which
	// might happen when a supernode is deleted directly, or removed through an
	// undo action.
	cleanUpSuperRenderers() {
		const newSuperRenderers = [];
		const supernodes = this.activePipeline.getSupernodes();

		supernodes.forEach((supernode) => {
			const ren = this.getRendererForSupernode(supernode);
			if (ren) {
				newSuperRenderers.push(ren);
			}

			this.getDiscardedRenderersForSupernode(supernode)
				.forEach((dr) => dr.canvasSVG.remove());
		});

		return newSuperRenderers;
	}

	clearCanvas() {
		this.initializeZoomVariables();
		this.canvasSVG.remove();
	}

	// This is called when the user changes the size of the canvas area.
	refreshOnSizeChange() {
		this.logger.log("refreshOnSizeChange");
		if (this.dispUtils.isDisplayingSubFlowFullPage()) {
			this.displayBindingNodesToFitSVG();
		}

		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		if (this.config.enablePositionNodeOnRightFlyoutOpen &&
				this.canvasController.isRightFlyoutOpen()) {
			const posInfo = this.config.enablePositionNodeOnRightFlyoutOpen;
			const x = posInfo.x ? posInfo.x : 50;
			const y = posInfo.y ? posInfo.y : 50;
			const selNodeIds = this.canvasController.getSelectedNodes().map((n) => n.id);
			const zoom = this.getZoomToReveal(selNodeIds, x, y);
			this.zoomTo(zoom);
		}
	}

	hideCanvas() {
		this.canvasSVG.style("display", "none");
	}

	displayCanvas() {
		this.logger.logStartTimer("displayCanvas");

		// Ensure the SVG area is displayed, incase it was previously hidden.
		this.canvasSVG.style("display", "inherit");

		this.displayComments();
		this.displayNodes();
		this.displayLinks();

		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			this.displaySVGToFitSupernode();
		}

		// The supernode will not have any calculated port positions when the
		// subflow is being displayed full screen, so calculate them first.
		if (this.dispUtils.isDisplayingSubFlowFullPage()) {
			this.displayPortsForSubFlowFullPage();
		}

		this.displayCanvasAccoutrements();

		this.logger.logEndTimer("displayCanvas");
	}

	displayCanvasAccoutrements() {
		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		if (this.config.enableCanvasUnderlay !== "None" && this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			this.setCanvasUnderlaySize();
		}
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
		const background = this.canvasSVG.selectChildren(".d3-svg-background");
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

		this.displayMovedNodes();
		this.displayMovedLinks();

		this.logger.log("displayBindingNodesToFitSVG - end");
	}

	getParentSupernodeSVGDimensions() {
		const datum = this.getParentSupernodeDatum();
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
		const transformedSVGRect = this.getTransformedViewportDimensions();

		// this.logger.log("transformedSVGRect" +
		// 	" x = " + transformedSVGRect.x +
		// 	" y = " + transformedSVGRect.y +
		// 	" width = " + transformedSVGRect.width +
		// 	" height = " + transformedSVGRect.height);

		const supernodeDatum = this.getParentSupernodeDatum();

		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM ||
				this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			const svgWid = supernodeDatum.width - (2 * this.canvasLayout.supernodeSVGAreaPadding);
			this.activePipeline.nodes.forEach((d) => {
				if (d.isSupernodeInputBinding) {
					const x = this.nodeUtils.getSupernodePortXOffset(d.id, supernodeDatum.inputs);
					d.x_pos = (transformedSVGRect.width * (x / svgWid)) + transformedSVGRect.x - d.outputs[0].cx;
					d.y_pos = this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM
						? transformedSVGRect.y - d.height
						: transformedSVGRect.y + transformedSVGRect.height;
				}
				if (d.isSupernodeOutputBinding) {
					const x = this.nodeUtils.getSupernodePortXOffset(d.id, supernodeDatum.outputs);
					d.x_pos = (transformedSVGRect.width * (x / svgWid)) + transformedSVGRect.x - d.inputs[0].cx;
					d.y_pos = this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM
						? d.y_pos = transformedSVGRect.y + transformedSVGRect.height
						: d.y_pos = transformedSVGRect.y - d.height;
				}
			});

		} else {
			// If we have navigated from an in-place supernode view the supernode
			// will be expanded. If we navigated from a collapsed node (directly to
			// the full screen view) the supernode will not be expanded so we set the
			// dimensions accordingly.
			let topAreaHeight;
			let svgHt;
			if (CanvasUtils.isExpanded(supernodeDatum)) {
				topAreaHeight = this.canvasLayout.supernodeTopAreaHeight;
				svgHt = supernodeDatum.height - (this.canvasLayout.supernodeTopAreaHeight + this.canvasLayout.supernodeSVGAreaPadding);
			} else {
				topAreaHeight = 0;
				svgHt = supernodeDatum.height;
			}

			// Position the binding nodes.
			this.activePipeline.nodes.forEach((d) => {
				if (d.isSupernodeInputBinding) {
					d.x_pos = transformedSVGRect.x - d.width;
					const y = this.nodeUtils.getSupernodePortYOffset(d.id, supernodeDatum.inputs) - topAreaHeight;
					d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.outputs[0].cy;
				}
				if (d.isSupernodeOutputBinding) {
					d.x_pos = transformedSVGRect.x + transformedSVGRect.width;
					const y = this.nodeUtils.getSupernodePortYOffset(d.id, supernodeDatum.outputs) - topAreaHeight;
					d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.inputs[0].cy;
				}
			});
		}
	}

	// Display bounding rectangles around the SVG area and the canvas area defined
	// by the nodes and comments.
	displayBoundingRectangles() {
		if (!this.activePipeline) {
			return;
		}
		const svgRect = this.getViewportDimensions();
		const transformedSVGRect = this.getTransformedRect(svgRect, 1);
		const canv = this.getCanvasDimensionsAdjustedForScale(1);
		const canvWithPadding = this.getCanvasDimensionsAdjustedForScale(1, this.getZoomToFitPadding());

		this.boundingRectsGrp.selectChildren(".d3-bounding").remove();

		const grp = this.boundingRectsGrp
			.append("g")
			.attr("class", "d3-bounding");

		grp
			.append("rect")
			.attr("height", svgRect.height)
			.attr("width", svgRect.width)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "none")
			.style("stroke", "darkorange");

		grp
			.append("rect")
			.attr("height", transformedSVGRect.height)
			.attr("width", transformedSVGRect.width - 2)
			.attr("x", transformedSVGRect.x)
			.attr("y", transformedSVGRect.y)
			.style("fill", "none")
			.style("stroke", "red");

		if (canv) {
			grp
				.append("rect")
				.attr("height", canv.height)
				.attr("width", canv.width)
				.attr("x", canv.left)
				.attr("y", canv.top)
				.style("fill", "none")
				.style("stroke", "blue");
		}

		if (canvWithPadding) {
			grp
				.append("rect")
				.attr("height", canvWithPadding.height)
				.attr("width", canvWithPadding.width)
				.attr("x", canvWithPadding.left)
				.attr("y", canvWithPadding.top)
				.style("fill", "none")
				.style("stroke", "green");
		}

		if (this.config.enableBoundingRectangles &&
				this.superRenderers.length > 0) {
			this.superRenderers.forEach((sr) => sr.displayBoundingRectangles());
		}
	}

	// Returns true when we are editing text. Called by svg-canvas-d3.
	isEditingText() {
		if (this.svgCanvasTextArea.isEditingText()) {
			return true;
		}
		let state = false;
		this.superRenderers.forEach((superRen) => {
			if (!state) {
				state = superRen.isEditingText();
			}
		});
		return state;
	}

	// Returns true when we are dragging objects. Called by svg-canvas-d3.
	isDragging() {
		return this.dragging;
	}

	// Returns true if the node should be resizeable. Expanded supernodes are
	// always resizabele and all other nodes, except collapsed supernodes, are
	// resizeable when enableResizableNodes is switched on.
	isNodeResizable(node) {
		if (!this.config.enableEditingActions ||
				CanvasUtils.isSuperBindingNode(node) ||
				CanvasUtils.isCollapsedSupernode(node) ||
				(!this.config.enableResizableNodes && !CanvasUtils.isExpandedSupernode(node))) {
			return false;
		}
		return true;
	}

	// Returns true if the node should have a resizing area. We should display
	// a sizing area even for collapsed supernodes so it is available if/when
	// the supernode is expanded
	shouldDisplayNodeSizingArea(node) {
		return !CanvasUtils.isSuperBindingNode(node) &&
			(CanvasUtils.isSupernode(node) || this.config.enableResizableNodes);
	}

	getAllNodeGroupsSelection() {
		return this.nodesLinksGrp.selectChildren(".d3-node-group");
	}

	getAllLinkGroupsSelection() {
		return this.nodesLinksGrp.selectChildren(".d3-link-group");
	}

	getAllCommentGroupsSelection() {
		return this.commentsGrp.selectChildren(".d3-comment-group");
	}

	getNodeGroupSelectionById(nodeId) {
		const nodeGrpSelector = this.getSelectorForId("node_grp", nodeId);
		return this.nodesLinksGrp.selectChildren(nodeGrpSelector);
	}

	getLinkGroupSelectionById(linkId) {
		const linkGrpSelector = this.getSelectorForId("link_grp", linkId);
		return this.nodesLinksGrp.selectChildren(linkGrpSelector);
	}

	getCommentGroupSelectionById(comId) {
		const selector = this.getSelectorForId("comment_grp", comId);
		return this.commentsGrp.selectChildren(selector);
	}

	getNodeDecSelectionById(decId, nodeId) {
		const nodeSel = this.getNodeGroupSelectionById(nodeId);
		const selector = this.getSelectorForId("node_dec_group", decId);
		return nodeSel.selectAll(selector);
	}

	getLinkDecSelectionById(decId, linkId) {
		const linkSel = this.getLinkGroupSelectionById(linkId);
		const selector = this.getSelectorForId("link_dec_group", decId);
		return linkSel.selectAll(selector);
	}

	// Returns a selector for the ID string like one of the following:
	// * [data-id='prefix_instanceID']
	// * [data-id='prefix_instanceID_suffix']
	// * [data-id='prefix_instanceID_suffix_suffix2']
	// depending on what parameters are provided.
	getSelectorForId(prefix, suffix, suffix2) {
		return `[data-id='${this.getId(prefix, suffix, suffix2)}']`;
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

	// Returns the passed in mouse position snapped to the grid
	// if either option is switched on.
	getMousePosSnapToGrid(mousePos) {
		let transPos = mousePos;

		if (this.config.enableSnapToGridType === SNAP_TO_GRID_DURING ||
				this.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			transPos = this.snapToGridPosition(transPos);
		}
		return transPos;
	}

	// Returns the object passed in with its position and size snapped to
	// the current grid dimensions.
	snapToGridObject(inResizeObj) {
		const resizeObj = inResizeObj;
		resizeObj.x_pos = CanvasUtils.snapToGrid(resizeObj.x_pos, this.canvasLayout.snapToGridXPx);
		resizeObj.y_pos = CanvasUtils.snapToGrid(resizeObj.y_pos, this.canvasLayout.snapToGridYPx);
		resizeObj.width = CanvasUtils.snapToGrid(resizeObj.width, this.canvasLayout.snapToGridXPx);
		resizeObj.height = CanvasUtils.snapToGrid(resizeObj.height, this.canvasLayout.snapToGridYPx);
		return resizeObj;
	}

	// Returns the current mouse position transformed by the current zoom
	// transformation amounts based on the local SVG -- that is, if we're
	// displaying a sub-flow it is based on the SVG in the supernode.
	getTransformedMousePos(d3Event) {
		return this.transformPos(this.getMousePos(d3Event, this.canvasSVG));
	}

	// Returns the current mouse position based on the D3 SVG selection object
	// passed in.
	getMousePos(d3Event, svgSel) {
		// The d3Event must have either a sourceEvent or be an actual event, which
		// can be indicated by the existence of a pageX attribute. This test is only
		// necessary on Firefox and then only when the action (such as zoom)
		// calling this function is itself called programmatically - for example,
		// when the user clicks one of the zoom buttons on the toolbar. It's not
		// clear why d3.pointer cannot handle all events like it can on Chrome.
		if (d3Event.sourceEvent || d3Event.pageX) {
			const mousePos = d3.pointer(d3Event, svgSel.node());
			return { x: mousePos[0], y: mousePos[1] };
		}
		return { x: 0, y: 0 };
	}

	// Convert coordinates from the page (based on the page top left corner) to
	// canvas coordinates based on the canvas coordinate system.
	convertPageCoordsToCanvasCoords(x, y) {
		const svgRect = this.canvasSVG.node().getBoundingClientRect();
		return this.transformPos({ x: x - Math.round(svgRect.left), y: y - Math.round(svgRect.top) });
	}

	// Transforms the x and y fields passed in by the current zoom
	// transformation amounts to convert a coordinate position in screen pixels
	// to a canvas coordinate position.
	transformPos(pos) {
		return {
			x: (pos.x - this.zoomTransform.x) / this.zoomTransform.k,
			y: (pos.y - this.zoomTransform.y) / this.zoomTransform.k
		};
	}

	// Transforms the x and y fields passed in by the current zoom
	// transformation amounts to convert a canvas coordinate position
	// to a coordinate position in screen pixels.
	unTransformPos(pos) {
		return {
			x: (pos.x * this.zoomTransform.k) + this.zoomTransform.x,
			y: (pos.y * this.zoomTransform.k) + this.zoomTransform.y
		};
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

	// Creates the div which contains the ghost node for drag and
	// drop actions from the palette. The way setDragImage is handled in
	// browsers for HTML drag and drop is very odd since the image has to be
	// 'visible' but not necssarily on display! I know, it confusing. Checkout
	// this link for an explanation:
	// https://www.kryogenix.org/code/browser/custom-drag-image.html
	// Consequently, we place the ghost div, using CSS, within the canvas div
	// with an absolute position and with a z-index to make it 'appear'
	// underneath the svg area.
	initializeGhostDiv() {
		if (this.dispUtils.isDisplayingFullPage() &&
				this.getGhostDivSel().empty()) {
			this.canvasDiv
				.append("div")
				.attr("class", "d3-ghost-div");
		}
	}

	// Returns the ghost div selection. We always reselect the ghost div when it
	// is required because there is one ghost div for the whole common-canvas so
	// if this renderer is for an in-place subflow we need to get the ghost image
	// from the parent div.
	getGhostDivSel() {
		return this.canvasDiv.selectAll(".d3-ghost-div");
	}

	// Returns a ghost data object for displaying a ghost image when dragging
	// nodes from the palette. The object contains a DOM element to display
	// plus its width and height. This needs to be called each time a new node
	// is dragged from the palette, in case the dimensions of the ghost node
	// have changed because the canvas has been zoomed.
	getGhostNode(nodeTemplate) {
		const that = this;
		const ghost = this.getGhostDimensions();
		const node = this.canvasController.convertNodeTemplate(nodeTemplate);
		node.layout = this.canvasController.getObjectModel().getNodeLayout();
		if (node.is_expanded) {
			node.width = node.expanded_width;
			node.height = node.expanded_height;
		} else if (node.isResized) {
			node.width = node.resizeWidth;
			node.height = node.resizeHeight;
		} else {
			node.width = ghost.width;
			node.height = ghost.height;
		}
		const nodeImage = this.getNodeImage(node);
		const nodeImageType = this.getImageType(nodeImage);
		const ghostDivSel = this.getGhostDivSel();

		// Calculate the ghost area width which is the maximum of either the node
		// label or the default node width.
		const nodeLayout = this.objectModel.getNodeLayout();
		const ghostAreaWidth = Math.max(nodeLayout.labelWidth, node.width);

		// Remove any existing SVG object from the div
		ghostDivSel
			.selectAll(".d3-ghost-svg")
			.remove();

		// Create a new SVG area for the ghost area.
		const ghostAreaSVG = ghostDivSel
			.append("svg")
			.attr("width", ghostAreaWidth * this.zoomTransform.k)
			.attr("height", (50 + node.height) * this.zoomTransform.k) // Add some extra pixels, in case label is below label bottom
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "d3-ghost-svg");

		const ghostGrp = ghostAreaSVG
			.append("g")
			.attr("class", "d3-node-group");

		ghostGrp
			.append("rect")
			.attr("class", "d3-ghost-node")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", node.width)
			.attr("height", node.height);

		ghostGrp
			.append(nodeImageType)
			.attr("class", "d3-node-image")
			.each(function() { that.setNodeImageContent(this, node); })
			.attr("x", this.nodeUtils.getNodeImagePosX(node))
			.attr("y", this.nodeUtils.getNodeImagePosY(node))
			.attr("width", this.nodeUtils.getNodeImageWidth(node))
			.attr("height", this.nodeUtils.getNodeImageHeight(node));

		const fObject = ghostGrp
			.append("foreignObject")
			.attr("x", this.nodeUtils.getNodeLabelPosX(node))
			.attr("y", this.nodeUtils.getNodeLabelPosY(node))
			.attr("width", this.nodeUtils.getNodeLabelWidth(node))
			.attr("height", this.nodeUtils.getNodeLabelHeight(node))
			.attr("class", "d3-foreign-object-ghost-label");

		const fObjectDiv = fObject
			.append("xhtml:div")
			.attr("class", this.nodeUtils.getNodeLabelClass(node));

		const fObjectSpan = fObjectDiv
			.append("xhtml:span")
			.html(node.label);

		// At the time of writing, Firefox takes the ghost image from only those
		// objects that are visible (ignoring any invisible objects like the div
		// and SVG area) consequently we position the node and label so the label
		// (if bigger than the node width) is positioned up against the left edge
		// of the invisible div and SVG area. If the label is shorter than the node
		// width, the node is positioned up against the left edge of the SVG. We do
		// this by translating the group object in the x direction.

		// First calculate the display width of the label. The span will be the
		// full text but it may be constricted by the label width in the layout.
		const labelSpanWidth = fObjectSpan.node().getBoundingClientRect().width + 4; // Include border for label
		const nodeLabelWidth = this.nodeUtils.getNodeLabelWidth(node);
		const labelDisplayLength = Math.min(nodeLabelWidth, labelSpanWidth);

		// Next calculate the amount, if any, the label protrudes beyond the edge
		// of the node width and move the ghost group by that amount.
		const xOffset = Math.max(0, (labelDisplayLength - ghost.width) / 2) * this.zoomTransform.k;
		ghostGrp.attr("transform", `translate(${xOffset}, 0) scale(${this.zoomTransform.k})`);

		// If the label is center justified, restrict the label width to the
		// display amount and adjust the x coordinate to compensate for the change
		// in width.
		if (node.layout.labelAlign === "center") {
			const labelDiff = Math.max(0, (nodeLabelWidth - labelDisplayLength) / 2);

			fObject
				.attr("width", labelDisplayLength)
				.attr("x", this.nodeUtils.getNodeLabelPosX(node) + labelDiff);
			fObjectDiv.attr("width", labelDisplayLength);
		}

		// Get the amount the actual browser page is 'zoomed'. This is differet
		// to the zoom amount for the canvas objects.
		const browserZoom = this.getBrowserZoom();

		// Calculate the center of the node area for positioning the mouse pointer
		// on the image when it is being dragged.
		const centerX = (xOffset + ((ghost.width / 2) * this.zoomTransform.k)) * browserZoom;
		const centerY = ((ghost.height / 2) * this.zoomTransform.k) * browserZoom;

		return {
			element: ghostDivSel.node(),
			centerX: centerX,
			centerY: centerY
		};
	}

	// Returns the amount the actual browser page is 'zoomed'. This is differet
	// to the zoom amount for the canvas objects. Unfortunately, this value is not
	// returned the same for each type of browser so we have to calculate it based
	// on the type of browser.
	getBrowserZoom() {
		let browserZoom = window.devicePixelRatio;

		// Make sure we search for browser idntifiers in this order because with
		// the Chrome browser userAgent contains the words "Chrome and "Safari"!
		// However, with the Safari browser, userAgent only contains the word "Safari".
		if (navigator.userAgent.includes("Chrome")) {
			browserZoom = 1; // This works for Chrome

		} else if (navigator.userAgent.includes("Safari")) {
			browserZoom = (window.outerWidth - 8) / window.innerWidth; // This works for Safari

		} else if (navigator.userAgent.includes("Firefox")) {
			browserZoom = 1; // This works for Firefox
		}

		return browserZoom;
	}

	// Returns an object containing the dimensions of the ghost node that hovers
	// over canvas when a node is being dragged from the palette. The ghost node
	// is based on the default node width and height so any change to these values
	// that might be made to a node by the layoutHandler will not be reflected here.
	getGhostDimensions() {
		const nodeLayout = this.objectModel.getNodeLayout();
		return {
			width: nodeLayout.defaultNodeWidth,
			height: nodeLayout.defaultNodeHeight
		};
	}

	nodeTemplateDragStart(nodeTemplate) {
		if (this.isNodeTemplateInsertableIntoLink(nodeTemplate)) {
			this.setDataLinkSelectionAreaWider(true);
		}
	}

	nodeTemplateDragEnd(nodeTemplate) {
		if (this.isNodeTemplateInsertableIntoLink(nodeTemplate)) {
			this.setDataLinkSelectionAreaWider(false);
		}
	}

	// Highlights any data link, that an 'insertable' nodeTemplate from the
	// palette, is dragged over. The x and y passed in are in page coordinates
	// based on the top left corner of the page.
	nodeTemplateDragOver(nodeTemplate, x, y) {
		if (this.isNodeTemplateInsertableIntoLink(nodeTemplate)) {
			const link = this.getLinkAtMousePos(x, y);
			// Set highlighting when there is no link because this will turn
			// current highlighting off. And only switch on highlighting when we are
			// over a fully attached link (not a detached link).
			if (!link || this.isLinkFullyAttached(link)) {
				this.setInsertNodeIntoLinkHighlighting(link);
			}
		}

		if (this.isNodeTemplateAttachableToDetachedLinks(nodeTemplate)) {
			const mousePos = this.convertPageCoordsToCanvasCoords(x, y);
			const ghost = this.getGhostDimensions();
			const ghostArea = {
				x1: mousePos.x - (ghost.width / 2),
				y1: mousePos.y - (ghost.height / 2),
				x2: mousePos.x + (ghost.width / 2),
				y2: mousePos.y + (ghost.height / 2)
			};
			const template = this.canvasController.convertNodeTemplate(nodeTemplate);
			const links = this.getAttachableLinksForNodeAtPos(template, ghostArea);
			this.setDetachedLinkHighlighting(links);
		}

		if (this.config.enableCanvasUnderlay !== "None" && this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			this.setCanvasUnderlaySize(x, y);
		}
	}

	// Switches on or off data link highlighting depending on the element
	// passed in and keeps track of the currently highlighted link. This is
	// called when a node is being dragged from the palette or canvas onto an
	// attached link (which joins two nodes together) which is enabled when
	// 'enableInsertNodeDroppedOnLink' is true.
	setInsertNodeIntoLinkHighlighting(link) {
		if (link) {
			if (!this.dragOverLink) {
				this.dragOverLink = link;
				this.setNodeDragOverLinkHighlighting(this.dragOverLink, true);

			} else if (link.id !== this.dragOverLink.id) {
				this.unsetInsertNodeIntoLinkHighlighting();
				this.dragOverLink = link;
				this.setNodeDragOverLinkHighlighting(this.dragOverLink, true);
			}
		} else {
			this.unsetInsertNodeIntoLinkHighlighting();
		}
	}

	// Switchs off the data link highlighting caused when an insertable
	// node is dragged over a link (which joins two nodes together)
	// which is enabled when 'enableInsertNodeDroppedOnLink' is true.
	unsetInsertNodeIntoLinkHighlighting(link) {
		if (this.dragOverLink) {
			this.setNodeDragOverLinkHighlighting(this.dragOverLink, false);
			this.dragOverLink = null;
		}
	}

	// Switches on or off data link highlighting depending on the link array
	// passed in and keeps track of the currently highlighted links. This is
	// called when a node is dragged from the palette or the canvas over a
	// fully or partially detached link This beheavior is enabled when
	// 'enableLinkSelection 'is set to LINK_SELECTION_DETACHABLE.
	setDetachedLinkHighlighting(links) {
		if (links && links.length > 0) {
			this.unsetDetachedLinkHighlighting();
			this.dragOverDetachedLinks = links;
			this.dragOverDetachedLinks.forEach((link) => this.setNodeDragOverLinkHighlighting(link, true));

		} else {
			if (this.dragOverDetachedLinks.length > 0) {
				this.unsetDetachedLinkHighlighting();
			}
		}
	}

	// Switchs off the link highlighting when a node is dragged over a fully or
	// partially detached link. This beheavior is enabled when
	// 'enableLinkSelection 'is set to LINK_SELECTION_DETACHABLE.
	unsetDetachedLinkHighlighting() {
		this.dragOverDetachedLinks.forEach((link) => this.setNodeDragOverLinkHighlighting(link, false));
		this.dragOverDetachedLinks = [];
	}

	// Switches on or off the drop-node highlighting on the link passed in.
	// This is called when the user drags a node over a link.
	// Link highlighting is used for the 'enableInsertNodeDroppedOnLink' function
	// where a node can be dragged from either the palette or the canvas onto a
	// link between two nodes AND it is used for the function where a node can
	// be dragged from either the palette of canvas onto a detached link. This is
	// enabled when enableLinkSelection is set to LINK_SELECTION_DETACHABLE.
	setNodeDragOverLinkHighlighting(link, state) {
		this.getLinkGroupSelectionById(link.id)
			.attr("data-drag-node-over", state ? true : null); // true will add the attr, null will remove it
	}

	// Switches on or off node port highlighting depending on the node
	// passed in and keeps track of the currently highlighted node. This is
	// called as a new link is being drawn towards a target node to highlight
	// the target node.
	setNewLinkOverNode(d3Event) {
		const nodeNearMouse = this.getNodeNearMousePos(d3Event, this.canvasLayout.nodeProximity);
		if (nodeNearMouse && this.isConnectionAllowedToNearbyNode(d3Event, nodeNearMouse)) {
			if (!this.dragNewLinkOverNode) {
				this.dragNewLinkOverNode = nodeNearMouse;
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, true);

			} else if (nodeNearMouse.id !== this.dragNewLinkOverNode.id) {
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = nodeNearMouse;
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, true);
			}

		} else {
			if (this.dragNewLinkOverNode) {
				this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = null;
			}
		}
	}

	isConnectionAllowedToNearbyNode(d3Event, nodeNearMouse) {
		if (this.drawingNewLinkData) {
			if (this.drawingNewLinkData.action === NODE_LINK) {
				const srcNode = this.drawingNewLinkData.srcNode;
				const trgNode = nodeNearMouse;
				const srcNodePortId = this.drawingNewLinkData.srcNodePortId;
				const trgNodePortId = CanvasUtils.getDefaultInputPortId(trgNode); // TODO - make specific to nodes.
				return CanvasUtils.isDataConnectionAllowed(srcNodePortId, trgNodePortId, srcNode, trgNode, this.activePipeline.links);

			} else if (this.drawingNewLinkData.action === ASSOCIATION_LINK) {
				const srcNode = this.drawingNewLinkData.srcNode;
				const trgNode = nodeNearMouse;
				return CanvasUtils.isAssocConnectionAllowed(srcNode, trgNode, this.activePipeline.links);

			} else if (this.drawingNewLinkData.action === COMMENT_LINK) {
				const srcObjId = this.drawingNewLinkData.srcObjId;
				const trgNodeId = nodeNearMouse.id;
				return CanvasUtils.isCommentLinkConnectionAllowed(srcObjId, trgNodeId, this.activePipeline.links);
			}
		} else if (this.draggingLinkData) {
			const newLink = this.getNewLinkOnDrag(d3Event, this.canvasLayout.nodeProximity);
			if (newLink) {
				return true;
			}
		}
		return false;
	}

	// Switches on or off the input-port highlighting on the node passed in.
	// This is called when the user drags a new link towards a target node.
	setNewLinkOverNodeHighlighting(node, state) {
		if (node) {
			this.getNodeGroupSelectionById(node.id)
				.attr("data-new-link-over", state ? "yes" : "no");
		}
	}

	// Removes the data-new-link-over attribute used for highlighting a node
	// that a new link is being dragged towards or over.
	setNewLinkOverNodeCancel() {
		this.setNewLinkOverNodeHighlighting(this.dragNewLinkOverNode, false);
		this.dragNewLinkOverNode = null;
	}

	// Processes the drop of a palette node template onto the canvas.
	nodeTemplateDropped(nodeTemplate, x, y) {
		if (nodeTemplate === null) {
			return;
		}
		const transPos = this.transformMousePosForNode(x, y);

		// If the node template was dropped on a link
		if (this.dragOverLink) {
			this.canvasController.createNodeFromTemplateOnLinkAt(
				nodeTemplate, this.dragOverLink, transPos, this.pipelineId);
			this.unsetInsertNodeIntoLinkHighlighting();

		// If the node template was dropped on one or more detached links.
		} else if (this.dragOverDetachedLinks.length > 0) {
			this.canvasController.createNodeFromTemplateAttachLinks(
				nodeTemplate, this.dragOverDetachedLinks, transPos, this.pipelineId);
			this.unsetDetachedLinkHighlighting();

		// If the node template was dropped on the canvas.
		} else {
			this.canvasController.createNodeFromTemplateAt(
				nodeTemplate, transPos, this.pipelineId);
		}
	}

	// Processes the drop of an 'external' object onto the canvas. This may be
	// either a node from the desktop or even from elsewhere on the browser page.
	externalObjectDropped(dropData, x, y) {
		if (dropData === null) {
			return;
		}
		const transPos = this.transformMousePosForNode(x, y);
		this.canvasController.createDroppedExternalObject(dropData, transPos, this.pipelineId);
	}

	// Transforms the mouse position passed in to be appropriate for a palette
	// node or external object being dragged over the canvas.
	transformMousePosForNode(x, y) {
		const mousePos = this.convertPageCoordsToCanvasCoords(x, y);

		// Offset mousePos so new node appears in center of mouse location.
		const ghost = this.getGhostDimensions();
		mousePos.x -= ghost.width / 2;
		mousePos.y -= ghost.height / 2;

		return this.getMousePosSnapToGrid(mousePos);
	}

	// Returns true if the nodeTemplate passed in is 'insertable' into a data
	// link between nodes on the canvas. This involves ensuring the node template
	// will create a non binding node and also that the cardinality of the ports
	// is not explicitely set to zero (which some crazy apps want to do!).
	isNodeTemplateInsertableIntoLink(nodeTemplate) {
		return this.config.enableInsertNodeDroppedOnLink &&
			CanvasUtils.hasInputAndOutputPorts(nodeTemplate) &&
			!this.isPortMaxCardinalityZero(nodeTemplate.inputs[0]) &&
			!this.isPortMaxCardinalityZero(nodeTemplate.outputs[0]);
	}

	// Returns true if the current drag objects array has a single node which
	// is 'insertable' into a data link between nodes on the canvas.  Returns
	// false otherwise, including if a single comment is being dragged.
	isExistingNodeInsertableIntoLink() {
		return (this.config.enableInsertNodeDroppedOnLink &&
			this.dragObjects.length === 1 &&
			CanvasUtils.isNode(this.dragObjects[0]) &&
			CanvasUtils.hasInputAndOutputPorts(this.dragObjects[0]) &&
			!CanvasUtils.isNodeDefaultPortsCardinalityAtMax(this.dragObjects[0], this.activePipeline.links));
	}

	// Returns true if the current drag objects array has a single node which
	// is 'attachable' to any detached link on the canvas. Returns false otherwise,
	// including if a single comment is being dragged.
	isExistingNodeAttachableToDetachedLinks() {
		return (this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
			this.dragObjects.length === 1 &&
			CanvasUtils.isNode(this.dragObjects[0]));
	}

	// Returns true if the current node template being dragged from the palette
	// is 'attachable' to any detached link on the canvas. Returns false otherwise.
	isNodeTemplateAttachableToDetachedLinks(nodeTemplate) {
		return this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE;
	}

	// Returns an array of detached links, which can be attached to the node
	// passed in, that exist in proximity to the mouse position provided. Proximity
	// is specified by the dimensions of the ghost area passed in.
	// Note: The passed in 'node' will be a node when an existing node on the
	// canvas is being dragged but will be a node template when a node is being
	// dragged from the palette. Since both have inputs and outputs all should be OK.
	getAttachableLinksForNodeAtPos(node, ghostArea) {
		const nodeHasInputs = node.inputs && node.inputs.length > 0;
		const nodeHasOutputs = node.outputs && node.outputs.length > 0;

		let attachableLinks = this.activePipeline.links.filter((link) => {
			if (link.srcPos && nodeHasOutputs &&
					CanvasUtils.isPosInArea(link.srcPos, ghostArea, this.canvasLayout.ghostAreaPadding)) {
				link.nodeOverSrcPos = true;
				return true;
			}
			if (link.trgPos && nodeHasInputs &&
					CanvasUtils.isPosInArea(link.trgPos, ghostArea, this.canvasLayout.ghostAreaPadding)) {
				link.nodeOverTrgPos = true;
				return true;
			}
			link.nodeOverSrcPos = false;
			link.nodeOverTrgPos = false;
			return false;
		});

		if (attachableLinks.length > 0) {

			// Make sure the attachable links can be attached to the node based on
			// the availability of ports and whether they are maxed out or not.
			const linkArrays =
				CanvasUtils.getDetachedLinksToUpdate(node, attachableLinks, this.activePipeline.links);
			attachableLinks = linkArrays.oldLinks;
		}
		return attachableLinks;
	}

	// Returns true if the link is attached to both a source node and a
	// target node which is indicated by the link having srcNodeId and trgNodeId
	// fields. When either or both of these fields are undefined the link is
	// semi or fully detached. This can happen when detachable links are allowed.
	isLinkFullyAttached(link) {
		if (link) {
			return typeof link.srcNodeId !== "undefined" && typeof link.trgNodeId !== "undefined";
		}
		return false;
	}

	getNodePort(nodeId, portId, type) {
		const node = this.activePipeline.getNode(nodeId);
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

	// Sets the maximum zoom extent if we are the renderer of the top level flow
	// or calls the same method on our parent renderer if we are a sub-flow. This
	// means the factors will multiply as they percolate up to the top flow.
	setMaxZoomExtent(factor) {
		if (this.dispUtils.isDisplayingFullPage()) {
			const newMaxExtent = this.maxScaleExtent * factor;

			this.zoom.scaleExtent([this.minScaleExtent, newMaxExtent]);
		} else {
			const newFactor = Number(factor) * 1 / this.zoomTransform.k;
			this.supernodeInfo.renderer.setMaxZoomExtent(newFactor);
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
		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			parentObject = this.supernodeInfo.d3Selection;
			dims = this.getParentSupernodeSVGDimensions();
		}

		const canvasSVG = parentObject
			.append("svg")
			.attr("class", "svg-area") // svg-area used in tests.
			.attr("data-pipeline-id", this.activePipeline.id)
			.attr("width", dims.width)
			.attr("height", dims.height)
			.attr("x", dims.x)
			.attr("y", dims.y)
			.on("mouseenter", (d3Event, d) => {
				// If we are a sub-flow (i.e we have a parent renderer) set the max
				// zoom extent with a factor calculated from our zoom amount.
				if (this.supernodeInfo.renderer && this.config.enableZoomIntoSubFlows) {
					this.supernodeInfo.renderer.setMaxZoomExtent(1 / this.zoomTransform.k);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				// If we are a sub-flow (i.e we have a parent renderer) set the max
				// zoom extent with a factor of 1.
				if (this.supernodeInfo.renderer && this.config.enableZoomIntoSubFlows) {
					this.supernodeInfo.renderer.setMaxZoomExtent(1);
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
			.style("cursor", "default");

		// Only attach the 'defs' to the top most SVG area when we are displaying
		// either the primary pipeline full page or a sub-pipeline full page.
		if (this.dispUtils.isDisplayingFullPage()) {
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
		// area i.e. when we are displaying either the primary pipeline full page
		// or a sub-pipeline full page.
		if (!this.activePipeline.isEmptyOrBindingsOnly() &&
				this.dispUtils.isDisplayingFullPage()) {
			this.canvasSVG
				.call(this.zoom);
		}

		// These behaviors will be applied to SVG areas at the top level and
		// SVG areas displaying an in-place subflow
		this.canvasSVG
			.on("mousemove.zoom", (d3Event) => {
				// this.logger.log("Zoom - mousemove - drawingNewLink = " + this.drawingNewLinkData ? "yes" : "no");
				if (this.drawingNewLinkData) {
					this.drawNewLink(d3Event);
				}
				if (this.draggingLinkData) {
					this.dragLinkHandle(d3Event);
				}
			})
			// Don't use mousedown.zoom here as it will replace the zoom start behavior
			// and prevent panning of canvas background.
			.on("mousedown", (d3Event) => {
				this.logger.log("Canvas - mousedown");
				// When displaying inplace subflow and a context menu is requested
				// suppress the mouse down which would go to the containing supernode.
				// This prevents the deselection of any selected nodes in the subflow.
				if (this.dispUtils.isDisplayingSubFlowInPlace() &&
						d3Event.button === CONTEXT_MENU_BUTTON) {
					d3Event.stopPropagation();
				}
			})
			.on("mouseup.zoom", (d3Event) => {
				this.logger.log("Canvas - mouseup-zoom");
				if (this.drawingNewLinkData) {
					this.completeNewLink(d3Event);
				}
				if (this.draggingLinkData) {
					this.completeDraggedLink(d3Event);
				}
			})
			.on("click.zoom", (d3Event) => {
				this.logger.log("Canvas - click-zoom");

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
			.on("contextmenu.zoom", (d3Event, d) => {
				this.logger.log("Zoom - context menu");
				this.openContextMenu(d3Event, "canvas");
			});
	}

	// Resets the pointer cursor on the background rectangle in the Canvas SVG area.
	resetCanvasCursor() {
		const selector = ".d3-svg-background[data-pipeline-id='" + this.activePipeline.id + "']";
		this.canvasSVG.select(selector).style("cursor", this.isDragActivated() && this.dispUtils.isDisplayingFullPage() ? "grab" : "default");
	}

	createCanvasGroup(canvasObj, className) {
		return canvasObj.append("g").attr("class", className);
	}

	createCanvasUnderlay(canvasGrp, className) {
		if (this.config.enableCanvasUnderlay !== "None" && this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			return canvasGrp.append("rect").attr("class", className);
		}
		return null;
	}

	createBoundingRectanglesGrp(canvasGrp, className) {
		if (this.config.enableBoundingRectangles) {
			return canvasGrp.append("g").attr("class", className);
		}
		return null;
	}

	setCanvasUnderlaySize(x = 0, y = 0) {
		const canv = this.getCanvasDimensionsAdjustedForScale(1, this.getZoomToFitPadding());
		if (canv) {
			this.canvasUnderlay
				.attr("x", canv.left - 50)
				.attr("y", canv.top - 50)
				.attr("width", canv.width + 100)
				.attr("height", canv.height + 100);
		}
	}

	addBackToParentFlowArrow(canvasSVG) {
		const g = canvasSVG
			.append("g")
			.attr("transform", "translate(15, 15)")
			.on("mouseenter", function(d3Event, d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "yes");
			})
			.on("mouseleave", function(d3Event, d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "no");
			})
			.on("mousedown mouseup", (d3Event) => {
				// Prevent mouse events going through to the canvas. This prevents
				// a drag gesture on the button activating the canvas drag action.
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
			})
			.on("click", (d3Event) => {
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

	setNodeLabelEditingMode(nodeId, pipelineId) {
		if (this.pipelineId === pipelineId) {
			const node = this.activePipeline.getNode(nodeId);
			if (node && node.layout.labelEditable && this.config.enableEditingActions) {
				const nodeSel = this.getNodeGroupSelectionById(nodeId);
				const nodeDomObj = nodeSel.node();
				this.displayNodeLabelTextArea(node, nodeDomObj);
			}
		} else {
			this.superRenderers.forEach((renderer) => {
				renderer.setNodeLabelEditingMode(nodeId, pipelineId);
			});
		}
	}

	setNodeDecorationLabelEditingMode(decId, nodeId, pipelineId) {
		if (this.pipelineId === pipelineId) {
			const node = this.activePipeline.getNode(nodeId);
			if (node && node.decorations) {
				const dec = node.decorations.find((d) => d.id === decId);
				if (dec && typeof dec.label !== "undefined" && dec.label_editable && this.config.enableEditingActions) {
					const nodeDecSel = this.getNodeDecSelectionById(decId, nodeId);
					const nodeDecDomObj = nodeDecSel.node();
					this.displayDecLabelTextArea(dec, node, "node", nodeDecDomObj);
				}
			}
		} else {
			this.superRenderers.forEach((renderer) => {
				renderer.setLinkDecorationLabelEditingMode(decId, nodeId, pipelineId);
			});
		}
	}

	setLinkDecorationLabelEditingMode(decId, linkId, pipelineId) {
		if (this.pipelineId === pipelineId) {
			const link = this.activePipeline.getLink(linkId);
			if (link && link.decorations) {
				const dec = link.decorations.find((d) => d.id === decId);
				if (dec && typeof dec.label !== "undefined" && dec.label_editable && this.config.enableEditingActions) {
					const linkDecSel = this.getLinkDecSelectionById(decId, linkId);
					const linkDecDomObj = linkDecSel.node();
					this.displayDecLabelTextArea(dec, link, "link", linkDecDomObj);
				}
			}
		} else {
			this.superRenderers.forEach((renderer) => {
				renderer.setLinkDecorationLabelEditingMode(decId, linkId, pipelineId);
			});
		}
	}

	// Restores the zoom of the canvas, if it has changed, based on the type
	// of 'save zoom' specified in the configuration and, if no saved zoom, was
	// provided pans the canvas area so it is always visible.
	restoreZoom() {
		let newZoom = this.canvasController.getSavedZoom(this.pipelineId);

		// If there's no saved zoom, and enablePanIntoViewOnOpen is set, pan so
		// the canvas area (containing nodes and comments) is visible in the viewport.
		if (!newZoom && this.config.enablePanIntoViewOnOpen) {
			const canvWithPadding = this.getCanvasDimensionsAdjustedForScale(1, this.getZoomToFitPadding());
			if (canvWithPadding) {
				newZoom = { x: -canvWithPadding.left, y: -canvWithPadding.top, k: 1 };
			}
		}

		// If there's no saved zoom and we have some initial pan amounts provided use them.
		if (!newZoom && this.canvasLayout.initialPanX && this.canvasLayout.initialPanY) {
			newZoom = { x: this.canvasLayout.initialPanX, y: this.canvasLayout.initialPanY, k: 1 };
		}

		// If new zoom is different to the current zoom amount, apply it.
		if (newZoom &&
				(newZoom.k !== this.zoomTransform.k ||
					newZoom.x !== this.zoomTransform.x ||
					newZoom.y !== this.zoomTransform.y)) {
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
			this.zoomingAction = true;
			const zoomTransform = d3.zoomIdentity.translate(newZoomTransform.x, newZoomTransform.y).scale(newZoomTransform.k);
			if (animateTime) {
				this.canvasSVG.call(this.zoom).transition()
					.duration(animateTime)
					.call(this.zoom.transform, zoomTransform);
			} else {
				this.canvasSVG.call(this.zoom.transform, zoomTransform);
			}
			this.zoomingAction = false;
		}
	}

	zoomToFit() {
		const padding = this.getZoomToFitPadding();
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1, padding);
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

	// Returns the padding space for the canvas objects to be zoomed which takes
	// into account any connections that need to be made to/from any sub-flow
	// binding nodes plus any space needed for the binding nodes ports.
	getZoomToFitPadding() {
		let padding = this.canvasLayout.zoomToFitPadding;

		if (this.dispUtils.isDisplayingSubFlow()) {
			// Allocate some space for connecting lines and the binding node ports
			const newPadding = this.getMaxZoomToFitPaddingForConnections() + (2 * this.canvasLayout.supernodeBindingPortRadius);
			padding = Math.max(padding, newPadding);
		}
		return padding;
	}

	zoomTo(zoomObject) {
		const animateTime = 500;
		this.zoomCanvasInvokeZoomBehavior(zoomObject, animateTime);
	}

	getZoom() {
		return { x: this.zoomTransform.x, y: this.zoomTransform.y, k: this.zoomTransform.k };
	}

	translateBy(x, y, animateTime) {
		const z = this.getZoomTransform();
		const zoomObject = d3.zoomIdentity.translate(z.x + x, z.y + y).scale(z.k);
		this.zoomCanvasInvokeZoomBehavior(zoomObject, animateTime);
	}

	zoomIn() {
		if (this.zoomTransform.k < this.maxScaleExtent) {
			const newScale = Math.min(this.zoomTransform.k * 1.1, this.maxScaleExtent);
			this.canvasSVG.call(this.zoom.scaleTo, newScale);
		}
	}

	zoomOut() {
		if (this.zoomTransform.k > this.minScaleExtent) {
			const newScale = Math.max(this.zoomTransform.k / 1.1, this.minScaleExtent);
			this.canvasSVG.call(this.zoom.scaleTo, newScale);
		}
	}

	isZoomedToMax() {
		return this.zoomTransform ? this.zoomTransform.k === this.maxScaleExtent : false;
	}

	isZoomedToMin() {
		return this.zoomTransform ? this.zoomTransform.k === this.minScaleExtent : false;
	}

	getZoomToReveal(nodeIDs, xPos, yPos) {
		const transformedSVGRect = this.getTransformedViewportDimensions();
		const nodes = this.activePipeline.getNodes(nodeIDs);
		const canvasDimensions = CanvasUtils.getCanvasDimensions(nodes, [], [], 0);
		const canv = this.convertCanvasDimensionsAdjustedForScaleWithPadding(canvasDimensions, 1, 10);
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

		return null;
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

		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			const dims = this.getParentSupernodeSVGDimensions();
			viewportDimensions.width = dims.width;
			viewportDimensions.height = dims.height;

		} else {
			if (this.canvasSVG && this.canvasSVG.node()) {
				viewportDimensions = this.canvasSVG.node().getBoundingClientRect();
			} else {
				viewportDimensions = { x: 0, y: 0, width: 1100, height: 640 }; // Return a sensible default (for Jest tests)
			}
		}
		return viewportDimensions;
	}

	zoomStart(d3Event) {
		this.logger.log("zoomStart - " + JSON.stringify(d3Event.transform));

		// Ensure any open tip is closed before starting a zoom operation.
		this.canvasController.closeTip();

		// Close the context menu, if it's open, before panning or zooming.
		// If the context menu is opened inside the expanded supernode (in-place
		// subflow), when the user zooms the canvas, the full page flow is handling
		// that zoom, which causes a refresh in the subflow, so the full page flow
		// will take care of closing the context menu. This means the in-place
		// subflow doesn’t need to do anything on zoom,
		// hence: !this.dispUtils.isDisplayingSubFlowInPlace()
		if (this.canvasController.isContextMenuDisplayed() &&
				!this.dispUtils.isDisplayingSubFlowInPlace()) {
			this.canvasController.closeContextMenu();
			this.contextMenuClosedOnZoom = true;
		}

		// Any text editing in progress will be closed by the textarea's blur event
		// if the user clicks on the canvas background. So we set this flag to
		// prevent the selection being lost in the zoomEnd (mouseup) event.
		if (this.svgCanvasTextArea.isEditingText()) {
			this.textEditingClosedfOnZoom = true;
		}

		this.regionSelect = this.shouldDoRegionSelect(d3Event);

		if (this.regionSelect) {
			// Add a delay so, if the user just clicks, they don't see the crosshair.
			// This will be cleared in zoomEnd if the user's click takes less than 200 ms.
			this.addingCrossHairCursor = setTimeout(() => this.addTempCursorOverlay("crosshair"), 200);
			this.regionStartTransformX = d3Event.transform.x;
			this.regionStartTransformY = d3Event.transform.y;

		} else {
			if (this.isDragActivated(d3Event)) {
				this.addTempCursorOverlay("grabbing");
			} else {
				this.addTempCursorOverlay("default");
			}
		}

		const transPos = this.getTransformedMousePos(d3Event);
		this.zoomStartPoint = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k, startX: transPos.x, startY: transPos.y };
		this.previousD3Event = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k };
		// Calculate the canvas dimensions here, so we don't have to recalculate
		// them for every zoom action event.
		this.zoomCanvasDimensions = CanvasUtils.getCanvasDimensions(
			this.activePipeline.nodes, this.activePipeline.comments,
			this.activePipeline.links, this.canvasLayout.commentHighlightGap);
	}

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
			this.addTempCursorOverlay("default");
			this.zoomCanvasBackground(d3Event);
			this.zoomCommentToolbar();
		}
	}

	zoomEnd(d3Event) {
		this.logger.log("zoomEnd - " + JSON.stringify(d3Event.transform));

		// Clears the display of the crosshair cursor if the user clicks within 200 ms
		clearTimeout(this.addingCrossHairCursor);

		const transPos = this.getTransformedMousePos(d3Event);

		if (this.drawingNewLinkData) {
			this.stopDrawingNewLink();

		} else if (this.draggingLinkData) {
			this.stopDraggingLink();

		// The user just clicked -- with no drag.
		} else if (transPos.x === this.zoomStartPoint.startX &&
							transPos.y === this.zoomStartPoint.startY &&
							!this.zoomChanged()) {
			this.zoomClick();

		} else if (this.regionSelect) {
			this.zoomEndRegionSelect(d3Event);

		} else if (this.dispUtils.isDisplayingFullPage() && this.zoomChanged()) {
			this.zoomSave();
		}

		// Remove the cursor overlay and reset the SVG background rectangle
		// cursor style, which was set in the zoom start method.
		this.resetCanvasCursor(d3Event);
		this.removeTempCursorOverlay();
		this.contextMenuClosedOnZoom = false;
		this.textEditingClosedfOnZoom = false;
		this.regionSelect = false;
	}

	// Returns true if the region select gesture is requested by the user.
	shouldDoRegionSelect(d3Event) {
		// The this.zoomingAction flag indicates zooming is being invoked
		// programmatically.
		if (this.zoomingAction) {
			return false;

		} else if (this.config.enableInteractionType === INTERACTION_MOUSE &&
				(d3Event && d3Event.sourceEvent && d3Event.sourceEvent.shiftKey)) {
			return true;

		} else if (this.config.enableInteractionType === INTERACTION_CARBON &&
							!this.isSpaceKeyPressed(d3Event)) {
			return true;

		} else if (this.config.enableInteractionType === INTERACTION_TRACKPAD &&
				(d3Event.sourceEvent && d3Event.sourceEvent.buttons === 1) && // Main button is pressed
				!this.spaceKeyPressed) {
			return true;
		}

		return false;
	}

	// Returns true if the current zoom transform is different from the
	// zoom values at the beginning of the zoom action.
	zoomChanged() {
		return (this.zoomTransform.k !== this.zoomStartPoint.k ||
			this.zoomTransform.x !== this.zoomStartPoint.x ||
			this.zoomTransform.y !== this.zoomStartPoint.y);
	}

	zoomCanvasBackground(d3Event) {
		this.regionSelect = false;

		if (this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			const incTransform = this.getTransformIncrement(d3Event);
			this.zoomTransform = this.zoomConstrainRegular(incTransform, this.getViewportDimensions(), this.zoomCanvasDimensions);
		} else {
			this.zoomTransform = d3.zoomIdentity.translate(d3Event.transform.x, d3Event.transform.y).scale(d3Event.transform.k);
		}

		this.canvasGrp.attr("transform", this.zoomTransform);

		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		if (this.config.enableCanvasUnderlay !== "None" &&
				this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			this.setCanvasUnderlaySize();
		}

		// The supernode will not have any calculated port positions when the
		// subflow is being displayed full screen, so calculate them first.
		if (this.dispUtils.isDisplayingSubFlowFullPage()) {
			this.displayPortsForSubFlowFullPage();
		}
	}

	// Handles a zoom operation that is just a click on the canvas background.
	zoomClick() {
		// Only clear selections if clicked on the canvas of the current active pipeline.
		// Clicking the canvas of an expanded supernode will select that node.
		// Also, don't clear selections if we have closed a context menu or
		// closed text editing.
		if (this.dispUtils.isDisplayingCurrentPipeline() && !this.contextMenuClosedOnZoom && !this.textEditingClosedfOnZoom) {
			this.selecting = true;
			this.canvasController.clearSelections();
			this.selecting = false;
		}
	}

	// Handles the behavior when the user stops doing a region select.
	zoomEndRegionSelect(d3Event) {
		this.removeRegionSelector();

		// Reset the transform x and y to what they were before the region
		// selection action was started. This directly sets the x and y values
		// in the __zoom property of the svgCanvas DOM object.
		d3Event.transform.x = this.regionStartTransformX;
		d3Event.transform.y = this.regionStartTransformY;

		const { startX, startY, width, height } = this.getRegionDimensions(d3Event);

		// Ensure the link objects in the active pipeline have their coordinate
		// positions set. The coords might not be set if the last object model
		// update was a change in selections or some other operation that does
		// not redraw link lines.
		this.buildLinksArray();

		const region = { x1: startX, y1: startY, x2: startX + width, y2: startY + height };
		const selections =
			CanvasUtils.selectInRegion(region, this.activePipeline,
				this.config.enableLinkSelection !== LINK_SELECTION_NONE,
				this.config.enableLinkType,
				this.config.enableAssocLinkType);
		this.selecting = true;
		this.canvasController.setSelections(selections, this.activePipeline.id);
		this.selecting = false;
	}

	// Save the zoom amount. The canvas controller/object model will decide
	// how this info is saved.
	zoomSave() {
		// Set the internal zoom value for canvasSVG used by D3. This will be
		// used by d3Event next time a zoom action is initiated.
		this.canvasSVG.property("__zoom", this.zoomTransform);

		const data = {
			editType: "setZoom",
			editSource: "canvas",
			zoom: this.zoomTransform,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);

	}

	// Repositions the comment toolbar so it is always over the top of the
	// comment being edited.
	zoomCommentToolbar() {
		if (this.config.enableMarkdownInComments &&
				this.dispUtils.isDisplayingFullPage() &&
				this.svgCanvasTextArea.isEditingText()) {
			// If a node label or text decoration is being edited com will be undefined.
			const com = this.activePipeline.getComment(this.svgCanvasTextArea.getEditingTextId());
			if (com) {
				const pos = this.getCommentToolbarPos(com);
				this.canvasController.moveTextToolbar(pos.x, pos.y);
			}
		}
	}

	// Returns a position object that describes the position in page coordinates
	// of the comment toolbar so that it is positioned above the comment being edited.
	getCommentToolbarPos(com) {
		const pos = this.unTransformPos({ x: com.x_pos, y: com.y_pos });
		return {
			x: pos.x + this.canvasLayout.commentToolbarPosX,
			y: pos.y + this.canvasLayout.commentToolbarPosY
		};
	}

	// Returns a new zoom which is the result of incrementing the current zoom
	// by the amount since the previous d3Event transform amount.
	// We calculate increments because d3Event.transform is not based on
	// the constrained zoom position (which is very annoying) so we keep track
	// of the current constraind zoom amount in this.zoomTransform.
	getTransformIncrement(d3Event) {
		const xInc = d3Event.transform.x - this.previousD3Event.x;
		const yInc = d3Event.transform.y - this.previousD3Event.y;

		const newTransform = { x: this.zoomTransform.x + xInc, y: this.zoomTransform.y + yInc, k: d3Event.transform.k };
		this.previousD3Event = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k };
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
			this.convertCanvasDimensionsAdjustedForScaleWithPadding(canvasDimensions, k, this.getZoomToFitPadding());

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

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. It
	// does not include the 'super binding nodes' which are the binding nodes in
	// a sub-flow that map to a port in the containing supernode. The dimensions
	// are scaled by k and padded by pad (if provided).
	getCanvasDimensionsAdjustedForScale(k, pad) {
		const gap = this.canvasLayout.commentHighlightGap;
		const canvasDimensions = this.activePipeline.getCanvasDimensions(gap);
		return this.convertCanvasDimensionsAdjustedForScaleWithPadding(canvasDimensions, k, pad);
	}

	convertCanvasDimensionsAdjustedForScaleWithPadding(canv, k, pad) {
		const padding = pad || 0;
		if (canv) {
			return {
				left: (canv.left * k) - padding,
				top: (canv.top * k) - padding,
				right: (canv.right * k) + padding,
				bottom: (canv.bottom * k) + padding,
				width: (canv.width * k) + (2 * padding),
				height: (canv.height * k) + (2 * padding)
			};
		}
		return null;
	}

	drawRegionSelector(d3Event) {
		this.removeRegionSelector();
		const { startX, startY, width, height } = this.getRegionDimensions(d3Event);

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

	// Returns the startX, startY, width and height of the selection region
	// where startX and startY are always the top left corner of the region
	// and width and height are therefore always positive.
	getRegionDimensions(d3Event) {
		const transPos = this.getTransformedMousePos(d3Event);
		let startX = this.zoomStartPoint.startX;
		let startY = this.zoomStartPoint.startY;
		let width = transPos.x - startX;
		let height = transPos.y - startY;

		if (width < 0) {
			width = Math.abs(width);
			startX -= width;
		}
		if (height < 0) {
			height = Math.abs(height);
			startY -= height;
		}

		return { startX, startY, width, height };
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

	dragStart(d3Event, d) {
		this.logger.logStartTimer("dragStart");

		this.closeContextMenuIfOpen();

		// Note: Comment and Node resizing is started by the comment/node highlight rectangle.
		if (this.commentSizing) {
			const resizeObj = this.activePipeline.getComment(d.id);
			this.initializeResizeVariables(resizeObj);

		} else if (this.nodeSizing) {
			const resizeObj = this.activePipeline.getNode(d.id);
			this.initializeResizeVariables(resizeObj);

		} else {
			this.dragObjectsStart(d3Event, d);
		}
		this.logger.logEndTimer("dragStart", true);
	}

	dragMove(d3Event, d) {
		this.logger.logStartTimer("dragMove");
		if (this.commentSizing) {
			this.resizeComment(d3Event, d);
		} else if (this.nodeSizing) {
			this.resizeNode(d3Event, d);
		} else {
			this.dragObjectsAction(d3Event);
		}

		this.logger.logEndTimer("dragMove", true);
	}

	dragEnd(d3Event, d) {
		this.logger.logStartTimer("dragEnd");

		this.removeTempCursorOverlay();

		if (this.commentSizing) {
			this.endCommentSizing(d);

		} else if (this.nodeSizing) {
			this.endNodeSizing(d);

		} else if (this.dragging) {
			this.dragObjectsEnd(d3Event, d);
		}

		this.logger.logEndTimer("dragEnd", true);
	}

	// Starts the dragging action for canvas objects (nodes and comments).
	dragObjectsStart(d3Event, d) {
		// Ensure flags are false before staring a new drag.
		this.existingNodeInsertableIntoLink = false;
		this.existingNodeAttachableToDetachedLinks = false;

		this.dragging = true;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		this.dragRunningX = 0;
		this.dragRunningY = 0;
		this.dragObjects = this.getDragObjects(d);
		if (this.dragObjects && this.dragObjects.length > 0) {
			this.dragStartX = this.dragObjects[0].x_pos;
			this.dragStartY = this.dragObjects[0].y_pos;
		}

		// If we are dragging an 'insertable' node, set it to be translucent so
		// that, when it is dragged over a link line, the highlightd line can be seen OK.
		if (this.isExistingNodeInsertableIntoLink()) {
			this.existingNodeInsertableIntoLink = true;
			this.setNodeTranslucentState(this.dragObjects[0].id, true);
			this.setDataLinkSelectionAreaWider(true);
		}

		// If we are dragging an 'attachable' node, set it to be translucent so
		// that, when it is dragged over link lines, the highlightd lines can be seen OK.
		if (this.isExistingNodeAttachableToDetachedLinks()) {
			this.existingNodeAttachableToDetachedLinks = true;
			const mousePos = this.getTransformedMousePos(d3Event);
			this.dragPointerOffsetInNode = {
				x: mousePos.x - this.dragObjects[0].x_pos,
				y: mousePos.y - this.dragObjects[0].y_pos
			};
			this.setNodeTranslucentState(this.dragObjects[0].id, true);
		}
	}

	// Performs the dragging action for canvas objects (nodes and comments).
	dragObjectsAction(d3Event) {
		this.dragOffsetX += d3Event.dx;
		this.dragOffsetY += d3Event.dy;

		// Limit the size a drag can be so, when the user is dragging objects in
		// an in-place subflow they do not drag them too far.
		// this.logger.log("Drag offset X = " + this.dragOffsetX + " y = " + this.dragOffsetY);
		if (this.dispUtils.isDisplayingSubFlowInPlace() &&
				(this.dragOffsetX > 1000 || this.dragOffsetX < -1000 ||
					this.dragOffsetY > 1000 || this.dragOffsetY < -1000)) {
			this.dragOffsetX -= d3Event.dx;
			this.dragOffsetY -= d3Event.dy;

		} else {
			let	increment = { x: 0, y: 0 };

			if (this.config.enableSnapToGridType === SNAP_TO_GRID_DURING) {
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

			if (this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
				this.getSelectedLinks().forEach((link) => {
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

		this.displayMovedComments();
		this.displayMovedNodes();
		this.displayMovedLinks();
		this.displayCanvasAccoutrements();

		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			this.displaySVGToFitSupernode();
		}


		if (this.existingNodeInsertableIntoLink) {
			const link = this.getLinkAtMousePos(d3Event.sourceEvent.clientX, d3Event.sourceEvent.clientY);
			// Set highlighting when there is no link because this will turn
			// current highlighting off. And only switch on highlighting when we are
			// over a fully attached link (not a detached link) and provided the
			// link is not to/from the node being dragged (which is possible in
			// some odd situations).
			if (!link ||
					(this.isLinkFullyAttached(link) &&
						this.dragObjects[0].id !== link.srcNodeId &&
						this.dragObjects[0].id !== link.trgNodeId)) {
				this.setInsertNodeIntoLinkHighlighting(link);
			}
		}

		if (this.existingNodeAttachableToDetachedLinks) {
			const mousePos = this.getTransformedMousePos(d3Event);
			const node = this.dragObjects[0];
			const ghostArea = {
				x1: mousePos.x - this.dragPointerOffsetInNode.x,
				y1: mousePos.y - this.dragPointerOffsetInNode.y,
				x2: mousePos.x - this.dragPointerOffsetInNode.x + node.width,
				y2: mousePos.y - this.dragPointerOffsetInNode.y + node.height
			};
			const links = this.getAttachableLinksForNodeAtPos(node, ghostArea);
			this.setDetachedLinkHighlighting(links);
		}
	}

	// Ends the dragging action for canvas objects (nodes and comments).
	dragObjectsEnd(d3Event, d) {
		// Set to false before updating object model so main body of displayNodes is run.
		this.dragging = false;

		// If the pointer hasn't moved and enableDragWithoutSelect we interpret
		// that as a select on the object.
		if (this.dragOffsetX === 0 &&
				this.dragOffsetY === 0 &&
				this.config.enableDragWithoutSelect) {
			this.selectObjectSourceEvent(d3Event, d);

		} else {
			if (this.dragRunningX !== 0 ||
					this.dragRunningY !== 0) {
				let dragFinalOffset = null;
				if (this.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
					const stgPos = this.snapToGridDraggedNode();
					dragFinalOffset = {
						x: stgPos.x - this.dragStartX,
						y: stgPos.y - this.dragStartY
					};
				} else {
					dragFinalOffset = { x: this.dragRunningX, y: this.dragRunningY };
				}

				if (this.existingNodeInsertableIntoLink &&
						this.dragOverLink) {
					this.canvasController.editActionHandler({
						editType: "insertNodeIntoLink",
						editSource: "canvas",
						node: this.dragObjects[0],
						link: this.dragOverLink,
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.activePipeline.id });

				} else if (this.existingNodeAttachableToDetachedLinks &&
										this.dragOverDetachedLinks.length > 0) {
					this.canvasController.editActionHandler({
						editType: "attachNodeToLinks",
						editSource: "canvas",
						node: this.dragObjects[0],
						detachedLinks: this.dragOverDetachedLinks,
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.activePipeline.id });

				} else {
					this.canvasController.editActionHandler({
						editType: "moveObjects",
						editSource: "canvas",
						nodes: this.dragObjects.map((o) => o.id),
						links: this.getSelectedLinks().filter((l) => l.srcPos || l.trgPos), // Filter detached links
						offsetX: dragFinalOffset.x,
						offsetY: dragFinalOffset.y,
						pipelineId: this.activePipeline.id });
				}
			}
		}

		// Switch off any drag highlighting
		this.setDataLinkSelectionAreaWider(false);
		this.unsetNodeTranslucentState();
		this.unsetInsertNodeIntoLinkHighlighting();
		this.unsetDetachedLinkHighlighting();
	}

	dragStartLinkHandle(d3Event, d) {
		this.logger.logStartTimer("dragStartLinkHandle");

		this.closeContextMenuIfOpen();

		this.draggingLinkHandle = true;

		const handleSelection = d3.select(d3Event.sourceEvent.currentTarget);
		const link = this.activePipeline.getLink(d.id);
		const oldLink = cloneDeep(link);

		const linkGrpSelector = this.getLinkGroupSelectionById(d.id);

		this.draggingLinkData = {
			lineInfo: d,
			link: link,
			oldLink: oldLink,
			linkGrpSelection: d3.select(linkGrpSelector)
		};

		if (handleSelection.attr("class").includes("d3-link-handle-end")) {
			this.draggingLinkData.endBeingDragged = "end";

		} else if (handleSelection.attr("class").includes("d3-link-handle-start")) {
			this.draggingLinkData.endBeingDragged = "start";
		}

		if (this.config.enableHighlightUnavailableNodes) {
			if (this.draggingLinkData.endBeingDragged === "end") {
				const links = this.activePipeline.links.filter((lnk) => lnk.id !== link.id);
				this.setUnavailableTargetNodesHighlighting(
					this.activePipeline.getNode(this.draggingLinkData.link.srcNodeId),
					this.draggingLinkData.link.srcNodePortId,
					links
				);
			} else if (this.draggingLinkData.endBeingDragged === "start") {
				const links = this.activePipeline.links.filter((lnk) => lnk.id !== link.id);
				this.setUnavailableSourceNodesHighlighting(
					this.activePipeline.getNode(this.draggingLinkData.oldLink.trgNodeId),
					this.draggingLinkData.link.trgNodePortId,
					links
				);
			}
		}

		this.dragLinkHandle(d3Event);
		this.logger.logEndTimer("dragStartLinkHandle", true);
	}

	dragMoveLinkHandle(d3Event) {
		this.logger.logStartTimer("dragMoveLinkHandle");
		this.dragLinkHandle(d3Event);
		this.logger.logEndTimer("dragMoveLinkHandle", true);
	}

	dragEndLinkHandle(d3Event) {
		this.logger.logStartTimer("dragEndLinkHandle");
		this.completeDraggedLink(d3Event);
		this.draggingLinkHandle = false;
		this.logger.logEndTimer("dragEndLinkHandle", true);
	}

	// Switches on or off the translucent state of the node identified by the
	// node ID passed in. This is used when an 'insertable' node is dragged on
	// the canvas. It makes is easier for the user to see the highlighted link
	// when the node is dragged over it.
	setNodeTranslucentState(nodeId, state) {
		this.getNodeGroupSelectionById(nodeId).classed("d3-node-group-translucent", state);
	}

	// Switched off the translucent state of the objects being dragged (if
	// there are any).
	unsetNodeTranslucentState() {
		if (this.dragObjects && this.dragObjects.length > 0) {
			this.setNodeTranslucentState(this.dragObjects[0].id, false);
		}
	}

	// Returns the snap-to-grid position of the object positioned at
	// this.dragStartX and this.dragStartY after applying the current offset of
	// this.dragOffsetX and this.dragOffsetY.
	snapToGridDraggedNode() {
		const objPosX = this.dragStartX + this.dragOffsetX;
		const objPosY = this.dragStartY + this.dragOffsetY;

		return this.snapToGridPosition({ x: objPosX, y: objPosY });
	}

	// Returns the snap-to-grid position of the object positioned at objPos.x
	// and objPos.y. The grid that is snapped to is defined by this.snapToGridXPx
	// and this.snapToGridYPx values which are pixel values.
	snapToGridPosition(objPos) {
		const stgPosX = CanvasUtils.snapToGrid(objPos.x, this.canvasLayout.snapToGridXPx);
		const stgPosY = CanvasUtils.snapToGrid(objPos.y, this.canvasLayout.snapToGridYPx);

		return { x: stgPosX, y: stgPosY };
	}

	displayNodes() {
		this.logger.logStartTimer("displayNodes " + this.getFlags());

		// Do not return from here if there are no nodes because there may
		// be still nodes on display that need to be deleted.

		// Set the port positions for all ports - these will be needed when displaying
		// nodes and links. This needs to be done here because a resized supernode
		// will cause its ports to move and resizing comments causes links to be
		// redrawn which will need port positions to be set appropriately.
		this.setPortPositionsAllNodes();

		if (this.selecting) {
			this.displayNodesSelectionStatus();

		} else {
			this.displayAllNodes();
		}
		this.logger.logEndTimer("displayNodes " + this.getFlags());
	}

	displayMovedNodes() {
		this.logger.logStartTimer("displayMovedNodes");
		const nodeGroupSel = this.getAllNodeGroupsSelection();

		nodeGroupSel
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`);

		if (this.dispUtils.isDisplayingSubFlow()) {
			nodeGroupSel
				.each((d, i, nodeGrps) => {
					if (d.isSupernodeInputBinding) {
						this.updatePortRadiusAndPos(nodeGrps[i], d, "d3-node-port-output-main");
					}
					if (d.isSupernodeOutputBinding) {
						this.updatePortRadiusAndPos(nodeGrps[i], d, "d3-node-port-input-main");
						this.updatePortArrowPath(nodeGrps[i], "d3-node-port-input-arrow");
					}
				});
		}
		this.logger.logEndTimer("displayMovedNodes");
	}

	displayNodesSelectionStatus(nodeGroupSel) {
		this.getAllNodeGroupsSelection()
			.selectChildren(".d3-node-selection-highlight")
			.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? "yes" : "no"));

		this.superRenderers.forEach((renderer) => {
			renderer.selecting = true;
			renderer.displayNodes();
			renderer.selecting = false;
		});
	}

	// Displays all the nodes on the canvas either by creating new nodes,
	// updating existing nodes or removing unwanted nodes.
	displayAllNodes() {
		this.logger.log("displayAllNodes");
		const sel = this.getAllNodeGroupsSelection();
		this.displayNodesSubset(sel, this.activePipeline.nodes);
	}

	displaySingleNode(d) {
		this.logger.logStartTimer("displaySingleNode " + this.getFlags());

		this.setPortPositionsForNode(d);

		const selection = this.getNodeGroupSelectionById(d.id);
		this.displayNodesSubset(selection, [d]);

		this.logger.logEndTimer("displaySingleNode " + this.getFlags());
	}

	displayNodesSubset(selection, data) {
		selection
			.data(data, (d) => d.id)
			.join(
				(enter) => this.createNodes(enter)
			)
			.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
			.attr("class", (d) => this.getNodeGroupClass(d))
			.attr("style", (d) => this.getNodeGrpStyle(d))
			.call((joinedNodeGrps) => this.updateNodes(joinedNodeGrps));
	}

	createNodes(enter) {
		this.logger.logStartTimer("createNodes");

		const newNodeGroups = enter
			.append("g")
			.attr("data-id", (d) => this.getId("node_grp", d.id))
			.call(this.attachNodeGroupListeners.bind(this));

		if (this.config.enableEditingActions) {
			newNodeGroups
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.
		}

		// Node Sizing Area.
		newNodeGroups.filter((d) => this.shouldDisplayNodeSizingArea(d))
			.append("path")
			.attr("class", "d3-node-sizing")
			.call(this.attachNodeSizingListeners.bind(this));

		// Node Selection Highlighting Outline.
		newNodeGroups.filter((d) => !CanvasUtils.isSuperBindingNode(d))
			.append("path")
			.attr("class", "d3-node-selection-highlight");

		// Node Body
		newNodeGroups.filter((d) => !CanvasUtils.isSuperBindingNode(d))
			.append("path")
			.attr("class", "d3-node-body-outline");

		// Node Image
		newNodeGroups.filter((d) => !CanvasUtils.isSuperBindingNode(d) && d.layout.imageDisplay)
			.each((node, i, nodeGrps) => {
				const nodeImage = this.getNodeImage(node);
				const nodeImageType = this.getImageType(nodeImage);
				d3.select(nodeGrps[i])
					.append(nodeImageType)
					.attr("class", (d) => this.nodeUtils.getNodeImageClass(d));
			});

		// Node Label
		newNodeGroups.filter((d) => !CanvasUtils.isSuperBindingNode(d))
			.append("foreignObject")
			.attr("class", "d3-foreign-object-node-label")
			.call(this.attachNodeLabelListeners.bind(this))
			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.append("xhtml:span") // Provide a namespace when span is inside foreignObject
			.call(this.attachNodeLabelSpanListeners.bind(this));

		this.logger.logEndTimer("createNodes");

		return newNodeGroups;
	}

	updateNodes(joinedNodeGrps) {
		this.logger.logStartTimer("updateNodes");

		// Node Sizing Area
		joinedNodeGrps.selectChildren(".d3-node-sizing")
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePathSizing(d));

		// Node Selection Highlighting Outline.
		joinedNodeGrps.selectChildren(".d3-node-selection-highlight")
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeSelectionOutline(d))
			.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Node Body
		joinedNodeGrps.selectChildren(".d3-node-body-outline")
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePath(d))
			.attr("style", (d) => this.getNodeBodyStyle(d, "default"));

		// Node Image
		joinedNodeGrps.selectChildren(".d3-node-image")
			.datum((d) => this.activePipeline.getNode(d.id))
			.each((d, i, nodeGrps) => this.setNodeImageContent(nodeGrps[i], d))
			.attr("x", (d) => this.nodeUtils.getNodeImagePosX(d))
			.attr("y", (d) => this.nodeUtils.getNodeImagePosY(d))
			.attr("width", (d) => this.nodeUtils.getNodeImageWidth(d))
			.attr("height", (d) => this.nodeUtils.getNodeImageHeight(d))
			.attr("style", (d) => this.getNodeImageStyle(d, "default"));

		// Node Label
		joinedNodeGrps.selectChildren(".d3-foreign-object-node-label")
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("x", (d) => this.nodeUtils.getNodeLabelPosX(d))
			.attr("y", (d) => this.nodeUtils.getNodeLabelPosY(d))
			.attr("width", (d) => this.nodeUtils.getNodeLabelWidth(d))
			.attr("height", (d) => this.nodeUtils.getNodeLabelHeight(d))
			.select("div")
			.attr("class", (d) => this.nodeUtils.getNodeLabelClass(d))
			.attr("style", (d) => this.getNodeLabelStyle(d, "default"))
			.select("span")
			.html((d) => escapeText(d.label));

		// Node Ellipsis Icon - if one exists
		joinedNodeGrps.selectChildren(".d3-node-ellipsis-group")
			.attr("transform", (d) => this.nodeUtils.getNodeEllipsisTranslate(d));

		// Node (Supernode) Expansion Icon - if one exists
		joinedNodeGrps.selectChildren(".d3-node-super-expand-icon-group")
			.attr("transform", (d) => this.nodeUtils.getNodeExpansionIconTranslate(d));

		// Ports display; Supernode sub-flow display; Error marker display; and
		// Decoration display.
		joinedNodeGrps.each((d, index, grps) => {
			const nodeGrp = d3.select(grps[index]);

			this.displayPorts(nodeGrp, d);

			if (CanvasUtils.isSupernode(d)) {
				this.displaySupernodeContents(d, d3.select(grps[index]));
			}

			if (!CanvasUtils.isSuperBindingNode(d)) {
				// Display error indicator
				this.addErrorMarker(d, nodeGrp);

				// Display Decorators
				const decorations = CanvasUtils.getCombinedDecorations(d.layout.decorations, d.decorations);
				this.displayDecorations(d, DEC_NODE, nodeGrp, decorations);
			}
		});
		this.logger.logEndTimer("updateNodes");
	}

	// Handles the display of a supernode sub-flow contents or hides the contents
	// as necessary.
	displaySupernodeContents(d, supernodeD3Object) {
		let ren = this.getRendererForSupernode(d);

		if (CanvasUtils.isExpanded(d)) {
			if (!ren) {
				ren = this.createSupernodeRenderer(d, supernodeD3Object); // Create will call displayCanvas
				this.superRenderers.push(ren);
			} else {
				ren.setCanvasInfoRenderer(this.canvasInfo); // Setting canvas info will call displayCanvas
			}
		} else {
			if (ren) {
				ren.hideCanvas(d);
			}
		}
	}

	displayPorts(nodeGrp, d) {
		// Empty inputs arrays are allowed because some apps support that when ports are deleted.
		if (d.layout.inputPortDisplay && Array.isArray(d.inputs)) {
			this.displayInputPorts(nodeGrp, d);
		}

		// Empty outputs arrays are allowed because some apps support that when ports are deleted.
		if (d.layout.outputPortDisplay && Array.isArray(d.outputs)) {
			this.displayOutputPorts(nodeGrp, d);
		}
	}

	displayInputPorts(nodeGrp, node) {
		const inSelector = "." + this.getNodeInputPortClassName();

		nodeGrp.selectChildren(inSelector)
			.data(node.inputs, (p) => p.id)
			.join(
				(enter) => this.createInputPorts(enter, node)
			)
			.attr("connected", (port) => (port.isConnected ? "yes" : "no"))
			.attr("class", (port) => this.getNodeInputPortClassName() + (port.class_name ? " " + port.class_name : ""))
			.call((joinedInputPortGrps) => this.updateInputPorts(joinedInputPortGrps, node));
	}

	createInputPorts(enter, node) {
		const inputPortGroups = enter
			.append("g")
			.attr("data-port-id", (port) => port.id)
			.attr("isSupernodeBinding", CanvasUtils.isSuperBindingNode(node) ? "yes" : "no")
			.call(this.attachInputPortListeners.bind(this), node);

		inputPortGroups
			.append(node.layout.inputPortObject)
			.attr("class", "d3-node-port-input-main");

		// Don't show the port arrow when we are supporting association
		// link creation
		if (!this.config.enableAssocLinkCreation &&
				node.layout.inputPortObject === "circle" &&
				!CanvasUtils.isSuperBindingNode(node)) {
			// Input port arrow in circle for nodes which are not supernode binding nodes.
			inputPortGroups
				.append("path")
				.attr("class", "d3-node-port-input-arrow");
		}

		return inputPortGroups;
	}

	updateInputPorts(joinedInputPortGrps, node) {
		joinedInputPortGrps.selectChildren(".d3-node-port-input-main")
			.datum((port) => node.inputs.find((i) => port.id === i.id))
			.each((port, i, inputPorts) => {
				const obj = d3.select(inputPorts[i]);
				if (node.layout.inputPortObject === PORT_OBJECT_IMAGE) {
					obj
						.attr("xlink:href", node.layout.inputPortImage)
						.attr("x", port.cx - (node.layout.inputPortWidth / 2))
						.attr("y", port.cy - (node.layout.inputPortHeight / 2))
						.attr("width", node.layout.inputPortWidth)
						.attr("height", node.layout.inputPortHeight);
				} else {
					obj
						.attr("r", this.getPortRadius(node))
						.attr("cx", port.cx)
						.attr("cy", port.cy);
				}
			});

		joinedInputPortGrps.selectChildren(".d3-node-port-input-arrow")
			.datum((port) => node.inputs.find((i) => port.id === i.id))
			.each((port, i, inputPorts) => {
				const obj = d3.select(inputPorts[i]);
				if (node.layout.inputPortObject !== PORT_OBJECT_IMAGE) {
					obj
						.attr("d", this.getPortArrowPath(port))
						.attr("transform", this.getPortArrowPathTransform(port));
				}
			});
	}

	displayOutputPorts(nodeGrp, node) {
		const outSelector = "." + this.getNodeOutputPortClassName();

		const outputs = this.config.enableSingleOutputPortDisplay && node.outputs.length > 1
			? [node.outputs[node.outputs.length - 1]]
			: node.outputs;

		nodeGrp.selectChildren(outSelector)
			.data(outputs, (p) => p.id)
			.join(
				(enter) => this.createOutputPorts(enter, node)
			)
			.attr("connected", (port) => (port.isConnected ? "yes" : "no"))
			.attr("class", (port) => this.getNodeOutputPortClassName() + (port.class_name ? " " + port.class_name : ""))
			.call((joinedOutputPortGrps) => this.updateOutputPorts(joinedOutputPortGrps, node));
	}

	createOutputPorts(enter, node) {
		const outputPortGroups = enter
			.append("g")
			.attr("data-port-id", (port) => port.id)
			.attr("isSupernodeBinding", CanvasUtils.isSuperBindingNode(node) ? "yes" : "no")
			.call(this.attachOutputPortListeners.bind(this), node);

		outputPortGroups
			.append(node.layout.outputPortObject)
			.attr("class", "d3-node-port-output-main");

		return outputPortGroups;
	}

	updateOutputPorts(joinedOutputPortGroups, node) {
		joinedOutputPortGroups.selectChildren(".d3-node-port-output-main")
			.datum((port) => node.outputs.find((o) => port.id === o.id))
			.each((port, i, outputPorts) => {
				const obj = d3.select(outputPorts[i]);
				if (node.layout.outputPortObject === PORT_OBJECT_IMAGE) {
					obj
						.attr("xlink:href", node.layout.outputPortImage)
						.attr("x", port.cx - (node.layout.outputPortWidth / 2))
						.attr("y", port.cy - (node.layout.outputPortHeight / 2))
						.attr("width", node.layout.outputPortWidth)
						.attr("height", node.layout.outputPortHeight);
				} else {
					obj
						.attr("r", this.getPortRadius(node))
						.attr("cx", port.cx)
						.attr("cy", port.cy);
				}
			});
	}

	// Attaches the appropriate listeners to the node groups.
	attachNodeGroupListeners(nodeGrps) {
		nodeGrps
			.on("mouseenter", (d3Event, d) => {
				const nodeGrp = d3.select(d3Event.currentTarget);
				this.raiseNodeToTop(nodeGrp);
				this.setNodeStyles(d, "hover", nodeGrp);
				this.addDynamicNodeIcons(d, nodeGrp);
				if (this.canOpenTip(TIP_TYPE_NODE)) {
					this.canvasController.closeTip(); // Ensure existing tip is removed when moving pointer within an in-place supernode
					this.canvasController.openTip({
						id: this.getId("node_tip", d.id),
						type: TIP_TYPE_NODE,
						targetObj: d3Event.currentTarget,
						pipelineId: this.activePipeline.id,
						node: d
					});
				}
			})
			.on("mouseleave", (d3Event, d) => {
				const nodeGrp = d3.select(d3Event.currentTarget);
				this.setNodeStyles(d, "default", nodeGrp);
				this.removeDynamicNodeIcons(d, nodeGrp);
				this.canvasController.closeTip();
			})
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.logStartTimer("Node Group - mouse down");
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing();
				}
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.logEndTimer("Node Group - mouse down");
			})
			.on("mousemove", (d3Event, d) => {
				// this.logger.log("Node Group - mouse move");
				// Don't stop propogation. Mouse move messages must be allowed to
				// propagate to canvas zoom operation.
			})
			.on("mouseup", (d3Event, d) => {
				d3Event.stopPropagation();
				this.logger.log("Node Group - mouse up");
				if (this.drawingNewLinkData) {
					this.completeNewLink(d3Event);
				}
				if (this.draggingLinkData) {
					this.completeDraggedLink(d3Event, d);
				}
			})
			.on("click", (d3Event, d) => {
				this.logger.log("Node Group - click");
				d3Event.stopPropagation();
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Node Group - double click");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				var selObjIds = this.objectModel.getSelectedObjectIds();
				this.canvasController.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "node",
					id: d.id,
					selectedObjectIds: selObjIds,
					pipelineId: this.activePipeline.id
				});
			})
			.on("contextmenu", (d3Event, d) => {
				this.logger.log("Node Group - context menu");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				if (!CanvasUtils.isSuperBindingNode(d)) {
					// With enableDragWithoutSelect set to true, the object for which the
					// context menu is being requested needs to be implicitely selected.
					if (this.config.enableDragWithoutSelect) {
						this.selectObjectD3Event(d3Event, d);
					}
					this.openContextMenu(d3Event, "node", d);
				}
			});
	}

	attachNodeSizingListeners(nodeGrps) {
		nodeGrps
			.on("mousedown", (d3Event, d) => {
				if (this.isNodeResizable(d)) {
					this.nodeSizing = true;
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
			.on("mousemove mouseenter", (d3Event, d) => {
				if (this.isNodeResizable(d) &&
						!this.isRegionSelectOrSizingInProgress()) { // Don't switch sizing direction if we are already sizing
					let cursorType = "default";
					if (!this.isPointerCloseToBodyEdge(d3Event, d)) {
						this.nodeSizingDirection = this.getSizingDirection(d3Event, d, d.layout.nodeCornerResizeArea);
						this.nodeSizingCursor = this.getCursorBasedOnDirection(this.nodeSizingDirection);
						cursorType = this.nodeSizingCursor;
					}
					d3.select(d3Event.currentTarget).style("cursor", cursorType);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				d3.select(d3Event.currentTarget).style("cursor", "default");
			});
	}

	attachNodeLabelListeners(nodeLabels) {
		nodeLabels
			.on("mouseenter", (d3Event, d) => {
				const labelSel = d3.select(d3Event.currentTarget);
				if (this.config.enableDisplayFullLabelOnHover && !CanvasUtils.isExpandedSupernode(d)) {
					const spanSel = labelSel.selectAll("span");
					labelSel
						.attr("x", this.nodeUtils.getNodeLabelHoverPosX(d))
						.attr("width", this.nodeUtils.getNodeLabelHoverWidth(d))
						.attr("height", this.nodeUtils.getNodeLabelHoverHeight(d, spanSel.node(), this.zoomTransform.k));
					spanSel.classed("d3-label-full", true);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				const labelSel = d3.select(d3Event.currentTarget);
				if (this.config.enableDisplayFullLabelOnHover && !CanvasUtils.isExpandedSupernode(d)) {
					labelSel
						.attr("x", this.nodeUtils.getNodeLabelPosX(d))
						.attr("width", this.nodeUtils.getNodeLabelWidth(d))
						.attr("height", this.nodeUtils.getNodeLabelHeight(d));
					labelSel.selectAll("span").classed("d3-label-full", false);
				}
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Node Label - double click");
				if (d.layout.labelEditable && this.config.enableEditingActions) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.displayNodeLabelTextArea(d, d3Event.currentTarget.parentNode);
				}
			});
	}

	attachNodeLabelSpanListeners(nodeLabelSpans) {
		nodeLabelSpans
			.on("mouseenter", (d3Event, d) => {
				if (d.layout.labelEditable && this.config.enableEditingActions) {
					this.displayNodeLabelEditIcon(d3Event.currentTarget, d);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				if (d.layout.labelEditable && this.config.enableEditingActions) {
					// Wait half a sec to let the user get the pointer into the edit icon, otherwise it is closed immediately.
					this.hideEditIconPending = setTimeout(this.hideEditIcon.bind(this), 500, d3Event.currentTarget, d);
				}
			});
	}

	attachInputPortListeners(inputPorts, node) {
		inputPorts
			.on("mousedown", (d3Event, port) => {
				if (this.config.enableAssocLinkCreation) {
					// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
					if (d3Event.button === 0) {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
						const srcNode = this.activePipeline.getNode(node.id);
						this.drawingNewLinkData = {
							srcObjId: node.id,
							srcPortId: port.id,
							action: this.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK,
							srcNode: srcNode,
							startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
							portType: "input",
							portObject: node.layout.inputPortObject,
							portImage: node.layout.inputPortImage,
							portWidth: node.layout.inputPortWidth,
							portHeight: node.layout.inputPortHeight,
							portRadius: this.getPortRadius(srcNode),
							minInitialLine: srcNode.layout.minInitialLine,
							guideObject: node.layout.inputPortGuideObject,
							guideImage: node.layout.inputPortGuideImage,
							linkArray: []
						};
						this.drawNewLink(d3Event);
					}
				}
			})
			.on("mouseenter", (d3Event, port) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event); // stop event propagation, otherwise node tip is shown
				if (this.canOpenTip(TIP_TYPE_PORT)) {
					this.canvasController.closeTip();
					this.canvasController.openTip({
						id: this.getId("node_port_tip", port.id),
						type: TIP_TYPE_PORT,
						targetObj: d3Event.currentTarget,
						pipelineId: this.activePipeline.id,
						node: node,
						port: port
					});
				}
			})
			.on("mouseleave", () => {
				this.canvasController.closeTip();
			})
			.on("contextmenu", (d3Event, port) => {
				this.logger.log("Input Port Circle - context menu");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				// With enableDragWithoutSelect set to true, the object for which the
				// context menu is being requested needs to be implicitely selected.
				if (this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, node);
				}

				this.openContextMenu(d3Event, "input_port", node, port);
			});
	}

	attachOutputPortListeners(outputPorts, node) {
		outputPorts
			.on("mousedown", (d3Event, port) => {
				// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
				if (d3Event.button === 0) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
					const srcNode = this.activePipeline.getNode(node.id);
					if (!CanvasUtils.isSrcCardinalityAtMax(port.id, srcNode, this.activePipeline.links)) {
						this.drawingNewLinkData = {
							srcObjId: node.id,
							srcPortId: port.id,
							action: this.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK,
							srcNode: srcNode,
							startPos: { x: srcNode.x_pos + port.cx, y: srcNode.y_pos + port.cy },
							portType: "output",
							portObject: node.layout.outputPortObject,
							portImage: node.layout.outputPortImage,
							portWidth: node.layout.outputPortWidth,
							portHeight: node.layout.outputPortHeight,
							portRadius: this.getPortRadius(srcNode),
							minInitialLine: srcNode.layout.minInitialLine,
							guideObject: node.layout.outputPortGuideObject,
							guideImage: node.layout.outputPortGuideImage,
							linkArray: []
						};
						if (this.config.enableHighlightUnavailableNodes) {
							this.setUnavailableTargetNodesHighlighting(srcNode, port.id, this.activePipeline.links);
						}
						this.drawNewLink(d3Event);
					}
				}
			})
			.on("mouseenter", (d3Event, port) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event); // stop event propagation, otherwise node tip is shown
				if (this.canOpenTip(TIP_TYPE_PORT)) {
					this.canvasController.closeTip();
					this.canvasController.openTip({
						id: this.getId("node_port_tip", port.id),
						type: TIP_TYPE_PORT,
						targetObj: d3Event.currentTarget,
						pipelineId: this.activePipeline.id,
						node: node,
						port: port
					});
				}
			})
			.on("mouseleave", () => {
				this.canvasController.closeTip();
			})
			.on("contextmenu", (d3Event, port) => {
				this.logger.log("Output Port Circle - context menu");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				// With enableDragWithoutSelect set to true, the object for which the
				// context menu is being requested needs to be implicitely selected.
				if (this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, node);
				}
				this.openContextMenu(d3Event, "output_port", node, port);
			});
	}

	// Sets the d3-node-unavailable class on any node that is currently not
	// available for connection as a target node for the source node and port ID,
	// passed in, of the link being manipulated. srcNode and scrPortId may be
	// undefined if a detached link is being manipulated.
	setUnavailableTargetNodesHighlighting(srcNode, srcPortId, links) {
		this.getAllNodeGroupsSelection()
			.filter((trgNode) => !CanvasUtils.isTrgNodeAvailable(trgNode, srcNode, srcPortId, links))
			.classed("d3-node-unavailable", true);
	}

	// Sets the d3-node-unavailable class on any node that is currently not
	// available for connection as a source node for the target node and port ID,
	// passed in, of the link being manipulated. trgNode and trgPortId may be
	// undefined if a detached link is being manipulated.
	setUnavailableSourceNodesHighlighting(trgNode, trgPortId, links) {
		this.getAllNodeGroupsSelection()
			.filter((srcNode) => !CanvasUtils.isSrcNodeAvailable(srcNode, trgNode, trgPortId, links))
			.classed("d3-node-unavailable", true);
	}

	// Removes the d3-node-unavailable class from any node that currently has it.
	unsetUnavailableNodesHighlighting() {
		this.getAllNodeGroupsSelection().classed("d3-node-unavailable", false);
	}

	displayNodeLabelEditIcon(spanObj, node) {
		const labelObj = spanObj.parentElement;
		const foreignObj = labelObj.parentElement;
		const nodeObj = foreignObj.parentElement;
		const nodeGrpSel = d3.select(nodeObj);
		const transform = this.nodeUtils.getNodeLabelEditIconTranslate(node, spanObj,
			this.zoomTransform.k, this.config.enableDisplayFullLabelOnHover);

		this.displayEditIcon(spanObj, nodeGrpSel, transform,
			(d3Event, d) => this.displayNodeLabelTextArea(d, d3Event.currentTarget.parentNode));
	}

	// Displays the edit icon for an editable decoration label.
	// obj can be either DEC_NODE or DEC_LINK.
	displayDecLabelEditIcon(spanObj, dec, obj, objType) {
		const labelObj = spanObj.parentElement;
		const foreignObj = labelObj.parentElement;
		const decObj = foreignObj.parentElement;
		const decGrpSel = d3.select(decObj);
		const transform = this.decUtils.getDecLabelEditIconTranslate(
			dec, obj, objType, spanObj, this.zoomTransform.k);

		this.displayEditIcon(spanObj, decGrpSel, transform,
			(d3Event, d) => this.displayDecLabelTextArea(dec, obj, objType, d3Event.currentTarget.parentNode));
	}

	// Displays the edit icon (which can be clicked to start editing) next
	// to an editable node label or editable text decoration
	displayEditIcon(spanObj, grpSel, transform, displayTextArea) {
		const that = this;

		const editIconGrpSel = grpSel.append("g")
			.attr("class", "d3-label-edit-icon-group")
			.attr("transform", transform)
			.on("mouseenter", function(d3Event, d) {
				that.mouseOverLabelEditIcon = true;
			})
			.on("mouseleave", function(d3Event, d) {
				that.mouseOverLabelEditIcon = false;
				that.hideEditIcon(this);
			})
			.on("click", function(d3Event, d) {
				displayTextArea(d3Event, d);
				that.mouseOverLabelEditIcon = false;
				that.hideEditIcon(this);
			});

		const EDIT_ICON_X_OFFSET = 5;
		const EDIT_ICON_Y_OFFSET = -4;
		const EDIT_ICON_POS_X = 4;
		const EDIT_ICON_POS_Y = 4;

		editIconGrpSel
			.append("rect")
			.attr("class", "d3-label-edit-icon-background1")
			.attr("width", 24 + EDIT_ICON_X_OFFSET)
			.attr("height", 24)
			.attr("x", 0)
			.attr("y", EDIT_ICON_Y_OFFSET);

		editIconGrpSel
			.append("rect")
			.attr("class", "d3-label-edit-icon-background2")
			.attr("width", 24)
			.attr("height", 24)
			.attr("x", EDIT_ICON_X_OFFSET)
			.attr("y", EDIT_ICON_Y_OFFSET);

		editIconGrpSel
			.append("svg")
			.attr("class", "d3-node-edit-label-icon")
			.html(EDIT_ICON)
			.attr("width", 16)
			.attr("height", 16)
			.attr("x", EDIT_ICON_X_OFFSET + EDIT_ICON_POS_X)
			.attr("y", EDIT_ICON_Y_OFFSET + EDIT_ICON_POS_Y);
	}

	hideEditIcon(spanObj) {
		if (!this.mouseOverLabelEditIcon) {
			const labelObj = spanObj.parentElement;
			const foreignObj = labelObj.parentElement;
			const nodeObj = foreignObj.parentElement;
			const nodeGrpSel = d3.select(nodeObj);
			nodeGrpSel.selectAll(".d3-label-edit-icon-group").remove();
		}
	}

	// Adds the object passed in to the set of selected objects using
	// the d3Event object passed in.
	selectObjectD3Event(d3Event, d) {
		this.selectObject(
			d,
			d3Event.type,
			d3Event.shiftKey,
			CanvasUtils.isCmndCtrlPressed(d3Event));
	}

	// Adds the object passed in to the set of selected objects using
	// the d3Event object's sourceEvent object.
	selectObjectSourceEvent(d3Event, d) {
		this.selectObject(
			d,
			d3Event.type,
			d3Event.sourceEvent.shiftKey,
			CanvasUtils.isCmndCtrlPressed(d3Event.sourceEvent));
	}

	// Performs required action for when either a comment, node or link is selected.
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
		const objectTypeName = this.activePipeline.getObjectTypeName(d);
		if (objectTypeName === "node" || objectTypeName === "link") {
			this.canvasController.clickActionHandler({
				clickType: d3EventType === "contextmenu" || this.ellipsisClicked ? "SINGLE_CLICK_CONTEXTMENU" : "SINGLE_CLICK",
				objectType: objectTypeName,
				id: d.id,
				selectedObjectIds: this.objectModel.getSelectedObjectIds(),
				pipelineId: this.activePipeline.id });
			this.ellipsisClicked = false;
		}
	}

	// Displays a set of decorations on either a node or link object.
	// d       - This is a node or link object.
	// objType - A string set to either DEC_NODE or DEC_LINK.
	// trgGrp  - A D3 selection object that references the node or link to
	//           which the decorations are to be attached.
	// decs    - An array of decorations to be applied to the node or link.
	//           This is a combination of the object's decorations with any
	//           decorations from the layout config information.
	displayDecorations(d, objType, trgGrp, decs) {
		const that = this;
		const decorations = decs || [];
		const decGrpClassName = `d3-${objType}-dec-group`;
		const decGrpSelector = "." + decGrpClassName;
		trgGrp.selectChildren(decGrpSelector)
			.data(decorations, (dec) => dec.id)
			.join(
				(enter) => this.createDecorations(enter, objType, decGrpClassName)
			)
			.attr("transform", (dec) => this.decUtils.getDecTransform(dec, d, objType))
			.on("mousedown", (d3Event, dec) => (dec.hotspot ? that.callDecoratorCallback(d3Event, d, dec) : null))
			.each((dec, i, elements) => this.updateDecoration(dec, d3.select(elements[i]), objType, d));
	}

	createDecorations(enter, objType, decGrpClassName) {
		const newDecGroups = enter
			.append("g")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_group`, dec.id)) // Used in tests
			.attr("class", decGrpClassName)
			.call(this.attachDecGroupListeners.bind(this));

		return newDecGroups;
	}

	updateDecoration(dec, decSel, objType, d) {
		this.updateDecOutlines(dec, decSel, objType, d);
		this.updateDecPaths(dec, decSel, objType);
		this.updateDecImages(dec, decSel, objType, d);
		this.updateDecLabels(dec, decSel, objType, d);
	}

	updateDecOutlines(dec, decSel, objType, d) {
		let outlnSel = decSel.selectChild("rect");

		if (!dec.label && !dec.path && dec.outline !== false) {
			outlnSel = outlnSel.empty() ? decSel.append("rect") : outlnSel;
			outlnSel
				.attr("class", this.decUtils.getDecClass(dec, `d3-${objType}-dec-outline`))
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", this.decUtils.getDecWidth(dec, d, objType))
				.attr("height", this.decUtils.getDecHeight(dec, d, objType))
				.lower(); // Make sure the outline goes below the image
		} else {
			outlnSel.remove();
		}
	}

	updateDecPaths(dec, decSel, objType) {
		let pathSel = decSel.selectChild("path");

		if (dec.path) {
			pathSel = pathSel.empty() ? decSel.append("path") : pathSel;
			pathSel
				.attr("class", this.decUtils.getDecClass(dec, `d3-${objType}-dec-path`))
				.attr("x", 0)
				.attr("y", 0)
				.attr("d", dec.path);
		} else {
			pathSel.remove();
		}
	}

	updateDecImages(dec, decSel, objType, d) {
		let imageSel = decSel.selectChild("g");

		if (dec.image) {
			const nodeImageType = this.getImageType(dec.image);
			imageSel = imageSel.empty() ? decSel.append("g").append(nodeImageType) : imageSel.select(nodeImageType);
			imageSel
				.attr("class", this.decUtils.getDecClass(dec, `d3-${objType}-dec-image`))
				.attr("x", this.decUtils.getDecPadding(dec, d, objType))
				.attr("y", this.decUtils.getDecPadding(dec, d, objType))
				.attr("width", this.decUtils.getDecWidth(dec, d, objType) - (2 * this.decUtils.getDecPadding(dec, d, objType)))
				.attr("height", this.decUtils.getDecHeight(dec, d, objType) - (2 * this.decUtils.getDecPadding(dec, d, objType)))
				.each(() => this.setImageContent(imageSel, dec.image));
		} else {
			imageSel.remove();
		}
	}

	updateDecLabels(dec, decSel, objType, d) {
		let labelSel = decSel.selectChild("foreignObject");

		if (dec.label) {
			if (labelSel.empty()) {
				labelSel = decSel
					.append("foreignObject")
					.attr("class", "d3-foreign-object-dec-label")
					.attr("x", 0)
					.attr("y", 0)
					.call(this.attachDecLabelListeners.bind(this, d, objType));
				labelSel
					.append("xhtml:div")
					.append("xhtml:span")
					.call(this.attachDecLabelSpanListeners.bind(this, d, objType));
			}
			labelSel
				.attr("width", this.decUtils.getDecLabelWidth(dec, d, objType))
				.attr("height", this.decUtils.getDecLabelHeight(dec, d, objType))
				.select("div")
				.attr("class", this.decUtils.getDecLabelClass(dec, objType))
				.select("span")
				.html(escapeText(dec.label));
		} else {
			labelSel.remove();
		}
	}

	attachDecLabelListeners(obj, objType, decLabels) {
		decLabels
			.on("dblclick", (d3Event, dec) => {
				this.logger.log("Decoration Label - double click");
				if (dec.label_editable && this.config.enableEditingActions) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.displayDecLabelTextArea(dec, obj, objType, d3Event.currentTarget.parentNode);
				}
			});
	}

	attachDecLabelSpanListeners(obj, objType, decLabelSpans) {
		decLabelSpans
			.on("mouseenter", (d3Event, dec) => {
				if (dec.label_editable && this.config.enableEditingActions) {
					this.displayDecLabelEditIcon(d3Event.currentTarget, dec, obj, objType);
				}
			})
			.on("mouseleave", (d3Event, dec) => {
				if (dec.label_editable && this.config.enableEditingActions) {
					// Wait half a sec to let the user get the pointer into the edit icon, otherwise it is closed immediately.
					this.hideEditIconPending = setTimeout(this.hideEditIcon.bind(this), 500, d3Event.currentTarget, dec);
				}
			});
	}

	attachDecGroupListeners(decGrps) {
		decGrps
			.on("mouseenter", (d3Event, dec) => {
				if (this.canOpenTip(TIP_TYPE_DEC)) {
					this.canvasController.closeTip(); // Ensure any existing tip is removed
					this.canvasController.openTip({
						id: this.getId("dec_tip", dec.id),
						type: TIP_TYPE_DEC,
						targetObj: d3Event.currentTarget,
						pipelineId: this.activePipeline.id,
						decoration: dec
					});
				}
			})
			.on("mouseleave", (d3Event, d) => {
				this.canvasController.closeTip();
			});
	}

	addErrorMarker(d, nodeGrp) {
		const errorMarkerSelection = nodeGrp.selectChildren(".node-error-marker");

		if (d.messages && d.messages.length > 0) {
			if (errorMarkerSelection.empty()) {
				nodeGrp
					.append("svg")
					.attr("class", "node-error-marker"); // Need to set this so following selection will work
			}

			nodeGrp.selectChildren(".node-error-marker")
				.attr("class", () => "node-error-marker " + this.nodeUtils.getErrorMarkerClass(d.messages))
				.html(this.nodeUtils.getErrorMarkerIcon(d))
				.attr("width", this.nodeUtils.getNodeErrorWidth(d))
				.attr("height", this.nodeUtils.getNodeErrorHeight(d))
				.attr("x", this.nodeUtils.getNodeErrorPosX(d))
				.attr("y", this.nodeUtils.getNodeErrorPosY(d));

		} else {
			if (!errorMarkerSelection.empty()) {
				errorMarkerSelection.remove();
			}
		}
	}

	getNodeInputPortClassName() {
		if (this.config.enableAssocLinkCreation) {
			return "d3-node-port-input-assoc";
		}
		return "d3-node-port-input";
	}

	getNodeOutputPortClassName() {
		if (this.config.enableAssocLinkCreation) {
			return "d3-node-port-output-assoc";
		}
		return "d3-node-port-output";
	}

	// Sets the image specified in the node passed in into the DOM image object
	// passed in.
	setNodeImageContent(imageObj, node) {
		const nodeImage = this.getNodeImage(node);
		const imageSel = d3.select(imageObj);
		this.setImageContent(imageSel, nodeImage);
	}

	// Sets the image passed in into the D3 image selection passed in. This loads
	// svg files as inline SVG while other image files are loaded with href.
	setImageContent(imageSel, image) {
		if (image !== imageSel.attr("data-image")) {
			const nodeImageType = this.getImageType(image);
			// Save image field in DOM object to avoid unnecessary image refreshes.
			imageSel.attr("data-image", image);
			if (nodeImageType === "svg") {
				imageSel.selectChild("svg").remove();
				d3.svg(image, { cache: "force-cache" }).then((data) => {
					imageSel.node().append(data.documentElement);
				});
			} else {
				imageSel.attr("xlink:href", image);
			}
		}
	}

	// Returns the appropriate image from the object (either node or decoration)
	// passed in.
	getNodeImage(d) {
		if (!d.image) {
			return null;
		} else if (d.image === USE_DEFAULT_ICON) {
			if (CanvasUtils.isSupernode(d)) {
				return SUPERNODE_ICON;
			}
		} else if (d.image === USE_DEFAULT_EXT_ICON) {
			if (CanvasUtils.isSupernode(d)) {
				return SUPERNODE_EXT_ICON;
			}
		}
		return d.image;
	}

	// Returns the type of image passed in, either "svg" or "image". This will
	// be used to append an svg or image element to the DOM.
	getImageType(nodeImage) {
		return nodeImage && nodeImage.endsWith(".svg") ? "svg" : "image";
	}

	setNodeStyles(d, type, nodeGrp) {
		this.setNodeBodyStyles(d, type, nodeGrp);
		this.setNodeSelectionOutlineStyles(d, type, nodeGrp);
		this.setNodeImageStyles(d, type, nodeGrp);
		this.setNodeLabelStyles(d, type, nodeGrp);
	}

	setNodeBodyStyles(d, type, nodeGrp) {
		const style = this.getNodeBodyStyle(d, type);
		nodeGrp.selectChildren(".d3-node-body-outline").attr("style", style);
	}

	setNodeSelectionOutlineStyles(d, type, nodeGrp) {
		const style = this.getNodeSelectionOutlineStyle(d, type);
		nodeGrp.selectChildren(".d3-node-selection-highlight").attr("style", style);
	}

	setNodeImageStyles(d, type, nodeGrp) {
		const style = this.getNodeImageStyle(d, type);
		nodeGrp.selectChildren(".d3-node-image").attr("style", style);
	}

	setNodeLabelStyles(d, type, nodeGrp) {
		const style = this.getNodeLabelStyle(d, type);
		nodeGrp.selectChildren(".d3-node-label").attr("style", style);
	}

	getNodeBodyStyle(d, type) {
		let style = CanvasUtils.getObjectStyle(d, "body", type);
		// For port-arcs display we reapply the drop shadow if no style is provided
		if (style === null && d.layout.dropShadow) {
			style = `filter:url(${this.getId("#node_drop_shadow")})`;
		}
		return style;
	}

	getNodeSelectionOutlineStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "selection_outline", type);
	}

	getNodeImageStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "image", type);
	}

	getNodeLabelStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "label", type);
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
		if (CanvasUtils.isExpandedSupernode(d) && d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			const subflow = new SVGCanvasPipeline(d.subflow_ref.pipeline_id_ref, this.canvasInfo);
			const nodeGrp = subflow.nodes;
			nodeGrp.forEach((node) => {
				if (node.style || node.style_temp) {
					expandedSupernodeHaveStyledNodes = true;
					return;
				} else if (!expandedSupernodeHaveStyledNodes && CanvasUtils.isExpandedSupernode(node)) {
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
		return CanvasUtils.isSuperBindingNode(d) ? this.getBindingPortRadius() : d.layout.portRadius;
	}

	// Returns the radius size of the supernode binding ports scaled up by
	// the zoom scale amount to give the actual size.
	getBindingPortRadius() {
		return this.canvasLayout.supernodeBindingPortRadius / this.zoomTransform.k;
	}

	addDynamicNodeIcons(d, nodeGrp) {
		if (!this.nodeSizing && !CanvasUtils.isSuperBindingNode(d)) {

			const ellipsisGrp = nodeGrp
				.append("g")
				.filter(() => d.layout.ellipsisDisplay)
				.attr("class", "d3-node-ellipsis-group")
				.attr("transform", (nd) => this.nodeUtils.getNodeEllipsisTranslate(nd))
				.on("mousedown", (d3Event) => {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.ellipsisClicked = true;
					if (!this.config.enableDragWithoutSelect) {
						this.selectObjectD3Event(d3Event, d);
					}
					if (this.canvasController.isContextMenuDisplayed()) {
						this.canvasController.closeContextMenu();
					} else {
						const rect = ellipsisGrp.node().getBoundingClientRect();
						const rect2 = this.canvasSVG.node().getBoundingClientRect();
						const pos = { x: rect.left - rect2.left, y: rect.bottom - rect2.top };
						this.openContextMenu(d3Event, "node", d, null, pos);
					}
				});

			ellipsisGrp
				.append("rect")
				.attr("class", "d3-node-ellipsis-background")
				.attr("width", (nd) => this.nodeUtils.getNodeEllipsisWidth(nd))
				.attr("height", (nd) => this.nodeUtils.getNodeEllipsisHeight(nd))
				.attr("x", 0)
				.attr("y", 0);

			ellipsisGrp
				.append("svg")
				.attr("class", "d3-node-ellipsis")
				.html(NODE_MENU_ICON)
				.attr("width", (nd) => this.nodeUtils.getNodeEllipsisIconWidth(nd))
				.attr("height", (nd) => this.nodeUtils.getNodeEllipsisIconHeight(nd))
				.attr("x", (nd) => nd.layout.ellipsisHoverAreaPadding)
				.attr("y", (nd) => nd.layout.ellipsisHoverAreaPadding);


			// Add Supernode expansion icon and background for expanded supernodes
			if (CanvasUtils.isExpandedSupernode(d)) {
				const expGrp = nodeGrp
					.append("g")
					.attr("transform", (nd) => this.nodeUtils.getNodeExpansionIconTranslate(nd))
					.attr("class", "d3-node-super-expand-icon-group")
					.on("mousedown", (d3Event) => {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						const breadcrumbs = this.getSupernodeBreadcrumbs(d3Event.currentTarget);
						this.canvasController.displaySubPipelineForBreadcrumbs(breadcrumbs);
					})
					.on("mouseenter", function() { // Use function keyword so 'this' pointer references the DOM text object
						d3.select(this).attr("data-pointer-hover", "yes");
					})
					.on("mouseleave", function() { // Use function keyword so 'this' pointer references the DOM text object
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

	// Returns an array of breadcrumbs for the DOM element passed in. The DOM
	// element is expected to be an element within a node (like the expansion
	// icon). The output array will contain one breadcrumb for each nested
	// supernode down to the supernode of which the DOM element is a part. So if
	// there are three nested supernodes and the DOM element is part of the third
	// one, the breadcrumbs array will have three elements.
	getSupernodeBreadcrumbs(domEl) {
		const breadcrumbs = [];

		let nodeGroupEl = domEl.closest(".d3-node-group");

		while (nodeGroupEl) {
			const svgAreaEl = nodeGroupEl.closest(".svg-area");
			const supernodeDatum = this.getD3DatumFromDomEl(nodeGroupEl);
			const parentPipelineId = svgAreaEl.getAttribute("data-pipeline-id");

			breadcrumbs.push(
				this.canvasController.getObjectModel().createBreadcrumb(supernodeDatum, parentPipelineId));

			nodeGroupEl = svgAreaEl.closest(".d3-node-group");
		}

		// Reverse the order, so they appear in the nesting order of the supernodes.
		return breadcrumbs.reverse();
	}

	// Returns the datum object (managd by D3) for the DOM element passed in.
	getD3DatumFromDomEl(el) {
		const sel = d3.select(el);
		if (sel) {
			return sel.datum();
		}
		return null;
	}

	updatePortRadiusAndPos(nodeObj, node, portObjClassName) {
		const nodeGrp = d3.select(nodeObj);
		nodeGrp.selectAll("." + portObjClassName)
			.attr("r", () => this.getPortRadius(node))
			.attr("cx", (port) => port.cx)
			.attr("cy", (port) => port.cy); // Port position may change for binding nodes with multiple-ports.
	}

	updatePortArrowPath(nodeObj, portArrowClassName) {
		const nodeGrp = d3.select(nodeObj);
		nodeGrp.selectAll("." + portArrowClassName)
			.attr("d", (port) => this.getPortArrowPath(port))
			.attr("transform", (port) => this.getPortArrowPathTransform(port));
	}

	// Returns true if the port (from a node template) passed in has a max
	// cardinaility of zero. If cardinality or cardinality.max is missing the
	// max is considered to be non-zero.
	isPortMaxCardinalityZero(port) {
		return (get(port, "app_data.ui_data.cardinality.max", 1) === 0);
	}

	removeDynamicNodeIcons(d, nodeGrp) {
		if (d.layout.ellipsisDisplay) {
			nodeGrp.selectChildren(".d3-node-ellipsis-group").remove();
		}
		nodeGrp.selectChildren(".d3-node-super-expand-icon-group").remove();
	}

	createSupernodeRenderer(d, supernodeD3Object) {
		if (d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			const superRenderer = new SVGCanvasRenderer(
				d.subflow_ref.pipeline_id_ref,
				this.canvasDiv,
				this.canvasController,
				this.canvasInfo,
				this.config,
				{ id: d.id,
					pipelineId: this.activePipeline.id,
					renderer: this, // Only provided for in-place sub-flow
					d3Selection: supernodeD3Object // Only provided for in-place sub-flow
				});
			return superRenderer;
		}
		return null;
	}

	// Returns the renderer for the supernode passed in. With external
	// pipeline handling the pipeline referencd by the supernode can change
	// over time so we have to make sure the renderer is for the supernode AND
	// for the active pipeline.
	getRendererForSupernode(d) {
		return this.superRenderers.find((sr) =>
			sr.supernodeInfo.id === d.id && sr.activePipeline.id === d.subflow_ref.pipeline_id_ref);
	}

	// Returns an array containing any renderers that are for the supernode passed
	// in but where the supernode does NOT reference the renderer's active pipeline.
	getDiscardedRenderersForSupernode(d) {
		return this.superRenderers.filter((sr) =>
			sr.supernodeInfo.id === d.id && sr.activePipeline.id !== d.subflow_ref.pipeline_id_ref);

	}

	openContextMenu(d3Event, type, d, port, pos) {
		CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stop the browser context menu appearing
		this.canvasController.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			pipelineId: this.activePipeline.id,
			cmPos: pos
				? pos
				: this.getMousePos(d3Event, this.canvasDiv.selectAll("svg")), // Get mouse pos relative to top most SVG area even in a subflow.
			mousePos: this.getMousePosSnapToGrid(this.getTransformedMousePos(d3Event)),
			selectedObjectIds: this.objectModel.getSelectedObjectIds(),
			addBreadcrumbs: (d && d.type === SUPER_NODE) ? this.getSupernodeBreadcrumbs(d3Event.currentTarget) : null,
			port: port,
			zoom: this.zoomTransform.k });
	}

	closeContextMenuIfOpen() {
		if (this.canvasController.isContextMenuDisplayed()) {
			this.canvasController.closeContextMenu();
		}
	}

	callDecoratorCallback(d3Event, node, dec) {
		d3Event.stopPropagation();
		if (this.canvasController.decorationActionHandler) {
			this.canvasController.decorationActionHandler(node, dec.id, this.activePipeline.id);
		}
	}

	drawNewLink(d3Event) {
		if (this.config.enableEditingActions === false) {
			return;
		}

		this.closeContextMenuIfOpen();

		const transPos = this.getTransformedMousePos(d3Event);

		if (this.drawingNewLinkData.action === COMMENT_LINK) {
			this.drawNewCommentLinkForPorts(transPos);
		} else {
			this.drawNewNodeLinkForPorts(transPos);
		}
		// Switch on an attribute to indicate a new link is being dragged
		// towards and over a target node.
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNode(d3Event);
		}
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
			"originX": startPos.originX,
			"originY": startPos.originY,
			"type": linkType }];

		if (this.config.enableAssocLinkCreation) {
			this.drawingNewLinkData.linkArray[0].assocLinkVariation =
				this.getNewLinkAssocVariation(
					this.drawingNewLinkData.linkArray[0].x1,
					this.drawingNewLinkData.linkArray[0].x2,
					this.drawingNewLinkData.portType);
		}

		const pathInfo = this.linkUtils.getConnectorPathInfo(
			this.drawingNewLinkData.linkArray[0], this.drawingNewLinkData.minInitialLine);

		const connectionLineSel = this.nodesLinksGrp.selectAll(".d3-new-connection-line");
		const connectionStartSel = this.nodesLinksGrp.selectAll(".d3-new-connection-start");
		const connectionGuideSel = this.nodesLinksGrp.selectAll(".d3-new-connection-guide");

		// For a straight node line, don't draw the new link line when the guide
		// icon or object is inside the node boundary.
		if (linkType === NODE_LINK &&
				this.canvasLayout.linkType === LINK_TYPE_STRAIGHT &&
				this.nodeUtils.isPointInNodeBoundary(transPos, this.drawingNewLinkData.srcNode)) {
			this.removeNewLinkLine();

		} else {
			connectionLineSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append("path")
				.attr("class", "d3-new-connection-line")
				.attr("linkType", linkType)
				.merge(connectionLineSel)
				.attr("d", pathInfo.path)
				.attr("transform", pathInfo.transform);
		}

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
			.on("mouseup", (d3Event) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				this.completeNewLink(d3Event);
			})
			.merge(connectionGuideSel)
			.each(function(d) {
				if (that.drawingNewLinkData.guideObject === PORT_OBJECT_IMAGE) {
					d3.select(this)
						.attr("xlink:href", that.drawingNewLinkData.guideImage)
						.attr("x", d.x2 - (that.drawingNewLinkData.portWidth / 2))
						.attr("y", d.y2 - (that.drawingNewLinkData.portHeight / 2))
						.attr("width", that.drawingNewLinkData.portWidth)
						.attr("height", that.drawingNewLinkData.portHeight)
						.attr("transform", that.getLinkImageTransform(d));
				} else {
					d3.select(this)
						.attr("cx", d.x2)
						.attr("cy", d.y2)
						.attr("r", that.drawingNewLinkData.portRadius);
				}
			});
	}

	getLinkImageTransform(d) {
		let angle = 0;
		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
			const adjacent = d.x2 - (d.originX || d.x1);
			const opposite = d.y2 - (d.originY || d.y1);
			if (adjacent === 0 && opposite === 0) {
				angle = 0;
			} else {
				angle = Math.atan(opposite / adjacent) * (180 / Math.PI);
				angle = adjacent >= 0 ? angle : angle + 180;
				if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
					angle -= 90;
				} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
					angle += 90;
				}
			}
			return `rotate(${angle},${d.x2},${d.y2})`;
		}
		return null;
	}

	drawNewCommentLinkForPorts(transPos) {
		const that = this;
		const srcComment = this.activePipeline.getComment(this.drawingNewLinkData.srcObjId);
		const startPos = this.linkUtils.getNewStraightCommentLinkStartPos(srcComment, transPos);
		const linkType = COMMENT_LINK;

		this.drawingNewLinkData.linkArray = [{
			"x1": startPos.x,
			"y1": startPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		const connectionLineSel = this.nodesLinksGrp.selectAll(".d3-new-connection-line");
		const connectionGuideSel = this.nodesLinksGrp.selectAll(".d3-new-connection-guide");

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
			.on("mouseup", (d3Event) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				this.completeNewLink(d3Event);
			})
			.merge(connectionGuideSel)
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.canvasLayout.commentPortRadius);

		if (this.canvasLayout.commentLinkArrowHead) {
			const connectionArrowHeadSel = this.nodesLinksGrp.selectAll(".d3-new-connection-arrow");

			connectionArrowHeadSel
				.data(this.drawingNewLinkData.linkArray)
				.enter()
				.append("path")
				.attr("class", "d3-new-connection-arrow")
				.attr("linkType", linkType)
				.on("mouseup", (d3Event) => {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.completeNewLink(d3Event);
				})
				.merge(connectionArrowHeadSel)
				.attr("d", (d) => this.getArrowHead(d))
				.attr("transform", (d) => this.getArrowHeadTransform(d));
		}
	}

	// Handles the completion of a new link being drawn from a source node.
	completeNewLink(d3Event) {
		if (this.config.enableEditingActions === false) {
			return;
		}

		if (this.config.enableHighlightUnavailableNodes) {
			this.unsetUnavailableNodesHighlighting();
		}
		var trgNode = this.getNodeAtMousePos(d3Event);
		if (trgNode !== null) {
			this.completeNewLinkOnNode(d3Event, trgNode);
		} else {
			if (this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
					this.drawingNewLinkData.action === NODE_LINK &&
					!this.config.enableAssocLinkCreation) {
				this.completeNewDetachedLink(d3Event);
			} else {
				this.stopDrawingNewLink();
			}
		}
	}

	// Handles the completion of a new link when the end is dropped on a node.
	completeNewLinkOnNode(d3Event, trgNode) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		// Switch 'new link over node' highlighting off
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		if (trgNode !== null) {
			const type = this.drawingNewLinkData.action;
			if (type === NODE_LINK) {
				const srcNode = this.activePipeline.getNode(this.drawingNewLinkData.srcObjId);
				const srcPortId = this.drawingNewLinkData.srcPortId;
				const trgPortId = this.getInputNodePortId(d3Event, trgNode);

				if (CanvasUtils.isDataConnectionAllowed(srcPortId, trgPortId, srcNode, trgNode, this.activePipeline.links)) {
					this.canvasController.editActionHandler({
						editType: "linkNodes",
						editSource: "canvas",
						nodes: [{ "id": this.drawingNewLinkData.srcObjId, "portId": this.drawingNewLinkData.srcPortId }],
						targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
						type: type,
						linkType: "data", // Added for historical purposes - for WML Canvas support
						pipelineId: this.pipelineId });

				} else if (this.config.enableLinkReplaceOnNewConnection &&
										CanvasUtils.isDataLinkReplacementAllowed(srcPortId, trgPortId, srcNode, trgNode, this.activePipeline.links)) {
					const linksToTrgPort = CanvasUtils.getDataLinksConnectedTo(trgPortId, trgNode, this.activePipeline.links);
					// We only replace a link to a maxed out cardinality port if there
					// is only one link. i.e. the input port cardinality is 0:1
					if (linksToTrgPort.length === 1) {
						this.canvasController.editActionHandler({
							editType: "linkNodesAndReplace",
							editSource: "canvas",
							nodes: [{ "id": this.drawingNewLinkData.srcObjId, "portId": this.drawingNewLinkData.srcPortId }],
							targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
							type: type,
							pipelineId: this.pipelineId,
							replaceLink: linksToTrgPort[0]
						});
					}
				}

			} else if (type === ASSOCIATION_LINK) {
				const srcNode = this.activePipeline.getNode(this.drawingNewLinkData.srcObjId);

				if (CanvasUtils.isAssocConnectionAllowed(srcNode, trgNode, this.activePipeline.links)) {
					this.canvasController.editActionHandler({
						editType: "linkNodes",
						editSource: "canvas",
						nodes: [{ "id": this.drawingNewLinkData.srcObjId }],
						targetNodes: [{ "id": trgNode.id }],
						type: type,
						pipelineId: this.pipelineId });
				}

			} else {
				if (CanvasUtils.isCommentLinkConnectionAllowed(this.drawingNewLinkData.srcObjId, trgNode.id, this.activePipeline.links)) {
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
		}

		this.drawingNewLinkData = null;
	}

	// Handles the completion of a new link when the end is dropped away from
	// a node (when enableLinkSelection is set to LINK_SELECTION_DETACHABLE)
	// which creates a  new detached link.
	completeNewDetachedLink(d3Event) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		// Switch 'new link over node' highlighting off
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		const endPoint = this.getTransformedMousePos(d3Event);
		this.canvasController.editActionHandler({
			editType: "createDetachedLink",
			editSource: "canvas",
			srcNodeId: this.drawingNewLinkData.srcObjId,
			srcNodePortId: this.drawingNewLinkData.srcPortId,
			trgPos: endPoint,
			type: NODE_LINK,
			pipelineId: this.pipelineId });

		this.drawingNewLinkData = null;
	}

	stopDrawingNewLink() {
		// Switch 'new link over node' highlighting off
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		this.stopDrawingNewLinkForPorts();
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

		this.nodesLinksGrp.selectAll(".d3-new-connection-line")
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.nodesLinksGrp.selectAll(".d3-new-connection-arrow").remove();

				this.nodesLinksGrp.selectAll(".d3-new-connection-guide")
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
				this.nodesLinksGrp.selectAll(".d3-new-connection-line")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("d", "M " + saveX1 + " " + saveY1 +
											"L " + saveX1 + " " + saveY1)
					.on("end", this.removeNewLink.bind(this));
			});
	}

	removeNewLink() {
		this.nodesLinksGrp.selectAll(".d3-new-connection-line").remove();
		this.nodesLinksGrp.selectAll(".d3-new-connection-start").remove();
		this.nodesLinksGrp.selectAll(".d3-new-connection-guide").remove();
		this.nodesLinksGrp.selectAll(".d3-new-connection-arrow").remove();
	}

	removeNewLinkLine() {
		this.nodesLinksGrp.selectAll(".d3-new-connection-line").remove();
	}

	dragLinkHandle(d3Event) {
		const transPos = this.getTransformedMousePos(d3Event);
		const link = this.draggingLinkData.link;

		if (this.draggingLinkData.endBeingDragged === "start") {
			link.srcPos = { x_pos: transPos.x, y_pos: transPos.y };
			delete link.srcNodeId;
			delete link.srcNodePortId;
			delete link.srcObj;

		} else {
			link.trgPos = { x_pos: transPos.x, y_pos: transPos.y };
			delete link.trgNodeId;
			delete link.trgNodePortId;
			delete link.trgNode;
		}

		this.displayLinks();

		// Switch on an attribute to indicate a new link is being dragged
		// towards and over a target node.
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNode(d3Event);
		}
	}

	completeDraggedLink(d3Event) {
		const newLink = this.getNewLinkOnDrag(d3Event);

		if (newLink) {
			this.canvasController.editActionHandler({
				editType: "updateLink",
				editSource: "canvas",
				newLink: newLink,
				pipelineId: this.pipelineId });
		} else {
			this.activePipeline.replaceLink(this.draggingLinkData.oldLink);
			this.displayLinks();
		}

		// Switch 'new link over node' highlighting off
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

		this.unsetUnavailableNodesHighlighting();
		this.stopDraggingLink();
	}

	// Returns a new link if one can be created given the current data in the
	// this.draggingLinkData object. Returns null if a link cannot be created.
	getNewLinkOnDrag(d3Event, nodeProximity) {
		const oldLink = this.draggingLinkData.oldLink;
		const newLink = cloneDeep(oldLink);

		if (this.draggingLinkData.endBeingDragged === "start") {
			delete newLink.srcNodeId;
			delete newLink.srcNodePortId;
			delete newLink.srcPos;

			const srcNode = nodeProximity
				? this.getNodeNearMousePos(d3Event, nodeProximity)
				: this.getNodeAtMousePos(d3Event);

			if (srcNode) {
				newLink.srcNodeId = srcNode.id;
				newLink.srcNodePortId = nodeProximity
					? this.getNodePortIdNearMousePos(d3Event, OUTPUT_TYPE, srcNode)
					: this.getOutputNodePortId(d3Event, srcNode);
			}	else {
				newLink.srcPos = this.draggingLinkData.link.srcPos;
			}

		} else {
			delete newLink.trgNodeId;
			delete newLink.trgNodePortId;
			delete newLink.trgPos;

			const trgNode = nodeProximity
				? this.getNodeNearMousePos(d3Event, nodeProximity)
				: this.getNodeAtMousePos(d3Event);

			if (trgNode) {
				newLink.trgNodeId = trgNode.id;
				newLink.trgNodePortId = nodeProximity
					? this.getNodePortIdNearMousePos(d3Event, INPUT_TYPE, trgNode)
					: this.getInputNodePortId(d3Event, trgNode);
			}	else {
				newLink.trgPos = this.draggingLinkData.link.trgPos;
			}
		}

		// If links are not detachable, we cannot create a link if srcPos
		// or trgPos are set because that would create a detached link unconnected
		// to either a source node or a target node or both.
		if (this.config.enableLinkSelection !== LINK_SELECTION_DETACHABLE &&
				(newLink.srcPos || newLink.trgPos)) {
			return null;
		}

		if (this.canExecuteUpdateLinkCommand(newLink, oldLink)) {
			return newLink;
		}
		return null;
	}

	// Returns true if the update command for a dragged link can be executed.
	// It might be prevented from executing if either the course
	canExecuteUpdateLinkCommand(newLink, oldLink) {
		const srcNode = this.activePipeline.getNode(newLink.srcNodeId);
		const trgNode = this.activePipeline.getNode(newLink.trgNodeId);
		const linkSrcChanged = this.hasLinkSrcChanged(newLink, oldLink);
		const linkTrgChanged = this.hasLinkTrgChanged(newLink, oldLink);
		const links = this.activePipeline.links;
		let executeCommand = true;

		if (linkSrcChanged && srcNode &&
				!CanvasUtils.isSrcConnectionAllowedWithDetachedLinks(newLink.srcNodePortId, srcNode, links)) {
			executeCommand = false;
		}
		if (linkTrgChanged && trgNode &&
				!CanvasUtils.isTrgConnectionAllowedWithDetachedLinks(newLink.trgNodePortId, trgNode, links)) {
			executeCommand = false;
		}
		if (srcNode && trgNode &&
				!CanvasUtils.isConnectionAllowedWithDetachedLinks(newLink.srcNodePortId, newLink.trgNodePortId, srcNode, trgNode, links)) {
			executeCommand = false;
		}
		return executeCommand;
	}

	// Returns true if the source information has changed between
	// the two links.
	hasLinkSrcChanged(newLink, oldLink) {
		let linkUpdated = false;

		if (newLink.srcNodeId) {
			if (newLink.srcNodeId !== oldLink.srcNodeId) {
				linkUpdated = true;
			}

			if (newLink.srcNodePortId !== oldLink.srcNodePortId) {
				linkUpdated = true;
			}

		}	else {
			if (oldLink.srcPos) {
				if (newLink.srcPos.x_pos !== oldLink.srcPos.x_pos ||
						newLink.srcPos.y_pos !== oldLink.srcPos.y_pos) {
					linkUpdated = true;
				}
			} else {
				linkUpdated = true;
			}
		}
		return linkUpdated;
	}

	// Returns true if the target information has changed between
	// the two links.
	hasLinkTrgChanged(newLink, oldLink) {
		let linkUpdated = false;

		if (newLink.trgNodeId) {
			if (newLink.trgNodeId !== oldLink.trgNodeId) {
				linkUpdated = true;
			}

			if (newLink.trgNodePortId !== oldLink.trgNodePortId) {
				linkUpdated = true;
			}

		}	else {
			if (oldLink.trgPos) {
				if (newLink.trgPos.x_pos !== oldLink.trgPos.x_pos ||
						newLink.trgPos.y_pos !== oldLink.trgPos.y_pos) {
					linkUpdated = true;
				}
			} else {
				linkUpdated = true;
			}
		}
		return linkUpdated;
	}

	stopDraggingLink() {
		this.draggingLinkData = null;
	}

	// Returns a link, if one can be found, at the position indicated by x and y
	// coordinates.
	getLinkAtMousePos(x, y) {
		const element = this.getElementWithClassAtPosition(x, y, "d3-data-link");
		const link = this.getNodeLinkForElement(element);
		return link;
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeLinkForElement(element) {
		if (element) {
			const datum = d3.select(element).datum();
			if (datum) {
				var foundLink = this.activePipeline.getLink(datum.id);
				if (foundLink && foundLink.type === NODE_LINK) {
					return foundLink;
				}
			}
		}
		return null;
	}

	// Switches the link selection area to be wider (when state is true) and
	// regular size (when state is false).  The wider width assists detection
	// of a node being dragged over the link - for when the 'insert node into link'
	// feature is active.
	setDataLinkSelectionAreaWider(state) {
		this.nodesLinksGrp.selectAll(".d3-data-link-selection-area").classed("d3-extra-width", state);
	}

	// Returns a node, if one can be found, at the position indicated by
	// the clientX and clientY coordinates in the d3Event.
	getNodeAtMousePos(d3Event) {
		const nodeGrpElement = this.getElementWithClassAtMousePos(d3Event, "d3-node-group");
		return this.getNodeForElement(nodeGrpElement);
	}

	// Returns an input node port ID for either, the port that is under the mouse
	// position described by d3Event or, if the mouse is not over a port, the
	// ID of the default port for the node provided.
	getInputNodePortId(d3Event, trgNode) {
		let inputPortId = this.getInputNodePortIdAtMousePos(d3Event);
		if (!inputPortId) {
			inputPortId = CanvasUtils.getDefaultInputPortId(trgNode);
		}
		return inputPortId;
	}

	// Returns a node input port ID, if one can be found, at the position
	// indicated by the clientX and clientY coordinates in the d3Event.
	getInputNodePortIdAtMousePos(d3Event) {
		const portElement = this.getElementWithClassAtMousePos(d3Event, this.getNodeInputPortClassName());
		return this.getNodePortIdForElement(portElement);
	}

	// Returns an output node port ID for either, the port that is under the mouse
	// position described by d3Event or, if the mouse is not over a port, the
	// ID of the default port for the node provided.
	getOutputNodePortId(d3Event, srcNode) {
		let outputPortId = this.getOutputNodePortIdAtMousePos(d3Event);
		if (!outputPortId) {
			outputPortId = CanvasUtils.getDefaultOutputPortId(srcNode);
		}
		return outputPortId;
	}

	// Returns a node output port ID, if one can be found, at the position
	// indicated by the clientX and clientY coordinates in the d3Event.
	getOutputNodePortIdAtMousePos(d3Event) {
		const portElement = this.getElementWithClassAtMousePos(d3Event, this.getNodeOutputPortClassName());
		return this.getNodePortIdForElement(portElement);
	}

	// Returns a DOM element which either has the classNames passed in or
	// has an ancestor with the className passed in, at the position
	// indicated by the clientX and clientY coordinates in the d3Event.
	// Note: It may not be the top-most element so we have to search through the
	// elements array for it.
	getElementWithClassAtMousePos(d3Event, className) {
		const posX = d3Event.clientX ? d3Event.clientX : d3Event.sourceEvent.clientX;
		const posY = d3Event.clientY ? d3Event.clientY : d3Event.sourceEvent.clientY;
		return this.getElementWithClassAtPosition(posX, posY, className);
	}

	getElementWithClassAtPosition(x, y, className) {
		const elements = document.elementsFromPoint(x, y);
		let foundElement = null;
		let count = 0;
		while (!foundElement && count < elements.length) {
			foundElement = CanvasUtils.getParentElementWithClass(elements[count], className);
			count++;
		}
		return foundElement;
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeForElement(element) {
		if (element && element.nodeName === "g") {
			const datum = d3.select(element).datum();
			if (datum) {
				return this.activePipeline.getNode(datum.id);
			}
		}
		return null;
	}

	// Returns the node port Id corresponding to the lement passed in.
	getNodePortIdForElement(element) {
		if (element) {
			return d3.select(element).attr("data-port-id");
		}
		return null;
	}

	// Returns the node that is near the current mouse position. If nodeProximity
	// is provided it will be used as additional space beyond the node boundary
	// to decide if the node is under the current mouse position.
	getNodeNearMousePos(d3Event, nodeProximity) {
		var pos = this.getTransformedMousePos(d3Event);
		var node = null;
		const prox = nodeProximity || 0;
		this.getAllNodeGroupsSelection()
			.each((d) => {
				let portRadius = d.layout.portRadius;
				if (CanvasUtils.isSuperBindingNode(d)) {
					portRadius = this.canvasLayout.supernodeBindingPortRadius / this.zoomTransform.k;
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

	getNodePortIdNearMousePos(d3Event, portType, node) {
		const pos = this.getTransformedMousePos(d3Event);
		let portId = null;
		let defaultPortId = null;

		if (node) {
			if (portType === OUTPUT_TYPE) {
				const portObjs = this.getAllNodeGroupsSelection()
					.selectChildren("." + this.getNodeOutputPortClassName())
					.selectChildren(".d3-node-port-output-main");

				portId = this.searchForPortNearMouse(
					node, pos, portObjs,
					node.layout.outputPortObject,
					node.width);
				defaultPortId = CanvasUtils.getDefaultOutputPortId(node);

			} else {
				const portObjs = this.getAllNodeGroupsSelection()
					.selectChildren("." + this.getNodeInputPortClassName())
					.selectChildren(".d3-node-port-input-main");

				portId = this.searchForPortNearMouse(
					node, pos, portObjs,
					node.layout.inputPortObject,
					0);
				defaultPortId = CanvasUtils.getDefaultInputPortId(node);
			}
		}

		if (!portId) {
			portId = defaultPortId;
		}
		return portId;
	}

	// Returns a port ID for the port identified by the position (pos) on the
	// node (node) further specified by the other parameters.
	searchForPortNearMouse(node, pos, portObjs, portObjectType, nodeWidthOffset) {
		let portId = null;
		portObjs
			.each((p, i, portGrps) => {
				const portSel = d3.select(portGrps[i]);
				if (portObjectType === PORT_OBJECT_IMAGE) {
					const xx = node.x_pos + Number(portSel.attr("x"));
					const yy = node.y_pos + Number(portSel.attr("y"));
					const wd = Number(portSel.attr("width"));
					const ht = Number(portSel.attr("height"));
					if (pos.x >= xx &&
							pos.x <= xx + nodeWidthOffset + wd &&
							pos.y >= yy &&
							pos.y <= yy + ht) {
						portId = portGrps[i].getAttribute("data-port-id");
					}
				} else { // Port must be a circle
					const cx = node.x_pos + Number(portSel.attr("cx"));
					const cy = node.y_pos + Number(portSel.attr("cy"));
					if (pos.x >= cx - node.layout.portRadius && // Target port sticks out by its radius so need to allow for it.
							pos.x <= cx + node.layout.portRadius &&
							pos.y >= cy - node.layout.portRadius &&
							pos.y <= cy + node.layout.portRadius) {
						portId = portGrps[i].getAttribute("data-port-id");
					}
				}
			});

		return portId;
	}

	// Returns a sizing rectangle for nodes and comments. This extends an
	// invisible area out beyond the highlight sizing line to improve usability
	// when sizing.
	getNodeShapePathSizing(data) {
		return this.getRectangleNodeShapePath(data, data.layout.nodeSizingArea);
	}

	// Returns a path string that will draw the selection outline shape of the node.
	getNodeSelectionOutline(data) {
		if (data.layout.selectionPath && !CanvasUtils.isExpanded(data)) {
			if (typeof data.layout.selectionPath === "function") {
				return data.layout.selectionPath(data);
			}
			return data.layout.selectionPath;

		} else if (data.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data); // Port-arc outline does not have a highlight gap

		}
		return this.getRectangleNodeShapePath(data, data.layout.nodeHighlightGap);
	}

	// Returns a path string that will draw the body shape of the node.
	getNodeShapePath(data) {
		if (data.layout.bodyPath && !CanvasUtils.isExpanded(data)) {
			if (typeof data.layout.bodyPath === "function") {
				return data.layout.bodyPath(data);
			}

			return data.layout.bodyPath;

		} else if (data.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data);

		}
		return this.getRectangleNodeShapePath(data);
	}

	// Returns a path that will draw the shape for the rectangle node
	// display. This is drawn as a path rather than an SVG rectangle to make the
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
			this.setPortPositionsLeftRight(node, node.outputs, node.outputPortsHeight,
				this.nodeUtils.getNodeOutputPortRightPosX(node),
				this.nodeUtils.getNodeOutputPortRightPosY(node),
				this.config.enableSingleOutputPortDisplay);
		}
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

				if (CanvasUtils.isExpandedSupernode(data)) {
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
				if (CanvasUtils.isSuperBindingNode(data)) {
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

	setPortPositionsLeftRight(data, ports, portsHeight, xPos, yPos, displaySinglePort = false) {
		if (ports && ports.length > 0) {
			if (data.height <= data.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
			} else {
				// If we are only going to display a single port, we can set all the
				// port positions to be the same as if there is only one port.
				if (displaySinglePort) {
					this.setPortPositionsLeftRightSinglePort(data, ports, xPos, yPos);
				} else {
					this.setPortPositionsLeftRightAllPorts(data, ports, portsHeight, xPos, yPos);
				}
			}
		}
	}

	// Sets the ports x and y coordinates for regular and expanded supernodes
	// when all ports are displayed in a normal manner (as opposed to when a
	// single port is displayed).
	setPortPositionsLeftRightAllPorts(data, ports, portsHeight, xPos, yPos) {
		let yPosition = 0;

		if (CanvasUtils.isExpandedSupernode(data)) {
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
		if (CanvasUtils.isSuperBindingNode(data)) {
			multiplier = 1 / this.zoomTransform.k;
		}
		ports.forEach((p) => {
			yPosition += (data.layout.portArcRadius * multiplier);
			p.cx = xPos;
			p.cy = yPosition;
			yPosition += ((data.layout.portArcRadius + data.layout.portArcSpacing) * multiplier);
		});
	}

	// If only a single port is to be displayed, this methods sets the x and y
	// coordinates of all the ports to the same values appropriately for either
	// regular nodes or expanded supernodes.
	setPortPositionsLeftRightSinglePort(data, ports, xPos, yPos) {
		let yPosition = 0;
		if (CanvasUtils.isExpandedSupernode(data)) {
			const heightSvgArea = data.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding;
			yPosition = this.canvasLayout.supernodeTopAreaHeight + (heightSvgArea / 2);

		} else {
			yPosition = yPos;
		}

		ports.forEach((p) => {
			p.cx = xPos;
			p.cy = yPosition;
		});
	}

	displayComments() {
		this.logger.logStartTimer("displayComments " + this.getFlags());

		if (this.selecting) {
			this.displayCommentsSelectionStatus();

		} else {
			this.displayAllComments();
		}

		this.logger.logEndTimer("displayComments " + this.getFlags());
	}

	displayMovedComments() {
		this.logger.logStartTimer("displayMovedComments");

		this.getAllCommentGroupsSelection()
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.datum((d) => this.activePipeline.getComment(d.id));

		this.logger.logEndTimer("displayMovedComments");
	}

	displayCommentsSelectionStatus() {
		this.getAllCommentGroupsSelection()
			.selectChildren(".d3-comment-selection-highlight")
			.attr("data-selected", (c) => (this.objectModel.isSelected(c.id, this.activePipeline.id) ? "yes" : "no"));

		this.superRenderers.forEach((renderer) => {
			renderer.selecting = true;
			renderer.displayComments();
			renderer.selecting = false;
		});
	}

	displaySingleComment(comment) {
		const selection = this.getCommentGroupSelectionById(comment.id);
		this.displayCommentsSubset(selection, [comment]);
	}

	displayAllComments() {
		const selection = this.getAllCommentGroupsSelection();
		this.displayCommentsSubset(selection, this.activePipeline.comments);
	}

	displayCommentsSubset(selection, data) {
		selection
			.data(data, (c) => c.id)
			.join(
				(enter) => this.createComments(enter)
			)
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.attr("class", (c) => this.getCommentGroupClass(c))
			.call((joinedCommentGrps) => this.updateComments(joinedCommentGrps));
	}

	createComments(enter) {
		const newCommentGroups = enter
			.append("g")
			.attr("data-id", (c) => this.getId("comment_grp", c.id))
			.call(this.attachCommentGroupListeners.bind(this));

		if (this.config.enableEditingActions) {
			newCommentGroups
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.
		}

		// Comment Sizing Area
		newCommentGroups
			.append("rect")
			.attr("class", "d3-comment-sizing")
			.call(this.attachCommentSizingListeners.bind(this));

		// Comment Selection Highlighting Outline
		newCommentGroups
			.append("rect")
			.attr("class", "d3-comment-selection-highlight");

		// Background Rectangle
		newCommentGroups
			.append("rect")
			.attr("width", (c) => c.width)
			.attr("height", (c) => c.height)
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "d3-comment-rect");

		// Comment Text
		newCommentGroups
			.append("foreignObject")
			.attr("class", "d3-foreign-object-comment-text")
			.attr("x", 0)
			.attr("y", 0)
			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.attr("class", "d3-comment-text");

		return newCommentGroups;
	}

	updateComments(joinedCommentGrps) {
		joinedCommentGrps
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.attr("class", (c) => this.getCommentGroupClass(c));

		// Comment Sizing Area
		joinedCommentGrps.selectChildren(".d3-comment-sizing")
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("x", -this.canvasLayout.commentSizingArea)
			.attr("y", -this.canvasLayout.commentSizingArea)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentSizingArea))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentSizingArea))
			.attr("class", "d3-comment-sizing");

		// Comment Selection Highlighting Outline
		joinedCommentGrps.selectChildren(".d3-comment-selection-highlight")
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("x", -this.canvasLayout.commentHighlightGap)
			.attr("y", -this.canvasLayout.commentHighlightGap)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentHighlightGap))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentHighlightGap))
			.attr("data-selected", (c) => (this.objectModel.isSelected(c.id, this.activePipeline.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Comment Body
		joinedCommentGrps.selectChildren(".d3-comment-rect")
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("height", (c) => c.height)
			.attr("width", (c) => c.width)
			.attr("class", "d3-comment-rect")
			.attr("style", (c) => this.getCommentBodyStyle(c, "default"));

		// Comment Text
		joinedCommentGrps.selectChildren(".d3-foreign-object-comment-text")
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("width", (c) => c.width)
			.attr("height", (c) => c.height)
			.select("div")
			.attr("style", (c) => this.getNodeLabelStyle(c, "default"))
			.html((c) => (
				this.config.enableMarkdownInComments
					? markdownIt.render(c.content)
					: escapeText(c.content)));
	}

	// Attaches the appropriate listeners to the comment groups.
	attachCommentGroupListeners(commentGrps) {
		commentGrps
			.on("mouseenter", (d3Event, d) => {
				this.setCommentStyles(d, "hover", d3.select(d3Event.currentTarget));
				if (this.config.enableEditingActions && d.id !== this.svgCanvasTextArea.getEditingTextId()) {
					this.createCommentPort(d3Event.currentTarget, d);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				this.setCommentStyles(d, "default", d3.select(d3Event.currentTarget));
				if (this.config.enableEditingActions) {
					this.deleteCommentPort(d3Event.currentTarget);
				}
			})
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.logStartTimer("Comment Group - mouse down");
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing();
				}
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.logEndTimer("Comment Group - mouse down");
			})
			.on("click", (d3Event, d) => {
				this.logger.log("Comment Group - click");
				d3Event.stopPropagation();
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Comment Group - double click");
				if (this.config.enableEditingActions) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);

					this.deleteCommentPort(d3Event.currentTarget);
					this.displayCommentTextArea(d, d3Event.currentTarget);

					this.canvasController.clickActionHandler({
						clickType: "DOUBLE_CLICK",
						objectType: "comment",
						id: d.id,
						selectedObjectIds: this.objectModel.getSelectedObjectIds(),
						pipelineId: this.activePipeline.id });
				}
			})
			.on("contextmenu", (d3Event, d) => {
				this.logger.log("Comment Group - context menu");
				// With enableDragWithoutSelect set to true, the object for which the
				// context menu is being requested needs to be implicitely selected.
				if (this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.openContextMenu(d3Event, "comment", d);
			});
	}

	attachCommentSizingListeners(commentGrps) {
		commentGrps
			.on("mousedown", (d3Event, d) => {
				this.commentSizing = true;
				// Note - comment resizing and finalization of size is handled by drag functions.
				this.addTempCursorOverlay(this.commentSizingCursor);
			})
			// Use mousemove here rather than mouseenter so the cursor will change
			// if the pointer moves from one area of the node outline to another
			// (eg. from east area to north-east area) without exiting the node outline.
			// A mouseenter is triggered when the sizing operation stops and the
			// pointer leaves the temporary overlay (which is removed) and enters
			// the node outline.
			.on("mousemove mouseenter", (d3Event, d) => {
				if (this.config.enableEditingActions && // Only set cursor when we are able to edit comments
					!this.isRegionSelectOrSizingInProgress()) // Don't switch sizing direction if we are already sizing
				{
					let cursorType = "default";
					if (!this.isPointerCloseToBodyEdge(d3Event, d)) {
						this.commentSizingDirection = this.getSizingDirection(d3Event, d, this.canvasLayout.commentCornerResizeArea);
						this.commentSizingCursor = this.getCursorBasedOnDirection(this.commentSizingDirection);
						cursorType = this.commentSizingCursor;
					}
					d3.select(d3Event.currentTarget).style("cursor", cursorType);
				}
			});
	}

	// Creates a port object (a grey circle in the top left corner of the
	// comment for creating links to nodes) for the comment asscoiated with
	// the comment group object passed in.
	createCommentPort(commentObj, d) {
		const commentGrp = d3.select(commentObj);

		commentGrp
			.append("circle")
			.attr("cx", (com) => com.width / 2)
			.attr("cy", (com) => com.height + this.canvasLayout.commentHighlightGap)
			.attr("r", this.canvasLayout.commentPortRadius)
			.attr("class", "d3-comment-port-circle")
			.on("mousedown", (d3Event, cd) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stops the node drag behavior when clicking on the handle/circle
				this.drawingNewLinkData = {
					srcObjId: d.id,
					action: COMMENT_LINK,
					startPos: {
						x: d.x_pos - this.canvasLayout.commentHighlightGap,
						y: d.y_pos - this.canvasLayout.commentHighlightGap
					},
					linkArray: []
				};
				this.drawNewLink(d3Event);
			});

	}

	deleteCommentPort(commentObj) {
		d3.select(commentObj)
			.selectChildren(".d3-comment-port-circle")
			.remove();
	}

	setCommentStyles(d, type, comGrp) {
		this.setCommentSelectionOutlineStyles(d, type, comGrp);
		this.setCommentBodyStyles(d, type, comGrp);
		this.setCommentTextStyles(d, type, comGrp);
	}

	setCommentSelectionOutlineStyles(d, type, comGrp) {
		const style = this.getCommentSelectionOutlineStyle(d, type);
		comGrp.selectChildren(".d3-comment-selection-highlight").attr("style", style);
	}

	setCommentBodyStyles(d, type, comGrp) {
		const style = this.getCommentBodyStyle(d, type);
		comGrp.selectChildren(".d3-comment-rect").attr("style", style);
	}

	setCommentTextStyles(d, type, comGrp) {
		const style = this.getCommentTextStyle(d, type);
		comGrp.selectChildren(".d3-foreign-object-comment-text").select("div")
			.attr("style", style);
	}

	getCommentSelectionOutlineStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "selection_outline", type);
	}

	getCommentBodyStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "body", type);
	}

	getCommentTextStyle(d, type) {
		return CanvasUtils.getObjectStyle(d, "text", type);
	}

	displayCommentTextArea(comment, parentDomObj) {
		this.svgCanvasTextArea.displayCommentTextArea(comment, parentDomObj);
	}

	displayNodeLabelTextArea(node, parentDomObj) {
		this.svgCanvasTextArea.displayNodeLabelTextArea(node, parentDomObj);
	}

	displayDecLabelTextArea(dec, obj, objType, parentDomObj) {
		this.svgCanvasTextArea.displayDecLabelTextArea(dec, obj, objType, parentDomObj);
	}

	// Adds a rectangle over the top of the canvas which is used to display a
	// temporary pointer cursor style (like the crosshair while doing a region
	// select operation). This allows the same cursor to be displayed even when
	// the pointer is moved over the top of objects that have their own cursor
	// styles set in the CSS because the style for the overlay rectangle overrides
	// any cursor styles of the underlying objects.
	addTempCursorOverlay(cursorStyle) {
		if (this.dispUtils.isDisplayingFullPage()) {
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
		if (this.dispUtils.isDisplayingFullPage()) {
			this.canvasDiv.selectAll(".d3-temp-cursor-overlay").remove();
		}
	}

	// Returns true if this renderer or any of its ancestors are currently in the
	// process of selecting a region or sizing a node or comment.
	isRegionSelectOrSizingInProgress() {
		if (this.regionSelect || this.nodeSizing || this.commentSizing) {
			return true;
		}
		if (this.supernodeInfo.renderer) {
			if (this.supernodeInfo.renderer.isRegionSelectOrSizingInProgress()) {
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
	isPointerCloseToBodyEdge(d3Event, d) {
		const pos = this.getTransformedMousePos(d3Event);
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

		const transPos = this.getTransformedMousePos(d3Event);
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

	// Returns the minimum allowed height for the node passed in. For supernodes
	// this means combining the bigger of the space for the inputs and output ports
	// with some space for the top of the display frame and the padding at the
	// bottom of the frame. Then the bigger of that height versus the default
	// supernode minimum height is retunred.
	getMinHeight(node) {
		if (CanvasUtils.isSupernode(node)) {
			const minHt = Math.max(node.inputPortsHeight, node.outputPortsHeight) +
				this.canvasLayout.supernodeTopAreaHeight + this.canvasLayout.supernodeSVGAreaPadding;
			return Math.max(this.canvasLayout.supernodeMinHeight, minHt);
		}
		return node.layout.defaultNodeHeight;
	}

	// Returns the minimum allowed width for the node passed in.
	getMinWidth(node) {
		if (CanvasUtils.isSupernode(node)) {
			return this.canvasLayout.supernodeMinWidth;
		}
		return node.layout.defaultNodeWidth;
	}

	// Sets the size and position of the node in the canvasInfo.nodes
	// array based on the position of the pointer during the resize action
	// then redraws the nodes and links (the link positions may move based
	// on the node size change).
	resizeNode(d3Event, d) {
		const resizeObj = this.activePipeline.getNode(d.id);
		const oldSupernode = Object.assign({}, resizeObj);
		const minHeight = this.getMinHeight(resizeObj);
		const minWidth = this.getMinWidth(resizeObj);

		const delta = this.resizeObject(d3Event, resizeObj,
			this.nodeSizingDirection, minWidth, minHeight);

		if (delta && (delta.x_pos !== 0 || delta.y_pos !== 0 || delta.width !== 0 || delta.height !== 0)) {
			if (CanvasUtils.isSupernode(resizeObj) &&
					this.config.enableMoveNodesOnSupernodeResize) {
				const objectsInfo = CanvasUtils.moveSurroundingObjects(
					oldSupernode,
					this.activePipeline.getNodesAndComments(),
					this.nodeSizingDirection,
					resizeObj.width,
					resizeObj.height,
					true // Pass true to indicate that object positions should be updated.
				);

				const linksInfo = CanvasUtils.moveSurroundingDetachedLinks(
					oldSupernode,
					this.activePipeline.links,
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

			this.displayMovedComments();
			this.displayMovedNodes();
			this.displaySingleNode(resizeObj);
			this.displayMovedLinks();
			this.displayCanvasAccoutrements();

			if (CanvasUtils.isSupernode(resizeObj)) {
				if (this.dispUtils.isDisplayingSubFlow()) {
					this.displayBindingNodesToFitSVG();
				}
				this.superRenderers.forEach((renderer) => renderer.displaySVGToFitSupernode());
			}
			this.logger.logEndTimer("displayObjects");
		}
	}

	// Sets the size and position of the comment in the canvasInfo.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and links (the link positions may move based
	// on the comment size change).
	resizeComment(d3Event, d) {
		const resizeObj = this.activePipeline.getComment(d.id);
		this.resizeObject(d3Event, resizeObj, this.commentSizingDirection, 20, 20);
		this.displaySingleComment(resizeObj);
		this.displayMovedLinks();
		this.displayCanvasAccoutrements();
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

		if (this.config.enableSnapToGridType === SNAP_TO_GRID_DURING) {
			// Calculate where the object being resized would be and its size given
			// current increments.
			this.notSnappedXPos += incrementX;
			this.notSnappedYPos += incrementY;
			this.notSnappedWidth += incrementWidth;
			this.notSnappedHeight += incrementHeight;

			xPos = CanvasUtils.snapToGrid(this.notSnappedXPos, this.canvasLayout.snapToGridXPx);
			yPos = CanvasUtils.snapToGrid(this.notSnappedYPos, this.canvasLayout.snapToGridYPx);
			width = CanvasUtils.snapToGrid(this.notSnappedWidth, this.canvasLayout.snapToGridXPx);
			height = CanvasUtils.snapToGrid(this.notSnappedHeight, this.canvasLayout.snapToGridYPx);

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
		let resizeObj = this.activePipeline.getNode(node.id);
		if (this.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			resizeObj = this.snapToGridObject(resizeObj);
		}

		// If the dimensions or position has changed, issue the command.
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

			this.canvasController.editActionHandler({
				editType: "resizeObjects",
				editSource: "canvas",
				objectsInfo: this.nodeSizingObjectsInfo,
				detachedLinksInfo: this.nodeSizingDetLinksInfo,
				pipelineId: this.pipelineId
			});
		}
		this.nodeSizing = false;
		this.nodeSizingObjectsInfo = {};
		this.nodeSizingDetLinksInfo = {};
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing(comment) {
		let resizeObj = this.activePipeline.getComment(comment.id);
		if (this.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
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
				pipelineId: this.pipelineId
			};
			this.canvasController.editActionHandler(data);
		}
		this.commentSizing = false;
	}

	displayLinks() {
		this.logger.logStartTimer("displayLinks " + this.getFlags());

		if (this.selecting) {
			this.displayLinksSelectionStatus();

		} else {
			this.displayAllLinks();
		}

		this.logger.logEndTimer("displayLinks " + this.getFlags());
	}

	displayLinksSelectionStatus() {
		if (this.config.enableLinkSelection !== LINK_SELECTION_NONE) {
			this.getAllLinkGroupsSelection()
				.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? true : null));

			this.superRenderers.forEach((renderer) => {
				renderer.selecting = true;
				renderer.displayLinks();
				renderer.selecting = false;
			});
		}
	}

	displayAllLinks() {
		const linksArray = this.buildLinksArray();
		const selection = this.getAllLinkGroupsSelection();
		this.displayLinksSubset(selection, linksArray);
	}

	displayMovedLinks() {
		this.logger.logStartTimer("displayMovedLinks");

		const linksArray = this.buildLinksArray();
		const movedLinks = linksArray.filter((l) => l.coordsUpdated);

		movedLinks.forEach((l) => {
			this.displaySingleLink(l);
		});

		this.logger.logEndTimer("displayMovedLinks");
	}

	displaySingleLink(link) {
		const selection = this.getLinkGroupSelectionById(link.id);
		this.displayLinksSubset(selection, [link]);
	}

	displayLinksSubset(selection, linksArray) {
		selection
			.data(linksArray, (link) => link.id)
			.join(
				(enter) => this.createLinks(enter)
			)
			.attr("class", (d) => this.getLinkGroupClass(d))
			.attr("style", (d) => this.getLinkGrpStyle(d))
			.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? true : null))
			.call((joinedLinkGrps) => {
				this.updateLinks(joinedLinkGrps, linksArray);
			});
	}

	// Creates all newly created links specified in the enter selection.
	createLinks(enter) {
		// Add groups for links
		const newLinkGrps = enter.append("g")
			.attr("data-id", (d) => this.getId("link_grp", d.id))
			.call(this.attachLinkGroupListeners.bind(this));

		// Add selection area for link line
		newLinkGrps
			.append("path")
			.attr("class", (d) => this.getLinkSelectionAreaClass(d));

		// Add displayed link line
		newLinkGrps
			.append("path")
			.attr("class", "d3-link-line");

		// Add displayed link line arrow heads
		newLinkGrps
			.filter((d) => (d.type === NODE_LINK && this.canvasLayout.dataLinkArrowHead) ||
											(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead) ||
											(d.type === NODE_LINK && this.canvasLayout.linkType === LINK_TYPE_STRAIGHT))
			.append("path")
			.attr("class", "d3-link-line-arrow-head");

		// Add a group to store decorations. Adding this here ensures the decorations
		// are always under the link handles whose group is added next.
		newLinkGrps
			.append("g")
			.attr("class", "d3-link-decorations-group");

		// Add a group to store link handles, if needed.
		if (this.config.enableLinkSelection === LINK_SELECTION_HANDLES ||
				this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
			newLinkGrps
				.append("g")
				.attr("class", "d3-link-handles-group")
				.each((d, i, linkGrps) => {
					if (d.type === NODE_LINK) {
						// Since there are always just two handles we create the here.
						this.createNewHandles(d3.select(linkGrps[i]));
					}
				});
		}

		return newLinkGrps;
	}

	// Updates all the link groups (and descendant objects) in the joinedLinkGrps
	// selection object. The selection object will contain newly created links
	// as well as existing links.
	updateLinks(joinedLinkGrps, lineArray) {
		// Update link selection area
		joinedLinkGrps
			.selectAll(".d3-link-selection-area")
			.datum((d) => this.activePipeline.getLink(d.id))
			.attr("d", (d) => d.pathInfo.path);

		// Update link line
		joinedLinkGrps
			.selectAll(".d3-link-line")
			.datum((d) => this.activePipeline.getLink(d.id))
			.attr("d", (d) => d.pathInfo.path)
			.attr("class", "d3-link-line")
			.attr("style", (d) => CanvasUtils.getObjectStyle(d, "line", "default"));

		// Update link line arrow head
		joinedLinkGrps
			.filter((d) => (d.type === NODE_LINK && this.canvasLayout.dataLinkArrowHead) ||
											(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead) ||
											(d.type === NODE_LINK && this.canvasLayout.linkType === LINK_TYPE_STRAIGHT))
			.selectAll(".d3-link-line-arrow-head")
			.datum((d) => this.activePipeline.getLink(d.id))
			.attr("d", (d) => this.getArrowHead(d))
			.attr("transform", (d) => this.getArrowHeadTransform(d))
			.attr("class", "d3-link-line-arrow-head")
			.attr("style", (d) => CanvasUtils.getObjectStyle(d, "line", "default"));

		// Update decorations on the node-node or association links.
		joinedLinkGrps.each((d, i, linkGrps) => {
			if (d.type === NODE_LINK || d.type === ASSOCIATION_LINK) {
				const linkGrp = d3.select(linkGrps[i]).selectAll(".d3-link-decorations-group");
				this.displayDecorations(d, DEC_LINK, linkGrp, d.decorations);
			}
		});

		// Add link line handles at start and end of line, if required
		if (this.config.enableLinkSelection === LINK_SELECTION_HANDLES ||
				this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
			joinedLinkGrps.each((d, i, linkGrps) => {
				if (d.type === NODE_LINK) {
					// We only need to update handles since they were created in the create link step
					this.updateHandles(d3.select(linkGrps[i]).selectAll(".d3-link-handles-group"), lineArray);
				}
			});
		}

		if (!this.dragging) {
			this.setDisplayOrder(joinedLinkGrps);
		}
	}

	attachLinkGroupListeners(linkGrps) {
		linkGrps
			.on("mousedown", (d3Event, d, index, links) => {
				this.logger.log("Link Group - mouse down");
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing();
				}
				if (this.config.enableLinkSelection !== LINK_SELECTION_NONE) {
					this.selectObjectD3Event(d3Event, d);
				}
				d3Event.stopPropagation();
			})
			.on("mouseup", () => {
				this.logger.log("Link Group - mouse up");
			})
			.on("click", (d3Event, d) => {
				this.logger.log("Link Group - click");
				d3Event.stopPropagation();
			})
			.on("contextmenu", (d3Event, d) => {
				this.logger.log("Link Group - context menu");
				if (this.config.enableLinkSelection !== LINK_SELECTION_NONE) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.openContextMenu(d3Event, "link", d);
			})
			.on("mouseenter", (d3Event, link) => {
				const targetObj = d3Event.currentTarget;

				if (this.config.enableLinkSelection === LINK_SELECTION_HANDLES ||
						this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
					this.raiseLinkToTop(targetObj);
				}
				this.setLinkLineStyles(targetObj, link, "hover");

				if (this.canOpenTip(TIP_TYPE_LINK) &&
						!this.draggingLinkData) {
					this.canvasController.openTip({
						id: this.getId("link_tip", link.id),
						type: TIP_TYPE_LINK,
						targetObj: targetObj,
						mousePos: { x: d3Event.clientX, y: d3Event.clientY },
						pipelineId: this.activePipeline.id,
						link: link
					});
				}
			})
			.on("mouseleave", (d3Event, link) => {
				const targetObj = d3Event.currentTarget;

				if (!targetObj.getAttribute("data-selected")) {
					this.lowerLinkToBottom(targetObj);
				}
				this.setLinkLineStyles(targetObj, link, "default");
				this.canvasController.closeTip();
			});
	}

	// Creates a new start handle and a new end handle for the link groups
	// passed in.
	createNewHandles(handlesGrp) {
		const startHandle = handlesGrp
			.append(this.canvasLayout.linkStartHandleObject)
			.attr("class", (d) => "d3-link-handle-start")
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link start handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Link end handle - finished mouse down");
			});

		if (this.config.enableEditingActions) {
			startHandle.call(this.dragSelectionHandle);
		}

		const endHandle = handlesGrp
			.append(this.canvasLayout.linkEndHandleObject)
			.attr("class", (d) => "d3-link-handle-end")
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link end handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Link end handle - finished mouse down");
			});

		if (this.config.enableEditingActions) {
			endHandle.call(this.dragSelectionHandle);
		}
	}

	// Updates the start and end link handles for the handle groups passed in.
	updateHandles(handlesGrp, lineArray) {
		handlesGrp
			.selectAll(".d3-link-handle-start")
			.datum((d) => this.activePipeline.getLink(d.id))
			.each((datum, index, linkHandles) => {
				const obj = d3.select(linkHandles[index]);
				if (this.canvasLayout.linkStartHandleObject === "image") {
					obj
						.attr("xlink:href", this.canvasLayout.linkStartHandleImage)
						.attr("x", (d) => d.x1 - (this.canvasLayout.linkStartHandleWidth / 2))
						.attr("y", (d) => d.y1 - (this.canvasLayout.linkStartHandleHeight / 2))
						.attr("width", this.canvasLayout.linkStartHandleWidth)
						.attr("height", this.canvasLayout.linkStartHandleHeight);

				} else if (this.canvasLayout.linkStartHandleObject === "circle") {
					obj
						.attr("r", this.canvasLayout.linkStartHandleRadius)
						.attr("cx", (d) => d.x1)
						.attr("cy", (d) => d.y1);
				}
			});

		handlesGrp
			.selectAll(".d3-link-handle-end")
			.datum((d) => this.activePipeline.getLink(d.id))
			.each((datum, index, linkHandles) => {
				const obj = d3.select(linkHandles[index]);
				if (this.canvasLayout.linkEndHandleObject === "image") {
					obj
						.attr("xlink:href", this.canvasLayout.linkEndHandleImage)
						.attr("x", (d) => d.x2 - (this.canvasLayout.linkEndHandleWidth / 2))
						.attr("y", (d) => d.y2 - (this.canvasLayout.linkEndHandleHeight / 2))
						.attr("width", this.canvasLayout.linkEndHandleWidth)
						.attr("height", this.canvasLayout.linkEndHandleHeight)
						.attr("transform", (d) => this.getLinkImageTransform(d));

				} else if (this.canvasLayout.linkEndHandleObject === "circle") {
					obj
						.attr("r", this.canvasLayout.linkEndHandleRadius)
						.attr("cx", (d) => d.x2)
						.attr("cy", (d) => d.y2);
				}
			});
	}

	// Sets the custom inline styles on the link object passed in.
	setLinkLineStyles(linkObj, link, type) {
		const style = CanvasUtils.getObjectStyle(link, "line", type);
		const linkSel = d3.select(linkObj);
		linkSel.select(".d3-link-line").attr("style", style);
		linkSel.select(".d3-link-line-arrow-head").attr("style", style);
	}

	// Returns the class string to be appled to the link selection area.
	getLinkSelectionAreaClass(d) {
		let typeClass = "";
		if (d.type === ASSOCIATION_LINK) {
			typeClass = "d3-association-link-selection-area";
		} else if (d.type === COMMENT_LINK) {
			typeClass = "d3-comment-link-selection-area";
		} else {
			typeClass = "d3-data-link-selection-area";
		}

		return "d3-link-selection-area " + typeClass;
	}

	// Returns the class string to be appled to the link group object.
	getLinkGroupClass(d) {
		return "d3-link-group " + this.getLinkTypeClass(d) + " " + this.getLinkCustomClass(d);
	}

	// Returns the custom class string for the link object passed in.
	getLinkCustomClass(d) {
		// If the link has a classname, that isn't the current or historic default,
		// use it!
		if (d.class_name &&
				d.class_name !== "canvas-data-link" &&
				d.class_name !== "canvas-object-link" &&
				d.class_name !== "canvas-comment-link" &&
				d.class_name !== "d3-data-link" &&
				d.class_name !== "d3-association-link" &&
				d.class_name !== "d3-object-link" &&
				d.class_name !== "d3-comment-link") {
			return d.class_name;
		}
		return "";
	}

	// Returns the class string for the type of link object passed in.
	getLinkTypeClass(d) {
		if (d.type === ASSOCIATION_LINK) {
			if (this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE) {
				return "d3-association-link";
			}
			return "d3-object-link";
		} else if (d.type === COMMENT_LINK) {
			return "d3-comment-link";
		}
		return "d3-data-link";
	}

	// Returns the class string to be appled to the comment group object.
	getCommentGroupClass(d) {
		let customClass = "";
		// If the comment has a classname that isn't the default use it!
		if (d.class_name &&
				d.class_name !== "canvas-comment" &&
				d.class_name !== "d3-comment-rect") {
			customClass = " " + d.class_name;
		}

		// Set class to enable mouse cursor to be set appropriately.
		const draggableClass = this.config.enableEditingActions
			? " d3-draggable"
			: " d3-non-draggable";

		// If the class name provided IS the default, or there is no classname,
		// return the class name.
		return "d3-comment-group" + draggableClass + customClass;
	}

	// Returns the class string to be appled to the node group object.
	getNodeGroupClass(d) {
		let customClass = " " + d.layout.className || "";

		// If the node has a classname that isn't the default use it!
		if (d.class_name &&
				d.class_name !== "canvas-node" &&
				d.class_name !== "d3-node-body" &&
				d.class_name !== "d3-node-body-outline") {
			customClass = " " + d.class_name;
		}

		const supernodeClass = CanvasUtils.isExpandedSupernode(d)
			? " d3-node-supernode-expanded"
			: "";

		// Set class to enable mouse cursor to be set appropriately.
		const draggableClass = this.config.enableEditingActions
			? " d3-draggable"
			: " d3-non-draggable";

		const resizeClass = d.isResized // this.isNodeResized(d)
			? " d3-resized"
			: "";

		return "d3-node-group" + supernodeClass + resizeClass + draggableClass + customClass;
	}

	// Pushes the links to be below nodes within the nodesLinksGrp group.
	setDisplayOrder(linkGroup) {
		// Force those links without decorations to be behind those with decorations
		// in case the links overlap we don't want the decorations to be overwritten.
		linkGroup.filter((lnk) => this.hasOneDecorationOrMore(lnk)).lower();
		linkGroup.filter((lnk) => !this.hasOneDecorationOrMore(lnk)).lower();

		if (this.config.enableLinkSelection === LINK_SELECTION_HANDLES ||
				this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
			this.raiseSelectedLinksToTop();
		}
	}

	// Raises the node above other nodes and objects (on the mouse entering
	// the node). This is necessary for apps that have ports that protrude from
	// the side of the node and where those nodes may be positioned close to each
	// other so it makes the ports appear on top of any adjacent node.
	raiseNodeToTop(nodeGrp) {
		if (this.drawingNewLinkData === null && !this.dragging && this.getSelectedLinks().length === 0) {
			nodeGrp.raise();
		}
	}

	// Moves any selected links to the top of the display order. This is necessary
	// when selection handles are being displayed on selected links because the
	// handles may be in the same positions as port circles on the nodes.
	raiseSelectedLinksToTop() {
		this.nodesLinksGrp
			.selectAll(".d3-link-group[data-selected]")
			.raise();
	}

	raiseLinkToTop(obj) {
		d3.select(obj)
			.raise();
	}

	lowerLinkToBottom(obj) {
		d3.select(obj)
			.lower();
	}

	// Returns true if the link passed in has one or more decorations.
	hasOneDecorationOrMore(link) {
		return link.decorations && link.decorations.length > 0;
	}

	isLinkBeingDragged(link) {
		return this.draggingLinkData && this.draggingLinkData.link.id === link.id;
	}

	buildLinksArray() {
		let linksArray = [];

		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
			this.updateLinksForNodes();
		}

		this.activePipeline.links.forEach((link) => {
			let linkObj = null;

			if (((this.config.enableLinkSelection === LINK_SELECTION_HANDLES && this.isLinkBeingDragged(link)) ||
						this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) &&
					(!link.srcObj || !link.trgNode)) {
				linkObj = this.getDetachedLineObj(link);

			} else {
				linkObj = this.getAttachedLineObj(link);
			}
			if (linkObj) {
				linksArray.push(linkObj);
			}
		});

		// Adjust the minInitialLineForElbow property for links when displaying
		// the Elbow line type. This prevents overlapping at the links' first elbow.
		if (this.canvasLayout.linkType === LINK_TYPE_ELBOW) {
			linksArray = this.addMinInitialLineForElbow(linksArray);
		}

		// Add connection path info to the links.
		linksArray = this.linkUtils.addConnectionPaths(linksArray);

		return linksArray;
	}

	getAttachedLineObj(link) {
		const srcObj = link.srcObj;
		const trgNode = link.trgNode;

		if (!srcObj) {
			this.logger.error(
				"Common Canvas error trying to draw a link. A link was specified for source ID '" + link.srcNodeId +
				"' in the Canvas data that does not have a valid source node/comment.");
		}

		if (!trgNode) {
			this.logger.error(
				"Common Canvas error trying to draw a link. A link was specified for target ID '" + link.trgNodeId +
				"' in the Canvas data that does not have a valid target node.");
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
			const coords = this.linkUtils.getLinkCoords(link, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation);

			link.coordsUpdated =
				link.x1 !== coords.x1 ||
				link.y1 !== coords.y1 ||
				link.x2 !== coords.x2 ||
				link.y2 !== coords.y2;

			link.assocLinkVariation = assocLinkVariation;
			link.srcPortId = srcPortId;
			link.trgPortId = trgPortId;
			link.x1 = coords.x1;
			link.y1 = coords.y1;
			link.x2 = coords.x2;
			link.y2 = coords.y2;
			link.originX = coords.originX;
			link.originY = coords.originY;
			return link;
		}
		return null;
	}

	// Returns a line object describing the detached (or semi-detached) link
	// passed in. This will only ever be called when either srcNode OR trgNode
	// are null (indicating a semi-detached link) or when both are null indicating
	// a fully-detached link.
	getDetachedLineObj(link) {
		const srcObj = link.srcObj;
		const trgNode = link.trgNode;

		let srcPortId = null;
		let trgPortId = null;
		const coords = {};

		if (!srcObj) {
			coords.x1 = link.srcPos.x_pos;
			coords.y1 = link.srcPos.y_pos;

		} else {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				const endPos = { x: link.trgPos.x_pos, y: link.trgPos.y_pos };
				const startPos = this.linkUtils.getNewStraightNodeLinkStartPos(srcObj, endPos, link.srcOriginInfo);
				coords.x1 = startPos.x;
				coords.y1 = startPos.y;
				coords.originX = startPos.originX;
				coords.originY = startPos.originY;

			} else {
				srcPortId = this.getSourcePortId(link, srcObj);
				const port = this.getOutputPort(srcObj, srcPortId);
				if (port) {
					coords.x1 = srcObj.x_pos + port.cx;
					coords.y1 = srcObj.y_pos + port.cy;
				}
			}
		}

		if (!trgNode) {
			coords.x2 = link.trgPos.x_pos;
			coords.y2 = link.trgPos.y_pos;

		} else {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				const endPos = { x: link.srcPos.x_pos, y: link.srcPos.y_pos };
				const startPos = this.linkUtils.getNewStraightNodeLinkStartPos(trgNode, endPos, link.trgOriginInfo);
				coords.x2 = startPos.x;
				coords.y2 = startPos.y;

			} else {
				trgPortId = this.getTargetPortId(link, trgNode);
				const port = this.getInputPort(trgNode, trgPortId);
				if (port) {
					coords.x2 = trgNode.x_pos + port.cx;
					coords.y2 = trgNode.y_pos + port.cy;
				}
			}
		}

		link.coordsUpdated =
			link.x1 !== coords.x1 ||
			link.y1 !== coords.y1 ||
			link.x2 !== coords.x2 ||
			link.y2 !== coords.y2;

		link.srcPortId = srcPortId;
		link.trgPortId = trgPortId;
		link.x1 = coords.x1;
		link.y1 = coords.y1;
		link.x2 = coords.x2;
		link.y2 = coords.y2;
		link.originX = coords.originX;
		link.originY = coords.originY;

		return link;
	}

	getOutputPort(srcNode, srcPortId) {
		if (srcNode && srcNode.outputs) {
			return srcNode.outputs.find((p) => p.id === srcPortId);
		}
		return null;
	}

	getInputPort(trgNode, trgPortId) {
		if (trgNode && trgNode.inputs) {
			return trgNode.inputs.find((p) => p.id === trgPortId);
		}
		return null;
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
		const srcHighlightGap = linkType === COMMENT_LINK ? this.canvasLayout.commentHighlightGap : srcObj.layout.nodeHighlightGap;
		const trgHighlightGap = trgNode.layout.nodeHighlightGap;

		const srcLeft = srcObj.x_pos - srcHighlightGap;
		const srcRight = srcObj.x_pos + srcObj.width + srcHighlightGap;
		const trgLeft = trgNode.x_pos - trgHighlightGap;
		const trgRight = trgNode.x_pos + trgNode.width + trgHighlightGap;

		const srcTop = srcObj.y_pos - srcHighlightGap;
		const srcBottom = srcObj.y_pos + srcObj.height + srcHighlightGap;
		const trgTop = trgNode.y_pos - trgHighlightGap;
		const trgBottom = trgNode.y_pos + trgNode.height + trgHighlightGap;

		if (srcRight >= trgLeft && trgRight >= srcLeft &&
				srcBottom >= trgTop && trgBottom >= srcTop) {
			return true;
		}
		return false;
	}

	// Returns an array of links where the minInitialLineForElbow property is
	// set and incremented so that elbow links that emanate from a source node
	// do not overlap when the first elbow bend occurs. To do this it
	// loops through the current nodes and for each node that has multiple
	// output ports:
	// 1. Gets the link objects associated with those ports.
	// 2. Sorts those link objects based on the vertical separation from
	//    the source to the target.
	// 3. Applies ever increasing minInitialLineForElbow values to the link
	//    objects based on their sort order.
	// The result is that the elbow links, emantating from the ports of the node,
	//  do not overlap.
	addMinInitialLineForElbow(links) {
		this.activePipeline.nodes.forEach((node) => {
			if (node.outputs && node.outputs.length > 1) {
				const nodeLinks = this.getNodeOutputLinks(node, links);
				const sortedNodeLinks = this.sortNodeOutputLinks(nodeLinks);
				this.applyMinInitialLine(node, sortedNodeLinks);
			}
		});
		return links;
	}

	// Returns an array of links where each link emanates from the
	// output ports of the source node passed in.
	getNodeOutputLinks(srcNode, links) {
		const outArray = [];
		links.forEach((link) => {
			if (link.srcObj && link.srcObj.id === srcNode.id) {
				outArray.push(link);
			}
		});
		return outArray;
	}

	// Returns the input array of link objects sorted by the differences
	// between the absolute distance from the source port position to the
	// target port position. This means the lines connecting source node ports
	// to target node ports over the furthest distance (in the y direction with
	// Left -> Right linkDirection) will be sorted first and the lines connecting
	// source to target ports over the shortest y direction distance will be sorted last.
	sortNodeOutputLinks(nodeLinks) {
		return nodeLinks.sort((nodeLineData1, nodeLineData2) => {
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

	// Loops through the link objects associated with the output ports of
	// the node passed in and applies an ever increasing minInitialLineForElbow
	// value to each one. This means that, because the link objects are sorted by
	// vertical separation, the line with greatest vertical separation will get
	// the smallest minInitialLineForElbow and the line with the smallest vertical
	// separation will get the biggest minInitialLineForElbow.
	applyMinInitialLine(node, sortedNodeLinks) {
		let runningInitialLine = node.layout.minInitialLine;
		sortedNodeLinks.forEach((lineData) => {
			lineData.minInitialLineForElbow = runningInitialLine;
			runningInitialLine += lineData.srcObj.layout.minInitialLineIncrement;
		});
	}

	// Updates the data links for all the nodes with two optional fields
	// (called srcOriginInfo and trgOriginInfo) based on the location of the
	// nodes the links go from and to. The info in these fields is used to
	// calculate the starting and ending position of straight line links.
	// This ensures that input and output links that go in a certain direction
	// (NORTH, SOUTH, EAST or WEST) are grouped together so they can be
	// separated out when straight lines are drawn between nodes.
	updateLinksForNodes() {
		this.activePipeline.nodes.forEach((n) => this.updateLinksForNode(n));
	}

	// Updates the links going into and out of the node passed in with up to
	// two new fields (called srcOriginInfo and trgOriginInfo).
	updateLinksForNode(node) {
		const linksInfo = {};
		linksInfo.n = [];
		linksInfo.s = [];
		linksInfo.e = [];
		linksInfo.w = [];

		// Update the linksInfo arrays for each direction: n, s, e and w.
		this.activePipeline.links.forEach((link) => {
			if (link.type === NODE_LINK) {
				if (link.trgNode && link.trgNode.id === node.id) {
					if (link.srcObj) {
						const dir = this.getDirAdjusted(link.trgNode, link.srcObj);
						linksInfo[dir].push({ type: "in", endNode: link.srcObj, link });

					} else if (link.srcPos) {
						const dir = this.getDirToEndPos(link.trgNode, link.srcPos.x_pos, link.srcPos.y_pos);
						linksInfo[dir].push({ type: "in", x: link.srcPos.x_pos, y: link.srcPos.y_pos, link });
					}

				} else if (link.srcObj && link.srcObj.id === node.id) {
					if (link.trgNode) {
						const dir = this.getDirAdjusted(link.srcObj, link.trgNode);
						linksInfo[dir].push({ type: "out", endNode: link.trgNode, link });

					} else if (link.trgPos) {
						const dir = this.getDirToEndPos(link.srcObj, link.trgPos.x_pos, link.trgPos.y_pos);
						linksInfo[dir].push({ type: "out", x: link.trgPos.x_pos, y: link.trgPos.y_pos, link });
					}
				}
			}
		});

		linksInfo.n = this.sortLinksInfo(linksInfo.n, NORTH);
		linksInfo.s = this.sortLinksInfo(linksInfo.s, SOUTH);
		linksInfo.e = this.sortLinksInfo(linksInfo.e, EAST);
		linksInfo.w = this.sortLinksInfo(linksInfo.w, WEST);

		this.updateLinksInfo(linksInfo.n, NORTH);
		this.updateLinksInfo(linksInfo.s, SOUTH);
		this.updateLinksInfo(linksInfo.e, EAST);
		this.updateLinksInfo(linksInfo.w, WEST);
	}

	// Returns the direction of a link from the start node to the end node
	// as either NORTH, SOUTH, EAST or WEST. Some direction combinations
	// have to be overriden to prevent link lines overlapping.
	getDirAdjusted(startNode, endNode) {
		let dir = this.getDirToNode(startNode, endNode);

		// When start -> end is SOUTH and end -> start is WEST the returned direction
		// becomes EAST instead of SOUTH to prevent link lines overlapping.
		if (dir === SOUTH) {
			const dir2 = this.getDirToNode(endNode, startNode);
			if (dir2 === WEST) {
				dir = EAST;
			}

		// When start -> end is NORTH and end -> start is EAST the returned direction
		// becomes WEST instead of NORTH to prevent link lines overlapping.
		} else if (dir === NORTH) {
			const dir2 = this.getDirToNode(endNode, startNode);
			if (dir2 === EAST) {
				dir = WEST;
			}
		}
		return dir;
	}

	// Returns the direction (NORTH, SOUTH, EAST or WEST) from the start node
	// to the end node.
	getDirToNode(startNode, endNode) {
		const endX = this.nodeUtils.getNodeCenterPosX(endNode);
		const endY = this.nodeUtils.getNodeCenterPosY(endNode);
		return this.getDirToEndPos(startNode, endX, endY);
	}

	// Returns the direction (NORTH, SOUTH, EAST or WEST) from the start node
	// to the end position endX, endY.
	getDirToEndPos(startNode, endX, endY) {
		const originX = this.nodeUtils.getNodeCenterPosX(startNode);
		const originY = this.nodeUtils.getNodeCenterPosY(startNode);

		const x = startNode.x_pos;
		const y = startNode.y_pos;
		const w = startNode.width;
		const h = startNode.height;

		return CanvasUtils.getDir(x, y, w, h, originX, originY, endX, endY);
	}

	// Returns the linksDirArray passed in with the linkInfo objects in the
	// array ordered by the position of the end of each link line, depending on
	// the direction (dir) of the lines. This is achieved by spliting the links
	// into groups where links in the same group go to/from the same node.
	sortLinksInfo(linksDirArrayIn, dir) {
		let linksDirArray = linksDirArrayIn;
		if (linksDirArray.length > 1) {
			const groups = this.getLinkInfoGroups(linksDirArray);

			forOwn(groups, (group) => {
				group.forEach((li, i) => {
					const node = li.endNode;
					const parts = group.length + 1;

					if (dir === NORTH || dir === SOUTH) {
						li.x = node.x_pos + ((node.width / parts) * (i + 1));
						li.y = this.nodeUtils.getNodeCenterPosY(node);
					} else {
						li.x = this.nodeUtils.getNodeCenterPosX(node);
						li.y = node.y_pos + ((node.height / parts) * (i + 1));
					}
				});
			});

			// For NORTH and SOUTH links we sort linksDirArray by the x coordinate
			// of the end of each link. For EAST and WEST we sort by the y
			// coordinate.
			if (dir === NORTH || dir === SOUTH) {
				linksDirArray = linksDirArray.sort((a, b) => (a.x > b.x ? 1 : -1));
			} else {
				linksDirArray = linksDirArray.sort((a, b) => (a.y > b.y ? 1 : -1));
			}
		}
		return linksDirArray;
	}

	// Returns a 'groups' object where each field is index by a node ID and
	// contains an array of linkInfo objects that go to/from the node.
	getLinkInfoGroups(linksDirArray) {
		const groups = {};
		linksDirArray.forEach((li) => {
			// Only create groups for attached links.
			if (li.endNode) {
				if (!groups[li.endNode.id]) {
					groups[li.endNode.id] = [];
				}
				groups[li.endNode.id].push(li);
			}
		});
		return groups;
	}

	// Updates the link objects referenced by the linkInfo objects in the
	// linksDirArray with info to specify the link direction (n, s, e or w),
	// plus the index and number of connections. This is used when
	// drawing straight lines to/from nodes to spread out the lines.
	updateLinksInfo(linksDirArray, dir) {
		linksDirArray.forEach((li, i) => {
			if (li.type === "out") {
				li.link.srcOriginInfo = {
					dir: dir,
					idx: i,
					len: linksDirArray.length
				};
			} else {
				li.link.trgOriginInfo = {
					dir: dir,
					idx: i,
					len: linksDirArray.length
				};
			}
		});
	}

	// Returns a variation of association link to draw when a new link is being
	// drawn outwards from a port. startX is the beginning point of the line
	// at the port. endX is the position where the mouse is currently positioned.
	getNewLinkAssocVariation(startX, endX, portType) {
		if (portType === "input" && startX > endX) {
			return ASSOC_VAR_CURVE_LEFT;

		} else if (portType === "output" && startX < endX) {
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

	// Returns path for arrow head displayed within an input port circle. It is
	// draw so the tip is 2px in front of the origin 0,0 so it appears nicely in
	// the port circle.
	getPortArrowPath(port) {
		return "M -2 3 L 2 0 -2 -3";
	}

	// Returns the transform to position and, if ncessecary, rotate the port
	// circle arrow.
	getPortArrowPathTransform(port) {
		const angle = this.getAngleBasedOnLinkDirection();
		return `translate(${port.cx}, ${port.cy}) rotate(${angle})`;
	}

	// Returns an SVG path to draw the arrow head.
	getArrowHead(d) {
		if (d.type === COMMENT_LINK) {
			if (typeof this.canvasLayout.commentLinkArrowHead === "string") {
				return this.canvasLayout.commentLinkArrowHead;
			}
			return "M -8 3 L 0 0 -8 -3";
		}
		if (typeof this.canvasLayout.dataLinkArrowHead === "string") {
			return this.canvasLayout.dataLinkArrowHead;
		}
		return "M -6 6 L 0 0 -6 -6";
	}

	// Returns a transform for an arrow head at the end of a link line.
	// If the linkType is Elbow, it makes sure the arrow head is either
	// horizontal for left-right or vertical for top-bottom/bottom-top link
	// directions, because the end of elbow lines are always at the same angle as
	// the elbow lines. Otherwise it returns an angle so the arrow head is
	// relevant to the slope of the straight link being drawn.
	// TODO -- This doesn't handle "Curve" link types very well (in fact for
	// curves it returns the same as for "Straight" links) becauset it is very
	// difficult to write an algorithm that gives the correct angle for a
	// "Curve" link to make it look presentable. I know, I tried!
	getArrowHeadTransform(d) {
		const angle =
			this.canvasLayout.linkType === LINK_TYPE_ELBOW
				? this.getAngleBasedOnLinkDirection()
				: Math.atan2((d.y2 - d.y1), (d.x2 - d.x1)) * (180 / Math.PI);

		return `translate(${d.x2}, ${d.y2}) rotate(${angle})`;
	}

	// Returns the angle for the arrow head when perpndicular arrows are in
	// us such as when a the link type is "Elbow" or when we are displaying an
	// arrow head inside a port circle.
	getAngleBasedOnLinkDirection() {
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			return NINETY_DEGREES;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			return -NINETY_DEGREES;
		}
		return 0;
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

	getSelectedLinks() {
		var objs = [];
		this.activePipeline.links.forEach((link) => {
			if (this.objectModel.getSelectedObjectIds().includes(link.id)) {
				objs.push(link);
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
	getDefaultCommentOffset() {
		let xPos = this.canvasLayout.addCommentOffsetX;
		let yPos = this.canvasLayout.addCommentOffsetY;

		if (this.zoomTransform) {
			xPos = this.zoomTransform.x / this.zoomTransform.k;
			yPos = this.zoomTransform.y / this.zoomTransform.k;

			// The window's viewport is in the opposite direction of zoomTransform
			xPos = -xPos + this.canvasLayout.addCommentOffsetX;
			yPos = -yPos + this.canvasLayout.addCommentOffsetY;
		}

		if (this.config.enableSnapToGridType === SNAP_TO_GRID_DURING ||
				this.config.enableSnapToGridType === SNAP_TO_GRID_AFTER) {
			return this.snapToGridPosition({ x: xPos, y: yPos });
		}
		return { x: xPos, y: yPos };
	}

	// Returns a string that explains which flags are set to true.
	getFlags() {
		let str = "Flags:";
		if (this.dragging) {
			str += " dragging = true";
		}
		if (this.nodeSizing) {
			str += " nodeSizing = true";
		}
		if (this.commentSizing) {
			str += " commentSizing = true";
		}
		if (this.selecting) {
			str += " selecting = true";
		}
		if (this.regionSelect) {
			str += " regionSelect = true";
		}
		if (str === "Flags:") {
			str += " None";
		}
		return str;
	}
}
