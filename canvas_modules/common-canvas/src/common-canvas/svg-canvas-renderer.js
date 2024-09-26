/*
 * Copyright 2017-2024 Elyra Authors
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
import * as d3Selection from "d3-selection";
import * as d3Fetch from "d3-fetch";
const d3 = Object.assign({}, d3Selection, d3Fetch);

const markdownIt = require("markdown-it")({
	html: true, // Allow HTML to be executed in comments.
	linkify: false, // Don't convert strings, in URL format, to be links.
	typographer: true
});

import { escape as escapeText, forOwn, get } from "lodash";
import { ASSOC_RIGHT_SIDE_CURVE, ASSOCIATION_LINK, NODE_LINK, COMMENT_LINK,
	ASSOC_VAR_CURVE_LEFT, ASSOC_VAR_CURVE_RIGHT, ASSOC_VAR_DOUBLE_BACK_RIGHT,
	LINK_TYPE_ELBOW, LINK_TYPE_STRAIGHT,
	LINK_DIR_LEFT_RIGHT, LINK_DIR_RIGHT_LEFT, LINK_DIR_TOP_BOTTOM, LINK_DIR_BOTTOM_TOP,
	LINK_METHOD_FREEFORM, LINK_METHOD_PORTS,
	LINK_SELECTION_NONE, LINK_SELECTION_HANDLES, LINK_SELECTION_DETACHABLE,
	CONTEXT_MENU_BUTTON, DEC_LINK, DEC_NODE, EDIT_ICON,
	NODE_MENU_ICON, SUPER_NODE_EXPAND_ICON, PORT_OBJECT_IMAGE,
	TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_DEC, TIP_TYPE_LINK,
	USE_DEFAULT_ICON, USE_DEFAULT_EXT_ICON,
	SUPER_NODE, SNAP_TO_GRID_AFTER, SNAP_TO_GRID_DURING,
	NORTH, SOUTH, EAST, WEST,
	WYSIWYG }
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
import SvgCanvasExternal from "./svg-canvas-utils-external.js";
import SvgCanvasTextArea from "./svg-canvas-utils-textarea.js";
import SvgCanvasDragObject from "./svg-canvas-utils-drag-objects.js";
import SvgCanvasDragNewLink from "./svg-canvas-utils-drag-new-link.js";
import SvgCanvasDragDetLink from "./svg-canvas-utils-drag-det-link.js";
import SvgCanvasZoom from "./svg-canvas-utils-zoom.js";
import SVGCanvasPipeline from "./svg-canvas-pipeline";

const NINETY_DEGREES = 90;
const ONE_EIGHTY_DEGREES = 180;

export default class SVGCanvasRenderer {
	constructor(pipelineId, canvasDiv, canvasController, canvasInfo, selectionInfo, breadcrumbs, nodeLayout, canvasLayout, config, supernodeInfo = {}) {
		this.logger = new Logger(["SVGCanvasRenderer", "PipeId", pipelineId]);
		this.logger.logStartTimer("constructor" + pipelineId.substring(0, 5));
		this.pipelineId = pipelineId;
		this.supernodeInfo = supernodeInfo; // Contents will be 'empty object' in case of primary pipeline renderer
		this.canvasDiv = canvasDiv;
		this.canvasInfo = canvasInfo;
		this.selectionInfo = selectionInfo;
		this.breadcrumbs = breadcrumbs;
		this.nodeLayout = nodeLayout;
		this.canvasLayout = canvasLayout;
		this.config = config;
		this.canvasController = canvasController;
		this.activePipeline = new SVGCanvasPipeline(pipelineId, canvasInfo, selectionInfo);

		// An array of renderers for the supernodes on the canvas.
		this.superRenderers = [];

		// Our instance ID for adding to DOM element IDs
		this.instanceId = this.canvasController.getInstanceId();

		this.dispUtils = new SvgCanvasDisplay(this.canvasController, this.supernodeInfo.d3Selection, this.pipelineId, breadcrumbs);
		this.nodeUtils = new SvgCanvasNodes(this.canvasLayout);
		this.commentUtils = new SvgCanvasComments();
		this.linkUtils = new SvgCanvasLinks(this.config, this.canvasLayout, this.nodeUtils, this.commentUtils);
		this.decUtils = new SvgCanvasDecs(this.canvasLayout);
		this.dragObjectUtils = new SvgCanvasDragObject(this);
		this.dragNewLinkUtils = new SvgCanvasDragNewLink(this);
		this.dragDetLinkUtils = new SvgCanvasDragDetLink(this);
		this.zoomUtils = new SvgCanvasZoom(this);
		this.externalUtils = new SvgCanvasExternal(this);
		this.svgCanvasTextArea = new SvgCanvasTextArea(
			this.config,
			this.dispUtils,
			this.nodeUtils,
			this.decUtils,
			this.canvasController,
			this.canvasDiv,
			this.activePipeline,
			this.removeTempCursorOverlay.bind(this), // Function
			this.displayComments.bind(this), // Function
			this.displayLinks.bind(this), // Function
			this.getCommentToolbarPos.bind(this), // Function
			this.addCanvasZoomBehavior.bind(this), // Function
			this.removeCanvasZoomBehavior.bind(this) // Function
		);

		this.dispUtils.setDisplayState();
		this.logger.log(this.dispUtils.getDisplayStateMsg());

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

		this.initializeGhostDiv();

		this.canvasSVG = this.createCanvasSVG();
		this.canvasDefs = this.canvasSVG.selectChildren("defs");

		// Group to contain all canvas objects
		this.canvasGrp = this.createCanvasGroup(this.canvasSVG, "d3-canvas-group");

		// Put underlay rectangle under comments, nodes and links
		this.canvasUnderlay = this.createCanvasUnderlay(this.canvasGrp, "d3-canvas-underlay");

		// Group to always position comments under nodes and links
		this.commentsGrp = this.createCanvasGroup(this.canvasGrp, "d3-comments-group");

		// Group to position nodes and links over comments
		this.nodesLinksGrp = this.createCanvasGroup(this.canvasGrp, "d3-nodes-links-group");

		// Group to optionally add bounding rectangles over all objects
		this.boundingRectsGrp = this.createBoundingRectanglesGrp(this.canvasGrp, "d3-bounding-rect-group");

		this.resetCanvasSVGBehaviors();

		this.displayCanvas();

		if (this.dispUtils.isDisplayingFullPage()) {
			this.zoomUtils.restoreZoom();
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

	// Sets the pressed state of the space bar. This is called
	// from outside canvas via svg-canvas-d3.
	setSpaceKeyPressed(state) {
		this.zoomUtils.setSpaceKeyPressed(state);
		this.resetCanvasCursor();
	}

	// Returns true if the space bar is pressed and held down. This is called
	// from outside canvas via svg-canvas-d3.
	isSpaceKeyPressed() {
		return this.zoomUtils.isSpaceKeyPressed();
	}

	zoomTo(zoomObject, animateTime) {
		this.zoomUtils.zoomTo(zoomObject, animateTime);
	}

	translateBy(x, y, animateTime) {
		this.zoomUtils.translateBy(x, y, animateTime);
	}

	zoomIn() {
		this.zoomUtils.zoomIn();
	}

	zoomOut() {
		this.zoomUtils.zoomOut();
	}

	zoomToFit() {
		this.zoomUtils.zoomToFit();
	}

	isZoomedToMax() {
		return this.zoomUtils.isZoomedToMax();
	}

	isZoomedToMin() {
		return this.zoomUtils.isZoomedToMin();
	}

	getZoomToReveal(objectIDs, xPos, yPos) {
		return this.zoomUtils.getZoomToReveal(objectIDs, xPos, yPos);
	}

	getZoom() {
		return this.zoomUtils.getZoom();
	}

	getTransformedViewportDimensions() {
		return this.zoomUtils.getTransformedViewportDimensions();
	}

	getCanvasDimensionsWithPadding() {
		return this.zoomUtils.getCanvasDimensionsWithPadding();
	}

	// Returns the data object for the parent supernode that references the
	// active pipeline (managed by this renderer). We get the supernode by
	// looking through the overall canvas info object.
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

	// Provides new canvas info data to this renderer and other display and layout info
	// so the canvas can be redisplayed.
	setCanvasInfoRenderer(canvasInfo, selectionInfo, breadcrumbs, nodeLayout, canvasLayout, config) {
		this.logger.logStartTimer("setCanvasInfoRenderer" + this.pipelineId.substring(0, 5));

		this.config = config;
		this.canvasInfo = canvasInfo;
		this.selectionInfo = selectionInfo;
		this.breadcrumbs = breadcrumbs;
		this.nodeLayout = nodeLayout;
		this.canvasLayout = canvasLayout;

		this.activePipeline.initialize(this.pipelineId, canvasInfo, selectionInfo);

		// Must recreate these utils objects because they use the config object
		// which may have changed.
		this.linkUtils = new SvgCanvasLinks(this.config, this.canvasLayout, this.nodeUtils, this.commentUtils);
		this.svgCanvasTextArea = new SvgCanvasTextArea(
			this.config,
			this.dispUtils,
			this.nodeUtils,
			this.decUtils,
			this.canvasController,
			this.canvasDiv,
			this.activePipeline,
			this.removeTempCursorOverlay.bind(this), // Function
			this.displayComments.bind(this), // Function
			this.displayLinks.bind(this), // Function
			this.getCommentToolbarPos.bind(this), // Function
			this.addCanvasZoomBehavior.bind(this), // Function
			this.removeCanvasZoomBehavior.bind(this) // Function
		);


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

	// Updates the selection info for all renderers and displays the selection
	// highlighting for nodes, links and comments. This provides a performance
	// inmprovment over running the displayCanvas method which displays the
	// whole canvas.
	setSelectionInfo(selectionInfo) {
		this.selectionInfo = selectionInfo;
		this.activePipeline.initialize(this.pipelineId, this.canvasInfo, selectionInfo);

		this.displayCommentsSelectionStatus();
		this.displayNodesSelectionStatus();
		this.displayLinksSelectionStatus();

		this.superRenderers.forEach((renderer) => {
			renderer.setSelectionInfo(selectionInfo);
		});
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
		this.zoomUtils.resetZoomTransform();
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
			const posInfo = (typeof this.config.enablePositionNodeOnRightFlyoutOpen === "boolean")
				? { x: 50, y: 50 }
				: this.config.enablePositionNodeOnRightFlyoutOpen;
			const x = posInfo.x ? posInfo.x : 50;
			const y = posInfo.y ? posInfo.y : 50;
			const selNodeIds = this.activePipeline.getSelectedNodeIds();
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

		this.displayCanvasAccoutrements();

		this.logger.logEndTimer("displayCanvas");
	}

	// Displays zoom and size dependent canvas elements.
	displayCanvasAccoutrements() {
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
		const transformedSVGRect = this.zoomUtils.getTransformedViewportDimensions();

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
					d.x_pos = this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT
						? transformedSVGRect.x - d.width
						: transformedSVGRect.x + transformedSVGRect.width;
					const y = this.nodeUtils.getSupernodePortYOffset(d.id, supernodeDatum.inputs) - topAreaHeight;
					d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.outputs[0].cy;
				}
				if (d.isSupernodeOutputBinding) {
					d.x_pos = this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT
						? transformedSVGRect.x + transformedSVGRect.width
						: transformedSVGRect.x - d.width;
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
		const svgRect = this.zoomUtils.getViewportDimensions();
		const transformedSVGRect = this.zoomUtils.getTransformedRect(svgRect, 1);
		const canv = this.zoomUtils.getCanvasDimensions();
		const canvWithPadding = this.zoomUtils.getCanvasDimensionsWithPadding();

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

	// Selects any objects in the region provided where region is { x, y, width, height }
	selectObjsInRegion(region) {
		const selections =
			CanvasUtils.selectInRegion(region, this.activePipeline,
				this.config.enableLinkSelection !== LINK_SELECTION_NONE,
				this.config.enableLinkType,
				this.config.enableAssocLinkType);
		this.canvasController.setSelections(selections, this.activePipeline.id);
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
		return this.dragObjectUtils.isMoving() || this.dragNewLinkUtils.isDragging() || this.dragDetLinkUtils.isDragging();
	}

	// Returns true whenever a node or comment is being resized.
	isSizing() {
		this.dragObjectUtils.isSizing();
	}

	// Returns true whenever a node or comment is being moved.
	isMoving() {
		this.dragObjectUtils.isMoving();
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

	// Returns the current mouse position transformed by the current zoom
	// transformation amounts based on the local SVG -- that is, if we're
	// displaying a sub-flow it is based on the SVG in the supernode.
	getTransformedMousePos(d3Event) {
		return this.zoomUtils.transformPos(this.getMousePos(d3Event, this.canvasSVG));
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

	// Returns the page position passed in snapped to the grid in canvas
	// coordinates. Called externally via svg-canvas-d3.
	convertPageCoordsToSnappedCanvasCoords(pos) {
		let positon = this.convertPageCoordsToCanvasCoords(pos.x, pos.y);
		positon = this.getMousePosSnapToGrid(positon);
		return positon;
	}

	// Convert coordinates from the page (based on the page top left corner) to
	// canvas coordinates based on the canvas coordinate system.
	convertPageCoordsToCanvasCoords(x, y) {
		const svgRect = this.canvasSVG.node().getBoundingClientRect();
		return this.zoomUtils.transformPos({ x: x - Math.round(svgRect.left), y: y - Math.round(svgRect.top) });
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
	getGhostNode(node) {
		const ghostDivSel = this.getGhostDivSel();
		const zoomScale = this.zoomUtils.getZoomScale();

		// Calculate the ghost area width which is the maximum of either the node
		// label or the default node width.
		const ghostAreaWidth = Math.max(this.nodeLayout.labelWidth, node.width);

		let xOffset = 0;

		// Remove any existing SVG object from the div
		ghostDivSel
			.selectAll(".d3-ghost-svg")
			.remove();

		// Create a new SVG area for the ghost area.
		const ghostAreaSVG = ghostDivSel
			.append("svg")
			.attr("width", ghostAreaWidth * zoomScale)
			.attr("height", (50 + node.height) * zoomScale) // Add some extra pixels, in case label is below label bottom
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

		if (!this.nodeLayout.nodeExternalObject) {
			ghostGrp
				.append(() => this.getImageElement(node))
				.each((d, idx, imgs) => this.setNodeImageContent(node, idx, imgs))
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
			xOffset = Math.max(0, (labelDisplayLength - node.width) / 2) * zoomScale;

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
		}

		ghostGrp.attr("transform", `translate(${xOffset}, 0) scale(${zoomScale})`);

		// Get the amount the actual browser page is 'zoomed'. This is differet
		// to the zoom amount for the canvas objects.
		const browserZoom = this.getBrowserZoom();

		// Calculate the center of the node area for positioning the mouse pointer
		// on the image when it is being dragged.
		const centerX = (xOffset + ((node.width / 2) * zoomScale)) * browserZoom;
		const centerY = ((node.height / 2) * zoomScale) * browserZoom;

		return {
			element: ghostDivSel.node(),
			centerX: centerX,
			centerY: centerY,
			nodeTemplate: node
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
			const ghostArea = {
				x1: mousePos.x - (nodeTemplate.width / 2),
				y1: mousePos.y - (nodeTemplate.height / 2),
				x2: mousePos.x + (nodeTemplate.width / 2),
				y2: mousePos.y + (nodeTemplate.height / 2)
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

	// Switches on or off node highlighting depending on the node
	// passed in and keeps track of the currently highlighted node. This is
	// called as a new link or a detached link is being dragged towards or
	// away from a target node to highlight or unhighlight the target node.
	setHighlightingOverNode(state, nodeNearMouse) {
		if (state) {
			if (!this.dragNewLinkOverNode) {
				this.dragNewLinkOverNode = nodeNearMouse;
				this.setLinkOverNode(this.dragNewLinkOverNode, true);

			} else if (nodeNearMouse.id !== this.dragNewLinkOverNode.id) {
				this.setLinkOverNode(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = nodeNearMouse;
				this.setLinkOverNode(this.dragNewLinkOverNode, true);
			}

		} else {
			if (this.dragNewLinkOverNode) {
				this.setLinkOverNode(this.dragNewLinkOverNode, false);
				this.dragNewLinkOverNode = null;
			}
		}
	}

	// Switches on or off the highlighting on the node passed in.
	// This is called when the user drags a link towards a target node.
	setLinkOverNode(node, state) {
		if (node) {
			this.getNodeGroupSelectionById(node.id)
				.attr("data-new-link-over", state ? "yes" : "no");
		}
	}

	// Removes the data-new-link-over attribute used for highlighting a node
	// that a new link is being dragged towards or over.
	setLinkOverNodeCancel() {
		this.setLinkOverNode(this.dragNewLinkOverNode, false);
		this.dragNewLinkOverNode = null;
	}

	// Processes the drop of a palette node template onto the canvas. The
	// nodeTemplate is in internal format.
	nodeTemplateDropped(nodeTemplate, x, y) {
		if (nodeTemplate === null) {
			return;
		}
		const transPos = this.transformMousePosForNode(x, y, nodeTemplate);

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
	transformMousePosForNode(x, y, node) {
		const mousePos = this.convertPageCoordsToCanvasCoords(x, y);

		// Offset mousePos so new node appears in center of mouse location.
		if (node && node.width && node.height) {
			mousePos.x -= node.width / 2;
			mousePos.y -= node.height / 2;
		} else {
			mousePos.x -= this.nodeLayout.defaultNodeWidth / 2;
			mousePos.y -= this.nodeLayout.defaultNodeHeight / 2;
		}

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

	// Sets the maximum zoom extent if we are the renderer of the top level flow
	// or calls the same method on our parent renderer if we are a sub-flow. This
	// means the factors will multiply as they percolate up to the top flow.
	setMaxZoomExtent(factor) {
		if (this.dispUtils.isDisplayingFullPage()) {
			this.zoomUtils.setMaxZoomExtent(factor);
		} else {
			const newFactor = Number(factor) * 1 / this.zoomUtils.getZoomScale();
			this.supernodeInfo.renderer.setMaxZoomExtent(newFactor);
		}
	}

	// Returns a new canvas SVG object with all the behavior expected of a great
	// SVG canvas object.
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
				// If we are a sub-flow (i.e. we have a parent renderer) set the max
				// zoom extent with a factor calculated from our zoom amount.
				if (this.supernodeInfo.renderer && this.config.enableZoomIntoSubFlows) {
					this.supernodeInfo.renderer.setMaxZoomExtent(1 / this.zoomUtils.getZoomScale());
				}
			})
			.on("mouseleave", (d3Event, d) => {
				// If we are a sub-flow (i.e. we have a parent renderer) set the max
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
		this.removeCanvasZoomBehavior();

		// If there are no nodes or comments we don't apply any zoom behaviors
		// to the SVG area. We only attach the zoom behaviour to the top most SVG
		// area i.e. when we are displaying either the primary pipeline full page
		// or a sub-pipeline full page.
		if (!this.activePipeline.isEmptyOrBindingsOnly() &&
				this.dispUtils.isDisplayingFullPage()) {
			this.canvasSVG.call(this.zoomUtils.getZoomHandler());
		}

		// These behaviors will be applied to SVG areas at the top level and
		// SVG areas displaying an in-place subflow
		this.canvasSVG
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
			.on("click.zoom", (d3Event) => {
				// Control comes here after the zoomClick action has been perfoemd in zoomUtils.
				this.logger.log("Canvas - click-zoom");

				this.canvasController.clickActionHandler({
					clickType: d3Event.type === "contextmenu" ? "SINGLE_CLICK_CONTEXTMENU" : "SINGLE_CLICK",
					objectType: "canvas",
					selectedObjectIds: this.activePipeline.getSelectedObjectIds()
				});
			})
			.on("dblclick.zoom", () => {
				this.logger.log("Zoom - double click");
				this.canvasController.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "canvas",
					selectedObjectIds: this.activePipeline.getSelectedObjectIds() });
			})
			.on("contextmenu.zoom", (d3Event, d) => {
				this.logger.log("Zoom - context menu");
				this.openContextMenu(d3Event, "canvas");
			});
	}

	// When adding back zoom behavior we need to reset all canvas behaviors
	// because the ".zoom" events will have been removed from this.canvasSVG
	// whenn removeCanvasZoomBehavior was called.
	addCanvasZoomBehavior() {
		this.resetCanvasSVGBehaviors();
	}

	removeCanvasZoomBehavior() {
		this.canvasSVG.on(".zoom", null);
	}

	// Resets the pointer cursor on the background rectangle in the Canvas SVG area.
	resetCanvasCursor() {
		const selector = ".d3-svg-background[data-pipeline-id='" + this.activePipeline.id + "']";
		this.canvasSVG.select(selector).style("cursor", this.zoomUtils.isDragActivated() && this.dispUtils.isDisplayingFullPage() ? "grab" : "default");
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
		const canv = this.zoomUtils.getCanvasDimensionsWithPadding();
		if (canv) {
			this.canvasUnderlay
				.attr("x", canv.left - 50)
				.attr("y", canv.top - 50)
				.attr("width", canv.width + 100)
				.attr("height", canv.height + 100);
		}
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

	setCommentEditingMode(commentId, pipelineId) {
		if (this.pipelineId === pipelineId) {
			const comment = this.activePipeline.getComment(commentId);
			if (comment && this.config.enableEditingActions) {
				const comSel = this.getCommentGroupSelectionById(commentId);
				const comDomObj = comSel.node();
				this.displayCommentTextArea(comment, comDomObj);
			}
		} else {
			this.superRenderers.forEach((renderer) => {
				renderer.setCommentEditingMode(commentId, pipelineId);
			});
		}
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

	// Repositions the comment toolbar so it is always over the top of the
	// comment being edited.
	repositionCommentToolbar() {
		if (this.dispUtils.isDisplayingFullPage() &&
			this.svgCanvasTextArea.isEditingText()) {
			// If a node label or text decoration is being edited com will be undefined.
			const com = this.activePipeline.getComment(this.svgCanvasTextArea.getEditingTextId());
			if (com && (com.contentType === WYSIWYG || this.config.enableMarkdownInComments)) {
				const pos = this.getCommentToolbarPos(com);
				this.canvasController.moveTextToolbar(pos.x, pos.y);
			}
		}
	}

	// Returns a position object that describes the position in page coordinates
	// of the comment toolbar so that it is positioned above the comment being edited.
	getCommentToolbarPos(com) {
		const pos = this.zoomUtils.unTransformPos({ x: com.x_pos, y: com.y_pos });
		return {
			x: pos.x + this.canvasLayout.commentToolbarPosX,
			y: pos.y + this.canvasLayout.commentToolbarPosY
		};
	}

	// Returns the snap-to-grid position of the object positioned at objPos.x
	// and objPos.y. The grid that is snapped to is defined by this.snapToGridXPx
	// and this.snapToGridYPx values which are pixel values.
	snapToGridPosition(objPos) {
		const stgPosX = CanvasUtils.snapToGrid(objPos.x, this.canvasLayout.snapToGridXPx);
		const stgPosY = CanvasUtils.snapToGrid(objPos.y, this.canvasLayout.snapToGridYPx);

		return { x: stgPosX, y: stgPosY };
	}

	// Displays all the nodes on the canvas either by creating new nodes,
	// updating existing nodes or removing unwanted nodes.
	displayNodes() {
		this.logger.logStartTimer("displayNodes " + this.getFlags());

		// Set the port positions for all ports - these will be needed when displaying
		// nodes and links. This needs to be done here because a resized supernode
		// will cause its ports to move and resizing comments causes links to be
		// redrawn which will need port positions to be set appropriately.
		this.setPortPositionsAllNodes();

		const sel = this.getAllNodeGroupsSelection();
		this.displayNodesSubset(sel, this.activePipeline.nodes);

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

	displayNodesSelectionStatus(selectionInfo) {
		this.logger.logStartTimer("displayNodesSelectionStatus");

		this.getAllNodeGroupsSelection()
			.selectChildren(".d3-node-selection-highlight")
			.attr("data-selected", (d) => (this.activePipeline.isSelected(d.id) ? "yes" : "no"));

		this.logger.logEndTimer("displayNodesSelectionStatus");
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
				(enter) => this.createNodes(enter),
				null,
				(remove) => this.removeNodes(remove)
			)
			.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
			.attr("class", (d) => this.getNodeGroupClass(d))
			.attr("style", (d) => this.getNodeGrpStyle(d))
			.call((joinedNodeGrps) => this.updateNodes(joinedNodeGrps, data));
	}

	createNodes(enter) {
		this.logger.logStartTimer("createNodes");

		const newNodeGroups = enter
			.append("g")
			.attr("data-id", (d) => this.getId("node_grp", d.id))
			.call(this.attachNodeGroupListeners.bind(this));

		this.logger.logEndTimer("createNodes");

		return newNodeGroups;
	}

	updateNodes(joinedNodeGrps, data) {
		this.logger.logStartTimer("updateNodes");

		const nonBindingNodeGrps = joinedNodeGrps.filter((node) => !CanvasUtils.isSuperBindingNode(node));

		// Node Sizing Area
		nonBindingNodeGrps
			.selectChildren(".d3-node-sizing")
			.data((d) => (CanvasUtils.isNodeResizable(d, this.config) ? [d] : []), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("path")
						.attr("class", "d3-node-sizing")
						.call(this.attachNodeSizingListeners.bind(this))
			)
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePathSizing(d));

		// Node Selection Highlighting Outline.
		nonBindingNodeGrps
			.selectChildren(".d3-node-selection-highlight")
			.data((d) => ([d]), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("path")
						.attr("class", "d3-node-selection-highlight")
			)
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeSelectionOutline(d))
			.attr("data-selected", (d) => (this.activePipeline.isSelected(d.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Node Body
		nonBindingNodeGrps
			.selectChildren(".d3-node-body-outline")
			.data((d) => (d.layout.nodeShapeDisplay ? [d] : []), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("path")
						.attr("class", "d3-node-body-outline")
			)
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("d", (d) => this.getNodeShapePath(d))
			.attr("style", (d) => this.getNodeBodyStyle(d, "default"));

		// Optional foreign object to contain a React object
		nonBindingNodeGrps
			.selectChildren(".d3-foreign-object-external-node")
			.data((d) => (d.layout.nodeExternalObject ? [d] : []), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("foreignObject")
						.attr("class", "d3-foreign-object-external-node"),
				null,
				(exit) => {
					exit.each((d, idx, exts) =>
						this.externalUtils.removeExternalObject(d, idx, exts));
					exit.remove();
				}
			)
			.datum((d) => this.activePipeline.getNode(d.id))
			.attr("width", (d) => d.width)
			.attr("height", (d) => d.height)
			.attr("x", 0)
			.attr("y", 0)
			.each((d, idx, exts) =>
				this.externalUtils.addNodeExternalObject(d, idx, exts));

		// Node Image
		nonBindingNodeGrps
			.selectChildren(".d3-node-image")
			.data((d) => (d.layout.imageDisplay ? [d] : []), (d) => d.id)
			.join(
				(enter) =>
					enter.append((d) => this.getImageElement(d))
			)
			.datum((d) => this.activePipeline.getNode(d.id))
			.each((d, idx, imgs) => this.setNodeImageContent(d, idx, imgs))
			.attr("x", (d) => this.nodeUtils.getNodeImagePosX(d))
			.attr("y", (d) => this.nodeUtils.getNodeImagePosY(d))
			.attr("width", (d) => this.nodeUtils.getNodeImageWidth(d))
			.attr("height", (d) => this.nodeUtils.getNodeImageHeight(d))
			.attr("style", (d) => this.getNodeImageStyle(d, "default"));

		// Node Label
		nonBindingNodeGrps
			.selectChildren(".d3-foreign-object-node-label")
			.data((d) => (d.layout.labelDisplay ? [d] : []), (d) => d.id)
			.join(
				(enter) => {
					const labelFOSel = enter
						.append("foreignObject")
						.attr("class", "d3-foreign-object-node-label")
						.call(this.attachNodeLabelListeners.bind(this));
					labelFOSel
						.append("xhtml:div") // Provide a namespace when div is inside foreignObject
						.append("xhtml:span") // Provide a namespace when span is inside foreignObject
						.call(this.attachNodeLabelSpanListeners.bind(this));
					return labelFOSel;
				}
			)
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
		nonBindingNodeGrps.selectChildren(".d3-node-ellipsis-group")
			.attr("transform", (d) => this.nodeUtils.getNodeEllipsisTranslate(d));

		// Node (Supernode) Expansion Icon - if one exists
		nonBindingNodeGrps.selectChildren(".d3-node-super-expand-icon-group")
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

		// Add or remove drag behavior as appropriate
		if (this.config.enableEditingActions) {
			const handler = this.dragObjectUtils.getDragObjectHandler();
			nonBindingNodeGrps
				.call(handler);
		} else {
			nonBindingNodeGrps
				.on(".drag", null);
		}

		this.logger.logEndTimer("updateNodes");
	}

	removeNodes(removeSel) {
		// Remove any JSX images for the nodes being removed to
		// unmount their React objects.
		removeSel
			.selectAll(".d3-foreign-object-node-image")
			.each((d, idx, exts) =>
				this.externalUtils.removeExternalObject(d, idx, exts));

		// Remove any JSX decorations for the nodes being removed to
		// unmount their React objects.
		removeSel
			.selectAll(".d3-foreign-object-dec-jsx")
			.each((d, idx, exts) =>
				this.externalUtils.removeExternalObject(d, idx, exts));

		// Remove any foreign objects for React nodes to
		// unmount their React objects.
		removeSel
			.selectChildren(".d3-foreign-object-external-node")
			.each((d, idx, exts) =>
				this.externalUtils.removeExternalObject(d, idx, exts));

		// Remove all nodes in the selection.
		removeSel.remove();
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
				// Setting canvas info will call displayCanvas for the sub-flow
				ren.setCanvasInfoRenderer(
					this.canvasInfo,
					this.selectionInfo,
					this.breadcrumbs,
					this.nodeLayout,
					this.canvasLayout,
					this.config
				);
			}
		} else {
			if (ren) {
				ren.hideCanvas(d);
			}
		}
	}

	displayPorts(nodeGrp, d) {
		this.displayInputPorts(nodeGrp, d);
		this.displayOutputPorts(nodeGrp, d);
	}

	displayInputPorts(nodeGrp, node) {
		const inSelector = "." + this.getNodeInputPortClassName();

		// Some applications may set inputs to undefined after inputs was
		// previously set to an array, so use empty array in that case so any
		// existing input ports are removed from the node.
		let inputs = node.inputs || [];

		// Don't display input ports if config says not to.
		inputs = node.layout.inputPortDisplay ? inputs : [];

		nodeGrp.selectChildren(inSelector)
			.data(inputs, (p) => p.id)
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
						.attr("transform", this.getInputPortArrowPathTransform(port));
				}
			});

		if (this.config.enableEditingActions) {
			const handler = this.dragNewLinkUtils.getDragNewLinkHandler();
			joinedInputPortGrps.call(handler);
		} else {
			joinedInputPortGrps.on(".drag", null);
		}
	}

	displayOutputPorts(nodeGrp, node) {
		const outSelector = "." + this.getNodeOutputPortClassName();

		// Some applications may set outputs to undefined after outputs was
		// previously set to an array, so use empty array in that case so any
		// existing output ports are removed from the node.
		let outputs = node.outputs || [];

		// Don't display output ports if config says not to.
		outputs = node.layout.outputPortDisplay ? outputs : [];

		// Only show a single output port (the last one) if config tells us to.
		outputs = this.config.enableSingleOutputPortDisplay && outputs.length > 1
			? [outputs[outputs.length - 1]]
			: outputs;

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

	updateOutputPorts(joinedOutputPortGrps, node) {
		joinedOutputPortGrps.selectChildren(".d3-node-port-output-main")
			.datum((port) => node.outputs.find((o) => port.id === o.id))
			.each((port, i, outputPorts) => {
				const obj = d3.select(outputPorts[i]);
				if (node.layout.outputPortObject === PORT_OBJECT_IMAGE) {
					obj
						.attr("xlink:href", node.layout.outputPortImage)
						.attr("x", port.cx - (node.layout.outputPortWidth / 2))
						.attr("y", port.cy - (node.layout.outputPortHeight / 2))
						.attr("width", node.layout.outputPortWidth)
						.attr("height", node.layout.outputPortHeight)
						.attr("transform", this.getPortImageTransform(port));
				} else {
					obj
						.attr("r", this.getPortRadius(node))
						.attr("cx", port.cx)
						.attr("cy", port.cy);
				}
			});

		if (this.config.enableEditingActions) {
			const handler = this.dragNewLinkUtils.getDragNewLinkHandler();
			joinedOutputPortGrps.call(handler);
		} else {
			joinedOutputPortGrps.on(".drag", null);
		}
	}

	// Attaches the appropriate listeners to the node groups.
	attachNodeGroupListeners(nodeGrps) {
		nodeGrps
			.on("mouseenter", (d3Event, d) => {
				if (this.isDragging()) {
					return;
				}
				const nodeGrp = d3.select(d3Event.currentTarget);
				this.raiseNodeToTop(nodeGrp);
				this.setNodeStyles(d, "hover", nodeGrp);
				if (this.config.enableContextToolbar) {
					this.addContextToolbar(d3Event, d, "node");
				} else {
					this.addDynamicNodeIcons(d3Event, d, nodeGrp);
				}
			})
			// This will be called when the mouse cursor enters the node or moves out of
			// child elements of the node. Some child elements, like decorations, may have
			// their own tooltips so this will redisplay the node tooltip on exiting the decoration.
			.on("mouseover", (d3Event, d) => {
				d3Event.stopPropagation(); // Stop propagation in case we are in a sub-flow
				if (this.canOpenTip(TIP_TYPE_NODE)) {
					const tipId = this.canvasController.getTipId(); // Id of current tip or null
					const nodeTipId = this.getId("node_tip", d.id);

					if (tipId === null || tipId !== nodeTipId) {
						this.canvasController.closeTip();
						this.canvasController.openTip({
							id: nodeTipId,
							type: TIP_TYPE_NODE,
							targetObj: d3Event.currentTarget,
							pipelineId: this.activePipeline.id,
							node: d
						});
					}
				}
			})
			.on("mouseleave", (d3Event, d) => {
				const nodeGrp = d3.select(d3Event.currentTarget);
				this.setNodeStyles(d, "default", nodeGrp);
				if (this.config.enableContextToolbar) {
					this.removeContextToolbar();
				} else {
					this.removeDynamicNodeIcons(d3Event, d, nodeGrp);
				}
				this.canvasController.closeTip();
			})
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.logStartTimer("Node Group - mouse down");
				d3Event.stopPropagation();
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing(d3Event);
				}
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d, "node");
				}
				this.logger.logEndTimer("Node Group - mouse down");
			})
			.on("mousemove", (d3Event, d) => {
				// this.logger.log("Node Group - mouse move");
				// Don't stop propogation. Mouse move messages must be allowed to
				// propagate to canvas zoom operation.
			})
			.on("click", (d3Event, d) => {
				this.logger.log("Node Group - click");
				d3Event.stopPropagation();
			})
			.on("dblclick", (d3Event, d) => {
				this.logger.log("Node Group - double click");
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				this.canvasController.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "node",
					id: d.id,
					selectedObjectIds: this.activePipeline.getSelectedObjectIds(),
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
						this.selectObjectD3Event(d3Event, d, "node");
					}
					this.openContextMenu(d3Event, "node", d);
				}
			});
	}

	attachNodeSizingListeners(nodeGrps) {
		nodeGrps
			.on("mousedown", (d3Event, d) => {
				this.dragObjectUtils.mouseDownNodeSizingArea(d);
			})
			// Use mousemove as well as mouseenter so the cursor will change
			// if the pointer moves from one area of the node outline to another
			// (eg. from east area to north-east area) without exiting the node outline.
			// A mouseenter is triggered when the sizing operation stops and the
			// pointer leaves the temporary overlay (which is removed) and enters
			// the node outline.
			.on("mousemove mouseenter", (d3Event, d) => {
				this.dragObjectUtils.mouseEnterNodeSizingArea(d3Event, d);
			})
			.on("mouseleave", (d3Event, d) => {
				this.dragObjectUtils.mouseLeaveNodeSizingArea(d3Event, d);
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
						.attr("height", this.nodeUtils.getNodeLabelHoverHeight(d, spanSel.node(), this.zoomUtils.getZoomScale()));
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
					this.selectObjectD3Event(d3Event, node, "node");
				}

				this.openContextMenu(d3Event, "input_port", node, port);
			});
	}

	attachOutputPortListeners(outputPorts, node) {
		outputPorts
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
					this.selectObjectD3Event(d3Event, node, "node");
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
			this.zoomUtils.getZoomScale(), this.config.enableDisplayFullLabelOnHover);

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
			dec, obj, objType, spanObj, this.zoomUtils.getZoomScale());

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
			if (labelObj) {
				const foreignObj = labelObj.parentElement;
				const nodeObj = foreignObj.parentElement;
				const nodeGrpSel = d3.select(nodeObj);
				nodeGrpSel.selectAll(".d3-label-edit-icon-group").remove();
			}
		}
	}

	// Adds the object passed in to the set of selected objects using
	// the d3Event object passed in.
	selectObjectD3Event(d3Event, d, objType) {
		this.selectObject(
			d,
			d3Event.type,
			d3Event.shiftKey,
			CanvasUtils.isCmndCtrlPressed(d3Event));
		// If the selection has changed we need to recreate any currently displayed
		// context toolbar because the context actions may have changed based on
		// the new selection.
		this.recreateContextToolbar(d3Event, d, objType);
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
		this.canvasController.selectObject(d.id, isShiftKeyPressed, isCmndCtrlPressed, this.activePipeline.id);

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
				selectedObjectIds: this.activePipeline.getSelectedObjectIds(),
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
			.on("mousedown", (d3Event, dec) => (dec.hotspot && d3Event.button === 0 ? that.callDecoratorCallback(d3Event, d, dec) : null))
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
		this.updateDecJsxObjs(dec, decSel, objType, d);
	}

	updateDecOutlines(dec, decSel, objType, d) {
		let outlnSel = decSel.selectChild("rect");

		if (!dec.label && !dec.path && !dec.jsx && dec.outline !== false) {
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
				.each(() => this.setDecImageContent(imageSel, dec.image));
		} else {
			imageSel.remove();
		}
	}

	updateDecLabels(dec, decSel, objType, d) {
		let labelSel = decSel.selectChild(".d3-foreign-object-dec-label");

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

	updateDecJsxObjs(dec, decSel, objType, d) {
		let extSel = decSel.selectChild(".d3-foreign-object-dec-jsx");

		if (dec.jsx) {
			if (extSel.empty()) {
				extSel = decSel
					.append("foreignObject")
					.attr("class", "d3-foreign-object-dec-jsx")
					.attr("tabindex", -1)
					.attr("x", 0)
					.attr("y", 0)
					.call(this.attachDecLabelListeners.bind(this, d, objType));
			}
			extSel
				.attr("width", this.decUtils.getDecWidth(dec, d, objType))
				.attr("height", this.decUtils.getDecHeight(dec, d, objType))
				.each((decData, idx, exts) =>
					this.externalUtils.addDecExternalObject(decData, idx, exts));
		} else {
			extSel.each((decData, idx, exts) =>
				this.externalUtils.removeExternalObject(decData, idx, exts));
			extSel.remove();
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
				if (this.canOpenTip(TIP_TYPE_DEC) && dec.tooltip) {
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
			.on("mouseleave", (d3Event, dec) => {
				if (this.canOpenTip(TIP_TYPE_DEC) && dec.tooltip) {
					this.canvasController.closeTip();
				}
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
	// passed in specified by imgs[i].
	setNodeImageContent(node, i, imgs) {
		const image = this.getNodeImage(node);
		const imageType = this.getImageType(image);

		if (imageType === "jsx") {
			this.externalUtils.addNodeImageExternalObject(image, i, imgs);
		} else {
			const imageSel = d3.select(imgs[i]);
			this.setImageContent(imageSel, image, imageType);
		}
	}

	// Sets the image specified for the decoration into the D3 selection
	// of the decoration image.
	setDecImageContent(imageSel, image) {
		const imageType = this.getImageType(image);
		this.setImageContent(imageSel, image, imageType);
	}

	// Sets the image passed in into the D3 image selection passed in. This loads
	// svg files as inline SVG while other image files are loaded with href.
	setImageContent(imageSel, image, imageType) {
		if (image !== imageSel.attr("data-image")) {
			// Save image field in DOM object to avoid unnecessary image refreshes.
			imageSel.attr("data-image", image);
			if (imageType === "svg") {
				if (this.config.enableImageDisplay === "LoadSVGToDefs") {
					this.loadSVGToDefs(imageSel, image);

				} else {
					imageSel.selectChild("svg").remove();
					d3.svg(image, { cache: "force-cache" }).then((data) => {
						imageSel.node().append(data.documentElement);
					});
				}
			} else {
				imageSel.attr("xlink:href", image);
			}
		}
	}

	// The default behavior for SVG files is to load them in-line regardless
	// of how many times a unique image is used for a particular flow. This
	// can be unnecessarily slow if an image is referenced many times. This
	// method provides a performance enhancement for displaying SVG images.
	// It stores each unique SVG file encountered in the <defs> element for the
	// canvas as a <symbol> element. It then adds <use> elements to each place
	// where that image is referenced. So, if the same image is referenced many
	// times there is just one symbol for the SVG file stored in the <defs>
	// element. This is faster but can restrict customization capabilities of
	// the canvas images.
	loadSVGToDefs(imageSel, image) {
		const symbolId = "img" + image.replaceAll(/[/.]/g, "-"); // Replace all / and . characters with -
		const symbolSelector = "#" + symbolId;
		const symbol = this.canvasDefs.selectChildren(symbolSelector);
		// If no symbol exists in <defs> for this image, add a place holder
		// <symbol> for it.
		if (symbol.empty()) {
			this.canvasDefs.append("symbol").attr("id", symbolId);

			d3.svg(image, { cache: "force-cache" }).then((data) => {
				// Asynchronously, populate placeholder <symbol> with SVG file contents.
				this.canvasDefs.selectChildren(symbolSelector)
					.node()
					.append(data.documentElement);
			});
		}

		// Use <symbol> containing our SVG image from <defs>
		imageSel.selectChild("use").remove();
		imageSel.append("use").attr("href", symbolSelector);
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

	// Returns the type of image passed in, either "svg" or "image" or
	// "jsx" or null (if no image was provided).
	// This will be used to append an svg or image element to the DOM.
	getImageType(nodeImage) {
		if (nodeImage) {
			if (typeof nodeImage === "object") {
				if (this.externalUtils.isValidJsxElement(nodeImage)) {
					return "jsx";
				}
			} else if (typeof nodeImage === "string") {
				return	nodeImage.endsWith(".svg") && this.config.enableImageDisplay !== "SVGAsImage" ? "svg" : "image";
			}
		}
		return null;
	}

	// Returns a DOM element for the image of the node passed in to be appended
	// to the node element.
	getImageElement(node) {
		const nodeImage = this.getNodeImage(node);
		const imageType = this.getImageType(nodeImage);

		if (imageType === "jsx") {
			return d3.create("svg:foreignObject")
				.attr("tabindex", -1)
				.attr("class", "d3-foreign-object-node-image d3-node-image")
				.node();

		} else if (imageType === "svg") {
			return d3.create("svg")
				.attr("class", "d3-node-image")
				.node();

		}
		// If imageType is "image" or null, we create an image element
		return d3.create("svg:image")
			.attr("class", "d3-node-image")
			.node();
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

	getPortRadius(d) {
		return CanvasUtils.isSuperBindingNode(d) ? this.getBindingPortRadius() : d.layout.portRadius;
	}

	// Returns the radius size of the supernode binding ports scaled up by
	// the zoom scale amount to give the actual size.
	getBindingPortRadius() {
		return this.canvasLayout.supernodeBindingPortRadius / this.zoomUtils.getZoomScale();
	}

	addDynamicNodeIcons(d3Event, d, nodeGrp) {
		if (!this.isSizing() && !CanvasUtils.isSuperBindingNode(d)) {
			// Add the ellipsis icon if requested by layout config.
			if (d.layout.ellipsisDisplay) {
				this.addEllipsisIcon(d, nodeGrp);
			}

			// Add Supernode expansion icon and background for expanded supernodes
			if (CanvasUtils.isExpandedSupernode(d)) {
				this.addSuperNodeFullPageIcon(nodeGrp);
			}
		}
	}

	getDefaultContextToolbarPos(objType, d) {
		if (objType === "link") {
			return { ...d.pathInfo.centerPoint };

		} else if (objType === "node" && d.layout.contextToolbarPosition === "topCenter" && !d.is_expanded) {
			return { x: d.x_pos + (d.width / 2), y: d.y_pos };

		}
		return { x: d.x_pos + d.width, y: d.y_pos };
	}

	addContextToolbar(d3Event, d, objType, xPos, yPos) {
		if (!this.isSizing() && !this.isDragging() &&
				!this.svgCanvasTextArea.isEditingText() && !CanvasUtils.isSuperBindingNode(d)) {
			this.canvasController.setMouseInObject(d.id);
			let pos = this.getDefaultContextToolbarPos(objType, d);
			pos.x = xPos ? pos.x + xPos : pos.x;
			pos.y = yPos ? pos.y + yPos : pos.y;
			pos = this.zoomUtils.unTransformPos(pos);
			this.openContextMenu(d3Event, objType, d, null, pos);
		}
	}

	removeContextToolbar() {
		this.canvasController.setMouseInObject(null);
		if (this.canvasController.isContextMenuDisplayed()) {
			setTimeout(() => this.canvasController.closeContextToolbar(), 200);
		}
	}

	recreateContextToolbar(d3Event, d, objType) {
		if (this.config.enableContextToolbar) {
			this.removeContextToolbar();
			this.addContextToolbar(d3Event, d, objType);
		}
	}

	addEllipsisIcon(d, nodeGrp) {
		const ellipsisGrp = nodeGrp
			.append("g")
			.attr("class", "d3-node-ellipsis-group")
			.attr("transform", (nd) => this.nodeUtils.getNodeEllipsisTranslate(nd))
			.on("mousedown", (d3Event) => {
				CanvasUtils.stopPropagationAndPreventDefault(d3Event);
				this.ellipsisClicked = true;
				this.selectObjectD3Event(d3Event, d, "node");
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
	}

	addSuperNodeFullPageIcon(nodeGrp) {
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
				this.canvasController.createBreadcrumb(supernodeDatum, parentPipelineId)
			);

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
			.attr("transform", (port) => this.getInputPortArrowPathTransform(port));
	}

	// Returns true if the port (from a node template) passed in has a max
	// cardinaility of zero. If cardinality or cardinality.max is missing the
	// max is considered to be non-zero.
	isPortMaxCardinalityZero(port) {
		return (get(port, "app_data.ui_data.cardinality.max", 1) === 0);
	}

	isMouseOverContextToolbar(d3Event) {
		return this.getElementWithClassAtMousePos(d3Event, "context-toolbar");
	}

	removeDynamicNodeIcons(d3Event, d, nodeGrp) {
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
				this.selectionInfo,
				this.breadcrumbs,
				this.nodeLayout,
				this.canvasLayout,
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

	// Opens either the context menu or the context toolbar depending on which is
	// currently enabled.
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
			selectedObjectIds: this.canvasController.getSelectedObjectIds(),
			addBreadcrumbs: (d && d.type === SUPER_NODE) ? this.getSupernodeBreadcrumbs(d3Event.currentTarget) : null,
			port: port,
			zoom: this.zoomUtils.getZoomScale() });
	}

	// Closes the conetext menu if open. Called by various drag utility
	// classes.
	closeContextMenuIfOpen() {
		if (this.canvasController.isContextMenuDisplayed()) {
			this.canvasController.closeContextMenu();
		}
		if (this.config.enableContextToolbar) {
			this.removeContextToolbar();
		}
	}

	callDecoratorCallback(d3Event, node, dec) {
		d3Event.stopPropagation();
		if (this.canvasController.decorationActionHandler) {
			this.canvasController.decorationActionHandler(node, dec.id, this.activePipeline.id);
		}
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
					portRadius = this.canvasLayout.supernodeBindingPortRadius / this.zoomUtils.getZoomScale();
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
		} else if (this.canvasLayout.linkDirection === LINK_DIR_RIGHT_LEFT) {
			return this.getPortArcsNodeShapePathHoriz(data, data.outputs, data.outputPortsHeight, data.inputs, data.inputPortsHeight);
		}

		return this.getPortArcsNodeShapePathHoriz(data, data.inputs, data.inputPortsHeight, data.outputs, data.outputPortsHeight);
	}

	// Returns a path that will draw the outline shape for the 'port-arcs' display
	// which shows arcs around each of the node circles for the horizontal (LeftRight and RightLeft) directions.
	getPortArcsNodeShapePathHoriz(data, leftPorts, leftPortsHeight, rightPorts, rightPortsHeight) {
		let path = "M 0 0 L " + data.width + " 0 "; // Draw line across the top of the node

		if (rightPorts && rightPorts.length > 0) {
			let endPoint = data.layout.portArcOffset;

			// Draw straight segment down to ports (if needed)
			if (rightPortsHeight < data.height) {
				endPoint = rightPorts[0].cy - data.layout.portArcRadius;
			}

			path += " L " + data.width + " " + endPoint;

			// Draw port arcs
			rightPorts.forEach((port, index) => {
				endPoint += (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 1 " + data.width + " " + endPoint;
				if (index < rightPorts.length - 1) {
					endPoint += data.layout.portArcSpacing;
					path += " L " + data.width + " " + endPoint;
				}
			});

			// Draw finishing segment to bottom right corner
			path += " L " + data.width + " " + data.height;

		// If no right-side ports just draw a straight line.
		} else {
			path += " L " + data.width + " " + data.height;
		}

		path += " L 0 " + data.height; // Draw line across the bottom of the node

		if (leftPorts && leftPorts.length > 0) {
			let endPoint2 = data.height - data.layout.portArcOffset;

			if (leftPortsHeight < data.height) {
				endPoint2 = leftPorts[leftPorts.length - 1].cy + data.layout.portArcRadius;
			}

			path += " L 0 " + endPoint2;

			leftPorts.forEach((port, index) => {
				endPoint2 -= (data.layout.portArcRadius * 2);
				path += " A " + data.layout.portArcRadius + " " + data.layout.portArcRadius + " 180 0 1 0 " + endPoint2;
				if (index < leftPorts.length - 1) {
					endPoint2 -= data.layout.portArcSpacing;
					path += " L 0 " + endPoint2;
				}
			});

			path += " Z"; // Draw finishing segment back to origin
		} else {
			path += " Z"; // If no left-side ports just draw a straight line.
		}
		return path;
	}

	// Returns a path that will draw the outline shape for the 'port-arcs' display
	// which shows arcs around each of the node circles for vertical (TopBottom and BottomTop) directions.
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

		// If no bottom ports just draw a straight line.
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
			path += " Z"; // If no top ports just draw a straight line.
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
		if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM ||
				this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			this.setPortPositionsVertical(
				node, node.inputs, node.inputPortsWidth,
				node.layout.inputPortPositions,
				node.layout.inputPortAutoPosition);
			this.setPortPositionsVertical(
				node, node.outputs, node.outputPortsWidth,
				node.layout.outputPortPositions,
				node.layout.outputPortAutoPosition,
				this.config.enableSingleOutputPortDisplay);

		} else {
			this.setPortPositionsHoriz(
				node, node.inputs, node.inputPortsHeight,
				node.layout.inputPortPositions,
				node.layout.inputPortAutoPosition);
			this.setPortPositionsHoriz(
				node, node.outputs, node.outputPortsHeight,
				node.layout.outputPortPositions,
				node.layout.outputPortAutoPosition,
				this.config.enableSingleOutputPortDisplay);
		}
	}

	setPortPositionsVertical(node, ports, portsWidth, portPositions, autoPosition, displaySinglePort = false) {
		if (ports && ports.length > 0) {
			const xPos = this.nodeUtils.getNodePortPosX(portPositions[0], node);
			const yPos = this.nodeUtils.getNodePortPosY(portPositions[0], node);

			if (node.width <= node.layout.defaultNodeWidth &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
				ports[0].dir = CanvasUtils.getPortDir(ports[0].cx, ports[0].cy, node);
			} else {
				// If we are only going to display a single port, we set all the
				// port positions to be the same as if there is only one port.
				if (displaySinglePort) {
					this.setPortPositionsVerticalDisplaySingle(node, ports, xPos, yPos);

				} else if (autoPosition || CanvasUtils.isExpandedSupernode(node)) {
					this.setPortPositionsVerticalAuto(node, ports, portsWidth, yPos);

				} else {
					this.setPortPositionsCustom(ports, portPositions, node, xPos, yPos);
				}
			}
		}
	}

	// If only a single port is to be displayed, this methods sets the x and y
	// coordinates of all the ports to the same values appropriately for either
	// regular nodes or expanded supernodes.
	setPortPositionsVerticalDisplaySingle(node, ports, xPos, yPos) {
		let xPosition = 0;
		if (CanvasUtils.isExpandedSupernode(node)) {
			const widthSvgArea = node.width - (2 * this.canvasLayout.supernodeSVGAreaPadding);
			xPosition = widthSvgArea / 2;

		} else {
			xPosition = xPos;
		}

		ports.forEach((p) => {
			p.cx = xPosition;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}

	// Sets the ports x and y coordinates for regular and expanded supernodes
	// when all ports are displayed in a normal manner (as opposed to when a
	// single port is displayed).
	setPortPositionsVerticalAuto(node, ports, portsWidth, yPos) {
		let xPosition = 0;

		if (CanvasUtils.isExpandedSupernode(node)) {
			const widthSvgArea = node.width - (2 * this.canvasLayout.supernodeSVGAreaPadding);
			const remainingSpace = widthSvgArea - portsWidth;
			xPosition = this.canvasLayout.supernodeSVGAreaPadding + (remainingSpace / 2);

		} else if (portsWidth < node.width) {
			xPosition = (node.width - portsWidth) / 2;
		}

		xPosition += node.layout.portArcOffset;

		// Sub-flow binding node ports need to be spaced by the inverse of the
		// zoom amount so that, after zoomToFit on the in-place sub-flow the
		// binding node ports line up with those on the supernode. This is only
		// necessary with binding nodes with mutiple ports.
		let multiplier = 1;
		if (CanvasUtils.isSuperBindingNode(node)) {
			multiplier = 1 / this.zoomUtils.getZoomScale();
		}
		ports.forEach((p) => {
			xPosition += (node.layout.portArcRadius * multiplier);
			p.cx = xPosition;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
			xPosition += ((node.layout.portArcRadius + node.layout.portArcSpacing) * multiplier);
		});
	}

	setPortPositionsHoriz(node, ports, portsHeight, portPositions, autoPosition, displaySinglePort = false) {
		if (ports && ports.length > 0) {
			const xPos = this.nodeUtils.getNodePortPosX(portPositions[0], node);
			const yPos = this.nodeUtils.getNodePortPosY(portPositions[0], node);

			if (node.height <= node.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cx = xPos;
				ports[0].cy = yPos;
				ports[0].dir = CanvasUtils.getPortDir(ports[0].cx, ports[0].cy, node);

			} else {
				// If we are only going to display a single port, we set all the
				// port positions to be the same as if there is only one port.
				if (displaySinglePort) {
					this.setPortPositionsHorizDisplaySingle(node, ports, xPos, yPos);

				} else if (autoPosition || CanvasUtils.isExpandedSupernode(node)) {
					this.setPortPositionsHorizAuto(node, ports, portsHeight, xPos);

				} else {
					this.setPortPositionsCustom(ports, portPositions, node, xPos, yPos);
				}
			}
		}
	}

	// If only a single port is to be displayed, this methods sets the x and y
	// coordinates of all the ports to the same values appropriately for either
	// regular nodes or expanded supernodes.
	setPortPositionsHorizDisplaySingle(node, ports, xPos, yPos) {
		let yPosition = 0;
		if (CanvasUtils.isExpandedSupernode(node)) {
			const heightSvgArea = node.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding;
			yPosition = this.canvasLayout.supernodeTopAreaHeight + (heightSvgArea / 2);

		} else {
			yPosition = yPos;
		}

		ports.forEach((p) => {
			p.cx = xPos;
			p.cy = yPosition;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}

	// Sets the ports x and y coordinates for regular and expanded supernodes
	// when all ports are displayed in a normal manner (as opposed to when a
	// single port is displayed).
	setPortPositionsHorizAuto(node, ports, portsHeight, xPos) {
		let yPosition = 0;

		if (CanvasUtils.isExpandedSupernode(node)) {
			const heightSvgArea = node.height - this.canvasLayout.supernodeTopAreaHeight - this.canvasLayout.supernodeSVGAreaPadding;
			const remainingSpace = heightSvgArea - portsHeight;
			yPosition = this.canvasLayout.supernodeTopAreaHeight + (remainingSpace / 2);

		} else if (portsHeight < node.height) {
			yPosition = (node.height - portsHeight) / 2;
		}

		yPosition += node.layout.portArcOffset;

		// Sub-flow binding node ports need to be spaced by the inverse of the
		// zoom amount so that, after zoomToFit on the in-place sub-flow the
		// binding node ports line up with those on the supernode. This is only
		// necessary with binding nodes with mutiple ports.
		let multiplier = 1;
		if (CanvasUtils.isSuperBindingNode(node)) {
			multiplier = 1 / this.zoomUtils.getZoomScale();
		}
		ports.forEach((p) => {
			yPosition += (node.layout.portArcRadius * multiplier);
			p.cx = xPos;
			p.cy = yPosition;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
			yPosition += ((node.layout.portArcRadius + node.layout.portArcSpacing) * multiplier);
		});
	}

	// Sets the node's port positions based on the custom positions provided
	// by the application in the portPositions array.
	setPortPositionsCustom(ports, portPositions, node, zerothX, zerothY) {
		let xPos = zerothX;
		let yPos = zerothY;

		ports.forEach((p, i) => {
			// No need to recalculate the zeroth position AND if there are more
			// ports than portPositions just use the last port position for all
			// subsequent ports.
			if (i > 0 && i < portPositions.length) {
				xPos = this.nodeUtils.getNodePortPosX(portPositions[i], node);
				yPos = this.nodeUtils.getNodePortPosY(portPositions[i], node);
			}
			p.cx = xPos;
			p.cy = yPos;
			p.dir = CanvasUtils.getPortDir(p.cx, p.cy, node);
		});
	}

	// Displays all the comments on the canvas either by creating new comments,
	// updating existing comments or removing unwanted comments.
	displayComments() {
		this.logger.logStartTimer("displayComments " + this.getFlags());

		const selection = this.getAllCommentGroupsSelection();
		this.displayCommentsSubset(selection, this.activePipeline.comments);

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
		this.logger.logStartTimer("displayCommentsSelectionStatus");

		this.getAllCommentGroupsSelection()
			.selectChildren(".d3-comment-selection-highlight")
			.attr("data-selected", (c) => (this.activePipeline.isSelected(c.id) ? "yes" : "no"));

		this.logger.logEndTimer("displayCommentsSelectionStatus");
	}

	displaySingleComment(comment) {
		const selection = this.getCommentGroupSelectionById(comment.id);
		this.displayCommentsSubset(selection, [comment]);
	}

	displayCommentsSubset(selection, data) {
		const newData = this.canvasInfo.hideComments ? [] : data;
		selection
			.data(newData, (c) => c.id)
			.join(
				(enter) => this.createComments(enter)
			)
			.attr("transform", (c) => `translate(${c.x_pos}, ${c.y_pos})`)
			.attr("class", (c) => this.getCommentGroupClass(c))
			.call((joinedCommentGrps) => this.updateComments(joinedCommentGrps));
	}

	createComments(enter) {
		this.logger.logStartTimer("createComments");

		const newCommentGroups = enter
			.append("g")
			.attr("data-id", (c) => this.getId("comment_grp", c.id))
			.call(this.attachCommentGroupListeners.bind(this));

		this.logger.logEndTimer("createComments");

		return newCommentGroups;
	}

	updateComments(joinedCommentGrps) {
		this.logger.logStartTimer("updateComments");

		// Comment Sizing Area
		joinedCommentGrps
			.selectChildren(".d3-comment-sizing")
			.data((d) => ([d]), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("rect")
						.attr("class", "d3-comment-sizing")
						.call(this.attachCommentSizingListeners.bind(this))
			)
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("x", -this.canvasLayout.commentSizingArea)
			.attr("y", -this.canvasLayout.commentSizingArea)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentSizingArea))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentSizingArea))
			.attr("class", "d3-comment-sizing");

		// Comment Selection Highlighting Outline
		joinedCommentGrps
			.selectChildren(".d3-comment-selection-highlight")
			.data((d) => ([d]), (d) => d.id)
			.join(
				(enter) =>
					enter
						.append("rect")
						.attr("class", "d3-comment-selection-highlight")
			)
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("x", -this.canvasLayout.commentHighlightGap)
			.attr("y", -this.canvasLayout.commentHighlightGap)
			.attr("height", (c) => c.height + (2 * this.canvasLayout.commentHighlightGap))
			.attr("width", (c) => c.width + (2 * this.canvasLayout.commentHighlightGap))
			.attr("data-selected", (c) => (this.activePipeline.isSelected(c.id) ? "yes" : "no"))
			.attr("style", (d) => this.getNodeSelectionOutlineStyle(d, "default"));

		// Comment Text
		joinedCommentGrps
			.selectChildren(".d3-foreign-object-comment-text")
			.data((d) => [d], (d) => d.id)
			.join(
				(enter) => {
					const fo = enter
						.append("foreignObject")
						.attr("class", (d) => "d3-foreign-object-comment-text")
						.attr("x", 0)
						.attr("y", 0);
					fo
						.append("xhtml:div") // Provide a namespace when div is inside foreignObject
						.attr("class", "d3-comment-text-scroll")
						.append("xhtml:div") // Provide a namespace when div is inside foreignObject
						.attr("class", "d3-comment-text-outer")
						.append("xhtml:div") // Provide a namespace when div is inside foreignObject
						.attr("class", (d) => "d3-comment-text" + (d.contentType !== WYSIWYG ? " markdown" : ""));
					return fo;
				}
			)
			.datum((c) => this.activePipeline.getComment(c.id))
			.attr("width", (c) => c.width)
			.attr("height", (c) => c.height)

			.select(".d3-comment-text-scroll")
			.each((d, i, commentTexts) => {
				const commentElement = d3.select(commentTexts[i]);
				CanvasUtils.applyOutlineStyle(commentElement, d.formats); // Only apply outlineStyle format here
			})

			.select(".d3-comment-text-outer")
			.select(".d3-comment-text")
			.attr("style", null) // Wipe the in-line styles before applying formats

			.each((d, i, commentTexts) => {
				const commentElement = d3.select(commentTexts[i]);
				CanvasUtils.applyNonOutlineStyle(commentElement, d.formats); // Apply all formats except outlineStyle

			})

			.html((d) =>
				(d.contentType !== WYSIWYG && this.config.enableMarkdownInComments
					? markdownIt.render(d.content)
					: escapeText(d.content))
			);

		// Add or remove drag object behavior for the comment groups.
		if (this.config.enableEditingActions) {
			const handler = this.dragObjectUtils.getDragObjectHandler();
			joinedCommentGrps
				.call(handler);
		} else {
			joinedCommentGrps
				.on(".drag", null);
		}
	}

	// Attaches the appropriate listeners to the comment groups.
	attachCommentGroupListeners(commentGrps) {
		commentGrps
			.on("mouseenter", (d3Event, d) => {
				if (this.isDragging()) {
					return;
				}
				if (this.config.enableEditingActions && d.id !== this.svgCanvasTextArea.getEditingTextId()) {
					this.createCommentPort(d3Event.currentTarget, d);
				}
				if (this.config.enableContextToolbar) {
					this.addContextToolbar(d3Event, d, "comment");
				}
				if (this.commentHasScrollableText(d3Event.currentTarget)) {
					this.removeCanvasZoomBehavior(); // Remove canvas zoom behavior to allow scrolling of comment
				}
			})
			.on("mouseleave", (d3Event, d) => {
				if (this.config.enableContextToolbar) {
					this.removeContextToolbar();
				}
				if (this.config.enableEditingActions) {
					this.deleteCommentPort(d3Event.currentTarget);
				}

				this.addCanvasZoomBehavior(); // Add back zoom behavior to reenable canvas zooming
			})
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.logStartTimer("Comment Group - mouse down");

				d3Event.stopPropagation();
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing(d3Event);
				}
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d, "comment");
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
						selectedObjectIds: this.activePipeline.getSelectedObjectIds(),
						pipelineId: this.activePipeline.id });
				}
			})
			.on("contextmenu", (d3Event, d) => {
				this.logger.log("Comment Group - context menu");
				// With enableDragWithoutSelect set to true, the object for which the
				// context menu is being requested needs to be implicitely selected.
				if (this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d, "comment");
				}
				this.openContextMenu(d3Event, "comment", d);
			});
	}

	// Returns true if the comment has scrollable text or not. That is if the contents
	// of the comment's scroll <div> is bigger that the scroll <div> can accommodate.
	// When a comment is being edited, it will have a foreignObject containing its own
	// scroll <div> over the top of the foreignObject used to display the comment.
	commentHasScrollableText(element) {
		// Look for entry foreign object first because, if present it will be over the top
		// of the display foreign object and it will be handling scrollable text.
		let scrollDiv = element.getElementsByClassName("d3-comment-text-entry-scroll");
		if (!scrollDiv[0]) {
			scrollDiv = element.getElementsByClassName("d3-comment-text-scroll");
		}
		if (scrollDiv[0].clientHeight < scrollDiv[0].scrollHeight) {
			return true;
		}
		return false;
	}

	attachCommentSizingListeners(commentGrps) {
		commentGrps
			.on("mousedown", (d3Event, d) => {
				this.dragObjectUtils.mouseDownCommentSizingArea();
			})
			// Use mousemove and mouseenter so the cursor will change
			// if the pointer moves from one area of the node outline to another
			// (eg. from east area to north-east area) without exiting the node outline.
			// A mouseenter is triggered when the sizing operation stops and the
			// pointer leaves the temporary overlay (which is removed) and enters
			// the node outline.
			.on("mousemove mouseenter", (d3Event, d) => {
				this.dragObjectUtils.mouseEnterCommentSizingArea(d3Event, d);
			})
			.on("mouseleave", (d3Event, d) => {
				this.dragObjectUtils.mouseLeaveCommentSizingArea(d3Event, d);
			});
	}

	// Creates a port object (a grey circle in the top left corner of the
	// comment for creating links to nodes) for the comment asscoiated with
	// the comment group object passed in.
	createCommentPort(commentObj, d) {
		const commentGrp = d3.select(commentObj);

		const commentPort = commentGrp
			.append("circle")
			.attr("cx", (com) => com.width / 2)
			.attr("cy", (com) => com.height + this.canvasLayout.commentHighlightGap)
			.attr("r", this.canvasLayout.commentPortRadius)
			.attr("class", "d3-comment-port-circle");

		if (this.config.enableEditingActions) {
			const handler = this.dragNewLinkUtils.getDragNewLinkHandler();
			commentPort.call(handler);
		} else {
			commentPort.on(".drag", null);
		}
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
		comGrp.selectChildren(".d3-comment-text").attr("style", style);
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
		comment.autoSize = this.canvasLayout.commentAutoSize; // TODO - read from comment layout when canvas layout is refactored.
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
		if (this.regionSelect || this.isSizing()) {
			return true;
		}
		if (this.supernodeInfo.renderer) {
			if (this.supernodeInfo.renderer.isRegionSelectOrSizingInProgress()) {
				return true;
			}
		}
		return false;
	}

	// Displays all the links on the canvas either by creating new links,
	// updating existing links or removing unwanted links.
	displayLinks() {
		this.logger.logStartTimer("displayLinks");

		const linksArray = this.buildLinksArray();
		const selection = this.getAllLinkGroupsSelection();
		this.displayLinksSubset(selection, linksArray);

		this.logger.logEndTimer("displayLinks");
	}

	displayLinksSelectionStatus() {
		this.logger.logStartTimer("displayLinksSelectionStatus");

		if (this.config.enableLinkSelection !== LINK_SELECTION_NONE) {
			this.getAllLinkGroupsSelection()
				.attr("data-selected", (d) => (this.activePipeline.isSelected(d.id) ? true : null));
		}

		this.logger.logEndTimer("displayLinksSelectionStatus");
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
			.attr("data-selected", (d) => (this.activePipeline.isSelected(d.id) ? true : null))
			.call((joinedLinkGrps) => {
				this.updateLinks(joinedLinkGrps, linksArray);
			});
	}

	// Creates all newly created links specified in the enter selection.
	createLinks(enter) {
		this.logger.logStartTimer("createLinks");
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
							(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead))
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

		this.logger.logEndTimer("createLinks");

		return newLinkGrps;
	}

	// Updates all the link groups (and descendant objects) in the joinedLinkGrps
	// selection object. The selection object will contain newly created links
	// as well as existing links.
	updateLinks(joinedLinkGrps, lineArray) {
		this.logger.logStartTimer("updateLinks");
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
							(d.type === COMMENT_LINK && this.canvasLayout.commentLinkArrowHead))
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
				const decorations = this.shouldDisplayAltDecorations(d)
					? this.canvasLayout.linkAltDecorations
					: d.decorations;
				this.displayDecorations(d, DEC_LINK, linkGrp, decorations);
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

		if (!this.isMoving() && !this.isSizing() && !this.config.enableLinksOverNodes) {
			this.setDisplayOrder(joinedLinkGrps);
		}

		this.logger.logEndTimer("updateLinks");
	}

	attachLinkGroupListeners(linkGrps) {
		linkGrps
			.on("mousedown", (d3Event, d, index, links) => {
				this.logger.log("Link Group - mouse down");
				if (this.svgCanvasTextArea.isEditingText()) {
					this.svgCanvasTextArea.completeEditing(d3Event);
				}
				if (this.config.enableLinkSelection !== LINK_SELECTION_NONE) {
					this.selectObjectD3Event(d3Event, d, "link");
				}
				d3Event.stopPropagation(); // Stop event going to canvas when enableEditingActions is false
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
					this.selectObjectD3Event(d3Event, d, "link");
				}
				this.openContextMenu(d3Event, "link", d);
			})
			.on("mouseenter", (d3Event, link) => {
				if (this.isDragging()) {
					return;
				}

				const targetObj = d3Event.currentTarget;

				if (this.config.enableLinkSelection === LINK_SELECTION_HANDLES ||
						this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) {
					this.raiseLinkToTop(targetObj);
				}
				this.setLinkLineStyles(targetObj, link, "hover");

				if (this.config.enableContextToolbar) {
					this.addContextToolbar(d3Event, link, "link",
						this.canvasLayout.linkContextToolbarPosX,
						this.canvasLayout.linkContextToolbarPosY
					);
				}
			})
			// This will be called when the mouse cursor enters the link or moves out of
			// child elements of the link. Some child elements, like decorations, may have
			// their own tooltips so this will redisplay the link tooltip on exiting the decoration.
			.on("mouseover", (d3Event, link) => {
				d3Event.stopPropagation(); // Stop propagation in case we are in a sub-flow
				if (this.canOpenTip(TIP_TYPE_LINK)) {
					const tipId = this.canvasController.getTipId(); // Id of current tip or null
					const linkTipId = this.getId("link_tip", link.id);

					if (tipId === null || tipId !== linkTipId) {
						this.canvasController.closeTip();
						this.canvasController.openTip({
							id: linkTipId,
							type: TIP_TYPE_LINK,
							targetObj: d3Event.currentTarget,
							mousePos: { x: d3Event.clientX, y: d3Event.clientY },
							pipelineId: this.activePipeline.id,
							link: link
						});
					}
				}
			})
			.on("mouseleave", (d3Event, link) => {
				const targetObj = d3Event.currentTarget;

				// isEditingText is used to check whether Label Decoration is in Edit Mode
				// to avoid Decoration Textarea to be closed on mouseleave.
				if (!targetObj.getAttribute("data-selected") && !this.config.enableLinksOverNodes && !this.isEditingText()) {
					this.lowerLinkToBottom(targetObj);
				}
				this.setLinkLineStyles(targetObj, link, "default");
				this.canvasController.closeTip();

				if (this.config.enableContextToolbar) {
					this.removeContextToolbar();
				}
			});
	}

	// Returns true if the alternative decorations for the link line
	// should be displayed.
	shouldDisplayAltDecorations(link) {
		return (this.canvasLayout.linkAltDecorations &&
			CanvasUtils.getLinkDistance(link) < this.canvasLayout.linkDistanceForAltDecorations);
	}

	// Creates a new start handle and a new end handle for the link groups
	// passed in.
	createNewHandles(handlesGrp) {
		handlesGrp
			.append(this.canvasLayout.linkStartHandleObject)
			.attr("class", (d) => "d3-link-handle-start")
			.call(this.attachStartHandleListeners.bind(this));

		handlesGrp
			.append(this.canvasLayout.linkEndHandleObject)
			.attr("class", (d) => "d3-link-handle-end")
			.call(this.attachEndHandleListeners.bind(this));
	}

	// Updates the start and end link handles for the handle groups passed in.
	updateHandles(handlesGrp, lineArray) {
		const startHandle = handlesGrp
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

		// Add or remove drag behavior as appropriate
		if (this.config.enableEditingActions) {
			const handler = this.dragDetLinkUtils.getDragDetachedLinkHandler();
			startHandle.call(handler);
		} else {
			startHandle.on(".drag", null);
		}

		const endHandle = handlesGrp
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

		// Add or remove drag behavior as appropriate
		if (this.config.enableEditingActions) {
			const handler = this.dragDetLinkUtils.getDragDetachedLinkHandler();
			endHandle.call(handler);
		} else {
			endHandle.on(".drag", null);
		}
	}

	// Attaches any required event listeners to the start handles of the links.
	attachStartHandleListeners(startHandles) {
		startHandles
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link start handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d, "link");
				}
				this.logger.log("Link end handle - finished mouse down");
			});
	}

	// Attaches any required event listeners to the end handles of the links.
	attachEndHandleListeners(endHandles) {
		endHandles
			// Use mouse down instead of click because it gets called before drag start.
			.on("mousedown", (d3Event, d) => {
				this.logger.log("Link end handle - mouse down");
				if (!this.config.enableDragWithoutSelect) {
					this.selectObjectD3Event(d3Event, d, "link");
				}
				this.logger.log("Link end handle - finished mouse down");
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
		return "d3-link-group " + this.getLinkTypeClass(d) + " " + this.getLinkBranchHighlightCLass(d) + " " + this.getLinkCustomClass(d);
	}

	// Returns the class to be used for branch highlighting if the branchHighlight flag id set for the link.
	getLinkBranchHighlightCLass(d) {
		return (d.branchHighlight ? "d3-branch-highlight" : "");
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
				d.class_name !== "d3-comment-rect") { // Left in for historical reasons
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

		const branchHighlightClass = d.branchHighlight ? " d3-branch-highlight" : "";

		return "d3-node-group" + supernodeClass + resizeClass + draggableClass + branchHighlightClass + customClass;
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

	// Raises the node, specified by the node ID, above other nodes and objects.
	// Called by external utils.
	raiseNodeToTopById(nodeId) {
		this.getNodeGroupSelectionById(nodeId).raise();
	}

	// Raises the node above other nodes and objects (on the mouse entering
	// the node). This is necessary for apps that have ports that protrude from
	// the side of the node and where those nodes may be positioned close to each
	// other so it makes the ports appear on top of any adjacent node. We don't
	// raise the nodes for various conditions:
	// * The enableRaiseNodesToTopOnHover config option is set to false
	// * We are currently dragging to create a new link, or to move objects or detached links
	// * There are one or more selected links
	// * We are editing text
	// * The app has indicated links should be displayed over nodes
	raiseNodeToTop(nodeGrp) {
		if (this.config.enableRaiseNodesToTopOnHover &&
			!this.isDragging() &&
			this.activePipeline.getSelectedLinksCount() === 0 &&
			!this.isEditingText() &&
			!this.config.enableLinksOverNodes
		) {
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
		// Add handles-detachable-hover class to avoid firefox hover issue
		d3.select(obj)
			.raise()
			.classed("handles-detachable-hover", true);
	}

	lowerLinkToBottom(obj) {
		// Remove handles-detachable-hover class to avoid firefox hover issue
		d3.select(obj)
			.lower()
			.classed("handles-detachable-hover", false);
	}

	// Returns true if the link passed in has one or more decorations.
	hasOneDecorationOrMore(link) {
		return link.decorations && link.decorations.length > 0;
	}

	// Returns an array of links taken from the active pipeline, that contain
	// additional fields to describe how the link line should be drawn.
	// Additional fields
	// -----------------
	// These are added by the updateFreeformLinksForNodes function:
	// srcFreeformInfo - Added for freeform links. Indicates the starting point of the
	//                   link line used so the starts don't bunch up together if more
	//                   than one link enters or exits on one side of the node.
	// trgFreeformInfo - Added for freeform links. Indicates the ending point of the
	//                   link line used so the ends don't bunch up together if more
	//                   than one link enters or exists on one side of the node.
	//
	// These are added by the getAttachedLinkObj and getDetachedLinkObj functions:
	// x1 and y1           - Coordinates of the start of the line
	// x2 and y2           - Coordinates of the end of the line
	// coordsUpdated       - A booelan - true means the cordinates are different to before.
	//                       Used for performance to prevent unneccessary line drawing.
	// srcDir              - Direction ("n", "s", "e" or "W") of the source of the line
	// trgDir              - Direction ("n", "s", "e" or "W") of the target of the line
	// originX and originY - The theoretical origin in the source node of the line
	// assocLinkVariation  - Either "curveRight", "curveLeft" or "doubleBack". Indicates
	//                       the style used for drawing association links
	//
	// These fields are added by the addConnectionPaths function:
	// pathinfo - an object containing:
	//   - elements    - An array of elements that make up the path of the link line
	//   - path        - The SVG path used to draw the link line
	//   - centerPoint - The x,y cordinate of the center of the link line. Used for
	//                   positioning decorations and the context toolbar.
	buildLinksArray() {
		this.logger.logStartTimer("buildLinksArray");

		let linksArray = [];

		if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
			this.updateFreeformLinksForNodes();
		}

		this.activePipeline.links.forEach((link) => {
			let linkObj = null;

			if (((this.config.enableLinkSelection === LINK_SELECTION_HANDLES &&
					this.dragDetLinkUtils.isLinkBeingDragged(link)) ||
					this.config.enableLinkSelection === LINK_SELECTION_DETACHABLE) &&
					(!link.srcObj || !link.trgNode)) {
				linkObj = this.getDetachedLinkObj(link);

			} else {
				linkObj = this.getAttachedLinkObj(link);
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

		this.logger.logEndTimer("buildLinksArray");

		return linksArray;
	}

	// Returns the link object passed in with additional fields to descibe an fully
	// attached link. This is called when both srcNode AND trgNode set to node
	// objects indicating a link that is attached at the source and taget ends.
	getAttachedLinkObj(link) {
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
			const srcPortId = CanvasUtils.getSourcePortId(link, srcObj);
			const trgPortId = CanvasUtils.getTargetPortId(link, trgNode);
			const assocLinkVariation =
				link.type === ASSOCIATION_LINK && this.config.enableAssocLinkType === ASSOC_RIGHT_SIDE_CURVE
					? this.getAssocLinkVariation(srcObj, trgNode)
					: null;
			const coords = this.linkUtils.getLinkCoords(link, srcObj, srcPortId, trgNode, trgPortId, assocLinkVariation);

			// Set additional calculated fields on link object.
			link.coordsUpdated =
				link.x1 !== coords.x1 ||
				link.y1 !== coords.y1 ||
				link.x2 !== coords.x2 ||
				link.y2 !== coords.y2;

			link.assocLinkVariation = assocLinkVariation;
			link.x1 = coords.x1;
			link.y1 = coords.y1;
			link.x2 = coords.x2;
			link.y2 = coords.y2;
			link.originX = coords.originX;
			link.originY = coords.originY;
			link.srcDir = coords.srcDir;
			link.trgDir = coords.trgDir;

			return link;
		}
		return null;
	}

	// Returns the link object passed in with additional fields to describe
	// a fully-detached or semi-detached link. This will only ever
	// be called when either srcNode OR trgNode are null indicating a
	// semi-detached link, or when both are null, indicating a fully-detached link.
	getDetachedLinkObj(link) {
		const srcObj = link.srcObj;
		const trgNode = link.trgNode;

		const coords = { x1: link.x1, y1: link.y1, x2: link.x2, y2: link.y2 };

		// Fully-detached link.
		if (!srcObj && !trgNode) {
			link.x1 = link.srcPos.x_pos;
			link.y1 = link.srcPos.y_pos;
			link.x2 = link.trgPos.x_pos;
			link.y2 = link.trgPos.y_pos;
			link.originX = 0;
			link.originY = 0;

			if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
				link.srcDir = CanvasUtils.getPortDir((link.x2 - link.x1), (link.y2 - link.y1), { width: 10, height: 10, }); // Pass in a dummy node
				link.trgDir = this.reverseDir(link.srcDir);
			} else {
				link.srcDir = this.getDefaultSrcDirForPorts();
				link.trgDir = this.reverseDir(link.srcDir);
			}

		// Semi-detached at source end.
		} else if (trgNode) {
			const trgInfo = this.getTargetEndInfo(link, trgNode);

			link.x1 = link.srcPos.x_pos;
			link.y1 = link.srcPos.y_pos;
			link.x2 = trgInfo.x2;
			link.y2 = trgInfo.y2;
			link.trgDir = trgInfo.trgDir;
			link.originX = 0;
			link.originY = 0;

			link.srcDir = this.getSrcDirForDetachedLink(link, link.x1, link.y1);

		// Semi-detached at target end.
		} else {
			const srcInfo = this.getSourceEndInfo(link, srcObj);

			link.x1 = srcInfo.x1;
			link.y1 = srcInfo.y1;
			link.x2 = link.trgPos.x_pos;
			link.y2 = link.trgPos.y_pos;
			link.srcDir = srcInfo.srcDir;
			link.originX = srcInfo.originX;
			link.originY = srcInfo.originY;

			link.trgDir = this.getTrgDirForDetachedLink(link, link.x2, link.y2);
		}

		// Set additional calculated fields on link object.
		link.coordsUpdated =
			link.x1 !== coords.x1 ||
			link.y1 !== coords.y1 ||
			link.x2 !== coords.x2 ||
			link.y2 !== coords.y2;

		return link;
	}

	// Returns an info object for the source end of the link, with:
	// x1 and y1 - Coordinate of the start of the link line.
	// srcDir - Direction ("n", "s", "e" or "w") the link line should be drawn.
	// originX and originY = The theoretical start point of the link line from.
	getSourceEndInfo(link, srcObj) {
		const info = {};

		if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
			const endPos = { x: link.trgPos.x_pos, y: link.trgPos.y_pos };
			const startPos = this.linkUtils.getNewFreeformNodeLinkStartPos(srcObj, endPos, link.srcFreeformInfo);
			info.x1 = startPos.x;
			info.y1 = startPos.y;
			info.originX = startPos.originX;
			info.originY = startPos.originY;
			info.srcDir = startPos.dir;

		} else {
			const srcPortId = CanvasUtils.getSourcePortId(link, srcObj);
			let port = CanvasUtils.getOutputPort(srcPortId, srcObj);
			// If no port, we must be handling a new association link being drawn from an input port.
			if (!port) {
				port = CanvasUtils.getInputPort(srcPortId, srcObj);
			}

			if (port) {
				info.x1 = srcObj.x_pos + port.cx;
				info.y1 = srcObj.y_pos + port.cy;
				info.srcDir = port.dir;
			}
		}
		return info;
	}

	// Returns an info object for the target end of the link, with:
	// x1 and y1 - Coordinate of the end of the link line.
	// srcDir - Direction ("n", "s", "e" or "w") the link line should be drawn to.
	getTargetEndInfo(link, trgNode) {
		const info = {};

		if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
			const endPos = { x: link.srcPos.x_pos, y: link.srcPos.y_pos };
			const startPos = this.linkUtils.getNewFreeformNodeLinkStartPos(trgNode, endPos, link.trgFreeformInfo);
			info.x2 = startPos.x;
			info.y2 = startPos.y;
			info.trgDir = startPos.dir;

		} else {
			const trgPortId = CanvasUtils.getTargetPortId(link, trgNode);
			const port = CanvasUtils.getInputPort(trgPortId, trgNode);
			if (port) {
				info.x2 = trgNode.x_pos + port.cx;
				info.y2 = trgNode.y_pos + port.cy;
				info.trgDir = port.dir;
			}
		}
		return info;
	}

	// Returns a default source direction.
	getDefaultSrcDirForPorts() {
		if (this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT) {
			return EAST;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_RIGHT_LEFT) {
			return WEST;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
			return NORTH;

		} else if (this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
			return SOUTH;
		}
		return EAST;
	}

	// Returns a direction ("n", "s", "e" or "w") for the source end of a detached link.
	getSrcDirForDetachedLink(link, x, y) {
		if (link.trgNode) {
			if (this.canvasLayout.linkMethod === LINK_METHOD_PORTS) {
				// If we have a trgDir and it fits with the linkDirection currently employed we
				// can set the srcDir accordingly. These will be the default cases for ports that
				// are positioned based on link direction.
				if (link.trgDir === WEST && this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT) {
					return EAST;

				} else if (link.trgDir === EAST && this.canvasLayout.linkDirection === LINK_DIR_RIGHT_LEFT) {
					return WEST;

				} else if (link.trgDir === SOUTH && this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
					return NORTH;

				} else if (link.trgDir === NORTH && this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
					return SOUTH;
				}
			}

			// If the trgDir does not fit with one of the link directions then the trgDir
			// is associated with a port that is in a custom position. In that case, calculate
			// the srcDir based on the coordinates of the target point in relation to the trgNode.
			const srcDir = CanvasUtils.getPortDir((x - link.trgNode.x_pos), (y - link.trgNode.y_pos), link.trgNode);
			return this.reverseDir(srcDir);
		}
		// If there is no target node then this is a fully detached link so set the source
		// direction based on the position relative to the target.
		const dir = CanvasUtils.getPortDir((x - link.trgPos.x_pos), (y - link.trgPos.y_pos), { width: 10, height: 10, }); // Pass in a dummy node
		return this.reverseDir(dir);
	}

	// Returns a direction ("n", "s", "e" or "w") for the target end of a detached link.
	getTrgDirForDetachedLink(link, x, y) {
		if (link.srcObj) {
			if (this.canvasLayout.linkMethod === LINK_METHOD_PORTS) {
				// If there is a srcDir for the link we return a trgDir if the srcDir matches the
				// linkDirection (port placement) currently in use.
				if (link.srcDir === EAST && this.canvasLayout.linkDirection === LINK_DIR_LEFT_RIGHT) {
					return WEST;

				} else if (link.srcDir === WEST && this.canvasLayout.linkDirection === LINK_DIR_RIGHT_LEFT) {
					return EAST;

				} else if (link.srcDir === NORTH && this.canvasLayout.linkDirection === LINK_DIR_BOTTOM_TOP) {
					return SOUTH;

				} else if (link.srcDir === SOUTH && this.canvasLayout.linkDirection === LINK_DIR_TOP_BOTTOM) {
					return NORTH;
				}
			}

			// If the srcDir does not fit with one of the link directions then the srcDir
			// is associated with a port that is in a custom position. In that case, calculate
			// the trgDir based on the coordinates of the target point in relation to the srcObj.
			const srcDir = CanvasUtils.getPortDir((x - link.srcObj.x_pos), (y - link.srcObj.y_pos), link.srcObj);
			return this.reverseDir(srcDir);
		}
		const dir = CanvasUtils.getPortDir((x - link.srcPos.x_pos), (y - link.srcPos.y_pos), { width: 10, height: 10, }); // Pass in a dummy node
		return this.reverseDir(dir);
	}

	// Returns the reverse of the direction passed in.
	reverseDir(dir) {
		switch (dir) {
		case NORTH:
			return SOUTH;
		case SOUTH:
			return NORTH;
		case EAST:
			return WEST;
		case WEST:
		default:
			return EAST;
		}
	}

	// Returns true if a link should be displayed and false if not. The link
	// should not be displayed if:
	// * it is a comment link and comment links are switched off (comments are hiding)
	// * the displayLinkOnOverlap flag is false and the objects at each end of
	//   the link are overlapping.
	shouldDisplayLink(srcNode, trgNode, linkType) {
		if (linkType === COMMENT_LINK && this.canvasInfo.hideComments) {
			return false;
		}

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
	// (called srcFreeformInfo and trgFreeformInfo) based on the location of the
	// nodes the links go from and to. The info in these fields is used to
	// calculate the starting and ending position of freeform link lines.
	// This ensures that input and output links that go in a certain direction
	// (NORTH, SOUTH, EAST or WEST) are grouped together so they can be
	// separated out when freeform lines are drawn between nodes.
	updateFreeformLinksForNodes() {
		this.activePipeline.nodes.forEach((n) => this.updateFreeformLinksForNode(n));
	}

	// Updates the links going into and out of the node passed in with up to
	// two new fields (called srcFreeformInfo and trgFreeformInfo).
	updateFreeformLinksForNode(node) {
		const linksInfo = {};
		linksInfo.n = [];
		linksInfo.s = [];
		linksInfo.e = [];
		linksInfo.w = [];

		// Update the linksInfo arrays for each direction: n, s, e and w.
		this.activePipeline.links.forEach((link) => {
			if (link.type === NODE_LINK) {
				// Self-referencing link
				if (node.id === link.srcObj?.id &&
						link.srcObj?.id === link.trgNode?.id) {
					linksInfo[NORTH].push({ type: "in", startNode: link.srcObj, endNode: link.trgNode, link });
					linksInfo[EAST].push({ type: "out", startNode: link.srcObj, endNode: link.trgNode, link });

				} else if (link.trgNode && link.trgNode.id === node.id) {
					if (link.srcObj) {
						const dir = this.getDirToNode(link.trgNode, link.srcObj);
						linksInfo[dir].push({ type: "in", startNode: link.trgNode, endNode: link.srcObj, link });

					} else if (link.srcPos) {
						const dir = this.getDirToEndPos(link.trgNode, link.srcPos.x_pos, link.srcPos.y_pos);
						linksInfo[dir].push({ type: "in", x: link.srcPos.x_pos, y: link.srcPos.y_pos, link });
					}

				} else if (link.srcObj && link.srcObj.id === node.id) {
					if (link.trgNode) {
						const dir = this.getDirToNode(link.srcObj, link.trgNode);
						linksInfo[dir].push({ type: "out", startNode: link.srcObj, endNode: link.trgNode, link });

					} else if (link.trgPos) {
						const dir = this.getDirToEndPos(link.srcObj, link.trgPos.x_pos, link.trgPos.y_pos);
						linksInfo[dir].push({ type: "out", x: link.trgPos.x_pos, y: link.trgPos.y_pos, link });
					}
				}
			}
		});

		const startCenter = {
			x: node.x_pos + node.width / 2,
			y: node.y_pos + node.height / 2
		};

		linksInfo.n = this.sortLinksInfo(linksInfo.n, NORTH, startCenter);
		linksInfo.s = this.sortLinksInfo(linksInfo.s, SOUTH, startCenter);
		linksInfo.e = this.sortLinksInfo(linksInfo.e, EAST, startCenter);
		linksInfo.w = this.sortLinksInfo(linksInfo.w, WEST, startCenter);

		this.updateLinksInfo(linksInfo.n, NORTH);
		this.updateLinksInfo(linksInfo.s, SOUTH);
		this.updateLinksInfo(linksInfo.e, EAST);
		this.updateLinksInfo(linksInfo.w, WEST);
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
	// array ordered by the angle that each link makes with the center of the
	// start node. When handling multiple links that go to the same node
	// the links have to be grouped where links in the same group go to/from
	// the same node. For groups, the x and y are *projected* corrdinates to
	// allow us to calculate the angles and ordering etc. The actual x and y
	// for the links is calculated in getAttachedLinkObj and getDetachedLinkObj.
	sortLinksInfo(linksDirArrayIn, dir, startCenter) {
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
					// Special case where links that go SOUTH from the node and
					// point to the WEST of the end node, get crossed over each other.
					// In this case the x coordinates of the link items need to be
					// reversed.
					if (dir === SOUTH) {
						const reverseDir = this.getDirToNode(li.endNode, li.startNode);
						if (reverseDir === WEST) {
							li.x = node.x_pos + ((node.width / parts) * (group.length - i));
						}
					}
					// Special case where links that go NORTH from the node and
					// point to the EAST of the end node, get crossed over each other.
					// In this case the x coordinates of the link items need to be
					// reversed.
					if (dir === NORTH) {
						const reverseDir = this.getDirToNode(li.endNode, li.startNode);
						if (reverseDir === EAST) {
							li.x = node.x_pos + ((node.width / parts) * (group.length - i));
						}
					}
				});
			});

			// Set an angle for each linkDir so that they can be sorted so they do not
			// overlap when being drawn to or from the node. The angle is from the
			// center of the node we are handling to their projected end point.
			linksDirArray.forEach((ld) => {
				ld.angle = CanvasUtils.calculateAngle(startCenter.x, startCenter.y, ld.x, ld.y);

				// Make sure the angles for links on the EAST side of the node are
				// increasing in the clockwise direction by decrementing the angles from
				// 270 to 360 by 360 degrees. (This is because calculateAngle returns
				// positive angles from the 3 o'clock position in clockwise direction.)
				if (dir === EAST && ld.angle >= 270) {
					ld.angle -= 360;
				}

				// For self-referencing links we overwrite the angle to ensure that
				// the outward direction (EAST) is always drawn at the top of any
				// EAST links and the inward direction (NORTH) is always drawn to
				// the right of any NORTH links.
				if (ld.startNode && ld.endNode && ld.startNode === ld.endNode) {
					if (dir === EAST) {
						ld.angle = -90;
					} else if (dir === NORTH) {
						ld.angle = 360;
					}
				}
			});

			// Sort the linksDirArray by the angle that each link forms with the
			// center of the start node.
			if (dir === NORTH || dir === EAST) {
				linksDirArray = linksDirArray.sort((a, b) => (a.angle > b.angle ? 1 : -1));
			} else {
				linksDirArray = linksDirArray.sort((a, b) => (a.angle < b.angle ? 1 : -1));
			}
		}
		return linksDirArray;
	}

	// Returns a 'groups' object where each field is indexed by a node ID and
	// contains an array of linkInfo objects that go to/from the node. Note:
	// endNode is the target node for link that point away from the node we
	// are handling and is the source node for links the point to the node
	// we are handling.
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
				li.link.srcFreeformInfo = {
					dir: dir,
					idx: i,
					len: linksDirArray.length
				};
			} else {
				li.link.trgFreeformInfo = {
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
	getInputPortArrowPathTransform(port) {
		const angle = this.getAngleBasedForInputPorts(port.dir);
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
	// curves it returns the same as for "Straight" links) because it is very
	// difficult to write an algorithm that gives the correct angle for a
	// "Curve" link to make it look presentable. I know, I tried!
	getArrowHeadTransform(link) {
		let angle = 0;

		if (this.canvasLayout.linkMethod === LINK_METHOD_FREEFORM) {
			angle = this.getAngleBasedForFreeformLink(link);

		} else {
			angle = this.getAngleBasedForInputPorts(link.trgDir);
		}

		return `translate(${link.x2}, ${link.y2}) rotate(${angle})`;
	}

	// Returns a rotation transform for an image displayed for an
	// output port.
	getPortImageTransform(port) {
		const angle = this.getAngleBasedForOutputPorts(port.dir);

		return `rotate(${angle},${port.cx},${port.cy})`;
	}

	// Returns the angle for the arrow head for freeform links.
	getAngleBasedForFreeformLink(d) {
		const selfRefLink = d.srcNodeId && d.trgNodeId && d.srcNodeId === d.trgNodeId;
		if (this.canvasLayout.linkType === LINK_TYPE_STRAIGHT && !selfRefLink) {
			return Math.atan2((d.y2 - d.y1), (d.x2 - d.x1)) * (180 / Math.PI);
		}

		// For other freeform link types we return an appropriate direction
		// at right angles to the node.
		return this.getAngleBasedForInputPorts(d.trgDir);
	}

	// Returns the angle for the output port of a source node when
	// connections to ports are being made.
	getAngleBasedForOutputPorts(dir) {
		switch (dir) {
		case NORTH: {
			return -NINETY_DEGREES;
		}
		case SOUTH: {
			return NINETY_DEGREES;
		}
		case WEST: {
			return ONE_EIGHTY_DEGREES;
		}
		default:
			return 0;
		}
	}

	// Returns the angle for the input port of a target node when
	// connections to ports are being made.
	getAngleBasedForInputPorts(dir) {
		switch (dir) {
		case NORTH: {
			return NINETY_DEGREES;
		}
		case SOUTH: {
			return -NINETY_DEGREES;
		}
		case WEST: {
			return 0;
		}
		default:
			return ONE_EIGHTY_DEGREES;
		}
	}

	canOpenTip(tipType) {
		return this.canvasController.isTipEnabled(tipType) &&
			!this.regionSelect && !this.isDragging() && !this.isSizing();
	}

	// Return the x,y coordinates for the default position of a new comment
	// created from the toolbar. This make sure the new comment always appears
	// in the top left corner of the view port.
	getDefaultCommentOffset() {
		let xPos = this.canvasLayout.addCommentOffsetX;
		let yPos = this.canvasLayout.addCommentOffsetY;
		const z = this.zoomUtils.getZoomTransform();

		if (z) {
			const xPanByScale = z.x / z.k;
			const yPanByScale = z.y / z.k;

			// Offset in the negative direction.
			xPos = -xPanByScale + this.canvasLayout.addCommentOffsetX;
			yPos = -yPanByScale + this.canvasLayout.addCommentOffsetY;
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
		if (this.isDragging()) {
			str += " dragging = true";
		}
		if (this.isSizing()) {
			str += " sizing = true";
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
