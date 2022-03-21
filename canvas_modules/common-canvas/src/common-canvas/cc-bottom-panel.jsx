/*
 * Copyright 2017-2022 Elyra Authors
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
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Logger from "../logging/canvas-logger.js";

class CanvasBottomPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			panelHeight: 393
		};

		this.logger = new Logger("CC-Bottom-Panel");

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveY = this.onMouseMoveY.bind(this);
	}

	componentWillUnmount() {
		document.removeEventListener("mouseup", this.onMouseUp, false);
	}

	onMouseDown(e) {
		if (e.button === 0) {
			document.addEventListener("mousemove", this.onMouseMoveY);
			this.poseY = e.clientY;
		}
	}

	onMouseUp(e) {
		document.removeEventListener("mousemove", this.onMouseMoveY);
	}

	onMouseMoveY(e) {
		if (e.clientY) {
			const diff = e.clientY - this.poseY;
			this.setState({
				panelHeight: this.state.panelHeight - diff
			});
			this.poseY = e.clientY;
		}
	}
	render() {
		this.logger.log("render");
		let bottomPanel = null;

		if (this.props.bottomPanelIsOpen) {
			document.addEventListener("mouseup", this.onMouseUp, true);
			const canvasContainer = document.querySelector(".common-canvas-drop-div");
			const rectHeight = canvasContainer
				? canvasContainer.getBoundingClientRect().height
				: 0;
			const marginTop = 60;
			const height = this.state.panelHeight >= (rectHeight - marginTop)
				? (rectHeight - marginTop)
				: this.state.panelHeight;

			bottomPanel = (
				<div className="bottom-panel" style={{ height }} >
					<div className="bottom-panel-drag" onMouseDown={this.onMouseDown} />
					<div className="bottom-panel-contents">
						{this.props.bottomPanelContent}
					</div>
				</div>
			);
		}

		return bottomPanel;
	}
}

CanvasBottomPanel.propTypes = {
	// Provided by Redux
	bottomPanelIsOpen: PropTypes.bool,
	bottomPanelContent: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
	bottomPanelIsOpen: state.bottompanel.isOpen,
	bottomPanelContent: state.bottompanel.content
});
export default connect(mapStateToProps)(CanvasBottomPanel);
