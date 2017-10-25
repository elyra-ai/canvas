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
/* eslint no-console: "off" */

const d3 = require("d3");
import ObjectModel from "./object-model/object-model.js";
import _ from "underscore";
import nodeMenuStandardIcon from "../assets/images/canvas_node_icons/node-menu_standard.svg";
import nodeMenuHoverIcon from "../assets/images/canvas_node_icons/node-menu_hover.svg";

const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const A_KEY = 65;
const Z_KEY = 90;
// TODO - Implement nudge behavior for moving nodes and comments
// const LEFT_ARROW_KEY = 37;
// const UP_ARROW_KEY = 38;
// const RIGHT_ARROW_KEY = 39;
// const DOWN_ARROW_KEY = 40;

const showTime = false;

export default class CanvasD3Layout {

	constructor(canvasJSON, canvasSelector, canvasWidth, canvasHeight,
		editActionHandler, contextMenuHandler, clickActionHandler,
		decorationActionHandler, config) {

		this.canvasSelector = canvasSelector;
		this.svg_canvas_width = canvasWidth;
		this.svg_canvas_height = canvasHeight;
		this.editActionHandler = editActionHandler;
		this.contextMenuHandler = contextMenuHandler;
		this.clickActionHandler = clickActionHandler;
		this.decorationActionHandler = decorationActionHandler;

		// Customization options
		this.connectionType = config.enableConnectionType;
		this.nodeFormatType = config.enableNodeFormat;
		this.linkType = config.enableLinkType;

		// Initialize dimension and layout variables
		this.initializeDimensions();

		// Initialize zoom variables
		this.initializeZoomVariables();

		// Dimensions for extent of canvas scaling
		this.minScaleExtent = 0.2;
		this.maxScaleExtent = 2;

		// Allows us to track the sizing behavior of comments
		this.commentSizing = false;
		this.commentSizingId = 0;
		this.commentSizingDirection = "";

		// Allows us to record the drag behavior or nodes and comments.
		this.dragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;

		// When just changing selection, no need to re-render whole canvas
		this.selecting = false;

		// Used to monitor the region selection rectangle.
		this.regionSelect = false;
		this.region = { startX: 0, startY: 0, width: 0, height: 0 };

		// I was not able to figure out how to use the zoom filter method to
		// allow mousedown and mousemove messages to go through to the canvas to
		// do region selection. Therefore I had to implement region selection in
		// the zoom methods. This has the side effect that, when a region is
		// selected, d3.event.transform.x and d3.event.transform.y are incremented
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

		// Make a copy of canvasJSON because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasJSON in the ObjectModel until we're done.
		this.canvasJSON = this.cloneCanvasJSON(canvasJSON);

		this.createCanvas();
		this.displayCanvas();
	}

	// Initializes the dimensions for nodes, comments layout etc.
	initializeDimensions() {
		// Specify and calculate some sizes of components of a node

		if (this.connectionType === "Halo") {
			this.nodeBodyClass = "d3-node-body-outline";
			this.selectionHighlightClass = "d3-obj-selection-highlight";
			this.dataLinkClass = "canvas-data-link";
			this.labelClass = "d3-node-label";
			this.labelErrorClass = "";
			this.commentLinkClass = "canvas-comment-link";
			this.nodePortOutputClass = "";
			this.nodePortInputClass = "";
			this.nodePortInputArrowClass = "";
			this.newConnectionLineClass = "";
			this.newConnectionLineStartClass = "";
			this.newConnectionLineBlobClass = "";

			this.nodeWidth = 60;
			this.nodeHeight = 66;

			this.imageWidth = 48;
			this.imageHeight = 48;

			this.imagePosX = 6;
			this.imagePosY = 0;

			// Sets the justification of label and icon within the node height. This
			// overrides any labelPosY value provided. Possible value are "center" or
			// "none". Specify "none" to use the labelPosY value.
			this.labelAndIconVerticalJustification = "none";

			// Horizontal Justification of the lable based on label position X and Y.
			this.labelHorizontalJustification = "center";

			// Specifies whether a label that has been truncated should be displayed
			// in full when the pointer is hovered over the truncated label.
			this.displayFullLabelOnHover = true;

			this.labelWidth = 52;
			this.labelHeight = 12;

			// The underhang of letters below the baseline for the label font used
			this.labelDescent = 3;

			this.labelPosX = 4;
			this.labelPosY = 53;

			this.decoratorHeight = 12;
			this.decoratorWidth = 12;

			this.topDecoratorY = 0;
			this.bottomDecoratorY = 36;

			this.leftDecoratorX = 6;
			this.rightDecoratorX = 42;

			// Draw node as a simple rectangle
			this.nodeShape = "rectangle";

			// The gap between a node or comment and its selection highlight rectangle
			this.highLightGap = 4;

			// Halo sizes
			this.haloCommentGap = 11; // Gap between comment rectangle and its halo
			this.haloNodeGap = 5; // Gap between node image and its halo

			this.haloCenterX = this.imagePosX + (this.imageWidth / 2);
			this.haloCenterY = this.imagePosY + (this.imageHeight / 2);
			this.haloRadius = (this.imageWidth / 2) + this.haloNodeGap;

			// Whether to display a link line when linked node/comments overlap
			this.displayLinkOnOverlap = false;

			// What point to draw the link line towards. Possible values are image_center or node_center.
			// This is used for comment links going towards nodes.
			this.drawLinkLineTo = "image_center";

			// Error indicator dimensions
			this.errorCenterX = 54;
			this.errorCenterY = 0;
			this.errorRadius = 7;

		} else { // Ports connection type

			if (this.nodeFormatType === "Horizontal") {
				this.nodeBodyClass = "d3-node-body-outline-austin";
				this.selectionHighlightClass = "d3-obj-selection-highlight-austin";
				this.dataLinkClass = "canvas-data-link-austin";
				this.labelClass = "d3-node-label-austin";
				this.labelErrorClass = "d3-node-error-label";
				this.commentLinkClass = "canvas-comment-link";
				this.nodePortOutputClass = "d3-node-port-output-austin";
				this.nodePortInputClass = "d3-node-port-input-austin";
				this.nodePortInputArrowClass = "d3-node-port-input-arrow-austin";
				this.newConnectionLineClass = "d3-new-connection-line-austin";
				this.newConnectionLineStartClass = "d3-new-connection-start-austin";
				this.newConnectionLineBlobClass = "d3-new-connection-blob-austin";

				this.nodeWidth = 160;
				this.nodeHeight = 40;

				this.imageWidth = 26;
				this.imageHeight = 26;

				this.imagePosX = 6;
				this.imagePosY = 7;

				// Sets the justification of label and icon within the node height. This
				// overrides any labelPosY value provided. Possible value are "center" or
				// "none". Specify "none" to use the labelPosY value.
				this.labelAndIconVerticalJustification = "center";

				// Horizontal Justification of the lable based on label position X and Y.
				this.labelHorizontalJustification = "left";

				// Specifies whether a label that has been truncated should be displayed
				// in full when the pointer is hovered over the truncated label.
				this.displayFullLabelOnHover = false;

				this.labelWidth = 104;
				this.labelHeight = 12;

				// The underhang of letters below the baseline for the label font used
				this.labelDescent = 3;

				this.labelPosX = 38;
				this.labelPosY = 14;

				this.decoratorHeight = 12;
				this.decoratorWidth = 12;

				this.topDecoratorY = 0;
				this.bottomDecoratorY = 28;

				this.leftDecoratorX = 2;
				this.rightDecoratorX = 144;

				// Draw node as a rectangle with port arcs around the ports
				this.nodeShape = "port-arcs";

				// Radius of the port circle
				this.portRadius = 3;

				// Radius of an imaginary circle around the port. This controls the
				// spacing of ports and the size of port arcs when nodeShape is set to
				// port-arcs.
				this.portArcRadius = 6;

				// Spacing between the port arcs around the ports.
				this.portArcSpacing = 3;

				// Default position of a single port - for vertical node format this
				// is half way down the image rather than the center of the node.
				this.portPosY = 20;

				// Comment port (circle) radius
				this.commentPortRadius = 5;

				// The gap between a node or comment and its selection highlight outline
				this.highLightGap = 2;

				// Whether to display a link line when linked node/comments overlap
				this.displayLinkOnOverlap = true;

				// What point to draw the link line towards. Possible values are image_center or node_center.
				// This is used for comment links going towards nodes.
				this.drawLinkLineTo = "node_center";

				// Display of vertical ellipsis to show context menu
				this.ellipsisWidth = 4;
				this.ellipsisHeight = 16;
				this.ellipsisPosX = 148;
				this.ellipsisPosY = 12;

				// Error indicator dimensions
				this.errorCenterX = 30;
				this.errorCenterY = 10;
				this.errorRadius = 5;

			} else { // Vertical
				this.nodeBodyClass = "d3-node-body-outline";
				this.selectionHighlightClass = "d3-obj-selection-highlight";
				this.dataLinkClass = "canvas-data-link";
				this.labelClass = "d3-node-label";
				this.labelErrorClass = "d3-node-error-label";
				this.commentLinkClass = "canvas-comment-link";
				this.nodePortOutputClass = "d3-node-port-output";
				this.nodePortInputClass = "d3-node-port-input";
				this.nodePortInputArrowClass = "d3-node-port-input-arrow";
				this.newConnectionLineClass = "d3-new-connection-line";
				this.newConnectionLineStartClass = "d3-new-connection-start";
				this.newConnectionLineBlobClass = "d3-new-connection-blob";

				this.nodeWidth = 70;
				this.nodeHeight = 75;

				this.imageWidth = 48;
				this.imageHeight = 48;

				this.imagePosX = 11;
				this.imagePosY = 5;

				// Sets the justification of label and icon within the node height. This
				// overrides any labelPosY value provided. Possible value are "center" or
				// "none". Specify "none" to use the labelPosY value.
				this.labelAndIconVerticalJustification = "center";

				// Horizontal Justification of the lable based on label position X and Y.
				this.labelHorizontalJustification = "center";

				// Specifies whether a label that has been truncated should be displayed
				// in full when the pointer is hovered over the truncated label.
				this.displayFullLabelOnHover = true;

				this.labelWidth = 64;
				this.labelHeight = 12;

				// The underhang of letters below the baseline for the label font used
				this.labelDescent = 3;

				this.labelPosX = 3;
				this.labelPosY = 57;

				this.decoratorHeight = 12;
				this.decoratorWidth = 12;

				this.topDecoratorY = 5;
				this.bottomDecoratorY = 41;
				this.leftDecoratorX = 10;
				this.rightDecoratorX = 46;

				// Draw node as a simple rectangle
				this.nodeShape = "rectangle";

				// Radius of the port circle
				this.portRadius = 6;

				// Radius of an imaginary circle around the port. This controls the
				// spacing of ports and the size of port arcs when nodeShape is set to
				// port-arcs.
				this.portArcRadius = 10; // Defines an imaginary circle around the circle port

				// Spacing between the port arcs around the ports.
				this.portArcSpacing = 0;

				// Default position of a single port - for vertical node format this
				// is half way down the image rather than the center of the node.
				this.portPosY = 29;

				// Comment port (circle) radius
				this.commentPortRadius = 5;

				// The gap between a node or comment and its selection highlight rectangle
				this.highLightGap = 4;

				// Whether to display a link line when linked node/comments overlap
				this.displayLinkOnOverlap = true;

				// What point to draw the link line towards. Possible values are image_center or node_center.
				// This is used for comment links going towards nodes.
				this.drawLinkLineTo = "node_center";

				// Display of vertical ellipsis to show context menu
				this.ellipsisWidth = 5;
				this.ellipsisHeight = 15;
				this.ellipsisPosX = 56;
				this.ellipsisPosY = 7;

				// Error indicator dimensions
				this.errorCenterX = 68;
				this.errorCenterY = 0;
				this.errorRadius = 7;
			}
		}

		// The gap between node or comment and the link line.
		this.linkGap = 7;

		// When sizing a comment this decides the size of the corner area for
		// diagonal sizing.
		this.cornerResizeArea = 10;

		// The gap between the edge of the comment rectangle and the comment text.
		this.commentWidthPadding = 3;

		// Initialize values for drawing connectors. minInitialLine is the
		// size of the vertical line protruding from the source or target handles
		// when such a line is required for drawing connectors.
		this.elbowSize = 10;
		this.minInitialLine = 30;
	}

	initializeZoomVariables() {
		// Allows us to record the overal zoom amounts.
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);

		// Allows us to record the start point of the current zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0 };

		// Center position of text area used for editing comments. These are used
		// when zooming a text area.
		this.zoomTextAreaCenterX = 0;
		this.zoomTextAreaCenterY = 0;
	}

	setCanvasInfo(canvasJSON, config) {
		this.consoleLog("Set Canvas. Id = " + canvasJSON.id);
		var startTime = Date.now();
		if (canvasJSON.id !== this.canvasJSON.id ||
				canvasJSON.sub_id !== this.canvasJSON.sub_id ||
				this.connectionType !== config.enableConnectionType ||
				this.nodeFormatType !== config.enableNodeFormatType ||
				this.linkType !== config.enableLinkType) {
			this.canvasJSON = canvasJSON;
			this.connectionType = config.enableConnectionType;
			this.nodeFormatType = config.enableNodeFormatType;
			this.linkType = config.enableLinkType;
			this.clearCanvas();
		}

		// Initialize dimensions before cloning the canvas since cloning relies on the dimnesion info
		this.initializeDimensions();

		// Make a copy of canvasJSON because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasJSON in the ObjectModel until we're done.
		this.canvasJSON = this.cloneCanvasJSON(canvasJSON);

		// this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1); // Reset zoom parameters

		this.displayCanvas();
		this.consoleLog("Set Canvas. Elapsed time = " + (Date.now() - startTime));
	}

	// Copies the canvas JSON because the canvas info is updated by the d3 code when
	// real time actions are performed like moving nodes or comments or resizing
	// comments.
	cloneCanvasJSON(canvasJSON) {
		var newCanvas = JSON.parse(JSON.stringify(canvasJSON));

		// Add some useful height info to the nodes
		newCanvas.nodes = newCanvas.nodes.map((node) => {
			var inputPortsHeight = 0;
			var outputPortsHeight = 0;
			var nodeHeight = this.nodeHeight;

			if (this.connectionType === "Ports") {
				inputPortsHeight = node.input_ports ? (node.input_ports.length * (this.portArcRadius * 2)) + ((node.input_ports.length - 1) * this.portArcSpacing) : 0;
				outputPortsHeight = node.output_ports ? (node.output_ports.length * (this.portArcRadius * 2)) + ((node.output_ports.length - 1) * this.portArcSpacing) : 0;
				nodeHeight = Math.max(inputPortsHeight, outputPortsHeight, this.nodeHeight);
			}

			node.inputPortsHeight = inputPortsHeight;
			node.outputPortsHeight = outputPortsHeight;
			node.height = nodeHeight;
			node.width = this.nodeWidth;
			return node;
		});

		return newCanvas;
	}

	clearCanvas() {
		this.consoleLog("Clearing Canvas. Id = " + this.canvasJSON.id);
		ObjectModel.clearSelection();
		this.canvas.selectAll("g").remove();
		this.initializeZoomVariables();
		this.canvasSVG.call(this.zoom.transform, d3.zoomIdentity); // Reset the SVG zoom and scale
	}

	displayCanvas() {
		// this.consoleLog("Displaying Canvas. Id = " + this.canvasJSON.id);
		this.displayComments(); // Show comments first so they appear under nodes, if there is overlap.
		this.displayNodes();
		this.displayLinks();
		// this.showBoundingRectangles(); // This can be uncommented for debugging to see bondaries.
	}

	// Display bounding rectangles aroud the SVG area and the canvas area defined
	// by the nodes and comments.
	showBoundingRectangles() {
		const svgRect = this.canvasSVG.node().getBoundingClientRect();
		const canv = this.getCanvasDimensionsAdjustedForScale(1);

		d3.selectAll("#svgRect").remove();
		d3.selectAll("#canvasRect").remove();

		this.canvas
			.append("rect")
			.attr("id", "svgRect")
			.attr("height", svgRect.height)
			.attr("width", svgRect.width)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "none")
			.style("stroke", "black");

		if (canv) {
			this.canvas
				.append("rect")
				.attr("id", "canvasRect")
				.attr("height", canv.height)
				.attr("width", canv.width)
				.attr("x", canv.left)
				.attr("y", canv.top)
				.style("fill", "none")
				.style("stroke", "blue")
				.lower();
		}
	}

	// Returns true if either the Command Key (Mac) or Control key (Windows)
	// is pressed. This means the Control key on the Mac also works for key
	// augmentation. Also since metaKey is true when the Windows key on Windows
	// is pressed that will also act as an augmentation key.
	isCmndCtrlPressed() {
		return d3.event.metaKey || d3.event.ctrlKey;
	}

	// Returns the current mouse posiiton transformed by the current zoom
	// transformation amounts.
	getTransformedMousePos() {
		return this.transformMousePos(this.getMousePos());
	}

	// Returns the current mouse position. Note: Using d3.mouse is better than
	// calling d3.event.offsetX and d3.event.offsetX because in Firefox d3.mouse
	// provides an offset within the SVG area whereas in Firefox the d3.event
	// offset variables provide an offset from within the object the mouse is over.
	// Note: added checks for event to prevent error in FF when building in production:
	// TypeError: Value being assigned to SVGPoint.x is not a finite floating-point value.
	getMousePos() {
		if (d3.event instanceof MouseEvent || (d3.event && d3.event.sourceEvent)) {
			const mousePos = d3.mouse(this.canvasSVG.node());
			return { x: mousePos[0], y: mousePos[1] };
		}
		return { x: 0, y: 0 };
	}

	// Transforms the mouse x and y passed in by the current zoom transformation
	// amounts. This is called from diagram-canvas-d3.jsx as well as from this
	// module.
	transformMousePos(pos) {
		return {
			x: (pos.x - this.zoomTransform.x) / this.zoomTransform.k,
			y: (pos.y - this.zoomTransform.y) / this.zoomTransform.k
		};
	}

	getNode(nodeId) {
		const node = this.canvasJSON.nodes.find((nd) => nd.id === nodeId);
		return (typeof node === "undefined") ? null : node;
	}

	getNodePort(nodeId, portId, type) {
		const node = this.canvasJSON.nodes.find((nd) => nd.id === nodeId);
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
		const comment = this.canvasJSON.comments.find((com) => com.id === commentId);
		return (typeof comment === "undefined") ? null : comment;
	}

	getNodeOrComment(id) {
		let obj = this.getNode(id);
		if (obj === null) {
			obj = this.getComment(id);
		}
		return obj;
	}

	createCanvas() {
		// this.consoleLog("Create Canvas");

		// Add a listener to canvas div to catch delete key presses. The containing
		// canvas div must have tabindex set and the focus set on the div.
		const canvasDiv = d3.select(this.canvasSelector)
			.on("keydown", () => {
				// Only catch key pressses when NOT editing because, while editing,
				// the test area needs to receive key presses for undo, redo, delete etc.
				if (!this.editingComment) {
					if (d3.event.keyCode === BACKSPACE_KEY ||
							d3.event.keyCode === DELETE_KEY) {
						this.stopPropagationAndPreventDefault(); // Some browsers interpret Delete as 'Back to previous page'. So prevent that.
						this.editActionHandler({ editType: "deleteSelectedObjects", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					} else if (this.isCmndCtrlPressed() && !d3.event.shiftKey && d3.event.keyCode === Z_KEY) {
						this.stopPropagationAndPreventDefault();
						this.editActionHandler({ editType: "undo" });
					} else if (this.isCmndCtrlPressed() && d3.event.shiftKey && d3.event.keyCode === Z_KEY) {
						this.stopPropagationAndPreventDefault();
						this.editActionHandler({ editType: "redo" });
					} else if (this.isCmndCtrlPressed() && d3.event.keyCode === A_KEY) {
						this.stopPropagationAndPreventDefault();
						ObjectModel.selectAll();
					}
				}
			});

		this.canvasSVG = canvasDiv
			.append("svg")
			.attr("width", this.svg_canvas_width)
			.attr("height", this.svg_canvas_height)
			.attr("class", "svg-area")
			.call(this.zoom)
			// .on("mousedown.zoom", () => {
			//	this.consoleLog("Zoom - mousedown");
			// })
			.on("mousemove.zoom", () => {
				// this.consoleLog("Zoom - mousemove");
				if (this.drawingNewLink === true) {
					this.drawNewLink();
				}
			})
			.on("mouseup.zoom", () => {
				this.consoleLog("Zoom - mouseup");
				if (this.drawingNewLink === true) {
					this.stopDrawingNewLink();
				}
			})
			.on("dblclick.zoom", () => {
				this.consoleLog("Zoom - double click");
				this.clickActionHandler({
					clickType: "DOUBLE_CLICK",
					objectType: "canvas",
					selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			})
			.on("contextmenu.zoom", (d) => {
				this.consoleLog("Zoom - context menu");
				this.openContextMenu("canvas");
			});

		// Add defs element to allow a filter
		// TODO - Figure out how to get drop shadow to display correctly.
		var defs = this.canvasSVG.append("defs");
		this.createDropShadow(defs);

		this.canvas = this.canvasSVG
			.append("g")
			.on("mousedown", () => {
				this.consoleLog("Canvas - mouse down");
			})
			.on("mousemove", () => {
				// this.consoleLog("Canvas - mouse move");
			})
			.on("mouseup", () => {
				this.consoleLog("Canvas - mouse up");
			})
			.on("dblclick", () => {
				this.consoleLog("Canvas - double click");
			})
			.on("contextmenu", () => {
				this.consoleLog("Canvas - context menu");
			});
	}

	createDropShadow(defs) {
		var dropShadowFilter = defs.append("filter")
			.attr("id", "drop-shadow")
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

	zoomToFit() {
		const viewPortDimensions = this.canvasSVG.node().getBoundingClientRect();
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1, 10);

		if (canvasDimensions) {
			var xRatio = viewPortDimensions.width / canvasDimensions.width;
			var yRatio = viewPortDimensions.height / canvasDimensions.height;
			var newScale = Math.min(xRatio, yRatio, 1); // Don't let the canvas be scaled more than 1 in either direction

			this.zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions);
		}
	}

	zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions) {
		if (canvasDimensions) {
			var x = (viewPortDimensions.width - (canvasDimensions.width * newScale)) / 2;
			var y = (viewPortDimensions.height - (canvasDimensions.height * newScale)) / 2;

			x -= newScale * canvasDimensions.left;
			y -= newScale * canvasDimensions.top;

			this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(newScale);

			this.canvasSVG
				// .transition()
				// .duration(500)
				.call(this.zoom.transform, this.zoomTransform);
		}
	}

	zoomIn() {
		if (this.zoomTransform.k < this.maxScaleExtent) {
			// const zoomSvgRect = this.canvasSVG.node().getBoundingClientRect();
			var newScale = Math.min(this.zoomTransform.k * 1.1, this.maxScaleExtent);
			this.zoomCanvasToViewPortCenter(newScale);
		}
	}

	zoomOut() {
		if (this.zoomTransform.k > this.minScaleExtent) {
		// 	const zoomSvgRect = this.canvasSVG.node().getBoundingClientRect();
			var newScale = Math.max(this.zoomTransform.k / 1.1, this.minScaleExtent);
			this.zoomCanvasToViewPortCenter(newScale);
		}
	}

	zoomCanvasToViewPortCenter(newScale) {
		const viewPortDimensions = this.canvasSVG.node().getBoundingClientRect();
		const canvasDimensions = this.getCanvasDimensionsAdjustedForScale(1);

		this.zoomToFitForScale(newScale, canvasDimensions, viewPortDimensions);
	}

	zoomStart() {
		this.consoleLog("Zoom start - x = " + d3.event.transform.x + " y = " + d3.event.transform.y + " k = " + d3.event.transform.k);

		if (d3.event.sourceEvent && d3.event.sourceEvent.shiftKey) {
			this.regionSelect = true;
			this.regionStartTransformX = d3.event.transform.x;
			this.regionStartTransformY = d3.event.transform.y;
			const transPos = this.getTransformedMousePos();
			this.region = {
				startX: transPos.x,
				startY: transPos.y,
				width: 0,
				height: 0
			};
		} else {
			this.zoomStartPoint = { x: d3.event.transform.x, y: d3.event.transform.y, k: d3.event.transform.k };
		}
	}

	zoomAction() {
		// this.consoleLog("Zoom action - x = " + d3.event.transform.x + " y = " + d3.event.transform.y + " k = " + d3.event.transform.k);

		if (this.regionSelect === true) {
			const transPos = this.getTransformedMousePos();
			this.region.width = transPos.x - this.region.startX;
			this.region.height = transPos.y - this.region.startY;
			this.drawRegionSelector();

		} else {
			var x = d3.event.transform.x;
			var y = d3.event.transform.y;
			var k = d3.event.transform.k;


			// If we are not zooming we must be dragging so, if the canvas rectangle
			// (nodes and comments) is smaller than the SVG area then don't let the
			// canvas be dragged out of the SVG area.
			if (k === this.zoomStartPoint.k) {
				const canv = this.getCanvasDimensionsAdjustedForScale(k);
				const zoomSvgRect = this.canvasSVG.node().getBoundingClientRect();

				if (canv && canv.width < zoomSvgRect.width) {
					x = Math.max(-canv.left, Math.min(x, zoomSvgRect.width - canv.width - canv.left));
				}
				if (canv && canv.height < zoomSvgRect.height) {
					y = Math.max(-canv.top, Math.min(y, zoomSvgRect.height - canv.height - canv.top));
				}
			}

			d3.event.transform.x = x;
			d3.event.transform.y = y;

			this.zoomTransform = d3.zoomIdentity.translate(x, y).scale(k);
			this.canvas.attr("transform", this.zoomTransform);

			var ta = d3.select(".d3-comment-entry");
			if (!ta.empty()) {
				ta.style("transform", this.getTextAreaTransform());
			}
		}
	}

	zoomEnd() {
		this.consoleLog("Zoom end - x = " + d3.event.transform.x + " y = " + d3.event.transform.y + " k = " + d3.event.transform.k);

		if (this.drawingNewLink) {
			this.stopDrawingNewLink();
			this.drawingNewLink = false;
		}

		if (this.regionSelect === true) {
			this.removeRegionSelector();

			// Reset the transform x and y to what they were before the region
			// selection action was started.
			d3.event.transform.x = this.regionStartTransformX;
			d3.event.transform.y = this.regionStartTransformY;

			ObjectModel.clearSelection();

			// Only select objects if region selector area dimensions are > 5.
			if (Math.abs(this.region.width) > 5 &&
					Math.abs(this.region.height) > 5) {
				var { startX, startY, width, height } = this.getRegionDimensions();
				this.selectInRegion(startX, startY, startX + width, startY + height);
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "region", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			} else {
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			}
			this.regionSelect = false;
		} else {
			// If mouse hasn't moved very far we make this equivalent to a click
			// on the canvas.
			if (Math.abs(d3.event.transform.x - this.zoomStartPoint.x) < 2 &&
					Math.abs(d3.event.transform.y - this.zoomStartPoint.y) < 2) {
				this.selecting = true;
				const clickedPos = this.getTransformedMousePos();
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds(), clickedPos: clickedPos });
				// TODO - The decision to clear selection (commented out code below) is currently made by common-canvas
				// This 'to do' is to move that decision from there to here. To do that we need to have a callback function
				// to the ask the react code if a context menu is currently on display or not.
				// if (ObjectModel.getSelectedObjectIds().length > 0) {
				// 	ObjectModel.clearSelection();
				// }
				this.selecting = false;
			} else {
				// If a text area is open, any pending changes need to be saved before
				// the zoomCanvas edit action occurs because that will cause a refresh
				// from the objectmodel's canvasJSON which would remove any pending changes.
				this.savePendingCommentChanges();
				this.consoleLog("editActionHandler - zoomCanvas");
				this.editActionHandler({ editType: "zoomCanvas", value: d3.event.transform.k });
			}
		}
	}

	selectInRegion(minX, minY, maxX, maxY) {
		var regionSelections = [];
		for (const node of this.canvasJSON.nodes) {
			if (minX < node.x_pos + node.width &&
					maxX > node.x_pos &&
					minY < node.y_pos + node.height &&
					maxY > node.y_pos) {
				regionSelections.push(node.id);
			}
		}
		for (const comment of this.canvasJSON.comments) {
			if (minX < comment.x_pos + comment.width &&
					maxX > comment.x_pos &&
					minY < comment.y_pos + comment.height &&
					maxY > comment.y_pos) {
				regionSelections.push(comment.id);
			}
		}
		ObjectModel.setSelections(regionSelections);
	}

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. The
	// dimensions are scaled by k and padded by pad (if provided).
	getCanvasDimensionsAdjustedForScale(k, pad) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		d3.selectAll(".node-group").each((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.highLightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.highLightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.highLightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.highLightGap);
		});

		d3.selectAll(".comment-group").each((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.highLightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.highLightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.highLightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.highLightGap);
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

		this.canvas
			.append("rect")
			.attr("width", width)
			.attr("height", height)
			.attr("x", startX)
			.attr("y", startY)
			.attr("class", "d3-region-selector");
	}

	removeRegionSelector() {
		this.canvas.selectAll(".d3-region-selector").remove();
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
		// this.consoleLog("Drag start");
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		// Note: Comment resizing is started by the comment highlight rectangle.
	}

	dragMove() {
		// this.consoleLog("Drag move");
		this.dragging = true;
		if (this.commentSizing) {
			this.resizeComment();
		} else {
			this.dragOffsetX += d3.event.dx;
			this.dragOffsetY += d3.event.dy;

			var objs = this.getSelectedNodesAndComments();

			objs.forEach(function(d) {
				d.x_pos += d3.event.dx;
				d.y_pos += d3.event.dy;
			});

			var startTime = Date.now();
			this.displayNodes();
			var endTimeNodes = Date.now();
			this.displayComments();
			var endTimeComments = Date.now();
			this.displayLinks();
			var endLines = Date.now();
			if (showTime) {
				this.consoleLog("dragMove N " + (endTimeNodes - startTime) + " C " +
				(endTimeComments - endTimeNodes) + " L " + (endLines - endTimeComments));
			}
		}
	}

	dragEnd() {
		// this.consoleLog("Drag end");
		if (this.commentSizing) {
			this.dragging = false;
			this.endCommentSizing();
		} else if (this.dragging) {
			if (this.dragOffsetX !== 0 ||
					this.dragOffsetY !== 0) {
				// this.consoleLog("editActionHandler - moveObjects");
				this.editActionHandler({ editType: "moveObjects", nodes: ObjectModel.getSelectedObjectIds(), offsetX: this.dragOffsetX, offsetY: this.dragOffsetY });
			}
			this.dragging = false;
		}
	}

	displayNodes() {
		// this.consoleLog("Displaying nodes");
		const that = this;

		var nodeGroupSel = this.canvas.selectAll(".node-group")
			.data(this.canvasJSON.nodes, function(d) { return d.id; });

		if (this.dragging) {
			// only transform nodes while dragging
			nodeGroupSel.each(function(d) {
				d3.select(`#node_grp_${d.id}`)
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data
			});
		} else if (this.selecting || this.regionSelect || this.commentSizing) {
			nodeGroupSel.each(function(d) {
				d3.select(`#node_outline_${d.id}`)
					.attr("selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.selectionHighlightClass)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				// This code will remove custom attributes from a node. This might happen when
				// the user clicks the canvas background to remove the greyed out appearance of
				// a node that was 'cut' to the clipboard.
				// TODO - Remove this code if/when common canvas supports cut (which removes nodes
				// from the canvas) and when WML Canvas uses that clipboard support in place
				// of its own.
				d3.select(`#node_image_${d.id}`)
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
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
			});
		} else {

			// Apply selection highlighting to the 'update selection' nodes. That is,
			// all nodes that are the same as during the last call to displayNodes().

			nodeGroupSel.each(function(d) {

				d3.select(`#node_grp_${d.id}`)
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				d3.select(`#node_outline_${d.id}`)
					.attr("selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.selectionHighlightClass)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				d3.select(`#node_image_${d.id}`)
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
					.each(function(nd) {
						if (nd.customAttrs) {
							var imageObj = d3.select(this);
							nd.customAttrs.forEach((customAttr) => {
								imageObj.attr(customAttr, "");
							});
						}
					});

				d3.select(`#node_label_${d.id}`)
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
					.text(function(nd) {
						var textObj = d3.select(this);
						return that.trimLabelToWidth(nd.label, that.labelWidth, that.labelClass, textObj);
					});
			});

			var nodeGroups = nodeGroupSel.enter()
				.append("g")
				.attr("id", (d) => `node_grp_${d.id}`)
				.attr("class", "obj-group node-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					if (that.connectionType === "Ports") {
						d3.select(`#node_body_${d.id}`).attr("hover", "yes");
						d3.select(this)
							.append("image")
							.attr("id", "node-ellipsis")
							.attr("xlink:href", nodeMenuStandardIcon)
							.attr("width", that.ellipsisWidth)
							.attr("height", that.ellipsisHeight)
							.attr("x", that.ellipsisPosX)
							.attr("y", (nd) => that.getEllipsisPosY(nd))
							.on("mouseenter", () => {
								d3.select("#node-ellipsis").attr("xlink:href", nodeMenuHoverIcon);
							})
							.on("mouseleave", () => {
								d3.select("#node-ellipsis").attr("xlink:href", nodeMenuStandardIcon);
							})
							.on("click", () => {
								that.stopPropagationAndPreventDefault();
								that.openContextMenu("node", d);
							});
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					d3.select(`#node_body_${d.id}`).attr("hover", "no");
					if (that.connectionType === "Ports") {
						d3.selectAll("#node-ellipsis").remove();
					}
				})
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.consoleLog("Node Group - mouse down");
					this.selecting = true;
					d3.event.stopPropagation(); // Prevent mousedown event going through to canvas
					if (!ObjectModel.isSelected(d.id)) {
						if (d3.event.shiftKey) {
							ObjectModel.selectSubGraph(d.id);
						} else {
							ObjectModel.toggleSelection(d.id, this.isCmndCtrlPressed());
						}
					} else {
						if (that.isCmndCtrlPressed()) {
							ObjectModel.toggleSelection(d.id, this.isCmndCtrlPressed());
						}
					}
					this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "node", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					this.selecting = false;
					this.consoleLog("Node Group - finished mouse down");
				})
				.on("mousemove", (d) => {
					// this.consoleLog("Node Group - mouse move");
					// Don't stop propogation. Mouse move messages must be allowed to
					// propagate to canvas zoom operation.
				})
				.on("mouseup", (d) => {
					d3.event.stopPropagation();
					this.consoleLog("Node Group - mouse up");
					if (this.drawingNewLink === true) {
						this.completeNewLink(d);
					}
				})
				.on("dblclick", (d) => {
					this.consoleLog("Node Group - double click");
					d3.event.stopPropagation();
					var selObjIds = ObjectModel.getSelectedObjectIds();
					this.clickActionHandler({ clickType: "DOUBLE_CLICK", objectType: "node", id: d.id, selectedObjectIds: selObjIds });
				})
				.on("contextmenu", (d) => {
					this.consoleLog("Node Group - context menu");
					this.stopPropagationAndPreventDefault();
					that.openContextMenu("node", d);
				})
				.call(this.drag); // Must put drag after mousedown listener so mousedown gets called first.

			// Node selection highlighting outline
			if (this.nodeShape === "port-arcs") {
				nodeGroups.append("path")
					.attr("id", (d) => `node_outline_${d.id}`)
					.attr("d", (d) => this.getNodeShapePath(d))
					.attr("transform", (d) => this.getNodeHighlightOutlineTranslate(d)) // Scale and move the shape up and to the left to account for the padding
					.attr("selected", function(d) { return ObjectModel.isSelected(d.id) ? "yes" : "no"; })
					.attr("class", this.selectionHighlightClass);
			} else { // simple rectangle
				nodeGroups.append("rect")
					.attr("id", (d) => `node_outline_${d.id}`)
					.attr("width", (d) => d.width + (2 * this.highLightGap))
					.attr("height", (d) => d.height + (2 * this.highLightGap))
					.attr("x", -this.highLightGap)
					.attr("y", -this.highLightGap)
					.attr("selected", function(d) { return ObjectModel.isSelected(d.id) ? "yes" : "no"; })
					.attr("class", this.selectionHighlightClass);
			}

			if (this.connectionType === "Ports") {
				// Node body
				if (this.nodeShape === "port-arcs") {
					nodeGroups.append("path")
						.attr("id", (d) => `node_body_${d.id}`)
						.attr("d", (d) => this.getNodeShapePath(d))
						.attr("class", this.nodeBodyClass)
						.style("filter", "url(#drop-shadow)");
				} else {
					nodeGroups.append("rect")
						.attr("id", (d) => `node_body_${d.id}`)
						.attr("width", (d) => d.width)
						.attr("height", (d) => d.height)
						.attr("x", 0)
						.attr("y", 0)
						.attr("class", this.nodeBodyClass);
				}

				// ports: create for new and existing nodes
				var newAndExistingNodes = nodeGroupSel.enter().merge(nodeGroupSel);
				newAndExistingNodes
					.each((d) => {
						// Input ports
						if (d.input_ports && d.input_ports.length > 0) {
							const inputPortPositions = this.getPortPositions(d, "input");

							var inputPortSelection = d3.select(`#node_grp_${d.id}`).selectAll("." + that.nodePortInputClass)
								.data(d.input_ports, function(p) { return p.id; });

							// update datum for existing ports, sets the __data__ to the updated data of the port
							inputPortSelection.each(function(p) {
								d3.select(`trg_circle_${d.id}_${p.id}`)
									.attr("class", that.nodePortInputClass + (p.class_name ? " " + p.class_name : ""))
									.datum((nd) => that.getNodePort(d.id, nd.id, "input"));
							});

							inputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => `trg_circle_${d.id}_${port.id}`)
								.attr("portId", (port) => port.id) // This is needed by getNodeInputPortAtMousePos
								.attr("cx", 0)
								.attr("cy", (port) => {
									var inputPortPos = d.input_ports.findIndex((p) => p.id === port.id);
									return inputPortPositions[inputPortPos];
								})
								.attr("r", this.portRadius)
								.attr("class", (port) => this.nodePortInputClass + (port.class_name ? " " + port.class_name : ""))
								.attr("connected", "no");

							inputPortSelection.enter()
								.append("path")
								.attr("id", (port) => `trg_arrow_${d.id}_${port.id}`)
								.attr("d", (port) => {
									var inputPortPos = d.input_ports.findIndex((p) => p.id === port.id);
									return that.getArrowShapePath(inputPortPositions[inputPortPos]);
								})
								.attr("class", this.nodePortInputArrowClass)
								.attr("connected", "no");

							inputPortSelection.exit().remove();
						}

						// Output ports
						if (d.output_ports && d.output_ports.length > 0) {
							const outputPortPositions = this.getPortPositions(d, "output");

							var outputPortSelection = d3.select(`#node_grp_${d.id}`).selectAll("." + that.nodePortOutputClass)
								.data(d.output_ports, function(p) { return p.id; });

							// update datum for existing ports, sets the __data__ to the updated data of the port
							outputPortSelection.each(function(p) {
								d3.select(`src_circle_${d.id}_${p.id}`)
									.attr("class", that.nodePortInputClass + (p.class_name ? " " + p.class_name : ""))
									.datum((nd) => that.getNodePort(d.id, nd.id, "output"));
							});

							outputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => `src_circle_${d.id}_${port.id}`)
								.attr("cx", () => d.width)
								.attr("cy", (port) => {
									const outputPortPos = d.output_ports.findIndex((p) => p.id === port.id);
									return outputPortPositions[outputPortPos];
								})
								.attr("r", this.portRadius)
								.attr("class", (port) => this.nodePortOutputClass + (port.class_name ? " " + port.class_name : ""))
								.on("mousedown", (port) => {
									this.stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
									this.drawingNewLink = true;
									this.drawingNewLinkSrcId = d.id;
									this.drawingNewLinkSrcPortId = port.id;
									this.drawingNewLinkAction = "node-node";
									const node = this.getNodeAtMousePos();
									const outputPortPos = d.output_ports.findIndex((p) => p.id === port.id);
									this.drawingNewLinkStartPos = { x: node.x_pos + d.width, y: node.y_pos + outputPortPositions[outputPortPos] };
									this.drawingNewLinkArray = [];
									this.drawNewLink();
								});

							outputPortSelection.exit().remove();
						}
					});
			}

			// Image outline - this code used for debugging purposes
			// nodeGroups.append("rect")
			// 	.attr("width", this.imageWidth)
			// 	.attr("height", this.imageHeight)
			// 	.attr("x", this.imagePosX)
			// 	.attr("y", this.imagePosY)
			// 	.attr("class", "d3-node-image-outline");

			// Node image

			nodeGroups.append("image")
				.attr("id", function(d) { return `node_image_${d.id}`; })
				.attr("xlink:href", function(d) { return d.image; })
				.attr("width", this.imageWidth)
				.attr("height", this.imageHeight)
				.attr("x", this.imagePosX)
				.attr("y", (d) => this.getImagePosY(d))
				.attr("class", "node-image")
				.each(function(d) {
					if (d.customAttrs) {
						var imageObj = d3.select(this);
						d.customAttrs.forEach((customAttr) => {
							imageObj.attr(customAttr, "");
						});
					}
				});


			// Label outline - this code used for debugging purposes
			// nodeGroups.append("rect")
			// 	.attr("width", this.labelWidth)
			// 	.attr("height", this.labelHeight)
			// 	.attr("x", this.labelPosX)
			// 	.attr("y", (d) => this.getLabelPosY(d))
			// 	.attr("class", "d3-label-outline");

			// Label
			nodeGroups.append("text")
				.text(function(d) {
					var textObj = d3.select(this);
					return that.trimLabelToWidth(d.label, that.labelWidth, this.labelClass, textObj);
				})
				.attr("id", function(d) { return `node_label_${d.id}`; })
				.attr("class", function(d) { return that.labelClass + " " + (d.messages && d.messages.length > 0 ? that.labelErrorClass : ""); })
				.attr("x", this.labelHorizontalJustification === "left" ? this.labelPosX : this.labelPosX + (this.labelWidth / 2)) // If not "left" then "center"
				.attr("y", (d) => this.getLabelPosY(d) + this.labelHeight - this.labelDescent)
				.attr("text-anchor", this.labelHorizontalJustification === "left" ? "start" : "middle")
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					const labelObj = d3.select(this);
					if (that.displayFullLabelOnHover &&
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


			// Halo
			if (this.connectionType === "Halo") {
				nodeGroups.append("circle")
					.attr("id", function(d) { return `node_halo_${d.id}`; })
					.attr("class", "d3-node-halo")
					.attr("cx", this.haloCenterX)
					.attr("cy", this.haloCenterY)
					.attr("r", this.haloRadius)
					.on("mousedown", (d) => {
						this.consoleLog("Halo - mouse down");
						d3.event.stopPropagation();
						this.drawingNewLink = true;
						this.drawingNewLinkSrcId = d.id;
						this.drawingNewLinkAction = "node-node";
						this.drawingNewLinkStartPos = this.getTransformedMousePos();
						this.drawingNewLinkArray = [];
						this.drawNewLink();
					});
			}

			// Error indicator
			nodeGroups.filter((d) => d.messages && d.messages.length > 0)
				.append("circle")
				.attr("id", function(d) { return `error_circle_${d.id}`; })
				.attr("class", "d3-error-circle")
				.attr("cx", this.errorCenterX)
				.attr("cy", (d) => this.getErrorPosY(d))
				.attr("r", this.errorRadius);

			// Decorators
			this.addDecorator(nodeGroups, "topLeft", this.leftDecoratorX, this.topDecoratorY);
			this.addDecorator(nodeGroups, "topRight", this.rightDecoratorX, this.topDecoratorY);
			this.addDecorator(nodeGroups, "bottomLeft", this.leftDecoratorX, this.bottomDecoratorY);
			this.addDecorator(nodeGroups, "bottomRight", this.rightDecoratorX, this.bottomDecoratorY);

			// Remove any nodes that are no longer in the diagram.nodes array.
			nodeGroupSel.exit().remove();
		}
	}

	getImagePosY(data) {
		if (this.labelAndIconVerticalJustification === "center") {
			if (this.nodeFormatType === "Horizontal") {
				return (data.height / 2) - (this.imageHeight / 2);

			} else if (this.nodeFormatType === "Vertical") {
				var imageLabelGap = this.labelPosY - (this.imagePosY + this.imageHeight);
				return (data.height / 2) - ((this.imageHeight + this.labelHeight + imageLabelGap) / 2);
			}
		}
		return this.imagePosY;
	}

	getLabelPosY(data) {
		if (this.labelAndIconVerticalJustification === "center") {
			if (this.nodeFormatType === "Horizontal") {
				return (data.height / 2) - (this.labelHeight / 2);

			} else if (this.nodeFormatType === "Vertical") {
				var imageLabelGap = this.labelPosY - (this.imagePosY + this.imageHeight);
				return (data.height / 2) + ((this.imageHeight + this.labelHeight + imageLabelGap) / 2) - this.labelHeight;
			}
		}

		return this.labelPosY;
	}

	getErrorPosY(data) {
		if (this.labelAndIconVerticalJustification === "center") {
			if (this.nodeFormatType === "Horizontal") {
				return (data.height / 2) - (this.imageHeight / 2);

			} else if (this.nodeFormatType === "Vertical") {
				var imageLabelGap = this.labelPosY - (this.imagePosY + this.imageHeight);
				return (data.height / 2) - ((this.imageHeight + this.labelHeight + imageLabelGap) / 2);
			}
		}
		return this.errorCenterY;
	}

	getEllipsisPosY(data) {
		if (this.labelAndIconVerticalJustification === "center") {
			if (this.nodeFormatType === "Horizontal") {
				return (data.height / 2) - (this.ellipsisHeight / 2);

			} else if (this.nodeFormatType === "Vertical") {
				return this.getImagePosY(data) - (this.ellipsisPosY - this.imagePosY);
			}
		}
		return this.ellipsisPosY;
	}

	openContextMenu(type, d) {
		this.stopPropagationAndPreventDefault(); // Stop the browser context menu appearing
		this.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			cmPos: this.getMousePos(),
			mousePos: this.getTransformedMousePos(),
			selectedObjectIds: ObjectModel.getSelectedObjectIds(),
			zoom: this.zoomTransform.k });
	}

	setTrgPortStatus(trgId, trgPortId, newStatus) {
		d3.select(`#trg_circle_${trgId}_${trgPortId}`).attr("connected", newStatus);
		d3.select(`#trg_arrow_${trgId}_${trgPortId}`).attr("connected", newStatus);
	}

	setSrcPortStatus(srcId, srcPortId, newStatus) {
		d3.select(`#src_circle_${srcId}_${srcPortId}`).attr("connected", newStatus);
	}

	// Adds a decorator to the nodeGroup passed in of the type passed in at the
	// x and y position provided.
	addDecorator(nodeGroup, type, x, y) {
		var decGrp = nodeGroup.filter((d) => this.isDecoration(d, type));

		decGrp.append("rect")
			.attr("width", this.decoratorWidth + 2)
			.attr("height", this.decoratorHeight + 2)
			.attr("x", x)
			.attr("y", y)
			.attr("class", (d) => this.getDecoratorClass(d, type))
			.filter((d) => this.isDecoratorHotSpot(d, type))
			.on("mousedown", (d) => this.getDecoratorCallback(d, type));

		decGrp.append("image")
			.attr("width", this.decoratorWidth)
			.attr("height", this.decoratorHeight)
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
			if (dec) {
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
		d3.event.stopPropagation();
		if (this.decorationActionHandler) {
			var id = this.getDecoratorId(d, type);
			this.decorationActionHandler(d, id);
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

		if (this.connectionType === "Halo") {
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
		this.canvas
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

		this.canvas.selectAll("." + this.newConnectionLineClass)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", this.newConnectionLineClass)
			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.newConnectionLineStartClass)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x1)
			.attr("cy", (d) => d.y1)
			.attr("r", this.portRadius)
			.attr("class", this.newConnectionLineStartClass)
			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.newConnectionLineBlobClass)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.portRadius)
			.attr("class", this.newConnectionLineBlobClass)
			.attr("linkType", linkType)
			.on("mouseup", () => {
				this.stopPropagationAndPreventDefault();
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
			srcComment.x_pos - this.linkGap,
			srcComment.y_pos - this.linkGap,
			srcComment.width + (this.linkGap * 2),
			srcComment.height + (this.linkGap * 2),
			srcComment.width / 2 + this.linkGap,
			srcComment.height / 2 + this.linkGap,
			transPos.x,
			transPos.y);

		var linkType = "commentLink";

		this.drawingNewLinkArray = [{ "x1": this.drawingNewLinkStartPos.x,
			"y1": this.drawingNewLinkStartPos.y,
			"x2": transPos.x,
			"y2": transPos.y,
			"type": linkType }];

		this.canvas.selectAll("." + this.newConnectionLineClass)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", this.newConnectionLineClass)
			.attr("linkType", linkType);

		// this.canvas.selectAll("." + this.newConnectionLineStartClass)
		// 	.data(this.drawingNewLinkArray)
		// 	.enter()
		// 		.append("circle")
		// 			.attr("cx", (d) => d.x1)
		// 			.attr("cy", (d) => d.y1)
		// 			.attr("r", this.commentPortRadius)
		// 			.attr("class", this.newConnectionLineStartClass)
		// 			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.newConnectionLineBlobClass)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.commentPortRadius)
			.attr("class", this.newConnectionLineBlobClass)
			.attr("linkType", linkType)
			.on("mouseup", () => {
				this.stopPropagationAndPreventDefault();
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			});

		this.canvas.selectAll(".d3-new-connection-arrow")
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => this.getArrowHead(d))
			.attr("class", "d3-new-connection-arrow")
			.attr("linkType", linkType)
			.on("mouseup", () => {
				this.stopPropagationAndPreventDefault();
				var trgNode = this.getNodeAtMousePos();
				if (trgNode !== null) {
					this.completeNewLink(trgNode);
				} else {
					this.stopDrawingNewLink();
				}
			});
	}

	completeNewLink(trgNode) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		if (trgNode !== null) {
			if (this.drawingNewLinkAction === "node-node") {
				var trgPortId = this.getNodeInputPortAtMousePos();
				trgPortId = trgPortId || (trgNode.input_ports && trgNode.input_ports.length > 0 ? trgNode.input_ports[0].id : null);
				this.consoleLog("editActionHandler - linkNodes");
				this.editActionHandler({
					editType: "linkNodes",
					nodes: [{ "id": this.drawingNewLinkSrcId, "portId": this.drawingNewLinkSrcPortId }],
					targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
					linkType: "data" });
			} else {
				this.consoleLog("editActionHandler - linkComment");
				this.editActionHandler({
					editType: "linkComment",
					nodes: [this.drawingNewLinkSrcId],
					targetNodes: [trgNode.id],
					linkType: "comment" });
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
		if (this.connectionType === "Halo") {
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

		if (this.linkType === "Curve") {
			newPath = "M " + saveX1 + " " + saveY1 +
								"C " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2 +
								" " + saveX2 + " " + saveY2;

		} else if (this.linkType === "Straight") {
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

		d3.selectAll("." + this.newConnectionLineClass)
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.canvas.selectAll(".d3-new-connection-arrow").remove();

				d3.selectAll("." + this.newConnectionLineBlobClass)
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("cx", saveX1)
					.attr("cy", saveY1);

				d3.selectAll("." + this.newConnectionLineClass)
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("d", "M " + saveX1 + " " + saveY1 +
											"L " + saveX1 + " " + saveY1)
					.on("end", this.removeNewLink.bind(this));
			});
	}

	removeNewLink() {
		if (this.connectionType === "Halo") {
			this.canvas.selectAll(".d3-node-connector").remove();
		} else {
			this.canvas.selectAll("." + this.newConnectionLineClass).remove();
			this.canvas.selectAll("." + this.newConnectionLineStartClass).remove();
			this.canvas.selectAll("." + this.newConnectionLineBlobClass).remove();
			this.canvas.selectAll(".d3-new-connection-arrow").remove();
		}
	}

	getNodeAtMousePos() {
		const that = this;
		var pos = this.getTransformedMousePos();
		var node = null;
		this.canvas.selectAll(".node-group")
			.each(function(d) {
				if (pos.x >= d.x_pos - that.portRadius && // Target port sticks out by its radius so need to allow for it.
						pos.x <= d.x_pos + d.width + that.portRadius &&
						pos.y >= d.y_pos &&
						pos.y <= d.y_pos + d.height) {
					node = d;
				}
			});
		return node;
	}

	getNodeInputPortAtMousePos() {
		if (this.connectionType === "Halo") {
			return null;
		}

		const that = this;
		var pos = this.getTransformedMousePos();
		var portId = null;
		const node = this.getNodeAtMousePos();
		if (node) {
			d3.select(`#node_grp_${node.id}`).selectAll("." + this.nodePortInputClass)
				.each(function(p) { // Use function keyword so 'this' pointer references the dom object
					var cx = node.x_pos + this.cx.baseVal.value;
					var cy = node.y_pos + this.cy.baseVal.value;
					if (pos.x >= cx - that.portRadius && // Target port sticks out by its radius so need to allow for it.
							pos.x <= cx + that.portRadius &&
							pos.y >= cy - that.portRadius &&
							pos.y <= cy + that.portRadius) {
						portId = this.getAttribute("portId");
					}
				});
		}
		return portId;
	}

	// Returns a path string that will draw the outline shape of the node.
	getNodeShapePath(data) {
		let path = "M 0 0 L " + data.width + " 0 "; // Draw line across the top of the node

		if (data.output_ports && data.output_ports.length > 0) {
			let endPoint = 0;

			// Draw straight segment down to ports (if needed)
			if (data.outputPortsHeight < data.height) {
				if (data.output_ports.length === 1 &&
						data.height <= this.nodeHeight) {
					endPoint = this.portPosY - this.portArcRadius;
				} else {
					endPoint = ((data.height - data.outputPortsHeight) / 2);
				}
				path += " L " + data.width + " " + endPoint;
			}

			// Draw port arcs
			data.output_ports.forEach((port, index) => {
				endPoint += (this.portArcRadius * 2);
				path += " A " + this.portArcRadius + " " + this.portArcRadius + " 180 0 1 " + data.width + " " + endPoint;
				if (index < data.output_ports.length - 1) {
					endPoint += this.portArcSpacing;
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
						data.height <= this.nodeHeight) {
					endPoint = this.portPosY + this.portArcRadius;
				} else {
					endPoint = data.height - ((data.height - data.inputPortsHeight) / 2);
				}
				path += " L 0 " + endPoint;
			}

			data.input_ports.forEach((port, index) => {
				endPoint -= (this.portArcRadius * 2);
				path += " A " + this.portArcRadius + " " + this.portArcRadius + " 180 0 1 0 " + endPoint;
				if (index < data.input_ports.length - 1) {
					endPoint -= this.portArcSpacing;
					path += " L 0 " + endPoint;
				}
			});

			if (data.inputPortsHeight < data.height) {
				path += " L 0 0"; // Draw finishing segment back to origin
			}
		} else {
			path += " L 0 0"; // If no input ports just draw a straight line.
		}
		console.log("Node path = " + path);
		return path;
	}

	getNodeHighlightOutlineTranslate(data) {
		const targetHeight = data.height + (2 * this.highLightGap);
		const yScale = targetHeight / data.height;

		const targetWidth = data.width + (2 * this.highLightGap);
		const xScale = targetWidth / data.width;

		return `translate (${-this.highLightGap},${-this.highLightGap}) scale(${xScale}, ${yScale})`;
	}

	getPortPositions(data, type) {
		const portPositions = [];
		var ports;
		if (type === "input") {
			ports = data.input_ports;
		} else {
			ports = data.output_ports;
		}

		if (data.height <= this.nodeHeight &&
				ports.length === 1) {
			portPositions.push(this.portPosY);

		} else {
			let centerPoint = 0;

			if (type === "input") {
				if (data.inputPortsHeight < data.height) {
					centerPoint = ((data.height - data.inputPortsHeight) / 2);
				}
			} else {
				if (data.outputPortsHeight < data.height) {
					centerPoint = ((data.height - data.outputPortsHeight) / 2);
				}
			}

			ports.forEach(() => {
				centerPoint += this.portArcRadius;
				portPositions.push(centerPoint);
				centerPoint += this.portArcRadius + this.portArcSpacing;
			});
		}

		return portPositions;
	}

	displayComments() {
		// this.consoleLog("Displaying comments");
		const that = this;

		var commentGroupSel = this.canvas.selectAll(".comment-group")
			.data(this.canvasJSON.comments, function(d) { return d.id; });

		if (this.dragging && !this.commentSizing) {
			commentGroupSel.each(function(d) {
				// Comment group object
				d3.select(`#comment_grp_${d.id}`)
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data
			});
		} else if (this.selecting || this.regionSelect) {
			commentGroupSel.each(function(d) {
				// Comment selection highlighting and sizing outline
				d3.select(`#comment_rect_${d.id}`)
					.attr("height", d.height + (2 * that.highLightGap))
					.attr("width", d.width + (2 * that.highLightGap))
					.attr("selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.selectionHighlightClass)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// This code will remove custom attributes from a comment. This might happen when
				// the user clicks the canvas background to remove the greyed out appearance of
				// a comment that was 'cut' to the clipboard.
				// TODO - Remove this code if/when common canvas supports cut (which removes comments
				// from the canvas) and when WML Canvas uses that clipboard support in place
				// of its own.
				d3.select(`#comment_box_${d.id}`)
					.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
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

		} else {
			// Apply selection highlighting to the 'update selection' comments. That is,
			// all comments that are the same as during the last call to displayComments().
			commentGroupSel.each(function(d) {

				// Comment group object
				d3.select(`#comment_grp_${d.id}`)
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Comment selection highlighting and sizing outline
				d3.select(`#comment_rect_${d.id}`)
					.attr("height", d.height + (2 * that.highLightGap))
					.attr("width", d.width + (2 * that.highLightGap))
					.attr("selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.selectionHighlightClass)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Clip path for text
				d3.select(`#comment_clip__path_${d.id}`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Clip rectangle for text
				d3.select(`#comment_clip_rect_${d.id}`)
					.attr("height", d.height)
					.attr("width", d.width - (2 * that.commentWidthPadding))
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Background rectangle for comment
				d3.select(`#comment_box_${d.id}`)
					.attr("height", d.height)
					.attr("width", d.width)
					.attr("class", d.class_name || "canvas-comment") // Use common-canvas.css style since that is the default.
					.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
					.each(function(cd) {
						if (cd.customAttrs) {
							var imageObj = d3.select(this);
							cd.customAttrs.forEach((customAttr) => {
								imageObj.attr(customAttr, "");
							});
						}
					});

				// Comment text
				d3.select(`#comment_text_${d.id}`)
					.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
					.style("stroke", that.editingCommentId === d.id ? "transparent" : null) // Cancel the setting of stroke to null if not editing
					.style("fill", that.editingCommentId === d.id ? "transparent" : null) // Cancel the setting of fill to null if not editing
					.each(function(cd) {
						var textObj = d3.select(this);
						textObj.selectAll("tspan").remove();
						that.displayWordWrappedText(textObj, cd.content, cd.width - (2 * that.commentWidthPadding));
					});

				// Comment halo
				if (that.connectionType === "Halo") {
					d3.select(`#comment_halo_${d.id}`)
						.attr("width", d.width + (2 * that.haloCommentGap))
						.attr("height", d.height + (2 * that.haloCommentGap))
						.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data
				}
			});

			var commentGroups = commentGroupSel.enter()
				.append("g")
				.attr("id", (d) => `comment_grp_${d.id}`)
				.attr("class", "obj-group comment-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				// Use mouse down instead of click because it gets called before drag start.
				.on("mousedown", (d) => {
					this.consoleLog("Comment Group - mouse down");
					this.selecting = true;
					d3.event.stopPropagation(); // Prevent mousedown event going through to canvas
					if (!ObjectModel.isSelected(d.id)) {
						if (d3.event.shiftKey) {
							ObjectModel.selectSubGraph(d.id);
						} else {
							ObjectModel.toggleSelection(d.id, this.isCmndCtrlPressed());
						}
					} else {
						if (this.isCmndCtrlPressed()) {
							ObjectModel.toggleSelection(d.id, this.isCmndCtrlPressed());
						}
					}
					// Even though the single click message below should be emitted
					// from common canvas, if we uncomment this line it prevents the
					// double click event going to the comment group object. This seems
					// to be a timing issue since the same problem is not evident with the
					// similar code for the Node group object.
					// this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "comment", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					this.selecting = false;
					this.consoleLog("Comment Group - finished mouse down");
				})
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					if (that.connectionType === "Ports") {
						d3.select(this)
							.append("circle")
							.attr("id", "comment_port_circle")
							.attr("cx", 0 - that.highLightGap)
							.attr("cy", 0 - that.highLightGap)
							.attr("r", that.commentPortRadius)
							.attr("class", "d3-comment-port-circle")
							.on("mousedown", function(cd) {
								that.stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
								that.drawingNewLink = true;
								that.drawingNewLinkSrcId = d.id;
								this.drawingNewLinkSrcPortId = null;
								that.drawingNewLinkAction = "comment-node";
								that.drawingNewLinkStartPos = { x: d.x_pos - that.highLightGap, y: d.y_pos - that.highLightGap };
								that.drawingNewLinkArray = [];
								that.drawNewLink();
							});
					}
				})
				.on("mouseleave", (d) => {
					if (that.connectionType === "Ports") {
						d3.selectAll("#comment_port_circle").remove();
					}
				})
				.on("dblclick", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					that.consoleLog("Comment Group - double click");
					that.stopPropagationAndPreventDefault();

					d3.select(`#comment_text_${d.id}`) // Make SVG text invisible when in edit mode.
						.style("stroke", "transparent")
						.style("fill", "transparent");

					var datum = d;
					var id = d.id;
					var width = d.width - (2 * that.commentWidthPadding);
					var height = d.height;
					var xPos = d.x_pos + that.commentWidthPadding;
					var yPos = d.y_pos;
					var content = d.content;

					that.textAreaHeight = 0; // Save for comparison during auto-resize
					that.editingComment = true;
					that.editingCommentId = id;

					that.zoomTextAreaCenterX = d.x_pos + (d.width / 2);
					that.zoomTextAreaCenterY = d.y_pos + (d.height / 2);

					d3.select(that.canvasSelector)
						.append("textarea")
						.attr("id",	`text_area_${id}`)
						.attr("data-nodeId", id)
						.attr("class", "d3-comment-entry")
						.text(content)
						.style("width", width + "px")
						.style("height", height + "px")
						.style("left", xPos + "px")
						.style("top", yPos + "px")
						.style("transform", that.getTextAreaTransform())
						.on("keyup", function() {
							that.consoleLog("Text area - Key up");
							that.editingCommentChangesPending = true;
							that.autoSizeTextArea(this, datum);
						})
						.on("paste", function() {
							that.consoleLog("Text area - Paste - Scroll Ht = " + this.scrollHeight);
							that.editingCommentChangesPending = true;
							// Allow some time for pasted text (from context menu) to be
							// loaded into the text area. Otherwise the text is not there
							// and the auto size does not increase the height correctly.
							setTimeout(that.autoSizeTextArea.bind(that), 500, this, datum);
						})
						.on("blur", function() {
							that.consoleLog("Text area - blur");
							var commentObj = that.getComment(id);
							commentObj.content = this.value;
							that.saveCommentChanges(this);
							that.closeCommentTextArea();
							that.displayComments();
						});

					// Note: Couldn't get focus to work through d3, so used dom instead.
					document.getElementById(`text_area_${id}`).focus();
					that.clickActionHandler({ clickType: "DOUBLE_CLICK", objectType: "comment", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
				})
				.on("contextmenu", (d) => {
					this.consoleLog("Comment Group - context menu");
					this.openContextMenu("comment", d);
				})
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

			// Comment selection highlighting and sizing outline
			commentGroups.append("rect")
				.attr("id", (d) => `comment_rect_${d.id}`)
				.attr("width", (d) => d.width + (2 * this.highLightGap))
				.attr("height", (d) => d.height + (2 * this.highLightGap))
				.attr("x", -this.highLightGap)
				.attr("y", -this.highLightGap)
				.attr("attr", function(d) { return ObjectModel.isSelected(d.id) ? "yes" : "no"; })
				.attr("class", this.selectionHighlightClass)
				.on("mousedown", (d) => {
					this.commentSizing = true;
					this.commentSizingId = d.id;
					// Note - comment resizing and finalization of size is handled by drag functions.
				})
				.on("mousemove", (d) => {
					this.commentSizingDirection = this.getCommentSizingDirection(d);
					this.displaySizingCursor(d.id, this.commentSizingDirection);
				});

			// Background rectangle for comment
			commentGroups.append("rect")
				.attr("id", (d) => `comment_box_${d.id}`)
				.attr("width", (d) => d.width)
				.attr("height", (d) => d.height)
				.attr("x", 0)
				.attr("y", 0)
				.attr("class", (d) => d.class_name || "canvas-comment") // Use common-canvas.css style since that is the default.
				.each(function(d) {
					if (d.customAttrs) {
						var imageObj = d3.select(this);
						d.customAttrs.forEach((customAttr) => {
							imageObj.attr(customAttr, "");
						});
					}
				});


			// Clip path to clip the comment text to the comment rectangle
			commentGroups.append("clipPath")
				.attr("id", (d) => `comment_clip_path_${d.id}`)
				.append("rect")
				.attr("id", (d) => `comment_clip_rect_${d.id}`)
				.attr("width", (d) => d.width - (2 * that.commentWidthPadding))
				.attr("height", (d) => d.height)
				.attr("x", 0 + that.commentWidthPadding)
				.attr("y", 0);

			// Comment text
			commentGroups.append("text")
				.attr("id", (d) => `comment_text_${d.id}`)
				.each(function(d) {
					var textObj = d3.select(this);
					that.displayWordWrappedText(textObj, d.content, d.width - (2 * that.commentWidthPadding));
				})
				.attr("clip-path", (d) => `url(#comment_clip_path_${d.id})`)
				.attr("xml:space", "preserve")
				.attr("x", 0 + that.commentWidthPadding)
				.attr("y", 0);

			// Halo
			if (this.connectionType === "Halo") {
				commentGroups.append("rect")
					.attr("id", (d) => `comment_halo_${d.id}`)
					.attr("class", "d3-comment-halo")
					.attr("x", 0 - this.haloCommentGap)
					.attr("y", 0 - this.haloCommentGap)
					.attr("width", (d) => d.width + (2 * this.haloCommentGap))
					.attr("height", (d) => d.height + (2 * this.haloCommentGap))
					.on("mousedown", (d) => {
						this.consoleLog("Comment Halo - mouse down");
						d3.event.stopPropagation();
						this.drawingNewLink = true;
						this.drawingNewLinkSrcId = d.id;
						this.drawingNewLinkSrcPortId = null;
						this.drawingNewLinkAction = "comment-node";
						this.drawingNewLinkStartPos = this.getTransformedMousePos();
						this.drawingNewLinkArray = [];
						this.drawNewLink();
					});
			}

			// Remove any comments that are no longer in the diagram.nodes array.
			commentGroupSel.exit().remove();
		}
	}

	autoSizeTextArea(textArea, datum) {
		this.consoleLog("autoSizeTextArea textAreaHt = " + this.textAreaHeight + " scroll ht = " + textArea.scrollHeight);
		if (this.textAreaHeight < textArea.scrollHeight) {
			this.textAreaHeight = textArea.scrollHeight;
			this.zoomTextAreaCenterY = datum.y_pos + (this.textAreaHeight / 2);
			var comment = this.getComment(datum.id);
			comment.height = this.textAreaHeight;
			d3.select(`#text_area_${datum.id}`)
				.style("height", this.textAreaHeight + "px")
				.style("transform", this.getTextAreaTransform()); // Since the height has changed the translation needs to be reapplied.
			this.displayComments();
			this.displayLinks();
		}
	}

	savePendingCommentChanges() {
		if (this.editingComment === true &&
				this.editingCommentChangesPending === true) {
			var textAreaSelect = d3.select(this.canvasSelector).select("textarea");
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
				nodes: [textArea.getAttribute("data-nodeId")],
				label: textArea.value,
				width: this.removePx(textArea.style.width) + (2 * this.commentWidthPadding),
				height: this.removePx(textArea.style.height),
				offsetX: this.removePx(textArea.style.left) - this.commentWidthPadding,
				offsetY: this.removePx(textArea.style.top)
			};
			this.consoleLog("editActionHandler - editComment");
			this.editActionHandler(data);
		}
	}

	// Returns the transform amount for the text area control that positions the
	// text area based on the current zoom (translate and scale) amount.
	getTextAreaTransform() {
		var x = this.zoomTransform.x - (this.zoomTextAreaCenterX * (1 - this.zoomTransform.k));
		var y = this.zoomTransform.y - (this.zoomTextAreaCenterY * (1 - this.zoomTransform.k));

		return `translate(${x}px, ${y}px) scale(${this.zoomTransform.k})`;
	}

	// Closes the text area and switched off all flags connected with text editing.
	closeCommentTextArea() {
		this.editingComment = false;
		this.editingCommentId = "";
		this.editingCommentChangesPending = false;
		d3.select(this.canvasSelector).select("textarea")
			.remove();
	}

	// Displays a sizing cursor at the edge of a comment box based on the
	// direction passed in.
	displaySizingCursor(id, direction) {
		var cursor = this.getCursorBasedOnDirection(direction);
		d3.select(`#comment_rect_${id}`).style("cursor", cursor);
	}

	// Returns the comment sizing direction (i.e. one of n, s, e, w, nw, ne,
	// sw or se) based on the current mouse position and the position and
	// dimensions of the comment box.
	getCommentSizingDirection(d) {
		var xPart = "";
		var yPart = "";

		const transPos = this.getTransformedMousePos();

		if (transPos.x < d.x_pos + this.cornerResizeArea) {
			xPart = "w";
		} else if (transPos.x > d.x_pos + d.width - this.cornerResizeArea) {
			xPart = "e";
		}
		if (transPos.y < d.y_pos + this.cornerResizeArea) {
			yPart = "n";
		} else if (transPos.y > d.y_pos + d.height - this.cornerResizeArea) {
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

	// Sets the size and position of the object in the canvas.comments
	// array based on the position of the pointer during the resize action
	// then redraws the comment and lines (the line positions may move based
	// on the comment size change).
	resizeComment() {
		var commentObj = this.getComment(this.commentSizingId);
		var width = commentObj.width;
		var height = commentObj.height;
		var xPos = commentObj.x_pos;
		var yPos = commentObj.y_pos;

		if (this.commentSizingDirection.indexOf("e") > -1) {
			width += d3.event.dx;
		}
		if (this.commentSizingDirection.indexOf("s") > -1) {
			height += d3.event.dy;
		}
		if (this.commentSizingDirection.indexOf("n") > -1) {
			yPos += d3.event.dy;
			height -= d3.event.dy;
		}
		if (this.commentSizingDirection.indexOf("w") > -1) {
			xPos += d3.event.dx;
			width -= d3.event.dx;
		}

		// Don't allow the comment area to shrink below 20 pixels otherwise
		// errors may occur especially if the width become less that one
		// character's width.
		if (width < 20 || height < 20) {
			return;
		}

		commentObj.x_pos = xPos;
		commentObj.y_pos = yPos;
		commentObj.width = width;
		commentObj.height = height;

		d3.select(`#comment_grp_${this.commentSizingId}`).remove();
		this.displayComments();
		this.displayLinks();
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing() {
		var commentObj = this.getComment(this.commentSizingId);
		const data = {
			editType: "editComment",
			nodes: [commentObj.id],
			label: commentObj.content,
			width: commentObj.width,
			height: commentObj.height,
			offsetX: commentObj.x_pos,
			offsetY: commentObj.y_pos
		};
		this.consoleLog("editActionHandler - editComment");
		this.editActionHandler(data);
		this.commentSizing = false;
	}

	// Formats the text string passed in as a set of lines of text and displays
	// those lines as tspans in the text object passed in.
	displayWordWrappedText(textObj, text, width) {
		// Create a dummy tspan for use in calculating display lengths for text.
		// This will also be used by displayLinesAsTspan() to display the first line of text.
		var tspan = this.createTspan(" ", 1, "d3-comment-display", textObj);
		var lines = this.splitOnLineBreak(text);
		lines = this.splitLinesOnWords(lines, width, tspan);

		this.displayLinesAsTspan(lines, textObj, tspan);
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
	displayLinesAsTspan(lines, textObj, tspan) {
		lines.forEach((line, i) => {
			if (i === 0) {
				tspan.text(line); // Use the existing tspan for the first line of text.
			} else {
				this.createTspan(line, i + 1, "d3-comment-display", textObj);
			}
		});
	}

	// Returns a tspan containing the text passed in created in the text object
	// passed in at the vertical position described by dy.
	createTspan(text, dy, className, textObj) {
		return textObj
			.append("tspan")
			.attr("class", className)
			.attr("x", 0 + this.commentWidthPadding)
			.attr("y", 0)
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
		// this.consoleLog("Drawing lines");
		var startTimeDrawingLines = Date.now();

		if (this.selecting || this.regionSelect) {
			// no lines update needed when selecting objects/region
		} else if (this.dragging || this.commentSizing) {
			// while dragging only remove lines that are affected by moving nodes/comments
			const affectLinks = this.getConnectedLinks(this.getSelectedNodesAndComments());
			this.canvas.selectAll(".link-group").filter(
				(linkGroupLink) => typeof affectLinks.find(
					(link) => link.id === linkGroupLink.id) !== "undefined")
				.remove();
		} else {
			this.canvas.selectAll(".link-group").remove();
		}

		var timeAfterDelete = Date.now();

		var lineArray = this.buildLineArray();
		lineArray = this.addConnectionPaths(lineArray);

		var afterLineArray = Date.now();

		var linkGroup = this.canvas.selectAll(".link-group")
			.data(lineArray, function(line) { return line.id; })
			.enter()
			.append("g")
			.attr("id", (d) => `link_group_${d.id}`)
			.attr("class", "link-group")
			.attr("src", (d) => d.src)
			.attr("trg", (d) => d.trg)
			.on("mousedown", () => {
				// The context menu gesture will cause a mouse down event which
				// will go through to canvas unless stopped.
				d3.event.stopPropagation(); // Prevent mousedown event going through to canvas
			})
			.on("mouseup", () => {
				this.consoleLog("Line - mouse up");
			})
			.on("contextmenu", (d) => {
				this.consoleLog("Context menu on canvas background.");
				this.openContextMenu("link", d);
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
				if (d.type === "commentLink") {
					classStr = "d3-selectable-link " + (d.class_name || this.commentLinkClass);
				} else {
					classStr = "d3-selectable-link " + this.getDataLinkClass(d);
				}
				return classStr;
			});

		// Arrow head
		linkGroup.filter((d) => this.connectionType === "Halo" || d.type === "commentLink")
			.append("path")
			.attr("d", (d) => this.getArrowHead(d))
			.attr("class", (d) => {
				var classStr;
				if (d.type === "commentLink") {
					classStr = "d3-selectable-link " + (d.class_name || this.commentLinkClass);
				} else {
					classStr = "d3-selectable-link " + this.getDataLinkClass(d);
				}
				return classStr;
			})
			.style("stroke-dasharray", "0"); // Ensure arrow head is always solid line style

		// Arrow within input port
		if (this.connectionType === "Ports") {
			d3.selectAll("." + this.nodePortOutputClass).attr("connected", "no");
			d3.selectAll("." + this.nodePortInputClass).attr("connected", "no");
			d3.selectAll("." + this.nodePortInputArrowClass).attr("connected", "no");
			lineArray.forEach((line) => {
				if (line.type === "nodeLink") {
					this.setTrgPortStatus(line.trg.id, line.trgPortId, "yes");
					this.setSrcPortStatus(line.src.id, line.srcPortId, "yes");
				}
			});
		}

		this.setDisplayOrder();

		var endTimeDrawingLines = Date.now();

		if (showTime) {
			this.consoleLog("displayLinks R " + (timeAfterDelete - startTimeDrawingLines) +
			" B " + (afterLineArray - timeAfterDelete) + " D " + (endTimeDrawingLines - afterLineArray));
		}
	}

	getDataLinkClass(d) {
		// If the data has a classname that isn't the default use it!
		if (d.class_name &&
				d.class_name !== "canvas-data-link") {
			return d.class_name;
		}
		// If the class name is not the default, or there is no classname, return
		// the class name from the preferences. This allows the preferences to
		// override any default class name passed in.
		return this.dataLinkClass;
	}

	// Pushes the links to be below nodes and then pushes comments to be below
	// nodes and links. This lets the user put a large comment underneath a set
	// of nodes and links for annotation purposes.
	setDisplayOrder() {
		this.canvas.selectAll(".link-group").lower(); // Moves link lines below other SVG elements
		this.canvas.selectAll(".comment-group").lower(); // Moves comments below other SVG elements
	}

	buildLineArray() {
		var lineArray = [];

		this.canvasJSON.links.forEach((link) => {
			var srcObj;
			var trgNode = this.getNode(link.trgNodeId);

			if (link.type === "commentLink") {
				srcObj = this.getComment(link.srcNodeId);
			} else {
				srcObj = this.getNode(link.srcNodeId);
			}

			if (srcObj === null) {
				this.consoleLog("Error drawing a link. A link was provided in the Canvas data that does not have a valid source node/comment.");
			}

			if (trgNode === null) {
				this.consoleLog("Error drawing a link. A link was provided in the Canvas data that does not have a valid target node.");
			}

			// Only proceed if we have a source and a target node/comment.
			if (srcObj && trgNode) {
				if (!this.isSourceOverlappingTarget(srcObj, trgNode)) {
					var coords = {};
					var srcPortId;
					var trgPortId;

					if (link.type === "nodeLink") {
						if (this.connectionType === "Halo") {
							coords = this.getNodeLinkCoordsForHalo(srcObj, trgNode);
						} else {
							srcPortId = this.getSourcePortId(link, srcObj);
							trgPortId = this.getTargetPortId(link, trgNode);
							coords = this.getNodeLinkCoordsForPorts(srcObj, srcPortId, trgNode, trgPortId);
						}
					} else {
						coords = this.getCommentLinkCoords(srcObj, trgNode);
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
		if (this.displayLinkOnOverlap === false) {
			if (((srcNode.x_pos + srcNode.width + this.linkGap >= trgNode.x_pos - this.linkGap &&
						trgNode.x_pos + trgNode.width + this.linkGap >= srcNode.x_pos - this.linkGap) &&
						(srcNode.y_pos + srcNode.height + this.linkGap >= trgNode.y_pos - this.linkGap &&
							trgNode.y_pos + trgNode.height + this.linkGap >= srcNode.y_pos - this.linkGap))) {
				return true;
			}
		}

		return false;
	}

	getNodeLinkCoordsForPorts(srcNode, srcPortId, trgNode, trgPortId) {
		var srcY = this.portPosY;
		var trgY = this.portPosY;

		if (srcNode.output_ports && srcNode.output_ports.length > 0) {
			const outputPortPositions = this.getPortPositions(srcNode, "output");
			var srcPortPos = srcNode.output_ports.findIndex((p) => p.id === srcPortId);
			if (srcPortPos > -1) {
				srcY = outputPortPositions[srcPortPos];
			}
		}

		if (trgNode.input_ports && trgNode.input_ports.length > 0) {
			const inputPortPositions = this.getPortPositions(trgNode, "input");
			var trgPortPos = trgNode.input_ports.findIndex((p) => p.id === trgPortId);
			if (trgPortPos > -1) {
				trgY = inputPortPositions[trgPortPos];
			}
		}

		return {
			x1: srcNode.x_pos + srcNode.width,
			y1: srcNode.y_pos + srcY,
			x2: trgNode.x_pos,
			y2: trgNode.y_pos + trgY };
	}

	getNodeLinkCoordsForHalo(srcNode, trgNode) {
		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.linkGap,
			srcNode.y_pos - this.linkGap,
			srcNode.width + (this.linkGap * 2),
			srcNode.height + (this.linkGap * 2),
			this.imagePosX + (this.imageWidth / 2) + this.linkGap,
			this.imagePosY + (this.imageHeight / 2) + this.linkGap,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.linkGap,
			trgNode.y_pos - this.linkGap,
			trgNode.width + (this.linkGap * 2),
			trgNode.height + (this.linkGap * 2),
			this.imagePosX + (this.imageWidth / 2) + this.linkGap,
			this.imagePosY + (this.imageHeight / 2) + this.linkGap,
			srcNode.x_pos + (srcNode.width / 2),
			srcNode.y_pos + (srcNode.height / 2));

		return { x1: startPos.x, y1: startPos.y, x2: endPos.x, y2: endPos.y };
	}

	getCommentLinkCoords(srcNode, trgNode) {
		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.linkGap,
			srcNode.y_pos - this.linkGap,
			srcNode.width + (this.linkGap * 2),
			srcNode.height + (this.linkGap * 2),
			(srcNode.width / 2) + this.linkGap,
			(srcNode.height / 2) + this.linkGap,
			trgNode.x_pos + (trgNode.width / 2),
			trgNode.y_pos + (trgNode.height / 2));

		var centerX;
		var centerY;

		if (this.drawLinkLineTo === "image_center") {
			centerX = this.imagePosX + (this.imageWidth / 2) + this.linkGap;
			centerY = this.imagePosY + (this.imageHeight / 2) + this.linkGap;
		} else {
			centerX = (trgNode.width / 2) + this.linkGap;
			centerY = trgNode.height / 2;
		}

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.linkGap,
			trgNode.y_pos - this.linkGap,
			trgNode.width + (this.linkGap * 2),
			trgNode.height + (this.linkGap * 2),
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
	getArrowShapePath(cy) {
		let path = "M -2 " + (cy - 3);
		path += " L 2 " + cy;
		path += " L -2 " + (cy + 3);
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
		if (this.connectionType === "Ports" &&
				data.type === "nodeLink") {

			if (this.linkType === "Curve") {
				return this.getCurvePath(data);

			} else	if (this.linkType === "Elbow") {
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
			const corner1X = data.x1 + this.minInitialLine;
			const corner1Y = data.y1;
			const corner2X = data.x2 - this.minInitialLine;
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
			const corner1X = data.x1 + this.minInitialLine;
			const corner1Y = data.y1;

			const corner2X = corner1X;
			const corner2Y = data.y1 + (yDiff / 4);

			const corner4X = data.x1 + (xDiff / 2);
			const corner4Y = data.y1 + (yDiff / 2);

			const corner6X = data.x2 - this.minInitialLine;
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

		const corner1X = data.x1 + this.minInitialLine;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;
		let elbowYOffset = this.elbowSize;

		if (yDiff > (2 * this.elbowSize)) {
			elbowYOffset = this.elbowSize;
		}
		else if (yDiff < -(2 * this.elbowSize)) {
			elbowYOffset = -this.elbowSize;
		}
		else {
			elbowYOffset = yDiff / 2;
		}

		// This is a special case where the source and target handles are very
		// close together.
		if (xDiff < (2 * this.minInitialLine) &&
				(yDiff < (4 * this.elbowSize) &&
					yDiff > -(4 * this.elbowSize))) {
			elbowYOffset = yDiff / 4;
		}

		let elbowXOffset = this.elbowSize;
		let extraSegments = false;	// Indicates need for extra elbows and lines

		if (xDiff < (this.minInitialLine + this.elbowSize)) {
			extraSegments = true;
			corner2X = data.x2 - this.minInitialLine;
			elbowXOffset = this.elbowSize;
		}
		else if (xDiff < (2 * this.minInitialLine)) {
			extraSegments = true;
			corner2X = data.x2 - this.minInitialLine;
			elbowXOffset = -((xDiff - (2 * this.minInitialLine)) / 2);
		}
		else {
			elbowXOffset = this.elbowSize;
		}

		let path = "M " + data.x1 + " " + data.y1;

		path += "L " + (corner1X - this.elbowSize) + " " + corner1Y;
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

		path += "Q " + corner2X + " " + corner2Y + " " + (corner2X + this.elbowSize) + " " + corner2Y;
		path += "L " + data.x2 + " " + data.y2;

		return path;
	}

	getConnectedLinks(selectedObjects) {
		var links = [];
		selectedObjects.forEach((selectedObject) => {
			const linksContaining = this.canvasJSON.links.filter(function(link) {
				return (link.srcNodeId === selectedObject.id || link.trgNodeId === selectedObject.id);
			});
			links = _.union(links, linksContaining);
		});
		return links;
	}

	getSelectedNodesAndComments() {
		var objs = [];
		this.canvasJSON.nodes.forEach((node) => {
			if (ObjectModel.getSelectedObjectIds().includes(node.id)) {
				objs.push(node);
			}
		});

		this.canvasJSON.comments.forEach((comment) => {
			if (ObjectModel.getSelectedObjectIds().includes(comment.id)) {
				objs.push(comment);
			}
		});
		return objs;
	}

	stopPropagationAndPreventDefault() {
		d3.event.stopPropagation();
		d3.event.preventDefault();
	}

	consoleLog(msg) {
		console.log(msg);
	}
}
