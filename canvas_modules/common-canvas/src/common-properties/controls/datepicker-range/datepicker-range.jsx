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
import { STATES, DATEPICKER_TYPE, MESSAGE_KEYS } from "../../constants/constants.js";
import { formatMessage } from "./../../util/property-utils";

class DatepickerRangeControl extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.locale = ControlUtils.getLocale(props.control);
		this.startLabel = props.control.datepickerRangeStartText
			? props.control.datepickerRangeStartText
			: formatMessage(this.reactIntl, MESSAGE_KEYS.DATEPICKER_RANGE_START_LABEL);
		this.endLabel = props.control.datepickerRangeEndText
			? props.control.datepickerRangeEndText
			: formatMessage(this.reactIntl, MESSAGE_KEYS.DATEPICKER_RANGE_END_LABEL);

		this.state = {
			valueStart: props.value && props.value[0] ? getFormattedDate(props.value[0], this.props.control.dateFormat) : "",
			valueEnd: props.value && props.value[1] ? getFormattedDate(props.value[1], this.props.control.dateFormat) : ""
		};

		this.getDatepickerSize = this.getDatepickerSize.bind(this);
	}

	getDatepickerSize() {
		return this.props.tableControl ? "sm" : "md";
	}

	// This handles changes for simple, single, and the start range date
	handleDateRangeChange(evt) {
		if (evt[0]) {
			const isoStartDate = getISODate(evt[0]); // internal format
			const valueStart = getFormattedDate(evt[0], this.props.control.dateFormat); // display value
			let isoEndDate = "";
			let valueEnd = "";

			if (evt[1]) { // Cannot enter end date without specifying start date
				isoEndDate = getISODate(evt[1]); // internal format
				valueEnd = getFormattedDate(evt[1], this.props.control.dateFormat); // display value
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, [isoStartDate, isoEndDate]);
			this.setState({ valueStart, valueEnd });
		}
	}

	// Allows user to manually type in the input
	// Once the calendar closes, it will trigger an onChange evt that will correct any invalid dates
	handleInputStartChange(evt) {
		const valueStart = evt.target.value; // Display value as what user enters
		this.props.controller.updatePropertyValue(this.props.propertyId, [evt.target.value, getISODate(this.state.valueEnd)]);
		this.setState({ valueStart });
	}
	handleInputEndChange(evt) {
		const valueEnd = evt.target.value; // Display value as what user enters
		this.props.controller.updatePropertyValue(this.props.propertyId, [getISODate(this.state.valueStart), evt.target.value]);
		this.setState({ valueEnd });
	}

	render() {
		const className = classNames("properties-datepicker", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				{!this.props.tableControl && this.props.controlItem}
				<DatePicker
					datePickerType={DATEPICKER_TYPE.RANGE}
					dateFormat={this.props.control.dateFormat}
					light={this.props.controller.getLight() && this.props.control.light}
					onChange={this.handleDateRangeChange.bind(this)}
					locale={this.locale}
					allowInput
				>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-start`}
						placeholder={this.props.control.additionalText}
						labelText={!this.props.tableControl && this.startLabel}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputStartChange.bind(this)}
						value={this.state.valueStart}
					/>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-end`}
						placeholder={this.props.control.additionalText}
						labelText={!this.props.tableControl && this.endLabel}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputEndChange.bind(this)}
						value={this.state.valueEnd}
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
