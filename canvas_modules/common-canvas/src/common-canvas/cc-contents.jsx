/*
 * Copyright 2017-2020 Elyra Authors
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

/* eslint no-shadow: ["error", { "allow": ["Node", "Comment"] }] */

import React from "react";
import PropTypes from "prop-types";
import ReactResizeDetector from "react-resize-detector";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import CommonCanvasContextMenu from "./cc-context-menu.jsx";
import { FlowData16 } from "@carbon/icons-react";
import { DND_DATA_TEXT } from "./constants/canvas-constants";

import Logger from "../logging/canvas-logger.js";
import SVGCanvasD3 from "./svg-canvas-d3.js";

class CanvasContents extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isDropZoneDisplayed: false
		};

		this.logger = new Logger("CC-Contents");

		this.svgCanvasDivId = "d3-svg-canvas-div-" + this.props.canvasController.getInstanceId();
		this.svgCanvasDivSelector = "#" + this.svgCanvasDivId;

		// Used to track the drag position of a node from the palette. The dragOver
		// event is continually fired, even when the mouse pointer is not moving,
		// so this lets us eliminate unnecessary events being passed to the renderer.
		this.dragX = null;
		this.dragY = null;

		// Record whether we added the event listeners or not.
		this.eventListenersAdded = false;

		this.drop = this.drop.bind(this);
		this.focusOnCanvas = this.focusOnCanvas.bind(this);
		this.setIsDropZoneDisplayed = this.setIsDropZoneDisplayed.bind(this);
		this.dragOver = this.dragOver.bind(this);
		this.dragEnter = this.dragEnter.bind(this);
		this.dragLeave = this.dragLeave.bind(this);
		this.refreshOnSizeChange = this.refreshOnSizeChange.bind(this);
		this.getLabel = this.getLabel.bind(this);

		this.onCut = this.onCut.bind(this);
		this.onCopy = this.onCopy.bind(this);
		this.onPaste = this.onPaste.bind(this);

		// Variables to handle strange HTML drag and drop behaviors. That is, pairs
		// of dragEnter/dragLeave events are fired as an external object is
		// dragged around over the top of the 'drop zone' canvas.
		this.first = false;
		this.second = false;

		// The host application may set one or more callback functions to execute their own
		// code after an update has been performed caused by a redux update.
		this.afterUpdateCallbacks = [];

		this.canvasDivId = "canvas-div-" + this.props.canvasController.getInstanceId();

		// Register ourself with the canvas controller so it can call this class
		// when necessary, and also call the SVGCanvasD3 object.
		props.canvasController.setCanvasContents(this);
	}

	componentDidMount() {
		this.logger.log("componentDidMount");
		this.svgCanvasD3 =
			new SVGCanvasD3(this.props.canvasInfo,
				this.svgCanvasDivSelector,
				this.props.canvasConfig,
				this.props.canvasController);

		this.svgCanvasD3.setCanvasInfo(this.props.canvasInfo, this.props.canvasConfig);

		if (this.props.canvasConfig.enableBrowserEditMenu) {
			this.addEventListeners();
		}
		this.focusOnCanvas();
	}

	componentDidUpdate() {
		this.logger.log("componentDidUpdate");
		if (this.svgCanvasD3 && !this.isDropZoneDisplayed()) {
			this.svgCanvasD3.setCanvasInfo(this.props.canvasInfo, this.props.canvasConfig);
			// Run the afterUpdateCallbacks.
			this.afterUpdate();
		}

		// Manage the event browsers in case this config property changes.
		if (this.props.canvasConfig.enableBrowserEditMenu) {
			this.addEventListeners();
		} else {
			this.removeEventListeners();
		}
	}

	componentWillUnmount() {
		this.removeEventListeners();
		if (this.svgCanvasD3) {
			this.svgCanvasD3.close();
		}
	}

	onCut(evt) {
		if (evt.currentTarget.activeElement.id === this.svgCanvasDivId) {
			evt.preventDefault();
			this.props.canvasController.cutToClipboard();
		}
	}

	onCopy(evt) {
		if (evt.currentTarget.activeElement.id === this.svgCanvasDivId) {
			evt.preventDefault();
			this.props.canvasController.copyToClipboard();
		}
	}

	onPaste(evt) {
		if (evt.currentTarget.activeElement.id === this.svgCanvasDivId) {
			evt.preventDefault();
			this.props.canvasController.pasteFromClipboard();
		}
	}

	getLabel(labelId) {
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessages[labelId] });
	}

	getDNDJson(event) {
		try {
			return JSON.parse(event.dataTransfer.getData(DND_DATA_TEXT));
		} catch (e) {
			this.logger.warn("The dragged object's data does not conform to the expected internal format: " + e);
			return null;
		}
	}

	getSVGCanvasD3() {
		return this.svgCanvasD3;
	}

	getEmptyCanvas() {
		let emptyCanvas = null;
		if (this.props.canvasController.isPrimaryPipelineEmpty()) {
			if (this.props.canvasConfig.emptyCanvasContent) {
				emptyCanvas = (
					<div className="empty-canvas">
						{this.props.canvasConfig.emptyCanvasContent}
					</div>);
			} else {
				emptyCanvas = (
					<div className="empty-canvas">
						<div className="empty-canvas-image"><FlowData16 /></div>
						<span className="empty-canvas-text1">{this.getLabel("canvas.flowIsEmpty")}</span>
						<span className="empty-canvas-text2">{this.getLabel("canvas.addNodeToStart")}</span>
					</div>);
			}
		}
		return emptyCanvas;
	}

	getContextMenu() {
		return (
			<CommonCanvasContextMenu
				canvasController={this.props.canvasController}
				containingDivId={this.props.containingDivId}
			/>);
	}

	getDropZone() {
		let dropZoneCanvas = null;
		if (this.isDropZoneDisplayed()) {
			if (this.props.canvasConfig.dropZoneCanvasContent) {
				dropZoneCanvas = this.props.canvasConfig.dropZoneCanvasContent;
			} else {
				dropZoneCanvas = (
					<div>
						<div className="dropzone-canvas" />
						<div className="dropzone-canvas-rect" />
					</div>);
			}
		}
		return dropZoneCanvas;
	}

	getSVGCanvasDiv() {
		// Set tabindex to -1 so the focus (see componentDidMount above) can go to
		// the div (which allows keyboard events to go there) and using -1 means
		// the user cannot tab to the div. Keyboard events are handled in svg-canvas-d3.js.
		// https://stackoverflow.com/questions/32911355/whats-the-tabindex-1-in-bootstrap-for
		return (<div tabIndex="-1" className="d3-svg-canvas-div" id={this.svgCanvasDivId} />);
	}

	setIsDropZoneDisplayed(isDropZoneDisplayed) {
		if (isDropZoneDisplayed !== this.state.isDropZoneDisplayed) {
			this.setState({ isDropZoneDisplayed: isDropZoneDisplayed });
		}
	}

	isDropZoneDisplayed() {
		return this.props.canvasConfig.enableDropZoneOnExternalDrag && this.state.isDropZoneDisplayed;
	}

	isDataTypeBeingDraggedFile(event) {
		if (event.dataTransfer && Array.isArray(event.dataTransfer.types)) {
			return event.dataTransfer.types.includes("Files");
		}
		return false;
	}

	afterUpdate() {
		this.afterUpdateCallbacks.forEach((callback) => callback());
	}

	addAfterUpdateCallback(callback) {
		const pos = this.afterUpdateCallbacks.findIndex((cb) => cb === callback);
		if (pos === -1) {
			this.afterUpdateCallbacks.push(callback);
		}
	}

	removeAfterUpdateCallback(callback) {
		const pos = this.afterUpdateCallbacks.findIndex((cb) => cb === callback);
		if (pos > -1) {
			this.afterUpdateCallbacks.splice(pos, 1);
		}
	}

	addEventListeners() {
		if (!this.eventListenersAdded) {
			document.addEventListener("cut", this.onCut, true);
			document.addEventListener("copy", this.onCopy, true);
			document.addEventListener("paste", this.onPaste, true);
			this.eventListenersAdded = true;
		}
	}

	removeEventListeners() {
		if (this.eventListenersAdded) {
			document.removeEventListener("cut", this.onCut, true);
			document.removeEventListener("copy", this.onCopy, true);
			document.removeEventListener("paste", this.onPaste, true);
			this.eventListenersAdded = false;
		}
	}

	drop(event) {
		event.preventDefault();
		this.first = false;
		this.second = false;
		this.setIsDropZoneDisplayed(false);

		const nodeTemplate = this.props.canvasController.getDragNodeTemplate();
		if (nodeTemplate) {
			this.svgCanvasD3.nodeTemplateDropped(nodeTemplate, event.clientX, event.clientY);

		} else {
			let dropData = this.getDNDJson(event);
			// If no drop data is found (which complies with the calling protocol
			// described in the wiki) we just pass through the dataTransfer data and
			// set an appropriate operation.
			if (!dropData) {
				dropData = {
					operation: "addToCanvas",
					data: {
						dataTransfer: event.dataTransfer,
						editType: "createFromExternalObject"
					}
				};
			}
			this.svgCanvasD3.externalObjectDropped(dropData, event.clientX, event.clientY);
		}

		// Clear the drag template.
		this.props.canvasController.setDragNodeTemplate(null);

		// Also clear dataTransfer data for when we get external objects.
		event.dataTransfer.clearData();
	}

	dragOver(event) {
		const nodeTemplate = this.props.canvasController.getDragNodeTemplate();
		if (nodeTemplate && (this.dragX !== event.clientX || this.dragY !== event.clientY)) {
			this.dragX = event.clientX;
			this.dragY = event.clientY;
			this.svgCanvasD3.nodeTemplateDraggedOver(nodeTemplate, event.clientX, event.clientY);
		}
	}

	dragEnter(event) {
		this.dragX = null;
		this.dragY = null;
		if (this.isDataTypeBeingDraggedFile(event)) {
			if (this.first) {
				this.second = true;
			} else {
				this.first = true;
				this.setIsDropZoneDisplayed(true);
			}
		}
		event.preventDefault();
	}

	dragLeave(event) {
		if (this.isDataTypeBeingDraggedFile(event)) {
			if (this.second) {
				this.second = false;
			} else if (this.first) {
				this.first = false;
			}

			if (!this.first && !this.second) {
				this.setIsDropZoneDisplayed(false);
			}
		}
		event.preventDefault();
	}

	focusOnCanvas() {
		if (document.getElementById(this.svgCanvasDivId)) {
			document.getElementById(this.svgCanvasDivId).focus(); // Set focus on div so keybord events go there.
		}
	}

	// Re-renders the diagram canvas when the canvas size changes. This refresh
	// is needed because the output binding ports of sub-flows displayed full-page
	// need to be rerendered as the canvas size changes. The canvas size might
	// change when the right side panel is opened or the browser is resized.
	refreshOnSizeChange() {
		if (this.svgCanvasD3) {
			this.svgCanvasD3.refreshOnSizeChange();
		}
	}

	render() {
		this.logger.log("render");

		const emptyCanvas = this.getEmptyCanvas();
		const contextMenu = this.getContextMenu();
		const dropZoneCanvas = this.getDropZone();
		const svgCanvasDiv = this.getSVGCanvasDiv();

		const mainClassName = this.props.canvasConfig.enableRightFlyoutUnderToolbar
			? "common-canvas-main"
			: null;

		let dropDivClassName = this.props.canvasConfig.enableRightFlyoutUnderToolbar
			? "common-canvas-drop-div-under-toolbar"
			: "common-canvas-drop-div";

		dropDivClassName = this.props.canvasConfig.enableToolbarLayout === "None"
			? dropDivClassName + " common-canvas-toolbar-none"
			: dropDivClassName;

		return (
			<main aria-label={this.getLabel("canvas.label")} role="main" className={mainClassName}>
				<ReactResizeDetector handleWidth handleHeight onResize={this.refreshOnSizeChange}>
					<div
						id={this.canvasDivId}
						className={dropDivClassName}
						onDrop={this.drop}
						onDragOver={this.dragOver}
						onDragEnter={this.dragEnter}
						onDragLeave={this.dragLeave}
					>
						{emptyCanvas}
						{svgCanvasDiv}
						{contextMenu}
						{dropZoneCanvas}
					</div>
				</ReactResizeDetector>
			</main>
		);
	}
}

CanvasContents.propTypes = {
	// Provided by CommonCanvas
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by Redux
	canvasConfig: PropTypes.object.isRequired,
	canvasInfo: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
	canvasInfo: state.canvasinfo,
	canvasConfig: state.canvasconfig,
	// These two fields are included here so they will trigger a render.
	// The renderer will retrieve the data for them by calling the canvas controller.
	selectionInfo: state.selectioninfo,
	breadcrumbs: state.breadcrumbs
});

export default connect(mapStateToProps)(injectIntl(CanvasContents));
