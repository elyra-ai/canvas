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

class DatepickerControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(props.propertyId);
		this.locale = ControlUtils.getLocale(props.control);
		this.value = props.value ? getFormattedDate(props.value, this.props.control.dateFormat) : ""; // Assume default value is valid

		this.getDatepickerType = this.getDatepickerType.bind(this);
		this.getDatepickerSize = this.getDatepickerSize.bind(this);
	}

	// Datepicker can only be 'simple' or 'single'
	getDatepickerType() {
		return this.props.control.datepickerType === DATEPICKER_TYPE.SIMPLE ? DATEPICKER_TYPE.SIMPLE : DATEPICKER_TYPE.SINGLE;
	}

	getDatepickerSize() {
		return this.props.tableControl ? "sm" : "md";
	}

	handleChange(evt) {
		if (evt.length > 0) {
			const isoDate = getISODate(evt[0]);
			this.value = getFormattedDate(evt[0], this.props.control.dateFormat); // display value
			this.props.controller.updatePropertyValue(this.props.propertyId, isoDate); // internal format
		} else {
			this.value = "";
			this.props.controller.updatePropertyValue(this.props.propertyId, "");
		}
	}

	// Allows user to manually type in the input
	// Once the calendar closes, it will trigger an onChange evt that will correct any invalid dates
	handleInputChange(evt) {
		this.value = evt.target.value; // Display value as what user enters
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.target.value);
	}

	render() {
		const className = classNames("properties-datepicker", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<DatePicker
					datePickerType={this.getDatepickerType()}
					dateFormat={this.props.control.dateFormat}
					light={this.props.controller.getLight() && this.props.control.light}
					onChange={this.handleChange.bind(this)}
					locale={this.locale}
				>
					<DatePickerInput
						{...validationProps}
						id={this.id}
						placeholder={this.props.control.additionalText}
						labelText={this.props.controlItem}
						size={this.getDatepickerSize()}
						onChange={this.handleInputChange.bind(this)}
						value={this.value}
					/>
				</DatePicker>
				<ValidationMessage inTable={this.props.tableControl} tableOnly state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

DatepickerControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.string, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(DatepickerControl);
