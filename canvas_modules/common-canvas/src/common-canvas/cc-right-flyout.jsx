/*
 * Copyright 2017-2025 Elyra Authors
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

class CommonCanvasRightFlyout extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-RightFlyout");

		this.rightFlyoutRef = React.createRef();
		this.state = { isBeingDragging: false };

		this.minWidth = 0;

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveX = this.onMouseMoveX.bind(this);
		this.getCurrentWidth = this.getCurrentWidth.bind(this);

		this.getRightFlyoutResizeContent = this.getRightFlyoutResizeContent.bind(this);
	}

	componentDidMount() {
		// Since flyout content width can be dynamic set the minimum width to width of the content
		this.minWidth = this.getCurrentWidth();
	}

	componentWillUnmount() {
		// Reset the flyout width so the content will control the width next time the flyout is mounted.
		this.props.canvasController.setRightFlyoutWidth(0);
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
			const diff = e.clientX - this.posX;
			const wd = this.props.panelWidth - diff;
			this.props.canvasController.setRightFlyoutWidth(this.limitWidth(wd));
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

	// Returns a new width for right panel limited by the need to enforce
	// a minimum and maximum width
	limitWidth(wd) {
		const centerPanelWidth = this.props.getCenterPanelWidth();

		// Max Width should be a percentage of the total available width (center panel + rightflyout)
		const maxWidth = (centerPanelWidth + this.props.panelWidth) * MAX_WIDTH_EXTEND_PERCENT;
		const width = Math.min(Math.max(wd, this.minWidth), maxWidth);

		return width;
	}

	render() {
		this.logger.log("render");

		let rightFlyout = null;

		if (this.props.content && this.props.isOpen) {
			const rightFlyoutDragContent = this.getRightFlyoutResizeContent();

			const widthPx = this.limitWidth(this.props.panelWidth) + "px";

			const rfClass = this.props.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";

			rightFlyout = (
				<div className="right-flyout" style={{ width: widthPx }} >
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
	getCenterPanelWidth: PropTypes.func,

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
