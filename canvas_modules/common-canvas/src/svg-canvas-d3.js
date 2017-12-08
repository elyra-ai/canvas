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
import CanvasController from "./common-canvas-controller.js";
import ObjectModel from "./object-model/object-model.js";
import _ from "underscore";
import nodeMenuStandardIcon from "../assets/images/canvas_node_icons/node-menu_standard.svg";
import nodeMenuHoverIcon from "../assets/images/canvas_node_icons/node-menu_hover.svg";
import { TIP_TYPE_NODE, TIP_TYPE_PORT, TIP_TYPE_LINK } from "../constants/common-constants.js";

const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;
const A_KEY = 65;
const Y_KEY = 89;
const Z_KEY = 90;
// TODO - Implement nudge behavior for moving nodes and comments
// const LEFT_ARROW_KEY = 37;
// const UP_ARROW_KEY = 38;
// const RIGHT_ARROW_KEY = 39;
// const DOWN_ARROW_KEY = 40;

const showTime = false;

export default class CanvasD3Layout {

	constructor(canvasJSON, canvasSelector, canvasWidth, canvasHeight, config) {

		this.canvasSelector = canvasSelector;
		this.svg_canvas_width = canvasWidth;
		this.svg_canvas_height = canvasHeight;

		// Customization options
		this.connectionType = config.enableConnectionType;
		this.nodeFormatType = config.enableNodeFormatType;
		this.linkType = config.enableLinkType;

		// Our instance ID for adding to DOM element IDs
		this.instanceId = CanvasController.getInstanceId();

		// Initialize dimension and layout variables
		this.initializeLayoutInfo();

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
		this.canvasJSON = this.cloneCanvasInfo(canvasJSON);

		this.createCanvas();
		this.displayCanvas();
	}

	// Initializes the dimensions for nodes, comments layout etc.
	initializeLayoutInfo() {
		if (this.connectionType === "Halo") {
			ObjectModel.setLayoutType("halo");

		} else { // Ports connection type
			if (this.nodeFormatType === "Horizontal") {
				ObjectModel.setLayoutType("ports-horizontal");

			} else { // Vertical
				ObjectModel.setLayoutType("ports-vertical");
			}
		}
		this.layout = ObjectModel.getLayout();
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

			// Both these methods will result in the canvas being refreshed through
			// updates to the object model.
			this.clearCanvas();
			this.initializeLayoutInfo();

		} else {
			// Make a copy of canvasJSON because we will need to update it (when moving
			// nodes and comments and when sizing comments in real time) without updating the
			// canvasJSON in the ObjectModel until we're done.
			this.canvasJSON = this.cloneCanvasInfo(canvasJSON);

			this.displayCanvas();
		}

		this.consoleLog("Set Canvas. Elapsed time = " + (Date.now() - startTime));
	}

	// Copies the canvas info because the canvas info is updated by the d3 code when
	// real time actions are performed like moving nodes or comments or resizing
	// comments.
	cloneCanvasInfo(canvasInfo) {
		return JSON.parse(JSON.stringify(canvasInfo));
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

		this.canvas.selectAll(this.getId("#br_svg_rect")).remove();
		this.canvas.selectAll(this.getId("#br_canvas_rect")).remove();

		this.canvas
			.append("rect")
			.attr("id", this.getId("br_svg_rect"))
			.attr("height", svgRect.height)
			.attr("width", svgRect.width)
			.attr("x", 0)
			.attr("y", 0)
			.style("fill", "none")
			.style("stroke", "black");

		if (canv) {
			this.canvas
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
	}

	// Returns an id string like one of the following:
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
						CanvasController.editActionHandler({ editType: "deleteSelectedObjects", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					} else if (this.isCmndCtrlPressed() && !d3.event.shiftKey && d3.event.keyCode === Z_KEY) {
						this.stopPropagationAndPreventDefault();
						CanvasController.editActionHandler({ editType: "undo" });
					} else if (this.isCmndCtrlPressed() &&
							((d3.event.shiftKey && d3.event.keyCode === Z_KEY) || d3.event.keyCode === Y_KEY)) {
						this.stopPropagationAndPreventDefault();
						CanvasController.editActionHandler({ editType: "redo" });
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
				CanvasController.clickActionHandler({
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
			CanvasController.hideTip();

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

			var ta = d3.select(this.canvasSelector).select(".d3-comment-entry");
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
				ObjectModel.selectInRegion(startX, startY, startX + width, startY + height);
				CanvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "region", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			} else {
				CanvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			}
			this.regionSelect = false;
		} else {
			// If mouse hasn't moved very far we make this equivalent to a click
			// on the canvas.
			if (Math.abs(d3.event.transform.x - this.zoomStartPoint.x) < 2 &&
					Math.abs(d3.event.transform.y - this.zoomStartPoint.y) < 2) {
				this.selecting = true;
				CanvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
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
				CanvasController.editActionHandler({ editType: "zoomCanvas", value: d3.event.transform.k });
			}
		}
	}

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments. The
	// dimensions are scaled by k and padded by pad (if provided).
	getCanvasDimensionsAdjustedForScale(k, pad) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		this.canvas.selectAll(".node-group").each((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.layout.highlightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.layout.highlightGap);
			canvRight = Math.max(canvRight, d.x_pos + d.width + this.layout.highlightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + d.height + this.layout.highlightGap);
		});

		this.canvas.selectAll(".comment-group").each((d) => {
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
				CanvasController.editActionHandler({ editType: "moveObjects", nodes: ObjectModel.getSelectedObjectIds(), offsetX: this.dragOffsetX, offsetY: this.dragOffsetY });
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
				that.canvas.select(that.getId("#node_grp", d.id))
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data
			});
		} else if (this.selecting || this.regionSelect || this.commentSizing) {
			nodeGroupSel.each(function(d) {
				that.canvas.select(that.getId("#node_outline", d.id))
					.attr("data-selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.layout.cssSelectionHighlight)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				// This code will remove custom attributes from a node. This might happen when
				// the user clicks the canvas background to remove the greyed out appearance of
				// a node that was 'cut' to the clipboard.
				// TODO - Remove this code if/when common canvas supports cut (which removes nodes
				// from the canvas) and when WML Canvas uses that clipboard support in place
				// of its own.
				that.canvas.select(that.getId("#node_image", d.id))
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

				that.canvas.select(that.getId("#node_grp", d.id))
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				that.canvas.select(that.getId("#node_outline", d.id))
					.attr("data-selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.layout.cssSelectionHighlight)
					.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

				that.canvas.select(that.getId("#node_image", d.id))
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
					.each(function(nd) {
						if (nd.customAttrs) {
							var imageObj = d3.select(this);
							nd.customAttrs.forEach((customAttr) => {
								imageObj.attr(customAttr, "");
							});
						}
					});

				that.canvas.select(that.getId("#node_label", d.id))
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
					.text(function(nd) {
						var textObj = d3.select(this);
						return that.trimLabelToWidth(nd.label, that.layout.labelWidth, that.layout.cssNodeLabel, textObj);
					})
					.attr("class", function(nd) { return that.layout.cssNodeLabel + " " + that.getMessageLabelClass(nd.messages);
					});

				that.canvas.select(that.getId("#node_error_marker", d.id))
					.datum((nd) => that.getNode(nd.id)) // Set the __data__ to the updated data
					.attr("class", function(nd) { return "node-error-marker " + that.getMessageCircleClass(nd.messages); });
			});

			var newNodeGroups = nodeGroupSel.enter()
				.append("g")
				.attr("id", (d) => that.getId("node_grp", d.id))
				.attr("class", "obj-group node-group")
				.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
				.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					if (that.layout.connectionType === "ports") {
						that.canvas.select(that.getId("#node_body", d.id)).attr("hover", "yes");
						d3.select(this)
							.append("image")
							.attr("id", that.getId("node_ellipsis"))
							.attr("xlink:href", nodeMenuStandardIcon)
							.attr("width", that.layout.ellipsisWidth)
							.attr("height", that.layout.ellipsisHeight)
							.attr("x", that.layout.ellipsisPosX)
							.attr("y", (nd) => that.getEllipsisPosY(nd))
							.on("mouseenter", () => {
								that.canvas.select(that.getId("#node_ellipsis")).attr("xlink:href", nodeMenuHoverIcon);
							})
							.on("mouseleave", () => {
								that.canvas.select(that.getId("#node_ellipsis")).attr("xlink:href", nodeMenuStandardIcon);
							})
							.on("click", () => {
								that.stopPropagationAndPreventDefault();
								that.openContextMenu("node", d);
							});
					}
				})
				.on("mouseleave", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
					that.canvas.select(that.getId("#node_body", d.id)).attr("hover", "no");
					if (that.layout.connectionType === "ports") {
						that.canvas.selectAll(that.getId("#node_ellipsis")).remove();
					}

					CanvasController.hideTip();
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
					CanvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "node", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
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
				.on("mouseover", function(d) {
					if (that.canShowTip(TIP_TYPE_NODE)) {
						CanvasController.showTip({
							id: that.getId("nodeTip", d.id),
							type: TIP_TYPE_NODE,
							targetObj: this,
							pipelineId: that.canvasJSON.sub_id,
							node: d
						});
					}
				})
				.on("dblclick", (d) => {
					this.consoleLog("Node Group - double click");
					d3.event.stopPropagation();
					var selObjIds = ObjectModel.getSelectedObjectIds();
					CanvasController.clickActionHandler({ clickType: "DOUBLE_CLICK", objectType: "node", id: d.id, selectedObjectIds: selObjIds });
				})
				.on("contextmenu", (d) => {
					this.consoleLog("Node Group - context menu");
					this.stopPropagationAndPreventDefault();
					that.openContextMenu("node", d);
				})
				.call(this.drag); // Must put drag after mousedown listener so mousedown gets called first.

			// Node selection highlighting outline for new nodes, flexible properties set in next step
			if (this.layout.nodeShape === "port-arcs") {
				newNodeGroups.append("path")
					.attr("id", (d) => this.getId("node_outline", d.id));

				newNodeGroups.append("path")
					.attr("id", (d) => this.getId("node_body", d.id))
					.style("filter", `url(${this.getId("#node_drop_shadow")})`);


			} else { // simple rectangle
				newNodeGroups.append("rect")
					.attr("id", (d) => this.getId("node_outline", d.id));

				newNodeGroups.append("rect")
					.attr("id", (d) => this.getId("node_body", d.id));

			}

			var newAndExistingNodes = nodeGroupSel.enter().merge(nodeGroupSel);

			newAndExistingNodes
				.each((d) => {
					// Node selection highlighting: set flexible properties
					if (this.layout.nodeShape === "port-arcs") {
						that.canvas.select(that.getId("#node_grp", d.id)).select(that.getId("#node_outline", d.id))
							.attr("d", (cd) => this.getNodeShapePath(cd))
							.attr("transform", (cd) => this.getNodeHighlightOutlineTranslate(cd)) // Scale and move the shape up and to the left to account for the padding
							.attr("data-selected", function(cd) { return ObjectModel.isSelected(cd.id) ? "yes" : "no"; })
							.attr("class", this.layout.cssSelectionHighlight);
					} else { // simple rectangle
						that.canvas.select(that.getId("#node_grp", d.id)).select(that.getId("#node_outline", d.id))
							.attr("width", (cd) => cd.width + (2 * this.layout.highlightGap))
							.attr("height",
								(cd) => cd.height + (2 * this.layout.highlightGap))
							.attr("x", -this.layout.highlightGap)
							.attr("y", -this.layout.highlightGap)
							.attr("data-selected", function(cd) { return ObjectModel.isSelected(cd.id) ? "yes" : "no"; })
							.attr("class", this.layout.cssSelectionHighlight);
					}

					// node layout: set flexible properties
					if (this.layout.connectionType === "ports") {
						// Node body updates
						if (this.layout.nodeShape === "port-arcs") {
							that.canvas.select(that.getId("#node_grp", d.id)).select(that.getId("#node_body", d.id))
								.attr("d", (cd) => this.getNodeShapePath(cd))
								.attr("class", (cd) => this.getNodeBodyClass(cd));
						} else {
							that.canvas.select(that.getId("#node_grp", d.id)).select(that.getId("#node_body", d.id))
								.attr("width", (cd) => cd.width)
								.attr("height", (cd) => cd.height)
								.attr("x", 0)
								.attr("y", 0)
								.attr("class", (cd) => this.getNodeBodyClass(cd));
						}

						// Input ports
						if (d.input_ports && d.input_ports.length > 0) {
							const inputPortPositions = this.getPortPositions(d, "input");

							var inputPortSelection = that.canvas.select(that.getId("#node_grp", d.id)).selectAll("." + this.layout.cssNodePortInput)
								.data(d.input_ports, function(p) { return p.id; });

							// input port circle
							inputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => this.getId("node_trg_port", d.id, port.id))
								.attr("portId", (port) => port.id) // This is needed by getNodeInputPortAtMousePos
								.attr("cx", 0)
								.attr("r", this.layout.portRadius)
								.attr("connected", "no")
								.on("mouseover", function(port) {
									that.stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										CanvasController.hideTip();
										CanvasController.showTip({
											id: that.getId("portTip", port.id),
											type: TIP_TYPE_PORT,
											targetObj: this,
											pipelineId: that.canvasJSON.sub_id,
											node: d,
											port: port
										});
									}
								})
								.on("mouseout", (port) => {
									CanvasController.hideTip();
								})
								.merge(inputPortSelection)	// for new and existing port circles, update cy, datum and class
								.attr("cy", (port) => inputPortPositions[port.id])
								.attr("class", (port) =>
									this.layout.cssNodePortInput + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => that.getNodePort(d.id, port.id, "input"));

							// input port arrow in circle
							inputPortSelection.enter()
								.append("path")
								.attr("id", (port) => this.getId("node_trg_port_arrow", d.id, port.id))
								.attr("class", this.layout.cssNodePortInputArrow)
								.attr("connected", "no")
								.on("mouseover", function(port) {
									that.stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										CanvasController.showTip({
											id: that.getId("portTip", port.id),
											type: TIP_TYPE_PORT,
											targetObj: this,
											pipelineId: that.canvasJSON.sub_id,
											node: d,
											port: port
										});
									}
								})
								.on("mouseout", (port) => {
									CanvasController.hideTip();
								});

							// update arrow in circle for new and existing ports
							that.canvas.select(that.getId("#node_grp", d.id)).selectAll("." + this.layout.cssNodePortInputArrow)
								.attr("d", (port) => this.getArrowShapePath(inputPortPositions[port.id]));

							inputPortSelection.exit().remove();
						}

						// Output ports
						if (d.output_ports && d.output_ports.length > 0) {
							const outputPortPositions = this.getPortPositions(d, "output");

							var outputPortSelection = this.canvas.select(this.getId("#node_grp", d.id))
								.selectAll("." + this.layout.cssNodePortOutput)
								.data(d.output_ports, function(p) { return p.id; });

							outputPortSelection.enter()
								.append("circle")
								.attr("id", (port) => this.getId("node_src_port", d.id, port.id))
								.attr("r", this.layout.portRadius)
								.attr("class", (port) => this.layout.cssNodePortOutput + (port.class_name ? " " + port.class_name : ""))
								.on("mousedown", (port) => {
									// Make sure this is just a left mouse button click - we don't want context menu click starting a line being drawn
									if (d3.event.button === 0) {
										this.stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
										this.drawingNewLink = true;
										this.drawingNewLinkSrcId = d.id;
										this.drawingNewLinkSrcPortId = port.id;
										this.drawingNewLinkAction = "node-node";
										const node = this.getNodeAtMousePos();
										this.drawingNewLinkStartPos = { x: node.x_pos + node.width, y: node.y_pos + outputPortPositions[port.id] };
										this.drawingNewLinkArray = [];
										this.drawNewLink();
									}
								})
								.on("mouseover", function(port) {
									that.stopPropagationAndPreventDefault(); // stop event propagation, otherwise node tip is shown
									if (that.canShowTip(TIP_TYPE_PORT)) {
										CanvasController.hideTip();
										CanvasController.showTip({
											id: that.getId("portTip", port.id),
											type: TIP_TYPE_PORT,
											targetObj: this,
											pipelineId: that.canvasJSON.sub_id,
											node: d,
											port: port
										});
									}
								})
								.on("mouseout", (port) => {
									CanvasController.hideTip();
								})
								.merge(outputPortSelection)	// update cx, class and cy for existing output ports
								.attr("cx", (port) => d.width)
								.attr("cy", (port) => outputPortPositions[port.id])
								.attr("class", (port) => this.layout.cssNodePortOutput + (port.class_name ? " " + port.class_name : ""))
								.datum((port) => this.getNodePort(d.id, port.id, "output"));

							outputPortSelection.exit().remove();
						}
					}
				});

			// Image outline - this code used for debugging purposes
			// newNodeGroups.append("rect")
			// 	.attr("width", this.layout.imageWidth)
			// 	.attr("height", this.layout.imageHeight)
			// 	.attr("x", this.layout.imagePosX)
			// 	.attr("y", this.layout.imagePosY)
			// 	.attr("class", "d3-node-image-outline");

			// Node image
			newNodeGroups.append("image")
				.attr("id", (d) => this.getId("node_image", d.id))
				.attr("xlink:href", (d) => d.image)
				.attr("width", this.layout.imageWidth)
				.attr("height", this.layout.imageHeight)
				.attr("x", this.layout.imagePosX)
				.attr("class", "node-image");

			// set y and custom attribures for node image in new and existing nodes
			newNodeGroups.merge(nodeGroupSel).selectAll(".node-image")
				.attr("y", (d) => this.getImagePosY(d))
				.each(function(d) {
					if (d.customAttrs) {
						var imageObj = d3.select(this);
						d.customAttrs.forEach((customAttr) => {
							imageObj.attr(customAttr, "");
						});
					}
				});

			// Label outline - this code used for debugging purposes
			// newNodeGroups.append("rect")
			// 	.attr("width", this.layout.labelWidth)
			// 	.attr("height", this.layout.labelHeight)
			// 	.attr("x", this.layout.labelPosX)
			// 	.attr("y", (d) => this.getLabelPosY(d))
			// 	.attr("class", "d3-label-outline");

			// Label
			newNodeGroups.append("text")
				.text(function(d) {
					var textObj = d3.select(this);
					return that.trimLabelToWidth(d.label, that.layout.labelWidth, that.layout.cssNodeLabel, textObj);
				})
				.attr("id", (d) => that.getId("node_label", d.id))
				.attr("class", (d) => that.layout.cssNodeLabel + " " + that.getMessageLabelClass(d.messages))
				.attr("x", this.layout.labelHorizontalJustification === "left" // If not "left" then "center"
					? this.layout.labelPosX : this.layout.labelPosX + (this.layout.labelWidth / 2))
				.attr("text-anchor", this.layout.labelHorizontalJustification === "left" ? "start" : "middle")
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

			// set y for node label in new and existing nodes
			newNodeGroups.merge(nodeGroupSel).selectAll("." + this.layout.cssNodeLabel)
				.attr("y", (d) => this.getLabelPosY(d) + this.layout.labelHeight - this.layout.labelDescent);

			// Halo
			if (this.layout.connectionType === "halo") {
				newNodeGroups.append("circle")
					.attr("id", (d) => this.getId("node_halo", d.id))
					.attr("class", "d3-node-halo")
					.attr("cx", this.layout.haloCenterX)
					.attr("cy", this.layout.haloCenterY)
					.attr("r", this.layout.haloRadius)
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
			newNodeGroups.append("circle")
				.attr("id", (d) => that.getId("node_error_marker", d.id))
				.attr("class", (d) => "node-error-marker " + that.getMessageCircleClass(d.messages))
				.attr("cx", this.layout.errorCenterX)
				.attr("r", this.layout.errorRadius);

			// set cy for error circle in new and existing nodes
			newNodeGroups.merge(nodeGroupSel).selectAll(".node-error-marker")
				.attr("cy", (d) => this.getErrorPosY(d));

			// Decorators
			this.addDecorator(newNodeGroups, "topLeft", this.layout.decoratorLeftX, this.layout.decoratorTopY);
			this.addDecorator(newNodeGroups, "topRight", this.layout.decoratorRightX, this.layout.decoratorTopY);
			this.addDecorator(newNodeGroups, "bottomLeft", this.layout.decoratorLeftX, this.layout.decoratorBottomY);
			this.addDecorator(newNodeGroups, "bottomRight", this.layout.decoratorRightX, this.layout.decoratorBottomY);

			// Remove any nodes that are no longer in the diagram.nodes array.
			nodeGroupSel.exit().remove();
		}
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

	getLabelPosY(data) {
		if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.labelHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				var imageLabelGap = this.layout.labelPosY - (this.layout.imagePosY + this.layout.imageHeight);
				return (data.height / 2) + ((this.layout.imageHeight + this.layout.labelHeight + imageLabelGap) / 2) - this.layout.labelHeight;
			}
		}

		return this.layout.labelPosY;
	}

	getErrorPosY(data) {
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

	getEllipsisPosY(data) {
		if (this.layout.labelAndIconVerticalJustification === "center") {
			if (this.layout.nodeFormatType === "horizontal") {
				return (data.height / 2) - (this.layout.ellipsisHeight / 2);

			} else if (this.layout.nodeFormatType === "vertical") {
				return this.getImagePosY(data) - (this.layout.ellipsisPosY - this.layout.imagePosY);
			}
		}
		return this.layout.ellipsisPosY;
	}

	openContextMenu(type, d) {
		this.stopPropagationAndPreventDefault(); // Stop the browser context menu appearing
		CanvasController.contextMenuHandler({
			type: type,
			targetObject: type === "canvas" ? null : d,
			id: type === "canvas" ? null : d.id, // For historical puposes, we pass d.id as well as d as targetObject.
			cmPos: this.getMousePos(),
			mousePos: this.getTransformedMousePos(),
			selectedObjectIds: ObjectModel.getSelectedObjectIds(),
			zoom: this.zoomTransform.k });
	}

	setTrgPortStatus(trgId, trgPortId, newStatus) {
		this.canvas.select(this.getId("#node_trg_port", trgId, trgPortId)).attr("connected", newStatus);
		this.canvas.select(this.getId("#node_trg_port_arrow", trgId, trgPortId)).attr("connected", newStatus);
	}

	setSrcPortStatus(srcId, srcPortId, newStatus) {
		this.canvas.select(this.getId("#node_src_port", srcId, srcPortId)).attr("connected", newStatus);
	}

	// Adds a decorator to the nodeGroup passed in of the type passed in at the
	// x and y position provided.
	addDecorator(nodeGroup, type, x, y) {
		var decGrp = nodeGroup.filter((d) => this.isDecoration(d, type));

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
		if (CanvasController.decorationActionHandler) {
			var id = this.getDecoratorId(d, type);
			CanvasController.decorationActionHandler(d, id);
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

		this.canvas.selectAll("." + this.layout.cssNewConnectionLine)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", this.layout.cssNewConnectionLine)
			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.layout.cssNewConnectionStart)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x1)
			.attr("cy", (d) => d.y1)
			.attr("r", this.layout.portRadius)
			.attr("class", this.layout.cssNewConnectionStart)
			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.layout.cssNewConnectionBlob)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.layout.portRadius)
			.attr("class", this.layout.cssNewConnectionBlob)
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

		this.canvas.selectAll("." + this.layout.cssNewConnectionLine)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("path")
			.attr("d", (d) => that.getConnectorPath(d))
			.attr("class", this.layout.cssNewConnectionLine)
			.attr("linkType", linkType);

		this.canvas.selectAll("." + this.layout.cssNewConnectionBlob)
			.data(this.drawingNewLinkArray)
			.enter()
			.append("circle")
			.attr("cx", (d) => d.x2)
			.attr("cy", (d) => d.y2)
			.attr("r", this.layout.commentPortRadius)
			.attr("class", this.layout.cssNewConnectionBlob)
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

		if (this.layout.commentLinkArrowHead) {
			this.canvas.selectAll("." + this.layout.cssNewConnectionArrow)
				.data(this.drawingNewLinkArray)
				.enter()
				.append("path")
				.attr("d", (d) => this.getArrowHead(d))
				.attr("class", this.layout.cssNewConnectionArrow)
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
	}

	completeNewLink(trgNode) {
		// If we completed a connection remove the new line objects.
		this.removeNewLink();

		if (trgNode !== null) {
			if (this.drawingNewLinkAction === "node-node") {
				var trgPortId = this.getNodeInputPortAtMousePos();
				trgPortId = trgPortId || (trgNode.input_ports && trgNode.input_ports.length > 0 ? trgNode.input_ports[0].id : null);
				this.consoleLog("editActionHandler - linkNodes");
				CanvasController.editActionHandler({
					editType: "linkNodes",
					nodes: [{ "id": this.drawingNewLinkSrcId, "portId": this.drawingNewLinkSrcPortId }],
					targetNodes: [{ "id": trgNode.id, "portId": trgPortId }],
					linkType: "data" });
			} else {
				this.consoleLog("editActionHandler - linkComment");
				CanvasController.editActionHandler({
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

		this.canvas.selectAll("." + this.layout.cssNewConnectionLine)
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.canvas.selectAll("." + this.layout.cssNewConnectionArrow).remove();

				this.canvas.selectAll("." + this.layout.cssNewConnectionBlob)
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("cx", saveX1)
					.attr("cy", saveY1);

				this.canvas.selectAll("." + this.layout.cssNewConnectionLine)
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
			this.canvas.selectAll(".d3-node-connector").remove();
		} else {
			this.canvas.selectAll("." + this.layout.cssNewConnectionLine).remove();
			this.canvas.selectAll("." + this.layout.cssNewConnectionStart).remove();
			this.canvas.selectAll("." + this.layout.cssNewConnectionBlob).remove();
			this.canvas.selectAll("." + this.layout.cssNewConnectionArrow).remove();
		}
	}

	getNodeAtMousePos() {
		const that = this;
		var pos = this.getTransformedMousePos();
		var node = null;
		this.canvas.selectAll(".node-group")
			.each(function(d) {
				if (pos.x >= d.x_pos - that.layout.portRadius && // Target port sticks out by its radius so need to allow for it.
						pos.x <= d.x_pos + d.width + that.layout.portRadius &&
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
			this.canvas.select(this.getId("#node_grp", node.id)).selectAll("." + this.layout.cssNodePortInput)
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
	getNodeShapePath(data) {
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
				path += " L 0 0"; // Draw finishing segment back to origin
			}
		} else {
			path += " L 0 0"; // If no input ports just draw a straight line.
		}
		// console.log("Node path = " + path);
		return path;
	}

	getNodeHighlightOutlineTranslate(data) {
		const targetHeight = data.height + (2 * this.layout.highlightGap);
		const yScale = targetHeight / data.height;

		const targetWidth = data.width + (2 * this.layout.highlightGap);
		const xScale = targetWidth / data.width;

		return `translate (${-this.layout.highlightGap},${-this.layout.highlightGap}) scale(${xScale}, ${yScale})`;
	}

	getPortPositions(data, type) {
		const portPositions = {};
		var ports;
		if (type === "input") {
			ports = data.input_ports;
		} else {
			ports = data.output_ports;
		}

		if (data.height <= this.layout.defaultNodeHeight &&
				ports.length === 1) {
			portPositions[ports[0].id] = this.layout.portPosY;

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

			ports.forEach((p) => {
				centerPoint += this.layout.portArcRadius;
				portPositions[p.id] = centerPoint;
				centerPoint += this.layout.portArcRadius + this.layout.portArcSpacing;
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
				that.canvas.select(that.getId("#comment_grp", d.id))
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data
			});
		} else if (this.selecting || this.regionSelect) {
			commentGroupSel.each(function(d) {
				// Comment selection highlighting and sizing outline
				that.canvas.select(that.getId("#comment_outline", d.id))
					.attr("height", d.height + (2 * that.layout.highlightGap))
					.attr("width", d.width + (2 * that.layout.highlightGap))
					.attr("data-selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.layout.cssSelectionHighlight)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// This code will remove custom attributes from a comment. This might happen when
				// the user clicks the canvas background to remove the greyed out appearance of
				// a comment that was 'cut' to the clipboard.
				// TODO - Remove this code if/when common canvas supports cut (which removes comments
				// from the canvas) and when WML Canvas uses that clipboard support in place
				// of its own.
				that.canvas.select(that.getId("#comment_body", d.id))
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
				that.canvas.select(that.getId("#comment_grp", d.id))
					.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Comment selection highlighting and sizing outline
				that.canvas.select(that.getId("#comment_outline", d.id))
					.attr("height", d.height + (2 * that.layout.highlightGap))
					.attr("width", d.width + (2 * that.layout.highlightGap))
					.attr("data-selected", ObjectModel.isSelected(d.id) ? "yes" : "no")
					.attr("class", that.layout.cssSelectionHighlight)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Clip path for text
				that.canvas.select(`#comment_clip__path_${d.id}`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Clip rectangle for text
				that.canvas.select(that.getId("#comment_clip_rect", d.id))
					.attr("height", d.height - (2 * that.layout.commentHeightPadding))
					.attr("width", d.width - (2 * that.layout.commentWidthPadding))
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

				// Background rectangle for comment
				that.canvas.select(that.getId("#comment_body", d.id))
					.attr("height", d.height)
					.attr("width", d.width)
					.attr("class", (cd) => that.getCommentRectClass(cd))
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
				that.canvas.select(that.getId("#comment_text", d.id))
					.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
					.attr("beingedited", that.editingCommentId === d.id ? "yes" : "no") // Use the beingedited css style to make text transparent
					.each(function(cd) {
						var textObj = d3.select(this);
						textObj.selectAll("tspan").remove();
						that.displayWordWrappedText(textObj, cd.content, cd.width - (2 * that.layout.commentWidthPadding));
					});

				// Comment halo
				if (that.layout.connectionType === "halo") {
					that.canvas.select(that.getId("#comment_halo", d.id))
						.attr("width", d.width + (2 * that.layout.haloCommentGap))
						.attr("height", d.height + (2 * that.layout.haloCommentGap))
						.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data
				}
			});

			var newCommentGroups = commentGroupSel.enter()
				.append("g")
				.attr("id", (d) => this.getId("comment_grp", d.id))
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
					// CanvasController.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "comment", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					this.selecting = false;
					this.consoleLog("Comment Group - finished mouse down");
				})
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
								that.stopPropagationAndPreventDefault(); // Stops the node drag behavior when clicking on the handle/circle
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
						that.canvas.selectAll(that.getId("#comment_port")).remove();
					}
				})
				.on("dblclick", function(d) { // Use function keyword so 'this' pointer references the DOM text object
					that.consoleLog("Comment Group - double click");
					that.stopPropagationAndPreventDefault();

					that.canvas.select(that.getId("#comment_text", d.id)) // Make SVG text invisible when in edit mode.
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

					d3.select(that.canvasSelector)
						.append("textarea")
						.attr("id",	that.getId("comment_text_area", id))
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
					document.getElementById(that.getId("comment_text_area", id)).focus();
					CanvasController.clickActionHandler({ clickType: "DOUBLE_CLICK", objectType: "comment", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
				})
				.on("contextmenu", (d) => {
					this.consoleLog("Comment Group - context menu");
					this.openContextMenu("comment", d);
				})
				.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

			// Comment selection highlighting and sizing outline
			newCommentGroups.append("rect")
				.attr("id", (d) => this.getId("comment_outline", d.id))
				.attr("width", (d) => d.width + (2 * this.layout.highlightGap))
				.attr("height", (d) => d.height + (2 * this.layout.highlightGap))
				.attr("x", -this.layout.highlightGap)
				.attr("y", -this.layout.highlightGap)
				.attr("data-selected", function(d) { return ObjectModel.isSelected(d.id) ? "yes" : "no"; })
				.attr("class", this.layout.cssSelectionHighlight)
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
			newCommentGroups.append("rect")
				.attr("id", (d) => this.getId("comment_body", d.id))
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
				.attr("beingedited", "no")
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
					.attr("x", 0 - this.layout.haloCommentGap)
					.attr("y", 0 - this.layout.haloCommentGap)
					.attr("width", (d) => d.width + (2 * this.layout.haloCommentGap))
					.attr("height", (d) => d.height + (2 * this.layout.haloCommentGap))
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
			d3.select(this.canvasSelector).select(this.getId("#comment_text_area", datum.id))
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
				width: this.removePx(textArea.style.width),
				height: this.removePx(textArea.style.height),
				offsetX: this.removePx(textArea.style.left),
				offsetY: this.removePx(textArea.style.top)
			};
			this.consoleLog("editActionHandler - editComment");
			CanvasController.editActionHandler(data);
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
		this.canvas.select(this.getId("#comment_outline", id)).style("cursor", cursor);
	}

	// Returns the comment sizing direction (i.e. one of n, s, e, w, nw, ne,
	// sw or se) based on the current mouse position and the position and
	// dimensions of the comment box.
	getCommentSizingDirection(d) {
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

		this.canvas.select(this.getId("#comment_grp", this.commentSizingId)).remove();
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
		CanvasController.editActionHandler(data);
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
		// this.consoleLog("Displaying links");
		var startTimeDrawingLines = Date.now();
		const that = this;

		if (this.selecting || this.regionSelect) {
			// no lines update needed when selecting objects/region
			return;
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
			.attr("id", (d) => this.getId("link_grp", d.id))
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
			})
			.on("mouseover", function(link) {
				if (that.canShowTip(TIP_TYPE_LINK)) {
					CanvasController.showTip({
						id: that.getId("linkTip", link.id),
						type: TIP_TYPE_LINK,
						targetObj: this,
						mousePos: { x: d3.event.x, y: d3.event.y },
						pipelineId: that.canvasJSON.sub_id,
						link: link
					});
				}
			})
			.on("mouseout", (d) => {
				CanvasController.hideTip();
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

		// Arrow within input port
		if (this.layout.connectionType === "ports") {
			this.canvas.selectAll("." + this.layout.cssNodePortOutput).attr("connected", "no");
			this.canvas.selectAll("." + this.layout.cssNodePortInput).attr("connected", "no");
			this.canvas.selectAll("." + this.layout.cssNodePortInputArrow).attr("connected", "no");
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
		// If the data has a classname that isn't the historical default use it!
		if (d.class_name && d.class_name !== "canvas-data-link" && d.class_name !== "d3-data-link") {
			return d.class_name;
		}
		// If the class name provided IS the historical default, or there is no classname, return
		// the class name from the layout preferences. This allows the layout
		// preferences to override any default class name passed in.
		return this.layout.cssDataLink;
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
		this.canvas.selectAll(".link-group").lower(); // Moves link lines below other SVG elements

		// We push comments to the back in the reverse order they were added to the
		// comments array. This is to ensure that pasted comments get displayed on
		// top of previously existing comments.
		const comments = ObjectModel.getComments();

		for (var idx = comments.length - 1; idx > -1; idx--) {
			this.canvas.select(this.getId("#comment_grp", comments[idx].id)).lower();
		}
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
		var srcY = this.layout.portPosY;
		var trgY = this.layout.portPosY;

		if (srcNode.output_ports && srcNode.output_ports.length > 0) {
			const outputPortPositions = this.getPortPositions(srcNode, "output");
			if (outputPortPositions[srcPortId]) {
				srcY = outputPortPositions[srcPortId];
			}
		}

		if (trgNode.input_ports && trgNode.input_ports.length > 0) {
			const inputPortPositions = this.getPortPositions(trgNode, "input");
			if (inputPortPositions[trgPortId]) {
				trgY = inputPortPositions[trgPortId];
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
		if (this.layout.connectionType === "ports" &&
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
		let elbowYOffset = this.layout.elbowSize;

		if (yDiff > (2 * this.layout.elbowSize)) {
			elbowYOffset = this.layout.elbowSize;
		}
		else if (yDiff < -(2 * this.layout.elbowSize)) {
			elbowYOffset = -this.layout.elbowSize;
		}
		else {
			elbowYOffset = yDiff / 2;
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
		else {
			elbowXOffset = this.layout.elbowSize;
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

	canShowTip(tipType) {
		return CanvasController.isTipEnabled(tipType) &&
			!this.selecting && !this.regionSelect && !this.dragging &&
			!this.commentSizing && !this.drawingNewLink;
	}

	consoleLog(msg) {
		console.log(msg);
	}
}
