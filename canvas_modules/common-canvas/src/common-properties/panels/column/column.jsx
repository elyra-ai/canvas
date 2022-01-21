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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import * as ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class ColumnPanel extends React.Component {
	constructor(props) {
		super(props);
		let gridColumns = "";
		props.children.forEach((item, idx) => {
			if (idx === 0) {
				gridColumns = "1fr";
			} else {
				gridColumns += " 1fr";
			}
		});
		this.style = {
			"gridTemplateColumns": gridColumns
		};
	}

	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		// grid-template-columns
		return (
			<div
				className={classNames(
					"properties-column-panel",
					{ "hide": this.props.panelState === STATES.HIDDEN },
					{ "properties-control-nested-panel": this.props.panel.nestedPanel },
					className
				)}
				disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				style={this.style}
			>
				{this.props.children}
			</div>
		);
	}
}

ColumnPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ColumnPanel);
