/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 13] */
/* eslint no-shadow: ["error", { "allow": ["Node", "Comment"] }] */

import React from "react";
import PropTypes from "prop-types";

import {
	DND_DATA_TEXT
} from "../constants/common-constants.js";

import logger from "../utils/logger";
import CanvasD3Layout from "./svg-canvas-d3.js";

export default class DiagramCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this.svgCanvasDivId = "d3-svg-canvas-div-" + this.props.canvasController.getInstanceId();
		this.svgCanvasDivSelector = "#" + this.svgCanvasDivId;

		this.drop = this.drop.bind(this);
		this.dragOver = this.dragOver.bind(this);
		this.focusOnCanvas = this.focusOnCanvas.bind(this);

		this.canvasDivId = "canvas-div-" + this.props.canvasController.getInstanceId();
	}

	componentDidMount() {
		this.canvasD3Layout =
			new CanvasD3Layout(this.props.canvas,
				this.svgCanvasDivSelector,
				"100%", "100%",
				this.props.config,
				this.props.canvasController);
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
		mousePos.x -= (this.canvasD3Layout.layout.defaultNodeWidth / 2) * this.canvasD3Layout.zoomTransform.k;
		mousePos.y -= (this.canvasD3Layout.layout.defaultNodeHeight / 2) * this.canvasD3Layout.zoomTransform.k;

		const transPos = this.canvasD3Layout.transformMousePos(mousePos);

		if (jsVal !== null) {
			if ((jsVal.operation === "createFromTemplate") || jsVal.operation === "createFromObject") {
				this.props.canvasController.createNodeAt(jsVal.operator_id_ref, jsVal.label, jsVal.sourceId, jsVal.sourceObjectTypeId, transPos.x, transPos.y);

			} else if ((jsVal.operation === "addToCanvas") || (jsVal.operation === "addTableFromConnection")) {
				this.props.canvasController.createNodeFromDataAt(transPos.x, transPos.y, jsVal);
			}
		}
	}

	dragOver(event) {
		event.preventDefault();
	}

	focusOnCanvas() {
		document.getElementById(this.svgCanvasDivId).focus(); // Set focus on div so keybord events go there.
	}

	zoomIn() {
		this.canvasD3Layout.zoomIn();
	}

	zoomOut() {
		this.canvasD3Layout.zoomOut();
	}

	zoomToFit() {
		this.canvasD3Layout.zoomToFit();
	}

	render() {
		// Set tabindex to -1 so the focus (see componentDidMount above) can go to
		// the div (which allows keyboard events to go there) and using -1 means
		// the user cannot tab to the div. Keyboard events are handled in svg-canvas-d3.js.
		// https://stackoverflow.com/questions/32911355/whats-the-tabindex-1-in-bootstrap-for
		const svgCanvas = (<div tabIndex="-1" className="d3-svg-canvas-div" id={this.svgCanvasDivId} />);

		return (
			<div
				id={this.canvasDivId}
				className="common-canvas-drop-div"
				onDragOver={this.dragOver}
				onDrop={this.drop}
			>
				{svgCanvas}
				{this.props.children}
			</div>
		);
	}
}

DiagramCanvas.propTypes = {
	canvas: PropTypes.object,
	config: PropTypes.object.isRequired,
	children: PropTypes.element,
	canvasController: PropTypes.object.isRequired
};
