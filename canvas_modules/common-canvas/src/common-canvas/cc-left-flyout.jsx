/*
 * Copyright 2024 Elyra Authors
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

class CommonCanvasLeftFlyout extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-LeftFlyout");
	}

	render() {
		this.logger.log("render");

		let leftFlyout = <div />; // For no content, return empty <div> so grid siziing for parent <div> work correctly.

		if (this.props.content && this.props.isOpen) {
			const lfClass = this.props.enableLeftFlyoutUnderToolbar
				? "left-flyout-panel under-toolbar"
				: "left-flyout-panel";
			leftFlyout = (
				<div className={lfClass} id={`${this.props.containingDivId}-left-flyout-panel`}>
					{this.props.content}
				</div>
			);
		}

		return leftFlyout;
	}
}

CommonCanvasLeftFlyout.propTypes = {
	containingDivId: PropTypes.string,
	// Provided by Redux
	isOpen: PropTypes.bool,
	content: PropTypes.object,
	enableLeftFlyoutUnderToolbar: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	isOpen: state.leftflyout.isOpen,
	content: state.leftflyout.content,
	enableLeftFlyoutUnderToolbar: state.canvasconfig.enableLeftFlyoutUnderToolbar
});

export default connect(mapStateToProps)(CommonCanvasLeftFlyout);
