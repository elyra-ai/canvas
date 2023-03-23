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
import { DatePicker, DatePickerInput } from "carbon-components-react";
import classNames from "classnames";

import ValidationMessage from "../../components/validation-message";
import * as ControlUtils from "../../util/control-utils";
import { getFormattedDate, getISODate } from "../../util/date-utils";
import { STATES, DATEPICKER_TYPE } from "../../constants/constants.js";

class DatepickerRangeControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.locale = ControlUtils.getLocale(props.control);
		this.valueStart = props.value && props.value[0] ? getFormattedDate(props.value[0], this.props.control.dateFormat) : ""; // Assume default value is valid
		this.valueEnd = props.value && props.value[1] ? getFormattedDate(props.value[1], this.props.control.dateFormat) : ""; // Assume default value is valid

		this.getDatepickerSize = this.getDatepickerSize.bind(this);
	}

	getDatepickerSize() {
		return this.props.tableControl ? "sm" : "md";
	}

	// This handles changes for simple, single, and the start range date
	handleDateRangeChange(evt) {
		if (evt[0]) {
			const isoStartDate = getISODate(evt[0]); // internal format
			this.valueStart = getFormattedDate(evt[0], this.props.control.dateFormat); // display value
			let isoEndDate = "";

			if (evt[1]) { // Cannot enter end date without specifying start date
				isoEndDate = getISODate(evt[1]); // internal format
				this.valueEnd = getFormattedDate(evt[1], this.props.control.dateFormat); // display value
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, [isoStartDate, isoEndDate]);
		}
	}

	// Allows user to manually type in the input
	// Once the calendar closes, it will trigger an onChange evt that will correct any invalid dates
	handleInputStartChange(evt) {
		this.valueStart = evt.target.value; // Display value as what user enters
		this.props.controller.updatePropertyValue(this.props.propertyId, [evt.target.value, getISODate(this.valueEnd)]);
	}
	handleInputEndChange(evt) {
		this.valueEnd = evt.target.value; // Display value as what user enters
		this.props.controller.updatePropertyValue(this.props.propertyId, [getISODate(this.valueStart), evt.target.value]);
	}

	render() {
		const className = classNames("properties-datepicker", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		// TODO: how will validations work for range if only one has error
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<DatePicker
					datePickerType={DATEPICKER_TYPE.RANGE}
					dateFormat={this.props.control.dateFormat}
					light={this.props.controller.getLight() && this.props.control.light}
					onChange={this.handleDateRangeChange.bind(this)}
					locale={this.locale}
				>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-start`}
						placeholder={this.props.control.additionalText}
						labelText={this.props.controlItem}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputStartChange.bind(this)}
						value={this.valueStart}
					/>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-end`}
						placeholder={this.props.control.additionalText}
						labelText={this.props.controlItem}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputEndChange.bind(this)}
						value={this.valueEnd}
					/>
				</DatePicker>
				<ValidationMessage inTable={this.props.tableControl} tableOnly state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

DatepickerRangeControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(DatepickerRangeControl);
