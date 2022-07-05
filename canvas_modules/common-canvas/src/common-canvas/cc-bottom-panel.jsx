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

		this.logger = new Logger("CC-Bottom-Panel");

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveY = this.onMouseMoveY.bind(this);
	}

	onMouseDown(e) {
		if (e.button === 0) {
			document.addEventListener("mousemove", this.onMouseMoveY, true);
			document.addEventListener("mouseup", this.onMouseUp, true);
			this.posY = e.clientY;
		}
	}

	onMouseUp(e) {
		document.removeEventListener("mousemove", this.onMouseMoveY, true);
		document.removeEventListener("mouseup", this.onMouseUp, true);
	}

	onMouseMoveY(e) {
		if (e.clientY) {
			const diff = e.clientY - this.posY;
			this.props.canvasController.setBottomPanelHeight(this.props.panelHeight - diff);
			this.posY = e.clientY;
		}
	}
	render() {
		this.logger.log("render");
		let bottomPanel = null;

		if (this.props.bottomPanelIsOpen) {
			const canvasContainer = document.querySelector(".common-canvas-drop-div");
			const rectHeight = canvasContainer
				? canvasContainer.getBoundingClientRect().height
				: 0;
			const marginTop = 60;
			const minHeight = 75;
			const maxHeight = rectHeight - marginTop;
			let height = Math.max(this.props.panelHeight, minHeight);
			height = Math.min(height, maxHeight);

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
	// Provided by CommonCanvas
	canvasController: PropTypes.object,

	// Provided by Redux
	bottomPanelIsOpen: PropTypes.bool,
	bottomPanelContent: PropTypes.object,
	panelHeight: PropTypes.number
};

const mapStateToProps = (state, ownProps) => ({
	bottomPanelIsOpen: state.bottompanel.isOpen,
	bottomPanelContent: state.bottompanel.content,
	panelHeight: state.bottompanel.panelHeight
});
export default connect(mapStateToProps)(CanvasBottomPanel);
