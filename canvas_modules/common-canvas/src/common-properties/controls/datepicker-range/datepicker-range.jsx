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
import { DatePicker, DatePickerInput } from "@carbon/react";
import classNames from "classnames";
import { v4 as uuid4 } from "uuid";

import Tooltip from "./../../../tooltip/tooltip.jsx";
import Icon from "./../../../icons/icon.jsx";
import ValidationMessage from "../../components/validation-message";
import * as ControlUtils from "../../util/control-utils";
import { getFormattedDate, getISODate, getDateObject, isValidDate } from "../../util/date-utils";
import { STATES, DATEPICKER_TYPE, MESSAGE_KEYS, CARBON_ICONS } from "../../constants/constants.js";
import { formatMessage } from "./../../util/property-utils";

class DatepickerRangeControl extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.locale = props.controller.getLocale();
		this.uuid = uuid4();

		this.dateFormat = ControlUtils.getDateTimeFormat(props.control);

		this.state = {
			valueStart: props.value && props.value[0] ? getFormattedDate(props.value[0], this.dateFormat) : "",
			valueEnd: props.value && props.value[1] ? getFormattedDate(props.value[1], this.dateFormat) : ""
		};

		this.getDatepickerSize = this.getDatepickerSize.bind(this);
		this.createInfoDesc = this.createInfoDesc.bind(this);

		this.pickerRef = React.createRef();

		this.initialValue = [
			getDateObject(this.state.valueStart, this.dateFormat),
			getDateObject(this.state.valueEnd, this.dateFormat)
		].filter(Boolean);

		this.handleNativeBlur = this.handleNativeBlur.bind(this);
	}

	// Attaches a capture-phase blur listener on each input so it runs before
	// (and can suppress) flatpickr's own blur handler.
	componentDidMount() {
		const container = document.querySelector(`[data-id="${ControlUtils.getDataId(this.props.propertyId)}"]`);
		this.rangeInputs = container ? Array.prototype.slice.call(container.querySelectorAll("input")) : [];
		this.rangeInputs.forEach((inp) => inp.addEventListener("blur", this.handleNativeBlur));
	}

	componentWillUnmount() {
		(this.rangeInputs || []).forEach((inp) => inp.removeEventListener("blur", this.handleNativeBlur));
	}

	getDatepickerSize() {
		return this.props.tableControl ? "sm" : "md";
	}

	// Returns Carbon's underlying flatpickr instance and, on first access,
	// disables flatpickr's own outside-click handler via ignoredFocusElements.
	getCalendar() {
		const calendar = this.pickerRef.current ? this.pickerRef.current.calendar : null;
		if (calendar && !this.calendarPatched && calendar.config && calendar.config.ignoredFocusElements) {
			calendar.config.ignoredFocusElements.push(document.documentElement);
			this.calendarPatched = true;
		}
		return calendar;
	}

	// Commits the displayed values to Redux without touching flatpickr.
	handleNativeBlur(evt) {
		evt.stopImmediatePropagation();
		const container = evt.target.closest(".properties-datepicker-range");
		const inputs = container ? container.querySelectorAll("input") : [];
		this.commitTyped(inputs[0] ? inputs[0].value : "", inputs[1] ? inputs[1].value : "", null);
	}

	// This handles changes for simple, single, and the start range date
	handleDateRangeChange(evt) {
		if (evt[0]) {
			const isoStartDate = getISODate(evt[0]); // internal format
			const valueStart = getFormattedDate(evt[0], this.dateFormat); // display value
			let isoEndDate = "";
			let valueEnd = "";

			if (evt[1]) { // Cannot enter end date without specifying start date
				isoEndDate = getISODate(evt[1]); // internal format
				valueEnd = getFormattedDate(evt[1], this.dateFormat); // display value
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, [isoStartDate, isoEndDate]);
			this.setState({ valueStart, valueEnd });
		}
	}

	handleInputFocus() {
		this.getCalendar();
	}

	// Commits the pair to Redux. When `inputs` is provided, also syncs flatpickr's
	// selectedDates so its own blur handler doesn't restore stale values.
	commitTyped(valueStart, valueEnd, inputs) {
		const startValid = isValidDate(valueStart, this.dateFormat);
		const endValid = isValidDate(valueEnd, this.dateFormat);

		if ((!startValid && valueStart) || (!endValid && valueEnd)) {
			return;
		}
		const isoStart = startValid ? getISODate(valueStart, this.dateFormat) : "";
		const isoEnd = endValid ? getISODate(valueEnd, this.dateFormat) : "";
		this.props.controller.updatePropertyValue(this.props.propertyId, [isoStart, isoEnd]);

		const calendar = inputs === null ? null : this.getCalendar();
		if (calendar) {
			const dates = [];
			if (startValid) {
				dates.push(valueStart);
			}
			if (endValid) {
				dates.push(valueEnd);
			}
			if (dates.length > 0) {
				calendar.setDate(dates, false, calendar.config.dateFormat);
			} else {
				calendar.clear(false);
			}

			if (inputs && inputs[0]) {
				inputs[0].value = valueStart;
			}
			if (inputs && inputs[1]) {
				inputs[1].value = valueEnd;
			}
		}
	}

	// Mirrors typed input into state and commits.
	handleInputStartChange(evt) {
		this.setState({ valueStart: evt.target.value });
		this.commitFromInputs(evt.target);
	}
	handleInputEndChange(evt) {
		this.setState({ valueEnd: evt.target.value });
		this.commitFromInputs(evt.target);
	}

	// Reads both inputs from the DOM and commits. Reading the DOM (rather than
	// mixing the event value with state) makes flatpickr's echoed input events
	// after a calendar pick a no-op.
	commitFromInputs(target) {
		const container = target.closest(".properties-datepicker-range");
		const inputs = container ? container.querySelectorAll("input") : [];
		this.commitTyped(inputs[0] ? inputs[0].value : "", inputs[1] ? inputs[1].value : "", inputs);
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
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
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

		const className = classNames("properties-datepicker-range", "properties-input-control", { "hide": hidden },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<DatePicker
					ref={this.pickerRef}
					datePickerType={DATEPICKER_TYPE.RANGE}
					dateFormat={this.dateFormat}
					onChange={this.handleDateRangeChange.bind(this)}
					locale={this.locale}
					allowInput
					readOnly={this.props.readOnly}
					value={this.initialValue}
				>
					<DatePickerInput
						{...validationProps}
						id={`${this.id}-start`}
						placeholder={this.props.control.additionalText}
						labelText={!this.props.tableControl && startLabel}
						disabled={this.props.state === STATES.DISABLED}
						size={this.getDatepickerSize()}
						onChange={this.handleInputStartChange.bind(this)}
						onFocus={this.handleInputFocus.bind(this)}
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
						onFocus={this.handleInputFocus.bind(this)}
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
	messageInfo: PropTypes.object, // pass in by redux
	readOnly: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(DatepickerRangeControl);
