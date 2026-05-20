/*
 * Copyright 2017-2026 Elyra Authors
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

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button } from "@carbon/react";
import ChevronLeft from "@carbon/icons-react/lib/ChevronLeft";
import ChevronRight from "@carbon/icons-react/lib/ChevronRight";
import Logger from "../logging/canvas-logger.js";
import FlyoutContext from "../contexts/flyout-context.jsx";

// Should cover at most 70% of available width.
const MAX_WIDTH_EXTEND_PERCENT = 0.7;

class CommonCanvasRightFlyout extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-RightFlyout");

		this.rightFlyoutRef = React.createRef();
		this.state = { isBeingDragging: false };

		this.initialMinWidth = null;

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveX = this.onMouseMoveX.bind(this);
		this.getCurrentWidth = this.getCurrentWidth.bind(this);

		this.getRightFlyoutResizeContent = this.getRightFlyoutResizeContent.bind(this);
		this.getResizeDirection = this.getResizeDirection.bind(this);
		this.resize = this.resize.bind(this);
		this.getResizeButton = this.getResizeButton.bind(this);
		this.createResizeButton = this.createResizeButton.bind(this);
		this.setWidthConstraints = this.setWidthConstraints.bind(this);
	}

	// Initializes the minimum width for the flyout panel on mount.
	// Sets the minimum width to the content's width when dynamic, unless a minimum
	// width has been specified by the application. Uses stored initialMinWidth from
	// Redux if available to persist across remounts, otherwise measures from DOM.
	componentDidMount() {
		if (typeof this.props.panelMinWidth === "undefined" || this.props.panelMinWidth === null) {
			if (typeof this.props.panelInitialMinWidth !== "undefined" && this.props.panelInitialMinWidth !== null) {
				this.initialMinWidth = this.props.panelInitialMinWidth;
			} else {
				this.initialMinWidth = this.getCurrentWidth();
				this.props.canvasController.setRightFlyoutConfig({ panelInitialMinWidth: this.initialMinWidth });
			}
		}
	}

	// Resets the minimum width when flyout content changes.
	// This allows the min width to adjust when different content is loaded.
	// Updates Redux state with the new initialMinWidth to persist the value.
	componentDidUpdate(prevProps) {
		if (prevProps.content !== this.props.content &&
		    (typeof this.props.panelMinWidth === "undefined" || this.props.panelMinWidth === null)) {
			this.initialMinWidth = this.getCurrentWidth();
			this.props.canvasController.setRightFlyoutConfig({ panelInitialMinWidth: this.initialMinWidth });
		}
	}

	onMouseDown(e) {
		if (e.button === 0) {
			this.setState({ isBeingDragging: true });
			document.addEventListener("mousemove", this.onMouseMoveX, true);
			document.addEventListener("mouseup", this.onMouseUp, true);
			this.posX = e.clientX;
			// Prevent panel contents being dragged in the test harness (which can
			// happen even though draggable is false for the contents!)
			e.preventDefault();
		}
	}

	onMouseUp() {
		this.setState({ isBeingDragging: false });
		document.removeEventListener("mousemove", this.onMouseMoveX, true);
		document.removeEventListener("mouseup", this.onMouseUp, true);
	}

	onMouseMoveX(e) {
		if (e.clientX) {
			const panelWidth = this.isPanelWidthSpecified() ? this.props.panelWidth : this.getCurrentWidth();
			const diff = e.clientX - this.posX;
			const wd = panelWidth - diff;
			const limitedWidth = this.limitWidth(wd);
			this.props.canvasController.setRightFlyoutWidth(limitedWidth);
			this.posX = e.clientX;
		}
	}

	// Returns content to enable/disable resize based on feature flag.
	getRightFlyoutResizeContent() {
		let resizeContent = null;

		if (this.props.enableRightFlyoutDragToResize) {
			const className = "right-flyout-drag" + (this.state.isBeingDragging ? " is-being-dragged" : "");

			resizeContent = (<div className={className} onMouseDown={this.onMouseDown} />);
		}

		return resizeContent;
	}

	// Returns present width of the flyout.
	getCurrentWidth() {
		return this.rightFlyoutRef?.current ? this.rightFlyoutRef?.current.getBoundingClientRect().width : 0;
	}

	// Returns the minimum width for the flyout. This will be the minimum width specified by the
	// application but, if one is not specified, the width of the flyout when it first opened.
	// Uses panelInitialMinWidth from Redux if available, otherwise uses instance variable.
	// When this flyout is first rendered, getMinWidth() will be called before initialMinWidth
	// has been set, so returns min width as zero in that case.
	getMinWidth() {
		if (typeof this.props.panelMinWidth === "undefined" || this.props.panelMinWidth === null) {
			if (typeof this.props.panelInitialMinWidth !== "undefined" && this.props.panelInitialMinWidth !== null) {
				return this.props.panelInitialMinWidth;
			}
			if (this.initialMinWidth === null) {
				return 0;
			}
			return this.initialMinWidth;
		}
		return this.props.panelMinWidth;
	}

	// Returns the maximum width for the flyout. This will be the maximum width specified by the
	// application but if one is not specified, use the calculated max based on available space.
	getMaxWidth() {
		const centerPanelWidth = this.props.getCenterPanelWidth();
		const panelWidth = this.isPanelWidthSpecified() ? this.props.panelWidth : this.getCurrentWidth();
		const availableWidth = centerPanelWidth + panelWidth;
		const minWidth = this.getMinWidth();

		let maxWidth;
		if (typeof this.props.panelMaxWidth !== "undefined" && this.props.panelMaxWidth !== null) {
			maxWidth = Math.min(this.props.panelMaxWidth, availableWidth);
		} else {
			maxWidth = availableWidth * MAX_WIDTH_EXTEND_PERCENT;
		}

		return Math.max(maxWidth, minWidth);
	}

	// Returns the appropriate resize button icon based on direction
	getResizeButton() {
		const direction = this.getResizeDirection();
		return direction === "expand" ? <ChevronLeft /> : <ChevronRight />;
	}

	// Determines which direction the button should show
	// If current width > midpoint: point left to contract to min
	// If current width <= midpoint: point right to expand to max
	getResizeDirection() {
		const currentWidth = this.isPanelWidthSpecified() ? this.props.panelWidth : this.getCurrentWidth();
		const minWidth = this.getMinWidth();
		const maxWidth = this.getMaxWidth();
		const midpoint = minWidth + ((maxWidth - minWidth) / 2);

		return currentWidth > midpoint ? "contract" : "expand";
	}

	// Callback function provided to content via context to set width constraints.
	// When Common Properties (or other content) provides min/max widths, the flyout
	// will use those values instead of calculating its own.
	//
	// @param {number} minWidth - Minimum width for the flyout content
	// @param {number} maxWidth - Maximum width for the flyout content
	// @param {boolean} enableResize - Whether to show resize button
	setWidthConstraints(minWidth, maxWidth, enableResize = true) {
		this.props.canvasController.setRightFlyoutConfig({
			panelWidth: minWidth,
			panelMinWidth: minWidth,
			panelMaxWidth: maxWidth,

			// Set flag to indicate width constraints were provided via context
			widthConstraintsProvided: true,

			// Set flag to indicate enableResize was provided from context
			enableResizeBtnProvided: enableResize
		});
	}

	// Creates and returns the resize button component.
	// Returns null if button should not be shown based on configuration and state.
	// Button is shown if:
	// 1. Canvas config enables it (enableRightFlyoutResizeButton), OR
	// 2. Content provided width constraints via context AND content enables resize
	// Button is hidden when panel is being dragged.
	//
	// @returns {React.Element|null} The resize button component or null
	createResizeButton() {
		const showViaConfig = this.props.enableRightFlyoutResizeButton;
		const showViaContext =
			this.props.widthConstraintsProvided &&
			this.props.panelMaxWidth > 0 &&
			(this.props.enableResizeBtnProvided !== false);

		if ((showViaConfig || showViaContext) && !this.state.isBeingDragging) {
			const resizeIcon = this.getResizeButton();

			const resizeBtnLabel = (resizeIcon.type === ChevronLeft)
				? this.props.canvasController.labelUtil.getLabel("flyout.resizeButton.expand")
				: this.props.canvasController.labelUtil.getLabel("flyout.resizeButton.contract");

			return (
				<Button
					kind="ghost"
					className="right-flyout-btn-resize"
					onClick={this.resize}
					aria-label={resizeBtnLabel}
				>
					{resizeIcon}
				</Button>
			);
		}

		return null;
	}

	// Resizes the panel based on button direction
	// When pointing left (contract): resize to minimum width
	// When pointing right (expand): resize to maximum width
	resize() {
		const direction = this.getResizeDirection();
		const minWidth = this.getMinWidth();
		const maxWidth = this.getMaxWidth();

		// Left arrow (contract) -> go to min width, Right arrow (expand) -> go to max width
		const newWidth = direction === "contract" ? minWidth : maxWidth;
		this.props.canvasController.setRightFlyoutWidth(newWidth);
	}

	// Returns a new width for right panel limited by the need to enforce
	// a minimum and maximum width
	limitWidth(wd) {
		const maxWidth = this.getMaxWidth();
		const minWidth = this.getMinWidth();
		const width = Math.min(Math.max(wd, minWidth), maxWidth);

		return width;
	}

	// Return true if a value is provided for this.props.panelWidth
	isPanelWidthSpecified() {
		return !(typeof this.props.panelWidth === "undefined" || this.props.panelWidth === null);
	}

	render() {
		this.logger.log("render");

		let rightFlyout = null;
		let resizeBtn = null;

		if (this.props.content && this.props.isOpen) {
			const rightFlyoutDragContent = this.getRightFlyoutResizeContent();

			const width = this.isPanelWidthSpecified() ? this.limitWidth(this.props.panelWidth) + "px" : null;

			const rfClass = this.props.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";

			// Create context value with callback to set width constraints
			const contextValue = {
				setWidthConstraints: this.setWidthConstraints
			};

			rightFlyout = (
				<div className="right-flyout" style={{ width: width }} >
					{rightFlyoutDragContent}
					<div className={rfClass} ref={this.rightFlyoutRef}>
						<FlyoutContext.Provider value={contextValue}>
							{this.props.content}
						</FlyoutContext.Provider>
					</div>
				</div>
			);

			resizeBtn = this.createResizeButton();
		}

		return (
			<div className="right-flyout-container">
				{rightFlyout}
				{resizeBtn}
			</div>
		);
	}
}

CommonCanvasRightFlyout.propTypes = {
	// Provided by Common Canvas
	canvasController: PropTypes.object,
	getCenterPanelWidth: PropTypes.func,

	// Provided by Redux
	isOpen: PropTypes.bool,
	content: PropTypes.object,
	enableRightFlyoutUnderToolbar: PropTypes.bool,
	enableRightFlyoutDragToResize: PropTypes.bool,
	enableRightFlyoutResizeButton: PropTypes.bool,
	panelWidth: PropTypes.number,
	panelMinWidth: PropTypes.number,
	panelMaxWidth: PropTypes.number,
	panelInitialMinWidth: PropTypes.number,
	widthConstraintsProvided: PropTypes.bool,
	enableResizeBtnProvided: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.rightflyout.isOpen,
	content: state.rightflyout.content,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar,
	enableRightFlyoutDragToResize: state.canvasconfig.enableRightFlyoutDragToResize,
	enableRightFlyoutResizeButton: state.canvasconfig.enableRightFlyoutResizeButton,
	panelWidth: state.rightflyout.panelWidth,
	panelMinWidth: state.rightflyout.panelMinWidth,
	panelMaxWidth: state.rightflyout.panelMaxWidth,
	panelInitialMinWidth: state.rightflyout.panelInitialMinWidth,
	widthConstraintsProvided: state.rightflyout.widthConstraintsProvided,
	enableResizeBtnProvided: state.rightflyout.enableResizeBtnProvided
});

export default connect(mapStateToProps)(CommonCanvasRightFlyout);
