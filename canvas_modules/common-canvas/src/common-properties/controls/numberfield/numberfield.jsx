/*
 * Copyright 2017-2026 Elyra Authors
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
import { NumberInput, Button } from "@carbon/react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { formatMessage } from "./../../util/property-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants.js";
import classNames from "classnames";
import { ControlType, Type } from "./../../constants/form-constants"; // Type is used to check whether the field is declared as integer or long
// Carbon icons - direct imports for tree-shaking optimization
import Shuffle from "@carbon/icons-react/lib/Shuffle";
import { has } from "lodash";

class NumberfieldControl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			invalidNumber: false
		};
		this.numberInput = React.createRef();
		this.onDirection = this.onDirection.bind(this);
		this.generateNumber = this.generateNumber.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.reactIntl = props.controller.getReactIntl();
	}

	onDirection(direction) {
		let originalValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof originalValue === "undefined" || originalValue === null) {
			originalValue = 0;
		}
		const decimalsInOriginalValue = (originalValue.toString()).split(".")[1];
		this.props.control.increment = this.props.control.increment ? this.props.control.increment : 1;
		const decimalsInIncrement = (this.props.control.increment.toString()).split(".")[1];
		const numValue = direction === "up" ? Number(originalValue) + this.props.control.increment : Number(originalValue) - this.props.control.increment;
		if (decimalsInIncrement) {
			let decimalPrecision = decimalsInIncrement.length;
			if (decimalsInOriginalValue) {
				decimalPrecision = decimalsInOriginalValue.length >= decimalsInIncrement.length ? decimalsInOriginalValue.length : decimalsInIncrement.length;
			}
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(numValue.toFixed(decimalPrecision)));
		} else {
			this.props.controller.updatePropertyValue(this.props.propertyId, numValue);
		}
	}

	onKeyUp(evt) {
		// When user enters any non numeric characters in an empty numberfied control, show invalid number error
		if (
			evt.target.validity && evt.target.validity.badInput ||
			(!isFinite(this.numberInput.current.value))
		) {
			this.showInvalidNumberError();
			return;
		}
		// A native number input strips a trailing "." from its value, so the decimal cannot be seen in
		// handleChange until a following digit is typed. Detect the decimal-separator keystroke directly
		// so an integer/long field flags the error the moment a "." is entered.
		const isIntegerType = this.props.control.valueDef &&
			(this.props.control.valueDef.propType === Type.INTEGER ||
			this.props.control.valueDef.propType === Type.LONG);
		if (isIntegerType && (evt.key === "." || evt.key === ",")) {
			this.showIntegerError();
			return;
		}
		// Removing a trailing "." also cannot be seen in handleChange (the value is unchanged), so on a
		// delete keystroke clear the integer error once what remains is a valid integer.
		if (isIntegerType && (evt.key === "Backspace" || evt.key === "Delete") && Number.isInteger(Number(this.numberInput.current.value))) {
			this.clearIntegerError();
			return;
		}
		// Number is valid, clear invalid number error if it exists
		this.clearInvalidNumberError();
	}

	handleChange(evt, { value, direction }) {
		// When stepper buttons are clicked, evt.type = click
		// When user changes the value manually without clicking stepper buttons, evt.type = change
		if (evt?.type === "click" && typeof direction === "string") {
			this.onDirection(direction);
			return;
		}

		if (
			evt.target.validity && evt.target.validity.badInput ||
			(!isFinite(value))
		) {
			// Note - When user enters an invalid number, value is set to "".
			// It is difficult to differentiate between empty value and invalid input because both return "".
			// It's not possible to add a seaparte condition for invalid input because we never get the actual invalid number entered by the user.
			// So, setting error message for invalid input here instead of using conditions.
			this.showInvalidNumberError();
			// Return without updating property value
			return;
		}
		// Number is valid, clear invalid number error if it exists
		this.clearInvalidNumberError();

		const actualValue = value;
		if (typeof actualValue === "undefined" || actualValue === null || actualValue === "") {
			// Field is empty — clear any prior integer error.
			this.clearIntegerError();
			this.props.controller.updatePropertyValue(this.props.propertyId, null);
		} else {
			// If the field is declared as integer or long, reject any value that contains a decimal.
			// Number.isInteger returns false for values like 4.4 even though they are finite numbers,
			// so this catches the case the badInput/isFinite check above cannot.
			const isIntegerType = this.props.control.valueDef &&
				(this.props.control.valueDef.propType === Type.INTEGER ||
				this.props.control.valueDef.propType === Type.LONG);
			if (isIntegerType && !Number.isInteger(Number(actualValue))) {
				// Store the value the user entered (the browser reads "3." back as 3 and "3.3" back as 3.3)
				// and flag the error rather than autocorrecting it. The error blocks saving; if saving is
				// forced, the value is left exactly as entered instead of being modified.
				this.props.controller.updatePropertyValue(this.props.propertyId, Number(actualValue));
				this.showIntegerError();
				return;
			}
			// Value is valid for the declared type — clear any prior integer error and store it
			this.clearIntegerError();
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(actualValue));
		}
	}

	// Shows an error when the user enters a value that is not a parseable number at all (e.g. "abc").
	// This path is taken when the browser signals badInput or the value is not finite.
	showInvalidNumberError() {
		if (this.props.controller.getErrorMessage(this.props.propertyId) === null) {
			const errorMessage = {
				type: "error",
				text: formatMessage(this.reactIntl, MESSAGE_KEYS.INVALID_NUMBER_ERROR),
				propertyId: this.props.propertyId,
				validation_id: "invalid_number",
				// Flag as required so it is treated as a blocking error that disables Save
				// (when the application enables disableSaveOnRequiredErrors).
				required: true
			};
			this.props.controller.updateErrorMessage(this.props.propertyId, errorMessage);
		}
		this.setState({ invalidNumber: true });
	}

	// Clears the invalid number error if it was previously set by showInvalidNumberError.
	clearInvalidNumberError() {
		if (this.state.invalidNumber) {
			this.setState({ invalidNumber: false });
		}

		const invalidNumberError = this.props.controller.getErrorMessage(this.props.propertyId) &&
		this.props.controller.getErrorMessage(this.props.propertyId).validation_id === "invalid_number";
		if (invalidNumberError) {
			this.props.controller.updateErrorMessage(this.props.propertyId, null);
		}
	}

	// Shows an error when a decimal is entered into a field declared as type integer or long.
	showIntegerError() {
		if (this.props.controller.getErrorMessage(this.props.propertyId) === null) {
			const errorMessage = {
				type: "error",
				text: formatMessage(this.reactIntl, MESSAGE_KEYS.INVALID_INTEGER_ERROR),
				propertyId: this.props.propertyId,
				validation_id: "invalid_integer",
				// Flag as required so it is treated as a blocking error that disables Save
				// (when the application enables disableSaveOnRequiredErrors).
				required: true
			};
			this.props.controller.updateErrorMessage(this.props.propertyId, errorMessage);
		}
	}

	// Clears the integer error if it was previously set by showIntegerError.
	clearIntegerError() {
		const integerError = this.props.controller.getErrorMessage(this.props.propertyId) &&
			this.props.controller.getErrorMessage(this.props.propertyId).validation_id === "invalid_integer";
		if (integerError) {
			this.props.controller.updateErrorMessage(this.props.propertyId, null);
		}
	}

	generateNumber() {
		const generator = this.props.control.label.numberGenerator;
		const min = generator.range && generator.range.min ? generator.range.min : 10000;
		const max = generator.range && generator.range.max ? generator.range.max : 99999;
		const newValue = Math.floor(Math.random() * (max - min + 1) + min);
		this.props.controller.updatePropertyValue(this.props.propertyId, newValue);
	}

	render() {
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
		let controlValue = ""; // Default to empty string to avoid '0' appearing when value is 'null'
		if (this.props.value !== null && typeof this.props.value !== "undefined") {
			controlValue = this.props.value;
		}

		const disabled = this.props.state === STATES.DISABLED;
		let numberGenerator;
		if (has(this.props.control, "label.numberGenerator")) {
			numberGenerator = (<Button
				className={classNames("properties-number-generator", { "hide": hidden })}
				onClick={this.generateNumber}
				disabled={disabled}
				kind="tertiary"
				size="md"
				renderIcon={Shuffle}
				tooltipPosition="bottom"
				tooltipAlignment="end"
				iconDescription={this.props.control.label.numberGenerator.text}
				hasIconOnly
			/>);
		}
		const className = classNames(
			"properties-numberfield",
			{ "numberfield-with-number-generator": has(this.props.control, "label.numberGenerator") ? this.props.control.label.numberGenerator : null },
			{ "hide": hidden },
			this.props.messageInfo ? this.props.messageInfo.type : null
		);
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<NumberInput
					{...validationProps}
					ref={this.numberInput}
					id={this.id}
					onChange={this.handleChange.bind(this)}
					onKeyUp={this.onKeyUp}
					disabled={disabled}
					step={this.props.control.increment}
					value={controlValue}
					placeholder={this.props.control.additionalText}
					label={this.props.controlItem}
					hideLabel={this.props.tableControl}
					allowEmpty
					hideSteppers={this.props.tableControl || (this.props.control.controlType === ControlType.NUMBERFIELD)}
					helperText={this.props.control.helperText}
					readOnly={this.props.readOnly}
					disableWheel
					aria-label={this.props.control.labelVisible ? null : this.props.control?.label?.text}
				/>
				{numberGenerator}
				<ValidationMessage inTable={this.props.tableControl} tableOnly state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]), // list control passes string
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.number, // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux,
	readOnly: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId, true) // Filter error messages for hidden/disabled controls
});

export default connect(mapStateToProps, null)(NumberfieldControl);
