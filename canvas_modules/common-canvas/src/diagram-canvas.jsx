/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 13] */
/* eslint no-shadow: ["error", { "allow": ["Node", "Comment"] }] */

import React from "react";
import PropTypes from "prop-types";
import Node from "./node.jsx";
import Comment from "./comment.jsx";
import SVGCanvas from "./svg-canvas.jsx";
import {
	DND_DATA_TEXT,
	DRAG_MOVE,
	DRAG_LINK,
	DRAG_SELECT_REGION
} from "../constants/common-constants.js";
import CanvasUtils from "../utils/canvas-utils.js";
import logger from "../utils/logger";

const NODE_BORDER_SIZE = 2; // see common-canvas.css, .canvas-node
// const CELL_SIZE = 48;
const NODE_WIDTH = 66;
const NODE_HEIGHT = 80;
const ICON_SIZE = 48;
const FONT_SIZE = 10; // see common-canvas.css, .canvas-node p
const SELECT_REGION_DATA = "[]";

const ZOOM_DEFAULT_VALUE = 100;
const ZOOM_MAX_VALUE = 240;
const ZOOM_MIN_VALUE = 40;

export default class DiagramCanvas extends React.Component {
	constructor(props) {
		super(props);

		const zoomValue = props.canvas.zoom && !Number.isNaN(props.canvas.zoom)
			? props.canvas.zoom
			: ZOOM_DEFAULT_VALUE;

		this.state = {
			nodes: [],
			sourceNodes: [],
			targetNodes: [],
			dragging: false,
			dragMode: null,
			zoom: zoomValue
		};

		this.connectorType = "curve"; // "straight", "curve" or "elbow"
		this.getConnectorPath = this.getConnectorPath.bind(this);

		this.drop = this.drop.bind(this);
		this.dragOver = this.dragOver.bind(this);
		this.dragStart = this.dragStart.bind(this);
		this.drag = this.drag.bind(this);
		this.dragEnd = this.dragEnd.bind(this);

		this.canvasClicked = this.canvasClicked.bind(this);
		this.canvasDblClick = this.canvasDblClick.bind(this);

		this.isDragging = this.isDragging.bind(this);

		this.deleteObjects = this.deleteObjects.bind(this);
		this.disconnectNodes = this.disconnectNodes.bind(this);
		this.moveNodes = this.moveNodes.bind(this);

		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);

		this.canvasContextMenu = this.canvasContextMenu.bind(this);

		this.canvasDivId = "canvas-div-" + this.props.canvasController.getInstanceId();
	}

	// ----------------------------------

	// Event utility methods

	getDNDJson(event) {
		try {
			return JSON.parse(event.dataTransfer.getData(DND_DATA_TEXT));
		} catch (e) {
			logger.info(e);
			return null;
		}
	}

	// Returns the path string for the object passed in which descibes a
	// curved connector line using elbows and straight lines.
	getElbowPath(data) {
		const minInitialLine = this.minInitialLine();
		const corner1X = data.x1 + minInitialLine;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;
		const elbowSize = this.elbowSize();
		let elbowYOffset = elbowSize;

		if (yDiff > (2 * elbowSize)) {
			elbowYOffset = elbowSize;
		} else if (yDiff < -(2 * elbowSize)) {
			elbowYOffset = -elbowSize;
		} else {
			elbowYOffset = yDiff / 2;
		}

		// This is a special case where the source and target handles are very
		// close together.
		if (xDiff < (2 * minInitialLine) && (yDiff < (4 * elbowSize) && yDiff > -(4 * elbowSize))) {
			elbowYOffset = yDiff / 4;
		}

		let elbowXOffset = elbowSize;
		let extraSegments = false; // Indicates need for extra elbows and lines

		if (xDiff < (minInitialLine + elbowSize)) {
			extraSegments = true;
			corner2X = data.x2 - minInitialLine;
			elbowXOffset = elbowSize;
		} else if (xDiff < (2 * minInitialLine)) {
			extraSegments = true;
			corner2X = data.x2 - minInitialLine;
			elbowXOffset = -((xDiff - (2 * minInitialLine)) / 2);
		} else {
			elbowXOffset = elbowSize;
		}

		let path = "M " + data.x1 + " " + data.y1;

		path += "L " + (corner1X - elbowSize) + " " + corner1Y;
		path += "Q " + corner1X + " " + corner1Y + " " + corner1X + " " + (corner1Y + elbowYOffset);

		if (extraSegments === false) {
			path += "L " + corner2X + " " + (corner2Y - elbowYOffset);

		} else {
			const centerLineY = corner2Y - (corner2Y - corner1Y) / 2;

			path += "L " + corner1X + " " + (centerLineY - elbowYOffset);
			path += "Q " + corner1X + " " + centerLineY + " " + (corner1X - elbowXOffset) + " " + centerLineY;
			path += "L " + (corner2X + elbowXOffset) + " " + centerLineY;
			path += "Q " + corner2X + " " + centerLineY + " " + corner2X + " " + (centerLineY + elbowYOffset);
			path += "L " + corner2X + " " + (corner2Y - elbowYOffset);
		}

		path += "Q " + corner2X + " " + corner2Y + " " + (corner2X + elbowSize) + " " + corner2Y;
		path += "L " + data.x2 + " " + data.y2;

		return path;
	}

	// Returns the path string for the object passed in which descibes a
	// simple curved connector line.
	getCurvePath(data) {
		const distance = Math.round((NODE_WIDTH / 2) * this.zoom());
		let corner1X = data.x1 + (data.x2 - data.x1) / 2;
		const corner1Y = data.y1;
		let corner2X = corner1X;
		const corner2Y = data.y2;

		const x = data.x2 - data.x1 - distance;

		if (x < 0) {
			corner1X = data.x1 + (distance * 4);
			corner2X = data.x2 - (distance * 4);
		}

		let path = "M " + data.x1 + " " + data.y1;
		path += "C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
		return path;
	}

	getConnPointOffsets(halfNodeWidth, halfIcon, connSize) {
		const sideOffset = halfNodeWidth - halfIcon - connSize;
		return {
			top: halfIcon - connSize / 2 + NODE_BORDER_SIZE,
			inLeft: sideOffset, // offset from left edge
			outRight: sideOffset // offset from right edge
		};
	}

	getConnPoints(halfNodeWidth, halfIcon, connSize, zoom, node) {
		const iconCentreX = halfNodeWidth + (Math.round(node.x_pos * zoom) - 15);

		return {
			y: Math.round(node.y_pos * zoom) + halfIcon + NODE_BORDER_SIZE,
			inX: iconCentreX,
			outX: iconCentreX,
			midX: iconCentreX
		};
	}

	getConnectorPath(data) {
		return this.getCurvePath(data);
	}

	// Returns the path string for the object passed in which descibes a
	// simple straight connector line and a jaunty zig zag line when the
	// source is further right than the target.
	getStraightPath(data, zigZag) {
		let path = "";
		const xDiff = data.x2 - data.x1;
		const yDiff = data.y2 - data.y1;

		if (zigZag === false || (xDiff > 20 || Math.abs(yDiff) < Math.round(NODE_HEIGHT * this.zoom()))) {
			path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;

		} else {
			const minInitialLine = this.minInitialLine();
			const corner1X = data.x1 + minInitialLine;
			const corner1Y = data.y1;
			const corner2X = data.x2 - minInitialLine;
			const corner2Y = data.y2;

			const centerLineY = corner2Y - (corner2Y - corner1Y) / 2;

			path = "M " + data.x1 + " " + data.y1;
			path += " " + corner1X + " " + centerLineY;
			path += " " + corner2X + " " + centerLineY;
			path += " " + data.x2 + " " + data.y2;
		}

		return path;
	}

	getStraightPathForLinks(data) {
		let path = "";
		path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;
		return path;
	}

	mouseCoords(event) {
		const rect = event.currentTarget.getBoundingClientRect();

		return {
			x: event.clientX - Math.round(rect.left),
			y: event.clientY - Math.round(rect.top)
		};
	}

	isDragging() {
		return this.refs.svg_canvas.isDragging();
	}

	// ----------------------------------

	zoomIn() {
		let zoom = this.state.zoom + 10;
		if (zoom >= ZOOM_MAX_VALUE) {
			zoom = ZOOM_MAX_VALUE;
		}

		this.props.canvasController.editActionHandler({ editType: "zoomCanvas", value: zoom });
		this.setState({ zoom: zoom });
	}

	zoomOut() {
		let zoom = this.state.zoom - 10;

		// Lower than this and things start to look funny...
		if (zoom < ZOOM_MIN_VALUE) {
			zoom = ZOOM_MIN_VALUE;
		}

		this.props.canvasController.editActionHandler({ editType: "zoomCanvas", value: zoom });
		this.setState({ zoom: zoom });
	}

	zoom() {
		return this.state.zoom / 100;
	}

	focusOnCanvas() {
		document.getElementById(this.canvasDivId).focus(); // Set focus on div so keybord events go there.
	}

	// minInitialLine is the size of the vertical line protruding from the source
	// or target handles when such a line is required for drawing connectors.
	minInitialLine() {
		return Math.round(30 * this.zoom());
	}

	elbowSize() {
		return Math.round(10 * this.zoom());
	}

	// Mouse event Handlers

	drop(event) {
		event.preventDefault();

		const jsVal = this.getDNDJson(event);
		const zoom = this.zoom();
		if (jsVal !== null) {
			const canvas = this.refs.svg_canvas;
			if (canvas.isDragging()) {
				const dragMode = canvas.getDragMode();
				const dragBounds = canvas.getDragBounds();
				if (dragMode === DRAG_SELECT_REGION) {
					const minX = Math.round(Math.min(dragBounds.startX, dragBounds.endX) / zoom) - (NODE_WIDTH / 2);
					const minY = Math.round(Math.min(dragBounds.startY, dragBounds.endY) / zoom) - (NODE_HEIGHT / 2);
					const maxX = Math.round(Math.max(dragBounds.startX, dragBounds.endX) / zoom) - (NODE_WIDTH / 2);
					const maxY = Math.round(Math.max(dragBounds.startY, dragBounds.endY) / zoom) - (NODE_HEIGHT / 2);
					this.selectInRegion(minX, minY, maxX, maxY, zoom);
				} else if (jsVal.operation === "link") {
					// Should already have been handled via a nodeAction() from the Node.drop()
				} else if (jsVal.operation === "move") {
					this.moveNode(jsVal.id, Math.round((event.clientX - dragBounds.startX) / zoom),
						Math.round((event.clientY - dragBounds.startY) / zoom));
				}
			} else if ((jsVal.operation === "createFromTemplate") || jsVal.operation === "createFromObject") {
				var mousePos2 = this.mouseCoords(event);
				// logger.info(targetPos);
				// logger.info(mousePos);
				this.props.canvasController.createNodeAt(jsVal.operator_id_ref, jsVal.label, jsVal.sourceId, jsVal.sourceObjectTypeId,
					Math.round((mousePos2.x - (NODE_WIDTH / 2)) / zoom),
					Math.round((mousePos2.y - (NODE_HEIGHT / 2)) / zoom));
			} else if ((jsVal.operation === "addToCanvas") || (jsVal.operation === "addTableFromConnection")) {
				var mousePos = this.mouseCoords(event);
				// logger.info(targetPos);
				// logger.info("addToCanvas :"+JSON.stringify(mousePos));
				this.props.canvasController.createNodeFromDataAt(Math.round((mousePos.x - (NODE_WIDTH / 2)) / zoom),
					Math.round((mousePos.y - (NODE_HEIGHT / 2)) / zoom), jsVal.data);
			}
		}
	}

	dragOver(event) {
		// logger.info("DiagramCanvas.dragOver: x=" + event.clientX + ",y=" + event.clientY);
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
		// event.target.style.cursor = "move";
		if (this.isDragging()) {
			var mousePos = this.mouseCoords(event);
			this.refs.svg_canvas.notifyDragOver(mousePos.x, mousePos.y);
		}
	}

	dragStart(event) {
		this.props.canvasController.closeContextMenu();

		const selectRegion = (event.dataTransfer.getData(DND_DATA_TEXT) === "");

		let x = event.clientX;
		let y = event.clientY;

		let dragMode = null;

		if (selectRegion) {
			// Need to force an update on the dataTransfer object
			event.dataTransfer.setData(DND_DATA_TEXT, SELECT_REGION_DATA);
			event.dataTransfer.setDragImage(this.refs.emptyDraggable, 0, 0);
			var mousePos1 = this.mouseCoords(event);
			x = mousePos1.x;
			y = mousePos1.y;
			dragMode = DRAG_SELECT_REGION;
		} else {
			const jsVal = this.getDNDJson(event);
			if (jsVal !== null) {
				if (jsVal.operation === "link") {
					var mousePos2 = this.mouseCoords(event);
					x = mousePos2.x;
					y = mousePos2.y;
					dragMode = DRAG_LINK;
				} else {
					dragMode = DRAG_MOVE;
				}
			}
		}
		event.dataTransfer.effectAllowed = "all";

		this.refs.svg_canvas.notifyDragStart(dragMode, x, y);
	}

	drag(event) {
		//
	}

	dragEnd(event) {
		this.refs.svg_canvas.notifyDragEnd();
	}

	canvasClicked(event) {
		this.props.canvasController.clickActionHandler({
			clickType: "SINGLE_CLICK",
			objectType: "canvas",
			selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds()
		});
	}

	canvasDblClick(event) {
		this.props.canvasController.clickActionHandler({
			clickType: "DOUBLE_CLICK",
			objectType: "canvas",
			selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds()
		});
	}

	objectContextMenu(objectType, object, event) {
		const canvasDiv = document.getElementById(this.canvasDivId);
		const rect = canvasDiv.getBoundingClientRect();

		const cmPos = {
			x: event.clientX - Math.round(rect.left),
			y: event.clientY - Math.round(rect.top)
		};

		const mousePos = { x: cmPos.x * this.zoom(), y: cmPos.y * this.zoom() };

		event.preventDefault();

		const contextMenuSource = {
			type: objectType,
			targetObject: object,
			selectedObjectIds: this.props.canvasController.getObjectModel().ensureSelected(object.id),
			cmPos: cmPos,
			mousePos: mousePos
		};

		this.props.canvasController.contextMenuHandler(contextMenuSource);
	}

	canvasContextMenu(event) {
		const cmPos = this.mouseCoords(event);
		const mousePos = { x: cmPos.x / this.zoom(), y: cmPos.y / this.zoom() };

		event.preventDefault();

		let contextMenuSource = null;

		if (event.target.id === "" || event.target.id === "empty-canvas") {
			contextMenuSource = {
				type: "canvas",
				zoom: this.zoom(),
				selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds(),
				cmPos: cmPos,
				mousePos: mousePos
			};
		} else {
			// Assume it"s a link
			contextMenuSource = {
				type: "link",
				id: event.target.id,
				cmPos: cmPos,
				mousePos: mousePos
			};
		}

		this.props.canvasController.contextMenuHandler(contextMenuSource);
	}

	// ----------------------------------
	// Action Handlers

	nodeAction(node, action, optionalArgs = []) {
		if (action === "moveNode") {
			this.moveNode(node.id, optionalArgs[0], optionalArgs[1]);
		} else if (action === "removeNode") {
			this.removeNode(node.id);
		} else if (action === "nodeDblClicked") {
			this.props.canvasController.clickActionHandler({
				clickType: "DOUBLE_CLICK",
				objectType: "node",
				id: node.id,
				selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds()
			});
		} else if (action === "selected") {
			if (optionalArgs.shiftKey) {
				this.props.canvasController.getObjectModel().selectSubGraph(node.id);
			} else {
				this.props.canvasController.getObjectModel().toggleSelection(node.id, optionalArgs.metaKey);
			}
			this.props.canvasController.clickActionHandler({
				clickType: "SINGLE_CLICK",
				objectType: "node",
				id: node.id,
				selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds()
			});
		} else if (action === "dropOnNode" && this.isDragging()) {
			// The event is passed as the third arg
			// logger.info("Handling dropOnNode:");
			const jsVal = this.getDNDJson(optionalArgs);
			// logger.info(jsVal);
			if (jsVal !== null) {
				if (jsVal.connType === "connIn") {
					// If the drag started on an input connector, assume the drop target is the source
					this.linkSelected([node.id], [jsVal.id]);
				} else if (jsVal.connType === "connOut") {
					// Otherwise if the drag started on an output connector, assume the drop target is the target
					this.linkSelected([{ "id": jsVal.id }], [{ "id": node.id }]);
				} else if (jsVal.connType === "comment") {
					// Otherwise if the drag started on an output connector, assume the drop target is the target
					this.linkCommentSelected([jsVal.id], [node.id]);
				}
			}
		} else if (action === "connIn") {
			this.inputLink(node.id);
		} else if (action === "connOut") {
			this.outputLink(node.id);
		}
	}

	commentAction(comment, action, optionalArgs = []) {
		if (action === "selected") {
			// The event is passed as the third arg
			this.props.canvasController.getObjectModel().toggleSelection(comment.id, optionalArgs.metaKey);
			this.props.canvasController.clickActionHandler({
				clickType: "SINGLE_CLICK",
				objectType: "comment",
				id: comment.id,
				selectedObjectIds: this.props.canvasController.getObjectModel().getSelectedObjectIds()
			});
		} else if (action === "editComment") {
			// save the changed comment
			this.props.canvasController.editActionHandler({
				editType: "editComment",
				nodes: optionalArgs.nodes,
				label: optionalArgs.target.value,
				width: optionalArgs.width,
				height: optionalArgs.height,
				offsetX: optionalArgs.x_pos,
				offsetY: optionalArgs.y_pos
			});
		}
	}

	removeNode(nodeId) {
		this.deleteObjects(this.props.canvasController.getObjectModel().ensureSelected(nodeId));
	}

	disconnectNode(nodeId) {
		this.disconnectNodes(this.props.canvasController.getObjectModel().ensureSelected(nodeId));
	}

	moveNode(nodeId, offsetX, offsetY) {
		this.moveNodes(this.props.canvasController.getObjectModel().ensureSelected(nodeId), offsetX, offsetY);
	}

	linkSelected(sources, targets) {
		this.setState({
			sourceNodes: [],
			targetNodes: [] });
		this.props.canvasController.editActionHandler({
			editType: "linkNodes",
			nodes: sources,
			targetNodes: targets,
			linkType: "data"
		});
	}

	linkCommentSelected(sources, targets) {
		this.props.canvasController.editActionHandler({
			editType: "linkComment",
			nodes: sources,
			targetNodes: targets,
			linkType: "comment"
		});
	}

	inputLink(nodeId) {
		if (this.state.targetNodes.indexOf(nodeId) >= 0) {
			// Do nothing
		} else if (this.state.sourceNodes.length > 0) {
			// logger.info("Time to link");
			// This is triggered by clicking on the input connector of
			// a node when multiple output connectors are selected. This signifies that
			// the user wants to link from the outputs of one or more nodes to the input
			// of a single target node.
			this.linkSelected(this.state.sourceNodes, [nodeId]);
		} else {
			this.setState({
				targetNodes: this.state.targetNodes.concat(nodeId)
			});
		}
	}

	outputLink(nodeId) {
		if (this.state.sourceNodes.indexOf(nodeId) >= 0) {
			// Do nothing
		} else if (this.state.targetNodes.length > 0) {
			// This is triggered by clicking on the output connector of
			// a node when multiple inputs connectors are selected. This signifies that
			// the user wants to link to the inputs of one or more nodes from the output
			// of a single source node.
			this.linkSelected([nodeId], this.state.targetNodes);
		} else {
			// logger.info("Add to sources");
			this.setState({ sourceNodes: this.state.sourceNodes.concat(nodeId) });
		}
	}

	// Edit operation methods

	deleteObjects(nodeIds) {
		// logger.info("deleteObjects(): " + nodeIds);
		this.props.canvasController.editActionHandler({
			editType: "deleteObjects", nodes: nodeIds
		});
	}

	disconnectNodes(nodeIds) {
		this.props.canvasController.editActionHandler({
			editType: "disconnectNodes", nodes: nodeIds
		});
	}

	moveNodes(nodeIds, offsetX, offsetY) {
		this.props.canvasController.editActionHandler({
			editType: "moveObjects",
			nodes: nodeIds,
			offsetX: offsetX,
			offsetY: offsetY
		});
	}

	selectInRegion(minX, minY, maxX, maxY, zoom) {
		const nodeWidth = Math.round(NODE_WIDTH * zoom);
		const nodeHeight = Math.round(NODE_HEIGHT * zoom);
		this.props.canvasController.clickActionHandler({
			clickType: "SINGLE_CLICK",
			objectType: "region",
			selectedObjectIds: this.props.canvasController.getObjectModel().selectInRegion(minX, minY, maxX, maxY, nodeWidth, nodeHeight)
		});
	}

	makeLinksConnections(positions) {
		const links = this.makeALinkSet(positions, false);

		return links;
	}

	makeLinksBackgrounds(positions) {
		const bknds = this.makeALinkSet(positions, true);
		return bknds;
	}

	makeALinkSet(positions, isBackground) {
		return this.props.canvas.links.map((link, ind) => {
			// logger.info(link);
			var posFrom = positions[link.srcNodeId];
			var posTo = positions[link.trgNodeId];

			// Older diagrams where the comments don"t have unique IDs may not
			// have the comment IDs set correctly which in turn means the
			// the "posFrom" or "posTo" settings many not be correct.
			// For now, simply discard the link so we can still show the
			// rest of the diagram.
			if (typeof posFrom === "undefined" || typeof posTo === "undefined") {
				return null;
			}

			var className;
			if (isBackground) {
				className = "canvas-background-link";
			} else if (link.class_name !== "undefined" && link.class_name !== null) {
				if (link.class_name === "d3-comment-link") {
					className = "canvas-comment-link";
				} else if (link.class_name === "d3-data-link") {
					className = "canvas-data-link";
				} else if (link.class_name === "d3-object-link") {
					className = "canvas-object-link";
				} else {
					className = link.class_name;
				}
			} else {
				className = "canvas-data-link";
			}

			const data = {
				x1: posFrom.outX,
				y1: posFrom.y,
				x2: posTo.inX,
				y2: posTo.y
			};

			const posHalo = CanvasUtils.getLinePointOnHalo(data, this.zoom());

			const dataForLine = {
				x1: posFrom.outX,
				y1: posFrom.y,
				x2: posHalo.x,
				y2: posHalo.y
			};

			const d = this.getStraightPathForLinks(dataForLine);
			// this.getStraightPath(data, false);
			// this.getConnectorPath(data);
			// const midX = Math.round(posFrom.outX + ((posTo.inX - posFrom.outX) / 2));
			// const midY = Math.round(posFrom.y + ((posTo.y - posFrom.y) / 2));

			const key = isBackground
				? ind
				: ind + 10000;

			const arrow = CanvasUtils.getArrowheadPoints(data, this.zoom());
			const arrowd = arrow.p1.x + "," + arrow.p1.y + " " +
			arrow.p2.x + "," + arrow.p2.y + " " +
			arrow.p3.x + "," + arrow.p3.y;

			return (
				<svg key={"linkAndArrow" + key}>
					<path id={link.id}
						key={key}
						d={d}
						className={className}
					/>
					<polyline key={"arrow" + key}
						className={className + " link-arrow-head"}
						fill="none"
						stroke="black"
						strokeWidth="2"
						points={arrowd}
					/>
				</svg>
			);
		});
	}

	render() {
		// Hard code for now but should eventually be picked up from the diagram
		// once we"re using Modeler 18.1.
		const zoom = this.zoom();

		var viewNodes = [];
		var viewComments = [];
		var viewLinks = [];
		var positions = {};

		const iconSize = Math.max(Math.round(ICON_SIZE * zoom), 4);
		const halfIcon = iconSize / 2;
		const connSize = Math.max(2, Math.round((ICON_SIZE / 4) * zoom));
		const fontSize = Math.max(Math.round(FONT_SIZE * zoom) + 3, 8);
		const nodeWidth = Math.round(NODE_WIDTH * zoom);
		const halfNodeWidth = Math.round(NODE_WIDTH * zoom - (zoom * connSize));
		const nodeHeight = Math.round(NODE_HEIGHT * zoom);

		let maxX = 28 * NODE_WIDTH;
		let maxY = 10 * NODE_HEIGHT;
		const connOffsets = this.getConnPointOffsets(halfNodeWidth, halfIcon, connSize);

		const uiconf = {
			nodeWidth: nodeWidth,
			nodeHeight: nodeHeight,
			iconSize: iconSize,
			fontSize: fontSize,
			connSize: connSize,
			connOffsets: connOffsets,
			zoom: zoom
		};

		// TODO - pass a ref to the canvas (or a size config) rather than passing
		// multiple, individual, identical size params to every node
		viewNodes = this.props.canvas.nodes.map((node) => {

			const x = Math.round(node.x_pos * zoom);
			const y = Math.round(node.y_pos * zoom);

			var viewNode = (<Node
				key={node.id}
				node={node}
				uiconf={uiconf}
				nodeActionHandler={this.nodeAction.bind(this, node)}
				onContextMenu={this.objectContextMenu.bind(this, "node", node)}
				selected={this.props.canvasController.getObjectModel().isSelected(node.id)}
				canvasController={this.props.canvasController}
			/>);

			positions[node.id] = this.getConnPoints(halfNodeWidth, halfIcon, connSize, zoom, node);

			// Ensure canvas is big enough
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);

			return (viewNode);
		});

		viewComments = this.props.canvas.comments.map((comment) => {
			const x = Math.round(comment.x_pos * zoom);
			const y = Math.round(comment.y_pos * zoom);

			var viewComment = (<Comment
				key={comment.id}
				comment={comment}
				zoom={zoom}
				fontSize={fontSize}
				commentActionHandler={this.commentAction.bind(this, comment)}
				onContextMenu={this.objectContextMenu.bind(this, "comment", comment)}
				selected={this.props.canvasController.getObjectModel().isSelected(comment.id)}
				parentDivId={this.props.parentDivId}
			/>);

			positions[comment.id] = this.getConnPoints(
				Math.round(comment.width / 2 * zoom),
				Math.round(comment.height / 2 * zoom), 0, zoom, comment);

			// Ensure canvas is big enough
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);

			return (viewComment);
		});

		var parentStyle = {
			width: maxX + (2 * nodeWidth),
			height: maxY + (2 * nodeHeight)
		};


		// Create the set of links to be displayed
		const connectionLinks = this.makeLinksConnections(positions);
		viewLinks = (this.makeLinksBackgrounds(positions)).concat(connectionLinks);

		const emptyDraggable = <div ref="emptyDraggable" />;

		// TODO - include link icons
		return (
			<div
				id={this.canvasDivId}
				className={"common-canvas-drop-div"}
				draggable="true"
				onDragOver={this.dragOver}
				onDrop={this.drop}
				onDrag={this.drag}
				onDragStart={this.dragStart}
				onDragEnd={this.dragEnd}
				onClick={this.canvasClicked}
				onDoubleClick={this.canvasDblClick}
			>
				<div style={parentStyle}>
					{viewComments}
					{viewNodes}

					<SVGCanvas
						ref="svg_canvas"
						x="0"
						y="0"
						width="100%"
						height="100%"
						onContextMenu={this.canvasContextMenu}
					>
						<defs>
							<marker
								id="markerCircle"
								markerWidth={42}
								markerHeight={42}
								refX={10}
								refY={10}
								markerUnits="strokeWidth"
							>
								<circle cx={0} cy={0} r={20} fill="#f00" />
							</marker>
							<marker id="markerArrow" markerWidth={13} markerHeight={13} refX={2} refY={6} orient="auto">
								<path d="M2,2 L2,11 L10,6 L2,2" fill="#f00" />
							</marker>

							<marker
								id="Triangle"
								ref="Triangle"
								viewBox="0 0 20 20"
								refX="9"
								refY="5"
								markerWidth="10"
								markerHeight="10"
								orient="auto"
								markerUnits="strokeWidth"
							>
								<path d="M 0 0 L 10 5 L 0 10 z" />
							</marker>
						</defs>
						{viewLinks}
					</SVGCanvas>
					{this.props.children}
					{emptyDraggable}
				</div>
			</div>
		);
	}
}

DiagramCanvas.propTypes = {
	canvas: PropTypes.object.isRequired,
	children: PropTypes.element,
	parentDivId: PropTypes.string.isRequired,
	canvasController: PropTypes.object.isRequired
};
