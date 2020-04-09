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
import { TextArea } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import { CHARACTER_LIMITS, TOOL_TIP_DELAY } from "./../../constants/constants.js";
import classNames from "classnames";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import uuid4 from "uuid/v4";

const newLine = "\n";

class TextareaControl extends React.Component {
	constructor(props) {
		super(props);
		this.charLimit = ControlUtils.getCharLimit(props.control, CHARACTER_LIMITS.TEXT_AREA);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(evt) {
		let value = evt.target.value;
		if (this.charLimit !== -1 && value) {
			value = value.substring(0, this.charLimit);
		}
		if (this.props.control.valueDef && this.props.control.valueDef.isList) { // array
			value = ControlUtils.splitNewlines(value, newLine);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	render() {
		let value = this.props.value ? this.props.value : "";
		value = ControlUtils.joinNewlines(value, newLine);
		const textArea =
			(
				<TextArea
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={value}
					labelText={this.props.control.label ? this.props.control.label.text : ""}
					hideLabel
				/>
			);
		let display = textArea;
		if (this.props.tableControl) {
			const tooltipId = uuid4() + "-tooltip-column-" + this.props.propertyId.toString();
			let disabled = true;
			if (value && this.props.state !== STATES.DISABLED) {
				disabled = false;
			}
			const tooltip = (
				<div className="properties-tooltips">
					{String(value)}
				</div>
			);
			display = (<Tooltip
				id={tooltipId}
				tip={tooltip}
				direction="top"
				delay={TOOL_TIP_DELAY}
				className="properties-tooltips"
				disable={disabled}
			>
				{textArea}
			</Tooltip>);
		}
		const className = classNames("properties-textarea", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				{display}
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>

		);
	}
}

TextareaControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.array
	]), // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(TextareaControl);
