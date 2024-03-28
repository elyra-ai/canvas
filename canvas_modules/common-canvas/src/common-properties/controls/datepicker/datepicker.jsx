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
import { DatePicker, DatePickerInput, Layer } from "@carbon/react";
import classNames from "classnames";

import ValidationMessage from "../../components/validation-message";
import * as ControlUtils from "../../util/control-utils";
import { getFormattedDate, getISODate } from "../../util/date-utils";
import { STATES, DATEPICKER_TYPE } from "../../constants/constants.js";

class DatepickerControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(props.propertyId);
		this.locale = props.controller.getLocale();

		this.dateFormat = ControlUtils.getDateTimeFormat(props.control);

		this.state = {
			value: props.value ? getFormattedDate(props.value, this.dateFormat) : ""
		};

		this.getDatepickerSize = this.getDatepickerSize.bind(this);
	}

	getDatepickerSize() {
		return this.props.tableControl ? "sm" : "md";
	}

	handleChange(evt) {
		if (evt.length > 0) {
			const isoDate = getISODate(evt[0]);
			const value = getFormattedDate(evt[0], this.dateFormat); // display value
			this.props.controller.updatePropertyValue(this.props.propertyId, isoDate); // internal format
			this.setState({ value });
		} else {
			this.props.controller.updatePropertyValue(this.props.propertyId, "");
			this.setState({ value: "" });
		}
	}

	// Allows user to manually type in the input
	// Once the calendar closes, it will trigger an onChange evt that will correct any invalid dates
	handleInputChange(evt) {
		const value = evt.target.value; // Display value as what user enters
		this.setState({ value });
	}

	render() {
		const helperText = this.props.controller.getResource(`${this.props.control.name}.helper`, null);
		const className = classNames("properties-datepicker", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<Layer level={this.props.controller.getLight() && this.props.control.light ? 1 : 0}>
					<DatePicker
						className="properties-datepicker-wrapper-parent"
						datePickerType={DATEPICKER_TYPE.SINGLE}
						dateFormat={this.dateFormat}
						onChange={this.handleChange.bind(this)}
						locale={this.locale}
					>
						<DatePickerInput
							{...validationProps}
							id={this.id}
							className="properties-datepicker-wrapper-input"
							placeholder={this.props.control.additionalText}
							labelText={!this.props.tableControl && this.props.controlItem}
							disabled={this.props.state === STATES.DISABLED}
							size={this.getDatepickerSize()}
							onChange={this.handleInputChange.bind(this)}
							value={this.state.value}
							helperText={!this.props.tableControl && helperText}
						/>
					</DatePicker>
				</Layer>
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
