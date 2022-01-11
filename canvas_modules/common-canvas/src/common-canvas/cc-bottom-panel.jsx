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

/* eslint no-shadow: ["error", { "allow": ["Node", "Comment"] }] */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import Logger from "../logging/canvas-logger.js";

class CanvasBottomPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			panelHeight: 393
		};

		this.resizing = false;
		this.logger = new Logger("CC-Bottom-Panel");

		this.startResize = this.startResize.bind(this);
		this.stopResize = this.stopResize.bind(this);
		this.resize = this.resize.bind(this);
		this.onmouseUp = this.onmouseUp.bind(this);
		this.onmouseDown = this.onmouseDown.bind(this);
		this.onmouseMovey = this.onmouseMovey.bind(this);
	}

	componentDidMount() {
		document.addEventListener("mouseup", this.onmouseUp, true);
		document.addEventListener("mousedown", this.onmouseDown, true);
		document.removeEventListener("mousmove", this.onmouseMovey, true);
	}

	componentWillUnmount() {
		document.removeEventListener("mouseup", this.stopResize, true);
		document.removeEventListener("mouseup", this.onmouseUp, true);
		document.removeEventListener("mousedown", this.onmouseDown, true);
	}

	onmouseDown(e) {
		const target = e.target !== null ? e.target : e.srcElement;
		if ((e.button === 1 || e.button === 0 || target.className === "drag-y")) {
			document.onmousemove = this.onmouseMovey;
		}
	}

	onmouseUp(e) {
		document.onmousemove = false;
		document.onselectstart = false;
	}


	onmouseMovey(e) {
		const topPanel = document.querySelector(".top-panel");
		const panelContainer = document.querySelector(".main-holder");
		topPanel.style.flex = "0 0" + (e.clientY / (panelContainer.clientHeight / 83)) + "%";
	}

	startResize(evt) {
		this.resizing = true;
	}

	stopResize(evt) {
		this.resizing = false;
	}

	resize(evt) {
		if (this.resizing) {
			this.setState({ "panelHeight": this.state.panelHeight + evt.movementY });
		}
	}

	render() {
		this.logger.log("render");

		let bottomPanel = null;

		const styleObj = {
			height: this.state.panelHeight + "px"
			// transition: transitionVariable,
		};

		if (this.props.bottomPanelIsOpen) {
			bottomPanel = (
				<div className="main-holder">
					<div className="top-panel"> </div>
					<div className="drag-y"> </div>
					<div className="bottom-panel" style={styleObj}>
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
	intl: PropTypes.object.isRequired,
	canvasController: PropTypes.object.isRequired,

	// Provided by Redux
	bottomPanelIsOpen: PropTypes.bool,
	bottomPanelContent: PropTypes.object
};

const mapStateToProps = (state, ownProps) => ({
	bottomPanelIsOpen: state.bottompanel.isOpen,
	bottomPanelContent: state.bottompanel.content
});

export default connect(mapStateToProps)(injectIntl(CanvasBottomPanel));
