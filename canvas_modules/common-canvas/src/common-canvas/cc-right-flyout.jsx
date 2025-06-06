/*
 * Copyright 2017-2024 Elyra Authors
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
import Logger from "../logging/canvas-logger.js";

// Should cover at most 70% of available width.
const MAX_WIDTH_EXTEND_PERCENT = 0.7;
// Should have a minimum width of 0 to hide flyout if there is no content.
const MIN_WIDTH = 0;
// If flyout content width is not set occupy entire width to strecth content.
const DEFAULT_WIDTH = "100%";
class CommonCanvasRightFlyout extends React.Component {
	constructor(props) {
		super(props);

		// Intial width of the flyout when opened to track resize.
		this.initialWidth = MIN_WIDTH;

		this.logger = new Logger("CC-RightFlyout");

		this.rightFlyoutRef = React.createRef();

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveX = this.onMouseMoveX.bind(this);
		this.getCurrentWidth = this.getCurrentWidth.bind(this);

		this.getRightFlyoutResizeContent = this.getRightFlyoutResizeContent.bind(this);
	}

	componentDidMount() {
		// Since flyout content width can be dynamic set the initial width as per width of the content
		const currentWidth = this.getCurrentWidth();
		this.initialWidth = currentWidth;
	}

	componentWillUnmount() {
		// Reset the flyout width to adjust as per content width in next render
		this.props.canvasController.setRightFlyoutWidth(0);
	}

	onMouseDown(e) {
		// Set width as soon as resize is detected to accurately move the flyout with the drag.
		const currentWidth = this.getCurrentWidth();
		this.props.canvasController.setRightFlyoutWidth(this.limitWidth(currentWidth));

		if (e.button === 0) {
			document.addEventListener("mousemove", this.onMouseMoveX, true);
			document.addEventListener("mouseup", this.onMouseUp, true);
			this.posX = e.clientX;
			// Prevent panel contents being dragged in the test harness (which can
			// happen even though draggable is false for the contents!)
			e.preventDefault();
		}
	}

	onMouseUp() {
		document.removeEventListener("mousemove", this.onMouseMoveX, true);
		document.removeEventListener("mouseup", this.onMouseUp, true);
	}

	onMouseMoveX(e) {
		if (e.clientX) {
			const diff = e.clientX - this.posX;
			const wth = this.props.panelWidth - diff;
			this.props.canvasController.setRightFlyoutWidth(this.limitWidth(wth));
			this.posX = e.clientX;
		}
	}

	// Returns content to enable/disable resize based on feature flag.
	getRightFlyoutResizeContent() {
		let resizeContent = null;

		if (this.props.enableRightFlyoutDragToResize) {
			resizeContent = (<div className="right-flyout-drag" onMouseDown={this.onMouseDown} />);
		}

		return resizeContent;
	}

	// Returns present width of the flyout.
	getCurrentWidth() {
		let currentWidth = MIN_WIDTH;
		const el = this.rightFlyoutRef?.current;
		if (el) {
			currentWidth = el?.offsetWidth;
		}
		return currentWidth;
	}

	// Returns a new width for right panel limited by the need to enforce
	// a minimum and maximum width
	limitWidth(wd) {
		const containingDiv = document.getElementById(this.props.containingDivId);
		let width = wd;

		if (containingDiv) {
			const canvasWidth = containingDiv.getBoundingClientRect().width;
			let maxWidth = (canvasWidth + this.props.panelWidth) * MAX_WIDTH_EXTEND_PERCENT;
			// Max Width should be 70% of the total available width (canvas + rightflyout)
			if (this.props.enableLeftFlyoutUnderToolbar) {
				const leftFlyout = document.querySelector(`#${this.props.containingDivId}-left-flyout-panel`);
				const leftFlyoutWidth = leftFlyout ? leftFlyout.getBoundingClientRect().width : 0;
				if (this.props.enableRightFlyoutUnderToolbar) {
					maxWidth = (canvasWidth - leftFlyoutWidth) * MAX_WIDTH_EXTEND_PERCENT;
				} else {
					maxWidth = (canvasWidth - leftFlyoutWidth + this.props.panelWidth) * MAX_WIDTH_EXTEND_PERCENT;
				}
			} else if (this.props.enableRightFlyoutUnderToolbar) {
				maxWidth = canvasWidth * MAX_WIDTH_EXTEND_PERCENT;
			}
			width = Math.min(Math.max(width, this.initialWidth), maxWidth);
		}

		return width;
	}

	render() {
		this.logger.log("render");

		let rightFlyout = <div />; // For no content, return empty <div> so grid siziing for parent <div> work correctly.
		const rightFlyoutDragContent = this.getRightFlyoutResizeContent();

		if (this.props.content && this.props.isOpen) {
			let widthPx = this.limitWidth(this.props.panelWidth) + "px";
			// Apply 100% width if content has no width to occupy flyout.
			if (this.props.panelWidth === MIN_WIDTH) {
				widthPx = DEFAULT_WIDTH;
			}
			const rfClass = this.props.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";
			rightFlyout = (
				<div className="right-flyout-container" style={{ width: widthPx }} >
					{rightFlyoutDragContent}
					<div className={rfClass} ref={this.rightFlyoutRef}>
						{this.props.content}
					</div>
				</div>
			);
		}

		return rightFlyout;
	}
}

CommonCanvasRightFlyout.propTypes = {
	// Provided by Common Canvas
	canvasController: PropTypes.object,
	containingDivId: PropTypes.string,

	// Provided by Redux
	isOpen: PropTypes.bool,
	content: PropTypes.object,
	enableLeftFlyoutUnderToolbar: PropTypes.bool,
	enableRightFlyoutUnderToolbar: PropTypes.bool,
	enableRightFlyoutDragToResize: PropTypes.bool,
	panelWidth: PropTypes.number
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.rightflyout.isOpen,
	content: state.rightflyout.content,
	enableLeftFlyoutUnderToolbar: state.canvasconfig.enableLeftFlyoutUnderToolbar,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar,
	enableRightFlyoutDragToResize: state.canvasconfig.enableRightFlyoutDragToResize,
	panelWidth: state.rightflyout.panelWidth
});

export default connect(mapStateToProps)(CommonCanvasRightFlyout);
