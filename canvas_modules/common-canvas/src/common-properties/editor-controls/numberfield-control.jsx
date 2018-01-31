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
		var originalValue = JSON.parse(JSON.stringify(this.stringValue));
		var numValue = null;
		// if integer only allow signed numbers.
		if (this.props.control.valueDef && this.props.control.valueDef.propType === "integer") {
			const signedDigits = /^[-+]?[0-9]+$/;
			if (typeof evt.target.value === "undefined" || evt.target.value === null ||
			evt.target.value === "") {
				this.stringValue = "";
			} else if (evt.target.value.match(signedDigits)) {
				// does not contain invalid integers characters
				this.stringValue = evt.target.value;
			} else {
				// if a non digit was entered do not accept the input (stays at the original value)
				this.stringValue = originalValue;
			}
			if (this.stringValue !== "") {
				numValue = parseInt(this.stringValue, 10);
			}
		// it is a double
		} else if (evt.target.value === "" && this.stringValue.length !== 1) {
			// this case a NaN enter and not delete of last characters
			// set to original value
			this.stringValue = originalValue;
			numValue = this.props.controller.getPropertyValue(this.props.propertyId);
		} else {
			this.stringValue = evt.target.value;
			if (this.stringValue !== "") {
				numValue = parseFloat(this.stringValue);
			}
		}
		// if an invalid character entered then do not change any values
		if (this.stringValue !== "" && isNaN(numValue)) {
			this.stringValue = originalValue;
			numValue = this.props.controller.getPropertyValue(this.props.propertyId);
		}

		// Need to do this so that the cursor doesn't go to the start of the input area when deleting characters
		if (originalValue.indexOf(".") > -1 && this.stringValue.indexOf(".") === -1) {
			evt.target.value = "";
			evt.target.value = this.stringValue;
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, numValue);

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
