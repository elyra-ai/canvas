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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { Checkbox } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { TOOL_TIP_DELAY, STATES } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import uuid4 from "uuid/v4";
import classNames from "classnames";

class CheckboxControl extends React.Component {

	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(value) {
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		const label = this.props.control.label ? this.props.control.label.text : "";
		const tooltipId = uuid4() + "-tooltip-" + this.props.control.name;
		let tooltip = "";
		if (this.props.control.description && !(this.props.state === STATES.DISABLED || this.props.state === STATES.HIDDEN) && !this.props.tableControl) {
			tooltip = (
				<span >{this.props.control.description.text}</span>
			);
		}
		return (
			<div className={classNames("properties-checkbox", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null)}
				data-id={ControlUtils.getDataId(this.props.propertyId)}
			>
				<div className="properties-tooltips-container">
					<Tooltip
						id={tooltipId}
						tip={tooltip}
						direction="right"
						delay={TOOL_TIP_DELAY}
						className="properties-tooltips"
						disable={isEmpty(tooltip)}
					>
						<Checkbox
							disabled={this.props.state === STATES.DISABLED}
							id={this.id}
							labelText={label}
							onChange={this.handleChange.bind(this)}
							checked={Boolean(this.props.value)}
							hideLabel={this.props.tableControl}
						/>
					</Tooltip>
				</div>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.controller.getErrorMessage(this.props.propertyId)} />
			</div>
		);
	}
}

CheckboxControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.bool, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CheckboxControl);
