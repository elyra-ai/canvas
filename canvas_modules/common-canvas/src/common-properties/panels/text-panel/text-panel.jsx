/*
 * Copyright 2017-2020 Elyra Authors
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
import { evaluateText } from "./../../util/property-utils.js";
import classNames from "classnames";
import { STATES } from "./../../constants/constants";
import { get } from "lodash";

class TextPanel extends Component {
	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		const label = this.props.panel.label ? (<div className="panel-label">{this.props.panel.label}</div>) : null;
		const description = this.props.panel.description
			? (<div className="panel-description">{evaluateText(this.props.panel.description, this.props.controller)}</div>)
			: null;
		return (
			<div
				className={classNames(
					"properties-text-panel",
					{ "hide": this.props.panelState === STATES.HIDDEN },
					{ "properties-control-nested-panel": get(this.props.panel, "nestedPanel", false) },
					className
				)}
				disabled={this.props.panelState === STATES.DISABLED}
			>
				{label}
				{description}
			</div>);
	}
}

TextPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id }),
	propertyValues: ownProps.controller.getPropertyValues() // not used locally but needed to cause a rerender to evaluate text with a property value
});

export default connect(mapStateToProps, null)(TextPanel);
