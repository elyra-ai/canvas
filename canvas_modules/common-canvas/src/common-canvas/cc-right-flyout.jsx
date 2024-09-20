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

const MIN_WIDTH = 300;
const MAX_WIDTH_EXTEND_PERCENT = 0.7; // Should cover atmost 70% of available width
class CommonCanvasRightFlyout extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-RightFlyout");

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveX = this.onMouseMoveX.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
	}

	onMouseDown(e) {
		if (e.button === 0) {
			document.addEventListener("mousemove", this.onMouseMoveX, true);
			document.addEventListener("mouseup", this.onMouseUp, true);
			this.posX = e.clientX;
			this.startWidth = this.commonCanvasRightFlyout.offsetWidth;

			e.preventDefault();
		}
	}

	onMouseUp() {
		document.removeEventListener("mousemove", this.onMouseMoveX, true);
		document.removeEventListener("mouseup", this.onMouseUp, true);
	}

	onMouseMoveX(e) {
		if (e.clientX) {
			const newWidth = this.startWidth + (this.posX - e.clientX);
			this.commonCanvasRightFlyout.style.width = `${this.limitWidth(newWidth)}px`;
		}
	}

	limitWidth(wth) {
		const canvasContainer = document.getElementById(this.props.containingDivId);
		let width = wth;

		if (canvasContainer) {
			// Max Width should be 70% of the total available width (canvas + rightflyout)
			const totalAvialableWidth = canvasContainer.getBoundingClientRect().width + this.commonCanvasRightFlyout.offsetWidth;
			const maxWidth = MAX_WIDTH_EXTEND_PERCENT * totalAvialableWidth;
			width = Math.min(Math.max(width, MIN_WIDTH), maxWidth);
		}

		return width;
	}

	render() {
		this.logger.log("render");

		let rightFlyout = <div />; // For no content, return empty <div> so grid siziing for parent <div> work correctly.

		if (this.props.content && this.props.isOpen) {
			const rfClass = this.props.enableRightFlyoutUnderToolbar
				? "right-flyout-panel under-toolbar"
				: "right-flyout-panel";
			rightFlyout = (
				<div className={rfClass} ref={ (ref) => (this.commonCanvasRightFlyout = ref) }>
					<div
						kind="ghost"
						className="right-flyout-resize-handle"
						onMouseDown={this.onMouseDown}
					/>
					{this.props.content}
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
	enableRightFlyoutUnderToolbar: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.rightflyout.isOpen,
	content: state.rightflyout.content,
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar
});

export default connect(mapStateToProps)(CommonCanvasRightFlyout);
