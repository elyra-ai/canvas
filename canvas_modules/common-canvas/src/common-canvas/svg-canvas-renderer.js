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

/* eslint no-invalid-this: "off" */
/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

// Import just the D3 modules that are needed.
var d3 = Object.assign({}, require("d3-drag"), require("d3-ease"), require("d3-selection"), require("d3-fetch"), require("./d3-zoom-extension/src"));
import get from "lodash/get";
import set from "lodash/set";
import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import cloneDeep from "lodash/cloneDeep";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK, ERROR,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_CURVE, LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_LEFT_RIGHT, LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP,
	LINK_SELECTION_NONE, LINK_SELECTION_HANDLES, LINK_SELECTION_DETACHABLE,
	WARNING, CONTEXT_MENU_BUTTON, DEC_LINK, DEC_NODE, LEFT_ARROW_ICON, EDIT_ICON,
	NODE_MENU_ICON, SUPER_NODE_EXPAND_ICON, NODE_ERROR_ICON, NODE_WARNING_ICON, PORT_OBJECT_CIRCLE, PORT_OBJECT_IMAGE,
	TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK, INTERACTION_MOUSE, INTERACTION_TRACKPAD, USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON }
	from "./constants/canvas-constants";
import SUPERNODE_ICON from "../../assets/images/supernode.svg";
import SUPERNODE_EXT_ICON from "../../assets/images/supernode_ext.svg";
import Logger from "../logging/canvas-logger.js";
import LocalStorage from "./local-storage.js";
import CanvasUtils from "./common-canvas-utils.js";
import SvgCanvasDisplay from "./svg-canvas-utils-display.js";
import SvgCanvasNodes from "./svg-canvas-utils-nodes.js";
import SvgCanvasLinks from "./svg-canvas-utils-links.js";

const showLinksTime = false;

const BACKSPACE_KEY = 8;
const RETURN_KEY = 13;
const ESC_KEY = 27;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;
const DELETE_KEY = 46;
const A_KEY = 65;

const SCROLL_PADDING = 12;

const NINETY_DEGREES = 90;

const INPUT_TYPE = "input_type";
const OUTPUT_TYPE = "output_type";


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

		// An array of renderers for the supernodes on the canvas.
		this.superRenderers = [];

		// Our instance ID for adding to DOM element IDs
		this.instanceId = this.canvasController.getInstanceId();

		// Get the canvas layout info
		this.canvasLayout = this.objectModel.getCanvasLayout();

		this.dispUtils = new SvgCanvasDisplay(this.canvasController, this.parentSupernodeD3Selection, this.pipelineId);
		this.nodeUtils = new SvgCanvasNodes(this.config, this.canvasLayout);
		this.linkUtils = new SvgCanvasLinks(this.config, this.canvasLayout, this.nodeUtils);

		this.dispUtils.setDisplayState();
		this.logger.log(this.dispUtils.getDisplayStateMsg());

		// Initialize zoom variables
		this.initializeZoomVariables();

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 1.8;

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

		// Allows us to track the editing of text (either comments or node labels)
		this.editingText = false;
		this.editingTextId = "";

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

		// Allow us to track when a selection is being made so there is
		// no need to re-render whole canvas
		this.selecting = false;

		// Allows us to track when the binding nodes in a subflow are being moved.
		this.movingBindingNodes = false;

		// Keep track of when the context menu has been closed so we don't remove
		// selections when a context menu is closed during a zoom gesture.
		this.contextMenuClosedOnZoom = false;

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

		// If we are showing a sub-flow in full screen mode, zoom it to fit the
		// screen so it looks similar to the in-place sub-flow view unless there
		// is a saved zoom for this pipeline.
		if (this.dispUtils.isDisplayingSubFlowFullPage()) {
			if (!this.config.enableSaveZoom ||
					this.config.enableSaveZoom === "None" ||
					(this.config.enableSaveZoom === "LocalStorage" && !this.getSavedZoom()) ||
					(this.config.enableSaveZoom === "Pipelineflow" && !this.activePipeline.zoom)) {
				this.zoomToFit();
			}
		}

		// If we are showing an in-place subflow make sure any already existing
		// port on the parent supernode overlap on top of our SVG area.
		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			this.parentSupernodeD3Selection.selectAll(".d3-node-port-input").raise();
			this.parentSupernodeD3Selection.selectAll(".d3-node-port-output").raise();
		}

		this.logger.logEndTimer("Constructor");
	}

	isCanvasEmptyOrBindingsOnly() {
		return (isEmpty(this.activePipeline.nodes) || this.containsOnlyBindingNodes(this.activePipeline)) &&
						isEmpty(this.activePipeline.comments);
	}

	containsOnlyBindingNodes(pipeline) {
		return !pipeline.nodes.find((node) => !CanvasUtils.isSuperBindingNode(node));
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
			if (!node) {
				node =
					pipeline.nodes.find((n) =>
						this.nodeUtils.isSupernode(n) && this.doesSupernodeRefThis(n));
			}
		});
		return node;
	}

	// Returns true if the supernode passed in references this renderer's active
	// pipeline. If the active pipeline has a url property it will have been
	// loaded from an external source so we need to check if both the
	// the pipeline IDs and the external URLs match. If there's no external URL
	// ID we just check that the pipeline IDs match.
	doesSupernodeRefThis(sn) {
		if (this.activePipeline.parentUrl) {
			return sn.subflow_ref.pipeline_id_ref === this.activePipeline.id &&
				sn.subflow_ref.url === this.activePipeline.parentUrl;
		}
		return sn.subflow_ref.pipeline_id_ref === this.activePipeline.id;
	}

	getSupernodes(pipeline) {
		return pipeline.nodes.filter((node) => this.nodeUtils.isSupernode(node));
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
		this.dispUtils.setDisplayState();
		this.logger.log(this.dispUtils.getDisplayStateMsg());

		// Reset the SVG area's zoom behaviors. We do this in case the canvas has
		// changed from empty (no nodes/comments) where we do not need any zoom
		// behavior to populated (with at least one node or comment) where we do
		// need the zoom behavior, or vice versa.
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

	clearCanvas() {
		this.canvasController.clearSelections();
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

		this.displayComments(); // Show comments first so they appear under nodes, if there is overlap.
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

		if (this.config.enableBoundingRectangles) {
			this.displayBoundingRectangles();
		}

		if (this.config.enableCanvasUnderlay !== "None" && this.dispUtils.isDisplayingPrimaryFlowFullPage()) {
			this.setCanvasUnderlaySize();
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
		this.movingBindingNodes = true;
		this.displayNodes();
		this.displayLinks();
		this.movingBindingNodes = false;
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
			if (this.nodeUtils.isExpanded(supernodeDatum)) {
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

	isEditingText() {
		if (this.editingText) {
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

	getLinkGroupSelectionById(nodeId) {
		const linkGrpSelector = this.getSelectorForId("link_grp", nodeId);
		return this.nodesLinksGrp.selectChildren(linkGrpSelector);
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

		if (this.config.enableSnapToGridType === "During" ||
				this.config.enableSnapToGridType === "After") {
			transPos = this.snapToGridObject(transPos);
		}
		return transPos;
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
		const mousePos = d3.pointer(d3Event, svgSel.node());
		return { x: mousePos[0], y: mousePos[1] };
	}

	// Convert coordinates from the page (based on the page top left corner) to
	// canvas coordinates based on the canvas coordinate system.
	convertPageCoordsToCanvasCoords(x, y) {
		const svgRect = this.canvasSVG.node().getBoundingClientRect();
		return this.transformPos({ x: x - Math.round(svgRect.left), y: y - Math.round(svgRect.top) });
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
		node.width = ghost.width;
		node.height = ghost.height;

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
			.attr("width", ghost.width)
			.attr("height", ghost.height);

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
			.attr("class", this.getNodeLabelForeignClass(node));

		const fObjectDiv = fObject
			.append("xhtml:div")
			.attr("class", this.getNodeLabelClass(node));

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

		// Calculate the zoom amount if the browser itself is zoomed.
		// At the time of writing this value is not returned correctly by Safari.
		const browserZoom = window.devicePixelRatio / 2;

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

	// Highlights any data link, that an 'insertable' nodeTemplate from the
	// palette, is dragged over. The x and y passed in are in page coordinates
	// based on the top left corner of the page.
	nodeTemplateDraggedOver(nodeTemplate, x, y) {
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

		// Offset mousePos so new node appers in center of mouse location.
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
			this.isNonBindingNode(nodeTemplate) &&
			!this.isPortMaxCardinalityZero(nodeTemplate.inputs[0]) &&
			!this.isPortMaxCardinalityZero(nodeTemplate.outputs[0]);
	}

	// Returns true if the current drag objects array has a single node which
	// is 'insertable' into a data link between nodes on the canvas.
	isExistingNodeInsertableIntoLink() {
		return (this.config.enableInsertNodeDroppedOnLink &&
			this.dragObjects.length === 1 &&
			this.isNonBindingNode(this.dragObjects[0]) &&
			!this.nodeUtils.isNodeDefaultPortsCardinalityAtMax(this.dragObjects[0], this.activePipeline.links));
	}

	isExistingNodeAttachableToDetachedLinks() {
		return (this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE &&
			this.dragObjects.length === 1);
	}

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

	getLink(linkId) {
		const link = this.activePipeline.links.find((l) => l.id === linkId);
		return (typeof link === "undefined") ? null : link;
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
		if (this.dispUtils.isDisplayingFullPage()) {
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
		if (this.dispUtils.isDisplayingSubFlowInPlace()) {
			parentObject = this.parentSupernodeD3Selection;
			dims = this.getParentSupernodeSVGDimensions();
		}

		const canvasSVG = parentObject
			.append("svg")
			.attr("class", "svg-area") // svg-area used in tests.
			.attr("width", dims.width)
			.attr("height", dims.height)
			.attr("x", dims.x)
			.attr("y", dims.y)
			.on("mouseenter", (d3Event, d) => {
				// If we are a sub-flow (i.e we have a parent renderer) set the max
				// zoom extent with a factor calculated from our zoom amount.
				if (this.parentRenderer && this.config.enableZoomIntoSubFlows) {
					this.parentRenderer.setMaxZoomExtent(1 / this.zoomTransform.k);
				}
			})
			.on("mouseleave", (d3Event, d) => {
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
		if (!this.isCanvasEmptyOrBindingsOnly() &&
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
				this.selecting = true;
				// Only clear selections if clicked on the canvas of the current active pipeline.
				// Clicking the canvas of an expanded supernode will select that node.
				if (this.dispUtils.isDisplayingCurrentPipeline() && !this.contextMenuClosedOnZoom) {
					this.canvasController.clearSelections();
				}
				this.contextMenuClosedOnZoom = false;
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
			.on("contextmenu.zoom", (d3Event, d) => {
				this.logger.log("Zoom - context menu");
				this.openContextMenu(d3Event, "canvas");
			});
	}

	// Resets the pointer cursor on the background rectangle in the Canvas SVG area.
	resetCanvasCursor() {
		const selector = ".d3-svg-background[data-pipeline-id='" + this.activePipeline.id + "']";
		this.canvasSVG.select(selector).style("cursor", this.getCanvasCursor());
	}

	// Retuens the appropriate cursor for the canvas SVG area.
	getCanvasCursor() {
		if (this.dispUtils.isDisplayingFullPage()) {
			if (this.config.enableInteractionType === INTERACTION_TRACKPAD ||
					this.isCanvasEmptyOrBindingsOnly()) {
				return "default";
			}
			return "grab";
		}
		return "pointer";
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
	// of 'save zoom' specified in the configuration and, if no saved zoom, was
	// provided pans the canvas area so it is always visible.
	restoreZoom() {
		let newZoom = null;

		if (this.config.enableSaveZoom === "Pipelineflow" &&
				this.activePipeline.zoom) {
			newZoom = this.activePipeline.zoom;

		} else if (this.config.enableSaveZoom === "LocalStorage") {
			const savedZoom = this.getSavedZoom();
			if (savedZoom) {
				newZoom = savedZoom;
			}
		}

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
		const viewPortDimensions = this.getViewportDimensions();

		if (canvasDimensions) {
			const xRatio = viewPortDimensions.width / canvasDimensions.width;
			const yRatio = viewPortDimensions.height / canvasDimensions.height;
			const newScale = Math.min(xRatio, yRatio, 1); // Don't let the canvas be scaled more than 1 in either direction

			let x = (viewPortDimensions.width - (canvasDimensions.width * newScale)) / 2;
			let y = (viewPortDimensions.height - (canvasDimensions.height * newScale)) / 2;

			x -= newScale * canvasDimensions.left;
			y -= newScale * canvasDimensions.top;

			this.zoomingToFit = true;
			this.zoomCanvasInvokeZoomBehavior({ x: x, y: y, k: newScale });
			this.zoomingToFit = false;
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

	getZoomToReveal(nodeIDs, xPos, yPos) {
		const transformedSVGRect = this.getTransformedViewportDimensions();
		const nodes = this.getNodes(nodeIDs);
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

		// this.zoomingToFit flag is used to avoid redo actions initialized
		// by Cmd+Shift+Z (where the shift key has been pressed) causing a region
		// selection to start. So whenever it is set, make sure we do a scale
		// operation.
		// Also, below, we must check the d3Event.sourceEvent because for a zoom
		// operation d3Event does not contain info about the shift key.
		if (this.zoomingToFit) {
			this.regionSelect = false;
		} else if ((this.config.enableInteractionType === INTERACTION_TRACKPAD &&
								d3Event.sourceEvent && d3Event.sourceEvent.buttons === 1) || // Main button is pressed
							(this.config.enableInteractionType === INTERACTION_MOUSE &&
								d3Event.sourceEvent && d3Event.sourceEvent.shiftKey)) { // Shift key is pressed
			this.regionSelect = true;
		} else {
			this.regionSelect = false;
		}

		if (this.regionSelect) {
			this.regionStartTransformX = d3Event.transform.x;
			this.regionStartTransformY = d3Event.transform.y;
			const transPos = this.getTransformedMousePos(d3Event);
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
		this.previousD3Event = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k };
		this.zoomCanvasDimensions = CanvasUtils.getCanvasDimensions(
			this.activePipeline.nodes, this.activePipeline.comments,
			this.activePipeline.links, this.canvasLayout.commentHighlightGap);
	}

	zoomAction(d3Event) {
		this.logger.log("zoomAction - " + JSON.stringify(d3Event.transform));

		// If the scale amount is the same we are not zooming, so we must be panning.
		if (d3Event.transform.k === this.zoomStartPoint.k) {
			if (this.regionSelect) {
				this.addTempCursorOverlay("crosshair");
				this.drawRegionSelector(d3Event);

			} else {
				this.addTempCursorOverlay("grabbing");
				this.zoomCanvasBackground(d3Event);
			}
		} else {
			this.zoomCanvasBackground(d3Event);
		}
	}

	zoomEnd(d3Event) {
		this.logger.log("zoomEnd - " + JSON.stringify(d3Event.transform));

		if (this.drawingNewLinkData) {
			this.stopDrawingNewLink();
			this.drawingNewLinkData = null;
		}

		if (this.draggingLinkData) {
			this.stopDraggingLink();
			this.draggingLinkData = null;
		}

		if (d3Event.transform.k === this.zoomStartPoint.k &&
				this.regionSelect === true) {
			this.removeRegionSelector();

			// Reset the transform x and y to what they were before the region
			// selection action was started. This directly sets the x and y values
			// in the __zoom property of the svgCanvas DOM object.
			d3Event.transform.x = this.regionStartTransformX;
			d3Event.transform.y = this.regionStartTransformY;

			// Only select objects if region selector area dimensions are > 5.
			if (Math.abs(this.region.width) > 5 &&
					Math.abs(this.region.height) > 5) {
				var { startX, startY, width, height } = this.getRegionDimensions();
				this.isSelecting = true;
				const region = { x1: startX, y1: startY, x2: startX + width, y2: startY + height };
				const selections =
					CanvasUtils.selectInRegion(region, this.activePipeline, this.config.enableLinkSelection !== LINK_SELECTION_NONE);
				this.canvasController.setSelections(selections, this.activePipeline.id);
			}
			this.regionSelect = false;

		} else if (this.dispUtils.isDisplayingFullPage()) {
			// Set the internal zoom value for canvasSVG used by D3. This will be
			// used by d3Event next time a zoom action is initiated.
			this.canvasSVG.property("__zoom", this.zoomTransform);


			if (this.config.enableSaveZoom === "Pipelineflow") {
				const data = {
					editType: "setPipelineZoom",
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
		const canvasDimensions = CanvasUtils.getCanvasDimensions(
			this.activePipeline.nodes, this.activePipeline.comments,
			this.activePipeline.links, this.canvasLayout.commentHighlightGap);
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
		const transPos = this.getTransformedMousePos(d3Event);
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

	dragStart(d3Event, d) {
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
			if (this.dragObjects && this.dragObjects.length > 0) {
				this.dragStartX = this.dragObjects[0].x_pos;
				this.dragStartY = this.dragObjects[0].y_pos;
			}

			// If we are dragging an 'insertable' node, set it to be translucent so
			// that, when it is dragged over a link line, the highlightd line can be seen OK.
			if (this.isExistingNodeInsertableIntoLink()) {
				this.setNodeTranslucentState(this.dragObjects[0].id, true);
			}

			// If we are dragging an 'attachable' node, set it to be translucent so
			// that, when it is dragged over link lines, the highlightd lines can be seen OK.
			if (this.isExistingNodeAttachableToDetachedLinks()) {
				const mousePos = this.getTransformedMousePos(d3Event);
				this.dragPointerOffsetInNode = {
					x: mousePos.x - this.dragObjects[0].x_pos,
					y: mousePos.y - this.dragObjects[0].y_pos
				};
				this.setNodeTranslucentState(this.dragObjects[0].id, true);
			}
		}
		// Note: Comment and supernode resizing is started by the comment/supernode highlight rectangle.
		this.logger.logEndTimer("dragStart", true);
	}

	dragMove(d3Event) {
		this.logger.logStartTimer("dragMove");
		if (this.commentSizing) {
			this.resizeComment(d3Event);
		} else if (this.nodeSizing) {
			this.resizeNode(d3Event);
		} else {
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
			}

			this.displayCanvas();

			if (this.isExistingNodeInsertableIntoLink()) {
				const link = this.getLinkAtMousePos(d3Event.sourceEvent.clientX, d3Event.sourceEvent.clientY);
				// Set highlighting when there is no link because this will turn
				// current highlighting off. And only switch on highlighting when we are
				// over a fully attached link (not a detached link).
				if (!link || this.isLinkFullyAttached(link)) {
					this.setInsertNodeIntoLinkHighlighting(link);
				}
			}

			if (this.isExistingNodeAttachableToDetachedLinks()) {
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

		this.logger.logEndTimer("dragMove", true);
	}

	dragEnd(d3Event, d) {
		this.logger.logStartTimer("dragEnd");

		this.removeTempCursorOverlay();

		if (this.commentSizing) {
			this.endCommentSizing();

		} else if (this.nodeSizing) {
			this.endNodeSizing();

		} else if (this.dragging) {
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
					} else if (this.isExistingNodeAttachableToDetachedLinks() &&
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
							offsetX: dragFinalOffset.x,
							offsetY: dragFinalOffset.y,
							pipelineId: this.activePipeline.id });
					}
				}
			}

			// Switch of any drag highlighting
			this.setNodeTranslucentState(this.dragObjects[0].id, false);
			this.unsetInsertNodeIntoLinkHighlighting();
			this.unsetDetachedLinkHighlighting();
		}

		this.logger.logEndTimer("dragEnd", true);
	}

	dragStartLinkHandle(d3Event, d) {
		this.logger.logStartTimer("dragStartLinkHandle");

		this.draggingLinkHandle = true;

		const handleSelection = d3.select(d3Event.sourceEvent.currentTarget);
		const link = this.getLink(d.id);
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
					this.getNode(this.draggingLinkData.link.srcNodeId),
					this.draggingLinkData.link.srcNodePortId,
					links
				);
			} else if (this.draggingLinkData.endBeingDragged === "start") {
				const links = this.activePipeline.links.filter((lnk) => lnk.id !== link.id);
				this.setUnavailableSourceNodesHighlighting(
					this.getNode(this.draggingLinkData.oldLink.trgNodeId),
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

		// For any of these activities we don't need to do anything to the nodes.
		if (this.canvasController.isTipOpening() || this.canvasController.isTipClosing() || this.commentSizing) {
			this.logger.logEndTimer("displayNodes " + this.getFlags());
			return;

		} else if ((this.dragging && !this.nodeSizing && !this.commentSizing) || this.movingBindingNodes) {
			this.displayMovedNodes();

		} else if (this.selecting || this.regionSelect) {
			this.displayNodesSelectionStatus();

		} else {
			this.displayAllNodes();
		}
		this.logger.logEndTimer("displayNodes " + this.getFlags());
	}

	displayMovedNodes() {
		// Set the port positions for all ports - these will be needed when displaying
		// nodes and links. This needs to be done here because resizing the supernode
		// will cause its ports to move.
		this.setPortPositionsAllNodes();

		const nodeGroupSel = this.getAllNodeGroupsSelection();

		nodeGroupSel
			.datum((d) => this.getNode(d.id))
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
		// Set the port positions for all ports - these will be needed when displaying
		// nodes and links. This needs to be done here because a resized supernode
		// will cause its ports to move.
		this.setPortPositionsAllNodes();

		this.getAllNodeGroupsSelection()
			.data(this.activePipeline.nodes, (d) => d.id)
			.join(
				(enter) => this.createNodes(enter)
			)
			.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
			.attr("class", (d) => this.getNodeGroupClass(d))
			.attr("style", (d) => this.getNodeGrpStyle(d))
			.call((joinedNodeGrps) => this.updateNodes(joinedNodeGrps));
	}

	createNodes(enter) {
		const newNodeGroups = enter
			.append("g")
			.attr("data-id", (d) => this.getId("node_grp", d.id))
			.call(this.attachNodeGroupListeners.bind(this))
			.call(this.drag); // Must put drag after mousedown listener so mousedown gets called first.

		// Node Sizing Area.
		newNodeGroups.filter((d) => this.nodeUtils.isSupernode(d))
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
					.attr("class", (d) => this.getNodeImageClass(d));
			});

		// Node Label
		newNodeGroups.filter((d) => !CanvasUtils.isSuperBindingNode(d))
			.append("foreignObject")
			.attr("class", "d3-foreign-object")
			.call(this.attachNodeLabelListeners.bind(this))
			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.append("xhtml:span") // Provide a namespace when span is inside foreignObject
			.call(this.attachNodeLabelSpanListeners.bind(this));

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
				.on("mousedown", (d3Event, d) => {
					this.logger.log("Halo - mouse down");
					d3Event.stopPropagation();
					this.drawingNewLinkData = {
						srcObjId: d.id,
						action: this.config.enableAssocLinkCreation ? ASSOCIATION_LINK : NODE_LINK,
						startPos: this.getTransformedMousePos(d3Event),
						linkArray: []
					};
					this.drawNewLink(d3Event);
				});
		}

		return newNodeGroups;
	}

	updateNodes(joinedNodeGrps) {
		// Node Sizing Area
		joinedNodeGrps.selectChildren(".d3-node-sizing")
			.datum((d) => this.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePathSizing(d));

		// Node Selection Highlighting Outline.
		joinedNodeGrps.selectChildren(".d3-node-selection-highlight")
			.datum((d) => this.getNode(d.id))
			.attr("d", (d) => this.getNodeSelectionOutline(d))
			.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Node Body
		joinedNodeGrps.selectChildren(".d3-node-body-outline")
			.datum((d) => this.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePath(d))
			.attr("style", (d) => this.getNodeBodyStyle(d, "default"));

		// Node Image
		joinedNodeGrps.selectChildren(".d3-node-image")
			.datum((d) => this.getNode(d.id))
			.each((d, i, nodeGrps) => this.setNodeImageContent(nodeGrps[i], d))
			.attr("x", (d) => this.nodeUtils.getNodeImagePosX(d))
			.attr("y", (d) => this.nodeUtils.getNodeImagePosY(d))
			.attr("width", (d) => this.nodeUtils.getNodeImageWidth(d))
			.attr("height", (d) => this.nodeUtils.getNodeImageHeight(d))
			.attr("style", (d) => this.getNodeImageStyle(d, "default"));

		// Node Label
		joinedNodeGrps.selectChildren(".d3-foreign-object")
			.datum((d) => this.getNode(d.id))
			.attr("x", (d) => this.nodeUtils.getNodeLabelPosX(d))
			.attr("y", (d) => this.nodeUtils.getNodeLabelPosY(d))
			.attr("width", (d) => this.nodeUtils.getNodeLabelWidth(d))
			.attr("height", (d) => this.nodeUtils.getNodeLabelHeight(d))
			.attr("class", (d) => this.getNodeLabelForeignClass(d))
			.select("div")
			.attr("class", (d) => this.getNodeLabelClass(d))
			.attr("style", (d) => this.getNodeLabelStyle(d, "default"))
			.select("span")
			.html((d) => d.label);

		// Node Ellipsis Icon - if one exists
		joinedNodeGrps.selectChildren(".d3-node-ellipsis-group")
			.attr("transform", (d) => this.nodeUtils.getNodeEllipsisTranslate(d));

		// Node (Supernode) Expansion Icon - if one exists
		joinedNodeGrps.selectChildren(".d3-node-super-expand-icon-group")
			.attr("transform", (d) => this.nodeUtils.getNodeExpansionIconTranslate(d));

		// Supernode sub-flow display
		joinedNodeGrps.each((d, index, grps) => {
			const nodeGrp = d3.select(grps[index]);

			if (this.canvasLayout.connectionType === "ports") {
				this.displayPorts(nodeGrp, d);
			}

			if (this.nodeUtils.isSupernode(d)) {
				let ren = this.getRendererForSupernode(d);

				if (!ren && this.nodeUtils.isExpanded(d)) {
					ren = this.createSupernodeRenderer(d, d3.select(grps[index]));
				}
				if (ren) {
					if (this.nodeUtils.isExpanded(d)) {
						ren.displayCanvas();
					} else {
						ren.hideCanvas(d);
					}
				}
			}

			if (!CanvasUtils.isSuperBindingNode(d)) {
				// Display error indicator
				this.addErrorMarker(d, nodeGrp);

				// Display Decorators
				const decorations = CanvasUtils.getCombinedDecorations(d.layout.decorations, d.decorations);
				this.displayDecorations(d, DEC_NODE, nodeGrp, decorations);
			}
		});
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
			.attr("connected", "no") // Display-links code will set this to "yes" if necessary.
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

		nodeGrp.selectChildren(outSelector)
			.data(node.outputs, (p) => p.id)
			.join(
				(enter) => this.createOutputPorts(enter, node)
			)
			.attr("connected", "no") // Display-links code will set this to "yes" if necessary.
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
				this.logger.log("Node Group - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Node Group - finished mouse down");
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
				if (this.nodeUtils.isExpandedSupernode(d)) {
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
			.on("mousemove mouseenter", (d3Event, d) => {
				if (this.nodeUtils.isExpandedSupernode(d) &&
						!this.isRegionSelectOrSizingInProgress()) { // Don't switch sizing direction if we are already sizing
					let cursorType = "pointer";
					if (!this.isPointerCloseToBodyEdge(d3Event, d)) {
						this.nodeSizingDirection = this.getSizingDirection(d3Event, d, d.layout.nodeCornerResizeArea);
						this.nodeSizingCursor = this.getCursorBasedOnDirection(this.nodeSizingDirection);
						cursorType = this.nodeSizingCursor;
					}
					d3.select(d3Event.currentTarget).style("cursor", cursorType);
				}
			});
	}

	attachNodeLabelListeners(nodeLabels) {
		nodeLabels
			.on("mouseenter", (d3Event, d) => {
				const labelSel = d3.select(d3Event.currentTarget);
				if (this.config.enableDisplayFullLabelOnHover && !this.nodeUtils.isExpandedSupernode(d)) {
					const spanSel = labelSel.selectAll("span");
					labelSel
						.attr("x", this.nodeUtils.getNodeLabelHoverPosX(d))
						.attr("width", this.nodeUtils.getNodeLabelHoverWidth(d))
						.attr("height", this.nodeUtils.getNodeLabelHoverHeight(d, spanSel.node(), this.zoomTransform.k));
					spanSel.classed("d3-node-label-full", true);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				const labelSel = d3.select(d3Event.currentTarget);
				if (this.config.enableDisplayFullLabelOnHover && !this.nodeUtils.isExpandedSupernode(d)) {
					labelSel
						.attr("x", this.nodeUtils.getNodeLabelPosX(d))
						.attr("width", this.nodeUtils.getNodeLabelWidth(d))
						.attr("height", this.nodeUtils.getNodeLabelHeight(d));
					labelSel.selectAll("span").classed("d3-node-label-full", false);
				}
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Node Label - double click");
				if (d.layout.labelEditable) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					this.displayNodeLabelTextArea(d, d3Event.currentTarget.parentNode);
				}
			});
	}

	attachNodeLabelSpanListeners(nodeLabelSpans) {
		nodeLabelSpans
			.on("mouseenter", (d3Event, d) => {
				if (d.layout.labelEditable) {
					this.displayEditIcon(d3Event.currentTarget, d);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				if (d.layout.labelEditable) {
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
						const srcNode = this.getNode(node.id);
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
					const srcNode = this.getNode(node.id);
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

	displayEditIcon(spanObj, node) {
		const that = this;
		const labelObj = spanObj.parentElement;
		const foreignObj = labelObj.parentElement;
		const nodeObj = foreignObj.parentElement;
		const nodeGrpSel = d3.select(nodeObj);

		const editIconGrpSel = nodeGrpSel.append("g")
			.attr("class", "d3-node-label-edit-icon-group")
			.attr("transform", (nd) =>
				this.nodeUtils.getNodeLabelEditIconTranslate(nd, spanObj,
					this.zoomTransform.k, this.config.enableDisplayFullLabelOnHover))
			.on("mouseenter", function(d3Event, d) {
				that.mouseOverLabelEditIcon = true;
			})
			.on("mouseleave", function(d3Event, d) {
				that.mouseOverLabelEditIcon = false;
				that.hideEditIcon(this);
			})
			.on("click", function(d3Event, d) {
				that.displayNodeLabelTextArea(d, d3Event.currentTarget.parentNode);
				that.mouseOverLabelEditIcon = false;
				that.hideEditIcon(this);
			});

		const EDIT_ICON_X_OFFSET = 5;
		const EDIT_ICON_Y_OFFSET = -4;
		const EDIT_ICON_POS_X = 4;
		const EDIT_ICON_POS_Y = 4;

		editIconGrpSel
			.append("rect")
			.attr("class", "d3-node-label-edit-icon-background1")
			.attr("width", 24 + EDIT_ICON_X_OFFSET)
			.attr("height", 24)
			.attr("x", 0)
			.attr("y", EDIT_ICON_Y_OFFSET);

		editIconGrpSel
			.append("rect")
			.attr("class", "d3-node-label-edit-icon-background2")
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
			nodeGrpSel.selectAll(".d3-node-label-edit-icon-group").remove();
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
		const objectTypeName = this.getObjectTypeName(d);
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

	// Returns the name of the type of object d.
	getObjectTypeName(d) {
		if (this.getComment(d.id)) {
			return "comment";
		} else if (this.getNode(d.id)) {
			return "node";
		}
		return "link";
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
			.attr("transform", (dec) => `translate(${this.getDecoratorX(dec, d, objType)}, ${this.getDecoratorY(dec, d, objType)})`)
			.on("mousedown", (d3Event, dec) => (dec.hotspot ? that.callDecoratorCallback(d3Event, d, dec) : null))
			.each((dec, i, elements) => this.updateDecoration(dec, d3.select(elements[i]), objType, d));
	}

	createDecorations(enter, objType, decGrpClassName) {
		const newDecGroups = enter
			.append("g")
			.attr("data-id", (dec) => this.getId(`${objType}_dec_group`, dec.id)) // Used in tests
			.attr("class", decGrpClassName);

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
				.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-outline`))
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", this.getDecoratorWidth(dec, d, objType))
				.attr("height", this.getDecoratorHeight(dec, d, objType))
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
				.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-path`))
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
				.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-image`))
				.attr("x", this.getDecoratorPadding(dec, d, objType))
				.attr("y", this.getDecoratorPadding(dec, d, objType))
				.attr("width", this.getDecoratorWidth(dec, d, objType) - (2 * this.getDecoratorPadding(dec, d, objType)))
				.attr("height", this.getDecoratorHeight(dec, d, objType) - (2 * this.getDecoratorPadding(dec, d, objType)))
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
					.attr("class", "d3-foreign-object")
					.attr("x", 0)
					.attr("y", 0);
				labelSel
					.append("xhtml:div");
			}
			labelSel
				.attr("width", this.getDecoratorLabelWidth(dec, d, objType))
				.attr("height", this.getDecoratorLabelHeight(dec, d, objType))
				.select("div")
				.attr("class", this.getDecoratorClass(dec, `d3-${objType}-dec-label`))
				.html(dec.label);
		} else {
			labelSel.remove();
		}
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
				.attr("class", () => "node-error-marker " + this.getErrorMarkerClass(d.messages))
				.html(this.getErrorMarkerIcon(d))
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
			if (this.nodeUtils.isSupernode(d)) {
				return SUPERNODE_ICON;
			}
		} else if (d.image === USE_DEFAULT_EXT_ICON) {
			if (this.nodeUtils.isSupernode(d)) {
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
		if (this.nodeUtils.isExpandedSupernode(d) && d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			const subflow = this.getPipeline(d.subflow_ref.pipeline_id_ref);
			const nodeGrp = subflow.nodes;
			nodeGrp.forEach((node) => {
				if (node.style || node.style_temp) {
					expandedSupernodeHaveStyledNodes = true;
					return;
				} else if (!expandedSupernodeHaveStyledNodes && this.nodeUtils.isExpandedSupernode(node)) {
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
					this.openContextMenu(d3Event, "node", d);
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
			if (this.nodeUtils.isExpandedSupernode(d)) {
				const expGrp = nodeGrp
					.append("g")
					.attr("transform", (nd) => this.nodeUtils.getNodeExpansionIconTranslate(nd))
					.attr("class", "d3-node-super-expand-icon-group")
					.on("mousedown", (d3Event) => {
						CanvasUtils.stopPropagationAndPreventDefault(d3Event);
						this.canvasController.displaySubPipeline(d);
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

	updateBindingNodeInputPort(nodeGrpObj, d) {
		const nodeGrp = d3.select(nodeGrpObj);
		nodeGrp
			.selectChildren("." + this.getNodeInputPortClassName())
			.attr("transform", (port) => `translate(${port.cx}, ${port.cy}) scale(${this.zoomTransform.k})`); // Port position may change for binding nodes with multiple-ports.
	}

	updateBindingNodeOutputPort(nodeGrpObj, d) {
		const nodeGrp = d3.select(nodeGrpObj);
		nodeGrp
			.selectChildren("." + this.getNodeOutputPortClassName())
			.attr("transform", (port) => `translate(${port.cx}, ${port.cy}) scale(${this.zoomTransform.k})`); // Port position may change for binding nodes with multiple-ports.
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
				this,
				supernodeD3Object);
			this.superRenderers.push(superRenderer);
			return superRenderer;
		}
		return null;
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

	indexOfRendererForSupernode(d) {
		// We assume that there cannot be more than one renderer for the
		// same sub-flow pipeline
		return this.superRenderers.findIndex((sr) => sr.pipelineId === d.subflow_ref.pipeline_id_ref);
	}

	getNodeImageClass(node) {
		return "d3-node-image";
	}

	getNodeLabelForeignClass(node) {
		const outlineClass = node.layout.labelOutline ? " d3-node-label-outline" : "";
		return "d3-foreign-object" + outlineClass;
	}

	getNodeLabelClass(node) {
		if (this.nodeUtils.isExpandedSupernode(node)) {
			return "d3-node-label d3-node-label-single-line " + this.getMessageLabelClass(node.messages);
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-node-label-single-line" : " d3-node-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-node-label-middle" : "";
		return "d3-node-label " + this.getMessageLabelClass(node.messages) + lineTypeClass + justificationClass;
	}

	getNodeLabelTextAreaClass(node) {
		if (this.nodeUtils.isExpandedSupernode(node)) {
			return "d3-node-label-entry d3-node-label-single-line";
		}
		const lineTypeClass = node.layout.labelSingleLine ? " d3-node-label-single-line" : " d3-node-label-multi-line";
		const justificationClass = node.layout.labelAlign === "center" ? " d3-node-label-middle" : "";
		return "d3-node-label-entry" + lineTypeClass + justificationClass;
	}

	openContextMenu(d3Event, type, d, port) {
		CanvasUtils.stopPropagationAndPreventDefault(d3Event); // Stop the browser context menu appearing
		this.canvasController.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			pipelineId: this.activePipeline.id,
			cmPos: this.getMousePos(d3Event, this.canvasDiv.selectAll("svg")), // Get mouse pos relative to top most SVG area even in a subflow.
			mousePos: this.getMousePosSnapToGrid(this.getTransformedMousePos(d3Event)),
			selectedObjectIds: this.objectModel.getSelectedObjectIds(),
			port: port,
			zoom: this.zoomTransform.k });
	}

	setPortStatus(nodeId, portId, newStatus) {
		this.getNodeGroupSelectionById(nodeId)
			.selectChildren(`[data-port-id='${portId}']`)
			.attr("connected", newStatus);
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

		// 'angle' will only be available when displaying straight link lines so
		//  distance field is only applicable with straight lines.
		// 'angle' may be 0 so use has to check that it is not undefined.
		if (dec.distance && has(link, "pathInfo.angle")) {
			x += Math.cos(link.pathInfo.angle) * dec.distance;
		}
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

		// 'angle' will only be available when displaying straight link lines so
		// distance field is only applicable with straight lines.
		// 'angle' may be 0 so use has to check that it is not undefined.
		if (dec.distance && has(link, "pathInfo.angle")) {
			y += Math.sin(link.pathInfo.angle) * dec.distance;
		}

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

	getDecoratorLabelWidth(dec, obj, objType) {
		if (typeof dec.width !== "undefined") {
			return Number(dec.width);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorLabelWidth;
		}
		return obj.layout.decoratorLabelWidth;
	}

	getDecoratorLabelHeight(dec, obj, objType) {
		if (typeof dec.height !== "undefined") {
			return Number(dec.height);
		} else if (objType === DEC_LINK) {
			return this.canvasLayout.linkDecoratorLabelHeight;
		}
		return obj.layout.decoratorLabelHeight;
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
			return dec.image;
		}
		return "";
	}

	callDecoratorCallback(d3Event, node, dec) {
		d3Event.stopPropagation();
		if (this.canvasController.decorationActionHandler) {
			this.canvasController.decorationActionHandler(node, dec.id, this.activePipeline.id);
		}
	}

	drawNewLink(d3Event) {
		const transPos = this.getTransformedMousePos(d3Event);

		if (this.canvasLayout.connectionType === "halo") {
			this.drawNewLinkForHalo(transPos);
		} else {
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
	}

	drawNewLinkForHalo(transPos) {
		this.removeNewLink();
		this.nodesLinksGrp
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
				this.getNewLinkAssocVariation(
					this.drawingNewLinkData.linkArray[0].x1,
					this.drawingNewLinkData.linkArray[0].x2,
					this.drawingNewLinkData.portType);
		}

		const pathInfo = this.linkUtils.getConnectorPathInfo(this.drawingNewLinkData.linkArray[0], this.drawingNewLinkData.minInitialLine);

		const connectionLineSel = this.nodesLinksGrp.selectAll(".d3-new-connection-line");
		const connectionStartSel = this.nodesLinksGrp.selectAll(".d3-new-connection-start");
		const connectionGuideSel = this.nodesLinksGrp.selectAll(".d3-new-connection-guide");

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
			const adjacent = d.x2 - d.x1;
			const opposite = d.y2 - d.y1;
			angle = Math.atan(opposite / adjacent) * (180 / Math.PI);
			angle = adjacent >= 0 ? angle : angle + 180;
			return `rotate(${angle},${d.x2},${d.y2})`;
		}
		return null;
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
				const srcNode = this.getNode(this.drawingNewLinkData.srcObjId);
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
				const srcNode = this.getNode(this.drawingNewLinkData.srcObjId);

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
		if (this.canvasLayout.connectionType === "halo") {
			this.nodesLinksGrp.selectAll(".d3-new-halo-connection").remove();
		} else {
			this.nodesLinksGrp.selectAll(".d3-new-connection-line").remove();
			this.nodesLinksGrp.selectAll(".d3-new-connection-start").remove();
			this.nodesLinksGrp.selectAll(".d3-new-connection-guide").remove();
			this.nodesLinksGrp.selectAll(".d3-new-connection-arrow").remove();
		}
	}

	dragLinkHandle(d3Event) {
		const transPos = this.getTransformedMousePos(d3Event);
		const link = this.draggingLinkData.link;

		if (this.draggingLinkData.endBeingDragged === "start") {
			link.srcPos = { x_pos: transPos.x, y_pos: transPos.y };
			delete link.srcNodeId;
			delete link.srcNodePortId;

		} else {
			link.trgPos = { x_pos: transPos.x, y_pos: transPos.y };
			delete link.trgNodeId;
			delete link.trgNodePortId;
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
			this.restoreLink(this.draggingLinkData.oldLink);
			this.displayLinks();
		}

		// Switch 'new link over node' highlighting off
		if (this.config.enableHighlightNodeOnNewLinkDrag) {
			this.setNewLinkOverNodeCancel();
		}

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

	// Restores the link in the links array with the one passd in.
	restoreLink(oldLink) {
		const index = this.activePipeline.links.findIndex((l) => l.id === oldLink.id);
		this.activePipeline.links.splice(index, 1, oldLink);
	}

	// Returns true if the update command for a dragged link can be executed.
	// It might be prevented from executing if either the course
	canExecuteUpdateLinkCommand(newLink, oldLink) {
		const srcNode = this.getNode(newLink.srcNodeId);
		const trgNode = this.getNode(newLink.trgNodeId);
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
		const element = this.getLinkElementAtMousePos(x, y);
		const link = this.getNodeLinkForElement(element);
		return link;
	}

	// Returns a link DOM element, if one can be found, at the
	// position indicated by x and y coordinates.
	getLinkElementAtMousePos(x, y) {
		this.setDataLinkSelectionAreaWider(true);
		const element = this.getElementWithClassAtPosition(x, y, "d3-data-link");
		this.setDataLinkSelectionAreaWider(false);
		return element;
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeLinkForElement(element) {
		if (element) {
			const datum = d3.select(element).datum();
			if (datum) {
				var foundLink = this.getLink(datum.id, this.pipelineId);
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

	// Returns an element, with the class name passed in, if one exists, at the
	// position defined by x,y.
	getElementAtPoint(x, y, className) {
		const elements = document.elementsFromPoint(x, y);
		return elements.find((el) => this.isClassNameIncluded(el, className));
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
			foundElement = this.getParentElementWithClass(elements[count], className);
			count++;
		}
		return foundElement;
	}

	// Returns the element passed in, or an ancestor of the element, if either
	// contains the classNames passed in. Otherwise it returns null if the
	// className cannot be found. For example, if this element is a child of the
	// node group object and "d3-node-group" is passed in, this function will
	// find the group element.
	getParentElementWithClass(element, className) {
		let el = element;
		let foundElement = null;

		while (el) {
			// No need to proceed if we find either of these. Stopping at svg-area
			// prevents the search transitioning from a sub-flow to a parent flow.
			if (this.isClassNameIncluded(el, ".d3-new-connection-guide") ||
					this.isClassNameIncluded(el, ".svg-area")) {
				el = null;

			} else if (this.isClassNameIncluded(el, className)) {
				foundElement = el;
				el = null;
			} else {
				el = el.parentNode;
			}
		}
		return foundElement;
	}

	// Returns true if the class name passed in is one of the classes assigned
	// to the element passed in.
	isClassNameIncluded(el, className) {
		return el.classList && el.classList.contains(className);
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeForElement(element) {
		if (element && element.nodeName === "g") {
			const datum = d3.select(element).datum();
			if (datum) {
				return this.getNode(datum.id);
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
		if (this.canvasLayout.connectionType === "halo") {
			return null;
		}

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
						portId = this.getAttribute("data-port-id");
					}
				} else { // Port must be a circle
					const cx = node.x_pos + Number(portSel.attr("cx"));
					const cy = node.y_pos + Number(portSel.attr("cy"));
					if (pos.x >= cx - node.layout.portRadius && // Target port sticks out by its radius so need to allow for it.
							pos.x <= cx + node.layout.portRadius &&
							pos.y >= cy - node.layout.portRadius &&
							pos.y <= cy + node.layout.portRadius) {
						portId = this.getAttribute("data-port-id");
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
		if (data.layout.selectionPath && !this.nodeUtils.isExpanded(data)) {
			return data.layout.selectionPath;

		} else if (data.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data); // Port-arc outline does not have a highlight gap

		}
		return this.getRectangleNodeShapePath(data, data.layout.nodeHighlightGap);
	}

	// Returns a path string that will draw the body shape of the node.
	getNodeShapePath(data) {
		if (data.layout.bodyPath && !this.nodeUtils.isExpanded(data)) {
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

				if (this.nodeUtils.isExpandedSupernode(data)) {
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

	setPortPositionsLeftRight(data, ports, portsHeight, xPos, yPos) {
		if (ports && ports.length > 0) {
			if (data.height <= data.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
			} else {
				let yPosition = 0;

				if (this.nodeUtils.isExpandedSupernode(data)) {
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
		}
	}

	displayComments() {
		this.logger.logStartTimer("displayComments " + this.getFlags());

		if (this.canvasController.isTipOpening() || this.canvasController.isTipClosing() || this.nodeSizing) {
			this.logger.logEndTimer("displayComments " + this.getFlags());
			return;

		} else if (this.dragging && !this.commentSizing && !this.nodeSizing && !this.isCommentBeingUpdated) {
			this.displayMovedComments();

		} else if (this.selecting || this.regionSelect) {
			this.displayCommentsSelectionStatus();

		} else {
			this.displayAllComments();
		}

		this.logger.logEndTimer("displayComments " + this.getFlags());
	}

	displayMovedComments() {
		this.getAllCommentGroupsSelection()
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.datum((d) => this.getComment(d.id));
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

	displayAllComments() {
		this.getAllCommentGroupsSelection()
			.data(this.activePipeline.comments, (c) => c.id)
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
			.call(this.attachCommentGroupListeners.bind(this))
			.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

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
			.attr("class", "d3-foreign-object")
			.attr("x", 0)
			.attr("y", 0)
			.append("xhtml:div") // Provide a namespace when div is inside foreignObject
			.attr("class", "d3-comment-text");

		// Halo
		if (this.canvasLayout.connectionType === "halo") {
			newCommentGroups
				.append("rect")
				.attr("class", "d3-comment-halo")
				.on("mousedown", (d3Event, d) => {
					this.logger.log("Comment Halo - mouse down");
					d3Event.stopPropagation();
					this.drawingNewLinkData = {
						srcObjId: d.id,
						action: COMMENT_LINK,
						startPos: this.getTransformedMousePos(d3Event),
						linkArray: []
					};
					this.drawNewLink(d3Event);
				});
		}
		return newCommentGroups;
	}

	updateComments(joinedCommentGrps) {
		joinedCommentGrps
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.attr("class", (c) => this.getCommentGroupClass(c));

		// Comment Sizing Area
		joinedCommentGrps.selectChildren(".d3-comment-sizing")
			.datum((c) => this.getComment(c.id))
			.attr("x", -this.canvasLayout.commentSizingArea)
			.attr("y", -this.canvasLayout.commentSizingArea)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentSizingArea))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentSizingArea))
			.attr("class", "d3-comment-sizing");

		// Comment Selection Highlighting Outline
		joinedCommentGrps.selectChildren(".d3-comment-selection-highlight")
			.datum((c) => this.getComment(c.id))
			.attr("x", -this.canvasLayout.commentHighlightGap)
			.attr("y", -this.canvasLayout.commentHighlightGap)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentHighlightGap))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentHighlightGap))
			.attr("data-selected", (c) => (this.objectModel.isSelected(c.id, this.activePipeline.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Comment Body
		joinedCommentGrps.selectChildren(".d3-comment-rect")
			.datum((c) => this.getComment(c.id))
			.attr("height", (c) => c.height)
			.attr("width", (c) => c.width)
			.attr("class", "d3-comment-rect")
			.attr("style", (c) => this.getCommentBodyStyle(c, "default"));

		// Comment Text
		joinedCommentGrps.selectChildren(".d3-foreign-object")
			.datum((c) => this.getComment(c.id))
			.attr("width", (c) => c.width)
			.attr("height", (c) => c.height)
			.select("div")
			.attr("style", (c) => this.getNodeLabelStyle(c, "default"))
			.html((c) => c.content);

		// Comment halo
		// We need to dynamically set size of the halo here because the size
		// of the text object maye be changed by the user.
		if (this.canvasLayout.connectionType === "halo") {
			joinedCommentGrps.selectChildren(".d3-comment-halo")
				.datum((c) => this.getComment(c.id))
				.attr("x", 0 - this.canvasLayout.haloCommentGap)
				.attr("y", 0 - this.canvasLayout.haloCommentGap)
				.attr("width", (c) => c.width + (2 * this.canvasLayout.haloCommentGap))
				.attr("height", (c) => c.height + (2 * this.canvasLayout.haloCommentGap));
		}
	}

	// Attaches the appropriate listeners to the comment groups.
	attachCommentGroupListeners(commentGrps) {
		commentGrps
			.on("mouseenter", (d3Event, d) => {
				this.setCommentStyles(d, "hover", d3.select(d3Event.currentTarget));
				if (this.canvasLayout.connectionType === "ports") {
					this.createCommentPort(d3Event.currentTarget, d);
				}
			})
			.on("mouseleave", (d3Event, d) => {
				this.setCommentStyles(d, "default", d3.select(d3Event.currentTarget));
				if (this.canvasLayout.connectionType === "ports") {
					this.deleteCommentPort(d3Event.currentTarget);
				}
			})
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Comment Group - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Comment Group - finished mouse down");
			})
			.on("click", (d3Event, d) => {
				this.logger.log("Comment Group - click");
				d3Event.stopPropagation();
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Comment Group - double click");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);

				this.displayCommentTextArea(d, d3Event.currentTarget);

				this.canvasController.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "comment",
					id: d.id,
					selectedObjectIds: this.objectModel.getSelectedObjectIds(),
					pipelineId: this.activePipeline.id });
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
			.on("mousemove mouseenter", (d3Event, d) => {
				if (!this.isRegionSelectOrSizingInProgress()) // Don't switch sizing direction if we are already sizing
				{
					let cursorType = "pointer";
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
			.attr("cx", 0 - this.canvasLayout.commentHighlightGap)
			.attr("cy", 0 - this.canvasLayout.commentHighlightGap)
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
		comGrp.selectChildren(".d3-foreign-object").select("div")
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

	displayCommentTextArea(d, parentObj) {
		this.displayTextArea({
			id: d.id,
			text: d.content,
			singleLine: false,
			maxCharacters: null,
			allowReturnKey: true,
			textCanBeEmpty: true,
			xPos: 0,
			yPos: 0,
			width: d.width,
			height: d.height,
			className: "d3-comment-entry",
			parentObj: parentObj,
			autoSizeCallback: this.autoSizeComment.bind(this),
			saveTextChangesCallback: this.saveCommentChanges.bind(this),
			closeTextAreaCallback: null
		});
	}

	autoSizeComment(textArea, foreignObject, data) {
		this.logger.log("autoSizeComment - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);

		const scrollHeight = textArea.scrollHeight + SCROLL_PADDING;
		if (this.textAreaHeight < scrollHeight) {
			this.textAreaHeight = scrollHeight;
			foreignObject.style("height", this.textAreaHeight + "px");
			this.getComment(data.id).height = this.textAreaHeight;
			this.displayComments();
			this.displayLinks();
		}
	}

	saveCommentChanges(id, newText, newHeight) {
		const comment = this.getComment(id);
		const data = {
			editType: "editComment",
			editSource: "canvas",
			id: comment.id,
			content: newText,
			width: comment.width,
			height: newHeight,
			x_pos: comment.x_pos,
			y_pos: comment.y_pos,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	displayNodeLabelTextArea(node, parentObj) {
		d3.select(parentObj).selectAll("div")
			.attr("style", "display:none;");
		this.displayTextArea({
			id: node.id,
			text: node.label,
			singleLine: node.layout.labelSingleLine,
			maxCharacters: node.layout.labelMaxCharacters,
			allowReturnKey: node.layout.labelAllowReturnKey,
			textCanBeEmpty: false,
			xPos: this.nodeUtils.getNodeLabelTextAreaPosX(node),
			yPos: this.nodeUtils.getNodeLabelTextAreaPosY(node),
			width: this.nodeUtils.getNodeLabelTextAreaWidth(node),
			height: this.nodeUtils.getNodeLabelTextAreaHeight(node),
			className: this.getNodeLabelTextAreaClass(node),
			parentObj: parentObj,
			autoSizeCallback: this.autoSizeNodeLabel.bind(this),
			saveTextChangesCallback: this.saveNodeLabelChanges.bind(this),
			closeTextAreaCallback: this.closeNodeLabelTextArea.bind(this)
		});
	}

	autoSizeNodeLabel(textArea, foreignObject, data) {
		this.logger.log("autoSizeNodeLabel - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);

		// Restrict max characters in case text was pasted in to the text area.
		if (data.maxCharacters &&
				textArea.value.length > data.maxCharacters) {
			textArea.value = textArea.value.substring(0, data.maxCharacters);
		}
		// Temporarily set the height to zero so the scrollHeight will get set to
		// the full height of the text in the textarea. This allows us to close up
		// the text area when the lines of text reduce.
		foreignObject.style("height", 0);
		const scrollHeight = textArea.scrollHeight + SCROLL_PADDING;
		this.textAreaHeight = scrollHeight;
		foreignObject.style("height", this.textAreaHeight + "px");
	}

	saveNodeLabelChanges(id, newText, newHeight) {
		const data = {
			editType: "setNodeLabel",
			editSource: "canvas",
			nodeId: id,
			label: newText,
			pipelineId: this.activePipeline.id
		};
		this.canvasController.editActionHandler(data);
	}

	// Called when the node label text area is closed. Sets the style of the
	// div for the node label so the label is displayed (because it was hidden
	// when the text area opened).
	closeNodeLabelTextArea(nodeId) {
		this.getNodeGroupSelectionById(nodeId)
			.selectAll("div")
			.attr("style", null);
	}

	displayTextArea(data) {
		const that = this;

		this.textAreaHeight = data.height; // Save for comparison during auto-resize
		this.editingText = true;
		this.editingTextId = data.id;

		const foreignObject = d3.select(data.parentObj)
			.append("foreignObject")
			.attr("class", "d3-foreign-object")
			.attr("width", data.width)
			.attr("height", data.height)
			.attr("x", data.xPos)
			.attr("y", data.yPos);

		const textArea = foreignObject
			.append("xhtml:textarea")
			.attr("class", data.className)
			.text(data.text)
			.on("keydown", function(d3Event) {
				// Don't accept return key press when text is all on one line or
				// if application doesn't want line feeds inserted in the label.
				if ((data.singleLine || !data.allowReturnKey) &&
						d3Event.keyCode === RETURN_KEY) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				}
				if (d3Event.keyCode === ESC_KEY) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					that.textAreaEscKeyPressed = true;
					that.closeTextArea(foreignObject, data);
				}
				if (data.maxCharacters &&
						this.value.length >= data.maxCharacters &&
						!that.textAreaAllowedKeys(d3Event)) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				}
			})
			.on("keyup", function(d3Event) {
				data.autoSizeCallback(this, foreignObject, data);
			})
			.on("paste", function() {
				that.logger.log("Text area - Paste - Scroll Ht = " + this.scrollHeight);
				// Allow some time for pasted text (from context menu) to be
				// loaded into the text area. Otherwise the text is not there
				// and the auto size does not increase the height correctly.
				setTimeout(data.autoSizeCallback, 500, this, foreignObject, data);
			})
			.on("blur", function(d3Event, d) {
				that.logger.log("Text area - blur");
				// If the esc key was pressed to cause the blur event just return
				// so label returns to what it was before editing started.
				if (that.textAreaEscKeyPressed) {
					that.textAreaEscKeyPressed = false;
					return;
				}
				// If there is no text for the label and textCanBeEmpty is false
				// just return so label returns to what it was before editing started.
				if (!this.value && !data.textCanBeEmpty) {
					CanvasUtils.stopPropagationAndPreventDefault(d3Event);
					that.closeTextArea(foreignObject, data);
					return;
				}
				const newText = this.value; // Save the text before closing the foreign object
				that.closeTextArea(foreignObject, data);
				if (data.text !== newText) {
					that.isCommentBeingUpdated = true;
					data.saveTextChangesCallback(data.id, newText, that.textAreaHeight);
					that.isCommentBeingUpdatd = false;
				}
			})
			.on("focus", function(d3Event, d) {
				that.logger.log("Text area - focus");
				data.autoSizeCallback(this, foreignObject, data.id, data.autoSizeCallback);
			})
			.on("mousedown click dblclick contextmenu", (d3Event, d) => {
				d3Event.stopPropagation(); // Allow default behavior to show system contenxt menu
			});

		textArea.node().focus();

		// Set the cusrsor to the end of the text.
		textArea.node().setSelectionRange(data.text.length, data.text.length);
	}

	// Closes the text area and resets the flags.
	closeTextArea(foreignObject, data) {
		if (data.closeTextAreaCallback) {
			data.closeTextAreaCallback(data.id);
		}
		foreignObject.remove();
		this.editingText = false;
		this.editingTextId = "";
	}

	// Returns true if one of the keys that are allowed in the text area, when
	// checking for maximum characters, has been pressed.
	textAreaAllowedKeys(d3Event) {
		return d3Event.keyCode === DELETE_KEY ||
			d3Event.keyCode === BACKSPACE_KEY ||
			d3Event.keyCode === LEFT_ARROW_KEY ||
			d3Event.keyCode === RIGHT_ARROW_KEY ||
			d3Event.keyCode === UP_ARROW_KEY ||
			d3Event.keyCode === DOWN_ARROW_KEY ||
			(d3Event.keyCode === A_KEY && CanvasUtils.isCmndCtrlPressed(d3Event));
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
		if (this.parentRenderer) {
			if (this.parentRenderer.isRegionSelectOrSizingInProgress()) {
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

	// Sets the size and position of the node in the canvasInfo.nodes
	// array based on the position of the pointer during the resize action
	// then redraws the nodes and links (the link positions may move based
	// on the node size change).
	resizeNode(d3Event) {
		const oldSupernode = Object.assign({}, this.resizeObj);
		const minSupernodeHeight = Math.max(this.resizeObj.inputPortsHeight, this.resizeObj.outputPortsHeight) +
			this.canvasLayout.supernodeTopAreaHeight + this.canvasLayout.supernodeSVGAreaPadding;
		const delta = this.resizeObject(d3Event, this.resizeObj, this.nodeSizingDirection,
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
			if (this.dispUtils.isDisplayingSubFlow()) {
				this.displayBindingNodesToFitSVG();
			}
			this.superRenderers.forEach((renderer) => renderer.displaySVGToFitSupernode());
		}
	}

	// Sets the size and position of the comment in the canvasInfo.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and links (the link positions may move based
	// on the comment size change).
	resizeComment(d3Event) {
		this.resizeObject(d3Event, this.resizeObj, this.commentSizingDirection, 20, 20);
		this.displayComments();
		this.displayLinks();
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

	displayLinks() {
		this.logger.logStartTimer("displayLinks " + this.getFlags());

		if (this.canvasController.isTipOpening() || this.canvasController.isTipClosing()) {
			this.logger.logEndTimer("displayLinks " + this.getFlags());
			return;

		} else if (this.selecting || this.regionSelect) {
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
		var startTimeDrawingLines = Date.now();

		const timeAfterDelete = Date.now();
		const lineArray = this.buildLineArray();
		const afterLineArray = Date.now();

		this.getAllLinkGroupsSelection()
			.data(lineArray, (line) => line.id)
			.join(
				(enter) => this.createLinks(enter)
			)
			.attr("class", (d) => this.getLinkGroupClass(d))
			.attr("style", (d) => this.getLinkGrpStyle(d))
			.attr("data-selected", (d) => (this.objectModel.isSelected(d.id, this.activePipeline.id) ? true : null))
			.call((joinedLinkGrps) => {
				this.updateLinks(joinedLinkGrps, lineArray);
			});

		// Set connection status of output ports and input ports plus arrow.
		if (this.canvasLayout.connectionType === "ports") {
			const portInSelector = "." + this.getNodeInputPortClassName();
			const portOutSelector = "." + this.getNodeOutputPortClassName();

			const nodeGrps = this.getAllNodeGroupsSelection();
			nodeGrps.selectChildren(portInSelector).attr("connected", "no");
			nodeGrps.selectChildren(portOutSelector).attr("connected", "no");

			lineArray.forEach((line) => {
				if (line.type === NODE_LINK) {
					if (line.trg) {
						this.setPortStatus(line.trg.id, line.trgPortId, "yes");
					}
					if (line.src) {
						this.setPortStatus(line.src.id, line.srcPortId, "yes");
					}
				}
			});
		}

		var endTimeDrawingLines = Date.now();

		if (showLinksTime) {
			this.logger.log("displayLinks R " + (timeAfterDelete - startTimeDrawingLines) +
			" B " + (afterLineArray - timeAfterDelete) + " D " + (endTimeDrawingLines - afterLineArray));
		}
	}

	getBuildLineArrayData(id, lineArray) {
		return lineArray.find((el) => el.id === id);
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

	// Updates all the link groups (and descendent objects) in the joinedLinkGrps
	// selection object. The selection object will contain newly created links
	// as well as existing links.
	updateLinks(joinedLinkGrps, lineArray) {
		// Update link selection area
		joinedLinkGrps
			.selectAll(".d3-link-selection-area")
			.datum((d) => this.getBuildLineArrayData(d.id, lineArray))
			.attr("d", (d) => d.pathInfo.path);

		// Update link line
		joinedLinkGrps
			.selectAll(".d3-link-line")
			.datum((d) => this.getBuildLineArrayData(d.id, lineArray))
			.attr("d", (d) => d.pathInfo.path)
			.attr("class", "d3-link-line")
			.attr("style", (d) => CanvasUtils.getObjectStyle(d, "line", "default"));

		// Update link line arrow head
		joinedLinkGrps
			.filter((d) => (d.type === NODE_LINK && this.canvasLayout.dataLinkArrowHead) ||
											(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead) ||
											(d.type === NODE_LINK && this.canvasLayout.linkType === LINK_TYPE_STRAIGHT))
			.selectAll(".d3-link-line-arrow-head")
			.datum((d) => this.getBuildLineArrayData(d.id, lineArray))
			.attr("d", (d) => this.getArrowHead(d))
			.attr("transform", (d) => this.getArrowHeadTransform(d))
			.attr("class", "d3-link-line-arrow-head")
			.attr("style", (d) => CanvasUtils.getObjectStyle(d, "line", "default"));

		// Update decorations on the node-node or association links.
		joinedLinkGrps.each((d, i, linkGrps) => {
			if (d.type === NODE_LINK || d.type === ASSOCIATION_LINK) {
				this.displayDecorations(d, DEC_LINK, d3.select(linkGrps[i]).selectAll(".d3-link-decorations-group"), d.decorations);
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

		this.setDisplayOrder(joinedLinkGrps);
	}

	attachLinkGroupListeners(linkGrps) {
		linkGrps
			.on("mousedown", (d3Event, d, index, links) => {
				this.logger.log("Link Group - mouse down");
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
		handlesGrp
			.append(this.canvasLayout.linkStartHandleObject)
			.attr("class", (d) => "d3-link-handle-start")
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link start handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Link end handle - finished mouse down");
			})
			.call(this.dragSelectionHandle);

		handlesGrp
			.append(this.canvasLayout.linkEndHandleObject)
			.attr("class", (d) => "d3-link-handle-end")
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link end handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d);
				}
				this.logger.log("Link end handle - finished mouse down");
			})
			.call(this.dragSelectionHandle);
	}

	// Updates the start and end link handles for the handle groups passed in.
	updateHandles(handlesGrp, lineArray) {
		handlesGrp
			.selectAll(".d3-link-handle-start")
			.datum((d) => this.getBuildLineArrayData(d.id, lineArray))
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
			.datum((d) => this.getBuildLineArrayData(d.id, lineArray))
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
		// If the class name provided IS the default, or there is no classname,
		// return the class name.
		return "d3-comment-group" + customClass;
	}

	// Returns the class string to be appled to the node group object.
	getNodeGroupClass(d) {
		let customClass = "";
		// If the node has a classname that isn't the default use it!
		if (d.class_name &&
				d.class_name !== "canvas-node" &&
				d.class_name !== "d3-node-body" &&
				d.class_name !== "d3-node-body-outline") {
			customClass = " " + d.class_name;
		}

		const supernodeClass = this.nodeUtils.isSupernode(d) && this.nodeUtils.isExpanded(d)
			? " d3-node-supernode-expanded"
			: "";

		// If the class name provided IS the default, or there is no classname,
		// return the class name.
		return "d3-node-group" + supernodeClass + customClass;
	}

	// Pushes the links to be below nodes and then pushes comments to be below
	// nodes and links. This lets the user put a large comment underneath a set
	// of nodes and links for annotation purposes.
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

	buildLineArray() {
		let lineArray = [];

		this.activePipeline.links.forEach((link) => {
			const trgNode = this.getNode(link.trgNodeId);
			const srcObj = link.type === COMMENT_LINK ? this.getComment(link.srcNodeId) : this.getNode(link.srcNodeId);
			let lineObj = null;

			if (((this.config.enableLinkSelection === LINK_SELECTION_HANDLES && this.isLinkBeingDragged(link)) ||
						this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) &&
					(!srcObj || !trgNode)) {
				lineObj = this.getDetachedLineObj(link, srcObj, trgNode);

			} else {
				lineObj = this.getAttachedLineObj(link, srcObj, trgNode);
			}

			if (lineObj) {
				lineArray.push(lineObj);
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

	getAttachedLineObj(link, srcObj, trgNode) {
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

			return {
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
			};
		}
		return null;
	}

	// Returns a line object describing the detached (or semi-detached) link
	// passed in. This will only ever be called when either srcNode OR trgNode
	// are null (indicating a semi-detached link) or when both are null indicating
	// a fully-detached link.
	getDetachedLineObj(link, srcNode, trgNode) {
		let srcPortId = null;
		let trgPortId = null;
		const coords = {};

		if (srcNode === null) {
			coords.x1 = link.srcPos.x_pos;
			coords.y1 = link.srcPos.y_pos;

		} else {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				const endPos = { x: link.trgPos.x_pos, y: link.trgPos.y_pos };
				const startPos = this.linkUtils.getNewStraightNodeLinkStartPos(srcNode, endPos);
				coords.x1 = startPos.x;
				coords.y1 = startPos.y;

			} else {
				srcPortId = this.getSourcePortId(link, srcNode);
				const port = this.getOutputPort(srcNode, srcPortId);
				if (port) {
					coords.x1 = srcNode.x_pos + port.cx;
					coords.y1 = srcNode.y_pos + port.cy;
				}
			}
		}

		if (trgNode === null) {
			coords.x2 = link.trgPos.x_pos;
			coords.y2 = link.trgPos.y_pos;

		} else {
			if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT) {
				const endPos = { x: link.srcPos.x_pos, y: link.srcPos.y_pos };
				const startPos = this.linkUtils.getNewStraightNodeLinkStartPos(trgNode, endPos);
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

		return {
			"id": link.id,
			"class_name": link.class_name,
			"style": link.style,
			"style_temp": link.style_temp,
			"type": link.type,
			"decorations": link.decorations,
			"src": srcNode,
			"srcPortId": srcPortId,
			"trg": trgNode,
			"trgPortId": trgPortId,
			"x1": coords.x1,
			"y1": coords.y1,
			"x2": coords.x2,
			"y2": coords.y2
		};
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
			if (lineData.src && lineData.src.id === srcNode.id) {
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
		return "M -8 8 L 0 0 -8 -8";
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
