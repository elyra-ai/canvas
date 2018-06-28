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
import ObserveSize from "react-observe-size";

import {
	DND_DATA_TEXT
} from "./constants/canvas-constants";

import logger from "../../utils/logger";
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
			new CanvasD3Layout(this.props.canvasInfo,
				this.svgCanvasDivSelector,
				this.props.config,
				this.props.canvasController);
		this.focusOnCanvas();
	}

	componentDidUpdate() {
		if (this.canvasD3Layout) {
			this.canvasD3Layout.setCanvasInfo(this.props.canvasInfo, this.props.config);
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

	getSvgViewportOffset() {
		return this.canvasD3Layout.getSvgViewportOffset();
	}

	getElementAtMousePos(event) {
		return document.elementFromPoint(event.clientX, event.clientY);
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
		const mousePos = this.mouseCoords(event);
		const dropData = this.getDNDJson(event);
		const element = this.getElementAtMousePos(event);
		this.canvasD3Layout.nodeDropped(dropData, mousePos, element);
	}

	dragOver(event) {
		event.preventDefault();
	}

	focusOnCanvas() {
		if (document.getElementById(this.svgCanvasDivId)) {
			document.getElementById(this.svgCanvasDivId).focus(); // Set focus on div so keybord events go there.
		}
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

	// Re-renders the diagram canvas when the canvas size changes. This refresh
	// is needed because the output binding ports of sub-flows displayed full-page
	// need to be rerendered as the canvas size changes. The canvas size might
	// change when the right side panel is opened or the browser is resized.
	refreshOnSizeChange() {
		if (this.canvasD3Layout) {
			this.canvasD3Layout.refreshOnSizeChange();
		}
	}

	render() {
		// Set tabindex to -1 so the focus (see componentDidMount above) can go to
		// the div (which allows keyboard events to go there) and using -1 means
		// the user cannot tab to the div. Keyboard events are handled in svg-canvas-d3.js.
		// https://stackoverflow.com/questions/32911355/whats-the-tabindex-1-in-bootstrap-for
		const svgCanvas = (<div tabIndex="-1" className="d3-svg-canvas-div" id={this.svgCanvasDivId} />);

		return (
			<ObserveSize observerFn={(element) => this.refreshOnSizeChange()}>
				<div
					id={this.canvasDivId}
					className="common-canvas-drop-div"
					onDragOver={this.dragOver}
					onDrop={this.drop}
				>
					{svgCanvas}
					{this.props.children}
				</div>
			</ObserveSize>
		);
	}
}

DiagramCanvas.propTypes = {
	canvasInfo: PropTypes.object,
	config: PropTypes.object.isRequired,
	children: PropTypes.element,
	canvasController: PropTypes.object.isRequired
};
