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

export default class CanvasD3Layout {

	constructor(canvasJSON, canvasSelector, canvasWidth, canvasHeight,
							editActionHandler, contextMenuHandler, clickActionHandler,
							decorationActionHandler, config) {
		// Make a copy of canvasJSON because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasJSON in the ObjectModel until we're done.
		this.canvasJSON = this.cloneCanvasJSON(canvasJSON);
		this.canvasSelector = canvasSelector;
		this.svg_canvas_width = canvasWidth;
		this.svg_canvas_height = canvasHeight;
		this.editActionHandler = editActionHandler;
		this.contextMenuHandler = contextMenuHandler;
		this.clickActionHandler = clickActionHandler;
		this.decorationActionHandler = decorationActionHandler;

		// Customization options
		this.connectionType = config.enableConnectionType;
		this.linkType = config.enableLinkType;

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

		// Placeholder to save transform info as we are zooming
		this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1);

		// Allows us to record the start point of the current zoom.
		this.zoomStartPoint = { x: 0, y: 0, k: 0 };

		// Center position of text area used for editing comments. These are used
		// when zooming a text area.
		this.zoomTextAreaCenterX = 0;
		this.zoomTextAreaCenterY = 0;


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

		this.initializeDimensions();
		this.createCanvas();
		this.displayCanvas();
	}

	// Initializes the dimensions for nodes, comments layout etc.
	initializeDimensions() {
		// Specify and calculate some sizes of components of a node
		this.imageWidth = 48;
		this.imageHeight = 48;

		if (this.connectionType === "Halo") {
			this.imagePaddingWidth = 6;
			this.imageUpperPaddingHeight = 0;
			this.imageLowerPaddingHeight = 2;
			this.labelPaddingHeight = 4;
			this.labelHeight = 12;
			this.labelPaddingWidth = -4;
			// The gap between a node or comment and its selection highlight rectangle
			this.highLightGap = 4;
			// The gap between node or comment and the link line.
			this.linkGap = 7;

		} else {
			this.imagePaddingWidth = 10;
			this.imageUpperPaddingHeight = 5;
			this.imageLowerPaddingHeight = 2;
			this.labelPaddingHeight = 8;
			this.labelHeight = 12;
			this.labelPaddingWidth = 2;
			// The gap between a node or comment and its selection highlight rectangle
			this.highLightGap = 4;
			// The gap between node or comment and the link line.
			this.linkGap = 7;
		}

		this.decoratorHeight = 12;
		this.decoratorWidth = 12;

		this.portRadius = 6;
		this.haloCommentGap = 11; // Gap between comment rectangle and its halo
		this.haloNodeGap = 5;     // Gap between node image and its halo

		this.nodeWidth = this.imageWidth + (2 * this.imagePaddingWidth);
		this.nodeHeight = this.imageUpperPaddingHeight + this.imageHeight + this.imageLowerPaddingHeight + this.labelHeight + this.labelPaddingHeight;

		this.haloCenterX = this.nodeWidth / 2;
		this.haloCenterY = this.imageUpperPaddingHeight + (this.imageHeight / 2);
		this.haloRadius = (this.imageWidth / 2) + this.haloNodeGap;

		this.imagePosX = this.imagePaddingWidth;
		this.imagePosY = this.imageUpperPaddingHeight;

		this.labelWidth = this.nodeWidth - (2 * this.labelPaddingWidth);

		this.labelOutlineX = this.labelPaddingWidth;
		this.labelOutlineY = this.imageUpperPaddingHeight + this.imageHeight + this.imageLowerPaddingHeight;

		this.labelPosX = this.labelPaddingWidth + (this.labelWidth / 2);
		this.labelPosY = this.imageUpperPaddingHeight + this.imageHeight + this.imageLowerPaddingHeight + this.labelHeight;

		this.portPosY = this.imageUpperPaddingHeight + (this.imageHeight / 2);

		this.topDecoratorY = this.imageUpperPaddingHeight;
		this.bottomDecoratorY = this.imageUpperPaddingHeight + this.imageHeight - this.decoratorHeight;

		this.leftDecoratorX = this.imagePaddingWidth;
		this.rightDecoratorX = this.imagePaddingWidth + this.imageWidth - this.decoratorWidth;

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

	setCanvas(canvasJSON, config) {
		this.consoleLog("Set Canvas. Id = " + canvasJSON.id);
		var startTime = Date.now();
		if (canvasJSON.id !== this.canvasJSON.id ||
				this.connectionType !== config.enableConnectionType ||
				this.linkType !== config.enableLinkType) {
			this.connectionType = config.enableConnectionType;
			this.linkType = config.enableLinkType;
			this.clearCanvas();
		}
		// Make a copy of canvasJSON because we will need to update it (when moving
		// nodes and comments and when sizing comments in real time) without updating the
		// canvasJSON in the ObjectModel until we're done.
		this.canvasJSON = this.cloneCanvasJSON(canvasJSON);
		// this.zoomTransform = d3.zoomIdentity.translate(0, 0).scale(1); // Reset zoom parameters
		this.initializeDimensions();
		this.displayCanvas();
		this.consoleLog("Set Canvas. Elapsed time = " + (Date.now() - startTime));
	}

		// Copies the canvas JSON because the canvas info is updated by the d3 code when
	// real time actions are performed like moving nodes or comments or resizing
	// comments.
	cloneCanvasJSON(canvasJSON) {
		return JSON.parse(JSON.stringify(canvasJSON));
	}

	clearCanvas() {
		this.consoleLog("Clearing Canvas. Id = " + this.canvasJSON.id);
		ObjectModel.clearSelection();
		this.canvas.selectAll("g").remove();
		this.canvasSVG.call(this.zoom.transform, d3.zoomIdentity); // Reset the SVG zoom and scale
	}

	displayCanvas() {
		// this.consoleLog("Displaying Canvas. Id = " + this.canvasJSON.id);
		this.displayComments(); // Show comments first so they appear under nodes, if there is overlap.
		this.displayNodes();
		this.drawLines();
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

	zoomIn() {
		if (this.zoomTransform.k < this.maxScaleExtent) {
			// const zoomSvgRect = this.canvasSVG.node().getBoundingClientRect();
			var newScale = Math.min(this.zoomTransform.k + 0.2, this.maxScaleExtent);

			this.zoomTransform = d3.zoomIdentity
				// .translate(100, 100);
				.scale(newScale);
			this.canvas
			//  .transition()
			// 	.duration(500)
				.call(this.zoom.transform, this.zoomTransform);
		}
	}

	zoomOut() {
		if (this.zoomTransform.k > this.minScaleExtent) {
		// 	const zoomSvgRect = this.canvasSVG.node().getBoundingClientRect();
			var newScale = Math.max(this.zoomTransform.k - 0.2, this.minScaleExtent);
			this.zoomTransform = d3.zoomIdentity
		// 	.translate(100, 100)
				.scale(newScale);
			this.canvas
				// .transition()
				// .duration(500)
				.call(this.zoom.transform, this.zoomTransform);
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
	getMousePos() {
		const mousePos = d3.mouse(this.canvasSVG.node());
		return { x: mousePos[0], y: mousePos[1] };
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
		const node = this.canvasJSON.diagram.nodes.find((nd) => nd.id === nodeId);
		return (typeof node === "undefined") ? null : node;
	}

	getComment(commentId) {
		const comment = this.canvasJSON.diagram.comments.find((com) => com.id === commentId);
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

		this.canvasSVG = d3.select(this.canvasSelector)
			.append("svg")
				.attr("width", this.svg_canvas_width)
				.attr("height", this.svg_canvas_height)
				.attr("class", "svg-area")
				.call(this.zoom)
				// .on("mousedown.zoom", () => {
				// 	this.consoleLog("Zoom - mousedown");
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
					d3.event.preventDefault();  // Stop the browser context menu appearing
					this.contextMenuHandler({
						type: "canvas",
						cmPos: this.getMousePos(),
						mousePos: this.getTransformedMousePos(),
						selectedObjectIds: ObjectModel.getSelectedObjectIds(),
						zoom: this.zoomTransform.k });
				});

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

	zoomStart() {
		this.consoleLog("Zoom start - x = " + d3.event.transform.x + " y = " + d3.event.transform.y);

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
		// this.consoleLog("Zoom action - x = " + d3.event.transform.x + " y = " + d3.event.transform.y);
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
		this.consoleLog("Zoom end - x = " + d3.event.transform.x + " y = " + d3.event.transform.y);

		if (this.drawingNewLink) {
			this.stopDrawingNewLink();
			this.drawingNewLink = false;
		}

		if (this.regionSelect === true) {
			this.regionSelect = false;

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
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "region", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			} else {
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
			}
		} else {
			// If mouse hasn't moved very far we make this equivalent to a click
			// on the canvas.
			if (Math.abs(d3.event.transform.x - this.zoomStartPoint.x) < 2 &&
					Math.abs(d3.event.transform.y - this.zoomStartPoint.y) < 2) {
				this.clickActionHandler({ clickType: "SINGLE_CLICK", objectType: "canvas", selectedObjectIds: ObjectModel.getSelectedObjectIds() });
				// TODO - The decision to clear selection (commented out code below) is currently made by common-canvas
				// This 'to do' is to move that decision from there to here. To do that we need to have a callback function
				// to the ask the react code if a context menu is currently on display or not.
				// if (ObjectModel.getSelectedObjectIds().length > 0) {
				// 	ObjectModel.clearSelection();
				// }
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

	// Returns the dimensions in SVG coordinates of the canvas area. This is
	// based on the position and width and height of the nodes and comments.
	getCanvasDimensionsAdjustedForScale(k) {
		var canvLeft = Infinity;
		let canvTop = Infinity;
		var canvRight = -Infinity;
		var canvBottom = -Infinity;

		d3.selectAll(".node-group").each((d) => {
			canvLeft = Math.min(canvLeft, d.x_pos - this.highLightGap);
			canvTop = Math.min(canvTop, d.y_pos - this.highLightGap);
			canvRight = Math.max(canvRight, d.x_pos + this.nodeWidth + this.highLightGap);
			canvBottom = Math.max(canvBottom, d.y_pos + this.nodeHeight + this.highLightGap);
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

		return {
			left: canvLeft * k,
			top: canvTop * k,
			right: canvRight * k,
			bottom: canvBottom * k,
			width: canvWidth * k,
			height: canvHeight * k
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
		this.consoleLog("Drag start");
		this.dragging = true;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		// Note: Comment resizing is started by the comment highlight rectangle.
	}

	dragMove() {
		// this.consoleLog("Drag move");
		if (this.commentSizing) {
			this.resizeComment();
		} else if (this.dragging) {
			this.dragOffsetX += d3.event.dx;
			this.dragOffsetY += d3.event.dy;

			var objs = [];
			this.canvasJSON.diagram.nodes.forEach((node) => {
				if (ObjectModel.getSelectedObjectIds().includes(node.id)) {
					objs.push(node);
				}
			});

			this.canvasJSON.diagram.comments.forEach((comment) => {
				if (ObjectModel.getSelectedObjectIds().includes(comment.id)) {
					objs.push(comment);
				}
			});

			objs.forEach(function(d) {
				d.x_pos += d3.event.dx;
				d.y_pos += d3.event.dy;
			});

			this.displayNodes();
			this.displayComments();
			this.drawLines();
		}
	}

	dragEnd() {
		this.consoleLog("Drag end");
		if (this.commentSizing) {
			this.endCommentSizing();
		} else if (this.dragging) {
			this.dragging = false;
			if (this.dragOffsetX !== 0 ||
					this.dragOffsetY !== 0) {
				this.consoleLog("editActionHandler - moveObjects");
				this.editActionHandler({ editType: "moveObjects", nodes: ObjectModel.getSelectedObjectIds(), offsetX: this.dragOffsetX, offsetY: this.dragOffsetY });
			}
		}
	}

	displayNodes() {
		// this.consoleLog("Displaying nodes");
		const that = this;

		var nodeGroupSel = this.canvas.selectAll(".node-group")
			.data(this.canvasJSON.diagram.nodes, function(d) { return d.id; });

		// Apply selection highlighting to the 'update selection' nodes. That is,
		// all nodes that are the same as during the last call to displayNodes().
		nodeGroupSel.each(function(d) {

			d3.select(`#node_grp_${d.id}`)
				.attr("transform", `translate(${d.x_pos}, ${d.y_pos})`)
				.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

			d3.select(`#node_rect_${d.id}`)
				.attr("class", ObjectModel.isSelected(d.id) ? "d3-obj-rect d3-obj-rect-selected" : "d3-obj-rect")
				.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data

			if (that.connectionType === "Ports") {
				if (d.outputPorts && d.outputPorts.length > 0) {
					d.outputPorts.forEach((port, i) => {
						d3.select(`#src_circle_${d.id}_${d.outputPorts[i].name}`)
							.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data
					});
				}

				if (d.inputPorts && d.inputPorts.length > 0) {
					d.inputPorts.forEach((port, i) => {
						d3.select(`#trg_circle_${d.id}_${d.inputPorts[i].name}`)
							.datum((nd) => that.getNode(nd.id)); // Set the __data__ to the updated data
					});
				}
			}

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
					return that.trimLabelToWidth(nd.objectData.label, that.labelWidth, textObj);
				});
		});

		var nodeGroups = nodeGroupSel.enter()
				.append("g")
					.attr("id", (d) => `node_grp_${d.id}`)
					.attr("class", "obj-group node-group")
					.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
					// Use mouse down instead of click because it gets called before drag start.
					.on("mousedown", (d) => {
						this.consoleLog("Node Group - mouse down");
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
						d3.event.stopPropagation();
						d3.event.preventDefault();
						this.contextMenuHandler({
							type: "node",
							targetObject: d,
							cmPos: this.getMousePos(),
							mousePos: this.getTransformedMousePos(),
							selectedObjectIds: ObjectModel.getSelectedObjectIds(),
							zoom: this.zoomTransform.k });
					})
					.call(this.drag);   // Must put drag after mousedown listener so mousedown gets called first.

		// Node selection highlighting outline
		nodeGroups.append("rect")
			.attr("id", (d) => `node_rect_${d.id}`)
			.attr("width", this.nodeWidth + (2 * this.highLightGap))
			.attr("height", this.nodeHeight + (2 * this.highLightGap))
			.attr("x", -this.highLightGap)
			.attr("y", -this.highLightGap)
			.attr("class", function(d) {
				return ObjectModel.isSelected(d.id) ? "d3-obj-rect d3-obj-rect-selected" : "d3-obj-rect";
			});

		if (this.connectionType === "Ports") {
			// Node outline
			nodeGroups.append("rect")
				.attr("width", this.nodeWidth)
				.attr("height", this.nodeHeight)
				.attr("x", 0)
				.attr("y", 0)
				.attr("class", "d3-node-rect-outline");

			// Input ports
			nodeGroups
				.each((d) => {
					if (d.inputPorts && d.inputPorts.length > 0) {
						d.inputPorts.forEach((port, i) => {
							var cy;
							if (d.inputPorts.length === 1) {
								cy = this.portPosY;
							} else {
								cy = (this.nodeHeight / (d.inputPorts.length + 1)) * (i + 1);
							}
							// Circle for input port
							var nodeGroup = d3.select(`#node_grp_${d.id}`);
							nodeGroup.append("circle")
									.attr("id", `trg_circle_${d.id}_${d.inputPorts[i].name}`)
									.attr("portId", d.inputPorts[i].name) // This is needed by getNodeInputPortAtMousePos
									.attr("cx", 0)
									.attr("cy", cy)
									.attr("r", this.portRadius)
									.attr("class", "d3-node-port-input")
									.attr("connected", "no");

							// Arrow for input port
							nodeGroup.append("path")
									.attr("id", `trg_arrow_${d.id}_${d.inputPorts[i].name}`)
									.attr("d", that.getArrowShapePath(cy))
									.attr("class", "d3-node-port-input-arrow")
									.attr("connected", "no");
						});
					}
				});

			// Output ports
			nodeGroups
				.each((d) => {
					if (d.outputPorts && d.outputPorts.length > 0) {
						d.outputPorts.forEach((port, i) => {
							var cy;
							if (d.outputPorts.length === 1) {
								cy = this.portPosY;
							} else {
								cy = (this.nodeHeight / (d.outputPorts.length + 1)) * (i + 1);
							}
							// Circle for input port
							var nodeGroup = d3.select(`#node_grp_${d.id}`);

							nodeGroup
								.append("circle")
									.attr("id", `src_circle_${d.id}_${d.outputPorts[i].name}`)
									.attr("cx", this.nodeWidth)
									.attr("cy", cy)
									.attr("r", this.portRadius)
									.attr("class", "d3-node-port-output")
									.on("mousedown", (cd) => {
										d3.event.stopPropagation(); // Stops the node drag behavior when clicking on the handle/circle
										d3.event.preventDefault();
										this.drawingNewLink = true;
										this.drawingNewLinkSrcId = cd.id;
										this.drawingNewLinkSrcPortId = port.name;
										this.drawingNewLinkAction = "node-node";
										this.drawingNewLinkStartPos = { x: cd.x_pos + this.nodeWidth, y: cd.y_pos + cy };
										this.drawingNewLinkArray = [];
										this.drawNewLink();
									});
						});
					}
				});
		}

		// Image outline
		// nodeGroup.append("rect")
		// 	.attr("width", this.imageWidth)
		// 	.attr("height", this.imageHeight)
		// 	.attr("x", this.imagePosX)
		// 	.attr("y", this.imagePosY)
		// 	.attr("class", "d3-node-rect-outline");

		// Node image
		nodeGroups.append("image")
			.attr("id", function(d) { return `node_image_${d.id}`; })
			.attr("xlink:href", function(d) { return d.image; })
			.attr("width", this.imageWidth)
			.attr("height", this.imageHeight)
			.attr("x", this.imagePosX)
			.attr("y", this.imagePosY)
			.attr("class", "node-image")
			.each(function(d) {
				if (d.customAttrs) {
					var imageObj = d3.select(this);
					d.customAttrs.forEach((customAttr) => {
						imageObj.attr(customAttr, "");
					});
				}
			});

		// Label outline
		// nodeGroup.append("rect")
		// 	.attr("width", this.labelWidth)
		// 	.attr("height", this.labelHeight)
		// 	.attr("x", this.labelOutlineX)
		// 	.attr("y", this.labelOutlineY)
		// 	.attr("class", "d3-label-outline");

		// Label
		nodeGroups.append("text")
			.text(function(d) {
				var textObj = d3.select(this);
				return that.trimLabelToWidth(d.objectData.label, that.labelWidth, textObj);
			})
			.attr("id", function(d) { return `node_label_${d.id}`; })
			.attr("class", "d3-node-label")
			.attr("x", this.labelPosX)
			.attr("y", this.labelPosY)
			.attr("text-anchor", "middle")
			.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text object
				const labelObj = d3.select(this);
				if (this.textContent.endsWith("...")) {
					labelObj
						.attr("abbr-label", this.textContent) // Do this before setting the new label
						.text(d.objectData.label);
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

		// Decorators
		this.addDecorator(nodeGroups, "topLeft", this.leftDecoratorX, this.topDecoratorY);
		this.addDecorator(nodeGroups, "topRight", this.rightDecoratorX, this.topDecoratorY);
		this.addDecorator(nodeGroups, "bottomLeft", this.leftDecoratorX, this.bottomDecoratorY);
		this.addDecorator(nodeGroups, "bottomRight", this.rightDecoratorX, this.bottomDecoratorY);

		// Remove any nodes that are no longer in the diagram.nodes array.
		nodeGroupSel.exit().remove();
	}

	setTrgPortStatus(trgId, trgPortId, newStatus) {
		d3.select(`#trg_circle_${trgId}_${trgPortId}`).attr("connected", newStatus); // Use * wildcard to select all ports
		d3.select(`#trg_arrow_${trgId}_${trgPortId}`).attr("connected", newStatus); // Use * wildcard to select all ports
	}

	setSrcPortStatus(srcId, srcPortId, newStatus) {
		d3.select(`#src_circle_${srcId}_${srcPortId}`).attr("connected", newStatus); // Use * wildcard to select all ports
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
				return dec.className;
			}
		}
		return "d3-decorator-outline";
	}

	getDecoratorImage(d, type) {
		if (d.decorations) {
			var dec = d.decorations.find((dc) => dc.position === type);
			if (dec) {
				if (dec.className === "node-zoom") {  // TODO - Remove this if when WML external model supports decorator image field.
					return "/canvas/images/zoom-in_32.svg";
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

		this.canvas.selectAll(".d3-new-connection-line")
			.data(this.drawingNewLinkArray)
			.enter()
				.append("path")
				.attr("d", (d) => that.getConnectorPath(d))
				.attr("class", "d3-new-connection-line")
				.attr("linkType", linkType);

		this.canvas.selectAll(".d3-new-connection-start")
			.data(this.drawingNewLinkArray)
			.enter()
				.append("circle")
					.attr("cx", (d) => d.x1)
					.attr("cy", (d) => d.y1)
					.attr("r", this.portRadius)
					.attr("class", "d3-new-connection-start")
					.attr("linkType", linkType);

		this.canvas.selectAll(".d3-new-connection-blob")
			.data(this.drawingNewLinkArray)
			.enter()
				.append("circle")
					.attr("cx", (d) => d.x2)
					.attr("cy", (d) => d.y2)
					.attr("r", this.portRadius)
					.attr("class", "d3-new-connection-blob")
					.attr("linkType", linkType)
					.on("mouseup", () => {
						d3.event.stopPropagation();
						d3.event.preventDefault();
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

		this.canvas.selectAll(".d3-new-connection-line")
			.data(this.drawingNewLinkArray)
			.enter()
				.append("path")
				.attr("d", (d) => that.getConnectorPath(d))
				.attr("class", "d3-new-connection-line")
				.attr("linkType", linkType);

		// this.canvas.selectAll(".d3-new-connection-start")
		// 	.data(this.drawingNewLinkArray)
		// 	.enter()
		// 		.append("circle")
		// 			.attr("cx", (d) => d.x1)
		// 			.attr("cy", (d) => d.y1)
		// 			.attr("r", this.portRadius)
		// 			.attr("class", "d3-new-connection-start")
		// 			.attr("linkType", linkType);

		this.canvas.selectAll(".d3-new-connection-blob")
			.data(this.drawingNewLinkArray)
			.enter()
				.append("circle")
					.attr("cx", (d) => d.x2)
					.attr("cy", (d) => d.y2)
					.attr("r", this.portRadius)
					.attr("class", "d3-new-connection-blob")
					.attr("linkType", linkType)
					.on("mouseup", () => {
						d3.event.stopPropagation();
						d3.event.preventDefault();
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
						d3.event.stopPropagation();
						d3.event.preventDefault();
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
				trgPortId = trgPortId || trgNode.inputPorts[0].name;
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

		d3.selectAll(".d3-new-connection-line")
			.transition()
			.duration(duration)
			.attr("d", newPath)
			.on("end", () => {
				this.canvas.selectAll(".d3-new-connection-arrow").remove();

				d3.selectAll(".d3-new-connection-blob")
					.transition()
					.duration(1000)
					.ease(d3.easeElastic)
					.attr("cx", saveX1)
					.attr("cy", saveY1);

				d3.selectAll(".d3-new-connection-line")
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
			this.canvas.selectAll(".d3-new-connection-line").remove();
			this.canvas.selectAll(".d3-new-connection-start").remove();
			this.canvas.selectAll(".d3-new-connection-blob").remove();
			this.canvas.selectAll(".d3-new-connection-arrow").remove();
		}
	}

	getNodeAtMousePos() {
		const that = this;
		var pos = this.getTransformedMousePos();
		var node = null;
		this.canvas.selectAll(".node-group")
			.each(function(d) {
				if (pos.x >= d.x_pos - that.portRadius &&  // Target port sticks out by its radius so need to allow for it.
						pos.x <= d.x_pos + that.nodeWidth &&
						pos.y >= d.y_pos &&
						pos.y <= d.y_pos + that.nodeHeight) {
					node = d;
				}
			});
		return node;
	}

	getNodeInputPortAtMousePos() {
		const that = this;
		var pos = this.getTransformedMousePos();
		var portId = null;
		this.canvas.selectAll(".d3-node-port-input")
			.each(function(d) {                         // Use function keyword so 'this' pointer references the dom object
				var cx = d.x_pos + this.cx.baseVal.value;
				var cy = d.y_pos + this.cy.baseVal.value;
				if (pos.x >= cx - that.portRadius && // Target port sticks out by its radius so need to allow for it.
						pos.x <= cx + that.portRadius &&
						pos.y >= cy - that.portRadius &&
						pos.y <= cy + that.portRadius) {
					portId = this.getAttribute("portId");
				}
			});
		return portId;
	}


	displayComments() {
		// this.consoleLog("Displaying comments");
		const that = this;

		var commentGroupSel = this.canvas.selectAll(".comment-group")
			.data(this.canvasJSON.diagram.comments, function(d) { return d.id; });

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
				.attr("class", ObjectModel.isSelected(d.id) ? "d3-obj-rect d3-obj-rect-selected" : "d3-obj-rect")
				.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

			// Clip rectangle for text
			d3.select(`#comment_clip_${d.id}`)
				.attr("height", d.height)
				.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

			// Background rectangle for comment
			d3.select(`#comment_box_${d.id}`)
				.attr("height", d.height)
				.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
				.each(function(cd) {
					if (cd.customAttrs) {
						var imageObj = d3.select(this);
						cd.customAttrs.forEach((customAttr) => {
							imageObj.attr(customAttr, "");
						});
					}
				});

			// Comment port circle
			if (that.connectionType === "Ports") {
				d3.select(`#comment_circle_${d.id}`)
					.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data
			}

			// TODO - can't get this update code to work becaue of clippath etc. Instead,
			// the text is updated by removing the comment group object during the onBlur
			// event.
			// d3.select(`#comment_text_${d.id}`)
			// 	.datum((cd) => that.getComment(cd.id)) // Set the __data__ to the updated data
			// 	.style("stroke", null)
			// 	.style("fill", null)
			// 	.each(function(cd) {
			// 		var textObj = d3.select(this);
			// 		textObj.selectAll("tspan").remove();
			// 		that.displayWordWrappedText(textObj, cd.content, cd.width - (2 * that.commentWidthPadding));
			// 	});

			// Comment halo
			d3.select(`#comment_halo_${d.id}`)
				.attr("height", d.height)
				.attr("height", (cd) => cd.height + (2 * that.haloCommentGap))
				.datum((cd) => that.getComment(cd.id)); // Set the __data__ to the updated data

		});

		var commentGroups = commentGroupSel.enter()
				.append("g")
					.attr("id", (d) => `comment_grp_${d.id}`)
					.attr("class", "obj-group comment-group")
					.attr("transform", (d) => `translate(${d.x_pos}, ${d.y_pos})`)
					// Use mouse down instead of click because it gets called before drag start.
					.on("mousedown", (d) => {
						this.consoleLog("Comment Group - mouse down");
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
						this.consoleLog("Comment Group - finished mouse down");
					})
					.on("mouseenter", function(d) { // Use function keyword so 'this' pointer references the DOM text group object
						if (that.connectionType === "Ports") {
							d3.select(this)
									.append("circle")
										.attr("id", "comment_port_circle")
										.attr("cx", 0 - that.highLightGap)
										.attr("cy", 0 - that.highLightGap)
										.attr("r", that.portRadius)
										.attr("class", "d3-comment-port-circle")
										.on("mousedown", function(cd) {
											d3.event.stopPropagation(); // Stops the node drag behavior when clicking on the handle/circle
											d3.event.preventDefault();
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
						d3.event.stopPropagation();
						d3.event.preventDefault();

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

						that.textAreaHeight = 0; // Save for comparison later
						that.editingComment = true;

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
									d3.select(`#comment_grp_${commentObj.id}`).remove();
									that.displayComments();
									that.saveCommentChanges(this);
									that.closeCommentTextArea();
								});

						// Note: Couldn't get focus to work through d3, so used dom instead.
						document.getElementById(`text_area_${id}`).focus();
						that.clickActionHandler({ clickType: "DOUBLE_CLICK", objectType: "comment", id: d.id, selectedObjectIds: ObjectModel.getSelectedObjectIds() });
					})
					.on("contextmenu", (d) => {
						this.consoleLog("Comment Group - context menu");
						d3.event.stopPropagation();
						d3.event.preventDefault();
						this.contextMenuHandler({
							type: "comment",
							targetObject: d,
							cmPos: this.getMousePos(),
							mousePos: this.getTransformedMousePos(),
							selectedObjectIds: ObjectModel.getSelectedObjectIds(),
							zoom: this.zoomTransform.k });
					})
					.call(this.drag);	 // Must put drag after mousedown listener so mousedown gets called first.

		// Comment selection highlighting and sizing outline
		commentGroups.append("rect")
			.attr("id", (d) => `comment_rect_${d.id}`)
			.attr("width", (d) => d.width + (2 * this.highLightGap))
			.attr("height", (d) => d.height + (2 * this.highLightGap))
			.attr("x", -this.highLightGap)
			.attr("y", -this.highLightGap)
			.attr("class", function(d) {
				return ObjectModel.isSelected(d.id) ? "d3-obj-rect d3-obj-rect-selected" : "d3-obj-rect";
			})
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
			.attr("class", (d) => d.className || "canvas-comment") // Use common-canvas.css style since that is the default.
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
			.attr("id", (d) => `comment_clip_${d.id}`)
				.append("rect")
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
			.attr("clip-path", (d) => `url(#comment_clip_${d.id})`)
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
			this.drawLines();
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

	// Sets the size and position of the object in the canvas.diagram.comments
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
		this.drawLines();
	}

	// Finalises the sizing of a comment by calling editActionHandler
	// with an editComment action.
	endCommentSizing() {
		this.commentSizing = false;
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
			extraText = " ";     // line we're processing -- because this is the textarea behavior.
		}

		while (end <= word.length) {
			subWord = word.substring(start, end);

			textLen = this.getTextLen(extraText + subWord, tspan);

			if (textLen > width) {
				if (start === end - 1) { // If a single character doesn't fit in the width adjust
					end++;                 // end so the character is written into a line on its own.
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
	trimLabelToWidth(text, width, textObj) {
		var tspan = this.createTspan(text, 1, "d3-node-label", textObj);
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

	drawLines() {
		// this.consoleLog("Drawing lines");
		var lineArray = this.buildLineArray();
		lineArray = this.addConnectionPaths(lineArray);

		this.canvas.selectAll(".link-group").remove();

		var linkGroup = this.canvas.selectAll(".link-group")
			.data(lineArray)
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
						// this.consoleLog("Context menu on canvas background.");
						d3.event.stopPropagation();
						d3.event.preventDefault();
						this.contextMenuHandler({
							type: "link",
							id: d.id,
							cmPos: this.getMousePos(),
							mousePos: this.getTransformedMousePos(),
							selectedObjectIds: ObjectModel.getSelectedObjectIds(),
							zoom: this.zoomTransform.k });
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
						classStr = "d3-selectable-link " + (d.className || "d3-comment-link");
					} else {
						classStr = "d3-selectable-link " + (d.className || "d3-data-link");
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
						classStr = "d3-selectable-link " + (d.className || "d3-comment-link");
					} else {
						classStr = "d3-selectable-link " + (d.className || "d3-data-link");
					}
					return classStr;
				})
				.style("stroke-dasharray", "0"); // Ensure arrow head is always solid line style

		// Arrow within input port
		if (this.connectionType === "Ports") {
			d3.selectAll(".d3-node-port-output").attr("connected", "no");
			d3.selectAll(".d3-node-port-input").attr("connected", "no");
			d3.selectAll(".d3-node-port-input-arrow").attr("connected", "no");
			lineArray.forEach((line) => {
				if (line.type === "nodeLink") {
					this.setTrgPortStatus(line.trg.id, line.trgPortId, "yes");
					this.setSrcPortStatus(line.src.id, line.srcPortId, "yes");
				}
			});
		}

		this.setDisplayOrder();
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

		this.canvasJSON.diagram.links.forEach((link) => {
			var srcNode = this.getNode(link.source);
			var trgNode = this.getNode(link.target);
			let type = "nodeLink";

			if (srcNode === null) {
				type = "commentLink";
				srcNode = this.getComment(link.source);
			}

			if (srcNode === null) {
				this.consoleLog("Error drawing a link. A link was provided in the Canvas data that does not have a valid source node/comment.");
			}

			if (trgNode === null) {
				this.consoleLog("Error drawing a link. A link was provided in the Canvas data that does not have a valid target node.");
			}

			// Only proceed if we have a source and a target node/comment.
			if (srcNode && trgNode) {
				if (!this.isSourceOverlappingTarget(srcNode, trgNode, type)) {
					var coords = {};
					var srcPortId;
					var trgPortId;

					if (type === "nodeLink") {
						if (this.connectionType === "Halo") {
							coords = this.getNodeLinkCoordsForHalo(srcNode, trgNode);
						} else {
							srcPortId = this.getSourcePortId(link, srcNode);
							trgPortId = this.getTargetPortId(link, trgNode);
							coords = this.getNodeLinkCoordsForPorts(srcNode, srcPortId, trgNode, trgPortId);
						}
					} else {
						coords = this.getCommentLinkCoords(srcNode, trgNode);
					}

					lineArray.push({ "id": link.id,
													"x1": coords.x1, "y1": coords.y1, "x2": coords.x2, "y2": coords.y2,
													"className": link.className,
													"type": type,
													"src": srcNode,
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
		if (link.sourcePort) {
			srcPortId = link.sourcePort;
		} else if (srcNode.outputPorts && srcNode.outputPorts.length > 0) {
			srcPortId = srcNode.outputPorts[0].name;
		} else {
			srcPortId = null;
		}
		return srcPortId;
	}

	// Returns a target port Id if one exists in the link, otherwise defaults
	// to the first available port on the target node.
	getTargetPortId(link, trgNode) {
		var trgPortId;
		if (link.targetPort) {
			trgPortId = link.targetPort;
		} else if (trgNode.inputPorts && trgNode.inputPorts.length > 0) {
			trgPortId = trgNode.inputPorts[0].name;
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

	isSourceOverlappingTarget(srcNode, trgNode, type) {
		if (type === "nodeLink" &&
				((srcNode.x_pos + this.nodeWidth + this.linkGap >= trgNode.x_pos - this.linkGap &&
					trgNode.x_pos + this.nodeWidth + this.linkGap >= srcNode.x_pos - this.linkGap) &&
					(srcNode.y_pos + this.nodeHeight + this.linkGap >= trgNode.y_pos - this.linkGap &&
					trgNode.y_pos + this.nodeHeight + this.linkGap >= srcNode.y_pos - this.linkGap))) {
			return true;
		} else if (type === "commentLink" &&
				((srcNode.x_pos + srcNode.width + this.linkGap >= trgNode.x_pos - this.linkGap &&
					trgNode.x_pos + this.nodeWidth + this.linkGap >= srcNode.x_pos - this.linkGap) &&
					(srcNode.y_pos + srcNode.height + this.linkGap >= trgNode.y_pos - this.linkGap &&
					trgNode.y_pos + this.nodeHeight + this.linkGap >= srcNode.y_pos - this.linkGap))) {
			return true;
		}

		return false;
	}

	getNodeLinkCoordsForPorts(srcNode, srcPortId, trgNode, trgPortId) {
		var srcY = this.portPosY;
		var trgY = this.portPosY;

		if (srcNode.outputPorts && srcNode.outputPorts.length > 1) {
			var srcPortPos = srcNode.outputPorts.findIndex((p) => p.name === srcPortId);
			if (srcPortPos > -1) {
				srcY = (this.nodeHeight / (srcNode.outputPorts.length + 1)) * (srcPortPos + 1);
			}
		}

		if (trgNode.inputPorts && trgNode.inputPorts.length > 1) {
			var trgPortPos = trgNode.inputPorts.findIndex((p) => p.name === trgPortId);
			if (trgPortPos > -1) {
				trgY = (this.nodeHeight / (trgNode.inputPorts.length + 1)) * (trgPortPos + 1);
			}
		}

		return {
			x1: srcNode.x_pos + this.nodeWidth,
			y1: srcNode.y_pos + srcY,
			x2: trgNode.x_pos,
			y2: trgNode.y_pos + trgY };
	}

	getNodeLinkCoordsForHalo(srcNode, trgNode) {
		const startPos = this.getOuterCoord(
			srcNode.x_pos - this.linkGap,
			srcNode.y_pos - this.linkGap,
			this.nodeWidth + (this.linkGap * 2),
			this.nodeHeight + (this.linkGap * 2),
			this.imagePosX + (this.imageWidth / 2) + this.linkGap,
			this.imagePosY + (this.imageHeight / 2) + this.linkGap,
			trgNode.x_pos + (this.nodeWidth / 2),
			trgNode.y_pos + (this.nodeHeight / 2));

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.linkGap,
			trgNode.y_pos - this.linkGap,
			this.nodeWidth + (this.linkGap * 2),
			this.nodeHeight + (this.linkGap * 2),
			this.imagePosX + (this.imageWidth / 2) + this.linkGap,
			this.imagePosY + (this.imageHeight / 2) + this.linkGap,
			srcNode.x_pos + (this.nodeWidth / 2),
			srcNode.y_pos + (this.nodeHeight / 2));

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
			trgNode.x_pos + (this.nodeWidth / 2),
			trgNode.y_pos + (this.nodeHeight / 2));

		const endPos = this.getOuterCoord(
			trgNode.x_pos - this.linkGap,
			trgNode.y_pos - this.linkGap,
			this.nodeWidth + (this.linkGap * 2),
			this.nodeHeight + (this.linkGap * 2),
			this.imagePosX + (this.imageWidth / 2) + this.linkGap,
			this.imagePosY + (this.imageHeight / 2) + this.linkGap,
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
				Math.abs(yDiff) < this.nodeHeight) {
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

	consoleLog(msg) {
		console.log(msg);
	}
}
