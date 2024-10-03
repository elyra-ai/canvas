/*
 * Copyright 2017-2023 Elyra Authors
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
import { ControlType } from "./../../constants/form-constants";
import { Shuffle } from "@carbon/react/icons";
import { has } from "lodash";

class NumberfieldControl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			invalidNumber: false
		};
		this.onDirection = this.onDirection.bind(this);
		this.generateNumber = this.generateNumber.bind(this);
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
			if (this.props.controller.getErrorMessage(this.props.propertyId) === null) {
				const errorMessage = {
					type: "error",
					text: formatMessage(this.reactIntl, MESSAGE_KEYS.INVALID_NUMBER_ERROR),
					propertyId: this.props.propertyId,
					validation_id: "invalid_number"
				};
				this.props.controller.updateErrorMessage(this.props.propertyId, errorMessage);
			}
			this.setState({ invalidNumber: true });
			// Return without updating property value
			return;
		}
		// Number is valid, clear invalid number error if it exists
		if (this.state.invalidNumber) {
			this.setState({ invalidNumber: false });
		}

		const invalidNumberError = this.props.controller.getErrorMessage(this.props.propertyId) &&
		this.props.controller.getErrorMessage(this.props.propertyId).validation_id === "invalid_number";
		if (invalidNumberError) {
			this.props.controller.updateErrorMessage(this.props.propertyId, null);
		}

		const actualValue = value;
		if (typeof actualValue === "undefined" || actualValue === null || actualValue === "") {
			this.props.controller.updatePropertyValue(this.props.propertyId, null);
		} else {
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(actualValue));
		}
		// TODO need to check for integer in validations
	}

	generateNumber() {
		const generator = this.props.control.label.numberGenerator;
		const min = generator.range && generator.range.min ? generator.range.min : 10000;
		const max = generator.range && generator.range.max ? generator.range.max : 99999;
		const newValue = Math.floor(Math.random() * (max - min + 1) + min);
		this.props.controller.updatePropertyValue(this.props.propertyId, newValue);
	}

	render() {
		let controlValue = ""; // Default to empty string to avoid '0' appearing when value is 'null'
		if (this.props.value !== null && typeof this.props.value !== "undefined") {
			controlValue = this.props.value;
		}

		const disabled = this.props.state === STATES.DISABLED;
		const hidden = this.props.state === STATES.HIDDEN;
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
					ref= { (ref) => (this.numberInput = ref)}
					id={this.id}
					onChange={this.handleChange.bind(this)}
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
