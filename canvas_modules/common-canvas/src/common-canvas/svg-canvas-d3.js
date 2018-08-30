/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-invalid-this: "off" */
/* eslint brace-style: "off" */
/* eslint no-lonely-if: "off" */

// Import just the D3 modules that are needed. Doing this means that the
// d3Event object needs to be explicitly imported.
var d3 = Object.assign({}, require("d3-drag"), require("d3-ease"), require("d3-selection"), require("d3-zoom"));
import { event as d3Event } from "d3-selection";
import union from "lodash/union";
import forIn from "lodash/forIn";
import { NODE_MENU_ICON, SUPER_NODE_EXPAND_ICON, TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK } from "./constants/canvas-constants";
import Logger from "../logging/canvas-logger.js";

const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const A_KEY = 65;
const C_KEY = 67;
const V_KEY = 86;
const X_KEY = 88;
const Y_KEY = 89;
const Z_KEY = 90;
// TODO - Implement nudge behavior for moving nodes and comments
// const LEFT_ARROW_KEY = 37;
// const UP_ARROW_KEY = 38;
// const RIGHT_ARROW_KEY = 39;
// const DOWN_ARROW_KEY = 40;

const showLinksTime = false;

export default class CanvasD3Layout {

	constructor(canvasInfo, canvasDivSelector, config, canvasController) {
		this.logger = new Logger(["CanvasD3Layout", "FlowId", canvasInfo.id]);
		this.logger.logStartTimer("Constructor");

		this.canvasController = canvasController;
		this.objectModel = this.canvasController.getObjectModel();

		// Initialize the canvas div object
		this.canvasDiv = this.initializeCanvasDiv(canvasDivSelector);

		// Save the config
		this.config = config;

		// Initialize dimension and layout variables
		this.initializeLayoutInfo(config);

		// Make a copy of canvasInfo because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasInfo in the objectModel. The objectModel canvasInfo is only updated
		// when the operation is complete.
		this.canvasInfo = this.cloneCanvasInfo(canvasInfo);

		// Create a renderer object for the primary pipeline
		this.renderer = new CanvasRenderer(
			this.canvasInfo.primary_pipeline,
			this.canvasDiv,
			this.canvasController,
			this.canvasInfo);

		this.logger.logEndTimer("Constructor", true);
	}

	setCanvasInfo(canvasInfo, config) {
		if (canvasInfo.id !== this.canvasInfo.id ||
				(this.renderer && this.renderer.pipelineId !== this.canvasController.getCurrentBreadcrumb().pipelineId) ||
				this.config.enableConnectionType !== config.enableConnectionType ||
				this.config.enableNodeFormatType !== config.enableNodeFormatType ||
				this.config.enableLinkType !== config.enableLinkType) {
			this.logger.logStartTimer("Initializing Canvas");

			// The canvasInfo does not need to be cloned here because the two
			// calls below will cause the objectModel to be updated which will
			// cause this method to be called again and the else clasue of this if
			// will be executed which will clone the canvasInfo.
			this.canvasInfo = canvasInfo;

			// Save the config
			this.config = config;

			// Both these methods will result in the canvas being refreshed through
			// updates to the object model so there is no need to call displayCanvas
			// from here. Setting this.renderer to null causes a new CanvasRenderer
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
				this.renderer = new CanvasRenderer(
					this.canvasController.getCurrentBreadcrumb().pipelineId,
					this.canvasDiv,
					this.canvasController,
					this.canvasInfo);
			}

			this.logger.logEndTimer("Set Canvas Info", true);
		}
	}

	// Copies canvasInfo because we will need to update it (when moving
	// nodes and comments and when sizing comments in real time) without updating
	// the canvasInfo in the ObjectModel. The objectModel canvasInfo is only
	// updated when the real-time operation is complete.
	cloneCanvasInfo(canvasInfo) {
		this.logger.logStartTimer("Cloning canvasInfo");
		const clone = JSON.parse(JSON.stringify(canvasInfo));
		this.logger.logEndTimer("Cloning canvasInfo");
		return clone;
	}

	initializeCanvasDiv(canvasDivSelector) {
		// Add a listener to canvas div to catch key presses. The containing
		// canvas div must have tabindex set and the focus set on the div.
		const canvasDiv = d3.select(canvasDivSelector)
			.on("keydown", () => {
				// Make sure no tip is displayed, because having one displayed
				// will interfere with drawing of the canvas as the result of any
				// keyboard action.
				this.canvasController.hideTip();

				// Only catch key pressses when NOT editing because, while editing,
				// the test area needs to receive key presses for undo, redo, delete etc.
				if (!this.renderer.isEditingComment()) {
					if (d3Event.keyCode === BACKSPACE_KEY ||
							d3Event.keyCode === DELETE_KEY) {
						stopPropagationAndPreventDefault(); // Some browsers interpret Delete as 'Back to previous page'. So prevent that.
						this.canvasController.editActionHandler({
							editType: "deleteSelectedObjects",
							selectedObjectIds: this.objectModel.getSelectedObjectIds(),
							pipelineId: this.objectModel.getCurrentBreadcrumb().pipelineId
						});

					} else if (isCmndCtrlPressed() && !d3Event.shiftKey && d3Event.keyCode === Z_KEY) {
						stopPropagationAndPreventDefault();
						this.canvasController.undo();

					} else if (isCmndCtrlPressed() &&
							((d3Event.shiftKey && d3Event.keyCode === Z_KEY) || d3Event.keyCode === Y_KEY)) {
						stopPropagationAndPreventDefault();
						this.canvasController.redo();

					} else if (isCmndCtrlPressed() && d3Event.keyCode === A_KEY) {
						stopPropagationAndPreventDefault();
						this.canvasController.selectAll();

					} else if (isCmndCtrlPressed() && d3Event.keyCode === C_KEY) {
						stopPropagationAndPreventDefault();
						this.canvasController.copyToClipboard();

					} else if (isCmndCtrlPressed() && d3Event.keyCode === X_KEY) {
						stopPropagationAndPreventDefault();
						this.canvasController.cutToClipboard();

					} else if (isCmndCtrlPressed() && d3Event.keyCode === V_KEY) {
						stopPropagationAndPreventDefault();
						this.canvasController.pasteFromClipboard();
					}
				}
			});
		return canvasDiv;
	}

	// Initializes the dimensions for nodes, comments layout etc.
	initializeLayoutInfo(config) {

		if (config.enableConnectionType === "Halo") {
			this.objectModel.setLayoutType("halo");

		} else { // Ports connection type
			if (config.enableNodeFormatType === "Horizontal") {
				this.objectModel.setLayoutType("ports-horizontal", config.enableLinkType);

			} else { // Vertical
				this.objectModel.setLayoutType("ports-vertical", config.enableLinkType);
			}
		}
	}

	nodeDropped(dropData, dropX, dropY) {
		this.renderer.nodeDropped(dropData, dropX, dropY);
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

	refreshOnSizeChange() {
		this.renderer.refreshOnSizeChange();
	}

	getSvgViewportOffset() {
		return this.renderer.getSvgViewportOffset();
	}

}

class CanvasRenderer {
	constructor(pipelineId, canvasDiv, canvasController, canvasInfo, parentSupernodeD3Selection) {
		this.logger = new Logger(["CanvasRenderer", "PipeId", pipelineId]);
		this.logger.logStartTimer("Constructor");
		this.pipelineId = pipelineId;
		this.canvasDiv = canvasDiv;
		this.canvasInfo = canvasInfo;
		this.canvasController = canvasController;
		this.objectModel = this.canvasController.getObjectModel();
		this.parentSupernodeD3Selection = parentSupernodeD3Selection; // Optional parameter, only provided with sub-flow in-place display.
		this.activePipeline = this.getPipeline(pipelineId); // Must come after line setting this.canvasInfo
		this.setDisplayState();

		// An array of renderers for the supernodes on the canvas.
		this.superRenderers = [];

		// Our instance ID for adding to DOM element IDs
		this.instanceId = this.canvasController.getInstanceId();

		// Get the layout info
		this.layout = this.objectModel.getLayout();

		// Initialize zoom variables
		this.initializeZoomVariables();

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 2;

		// Allows us to track the sizing behavior of comments
		this.commentSizing = false;
		this.commentSizingId = 0;
		this.commentSizingDirection = "";
		this.commentSizingHasChanged = false;

		// Allows us to track the sizing behavior of supernodes
		this.nodeSizing = false;
		this.nodeSizingId = 0;
		this.nodeSizingDirection = "";
		this.nodeSizingMovedNodes = [];

		// Allows us to track the editing of comments
		this.editingComment = false;
		this.editingCommentId = "";
		this.editingCommentChangesPending = false;

		// Allows us to record the drag behavior or nodes and comments.
		this.dragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;

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

		// Variables for dynamically drawing a new link line
		this.drawingNewLink = false;
		this.drawingNewLinkSrcId = null;
		this.drawingNewLinkSrcPortId = null;
		this.drawingNewLinkAction = null;
		this.drawingNewLinkStartPos = null;
		this.drawingNewLinkArray = [];

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

		this.displayCanvas();

		// If we are showing a sub-flow in full screen mode, zoom it to fit the
		// screen so it looks similar to the in-place sub-flow view.
		if (this.isDisplayingSubFlowFullPage()) {
			this.addBackToParentFlowArrow(this.canvasSVG);
			this.zoomToFit();
		}
		this.logger.logEndTimer("Constructor");
	}

	setDisplayState() {
		if (this.canvasController.getBreadcrumbs().length > 1 &&
				this.canvasController.getCurrentBreadcrumb().pipelineId === this.pipelineId) {
			this.displayState = "sub-flow-full-page";

		} else if (this.parentSupernodeD3Selection) { // Existance of this varable means we are rendering an in-place sub-flow
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

	getParentSupernodeDatum() {
		return this.getSupernodeReferencing(this.activePipeline.id);
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
		return pipeline.nodes.filter((node) => node.type === "super_node");
	}

	initializeZoomVariables() {
		// Allows us to record the current zoom amounts.
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);

		// Allows us to record the start point of the current zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0 };

		// Center position of text area used for editing comments. These are used
		// when zooming a text area.
		this.zoomTextAreaCenterX = 0;
		this.zoomTextAreaCenterY = 0;
	}

	getPipeline(pipelineId) {
		return this.canvasInfo.pipelines.find((p) => p.id === pipelineId);
	}

	setCanvasInfoRenderer(canvasInfo) {
		this.logger.logStartTimer("setCanvasInfoRenderer");
		this.canvasInfo = canvasInfo;
		this.activePipeline = this.getPipeline(this.pipelineId);
		this.layout = this.objectModel.getLayout(); // Refresh the layout info in case it changed.

		// Set the display state incase we changed from in-place to full-page
		// sub-flow display.
		this.setDisplayState();

		// If a supernode and its corresponding pipeline has been deleted in the
		// object model we need to make sure the renderer is removed.
		this.superRenderers = this.cleanUpSuperRenderers();

		if (!this.canvasController.isTipShowing()) { // No need to render if just displaying a tip
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
			const ren = this.findSuperRenderer(supernode);
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
		// TODO - Remove these commented lines when we're usre clearing SVG is the right way to go.
		// this.canvasGrp.selectAll("g").remove();
		this.initializeZoomVariables();
		// this.canvasSVG.call(this.zoom.transform, d3.zoomIdentity); // Reset the SVG zoom and scale
		this.canvasSVG.remove();
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

		// If we are handling a sub-flow set the supernode binding status for
		// use when displaying the nodes.
		if (this.isDisplayingSubFlow()) {
			this.setSupernodesBindingStatus();
		}

		this.displayComments(); // Show comments first so they appear under nodes, if there is overlap.
		this.displayNodes();
		this.displayLinks();

		if (this.isDisplayingSubFlowInPlace()) {
			this.displaySVGToFitSupernode();
		}

		if (this.isDisplayingSubFlowFullPage()) {
			// The supernode will not have any calculated port positions when the
			// subflow is being displayed full screen, so calculate them first.
			this.setPortPositionsForNode(this.getParentSupernodeDatum());
			this.displayBindingNodesToFitSVG();
		}

		// this.displayBoundingRectangles(); // This can be uncommented for debugging to see boundaries.
		this.logger.logEndTimer("displayCanvas");
	}

	// Called during a resize.
	displaySVGToFitSupernode() {
		const supernodeDims = this.getSupernodeDimensions();
		this.canvasSVG.attr("width", supernodeDims.width);
		this.canvasSVG.attr("height", supernodeDims.height);
		this.canvasSVG.attr("x", supernodeDims.x);
		this.canvasSVG.attr("y", supernodeDims.y);
		this.zoomToFitForInPlaceSubFlow();
		this.displayBindingNodesToFitSVG();
	}

	displayBindingNodesToFitSVG() {
		this.logger.log("displayBindingNodesToFitSVG");
		this.moveSuperBindingNodes();
		this.movingBindingNodes = true;
		this.displayNodes();
		this.displayLinks();
		this.movingBindingNodes = false;
	}

	getSupernodeDimensions() {
		const datum = this.getParentSupernodeDatum();
		return {
			width: datum.width - (2 * this.layout.supernodeSVGAreaPadding),
			height: datum.height - this.layout.supernodeSVGTopAreaHeight - this.layout.supernodeSVGAreaPadding,
			x: this.layout.supernodeSVGAreaPadding,
			y: this.layout.supernodeSVGTopAreaHeight,
			x_pos: datum.x_pos + this.layout.supernodeSVGAreaPadding,
			y_pos: datum.y_pos + this.layout.supernodeSVGTopAreaHeight
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

		const nodeSelector = this.getSelectorForClass("node-group");
		const supernodeDatum = this.getParentSupernodeDatum();
		const svgHt = supernodeDatum.height - this.layout.supernodeSVGTopAreaHeight - this.layout.supernodeSVGAreaPadding;

		const that = this;

		this.canvasGrp.selectAll(nodeSelector).each(function(d) {
			if (d.isSupernodeInputBinding) {
				d.x_pos = transformedSVGRect.x - d.width;
				const y = that.getSupernodePortYOffset(d.id, supernodeDatum.input_ports);
				d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.output_ports[0].cy;
			}
			if (d.isSupernodeOutputBinding) {
				d.x_pos = transformedSVGRect.x + transformedSVGRect.width;
				const y = that.getSupernodePortYOffset(d.id, supernodeDatum.output_ports);
				d.y_pos = (transformedSVGRect.height * (y / svgHt)) + transformedSVGRect.y - d.input_ports[0].cy;
			}
		});
	}

	getSupernodePortYOffset(nodeId, ports) {
		if (ports) {
			const supernodePort = ports.find((port) => port.subflow_node_ref === nodeId);
			return supernodePort.cy - this.layout.supernodeSVGTopAreaHeight;
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
		const canv = this.getCanvasDimensionsAdjustedForScale(1);
		const transformedSVGRect = this.getTransformedSVGRect(svgRect, 1);

		this.canvasGrp.selectAll(this.getId("#br_svg_rect")).remove();
		this.canvasGrp.selectAll(this.getId("#br_svg_rect_trans")).remove();
		this.canvasGrp.selectAll(this.getId("#br_canvas_rect")).remove();

		this.canvasGrp
			.append("rect")
			.attr("id", this.getId("br_svg_rect"))
			.attr("height", svgRect.height)
			.attr("width", svgRect.width)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "none")
			.style("stroke", "black");

		this.canvasGrp
			.append("rect")
			.attr("id", this.getId("br_svg_rect_trans"))
			.attr("height", transformedSVGRect.height)
			.attr("width", transformedSVGRect.width)
			.attr("x", transformedSVGRect.x)
			.attr("y", transformedSVGRect.y)
			.style("fill", "none")
			.style("stroke", "red");


		if (canv) {
			this.canvasGrp
				.append("rect")
				.attr("id", this.getId("br_canvas_rect"))
				.attr("height", canv.height)
				.attr("width", canv.width)
				.attr("x", canv.left)
				.attr("y", canv.top)
				.style("fill", "none")
				.style("stroke", "blue")
				.lower();
		}
		if (this.superRenderers.length > 0) {
			this.superRenderers.forEach((sr) => sr.displayBoundingRectangles());
		}
	}

	isEditingComment() {
		// TODO - check sub-flow renderers for their editingComment statuses
		return this.editingComment;
	}

	// Returns a modified pipeline ID for use with the data-pipeline-id DOM
	// attribute. We put an "x" on the front of the ID because some pipeline IDs
	// begin with a number which CSS doesn't like when selecting on that attribute
	// value. See getSelector() method.
	getNonNumericPipelineId() {
		return "x" + this.activePipeline.id;
	}

	// Returns a selector for the ID information passed in which includes a
	// condition for selecting on the current pipelineId. See getId() for
	// explanation of parameters.
	getSelectorForId(prefix, suffix, suffix2) {
		const id = this.getId(prefix, suffix, suffix2);
		return this.getSelector(`#${id}`); // Add a '#' when selecting on an ID
	}

	// Returns a selector for the class name passed in which includes a
	// condition for selecting on the current pipelineId.
	getSelectorForClass(classs) {
		return this.getSelector(`.${classs}`); // Add a '.' when selecting on a class
	}

	// Returns a new selector based on the selector passed in which includes
	// a condition for the current pipeline Id. Note: we add an 'x' to the
	// front of the pipelineId because CSS doesn't like value afetr the '='
	// beginning with a number (and some pipelineIds start with numbers).
	getSelector(selector) {
		return selector + `[data-pipeline-id=x${this.activePipeline.id}]`;
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
	getMousePos(svg) {
		if (d3Event instanceof MouseEvent || (d3Event && d3Event.sourceEvent)) {
			// Get mouse position relative to the top level SVG in the Div becasue,
			// when we're rendering a sub-flow this.canvasSVG will be the SVG in the supernode.
			// const mousePos = d3.mouse(this.canvasDiv.selectAll("svg").node());
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

	nodeDropped(dropData, mousePos, element) {
		// Offset mousePos so new node appers in center of mouse location.
		mousePos.x -= (this.layout.defaultNodeWidth / 2) * this.zoomTransform.k;
		mousePos.y -= (this.layout.defaultNodeHeight / 2) * this.zoomTransform.k;

		const transPos = this.transformPos(mousePos);
		const link = this.getNodeLinkForElement(element);

		if (dropData !== null) {
			if (dropData.operation === "createFromTemplate") {
				if (link &&
						this.canvasController.canNodeBeDroppedOnLink(dropData.nodeTemplate, this.pipelineId) &&
						this.canvasController.isInternalObjectModelEnabled()) {
					this.canvasController.createNodeFromTemplateOnLinkAt(dropData.nodeTemplate, link, transPos.x, transPos.y, this.pipelineId);
				} else {
					this.canvasController.createNodeFromTemplateAt(dropData.nodeTemplate, transPos.x, transPos.y, this.pipelineId);
				}

			} else if (dropData.operation === "createFromObject") {
				this.canvasController.createNodeFromObjectAt(dropData.sourceId, dropData.sourceObjectTypeId, dropData.label, transPos.x, transPos.y, this.pipelineId);

			} else if (dropData.operation === "addToCanvas" || dropData.operation === "addTableFromConnection") {
				this.canvasController.createNodeFromDataAt(transPos.x, transPos.y, dropData.data, this.pipelineId);
			}
		}
	}

	// Returns the node link object from the canvasInfo corresponding to the
	// element passed in provided it is a 'path' DOM object. Returns null if
	// a link cannot be found.
	getNodeLinkForElement(element) {
		if (element && element.nodeName === "path") {
			const datum = d3.select(element).datum();
			if (datum) {
				var foundLink = this.canvasController.getLink(datum.id, this.pipelineId);
				if (foundLink && foundLink.type === "nodeLink") {
					return foundLink;
				}
			}
		}
		return null;
	}

	getNode(nodeId) {
		const node = this.activePipeline.nodes.find((nd) => nd.id === nodeId);
		return (typeof node === "undefined") ? null : node;
	}

	getNodePort(nodeId, portId, type) {
		const node = this.activePipeline.nodes.find((nd) => nd.id === nodeId);
		if (node) {
			let ports;
			if (type === "input") {
				ports = node.input_ports;
			} else {
				ports = node.output_ports;
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
			dims = this.getSupernodeDimensions();
		}

		const canvasSVG = parentObject
			.append("svg")
			.attr("class", "svg-area") // Used by Chimp tests.
			.attr("width", dims.width)
			.attr("height", dims.height)
			.attr("x", dims.x)
			.attr("y", dims.y);

		// Only attach the zoom behaviour to the top most SVG area
		if (!this.isDisplayingSubFlowInPlace()) {
			canvasSVG
				.call(this.zoom);
		}

		canvasSVG
			.on("mousemove.zoom", () => {
				// this.logger.log("Zoom - mousemove - " + drawingNewLink = " + this.drawingNewLink);
				if (this.drawingNewLink === true) {
					this.drawNewLink();
				}
			})
			.on("mouseup.zoom", () => {
				this.logger.log("Zoom - mouseup");
				if (this.drawingNewLink === true) {
					this.stopDrawingNewLink();
				}
			})
			.on("click.zoom", () => {
				this.logger.log("Zoom - click");
				this.selecting = true;
				this.canvasController.clearSelections(); // Controller will make sure selections are not cleared when context menu is displayed
				this.canvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: this.objectModel.getSelectedObjectIds() });
				this.selecting = false;
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
				if (this.isDisplayingSubFlowInPlace()) {
					this.canvasController.clearSelections();
				}
				this.openContextMenu("canvas");
			});

		// Add defs element to allow a filter
		var defs = canvasSVG.append("defs");
		this.createDropShadow(defs);

		// If we're displaying a sub-flow inside a supernode we need a
		// background rectangle to catch zoom event etc.
		if (this.isDisplayingSubFlowInPlace()) {
			canvasSVG
				.append("rect")
				.attr("x", -5000)
				.attr("y", -5000)
				.attr("width", 10000)
				.attr("height", 10000)
				.attr("class", "d3-subflow-background");
		}

		return canvasSVG;
	}

	createCanvasGroup(canvasSVG) {
		return canvasSVG.append("g");
	}

	addBackToParentFlowArrow(canvasSVG) {
		const g = canvasSVG
			.append("g")
			.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "yes");
			})
			.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text object
				d3.select(this).select("rect")
					.attr("data-pointer-hover", "no");
			})
			.on("click", () => {
				stopPropagationAndPreventDefault();
				this.canvasController.displayPreviousPipeline();
			});

		g.append("rect")
			.attr("x", 5)
			.attr("y", 5)
			.attr("width", 170)
			.attr("height", 20)
			.attr("class", "d3-back-to-previous-flow-box");

		g.append("text")
			.attr("x", 10)
			.attr("y", 20)
			.attr("class", "d3-back-to-previous-flow-text")
			.text("⬅ Back to Previous Flow");
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
				if (message.type === "error") {
					return message.type;
				} else if (message.type === "warning") {
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
		case "error":
			labelClass = "d3-node-error-label";
			break;
		case "warning":
			labelClass = "d3-node-warning-label";
			break;
		default:
			break;
		}
		return labelClass;
	}

	getMessageCircleClass(messages) {
		const messageLevel = this.getMessageLevel(messages);
		let labelClass = "d3-error-circle-off";
		switch (messageLevel) {
		case "error":
			labelClass = "d3-error-circle";
			break;
		case "warning":
			labelClass = "d3-warning-circle";
			break;
		default:
			break;
		}
		return labelClass;
	}

	zoomToFit() {
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1, 10);
		this.zoomToFitCanvas(canvasDimensions);
	}


	zoomToFitForInPlaceSubFlow() {
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1, this.layout.supernodeZoomPadding);
		this.zoomToFitCanvas(canvasDimensions);
	}

	zoomToFitCanvas(canvasDimensions) {
		const viewPortDimensions = this.getViewPortDimensions();

		// this.logger.log("Zoom to fit: " +
		// 	" viewPort.width " + viewPortDimensions.width +
		// 	" viewPort.height " + viewPortDimensions.height +
		// 	" canvas.width " + canvasDimensions.width +
		// 	" canvas.height " + canvasDimensions.height);

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

			this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(newScale);
			this.zoomingToFitForScale = true;
			this.canvasSVG.call(this.zoom.transform, this.zoomTransform);
			this.zoomingToFitForScale = false;
		}
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

	// Returns the dimensions of the SVG area. When we are displaying a sub-flow
	// we can use the supernode's dimensions. If not we are displaying
	// full-page so we can use getBoundingClientRect() to get the dimensions
	// (for some reason that method doesn't return correct values with embedded SVG areas).
	getViewPortDimensions() {
		let viewPortDimensions = {};

		if (this.isDisplayingSubFlowInPlace()) {
			const dims = this.getSupernodeDimensions();
			viewPortDimensions.width = dims.width;
			viewPortDimensions.height = dims.height;

		} else {
			viewPortDimensions = this.canvasSVG.node().getBoundingClientRect();
		}
		return viewPortDimensions;
	}

	zoomStart() {
		this.logger.log("zoomStart - " + JSON.stringify(d3Event.transform));

		// this.zoomingToFitForScale flag is used to avoid redo actions initialized by
		// Cmd+Shirt+Z (where the shift key has been pressed) causing a region selection to start.
		if (d3Event.sourceEvent && d3Event.sourceEvent.shiftKey && !this.zoomingToFitForScale) {
			this.regionSelect = true;
			this.regionStartTransformX = d3Event.transform.x;
			this.regionStartTransformY = d3Event.transform.y;
			const transPos = this.getTransformedMousePos();
			this.region = {
				startX: transPos.x,
				startY: transPos.y,
				width: 0,
				height: 0
			};
		} else {
			this.canvasController.hideTip();
			this.zoomStartPoint = { x: d3Event.transform.x, y: d3Event.transform.y, k: d3Event.transform.k };
		}
	}

	zoomAction() {
		this.logger.log("zoomAction - " + JSON.stringify(d3Event.transform));

		if (this.regionSelect === true) {
			const transPos = this.getTransformedMousePos();
			this.region.width = transPos.x - this.region.startX;
			this.region.height = transPos.y - this.region.startY;
			this.drawRegionSelector();

		} else {
			var x = d3Event.transform.x;
			var y = d3Event.transform.y;
			var k = d3Event.transform.k;

			// this.displayBoundingRectangles(); // This can be uncommented for debugging to see boundaries.

			// If we are not zooming we must be dragging so, if the canvas rectangle
			// (nodes and comments) is smaller than the SVG area then don't let the
			// canvas be dragged out of the SVG area.
			if (k === this.zoomStartPoint.k) {
				let canv;
				if (this.isDisplayingSubFlowInPlace()) {
					canv = this.getCanvasDimensionsAdjustedForScale(k, this.layout.supernodeZoomPadding);
				} else {
					canv = this.getCanvasDimensionsAdjustedForScale(k);
				}
				const zoomSvgRect = this.getViewPortDimensions();

				if (canv && canv.width < zoomSvgRect.width) {
					x = Math.max(-canv.left, Math.min(x, zoomSvgRect.width - canv.width - canv.left));
				}
				if (canv && canv.height < zoomSvgRect.height) {
					y = Math.max(-canv.top, Math.min(y, zoomSvgRect.height - canv.height - canv.top));
				}
			}

			this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(k);
			this.canvasGrp.attr("transform", this.zoomTransform);

			const selector = this.getSelectorForClass("d3-comment-entry");
			const ta = this.canvasDiv.select(selector);
			if (!ta.empty()) {
				ta.style("transform", this.getTextAreaTransform());
			}

			if (this.isDisplayingSubFlowFullPage()) {
				// The supernode will not have any calculated port positions when the
				// subflow is being displayed full screen, so calculate them first.
				this.setPortPositionsForNode(this.getParentSupernodeDatum());
				this.displayBindingNodesToFitSVG();
			}
		}
	}

	zoomEnd() {
		this.logger.log("zoomEnd - " + JSON.stringify(d3Event.transform));

		if (this.drawingNewLink) {
			this.stopDrawingNewLink();
			this.drawingNewLink = false;
		}

		if (this.regionSelect === true) {
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
		}
	}

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. It
	// does not include the 'super binding nodes' which are the binding nodes in
	// a sub-flow that map to a port in the containing supernode. The dimensions
	// are scaled by k and padded by pad (if provided).
	getCanvasDimensionsAdjustedForScale(k, pad) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		const selector = this.getSelectorForClass("node-group");

		this.canvasGrp.selectAll(selector).each((d) => {
			if (d.isSupernodeInputBinding || d.isSupernodeOutputBinding) { // Always ignore Supernode binding nodes
				return;
			}
			canvLeft = Math.min(canvLeft, d.x_pos - this.layout.highlightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.layout.highlightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.layout.highlightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.layout.highlightGap);
		});

		const selector2 = this.getSelectorForClass("comment-group");

		this.canvasGrp.selectAll(selector2).each((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.layout.highlightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.layout.highlightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.layout.highlightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.layout.highlightGap);
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

	dragStart(d) {
		this.logger.logStartTimer("dragStart");
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		// Note: Comment resizing is started by the comment highlight rectangle.
		this.logger.logEndTimer("dragStart", true);
	}

	dragMove() {
		this.logger.logStartTimer("dragMove");
		this.dragging = true;
		if (this.commentSizing) {
			this.resizeComment();
		} else if (this.nodeSizing) {
			this.resizeNode();
		} else {
			this.dragOffsetX += d3Event.dx;
			this.dragOffsetY += d3Event.dy;

			var objs = this.getSelectedNodesAndComments();

			// this.logger.log("Drag offset X = " + this.dragOffsetX + " y = " + this.dragOffsetY);
			if (this.dragOffsetX < 5000 && this.dragOffsetX > -5000 &&
					this.dragOffsetY < 5000 && this.dragOffsetY > -5000) {
				objs.forEach(function(d) {
					d.x_pos += d3Event.dx;
					d.y_pos += d3Event.dy;
				});
			} else {
				this.dragOffsetX -= d3Event.dx;
				this.dragOffsetY -= d3Event.dy;
			}

			this.displayCanvas();
		}
		this.logger.logEndTimer("dragMove", true);
	}

	dragEnd() {
		this.logger.logStartTimer("dragEnd");
		if (this.commentSizing) {
			this.dragging = false;
			this.endCommentSizing();

		} else if (this.nodeSizing) {
			this.dragging = false;
			this.endNodeSizing();

		} else if (this.dragging) {
			this.dragging = false; // Set to false before updating object model so main body of displayNodes is run.
			if (this.dragOffsetX !== 0 ||
					this.dragOffsetY !== 0) {
				this.canvasController.editActionHandler({
					editType: "moveObjects",
					nodes: this.objectModel.getSelectedObjectIds(),
					offsetX: this.dragOffsetX,
					offsetY: this.dragOffsetY,
					pipelineId: this.activePipeline.id });
			}
		}
		this.logger.logEndTimer("dragEnd", true);
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

		const nodeSelector = this.getSelectorForClass("node-group");


		var nodeGroupSel = this.canvasGrp
			.selectAll(nodeSelector)
			.data(this.activePipeline.nodes, function(d) { return d.id; });

		// For any of these activities we don't need to do anything to the nodes.
		if (this.canvasController.isTipShowing() || this.commentSizing) {
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
							that.updatePortRadius(this, d, that.layout.cssNodePortOutput);
						}
						if (d.isSupernodeOutputBinding) {
							that.updatePortRadius(this, d, that.layout.cssNodePortInput);
							that.updatePortArrowPath(this, d, that.layout.cssNodePortInputArrow);
						}
					});
			}

		} else if (this.selecting || this.regionSelect) {
			nodeGroupSel.each(function(d) {
				const nodeOutlineSelector = that.getSelectorForId("node_outline", d.id);
				that.canvasGrp.selectAll(nodeOutlineSelector)
					.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
					.attr("class", that.layout.cssNodeSelectionHighlight);
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
				.attr("id", (d) => that.getId("node_grp", d.id))
				.attr("data-pipeline-id", this.getNonNumericPipelineId()) // Values cannot begin with a number so add x!
				.attr("class", "obj-group node-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.addDynamicNodeIcons(d, this);
					if (that.canShowTip(TIP_TYPE_NODE)) {
						that.canvasController.showTip({
							id: that.getId("node_tip", d.id),
							type: TIP_TYPE_NODE,
							targetObj: this,
							pipelineId: that.activePipeline.id,
							node: d
						});
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.canvasGrp.selectAll(that.getId("#node_body", d.id)).attr("hover", "no");
					that.removeDynamicNodeIcons(d);
					that.canvasController.hideTip();
				})
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.logger.log("Node Group - mouse down");
					this.selecting = true;
					d3Event.stopPropagation(); // Prevent mousedown event going through to canvas
					if (!this.objectModel.isSelected(d.id, this.activePipeline.id)) {
						if (d3Event.shiftKey) {
							this.objectModel.selectSubGraph(d.id, this.activePipeline.id);
						} else {
							this.objectModel.toggleSelection(d.id, isCmndCtrlPressed(), this.activePipeline.id);
						}
					} else {
						if (isCmndCtrlPressed()) {
							this.objectModel.toggleSelection(d.id, isCmndCtrlPressed(), this.activePipeline.id);
						}
					}
					this.canvasController.clickActionHandler({
						clickType: "SINGLE_CLICK",
						objectType: "node",
						id: d.id,
						selectedObjectIds: this.objectModel.getSelectedObjectIds(),
						pipelineId: this.activePipeline.id });
					this.selecting = false;
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
					if (this.drawingNewLink === true) {
						this.completeNewLink(d);
					}
				})
				.on("click", (d) => {
					this.logger.log("Node Group - click");
					d3Event.stopPropagation(); // Prevent click going through to zoom.click attached to SVG which would cancel this node selection
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
					stopPropagationAndPreventDefault();
					if (!d.isSupernodeInputBinding && !d.isSupernodeOutputBinding) {
						that.openContextMenu("node", d);
					}
				})
				.call(this.drag); // Must put drag after mousedown listener so mousedown gets called first.

			// Node selection highlighting outline for new nodes, flexible properties set in next step
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("path")
				.attr("id", (d) => this.getId("node_outline", d.id))
				.attr("data-pipeline-id", this.getNonNumericPipelineId())
				.on("mousedown", (d) => {
					if (this.isExpandedSupernode(d)) {
						this.nodeSizing = true;
						this.nodeSizingId = d.id;
						// Note - node resizing and finalization of size is handled by drag functions.
					}
				})
				.on("mouseenter", (d) => {
					if (this.isExpandedSupernode(d)) {
						this.nodeSizingDirection = this.getSizingDirection(d);
						this.displaySizingCursor("node_outline", d.id, this.nodeSizingDirection);
					}
				});

			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("path")
				.attr("id", (d) => this.getId("node_body", d.id))
				.filter(() => this.layout.nodeShape === "port-arcs") // Only the "port-arcs" nodes have a drop-shadow.
				.style("filter", `url(${this.getId("#node_drop_shadow")})`);

			// Image outline - this code used for debugging purposes
			// newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
			//	.append("rect")
			// 	.attr("width", this.layout.imageWidth)
			// 	.attr("height", this.layout.imageHeight)
			// 	.attr("x", this.layout.imagePosX)
			// 	.attr("y", this.layout.imagePosY)
			// 	.attr("class", "d3-node-image-outline");

			// Node image
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("image")
				.attr("id", (d) => this.getId("node_image", d.id))
				.attr("xlink:href", (d) => d.image)
				.attr("width", this.layout.imageWidth)
				.attr("height", this.layout.imageHeight)
				.attr("x", this.layout.imagePosX)
				.attr("class", "node-image");

			// Label outline - this code used for debugging purposes
			// newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
			//	.append("rect")
			// 	.attr("width", this.layout.labelWidth)
			// 	.attr("height", this.layout.labelHeight)
			// 	.attr("x", this.layout.labelPosX)
			// 	.attr("y", (d) => this.getLabelPosY(d))
			// 	.attr("class", "d3-label-outline");

			// Label
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d))
				.append("text")
				.attr("id", (d) => that.getId("node_label", d.id))
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					const labelObj = d3.select(this);
					if (that.layout.displayFullLabelOnHover &&
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
			if (this.layout.connectionType === "halo") {
				newNodeGroups.append("circle")
					.attr("id", (d) => this.getId("node_halo", d.id))
					.attr("class", "d3-node-halo")
					.attr("cx", this.layout.haloCenterX)
					.attr("cy", this.layout.haloCenterY)
					.attr("r", this.layout.haloRadius)
					.on("mousedown", (d) => {
						this.logger.log("Halo - mouse down");
						d3Event.stopPropagation();
						this.drawingNewLink = true;
						this.drawingNewLinkSrcId = d.id;
						this.drawingNewLinkAction = "node-node";
						this.drawingNewLinkStartPos = this.getTransformedMousePos();
						this.drawingNewLinkArray = [];
						this.drawNewLink();
					});
			}

			// Error indicator
			newNodeGroups.filter((d) => !this.isSuperBindingNode(d)).append("circle")
				.attr("id", (d) => that.getId("node_error_marker", d.id))
				.attr("class", (d) => "node-error-marker " + that.getMessageCircleClass(d.messages))
				.attr("cx", this.layout.errorCenterX)
				.attr("r", this.layout.errorRadius);

			// Decorators
			this.addDecorator(newNodeGroups, "topLeft", this.layout.decoratorLeftX, this.layout.decoratorTopY);
			this.addDecorator(newNodeGroups, "topRight", this.layout.decoratorRightX, this.layout.decoratorTopY);
			this.addDecorator(newNodeGroups, "bottomLeft", this.layout.decoratorLeftX, this.layout.decoratorBottomY);
			this.addDecorator(newNodeGroups, "bottomRight", this.layout.decoratorRightX, this.layout.decoratorBottomY);


			const newAndExistingNodeGrps =
				nodeGroupSel.enter().merge(nodeGroupSel);

			newAndExistingNodeGrps
				.each((d) => {
					const nodeGrp = this.canvasGrp.selectAll(that.getId("#node_grp", d.id));
					const node = this.getNode(d.id);

					nodeGrp
						.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
						.datum(node); // Set the __data__ to the updated data

					// Node selection highlighting: set flexible properties
					nodeGrp.select(that.getId("#node_outline", d.id))
						.attr("d", (nd) => this.getNodeShapePathOutline(nd))
						.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
						.attr("class", this.layout.cssNodeSelectionHighlight)
						.datum(node); // Set the __data__ to the updated data

					// This code will remove custom attributes from a node. This might happen when
					// the user clicks the canvas background to remove the greyed out appearance of
					// a node that was 'cut' to the clipboard.
					// TODO - Remove this code if/when common canvas supports cut (which removes nodes
					// from the canvas) and when WML Canvas uses that clipboard support in place
					// of its own.
					nodeGrp.select(that.getId("#node_image", d.id))
						.attr("y", (nd) => this.getImagePosY(nd))
						.style("display", function(nd) { return that.isExpandedSupernode(nd) ? "none" : "inherit"; })
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
					nodeGrp.select(that.getId("#node_label", d.id))
						.datum(node) // Set the __data__ to the updated data
						.attr("x", (nd) => this.getLabelPosX(nd))
						.attr("y", (nd) => this.getLabelPosY(nd) + this.layout.labelHeight - this.layout.labelDescent)
						.attr("text-anchor", (nd) => this.getLabelHorizontalJustification(nd))
						.text(function(nd) {
							var textObj = d3.select(this);
							return that.getLabelText(nd, textObj);
						})
						.attr("class", function(nd) { return that.layout.cssNodeLabel + " " + that.getMessageLabelClass(nd.messages); });

					// Supernode sub-flow display
					if (this.isSupernode(d)) {
						const ren = this.findSuperRenderer(d);
						if (ren) {
							if (this.isExpanded(d)) {
								ren.displayCanvas();
							} else {
								ren.hideCanvas(d);
							}
						}
					}

					// Set cy for error circle in new and existing nodes
					nodeGrp.select(that.getId("#node_error_marker", d.id))
						.datum(node) // Set the __data__ to the updated data
						.attr("cy", (nd) => this.getErrorPosY(nd))
						.attr("cx", (nd) => this.getErrorPosX(nd, nodeGrp))
						.attr("class", function(nd) { return "node-error-marker " + that.getMessageCircleClass(nd.messages); });

					// Handle port related objects
					if (this.layout.connectionType === "ports") {
						// Node body updates
						nodeGrp.select(that.getId("#node_body", d.id))
							.datum(node) // Set the __data__ to the updated data
							.attr("d", (cd) => this.getNodeShapePath(cd))
							.attr("class", (cd) => this.getNodeBodyClass(cd));

						// Input ports
						if (d.input_ports && d.input_ports.length > 0) {
							// This selector will select all input ports which are for the currently
							// active pipeline. It is necessary to select them by the active pipeline
							// because an expanded super node will include its own input ports as well
							// as those of the sub-flow nodes displayed in the supernode container and
							// when selecting for a supernode we need to exclude the ones from the sub-flow.
							const inSelector = this.getSelectorForClass(this.layout.cssNodePortInput);

							var inputPortSelection =
								nodeGrp.selectAll(inSelector)
									.data(d.input_ports, function(p) { return p.id; });

							// Input port circle
							inputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => this.getId("node_trg_port", d.id, port.id))
								.attr("data-pipeline-id", this.getNonNumericPipelineId())
								.attr("portId", (port) => port.id) // This is needed by getNodeInputPortAtMousePos
								.attr("cx", 0)
								.attr("connected", "no")
								.attr("isSupernodeBinding", this.isSuperBindingNode(d) ? "yes" : "no")
								.on("mouseenter", function(port) {
									stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										that.canvasController.hideTip();
										that.canvasController.showTip({
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
									this.canvasController.hideTip();
								})
								.merge(inputPortSelection)
								.attr("r", () => this.getPortRadius(d))
								.attr("cy", (port) => port.cy)
								.attr("class", (port) =>
									this.layout.cssNodePortInput + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => that.getNodePort(d.id, port.id, "input"));

							inputPortSelection.exit().remove();

							const inArrSelector = this.getSelectorForClass(this.layout.cssNodePortInputArrow);

							var inputPortArrowSelection =
								nodeGrp.selectAll(inArrSelector)
									.data(d.input_ports, function(p) { return p.id; });

							// Input port arrow in circle
							inputPortArrowSelection.enter()
								.append("path")
								.attr("id", (port) => this.getId("node_trg_port_arrow", d.id, port.id))
								.attr("data-pipeline-id", this.getNonNumericPipelineId())
								.attr("class", this.layout.cssNodePortInputArrow)
								.attr("connected", "no")
								.attr("isSupernodeBinding", this.isSuperBindingNode(d) ? "yes" : "no")
								.on("mouseenter", function(port) {
									stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										that.canvasController.showTip({
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
									this.canvasController.hideTip();
								})
								.merge(inputPortArrowSelection)
								.attr("d", (port) => this.getArrowShapePath(port.cy, d, this.zoomTransform.k))
								.datum((port) => this.getNodePort(d.id, port.id, "input"));

							inputPortArrowSelection.exit().remove();
						}

						// Output ports
						if (d.output_ports && d.output_ports.length > 0) {
							// This selector will select all output ports which are for the currently
							// active pipeline. It is necessary to select them by the active pipeline
							// because an expanded super node will include its own output ports as well
							// as those of the sub-flow nodes displayed in the supernode container and
							// when selecting for a supernode we need to exclude the ones from the sub-flow.
							const outSelector = this.getSelectorForClass(this.layout.cssNodePortOutput);

							var outputPortSelection = nodeGrp.selectAll(outSelector)
								.data(d.output_ports, function(p) { return p.id; });

							outputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => this.getId("node_src_port", d.id, port.id))
								.attr("data-pipeline-id", this.getNonNumericPipelineId())
								.on("mousedown", (port) => {
									// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
									if (d3Event.button === 0) {
										stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
										this.drawingNewLink = true;
										this.drawingNewLinkSrcId = d.id;
										this.drawingNewLinkSrcPortId = port.id;
										this.drawingNewLinkAction = "node-node";
										const srcNode = this.getNode(d.id);
										this.drawingNewLinkStartPos = { x: srcNode.x_pos + srcNode.width, y: srcNode.y_pos + port.cy };
										this.drawingNewLinkArray = [];
										this.drawNewLink();
									}
								})
								.on("mouseenter", function(port) {
									stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										that.canvasController.hideTip();
										that.canvasController.showTip({
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
									this.canvasController.hideTip();
								})
								.merge(outputPortSelection)
								.attr("r", () => this.getPortRadius(d))
								.attr("cx", (port) => d.width)
								.attr("cy", (port) => port.cy)
								.attr("class", (port) => this.layout.cssNodePortOutput + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => this.getNodePort(d.id, port.id, "output"));

							outputPortSelection.exit().remove();
						}
					}
				});

			// Remove any nodes that are no longer in the diagram.nodes array.
			nodeGroupSel.exit().remove();
		}
		this.logger.logEndTimer("displayNodes " + this.getFlags());
	}

	getPortRadius(d) {
		return this.isSuperBindingNode(d) ? this.layout.supernodeBindingPortRadius / this.zoomTransform.k : this.layout.portRadius;
	}

	isSuperBindingNode(d) {
		return d.isSupernodeInputBinding || d.isSupernodeOutputBinding;
	}

	addDynamicNodeIcons(d, nodeGrpSrc) {
		if (!this.nodeSizing && !this.isSuperBindingNode(d)) {
			const nodeGrp = d3.select(nodeGrpSrc);
			if (this.layout.connectionType === "ports") {
				this.canvasGrp.selectAll(this.getId("#node_body", d.id)).attr("hover", "yes");
				nodeGrp
					.append("rect")
					.attr("id", () => this.getId("node_ellipsis_background", d.id))
					.attr("class", "d3-node-ellipsis-background")
					.attr("width", this.layout.ellipsisWidth)
					.attr("height", this.layout.ellipsisHeight)
					.attr("x", (nd) => this.getEllipsisPosX(nd))
					.attr("y", (nd) => this.getEllipsisPosY(nd))
					.on("click", () => {
						stopPropagationAndPreventDefault();
						this.openContextMenu("node", d);
					});
				nodeGrp
					.append("svg")
					.attr("id", () => this.getId("node_ellipsis", d.id))
					.attr("class", "d3-node-ellipsis")
					.html(NODE_MENU_ICON)
					.attr("width", this.layout.ellipsisWidth)
					.attr("height", this.layout.ellipsisHeight)
					.attr("x", (nd) => this.getEllipsisPosX(nd))
					.attr("y", (nd) => this.getEllipsisPosY(nd))
					.on("click", () => {
						stopPropagationAndPreventDefault();
						this.openContextMenu("node", d);
					});
			}

			if (this.isExpandedSupernode(d)) {
				// Supernode expansion icon background
				nodeGrp
					.append("rect")
					.attr("id", () => this.getId("node_exp_back", d.id))
					.attr("width", this.layout.supernodeIconWidth + (2 * this.layout.supernodeIconPadding))
					.attr("height", this.layout.supernodeIconHeight + (2 * this.layout.supernodeIconPadding))
					.attr("x", (nd) => this.getExpansionIconPosX(nd) - this.layout.supernodeIconPadding)
					.attr("y", this.layout.supernodeIconPosY - this.layout.supernodeIconPadding)
					.attr("class", "d3-node-super-expand-icon-outline")
					.on("click", () => {
						stopPropagationAndPreventDefault();
						this.displaySupernodeFullPage(d);
					});

				// Supernode expansion icon
				nodeGrp
					.append("svg")
					.attr("id", () => this.getId("node_exp_icon", d.id))
					.attr("class", "d3-node-super-expand-icon")
					.html(SUPER_NODE_EXPAND_ICON)
					.attr("width", this.layout.supernodeIconWidth)
					.attr("height", this.layout.supernodeIconHeight)
					.attr("x", (nd) => this.getExpansionIconPosX(nd))
					.attr("y", this.layout.supernodeIconPosY)
					.on("click", () => {
						stopPropagationAndPreventDefault();
						this.displaySupernodeFullPage(d);
					});
			}
		}
	}

	setSupernodesBindingStatus() {
		const supernodeDatum = this.getParentSupernodeDatum();
		this.activePipeline.nodes.forEach((node) => {
			if (supernodeDatum.input_ports && this.isEntryBindingNode(node)) {
				supernodeDatum.input_ports.forEach((supernodeInputPort) => {
					node.isSupernodeInputBinding = (supernodeInputPort.subflow_node_ref === node.id) ? true : node.isSupernodeInputBinding;
				});
			}
			if (supernodeDatum.output_ports && this.isExitBindingNode(node)) {
				supernodeDatum.output_ports.forEach((supernodeOutputPort) => {
					node.isSupernodeOutputBinding = (supernodeOutputPort.subflow_node_ref === node.id) ? true : node.isSupernodeOutputBinding;
				});
			}
		});
	}

	updatePortRadius(node, d, cssNodePort) {
		const nodeGrp = d3.select(node);
		const selector = this.getSelectorForClass(cssNodePort);
		nodeGrp.selectAll(selector)
			.attr("r", () => this.getPortRadius(d));
	}

	updatePortArrowPath(node, d, cssNodePortArrow) {
		const nodeGrp = d3.select(node);
		const selector = this.getSelectorForClass(cssNodePortArrow);
		nodeGrp.selectAll(selector)
			.attr("d", (port) => this.getArrowShapePath(port.cy, d, this.zoomTransform.k));
	}

	isEntryBindingNode(node) {
		return node.type === "binding" && node.output_ports && node.output_ports.length > 0;
	}

	isExitBindingNode(node) {
		return node.type === "binding" && node.input_ports && node.input_ports.length > 0;
	}

	removeDynamicNodeIcons(d) {
		if (this.layout.connectionType === "ports") {
			this.canvasGrp.selectAll(this.getId("#node_ellipsis", d.id)).remove();
			this.canvasGrp.selectAll(this.getId("#node_ellipsis_background", d.id)).remove();
		}

		if (this.isExpandedSupernode(d)) {
			this.canvasGrp.selectAll(this.getId("#node_exp_icon", d.id)).remove();
			this.canvasGrp.selectAll(this.getId("#node_exp_back", d.id)).remove();
		}
	}

	createSupernodeRenderer(d, supernodeD3Object) {
		if (d.subflow_ref && d.subflow_ref.pipeline_id_ref) {
			if (!this.findSuperRenderer(d)) { // If a renderer exists from a previous run, no need to create new one.
				const superRenderer = new CanvasRenderer(
					d.subflow_ref.pipeline_id_ref,
					this.canvasDiv,
					this.canvasController,
					this.canvasInfo,
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

	findSuperRenderer(d) {
		const idx = this.indexOfSuperRenderer(d);
		if (idx > -1) {
			return this.superRenderers[idx];
		}
		return null;
	}

	indexOfSuperRenderer(d) {
		// TODO - using pipelineId as unique identifier for renderer may be
		// a problem if two super nodes are displayed for the same sub-flow pipeline
		return this.superRenderers.findIndex((sr) => sr.pipelineId === d.subflow_ref.pipeline_id_ref);
	}

	displaySupernodeFullPage(d) {
		this.canvasController.displaySubPipeline({ pipelineId: d.subflow_ref.pipeline_id_ref, pipelineFlowId: this.pipelineFlowId });
	}

	getImagePosY(data) {
		if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.imageHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				var imageLabelGap = this.layout.labelPosY - (this.layout.imagePosY + this.layout.imageHeight);
				return (data.height / 2) - ((this.layout.imageHeight + this.layout.labelHeight + imageLabelGap) / 2);
			}
		}
		return this.layout.imagePosY;
	}

	getLabelText(data, textObj) {
		let labelWidth = this.layout.labelWidth;
		if (this.isExpandedSupernode(data)) {
			labelWidth = this.layout.supernodeLabelWidth;
		}

		return this.trimLabelToWidth(data.label, labelWidth, this.layout.cssNodeLabel, textObj);
	}

	getLabelPosX(data) {
		if (this.isExpandedSupernode(data)) {
			return this.layout.supernodeLabelPosY;
		}
		return this.layout.labelHorizontalJustification === "left" // If not "left" then "center"
			? this.layout.labelPosX : this.layout.labelPosX + (this.layout.labelWidth / 2);
	}

	getLabelPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.layout.supernodeLabelPosY;
		} else if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.labelHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				var imageLabelGap = this.layout.labelPosY - (this.layout.imagePosY + this.layout.imageHeight);
				return (data.height / 2) + ((this.layout.imageHeight + this.layout.labelHeight + imageLabelGap) / 2) - this.layout.labelHeight;
			}
		}

		return this.layout.labelPosY;
	}

	getErrorPosX(data, nodeGrp) {
		if (this.isExpandedSupernode(data)) {
			const nodeText = nodeGrp.select(this.getId("#node_label", data.id)).node();
			return nodeText.getComputedTextLength() + this.layout.supernodeLabelPosX + this.layout.errorRadius + this.layout.supernodeElementsPadding;
		}
		return this.layout.errorCenterX;
	}

	getErrorPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.layout.supernodeSVGTopAreaHeight / 2;
		} else
		if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.imageHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				var imageLabelGap = this.layout.labelPosY - (this.layout.imagePosY + this.layout.imageHeight);
				return (data.height / 2) - ((this.layout.imageHeight + this.layout.labelHeight + imageLabelGap) / 2);
			}
		}
		return this.layout.errorCenterY;
	}

	getEllipsisPosX(data) {
		if (this.isExpandedSupernode(data)) {
			return data.width - (2 * this.layout.supernodeIconSeparation) - this.layout.supernodeIconWidth - this.layout.ellipsisWidth;
		}

		return this.layout.ellipsisPosX;
	}

	getEllipsisPosY(data) {
		if (this.isExpandedSupernode(data)) {
			return this.layout.supernodeEllipsisPosY;
		}

		if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.ellipsisHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				return this.getImagePosY(data) - (this.layout.ellipsisPosY - this.layout.imagePosY);
			}
		}
		return this.layout.ellipsisPosY;
	}

	getLabelHorizontalJustification(data) {
		if (this.isExpandedSupernode(data)) {
			return "left";
		}
		return this.layout.labelHorizontalJustification === "left" ? "start" : "middle";
	}

	getExpansionIconPosX(data) {
		return data.width - this.layout.supernodeIconSeparation - this.layout.supernodeIconWidth;
	}

	isExpandedSupernode(data) {
		return this.isSupernode(data) && this.isExpanded(data);
	}

	isExpanded(data) {
		return data.is_expanded === true;
	}

	isSupernode(data) {
		return data.type === "super_node";
	}

	openContextMenu(type, d) {
		stopPropagationAndPreventDefault(); // Stop the browser context menu appearing
		this.canvasController.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			pipelineId: this.activePipeline.id,
			cmPos: this.getMousePos(this.canvasDiv.selectAll("svg")), // Get mouse pos relative to top most SVG area.
			mousePos: this.getTransformedMousePos(),
			selectedObjectIds: this.objectModel.getSelectedObjectIds(),
			zoom: this.zoomTransform.k });
	}

	setTrgPortStatus(trgId, trgPortId, newStatus) {
		const trgPrtSelector = this.getSelectorForId("node_trg_port", trgId, trgPortId);
		const trgPrtArrSelector = this.getSelectorForId("node_trg_port_arrow", trgId, trgPortId);
		this.canvasGrp.selectAll(trgPrtSelector).attr("connected", newStatus);
		this.canvasGrp.selectAll(trgPrtArrSelector).attr("connected", newStatus);
	}

	setSrcPortStatus(srcId, srcPortId, newStatus) {
		const srcPrtSelector = this.getSelectorForId("node_src_port", srcId, srcPortId);
		this.canvasGrp.selectAll(srcPrtSelector).attr("connected", newStatus);
	}

	// Adds a decorator to the nodeGroup passed in of the type passed in at the
	// x and y position provided.
	addDecorator(nodeGroup, type, x, y) {
		var decGrp = nodeGroup
			.filter((d) => !this.isSuperBindingNode(d))
			.filter((d) => this.isDecoration(d, type));

		decGrp.append("rect")
			.attr("width", this.layout.decoratorWidth + 2)
			.attr("height", this.layout.decoratorHeight + 2)
			.attr("x", x)
			.attr("y", y)
			.attr("class", (d) => this.getDecoratorClass(d, type))
			.filter((d) => this.isDecoratorHotSpot(d, type))
			.on("mousedown", (d) => this.getDecoratorCallback(d, type));

		decGrp.append("image")
			.attr("width", this.layout.decoratorWidth)
			.attr("height", this.layout.decoratorHeight)
			.attr("x", x)
			.attr("y", y)
			.attr("xlink:href", (d) => this.getDecoratorImage(d, type))
			.attr("class", "d3-decorator-image")
			.filter((d) => this.isDecoratorHotSpot(d, type))
			.on("mousedown", (d) => this.getDecoratorCallback(d, type));
	}

	// Returns true if the datum passed in has a decoration for the decoration
	// type passed in which can be topLeft, topRight, bottomLeft or bottomRight.
	isDecoration(d, type) {
		if (d.decorations) {
			return d.decorations.find((dc) => dc.position === type);
		}
		return false;
	}

	getDecoratorClass(d, type) {
		if (d.decorations) {
			var dec = d.decorations.find((dc) => dc.position === type);
			if (dec && dec.class_name) {
				return dec.class_name;
			}
		}
		return "d3-decorator-outline";
	}

	getDecoratorImage(d, type) {
		if (d.decorations) {
			var dec = d.decorations.find((dc) => dc.position === type);
			if (dec) {
				if (dec.class_name === "node-zoom") { // TODO - Remove this if when WML external model supports decorator image field.
					return "/images/decorators/zoom-in_32.svg";
				}
				return dec.image;
			}
		}
		return "";
	}

	isDecoratorHotSpot(d, type) {
		if (d.decorations) {
			var dec = d.decorations.find((dc) => dc.position === type);
			if (dec) {
				return dec.hotspot;
			}
		}
		return false;
	}

	getDecoratorCallback(d, type) {
		d3Event.stopPropagation();
		if (this.canvasController.decorationActionHandler) {
			var id = this.getDecoratorId(d, type);
			this.canvasController.decorationActionHandler(d, id);
		}
	}

	getDecoratorId(d, type) {
		if (d.decorations) {
			var dec = d.decorations.find((dc) => dc.position === type);
			if (dec) {
				return dec.id;
			}
		}
		return null;
	}

	drawNewLink() {
		this.removeNewLink();

		const transPos = this.getTransformedMousePos();

		if (this.layout.connectionType === "halo") {
			this.drawNewLinkForHalo(transPos);
		} else {
			if (this.drawingNewLinkAction === "comment-node") {
				this.drawNewCommentLinkForPorts(transPos);
			} else {
				this.drawNewNodeLinkForPorts(transPos);
			}
		}
	}

	drawNewLinkForHalo(transPos) {
		this.canvasGrp
			.append("line")
			.attr("x1", this.drawingNewLinkStartPos.x)
			.attr("y1", this.drawingNewLinkStartPos.y)
			.attr("x2", transPos.x - 2) // Offset mouse position so mouse messages don't go to link line
			.attr("y2", transPos.y - 2) // Offset mouse position so mouse messages don't go to link line
			.attr("class", "d3-node-connector");
	}

	drawNewNodeLinkForPorts(transPos) {
		var that = this;
		const linkType = "nodeLink";

		if (this.drawingNewLinkArray.length === 0) {
			this.drawingNewLinkArray = [{ "x1": this.drawingNewLinkStartPos.x,
				"y1": this.drawingNewLinkStartPos.y,
				"x2": transPos.x,
				"y2": transPos.y,
				"type": linkType }];
		} else {
			this.drawingNewLinkArray[0].x2 = transPos.x;
			this.drawingNewLinkArray[0].y2 = transPos.y;
		}

		this.canvasGrp.selectAll(".d3-new-connection-line")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", "d3-new-connection-line")
			.attr("linkType", linkType);

		this.canvasGrp.selectAll(".d3-new-connection-start")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x1)
			.attr("cy", (d) => d.y1)
			.attr("r", this.layout.portRadius)
			.attr("class", "d3-new-connection-start")
			.attr("linkType", linkType);

		this.canvasGrp.selectAll(".d3-new-connection-blob")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.layout.portRadius)
			.attr("class", "d3-new-connection-blob")
			.attr("linkType", linkType)
			.on("mouseup", () => {
				stopPropagationAndPreventDefault();
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			});
	}

	drawNewCommentLinkForPorts(transPos) {
		const that = this;
		const srcComment = this.getComment(this.drawingNewLinkSrcId);

		this.drawingNewLinkStartPos = this.getOuterCoord(
			srcComment.x_pos - this.layout.linkGap,
			srcComment.y_pos - this.layout.linkGap,
			srcComment.width + (this.layout.linkGap * 2),
			srcComment.height + (this.layout.linkGap * 2),
			srcComment.width / 2 + this.layout.linkGap,
			srcComment.height / 2 + this.layout.linkGap,
			transPos.x,
			transPos.y);

		var linkType = "commentLink";

		this.drawingNewLinkArray = [{ "x1": this.drawingNewLinkStartPos.x,
			"y1": this.drawingNewLinkStartPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		this.canvasGrp.selectAll(".d3-new-connection-line")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", "d3-new-connection-line")
			.attr("linkType", linkType);

		this.canvasGrp.selectAll(".d3-new-connection-blob")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.layout.commentPortRadius)
			.attr("class", "d3-new-connection-blob")
			.attr("linkType", linkType)
			.on("mouseup", () => {
				stopPropagationAndPreventDefault();
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			});

		if (this.layout.commentLinkArrowHead) {
			this.canvasGrp.selectAll(".d3-new-connection-arrow")
				.data(this.drawingNewLinkArray)
				.enter()
				.append("path")
				.attr("d", (d) => this.getArrowHead(d))
				.attr("class", "d3-new-connection-arrow")
				.attr("linkType", linkType)
				.on("mouseup", () => {
					stopPropagationAndPreventDefault();
					var trgNode = this.getNodeAtMousePos();
					if (trgNode !== null) {
						this.completeNewLink(trgNode);
					} else {
						this.stopDrawingNewLink();
					}
				});
		}
	}

	completeNewLink(trgNode) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		if (trgNode !== null) {
			if (this.drawingNewLinkAction === "node-node") {
				var trgPortId = this.getNodeInputPortAtMousePos();
				trgPortId = trgPortId || (trgNode.input_ports && trgNode.input_ports.length > 0 ? trgNode.input_ports[0].id : null);
				this.canvasController.editActionHandler({
					editType: "linkNodes",
					nodes: [{ "id": this.drawingNewLinkSrcId, "portId": this.drawingNewLinkSrcPortId }],
					targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
					linkType: "data",
					pipelineId: this.pipelineId });
			} else {
				this.canvasController.editActionHandler({
					editType: "linkComment",
					nodes: [this.drawingNewLinkSrcId],
					targetNodes: [trgNode.id],
					linkType: "comment",
					pipelineId: this.pipelineId });
			}
		}

		this.drawingNewLink = false;
		this.drawingNewLinkSrcId = null;
		this.drawingNewLinkSrcPortId = null;
		this.drawingNewLinkAction = null;
		this.drawingNewLinkStartPos = null;
		this.drawingNewLinkArray = [];
	}

	stopDrawingNewLink() {
		if (this.layout.connectionType === "halo") {
			this.stopDrawingNewLinkForHalo();
		} else {
			this.stopDrawingNewLinkForPorts();
		}
	}

	stopDrawingNewLinkForHalo() {
		this.removeNewLink();
		this.drawingNewLink = false;
		this.drawingNewLinkSrcId = null;
		this.drawingNewLinkSrcPortId = null;
		this.drawingNewLinkAction = null;
		this.drawingNewLinkStartPos = null;
		this.drawingNewLinkArray = [];
	}

	stopDrawingNewLinkForPorts() {
		const saveX1 = this.drawingNewLinkArray[0].x1;
		const saveY1 = this.drawingNewLinkArray[0].y1;
		const saveX2 = this.drawingNewLinkArray[0].x2;
		const saveY2 = this.drawingNewLinkArray[0].y2;

		this.drawingNewLink = false;
		this.drawingNewLinkSrcId = null;
		this.drawingNewLinkSrcPortId = null;
		this.drawingNewLinkAction = null;
		this.drawingNewLinkStartPos = null;
		this.drawingNewLinkArray = [];

		// If we completed a connection successfully just remove the new line
		// objects.
		let newPath = "";
		let duration = 350;

		if (this.layout.linkType === "Curve") {
			newPath = "M " + saveX1 + " " + saveY1 +
								"C " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2;

		} else if (this.layout.linkType === "Straight") {
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

				this.canvasGrp.selectAll(".d3-new-connection-blob")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
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
		if (this.layout.connectionType === "halo") {
			this.canvasGrp.selectAll(".d3-node-connector").remove();
		} else {
			this.canvasGrp.selectAll(".d3-new-connection-line").remove();
			this.canvasGrp.selectAll(".d3-new-connection-start").remove();
			this.canvasGrp.selectAll(".d3-new-connection-blob").remove();
			this.canvasGrp.selectAll(".d3-new-connection-arrow").remove();
		}
	}

	getNodeAtMousePos() {
		const that = this;
		var pos = this.getTransformedMousePos();

		var node = null;
		const selector = this.getSelectorForClass("node-group");
		this.canvasGrp.selectAll(selector)
			.each(function(d) {
				let portRadius = that.layout.portRadius;
				if (that.isSuperBindingNode(d)) {
					portRadius = that.layout.supernodeBindingPortRadius / that.zoomTransform.k;
				}

				if (pos.x >= d.x_pos - portRadius && // Target port sticks out by its radius so need to allow for it.
						pos.x <= d.x_pos + d.width + portRadius &&
						pos.y >= d.y_pos &&
						pos.y <= d.y_pos + d.height) {
					node = d;
				}
			});
		return node;
	}

	getNodeInputPortAtMousePos() {
		if (this.layout.connectionType === "halo") {
			return null;
		}

		const that = this;
		var pos = this.getTransformedMousePos();
		var portId = null;
		const node = this.getNodeAtMousePos();
		if (node) {
			this.canvasGrp.selectAll(this.getId("#node_grp", node.id)).selectAll("." + this.layout.cssNodePortInput)
				.each(function(p) { // Use function keyword so 'this' pointer references the dom object
					var cx = node.x_pos + this.cx.baseVal.value;
					var cy = node.y_pos + this.cy.baseVal.value;
					if (pos.x >= cx - that.layout.portRadius && // Target port sticks out by its radius so need to allow for it.
							pos.x <= cx + that.layout.portRadius &&
							pos.y >= cy - that.layout.portRadius &&
							pos.y <= cy + that.layout.portRadius) {
						portId = this.getAttribute("portId");
					}
				});
		}
		return portId;
	}

	// Returns a path string that will draw the outline shape of the node.
	getNodeShapePathOutline(data) {
		if (this.layout.nodeShape === "port-arcs") {
			return this.getPortArcsNodeShapePath(data); // Port-arc outline does not have a highlight gap
		}
		return this.getRectangleNodeShapePath(data, this.layout.highlightGap);
	}

	// Returns a path string that will draw the body shape of the node.
	getNodeShapePath(data) {
		if (this.layout.nodeShape === "port-arcs") {
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
		let path = "M 0 0 L " + data.width + " 0 "; // Draw line across the top of the node

		if (data.output_ports && data.output_ports.length > 0) {
			let endPoint = 0;

			// Draw straight segment down to ports (if needed)
			if (data.outputPortsHeight < data.height) {
				if (data.output_ports.length === 1 &&
						data.height <= this.layout.defaultNodeHeight) {
					endPoint = this.layout.portPosY - this.layout.portArcRadius;
				} else {
					endPoint = ((data.height - data.outputPortsHeight) / 2);
				}
				path += " L " + data.width + " " + endPoint;
			}

			// Draw port arcs
			data.output_ports.forEach((port, index) => {
				endPoint += (this.layout.portArcRadius * 2);
				path += " A " + this.layout.portArcRadius + " " + this.layout.portArcRadius + " 180 0 1 " + data.width + " " + endPoint;
				if (index < data.output_ports.length - 1) {
					endPoint += this.layout.portArcSpacing;
					path += " L " + data.width + " " + endPoint;
				}
			});

			// Draw finishing segment to bottom right corner
			if (data.outputPortsHeight < data.height) {
				path += " L " + data.width + " " + data.height;
			}

		// If no output ports just draw a straight line.
		} else {
			path += " L " + data.width + " " + data.height;
		}

		path += " L 0 " + data.height; // Draw line across the bottom of the node

		if (data.input_ports && data.input_ports.length > 0) {
			let endPoint = data.height;

			if (data.inputPortsHeight < data.height) {
				if (data.input_ports.length === 1 &&
						data.height <= this.layout.defaultNodeHeight) {
					endPoint = this.layout.portPosY + this.layout.portArcRadius;
				} else {
					endPoint = data.height - ((data.height - data.inputPortsHeight) / 2);
				}
				path += " L 0 " + endPoint;
			}

			data.input_ports.forEach((port, index) => {
				endPoint -= (this.layout.portArcRadius * 2);
				path += " A " + this.layout.portArcRadius + " " + this.layout.portArcRadius + " 180 0 1 0 " + endPoint;
				if (index < data.input_ports.length - 1) {
					endPoint -= this.layout.portArcSpacing;
					path += " L 0 " + endPoint;
				}
			});

			if (data.inputPortsHeight < data.height) {
				path += " Z"; // Draw finishing segment back to origin
			}
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
		this.setPortPositionsByInfo(node, node.input_ports, node.inputPortsHeight);
		this.setPortPositionsByInfo(node, node.output_ports, node.outputPortsHeight);
	}

	setPortPositionsByInfo(data, ports, portsHeight) {
		if (ports && ports.length > 0) {
			if (data.height <= this.layout.defaultNodeHeight &&
					ports.length === 1) {
				ports[0].cy = this.layout.portPosY;

			} else {
				let centerPoint = 0;

				if (portsHeight < data.height) {
					centerPoint = ((data.height - portsHeight) / 2);
				}

				ports.forEach((p) => {
					centerPoint += this.layout.portArcRadius;
					p.cy = centerPoint;
					centerPoint += this.layout.portArcRadius + this.layout.portArcSpacing;
				});
			}
		}
	}

	displayComments() {
		this.logger.logStartTimer("displayComments " + this.getFlags());

		// Do not return from here if there are no comments because there may
		// be still comments on display that need to be deleted.

		const that = this;
		const comSelector = this.getSelectorForClass("comment-group");

		var commentGroupSel = this.canvasGrp
			.selectAll(comSelector)
			.data(this.activePipeline.comments, function(d) { return d.id; });

		if (this.canvasController.isTipShowing() || this.nodeSizing) {
			this.logger.logEndTimer("displayComments " + this.getFlags());
			return;

		} else if (this.dragging && !this.commentSizing && !this.nodeSizing) {
			commentGroupSel
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.datum((d) => that.getComment(d.id)); // Set the __data__ to the updated data

		} else if (this.selecting || this.regionSelect) {
			commentGroupSel.each(function(d) {
				const comOutlineSelector = that.getSelectorForId("comment_outline", d.id);
				that.canvasGrp.selectAll(comOutlineSelector)
					.attr("height", d.height + (2 * that.layout.highlightGap))
					.attr("width", d.width + (2 * that.layout.highlightGap))
					.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
					.attr("class", that.layout.cssCommentSelectionHighlight)
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
				.attr("id", (d) => this.getId("comment_grp", d.id))
				.attr("data-pipeline-id", this.getNonNumericPipelineId())
				.attr("class", "obj-group comment-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				// Use mouse down instead of click because it gets called before drag start.
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					if (that.layout.connectionType === "ports") {
						d3.select(this)
							.append("circle")
							.attr("id", that.getId("comment_port"))
							.attr("cx", 0 - that.layout.highlightGap)
							.attr("cy", 0 - that.layout.highlightGap)
							.attr("r", that.layout.commentPortRadius)
							.attr("class", "d3-comment-port-circle")
							.on("mousedown", function(cd) {
								stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
								that.drawingNewLink = true;
								that.drawingNewLinkSrcId = d.id;
								this.drawingNewLinkSrcPortId = null;
								that.drawingNewLinkAction = "comment-node";
								that.drawingNewLinkStartPos = { x: d.x_pos - that.layout.highlightGap, y: d.y_pos - that.layout.highlightGap };
								that.drawingNewLinkArray = [];
								that.drawNewLink();
							});
					}
				})
				.on("mouseleave", (d) => {
					if (that.layout.connectionType === "ports") {
						that.canvasGrp.selectAll(that.getId("#comment_port")).remove();
					}
				})
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.logger.log("Comment Group - mouse down");
					this.selecting = true;
					d3Event.stopPropagation(); // Prevent mousedown event going through to canvas
					if (!this.objectModel.isSelected(d.id, this.activePipeline.id)) {
						if (d3Event.shiftKey) {
							this.objectModel.selectSubGraph(d.id, this.activePipeline.id);
						} else {
							this.objectModel.toggleSelection(d.id, isCmndCtrlPressed(), this.activePipeline.id);
						}
					} else {
						if (isCmndCtrlPressed()) {
							this.objectModel.toggleSelection(d.id, isCmndCtrlPressed(), this.activePipeline.id);
						}
					}
					// Even though the single click message below should be emitted
					// from common canvas, if we uncomment this line it prevents the
					// double click event going to the comment group object. This seems
					// to be a timing issue since the same problem is not evident with the
					// similar code for the Node group object.
					this.canvasController.clickActionHandler({
						clickType: "SINGLE_CLICK",
						objectType: "comment",
						id: d.id,
						selectedObjectIds: this.objectModel.getSelectedObjectIds(),
						pipelineId: this.activePipeline.id });
					this.selecting = false;
					this.logger.log("Comment Group - finished mouse down");
				})
				.on("click", (d) => {
					this.logger.log("Comment Group - click");
					d3Event.stopPropagation(); // Prevent click going through to zoom.click attached to SVG which would cancel this comment selection
				})
				.on("dblclick", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					that.logger.log("Comment Group - double click");
					stopPropagationAndPreventDefault();

					// TODO - Enable editing for comments inside sub-flow
					if (!that.isDisplayingSubFlowInPlace()) {
						that.canvasGrp.selectAll(that.getId("#comment_text", d.id)) // Make SVG text invisible when in edit mode.
							.attr("beingedited", "yes");

						var datum = d;
						var id = d.id;
						var width = d.width;
						var height = d.height;
						var xPos = d.x_pos;
						var yPos = d.y_pos;
						var content = d.content;

						that.textAreaHeight = 0; // Save for comparison during auto-resize
						that.editingComment = true;
						that.editingCommentId = id;

						that.zoomTextAreaCenterX = d.x_pos + (d.width / 2);
						that.zoomTextAreaCenterY = d.y_pos + (d.height / 2);

						// TODO - Need to calculate correct transform for text area when opened for comment in sub-flow
						// if (that.isDisplayingSubFlowInPlace()) {
						// 	const dims = that.getSupernodeDimensions();
						// 	const superDatum = that.parentSupernode.datum();
						// 	that.zoomTextAreaCenterX += superDatum.x_pos;
						// 	that.zoomTextAreaCenterY += superDatum.y_pos;
						// 	xPos += dims.x_pos;
						// 	yPos += dims.y_pos;
						// }

						that.canvasDiv
							.append("textarea")
							.attr("id",	that.getId("comment_text_area", id))
							.attr("data-nodeId", id)
							.attr("data-pipeline-id", that.getNonNumericPipelineId())
							.attr("class", "d3-comment-entry")
							.text(content)
							.style("width", width + "px")
							.style("height", height + "px")
							.style("left", xPos + "px")
							.style("top", yPos + "px")
							.style("transform", that.getTextAreaTransform())
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
							.on("blur", function() {
								that.logger.log("Text area - blur");
								var commentObj = that.getComment(id);
								commentObj.content = this.value;
								that.saveCommentChanges(this);
								that.closeCommentTextArea();
								that.displayComments();
							});

						// Note: Couldn't get focus to work through d3, so used dom instead.
						document.getElementById(that.getId("comment_text_area", id)).focus();

						that.canvasController.clickActionHandler({
							clickType: "DOUBLE_CLICK",
							objectType: "comment",
							id: d.id,
							selectedObjectIds: that.objectModel.getSelectedObjectIds(),
							pipelineId: that.activePipeline.id });
					}
				})
				.on("contextmenu", (d) => {
					this.logger.log("Comment Group - context menu");
					this.openContextMenu("comment", d);
				})
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

			// Comment selection highlighting and sizing outline
			newCommentGroups.append("rect")
				.attr("id", (d) => this.getId("comment_outline", d.id))
				.attr("data-pipeline-id", this.getNonNumericPipelineId())
				.on("mousedown", (d) => {
					this.commentSizing = true;
					this.commentSizingId = d.id;
					// Note - comment resizing and finalization of size is handled by drag functions.
				})
				.on("mouseenter", (d) => {
					this.commentSizingDirection = this.getSizingDirection(d);
					this.displaySizingCursor("comment_outline", d.id, this.commentSizingDirection);
				});

			// Background rectangle for comment
			newCommentGroups.append("rect")
				.attr("id", (d) => this.getId("comment_body", d.id))
				.attr("data-pipeline-id", this.getNonNumericPipelineId())
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

			// Clip path to clip the comment text to the comment rectangle
			newCommentGroups.append("clipPath")
				.attr("id", (d) => that.getId("comment_clip_path", d.id))
				.append("rect")
				.attr("id", (d) => that.getId("comment_clip_rect", d.id))
				.attr("width", (d) => d.width - (2 * that.layout.commentWidthPadding))
				.attr("height", (d) => d.height - (2 * that.layout.commentHeightPadding))
				.attr("x", 0 + that.layout.commentWidthPadding)
				.attr("y", 0 + that.layout.commentHeightPadding);

			// Comment text
			newCommentGroups.append("text")
				.attr("id", (d) => that.getId("comment_text", d.id))
				.attr("class", "d3-comment-text")
				.each(function(d) {
					var textObj = d3.select(this);
					that.displayWordWrappedText(textObj, d.content, d.width - (2 * that.layout.commentWidthPadding));
				})
				.attr("clip-path", (d) => "url(" + that.getId("#comment_clip_path", d.id) + ")")
				.attr("xml:space", "preserve")
				.attr("x", 0 + that.layout.commentWidthPadding)
				.attr("y", 0 + that.layout.commentHeightPadding);

			// Halo
			if (this.layout.connectionType === "halo") {
				newCommentGroups.append("rect")
					.attr("id", (d) => that.getId("comment_halo", d.id))
					.attr("class", "d3-comment-halo")
					.on("mousedown", (d) => {
						this.logger.log("Comment Halo - mouse down");
						d3Event.stopPropagation();
						this.drawingNewLink = true;
						this.drawingNewLinkSrcId = d.id;
						this.drawingNewLinkSrcPortId = null;
						this.drawingNewLinkAction = "comment-node";
						this.drawingNewLinkStartPos = this.getTransformedMousePos();
						this.drawingNewLinkArray = [];
						this.drawNewLink();
					});
			}

			const newAndExistingCommentGrps =
				commentGroupSel.enter().merge(commentGroupSel);

			newAndExistingCommentGrps
				.each((d) => {
					const commentGrp = this.canvasGrp.selectAll(that.getId("#comment_grp", d.id));
					const comment = this.getComment(d.id);

					commentGrp
						.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
						.datum(comment); // Set the __data__ to the updated data

					// Comment selection highlighting and sizing outline
					commentGrp.select(that.getId("#comment_outline", d.id))
						.attr("x", -this.layout.highlightGap)
						.attr("y", -this.layout.highlightGap)
						.attr("height", d.height + (2 * that.layout.highlightGap))
						.attr("width", d.width + (2 * that.layout.highlightGap))
						.attr("data-selected", that.objectModel.isSelected(d.id, that.activePipeline.id) ? "yes" : "no")
						.attr("class", that.layout.cssCommentSelectionHighlight)
						.datum(comment); // Set the __data__ to the updated data

					// Clip path for text
					commentGrp.select(`#comment_clip__path_${d.id}`)
						.datum(comment); // Set the __data__ to the updated data

					// Clip rectangle for text
					commentGrp.select(that.getId("#comment_clip_rect", d.id))
						.attr("height", d.height - (2 * that.layout.commentHeightPadding))
						.attr("width", d.width - (2 * that.layout.commentWidthPadding))
						.datum(comment); // Set the __data__ to the updated data

					// Background rectangle for comment
					commentGrp.select(that.getId("#comment_body", d.id))
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
					commentGrp.select(that.getId("#comment_text", d.id))
						.datum(comment) // Set the __data__ to the updated data
						.attr("beingedited", that.editingCommentId === d.id ? "yes" : "no") // Use the beingedited css style to make text transparent
						.each(function(cd) {
							var textObj = d3.select(this);
							textObj.selectAll("tspan").remove();
							that.displayWordWrappedText(textObj, cd.content, cd.width - (2 * that.layout.commentWidthPadding));
						});

					// Comment halo
					if (that.layout.connectionType === "halo") {
						commentGrp.select(that.getId("#comment_halo", d.id))
							.attr("x", 0 - this.layout.haloCommentGap)
							.attr("y", 0 - this.layout.haloCommentGap)
							.attr("width", d.width + (2 * that.layout.haloCommentGap))
							.attr("height", d.height + (2 * that.layout.haloCommentGap))
							.datum(comment); // Set the __data__ to the updated data
					}
				});

			// Remove any comments that are no longer in the diagram.nodes array.
			commentGroupSel.exit().remove();
		}
		this.logger.logEndTimer("displayComments " + this.getFlags());
	}

	autoSizeTextArea(textArea, datum) {
		this.logger.log("autoSizeTextArea - textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);
		if (this.textAreaHeight < textArea.scrollHeight) {
			this.textAreaHeight = textArea.scrollHeight;
			this.zoomTextAreaCenterY = datum.y_pos + (this.textAreaHeight / 2);
			var comment = this.getComment(datum.id);
			comment.height = this.textAreaHeight;
			this.canvasDiv.select(this.getId("#comment_text_area", datum.id))
				.style("height", this.textAreaHeight + "px")
				.style("transform", this.getTextAreaTransform()); // Since the height has changed the translation needs to be reapplied.
			this.displayComments();
			this.displayLinks();
		}
	}

	savePendingCommentChanges() {
		if (this.editingComment === true &&
				this.editingCommentChangesPending === true) {
			var textAreaSelect = this.canvasDiv.select("textarea");
			if (!textAreaSelect.empty()) {
				this.saveCommentChanges(textAreaSelect.node());
			}
		}
	}

	saveCommentChanges(textArea) {
		if (this.editingComment === true &&
				this.editingCommentChangesPending === true) {
			this.editingCommentChangesPending = false;
			const data = {
				editType: "editComment",
				id: textArea.getAttribute("data-nodeId"),
				content: textArea.value,
				width: this.removePx(textArea.style.width),
				height: this.removePx(textArea.style.height),
				x_pos: this.removePx(textArea.style.left),
				y_pos: this.removePx(textArea.style.top)
			};
			this.canvasController.editActionHandler(data);
		}
	}

	// Returns the transform amount for the text area control that positions the
	// text area based on the current zoom (translate and scale) amount.
	getTextAreaTransform() {
		let x;
		let y;
		let k;

		// TODO - Need to calculate correct transform for text area when opened for comment in sub-flow
		if (this.isDisplayingSubFlowInPlace()) {
			// const dims = this.getSupernodeDimensions();
			const topLevelSVG = this.canvasDiv.selectAll("svg");
			const topLevelTransform = d3.zoomTransform(topLevelSVG.node());
			// const superDatum = this.getParentSupernodeDatum();
			k = this.zoomTransform.k + topLevelTransform.k;
			x += topLevelTransform.x + this.zoomTransform.x - (this.zoomTextAreaCenterX * (1 - k));
			y += topLevelTransform.y + this.zoomTransform.y - (this.zoomTextAreaCenterY * (1 - k));


		} else {
			k = this.zoomTransform.k;
			x = this.zoomTransform.x - (this.zoomTextAreaCenterX * (1 - k));
			y = this.zoomTransform.y - (this.zoomTextAreaCenterY * (1 - k));
		}
		return `translate(${x}px, ${y}px) scale(${k})`;
	}

	// Closes the text area and switched off all flags connected with text editing.
	closeCommentTextArea() {
		this.editingComment = false;
		this.editingCommentId = "";
		this.editingCommentChangesPending = false;
		this.canvasDiv.select("textarea").remove();
	}

	// Displays a sizing cursor at the edge of a comment box based on the
	// direction passed in.
	displaySizingCursor(prefix, id, direction) {
		var cursor = this.getCursorBasedOnDirection(direction);
		this.canvasGrp.selectAll(this.getSelectorForId(prefix, id)).style("cursor", cursor);
	}

	// Returns the comment or node sizing direction (i.e. one of n, s, e, w, nw, ne,
	// sw or se) based on the current mouse position and the position and
	// dimensions of the comment or node outline.
	getSizingDirection(d) {
		var xPart = "";
		var yPart = "";

		const transPos = this.getTransformedMousePos();

		if (transPos.x < d.x_pos + this.layout.cornerResizeArea) {
			xPart = "w";
		} else if (transPos.x > d.x_pos + d.width - this.layout.cornerResizeArea) {
			xPart = "e";
		}
		if (transPos.y < d.y_pos + this.layout.cornerResizeArea) {
			yPart = "n";
		} else if (transPos.y > d.y_pos + d.height - this.layout.cornerResizeArea) {
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
		const nodeObj = this.getNode(this.nodeSizingId);
		this.removeDynamicNodeIcons(nodeObj);
		const minWidth =
			this.layout.supernodeLabelWidth + this.layout.ellipsisWidth +
			this.layout.supernodeIconWidth + (2 * this.layout.supernodeIconPadding);
		const delta = this.resizeObject(nodeObj, this.nodeSizingDirection, minWidth, 80);

		if (delta && (delta.x_pos !== 0 || delta.y_pos !== 0 || delta.width !== 0 || delta.height !== 0)) {
			this.addToNodeSizingArray(nodeObj);
			this.moveSurroundingNodes(nodeObj, delta);
			this.displayNodes();
			this.displayLinks();
			if (this.isDisplayingSubFlow()) {
				this.displayBindingNodesToFitSVG();
			}
			this.superRenderers.forEach((renderer) => renderer.displaySVGToFitSupernode());
		}
	}

	addToNodeSizingArray(nodeObj) {
		this.nodeSizingMovedNodes[nodeObj.id] = {
			id: nodeObj.id,
			x_pos: nodeObj.x_pos,
			y_pos: nodeObj.y_pos,
			width: nodeObj.width,
			height: nodeObj.height
		};
	}

	moveSurroundingNodes(nodeObj, delta) {
		let xDelta;
		let yDelta;
		this.activePipeline.nodes.forEach((node) => {
			if (node.id === nodeObj.id) {
				return; // Ignore the supernode
			}
			xDelta = 0;
			yDelta = 0;

			if (this.nodeSizingDirection.indexOf("n") > -1 &&
			nodeObj.y_pos + nodeObj.height > node.y_pos + node.height && // check node is above supernode bottom border
			this.isNodePositionedWithinSupernodeXBoundary(node, nodeObj)) {
				node.y_pos -= delta.height;
				yDelta = delta.height;
			} else if (this.nodeSizingDirection.indexOf("s") > -1 &&
			node.y_pos > nodeObj.y_pos && // check node is below supernode top right corner
			this.isNodePositionedWithinSupernodeXBoundary(node, nodeObj)) {
				node.y_pos += delta.height;
				yDelta = delta.height;
			}

			if (this.nodeSizingDirection.indexOf("w") > -1 &&
			nodeObj.x_pos + nodeObj.width > node.x_pos + node.width && // check node is left of supernode right border
			this.isNodePositionedWithinSupernodeYBoundary(node, nodeObj)) {
				node.x_pos -= delta.width;
				xDelta = delta.width;
			} else if (this.nodeSizingDirection.indexOf("e") > -1 &&
			nodeObj.x_pos < node.x_pos && // check node is right of supernode left border
			this.isNodePositionedWithinSupernodeYBoundary(node, nodeObj)) {
				node.x_pos += delta.width;
				xDelta = delta.width;
			}

			if (xDelta !== 0 || yDelta !== 0) {
				this.addToNodeSizingArray(node);
			}
		});
	}

	isNodePositionedWithinSupernodeXBoundary(node, supernode) {
		return (node.x_pos >= supernode.x_pos && node.x_pos < supernode.x_pos + supernode.width) || // check node top border is within supernode
			(node.x_pos + node.width <= supernode.x_pos + supernode.width && node.x_pos + node.width >= supernode.x_pos); // check node bottom border is within supernode
	}

	isNodePositionedWithinSupernodeYBoundary(node, supernode) {
		return (node.y_pos >= supernode.y_pos && node.y_pos < supernode.y_pos + supernode.height) || // check node top border is within supernode
			(node.y_pos + node.height <= supernode.y_pos + supernode.height && node.y_pos + node.height >= supernode.y_pos); // check node bottom border is within supernode
	}

	// Sets the size and position of the comment in the canvasInfo.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and links (the link positions may move based
	// on the comment size change).
	resizeComment() {
		const commentObj = this.getComment(this.commentSizingId);
		const delta = this.resizeObject(commentObj, this.commentSizingDirection, 20, 20);
		if (delta && (delta.x_pos > 0 || delta.y_pos || delta.width || delta.height)) {
			this.displayComments();
			this.displayLinks();
		} else {
			this.commentSizingHasChanged = true;
		}
	}

	// Sets the size and position of the object in the canvasInfo
	// array based on the position of the pointer during the resize action.
	resizeObject(canvasObj, direction, minWidth, minHeight) {
		var width = canvasObj.width;
		var height = canvasObj.height;
		var xPos = canvasObj.x_pos;
		var yPos = canvasObj.y_pos;

		if (direction.indexOf("e") > -1) {
			width += d3Event.dx;
		}
		if (direction.indexOf("s") > -1) {
			height += d3Event.dy;
		}
		if (direction.indexOf("n") > -1) {
			yPos += d3Event.dy;
			height -= d3Event.dy;
		}
		if (direction.indexOf("w") > -1) {
			xPos += d3Event.dx;
			width -= d3Event.dx;
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
		if (Object.keys(this.nodeSizingMovedNodes).length > 0) {
			const data = {
				editType: "resizeObjects",
				objectsInfo: this.nodeSizingMovedNodes,
				pipelineId: this.pipelineId
			};
			this.canvasController.editActionHandler(data);
		}
		this.nodeSizingMovedNodes = [];
		this.nodeSizing = false;
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing() {
		if (this.commentSizingHasChanged) { // No need to issue edit command if nothing chnaged
			var commentObj = this.getComment(this.commentSizingId);
			const data = {
				editType: "editComment",
				id: commentObj.id,
				content: commentObj.content,
				width: commentObj.width,
				height: commentObj.height,
				x_pos: commentObj.x_pos,
				y_pos: commentObj.y_pos,
				pipelineId: this.pipelineId
			};
			this.canvasController.editActionHandler(data);
		}
		this.commentSizing = false;
		this.commentSizingHasChanged = false;
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
			.attr("x", 0 + this.layout.commentWidthPadding)
			.attr("y", 0 + this.layout.commentHeightPadding - 2) // Move text up a bit to match position in textarea
			.attr("dy", dy + "em")
			.attr("xml:space", "preserve") // Preserves the white
			.text(text);
	}

	// Removes the px from the end of the input string, if it is there, and
	// returns an integer of the string.
	removePx(str) {
		let s = str;
		if (s.endsWith("px")) {
			s = s.slice(0, -2);
		}
		return parseInt(s, 10);
	}

	displayLinks() {
		this.logger.logStartTimer("displayLinks " + this.getFlags());

		// Do not return from here if there are no links because there may
		// be still links on display that need to be deleted.

		var startTimeDrawingLines = Date.now();
		const that = this;
		const linkSelector = this.getSelectorForClass("link-group");

		if (this.selecting || this.regionSelect || this.canvasController.isTipShowing()) {
			// no lines update needed when selecting objects/region
			this.logger.logEndTimer("displayLinks " + this.getFlags());
			return;
		} else if (this.dragging || this.nodeSizing || this.commentSizing || this.movingBindingNodes) {
			// while dragging etc. only remove lines that are affected by moving nodes/comments
			let affectLinks;
			if (this.nodeSizing) {
				affectLinks = this.getConnectedLinksFromNodeSizingArray(this.nodeSizingMovedNodes);
			} else {
				let affectedNodesAndComments = this.getSelectedNodesAndComments();
				// For sub-flow rendering, we need to add the supernode binding nodes
				// because their links will also need to be refreshed when dragging is ocurring.
				if (this.isDisplayingSubFlow()) {
					affectedNodesAndComments = affectedNodesAndComments.concat(this.getSupernodeBindingNodes());
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
		lineArray = this.addConnectionPaths(lineArray);

		var afterLineArray = Date.now();

		var linkGroup = this.canvasGrp.selectAll(linkSelector)
			.data(lineArray, function(line) { return line.id; })
			.enter()
			.append("g")
			.attr("id", (d) => this.getId("link_grp", d.id))
			.attr("data-pipeline-id", this.getNonNumericPipelineId())
			.attr("class", "link-group")
			.attr("src", (d) => d.src)
			.attr("trg", (d) => d.trg)
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
				if (that.canShowTip(TIP_TYPE_LINK)) {
					that.canvasController.showTip({
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
				this.canvasController.hideTip();
			});

		// Link selection area
		linkGroup.append("path")
			.attr("d", (d) => d.path)
			.attr("class", "d3-link-selection-area");

		// Link line
		linkGroup.append("path")
			.attr("d", (d) => d.path)
			.attr("class", (d) => {
				var classStr;

				if (d.type === "associationLink") {
					classStr = "d3-selectable-link " + this.getAssociationLinkClass(d);
				} else if (d.type === "commentLink") {
					classStr = "d3-selectable-link " + this.getCommentLinkClass(d);
				} else {
					classStr = "d3-selectable-link " + this.getDataLinkClass(d);
				}
				return classStr;
			});

		// Arrow head
		linkGroup.filter((d) => (this.layout.connectionType === "halo" && d.type === "nodeLink") ||
														(d.type === "commentLink" && this.layout.commentLinkArrowHead))
			.append("path")
			.attr("d", (d) => this.getArrowHead(d))
			.attr("class", (d) => {
				var classStr;
				if (d.type === "commentLink") {
					classStr = "d3-selectable-link " + this.getCommentLinkClass(d);
				} else {
					classStr = "d3-selectable-link " + this.getDataLinkClass(d);
				}
				return classStr;
			})
			.style("stroke-dasharray", "0"); // Ensure arrow head is always solid line style

		// Set connection status of output ports and input ports plus arrow.
		if (this.layout.connectionType === "ports") {
			const portOutSelector = this.getSelectorForClass(this.layout.cssNodePortOutput);
			const portInSelector = this.getSelectorForClass(this.layout.cssNodePortInput);
			const portInArrSelector = this.getSelectorForClass(this.layout.cssNodePortInputArrow);
			this.canvasGrp.selectAll(portOutSelector).attr("connected", "no");
			this.canvasGrp.selectAll(portInSelector).attr("connected", "no");
			this.canvasGrp.selectAll(portInArrSelector).attr("connected", "no");
			lineArray.forEach((line) => {
				if (line.type === "nodeLink") {
					this.setTrgPortStatus(line.trg.id, line.trgPortId, "yes");
					this.setSrcPortStatus(line.src.id, line.srcPortId, "yes");
				}
			});
		}

		this.setDisplayOrder();

		var endTimeDrawingLines = Date.now();

		if (showLinksTime) {
			this.logger.log("displayLinks R " + (timeAfterDelete - startTimeDrawingLines) +
			" B " + (afterLineArray - timeAfterDelete) + " D " + (endTimeDrawingLines - afterLineArray));
		}
		this.logger.logEndTimer("displayLinks " + this.getFlags());
	}

	// Adds the binding nodes, which map to the containing supernode's ports, to
	// the set of affected nodes and comments.
	getSupernodeBindingNodes() {
		const snBindingNodes = [];
		this.activePipeline.nodes.forEach((node) => {
			if (node.isSupernodeInputBinding || node.isSupernodeOutputBinding) {
				snBindingNodes.push(node);
			}
		});

		return snBindingNodes;
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

	getAssociationLinkClass(d) {
		// If the data has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-object-link") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
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
		// If the comment has a classname that isn't the default use it!
		if (d.class_name && d.class_name !== "canvas-node" && d.class_name !== "d3-node-body") {
			return d.class_name;
		}
		// If the class name provided IS the default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		return this.layout.cssNodeBody;
	}

	// Pushes the links to be below nodes and then pushes comments to be below
	// nodes and links. This lets the user put a large comment underneath a set
	// of nodes and links for annotation purposes.
	setDisplayOrder() {
		this.canvasGrp.selectAll(".link-group").lower(); // Moves link lines below other SVG elements

		// We push comments to the back in the reverse order they were added to the
		// comments array. This is to ensure that pasted comments get displayed on
		// top of previously existing comments.
		const comments = this.activePipeline.comments;

		for (var idx = comments.length - 1; idx > -1; idx--) {
			this.canvasGrp.selectAll(this.getId("#comment_grp", comments[idx].id)).lower();
		}
	}

	buildLineArray() {
		var lineArray = [];

		this.activePipeline.links.forEach((link) => {
			var srcObj;
			var trgNode = this.getNode(link.trgNodeId);

			if (link.type === "commentLink") {
				srcObj = this.getComment(link.srcNodeId);
			} else {
				srcObj = this.getNode(link.srcNodeId);
			}

			if (srcObj === null) {
				this.error("Error drawing a link. A link was specified for source " + link.srcNodeId + " in the Canvas data that does not have a valid source node/comment.");
			}

			if (trgNode === null) {
				this.error("Error drawing a link. A link was specified for target " + link.trgNodeId + " in the Canvas data that does not have a valid target node.");
			}

			// Only proceed if we have a source and a target node/comment.
			if (srcObj && trgNode) {
				if (!this.isSourceOverlappingTarget(srcObj, trgNode)) {
					var coords = {};
					var srcPortId;
					var trgPortId;

					if (link.type === "nodeLink") {
						if (this.layout.connectionType === "halo") {
							coords = this.getNodeLinkCoordsForHalo(srcObj, trgNode);
						} else {
							srcPortId = this.getSourcePortId(link, srcObj);
							trgPortId = this.getTargetPortId(link, trgNode);
							coords = this.getNodeLinkCoordsForPorts(srcObj, srcPortId, trgNode, trgPortId);
						}
					} else {
						coords = this.getNonDataLinkCoords(srcObj, trgNode);
					}

					lineArray.push({ "id": link.id,
						"x1": coords.x1, "y1": coords.y1, "x2": coords.x2, "y2": coords.y2,
						"class_name": link.class_name,
						"type": link.type,
						"src": srcObj,
						"srcPortId": srcPortId,
						"trg": trgNode,
						"trgPortId": trgPortId });
				}
			}
		});

		return lineArray;
	}

	// Returns a source port Id if one exists in the link, otherwise defaults
	// to the first available port on the source node.
	getSourcePortId(link, srcNode) {
		var srcPortId;
		if (link.srcNodePortId) {
			srcPortId = link.srcNodePortId;
		} else if (srcNode.output_ports && srcNode.output_ports.length > 0) {
			srcPortId = srcNode.output_ports[0].id;
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
		} else if (trgNode.input_ports && trgNode.input_ports.length > 0) {
			trgPortId = trgNode.input_ports[0].id;
		} else {
			trgPortId = null;
		}
		return trgPortId;
	}

	// Calculates the connection path to draw connections for the current config
	// settings and adds them to the line array.
	addConnectionPaths(lineArray) {
		lineArray.forEach((line, i) => {
			lineArray[i].path = this.getConnectorPath(line);
		});
		return lineArray;
	}

	isSourceOverlappingTarget(srcNode, trgNode) {
		if (this.layout.displayLinkOnOverlap === false) {
			if (((srcNode.x_pos + srcNode.width + this.layout.highlightGap >= trgNode.x_pos - this.layout.highlightGap &&
						trgNode.x_pos + trgNode.width + this.layout.highlightGap >= srcNode.x_pos - this.layout.highlightGap) &&
						(srcNode.y_pos + srcNode.height + this.layout.highlightGap >= trgNode.y_pos - this.layout.highlightGap &&
							trgNode.y_pos + trgNode.height + this.layout.highlightGap >= srcNode.y_pos - this.layout.highlightGap))) {
				return true;
			}
		}

		return false;
	}

	getNodeLinkCoordsForPorts(srcNode, srcPortId, trgNode, trgPortId) {
		let srcY = this.layout.portPosY;
		let trgY = this.layout.portPosY;

		if (srcNode.output_ports && srcNode.output_ports.length > 0) {
			const port = srcNode.output_ports.find((srcPort) => srcPort.id === srcPortId);
			srcY = port ? port.cy : srcY;
		}

		if (trgNode.input_ports && trgNode.input_ports.length > 0) {
			const port = trgNode.input_ports.find((trgPort) => trgPort.id === trgPortId);
			trgY = port ? port.cy : trgY;
		}

		return {
			x1: srcNode.x_pos + srcNode.width,
			y1: srcNode.y_pos + srcY,
			x2: trgNode.x_pos,
			y2: trgNode.y_pos + trgY };
	}

	getNodeLinkCoordsForHalo(srcNode, trgNode) {
		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.layout.linkGap,
			srcNode.y_pos - this.layout.linkGap,
			srcNode.width + (this.layout.linkGap * 2),
			srcNode.height + (this.layout.linkGap * 2),
			this.layout.imagePosX + (this.layout.imageWidth / 2) + this.layout.linkGap,
			this.layout.imagePosY + (this.layout.imageHeight / 2) + this.layout.linkGap,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.layout.linkGap,
			trgNode.y_pos - this.layout.linkGap,
			trgNode.width + (this.layout.linkGap * 2),
			trgNode.height + (this.layout.linkGap * 2),
			this.layout.imagePosX + (this.layout.imageWidth / 2) + this.layout.linkGap,
			this.layout.imagePosY + (this.layout.imageHeight / 2) + this.layout.linkGap,
			srcNode.x_pos + (srcNode.width / 2),
			srcNode.y_pos + (srcNode.height / 2));

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
	}

	getNonDataLinkCoords(srcNode, trgNode) {
		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.layout.linkGap,
			srcNode.y_pos - this.layout.linkGap,
			srcNode.width + (this.layout.linkGap * 2),
			srcNode.height + (this.layout.linkGap * 2),
			(srcNode.width / 2) + this.layout.linkGap,
			(srcNode.height / 2) + this.layout.linkGap,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		var centerX;
		var centerY;

		if (this.layout.drawLinkLineTo === "image_center") {
			centerX = this.layout.imagePosX + (this.layout.imageWidth / 2) + this.layout.linkGap;
			centerY = this.layout.imagePosY + (this.layout.imageHeight / 2) + this.layout.linkGap;
		} else {
			centerX = (trgNode.width / 2) + this.layout.linkGap;
			centerY = trgNode.height / 2;
		}

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.layout.linkGap,
			trgNode.y_pos - this.layout.linkGap,
			trgNode.width + (this.layout.linkGap * 2),
			trgNode.height + (this.layout.linkGap * 2),
			centerX,
			centerY,
			srcNode.x_pos + (srcNode.width / 2),
			srcNode.y_pos + (srcNode.height / 2));

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
	}

	getOuterCoord(xPos, yPos, width, height, innerCenterX, innerCenterY, outerCenterX, outerCenterY) {
		const topLeft = { x: xPos, y: yPos };
		const topRight = { x: xPos + width, y: yPos };
		const botLeft = { x: xPos, y: yPos + height };
		const botRight = { x: xPos + width, y: yPos + height };
		const center = { x: innerCenterX + xPos, y: innerCenterY + yPos };

		var startPointX;
		var startPointY;

		// Outer point is to the right of center
		if (outerCenterX > center.x) {
			const topRightRatio = (center.y - topRight.y) / (center.x - topRight.x);
			const botRightRatio = (center.y - botRight.y) / (center.x - botRight.x);
			const ratioRight = (center.y - outerCenterY) / (center.x - outerCenterX);

			// North
			if (ratioRight < topRightRatio) {
				startPointX = center.x - (innerCenterY / ratioRight);
				startPointY = yPos;
			// South
			} else if (ratioRight > botRightRatio) {
				startPointX = center.x + ((height - innerCenterY) / ratioRight);
				startPointY = yPos + height;
			// East
			} else {
				startPointX = xPos + width;
				startPointY = center.y + (innerCenterX * ratioRight);
			}
		// Outer point is to the left of center
		} else {
			const topLeftRatio = (center.y - topLeft.y) / (center.x - topLeft.x);
			const botLeftRatio = (center.y - botLeft.y) / (center.x - botLeft.x);
			const ratioLeft = (center.y - outerCenterY) / (center.x - outerCenterX);

			// North
			if (ratioLeft > topLeftRatio) {
				startPointX = center.x - (innerCenterY / ratioLeft);
				startPointY = yPos;
			// South
			} else if (ratioLeft < botLeftRatio) {
				startPointX = center.x + ((height - innerCenterY) / ratioLeft);
				startPointY = yPos + height;
			// West
			} else {
				startPointX = xPos;
				startPointY = center.y - (innerCenterX * ratioLeft);
			}
		}

		return { x: startPointX, y: startPointY };
	}

	// Returns arrow shape for Ports presentation.
	getArrowShapePath(cy, d, k) {
		let x1 = -2;
		let x2 = 2;
		let y1 = cy - 3;
		let y2 = cy + 3;
		// Offset the arrow for super binding input nodes to the left so they are not
		// obstructed by the edge of the containing SVG area. Also, zoom them by the
		// zoom amount so they stay a standard size when zooming.
		if (this.isSuperBindingNode(d)) {
			x1 = -5 / k;
			x2 = -1 / k;
			const ygap = 3 / k;
			y1 = cy - ygap;
			y2 = cy + ygap;
		}
		let path = "M " + x1 + " " + y1;
		path += " L  " + x2 + " " + cy;
		path += " L " + x1 + " " + y2;
		return path;
	}

	// Returns arrow head path for Halo presentation.
	getArrowHead(d) {
		var angle = Math.atan2((d.y2 - d.y1), (d.x2 - d.x1));

		var clockwiseAngle = angle - 0.3;
		var x3 = d.x2 - Math.cos(clockwiseAngle) * 10;
		var y3 = d.y2 - Math.sin(clockwiseAngle) * 10;

		var antiClockwiseAngle = angle + 0.3;
		var x4 = d.x2 - Math.cos(antiClockwiseAngle) * 10;
		var y4 = d.y2 - Math.sin(antiClockwiseAngle) * 10;

		return `M ${d.x2} ${d.y2} L ${x3} ${y3} M ${d.x2} ${d.y2} L ${x4} ${y4}`;
	}

	getConnectorPath(data) {
		if (this.layout.connectionType === "ports" &&
				data.type === "nodeLink") {

			if (this.layout.linkType === "Curve") {
				return this.getCurvePath(data);

			} else	if (this.layout.linkType === "Elbow") {
				return this.getElbowPath(data);
			}

			return this.getLighteningPath(data);
		}

		return this.getStraightPath(data);
	}

	// Returns the path string for the object passed in which describes a
	// simple straight connector line from source to target. This is used for
	// connectors from comments to data nodes.
	getStraightPath(data) {
		return "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;
	}

	// Returns the path string for the object passed in which describes a
	// simple straight connector line and a jaunty zig zag line when the
	// source is further right than the target.
	getLighteningPath(data) {
		let path = "";
		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;

		if (xDiff > 20 ||
				Math.abs(yDiff) < data.height) {
			path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;

		} else {
			const corner1X = data.x1 + this.layout.minInitialLine;
			const corner1Y = data.y1;
			const corner2X = data.x2 - this.layout.minInitialLine;
			const corner2Y = data.y2;

			const centerLineY = corner2Y - (corner2Y - corner1Y) / 2;

			path = "M " + data.x1 + " " + data.y1;
			path += " " + corner1X + " " + centerLineY;
			path += " " + corner2X + " " + centerLineY;
			path += " " + data.x2 + " " + data.y2;
		}

		return path;
	}

	// Returns the path string for the object passed in which describes a
	// cubic bezier curved connector line.
	// getCurvePath(data) {
	// 	let corner1X = data.x1 + (data.x2 - data.x1) / 2;
	// 	const corner1Y = data.y1;
	// 	let corner2X = corner1X;
	// 	const corner2Y = data.y2;
	//
	// 	const x = data.x2 - data.x1 - 50;
	//
	// 	if (x < 0) {
	// 		corner1X = data.x1 - (x * 2);
	// 		corner2X = data.x2 + (x * 2);
	// 	}
	//
	// 	let path = "M " + data.x1 + " " + data.y1;
	// 	path += "C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
	// 	return path;
	// }

	// Returns the path string for the object passed in which describes a
	// quadratic bezier curved connector line.
	getCurvePath(data) {
		const xDiff = data.x2 - data.x1;

		let path = "M " + data.x1 + " " + data.y1;

		if (xDiff >= 50) {
			const corner1X = data.x1 + (data.x2 - data.x1) / 2;
			const corner1Y = data.y1;
			const corner2X = corner1X;
			const corner2Y = data.y2;

			path += "C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2 + " ";

		} else {
			const yDiff = data.y2 - data.y1;
			const corner1X = data.x1 + this.layout.minInitialLine;
			const corner1Y = data.y1;

			const corner2X = corner1X;
			const corner2Y = data.y1 + (yDiff / 4);

			const corner4X = data.x1 + (xDiff / 2);
			const corner4Y = data.y1 + (yDiff / 2);

			const corner6X = data.x2 - this.layout.minInitialLine;
			const corner6Y = data.y2 - (yDiff / 4);

			path += " Q " + corner1X + " " + corner1Y + " " +
											corner2X + " " + corner2Y + " " +
							" T " + corner4X + " " + corner4Y + " " +
							" T " + corner6X + " " + corner6Y + " " +
							" T " + data.x2 + " " + data.y2;
		}

		return path;
	}

	// Returns the path string for the object passed in which describes a
	// curved connector line using elbows and straight lines.
	getElbowPath(data) {

		const corner1X = data.x1 + this.layout.minInitialLine;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;
		let elbowYOffset = yDiff / 2;

		if (yDiff > (2 * this.layout.elbowSize)) {
			elbowYOffset = this.layout.elbowSize;
		}
		else if (yDiff < -(2 * this.layout.elbowSize)) {
			elbowYOffset = -this.layout.elbowSize;
		}

		// This is a special case where the source and target handles are very
		// close together.
		if (xDiff < (2 * this.layout.minInitialLine) &&
				(yDiff < (4 * this.layout.elbowSize) &&
					yDiff > -(4 * this.layout.elbowSize))) {
			elbowYOffset = yDiff / 4;
		}

		let elbowXOffset = this.layout.elbowSize;
		let extraSegments = false;	// Indicates need for extra elbows and lines

		if (xDiff < (this.layout.minInitialLine + this.layout.elbowSize)) {
			extraSegments = true;
			corner2X = data.x2 - this.layout.minInitialLine;
			elbowXOffset = this.layout.elbowSize;
		}
		else if (xDiff < (2 * this.layout.minInitialLine)) {
			extraSegments = true;
			corner2X = data.x2 - this.layout.minInitialLine;
			elbowXOffset = -((xDiff - (2 * this.layout.minInitialLine)) / 2);
		}

		let path = "M " + data.x1 + " " + data.y1;

		path += "L " + (corner1X - this.layout.elbowSize) + " " + corner1Y;
		path += "Q " + corner1X + " " + corner1Y + " "	+ corner1X	+ " " + (corner1Y + elbowYOffset);

		if (extraSegments === false) {
			path += "L " + corner2X + " " + (corner2Y - elbowYOffset);

		} else {
			const centerLineY = corner2Y - (corner2Y - corner1Y) / 2;

			path += "L " + corner1X + " " + (centerLineY - elbowYOffset);
			path += "Q " + corner1X + " " + centerLineY + " "	+ (corner1X - elbowXOffset) + " " + centerLineY;
			path += "L " + (corner2X + elbowXOffset) + " " + centerLineY;
			path += "Q " + corner2X + " " + centerLineY + " "	+ corner2X	+ " " + (centerLineY + elbowYOffset);
			path += "L " + corner2X + " " + (corner2Y - elbowYOffset);
		}

		path += "Q " + corner2X + " " + corner2Y + " " + (corner2X + this.layout.elbowSize) + " " + corner2Y;
		path += "L " + data.x2 + " " + data.y2;

		return path;
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

	canShowTip(tipType) {
		return this.canvasController.isTipEnabled(tipType) &&
			!this.selecting && !this.regionSelect && !this.dragging &&
			!this.commentSizing && !this.nodeSizing && !this.drawingNewLink;
	}

	// Return the x,y coordinates of the svg group relative to the window's viewport
	// This is used when a new comment is created from the toolbar to make sure the
	// new comment always appears in the view port.
	getSvgViewportOffset() {
		let xPos = this.layout.addCommentOffset;
		let yPos = this.layout.addCommentOffset;

		if (this.zoomTransform) {
			xPos = this.zoomTransform.x / this.zoomTransform.k;
			yPos = this.zoomTransform.y / this.zoomTransform.k;

			// The window's viewport is in the opposite direction of zoomTransform
			xPos = -xPos + this.layout.addCommentOffset;
			yPos = -yPos + this.layout.addCommentOffset;
		}

		return {
			x_pos: xPos,
			y_pos: yPos
		};
	}

	// Returns a string that explains which flags are set to true.
	getFlags() {
		let str = "Flags:";
		if (this.canvasController.isTipShowing()) {
			str += " tipShowing = true";
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


// Returns true if either the Command Key (Mac) or Control key (Windows)
// is pressed. This means the Control key on the Mac also works for key
// augmentation. Also since metaKey is true when the Windows key on Windows
// is pressed that will also act as an augmentation key.
function isCmndCtrlPressed() {
	return d3Event.metaKey || d3Event.ctrlKey;
}

function stopPropagationAndPreventDefault() {
	d3Event.stopPropagation();
	d3Event.preventDefault();
}
