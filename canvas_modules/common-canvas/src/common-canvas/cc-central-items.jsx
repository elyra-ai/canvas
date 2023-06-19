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
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CanvasContents from "./cc-contents.jsx";
import CommonCanvasToolbar from "./cc-toolbar.jsx";
import CommonCanvasRightFlyout from "./cc-right-flyout.jsx";
import CanvasBottomPanel from "./cc-bottom-panel.jsx";
import CanvasTopPanel from "./cc-top-panel.jsx";
import NotificationPanel from "../notification-panel/notification-panel.jsx";
import Logger from "../logging/canvas-logger.js";

class CommonCanvasCentralItems extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-CentralItems");
	}

	render() {
		this.logger.log("render");

		const rightFlyout = (<CommonCanvasRightFlyout />);
		const canvasToolbar = (<CommonCanvasToolbar canvasController={this.props.canvasController} />);
		const notificationPanel = (<NotificationPanel canvasController={this.props.canvasController} />);
		const canvasContents = (<CanvasContents canvasController={this.props.canvasController} />);
		const bottomPanel = (<CanvasBottomPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);
		const topPanel = (<CanvasTopPanel canvasController={this.props.canvasController} containingDivId={this.props.containingDivId} />);

		let centralItems = null;
		if (this.props.enableRightFlyoutUnderToolbar) {
			centralItems = (
				<div className="common-canvas-right-side-items-under-toolbar">
					{canvasToolbar}
					<div id={this.props.containingDivId} className="common-canvas-items-container-under-toolbar">
						<div className="common-canvas-with-bottom-panel">
							{canvasContents}
							{topPanel}
							{bottomPanel}
						</div>
						<div>
							{rightFlyout}
						</div>
						{notificationPanel}
					</div>
				</div>
			);

		} else {
			centralItems = (
				<div className="common-canvas-right-side-items">
					<div id={this.props.containingDivId} className="common-canvas-items-container">
						{canvasToolbar}
						{canvasContents}
						{topPanel}
						{bottomPanel}
						{notificationPanel}
					</div>
					{rightFlyout}
				</div>
			);
		}

		return centralItems;
	}
}

CommonCanvasCentralItems.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by Redux
	enableRightFlyoutUnderToolbar: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	enableRightFlyoutUnderToolbar: state.canvasconfig.enableRightFlyoutUnderToolbar
});

export default connect(mapStateToProps)(CommonCanvasCentralItems);
