/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import TextField from "ap-components-react/dist/components/TextField";
import EditorControl from "./editor-control.jsx";
import { SPINNER } from "../constants/constants.js";

export default class NumberfieldControl extends EditorControl {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.onIncrease = this.onIncrease.bind(this);
		this.onDecrease = this.onDecrease.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}
	componentWillMount() {
		// needed since in a number like 10.0 the .0 is stripped off so users couldn't enter 10.02
		this.stringValue = "";
		const numValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof numValue !== "undefined" && numValue !== null) {
			this.stringValue = numValue.toString();
		}
	}

	handleChange(evt) {
		// if an invalid character is entered then do not accept the character.
		// if the original value starts with "." then it is a case of deleting (backspace) a double value ".2"
		// in this case we do not want to return, we want to change the value.
		if (evt.target.value === "" && evt.target.validity.badInput && !this._isValidStartChar(this.stringValue)) {
			return;
		}

		var originalValue = JSON.parse(JSON.stringify(this.stringValue));
		var numValue = null;
		// if integer only allow signed numbers or empty.
		if (this.props.control.valueDef && this.props.control.valueDef.propType === "integer") {
			const signedDigits = /^[-+]?[0-9]+$/;
			if (evt.target.value.match(signedDigits) || evt.target.value === "") {
				// contains valid integers characters or blank
				this.stringValue = evt.target.value;
			}
			if (this.stringValue !== "") {
				numValue = parseInt(this.stringValue, 10);
			}
			// Need to do this so that the cursor acts appropately in Chrome when starting with "+"
			evt.target.value = "";
			evt.target.value = this.stringValue;
		// it is a double
		} else {
			this.stringValue = evt.target.value;
			if (this.stringValue !== "") {
				numValue = parseFloat(this.stringValue);
			}
			// Need to do this so that the cursor doesn't go to the start of the input area when deleting characters
			if (originalValue.indexOf(".") > -1 && this.stringValue.indexOf(".") === -1) {
				// do not want to do this when "." because Chrome will remove the "." from the rendered field
				// and you will never be able to enter a ".".
				evt.target.value = "";
				evt.target.value = this.stringValue;
			}
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, numValue);
	}

	_isValidStartChar(value) {
		return (value.startsWith(".") || value.startsWith("-") || value.startsWith("+"));
	}

	onIncrease() {
		const originalValue = JSON.parse(JSON.stringify(this.stringValue));
		const decimalsInOriginalValue = (originalValue.toString()).split(".")[1];
		this.props.control.increment = this.props.control.increment ? this.props.control.increment : 1;
		const decimalsInIncrement = (this.props.control.increment.toString()).split(".")[1];
		const numValue = Number(originalValue) + this.props.control.increment;
		if (decimalsInIncrement) {
			let decimalPrecision = decimalsInIncrement.length;
			if (decimalsInOriginalValue) {
				decimalPrecision = decimalsInOriginalValue.length >= decimalsInIncrement.length ? decimalsInOriginalValue.length : decimalsInIncrement.length;
			}
			this.stringValue = numValue.toFixed(decimalPrecision);
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(numValue.toFixed(decimalPrecision)));
		} else {
			this.stringValue = numValue.toString();
			this.props.controller.updatePropertyValue(this.props.propertyId, numValue);
		}
	}

	onDecrease() {
		const originalValue = JSON.parse(JSON.stringify(this.stringValue));
		const decimalsInOriginalValue = (originalValue.toString()).split(".")[1];
		const decimalsInIncrement = (this.props.control.increment.toString()).split(".")[1];
		const numValue = Number(originalValue) - this.props.control.increment;
		if (decimalsInIncrement) {
			let decimalPrecision = decimalsInIncrement.length;
			if (decimalsInOriginalValue) {
				decimalPrecision = decimalsInOriginalValue.length >= decimalsInIncrement.length ? decimalsInOriginalValue.length : decimalsInIncrement.length;
			}
			this.stringValue = numValue.toFixed(decimalPrecision);
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(numValue.toFixed(decimalPrecision)));
		} else {
			this.stringValue = numValue.toString();
			this.props.controller.updatePropertyValue(this.props.propertyId, numValue);
		}
	}

	clearValue() {
		// number values should be null of not set
		this.props.controller.updatePropertyValue(this.props.propertyId, null);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		// we should reset the string value in case the values was updated outside of the control
		if (parseFloat(controlValue) !== parseFloat(this.stringValue)) {
			this.stringValue = controlValue;
		}
		if (typeof this.stringValue === "undefined" || this.stringValue === null) {
			this.stringValue = "";
		}
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "number"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = this.props.tableControl ? null : conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const spinnerProps = {};
		const that = this;
		if (this.props.control.controlType === SPINNER) {
			spinnerProps.numberInput = SPINNER;
			spinnerProps.onIncrease = that.onIncrease;
			spinnerProps.onDecrease = that.onDecrease;
		}

		return (
			<div className="editor_control_area number-control" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						type="number"
						id={this.getControlID()}
						placeholder={this.props.control.additionalText}
						disabledPlaceholderAnimation
						onChange={this.handleChange}
						value={this.stringValue}
						{...spinnerProps}
						onReset={() => this.clearValue()}
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
