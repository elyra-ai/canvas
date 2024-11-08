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

const MAX_WIDTH_EXTEND_PERCENT = 0.7; // Should cover atmost 70% of available width
const MIN_WIDTH = 300;
class CommonCanvasRightFlyout extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-RightFlyout");

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveX = this.onMouseMoveX.bind(this);
	}

	onMouseDown(e) {
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
			this.props.canvasController.setRightPanelWidth(this.limitWidth(wth));
			this.posX = e.clientX;
		}
	}

	// Returns a new width for right panel limited by the need to enforce
	// a minimum and maximum width
	limitWidth(wth) {
		const canvasContainer = document.getElementById(this.props.containingDivId);
		let width = wth;

		if (canvasContainer) {
			// Max Width should be 70% of the total available width (canvas + rightflyout)
			const canvasWidth = canvasContainer.getBoundingClientRect().width;
			const maxWidth = (canvasWidth + this.props.panelWidth) * MAX_WIDTH_EXTEND_PERCENT;
			width = Math.min(Math.max(width, MIN_WIDTH), maxWidth);
		}

		return width;
	}

	render() {
		this.logger.log("render");

		let rightFlyout = <div />; // For no content, return empty <div> so grid siziing for parent <div> work correctly.
		let rightFlyoutDragDiv = null;

		if (this.props.enableRightFlyoutDragToResize) {
			rightFlyoutDragDiv = (<div className="right-flyout-drag" onMouseDown={this.onMouseDown} />);
		}

		if (this.props.content && this.props.isOpen) {
			const widthPx = this.limitWidth(this.props.panelWidth) + "px";
			const rfClass = this.props.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";
			rightFlyout = (
				<div className="right-flyout-container" style={{ width: widthPx }} >
					{rightFlyoutDragDiv}
					<div className={rfClass}>
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
	enableRightFlyoutUnderToolbar: PropTypes.bool,
	enableRightFlyoutDragToResize: PropTypes.bool,
	panelWidth: PropTypes.number
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.rightflyout.isOpen,
	content: state.rightflyout.content,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar,
	enableRightFlyoutDragToResize: state.canvasconfig.enableRightFlyoutDragToResize,
	panelWidth: state.rightflyout.panelWidth
});

export default connect(mapStateToProps)(CommonCanvasRightFlyout);
