/*
 * Copyright 2017-2023 Elyra Authors
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
import CommonCanvasContextToolbar from "./cc-context-toolbar.jsx";
import CommonCanvasTextToolbar from "./cc-text-toolbar.jsx";
import CommonCanvasStateTag from "./cc-state-tag.jsx";
import CanvasUtils from "./common-canvas-utils.js";
import KeyboardUtils from "./keyboard-utils.js";
import { Button } from "@carbon/react";
import { FlowData, ArrowLeft } from "@carbon/react/icons";
import { DND_DATA_TEXT, STATE_TAG_LOCKED, STATE_TAG_READ_ONLY } from "./constants/canvas-constants";
import Logger from "../logging/canvas-logger.js";
import SVGCanvasD3 from "./svg-canvas-d3.js";

class CanvasContents extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isDropZoneDisplayed: false
		};

		this.logger = new Logger("CC-Contents");

		this.mainCanvasDivId = "canvas-div-" + this.props.canvasController.getInstanceId();
		this.svgCanvasDivId = "d3-svg-canvas-div-" + this.props.canvasController.getInstanceId();
		this.svgCanvasDivSelector = "#" + this.svgCanvasDivId;

		// Used to track the drag position of a node from the palette. The dragOver
		// event is continually fired, even when the mouse pointer is not moving,
		// so this lets us eliminate unnecessary events being passed to the renderer.
		this.dragX = null;
		this.dragY = null;

		// Reference for the contents <div>
		this.contentsRef = React.createRef();

		// Record whether we added the event listeners or not.
		this.eventListenersAdded = false;

		// Keeps track of mouse position to enable us to paste at mouse position
		// using keyboard.
		this.mousePos = { x: 0, y: 0 };

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
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onClickReturnToPrevious = this.onClickReturnToPrevious.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onBlur = this.onBlur.bind(this);

		// Variables to handle strange HTML drag and drop behaviors. That is, pairs
		// of dragEnter/dragLeave events are fired as an external object is
		// dragged around over the top of the 'drop zone' canvas.
		this.first = false;
		this.second = false;

		// The host application may set one or more callback functions to execute their own
		// code after an update has been performed caused by a redux update.
		this.afterUpdateCallbacks = [];

		// Register ourself with the canvas controller so it can call this class
		// when necessary, and also call the SVGCanvasD3 object.
		props.canvasController.setCanvasContents(this);
	}

	componentDidMount() {
		this.logger.log("componentDidMount");
		this.svgCanvasD3 =
			new SVGCanvasD3(this.props.canvasInfo.id,
				this.svgCanvasDivSelector,
				this.props.canvasController);
		this.setCanvasInfo();

		if (this.props.canvasConfig.enableBrowserEditMenu) {
			this.addEventListeners();
		}

		if (this.props.canvasConfig.enableFocusOnMount) {
			this.props.canvasController.setFocusOnCanvas();
		}
	}

	componentDidUpdate(prevProps) {
		this.logger.log("componentDidUpdate");
		if (this.svgCanvasD3 && !this.isDropZoneDisplayed()) {
			if (prevProps.canvasInfo !== this.props.canvasInfo ||
					prevProps.canvasConfig !== this.props.canvasConfig ||
					prevProps.breadcrumbs !== this.props.breadcrumbs) {
				this.setCanvasInfo();
				// Run the afterUpdateCallbacks.
				this.afterUpdate();

			// If the only change is selectionInfo, we can call the special method
			// setSelectionInfo, which will only update the selection highlighting.
			} else if (prevProps.selectionInfo !== this.props.selectionInfo) {
				this.svgCanvasD3.setSelectionInfo(this.props.selectionInfo);
				// Run the afterUpdateCallbacks.
				this.afterUpdate();
			}
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
	}

	onCut(evt) {
		if (this.isFocusOnCanvasOrContents(evt) &&
				this.props.canvasConfig.enableEditingActions &&
				!this.svgCanvasD3.isEditingText()) {
			evt.preventDefault();
			this.props.canvasController.cutToClipboard();
		}
	}

	onCopy(evt) {
		if (this.isFocusOnCanvasOrContents(evt) &&
				this.props.canvasConfig.enableEditingActions &&
				!this.svgCanvasD3.isEditingText()) {
			evt.preventDefault();
			this.props.canvasController.copyToClipboard();
		}
	}

	onPaste(evt) {
		if (this.isFocusOnCanvasOrContents(evt) &&
				this.props.canvasConfig.enableEditingActions &&
				!this.svgCanvasD3.isEditingText()) {
			evt.preventDefault();
			this.props.canvasController.pasteFromClipboard();
		}
	}

	onKeyDown(evt) {
		// Make sure no tip is displayed, because having one displayed
		// will interfere with drawing of the canvas as the result of any
		// keyboard action.
		this.props.canvasController.closeTip();
		const actions = this.props.canvasController.getKeyboardConfig().actions;

		// We don't handle key presses when:
		// 1. We are editng text, because the text area needs to receive key
		//    presses for undo, redo, delete etc.
		// 2. Dragging objects
		if (this.svgCanvasD3.isEditingText() || this.svgCanvasD3.isDragging()) {
			return;
		}

		// These actions alter the canvas objects so we need to check
		// this.config.enableEditingActions before calling them.
		if (this.props.canvasConfig.enableEditingActions) {
			if (KeyboardUtils.delete(evt) && actions.delete) {
				CanvasUtils.stopPropagationAndPreventDefault(evt); // Some browsers interpret Delete as 'Back to previous page'. So prevent that.
				this.props.canvasController.autoSelectFocusObj(() =>
					this.props.canvasController.keyboardActionHandler("deleteSelectedObjects"));

			} else if (KeyboardUtils.undo(evt) && actions.undo) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				if (this.props.canvasController.canUndo()) {
					this.props.canvasController.keyboardActionHandler("undo");
				}

			} else if (KeyboardUtils.redo(evt) && actions.redo) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				if (this.props.canvasController.canRedo()) {
					this.props.canvasController.keyboardActionHandler("redo");
				}

			} else if (KeyboardUtils.copyToClipboard(evt) && actions.copyToClipboard) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				this.props.canvasController.autoSelectFocusObj(() =>
					this.props.canvasController.keyboardActionHandler("copy"));

			} else if (KeyboardUtils.cutToClipboard(evt) && actions.cutToClipboard) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				this.props.canvasController.autoSelectFocusObj(() =>
					this.props.canvasController.keyboardActionHandler("cut"));

			} else if (KeyboardUtils.pasteFromClipboard(evt) && actions.pasteFromClipboard) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				if (this.mousePos) {
					const mousePos = this.svgCanvasD3.convertPageCoordsToSnappedCanvasCoords(this.mousePos);
					this.props.canvasController.keyboardActionHandler("paste", mousePos);
				} else {
					this.props.canvasController.keyboardActionHandler("paste");
				}
			}
		}
		// These keyboard actions do not alter the canvas objects so we
		// do not need to check this.config.enableEditingActions before calling them.
		if (KeyboardUtils.selectAll(evt) && actions.selectAll) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.props.canvasController.keyboardActionHandler("selectAll");

		} else if (KeyboardUtils.deselectAll(evt) && actions.deselectAll) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.props.canvasController.keyboardActionHandler("deselectAll");

		} else if (KeyboardUtils.spaceKey(evt)) {
			if (!this.svgCanvasD3.isSpaceKeyPressed()) {
				CanvasUtils.stopPropagationAndPreventDefault(evt);
				this.svgCanvasD3.setSpaceKeyPressed(true);
			}

		} else if (KeyboardUtils.toggleLogging(evt)) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			Logger.switchLoggingState(); // Switch the logging on and off

		} else if (KeyboardUtils.zoomToFit(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.zoomToFit();

		} else if (KeyboardUtils.zoomIn(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.zoomIn();

		} else if (KeyboardUtils.zoomOut(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.zoomOut();

		} else if (KeyboardUtils.panLeft(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.translateBy(-10, 0);

		} else if (KeyboardUtils.panRight(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.translateBy(10, 0);

		} else if (KeyboardUtils.panUp(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.translateBy(0, -10);

		} else if (KeyboardUtils.panDown(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
			this.svgCanvasD3.translateBy(0, 10);

		} else if (KeyboardUtils.nextGroup(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			this.moveFocusToNextGroup(evt);

		} else if (KeyboardUtils.previousGroup(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			this.moveFocusToPreviousGroup(evt);

		} else if (KeyboardUtils.displayContextOptions(evt) && this.props.canvasConfig.enableKeyboardNavigation) {
			this.svgCanvasD3.openCanvasContextOptions(evt);
		}
		evt.stopPropagation();
	}

	onKeyUp() {
		this.svgCanvasD3.setSpaceKeyPressed(false);
	}

	// When focus leaves the canvas it may be going to an "internal" object
	// such as a node or a comment or to an "external" object like the
	// toolbar or palette. If it goes outside the canvas, we reset the
	// tab object index so that tabbing will begin from the first tab object.
	onBlur(evt) {
		if (!this.isTargetInsideCanvas(evt.relatedTarget)) {
			this.svgCanvasD3.resetTabObjectIndex();
		}
	}

	// Records in mousePos the mouse pointer position when the pointer is inside
	// the boundaries of the canvas or sets the mousePos to null. This position
	// info can be used with keyboard operations.
	onMouseMove(e) {
		if (e.target &&
			e.target.className &&
			(
				e.target.className.baseVal === "svg-area" ||
				e.target.className.baseVal === "d3-svg-background"
			)) {
			this.mousePos = {
				x: e.clientX,
				y: e.clientY
			};
		} else {
			this.mousePos = null;
		}
	}

	onMouseLeave(e) {
		this.mousePos = null;
	}

	onMouseDown(e) {
		this.props.canvasController.setFocusOnCanvas();
	}

	// Handles the click on the "Return to previous flow" button.
	onClickReturnToPrevious(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		this.props.canvasController.displayPreviousPipeline();
	}

	setCanvasInfo() {
		// TODO - Eventually move nodeLayout and canvasLayout into redux and then
		// pass them into this.svgCanvasD3() as props.
		const nodeLayout = this.props.canvasController.objectModel.getNodeLayout();
		const canvasLayout = this.props.canvasController.objectModel.getCanvasLayout();
		this.svgCanvasD3.setCanvasInfo(
			this.props.canvasInfo,
			this.props.selectionInfo,
			this.props.breadcrumbs,
			nodeLayout,
			canvasLayout,
			this.props.canvasConfig
		);
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

	getStateTag() {
		let stateTag = null;

		if (this.props.canvasConfig.enableStateTag === STATE_TAG_READ_ONLY ||
				this.props.canvasConfig.enableStateTag === STATE_TAG_LOCKED) {
			stateTag = (
				<CommonCanvasStateTag
					stateTagType={this.props.canvasConfig.enableStateTag}
					canvasController={this.props.canvasController}
				/>
			);
		}
		return stateTag;
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
						<div className="empty-canvas-image"><FlowData /></div>
						<span className="empty-canvas-text1">{this.getLabel("canvas.flowIsEmpty")}</span>
						<span className="empty-canvas-text2">{this.getLabel("canvas.addNodeToStart")}</span>
					</div>);
			}
		}
		return emptyCanvas;
	}

	getReturnToPreviousBtn() {
		let returnToPrevious = null;
		if (!this.props.canvasController.isPrimaryPipelineEmpty() &&
				(this.props.canvasController.isDisplayingFullPageSubFlow() ||
					this.props.canvasConfig?.enableCanvasLayout?.alwaysDisplayBackToParentFlow)) {
			const label = this.getLabel("canvas.returnToPrevious");
			returnToPrevious = (
				<div className={"return-to-previous"}>
					<Button kind={"tertiary"}
						onClick={this.onClickReturnToPrevious}
						aria-label={label}
						size={"md"}
					>
						<div className={"return-to-previous-content"}>
							<ArrowLeft />
							<span>{label}</span>
						</div>
					</Button>
				</div>
			);
		}
		return returnToPrevious;
	}

	getContextMenu() {
		if (this.props.canvasConfig.enableContextToolbar) {
			return (
				<CommonCanvasContextToolbar
					canvasController={this.props.canvasController}
					containingDivId={this.mainCanvasDivId}
				/>);
		}
		return (
			<CommonCanvasContextMenu
				canvasController={this.props.canvasController}
				containingDivId={this.mainCanvasDivId}
			/>);
	}

	getTextToolbar() {
		return (
			<CommonCanvasTextToolbar
				canvasController={this.props.canvasController}
				containingDivId={this.mainCanvasDivId}
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

	getSvgCanvasDivId() {
		return this.svgCanvasDivId;
	}

	getSVGCanvasDiv() {
		if (this.props.canvasConfig.enableKeyboardNavigation) {
			// Set tabindex to 0 so the focus can go to the <div>
			return (
				<div tabIndex="0" className="d3-svg-canvas-div keyboard-navigation" id={this.svgCanvasDivId}
					onMouseDown={this.onMouseDown} onMouseLeave={this.onMouseLeave}
					onBlur={this.onBlur}
					onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}
					role="application" aria-label="canvas-keyboard-navigation" // Resolve Accessibility Violation of role and label
				/>
			);
		}

		// Set tabindex to -1 so the focus (see componentDidMount above) can go to
		// the div (which allows keyboard events to go there) and using -1 means
		// the user cannot tab to the div. Keyboard events are handled in svg-canvas-d3.js.
		// https://stackoverflow.com/questions/32911355/whats-the-tabindex-1-in-bootstrap-for
		return (
			<div tabIndex="-1" className="d3-svg-canvas-div" id={this.svgCanvasDivId}
				onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}
			/>
		);
	}

	setIsDropZoneDisplayed(isDropZoneDisplayed) {
		if (isDropZoneDisplayed !== this.state.isDropZoneDisplayed) {
			this.setState({ isDropZoneDisplayed: isDropZoneDisplayed });
		}
	}

	// Returns true if the target element passed in is inside the canvas div.
	isTargetInsideCanvas(target) {
		return target && target.closest(".common-canvas-drop-div");
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

	// Returns true if the focus is either on an element in the canvas or on the
	// canvas <div> itself.
	isFocusOnCanvasOrContents(evt) {
		if (evt.currentTarget?.activeElement) {
			return evt.currentTarget.activeElement.closest(this.svgCanvasDivSelector) ||
				evt.currentTarget.activeElement.id === this.svgCanvasDivId;
		}
		return false;
	}

	isFocusOnCanvas() {
		return document.activeElement?.id === this.getSvgCanvasDivId();
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
			document.addEventListener("mousemove", this.onMouseMove, true);
			this.eventListenersAdded = true;
		}
	}

	removeEventListeners() {
		if (this.eventListenersAdded) {
			document.removeEventListener("cut", this.onCut, true);
			document.removeEventListener("copy", this.onCopy, true);
			document.removeEventListener("paste", this.onPaste, true);
			document.removeEventListener("mousemove", this.onMouseMove, true);
			this.eventListenersAdded = false;
		}
	}

	drop(event) {
		event.preventDefault();
		this.setIsDropZoneDisplayed(false);

		this.first = false;
		this.second = false;

		if (!this.props.canvasConfig.enableEditingActions) {
			return;
		}

		const nodeTemplate = this.props.canvasController.getDragNodeTemplate();
		if (nodeTemplate) {
			this.svgCanvasD3.nodeTemplateDropped(nodeTemplate, event.clientX, event.clientY);
			this.props.canvasController.nodeTemplateDragEnd();

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
	}

	dragOver(event) {
		// Drag over is continually fired so only pass on the event when the mouse
		// cursor moves a reasonable distance.
		if (Math.abs(this.dragX - event.clientX) > 5 || Math.abs(this.dragY - event.clientY) > 5) {
			this.dragX = event.clientX;
			this.dragY = event.clientY;
			const nodeTemplate = this.props.canvasController.getDragNodeTemplate();
			if (nodeTemplate) {
				this.svgCanvasD3.nodeTemplateDragOver(nodeTemplate, event.clientX, event.clientY);
			}
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

	// Handles tab key presses on our div. It also keeps track of whether
	// a tab key press is being handled using a flag.
	moveFocusToNextGroup(evt) {
		const success = this.svgCanvasD3.focusNextTabGroup(evt);
		if (success) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
		} else {
			this.props.canvasController.setFocusOnCanvas();
		}
	}

	// Handles tab+shift key presses on our div. It also keeps track of whether
	// a tab key press is being handled using a flag.
	moveFocusToPreviousGroup(evt) {
		const success = this.svgCanvasD3.focusPreviousTabGroup(evt);
		if (success) {
			CanvasUtils.stopPropagationAndPreventDefault(evt);
		} else {
			this.props.canvasController.setFocusOnCanvas();
		}
	}


	// Sets the focus on our canvas <div> so keyboard events will go to it.
	focusOnCanvas() {
		if (document.getElementById(this.svgCanvasDivId)) {
			document.getElementById(this.svgCanvasDivId).focus();
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

		const stateTag = this.getStateTag();
		const emptyCanvas = this.getEmptyCanvas();
		const returnToPreviousBtn = this.getReturnToPreviousBtn();
		const contextMenu = this.getContextMenu();
		const textToolbar = this.getTextToolbar();
		const dropZoneCanvas = this.getDropZone();
		const svgCanvasDiv = this.getSVGCanvasDiv();

		return (
			<main aria-label={this.getLabel("canvas.label")} role="main">
				<ReactResizeDetector handleWidth handleHeight onResize={this.refreshOnSizeChange} targetRef={this.contentsRef}>
					<div
						id={this.mainCanvasDivId}
						ref={this.contentsRef}
						className="common-canvas-drop-div"
						onDrop={this.drop}
						onDragOver={this.dragOver}
						onDragEnter={this.dragEnter}
						onDragLeave={this.dragLeave}
					>
						{svgCanvasDiv}
						{emptyCanvas}
						{returnToPreviousBtn}
						{stateTag}
						{contextMenu}
						{textToolbar}
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

	// Provided by Redux
	canvasConfig: PropTypes.object.isRequired,
	canvasInfo: PropTypes.object,
	selectionInfo: PropTypes.object,
	breadcrumbs: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
	canvasInfo: state.canvasinfo,
	canvasConfig: state.canvasconfig,
	selectionInfo: state.selectioninfo,
	breadcrumbs: state.breadcrumbs
});

export default connect(mapStateToProps)(injectIntl(CanvasContents));
