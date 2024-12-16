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
import classNames from "classnames";
import * as ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class ControlPanel extends React.Component {

	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		const controlPanel = this.props.children.length > 0
			? (
				<div
					className={classNames(
						"properties-control-panel",
						{ "hide": this.props.panelState === STATES.HIDDEN },
						{ "properties-control-nested-panel": this.props.panel.nestedPanel },
						{ "tearsheet-container": this.props.controller.isTearsheetContainer() },
						className
					)}
					disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				>
					{this.props.children}
				</div>
			)
			: null;
		return controlPanel;
	}
}

ControlPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ControlPanel);
