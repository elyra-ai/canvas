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
import { v4 as uuid4 } from "uuid";

import Tooltip from "./../../../tooltip/tooltip.jsx";
import Icon from "./../../../icons/icon.jsx";
import ValidationMessage from "../../components/validation-message";
import * as ControlUtils from "../../util/control-utils";
import { getFormattedDate, getISODate } from "../../util/date-utils";
import { STATES, DATEPICKER_TYPE, MESSAGE_KEYS, CARBON_ICONS } from "../../constants/constants.js";
import { formatMessage } from "./../../util/property-utils";

class DatepickerRangeControl extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.locale = props.controller.getLocale();
		this.uuid = uuid4();

		this.state = {
			valueStart: props.value && props.value[0] ? getFormattedDate(props.value[0], this.props.control.dateFormat) : "",
			valueEnd: props.value && props.value[1] ? getFormattedDate(props.value[1], this.props.control.dateFormat) : ""
		};

		this.getDatepickerSize = this.getDatepickerSize.bind(this);
		this.createInfoDesc = this.createInfoDesc.bind(this);
	}

	onStartBlur(evt) {
		const isoStartDate = getISODate(evt.target.value, this.props.control.dateFormat);
		const isoEndDate = getISODate(this.state.valueEnd, this.props.control.dateFormat);
		this.props.controller.updatePropertyValue(this.props.propertyId, [isoStartDate, isoEndDate]);
	}

	onEndBlur(evt) {
		const isoStartDate = getISODate(evt.target.value, this.props.control.dateFormat);
		const isoEndDate = getISODate(this.state.valueEnd, this.props.control.dateFormat);
		this.props.controller.updatePropertyValue(this.props.propertyId, [isoStartDate, isoEndDate]);
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
		this.setState({ valueStart: evt.target.value }); // Display value as what user enters
	}
	handleInputEndChange(evt) {
		this.setState({ valueEnd: evt.target.value }); // Display value as what user enters
	}

	createInfoDesc(label, description, range) {
		return description
			? (<div className="properties-label-container">
				{label}
				<Tooltip
					id={`${this.uuid}-tooltip-label-${this.props.control.name}-${range}`}
					tip={description}
					tooltipLinkHandler={this.props.controller.getHandlers().tooltipLinkHandler}
					direction="bottom"
					disable={this.props.state === STATES.DISABLED}
					showToolTipOnClick
				>
					<Icon type={CARBON_ICONS.INFORMATION} className="properties-control-description-icon-info" />
				</Tooltip>
			</div>)
			: label;
	}

	render() {
		const datepickerRangeStartLabel = `${this.props.control.name}.range.start.label`;
		const datepickerRangeStartDesc = `${this.props.control.name}.range.start.desc`;
		const datepickerRangeStartHelper = `${this.props.control.name}.range.start.helper`;
		const datepickerRangeEndLabel = `${this.props.control.name}.range.end.label`;
		const datepickerRangeEndDesc = `${this.props.control.name}.range.end.desc`;
		const datepickerRangeEndHelper = `${this.props.control.name}.range.end.helper`;

		const defaultDatepickerRangeStartLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.DATEPICKER_RANGE_START_LABEL);
		const defaultDatepickerRangeEndLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.DATEPICKER_RANGE_END_LABEL);

		let startLabel = this.props.controller.getResource(datepickerRangeStartLabel, defaultDatepickerRangeStartLabel);
		const startDesc = this.props.controller.getResource(datepickerRangeStartDesc, null);
		const startHelperText = this.props.controller.getResource(datepickerRangeStartHelper, null);
		let endLabel = this.props.controller.getResource(datepickerRangeEndLabel, defaultDatepickerRangeEndLabel);
		const endDesc = this.props.controller.getResource(datepickerRangeEndDesc, null);
		const endHelperText = this.props.controller.getResource(datepickerRangeEndHelper, null);

		startLabel = this.createInfoDesc(startLabel, startDesc, "start");
		endLabel = this.createInfoDesc(endLabel, endDesc, "end");

		const className = classNames("properties-datepicker-range", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
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
						labelText={!this.props.tableControl && startLabel}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputStartChange.bind(this)}
						value={this.state.valueStart}
						onBlur={this.onStartBlur.bind(this)}
						helperText={!this.props.tableControl && startHelperText}
					/>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-end`}
						placeholder={this.props.control.additionalText}
						labelText={!this.props.tableControl && endLabel}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputEndChange.bind(this)}
						value={this.state.valueEnd}
						onBlur={this.onEndBlur.bind(this)}
						helperText={!this.props.tableControl && endHelperText}
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
