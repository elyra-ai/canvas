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
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Logger from "../logging/canvas-logger.js";

// Should cover at most 80% of available height.
const MAX_HEIGHT_EXTEND_PERCENT = 0.8;

class CanvasBottomPanel extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-Bottom-Panel");
		this.state = { isBeingDragging: false };

		this.minHeight = 0;

		this.bottomPanelRef = React.createRef();

		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMoveY = this.onMouseMoveY.bind(this);
	}

	componentDidMount() {
		// Minimum height is fixed for bottom panel.
		this.minHeight = 75;
	}

	onMouseDown(e) {
		if (e.button === 0) {
			this.setState({ isBeingDragging: true });
			document.addEventListener("mousemove", this.onMouseMoveY, true);
			document.addEventListener("mouseup", this.onMouseUp, true);
			this.posY = e.clientY;
			// Prevent panel contents being dragged in the test harness (which can
			// happen even though draggable is false for the contents!)
			e.preventDefault();
		}
	}

	onMouseUp(e) {
		this.setState({ isBeingDragging: false });
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

	limitHeight(ht) {
		const centerPanelHeight = this.props.getCenterPanelHeight();
		// Assume the bottom panel is zero height if it has not yet fully rendered.
		const bottomPanelHeight = this.bottomPanelRef?.current ? this.bottomPanelRef.current.getBoundingClientRect().height : 0;

		// Max Height should be a percentage of the total available height (center panel + bottom panel)
		const maxHeight = (centerPanelHeight + bottomPanelHeight) * MAX_HEIGHT_EXTEND_PERCENT;
		const height = Math.min(Math.max(ht, this.minHeight), maxHeight);

		return height;
	}

	render() {
		this.logger.log("render");
		let bottomPanel = null;

		if (this.props.bottomPanelIsOpen) {
			const heightPx = this.limitHeight(this.props.panelHeight) + "px";

			const className = "bottom-panel-drag" + (this.state.isBeingDragging ? " is-being-dragged" : "");

			bottomPanel = (
				<div ref={this.bottomPanelRef} className="bottom-panel" style={{ height: heightPx }} >
					<div className={className} onMouseDown={this.onMouseDown} />
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
	getCenterPanelHeight: PropTypes.func,

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
