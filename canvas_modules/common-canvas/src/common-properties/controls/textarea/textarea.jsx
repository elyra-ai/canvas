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
import { TextArea } from "@carbon/react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { formatMessage } from "./../../util/property-utils";
import { STATES } from "./../../constants/constants.js";
import { CONDITION_MESSAGE_TYPE, MESSAGE_KEYS, TRUNCATE_LIMIT } from "./../../constants/constants.js";
import classNames from "classnames";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { v4 as uuid4 } from "uuid";

const newLine = "\n";

class TextareaControl extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.charLimit = ControlUtils.getCharLimit(props.control, props.controller.getMaxLengthForMultiLineControls());
		this.uuid = uuid4();
		this.id = ControlUtils.getControlId(this.props.propertyId, this.uuid);
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
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
		let value = this.props.value ? this.props.value : "";
		const joined = ControlUtils.joinNewlines(value, newLine);
		value = joined.value;
		const truncated = joined.truncated;

		let textArea = null;
		let validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);
		let showValidationMessage = false;
		// carbon textarea doesn't support warn yet
		if (validationProps.warn) {
			showValidationMessage = true;
			validationProps = {};
		}
		if (truncated) { // A value is too long to show for editing, display as readonly
			const errorMessage = {
				text: formatMessage(this.reactIntl, MESSAGE_KEYS.TRUNCATE_LONG_STRING_ERROR, { truncate_limit: TRUNCATE_LIMIT }),
				type: CONDITION_MESSAGE_TYPE.ERROR,
				validation_id: this.props.control.name
			};
			validationProps = ControlUtils.getValidationProps(errorMessage, this.props.tableControl);
			textArea = (<div>
				<TextArea
					{...validationProps}
					id={this.id}
					disabled
					placeholder={this.props.control.additionalText}
					value={value}
					labelText={this.props.controlItem}
					hideLabel={this.props.tableControl}
					helperText={this.props.control.helperText}
					readOnly={this.props.readOnly}
					aria-label={this.props.control.labelVisible ? null : this.props.control?.label?.text}
				/>
				<ValidationMessage inTable={this.props.tableControl} tableOnly={!showValidationMessage} state={""} messageInfo={errorMessage} propertyId={this.props.propertyId} />
			</div>);
		} else {
			textArea = (
				<TextArea
					{...validationProps}
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={value}
					labelText={this.props.controlItem}
					hideLabel={this.props.tableControl}
					helperText={this.props.control.helperText}
					readOnly={this.props.readOnly}
					aria-label={this.props.control.labelVisible ? null : this.props.control?.label?.text}
				/>
			);
		}

		let display = textArea;
		if (this.props.tableControl) {
			const tooltipId = "tooltip-column-textarea";
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
				direction="bottom"
				className="properties-tooltips"
				disable={disabled}
			>
				{textArea}
			</Tooltip>);
		}
		const className = classNames("properties-textarea", { "hide": hidden }, this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				{display}
				<ValidationMessage inTable={this.props.tableControl}
					tableOnly={!showValidationMessage}
					state={this.props.state}
					messageInfo={this.props.messageInfo}
					propertyId={this.props.propertyId}
				/>
			</div>

		);
	}
}

TextareaControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.array
	]), // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	readOnly: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(TextareaControl);
