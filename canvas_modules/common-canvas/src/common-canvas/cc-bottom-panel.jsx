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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Logger from "../logging/canvas-logger.js";

// Margin must be equal to or greater than the toolbar height
// plus the minimum allowed height for the canvas which is 150px.
const MARGIN_TOP = 200;
const MIN_HEIGHT = 75;
const TOP_PANEL_CLASSNAME = "top-panel";

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
			// Prevent panel contents being dragged in the test harness (which can
			// happen even though draggable is false for the contents!)
			e.preventDefault();
		}
	}

	onMouseUp(e) {
		document.removeEventListener("mousemove", this.onMouseMoveY, true);
		document.removeEventListener("mouseup", this.onMouseUp, true);
	}

	onMouseMoveY(e) {
		if (e.clientY) {
			const diff = e.clientY - this.posY;
			const ht = this.props.panelHeight - diff;
			this.props.canvasController.setBottomPanelHeight(this.limitHeight(ht));
			this.posY = e.clientY;
		}
	}

	// Returns a new height for the bottom panel limited by the need to enforce
	// a minimum and maximum height.
	limitHeight(ht) {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const topPanelDiv = document.getElementsByClassName(TOP_PANEL_CLASSNAME);
		let height = ht;
		let topPanelHeight = 0;

		// Consider top panel height while calculating maxHeight to disable scroll
		// in right flyout.
		if (topPanelDiv.length > 0) {
			topPanelHeight = topPanelDiv[0].getBoundingClientRect().height;
		}

		// containingDiv may not be available in some test situations
		if (containingDiv) {
			const containingDivHt = containingDiv.getBoundingClientRect().height;
			const maxHeight = containingDivHt - MARGIN_TOP - topPanelHeight;
			height = Math.min(Math.max(height, MIN_HEIGHT), maxHeight);
		}
		return height;
	}

	render() {
		this.logger.log("render");
		let bottomPanel = null;

		if (this.props.bottomPanelIsOpen) {
			const heightPx = this.limitHeight(this.props.panelHeight) + "px";

			bottomPanel = (
				<div className="bottom-panel" style={{ height: heightPx }} >
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
	containingDivId: PropTypes.string,

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
