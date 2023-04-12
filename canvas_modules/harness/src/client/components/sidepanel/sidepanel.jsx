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
import SidePanelCanvas from "./canvas/sidepanel-canvas.jsx";
import SidePanelProperties from "./properties/sidepanel-properties.jsx";
import SidePanelAPI from "./api/sidepanel-api.jsx";

import {
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL,
	SIDE_PANEL_API
} from "../../constants/constants.js";

export default class SidePanel extends React.Component {

	render() {
		if (this.props.openSidepanelCanvas ||
				this.props.openSidepanelModal ||
				this.props.openSidepanelAPI) {
			let view = null;

			switch (this.props.selectedPanel) {
			case SIDE_PANEL_CANVAS:
				view = (<SidePanelCanvas
					canvasConfig={this.props.canvasConfig}
					log={this.props.log}
					setStateValue={this.props.setStateValue}
					getStateValue={this.props.getStateValue}
				/>);
				break;
			case SIDE_PANEL_MODAL:
				view = (<SidePanelProperties
					log={this.props.log}
					propertiesConfig={this.props.propertiesConfig}
				/>);
				break;
			case SIDE_PANEL_API:
				view = (<SidePanelAPI
					log={this.props.log}
					apiConfig={this.props.apiConfig}
				/>);
				break;
			default:
			}
			return (
				<div className={"harness-app-sidepanel open"} aria-label="Right Side Panel" role="complementary">
					{view}
				</div>
			);
		}

		// Return just a div when flyout is closed. The div will allow
		// the CSS annimation to work.
		return (
			<div className={"harness-app-sidepanel"} />
		);
	}
}

SidePanel.propTypes = {
	canvasConfig: PropTypes.object,
	propertiesConfig: PropTypes.object,
	apiConfig: PropTypes.object,
	openSidepanelCanvas: PropTypes.bool,
	openSidepanelModal: PropTypes.bool,
	openSidepanelAPI: PropTypes.bool,
	selectedPanel: PropTypes.string,
	log: PropTypes.func,
	setStateValue: PropTypes.func,
	getStateValue: PropTypes.func
};
