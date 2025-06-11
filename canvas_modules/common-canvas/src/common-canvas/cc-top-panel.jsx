/*
 * Copyright 2023 Elyra Authors
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

class CanvasTopPanel extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-Top-Panel");
	}

	render() {
		this.logger.log("render");
		let topPanel = null;

		if (this.props.topPanelIsOpen) {
			topPanel = (
				<div className={"top-panel"} >
					<div className={"top-panel-contents"}>
						{this.props.topPanelContent}
					</div>
				</div>
			);
		}

		return topPanel;
	}
}

CanvasTopPanel.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object,
	containingDivId: PropTypes.string,

	// Provided by Redux
	topPanelIsOpen: PropTypes.bool,
	topPanelContent: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
	topPanelIsOpen: state.toppanel.isOpen,
	topPanelContent: state.toppanel.content
});
export default connect(mapStateToProps)(CanvasTopPanel);
