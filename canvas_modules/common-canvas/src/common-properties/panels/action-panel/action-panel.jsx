/*
 * Copyright 2017-2020 IBM Corporation
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants";

class ActionPanel extends Component {
	render() {
		return (
			<div className={classNames("properties-action-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				disabled={this.props.panelState === STATES.DISABLED}
			>
				{this.props.children}
			</div>);
	}
}

ActionPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.array
	]),
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ActionPanel);
