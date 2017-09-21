/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 13] */
/* global chmln */
/* eslint no-shadow: ["error", { "allow": ["Node", "Comment"] }] */

import React from "react";
import PropTypes from "prop-types";

import {
	DND_DATA_TEXT
} from "../constants/common-constants.js";

import BlankCanvasImage from "../assets/images/blank_canvas.png";
import ObjectModel from "./object-model/object-model.js";
import logger from "../utils/logger";
import CanvasD3Layout from "./svg-canvas-d3.js";

export default class DiagramCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.drop = this.drop.bind(this);
		this.dragOver = this.dragOver.bind(this);

		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);

		this.canvasContextMenu = this.canvasContextMenu.bind(this);

		this.createNodeFromDataAt = this.createNodeFromDataAt.bind(this);

		this.handlePlaceholderLinkClick = this.handlePlaceholderLinkClick.bind(this);
	}

	componentDidMount() {
		this.canvasD3Layout =
			new CanvasD3Layout(this.props.canvas,
				"#d3-svg-canvas-div",
				"100%", "100%",
				this.props.editActionHandler,
				this.props.contextMenuHandler,
				this.props.clickActionHandler,
				this.props.decorationActionHandler,
				this.props.config);
		this.focusOnCanvas();
	}

	componentDidUpdate() {
		if (this.canvasD3Layout) {
			this.canvasD3Layout.setCanvasInfo(this.props.canvas, this.props.config);
		}
	}

	getDNDJson(event) {
		try {
			return JSON.parse(event.dataTransfer.getData(DND_DATA_TEXT));
		} catch (e) {
			logger.info(e);
			return null;
		}
	}

	mouseCoords(event) {
		const rect = event.currentTarget.getBoundingClientRect();

		return {
			x: event.clientX - Math.round(rect.left),
			y: event.clientY - Math.round(rect.top)
		};
	}

	drop(event) {
		event.preventDefault();

		const jsVal = this.getDNDJson(event);
		const mousePos = this.mouseCoords(event);

		// Offset mousePos so new node appers in center of mouse location.
		mousePos.x -= (this.canvasD3Layout.nodeWidth / 2) * this.canvasD3Layout.zoomTransform.k;
		mousePos.y -= (this.canvasD3Layout.nodeHeight / 2) * this.canvasD3Layout.zoomTransform.k;

		const transPos = this.canvasD3Layout.transformMousePos(mousePos);

		if (jsVal !== null) {
			if ((jsVal.operation === "createFromTemplate") || jsVal.operation === "createFromObject") {
				this.createNodeAt(jsVal.operator_id_ref, jsVal.sourceId, jsVal.sourceObjectTypeId, transPos.x, transPos.y);

			} else if ((jsVal.operation === "addToCanvas") || (jsVal.operation === "addTableFromConnection")) {
				this.createNodeFromDataAt(transPos.x, transPos.y, jsVal.data);
			}
		}
	}

	addNodeToCanvas(node) {
		if (node) {
			this.createNodeAt(node.operator_id_ref, node.sourceId, node.sourceObjectTypeId, 260, 10);
		}
	}

	dragOver(event) {
		event.preventDefault();
	}

	zoomIn() {
		if (this.canvasD3Layout) {
			this.canvasD3Layout.zoomIn();
		}
	}

	zoomOut() {
		if (this.canvasD3Layout) {
			this.canvasD3Layout.zoomOut();
		}
	}

	focusOnCanvas() {
		document.getElementById("d3-svg-canvas-div").focus(); // Set focus on div so keybord events go there.
	}

	canvasContextMenu(event) {
		const cmPos = this.mouseCoords(event);
		const mousePos = cmPos;

		event.preventDefault();

		const contextMenuSource = {
			type: "canvas",
			zoom: 1,
			selectedObjectIds: ObjectModel.getSelectedObjectIds(),
			cmPos: cmPos,
			mousePos: mousePos
		};

		this.props.contextMenuHandler(contextMenuSource);
	}

	createNodeAt(operatorIdRef, sourceId, sourceObjectTypeId, x, y) {
		var data = {};

		if (typeof sourceId !== "undefined") {
			data = {
				editType: "createNode",
				offsetX: x,
				offsetY: y,
				sourceObjectId: sourceId,
				sourceObjectTypeId: sourceObjectTypeId
			};
		} else {
			data = {
				editType: "createNode",
				operator_id_ref: operatorIdRef,
				offsetX: x,
				offsetY: y
			};
		}

		this.props.editActionHandler(data);
	}

	createNodeFromDataAt(x, y, data) {
		// set coordinates
		data.offsetX = x;
		data.offsetY = y;

		this.props.editActionHandler(data);
	}

	handlePlaceholderLinkClick(e) {
		if (chmln) {
			chmln.show("58dd4521aa443a000420799e");
		} else {
			logger.info("handlePlaceholderLinkClick:no chmln");
		}
	}

	render() {
		let emptyCanvas = null;

		if (this.props.canvas.nodes.length === 0 &&
				this.props.canvas.comments.length === 0) {
			emptyCanvas = (<div id="empty-canvas" onContextMenu={this.canvasContextMenu}>
				<img src={BlankCanvasImage} className="placeholder-image" />
				<span className="placeholder-text">Your flow is empty!</span>
				<span className="placeholder-link"
					onClick={this.handlePlaceholderLinkClick}
				>Click here to take a tour</span>
			</div>);
		}

		// Set tabindex to -1 so the focus (see componentDidMount above) can go to
		// the div (which allows keyboard events to go there) and using -1 means
		// the user cannot tab to the div. Keyboard events are handled in svg-canvas-d3.js.
		// https://stackoverflow.com/questions/32911355/whats-the-tabindex-1-in-bootstrap-for
		const svgCanvas = (<div tabIndex="-1" className="d3-svg-canvas-div" id="d3-svg-canvas-div" />);

		return (
			<div
				id="canvas-div"
				onDragOver={this.dragOver}
				onDrop={this.drop}
			>
				{svgCanvas}
				{emptyCanvas}
				{this.props.children}
			</div>
		);
	}
}

DiagramCanvas.propTypes = {
	canvas: PropTypes.object,
	closeContextMenu: PropTypes.func.isRequired,
	contextMenuHandler: PropTypes.func.isRequired,
	editActionHandler: PropTypes.func.isRequired,
	clickActionHandler: PropTypes.func.isRequired,
	decorationActionHandler: PropTypes.func.isRequired,
	config: PropTypes.object.isRequired,
	children: PropTypes.element
};
