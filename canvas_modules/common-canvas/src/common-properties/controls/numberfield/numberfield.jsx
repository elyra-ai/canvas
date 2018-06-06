/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import NumberInput from "carbon-components-react/lib/components/NumberInput";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

export default class NumberfieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.onDirection = this.onDirection.bind(this);
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

	handleChange(evt, direction) {
		if (direction) {
			this.onDirection(direction);
			return;
		}
		if (evt.target.validity && evt.target.validity.badInput) {
			this.setState({
				invalid: true // TODO need to hook into validations
			});
			return;
		}
		const actualValue = evt.target.value;
		if (typeof actualValue === "undefined" || actualValue === null || actualValue === "") {
			this.props.controller.updatePropertyValue(this.props.propertyId, null);
		} else {
			this.props.controller.updatePropertyValue(this.props.propertyId, Number(actualValue));
		}
		// TODO need to check for integer in validations
	}

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = ""; // default to ""
		}
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);

		const className = classNames("properties-numberfield", { "hide": state === STATES.HIDDEN }, messageInfo ? messageInfo.type : null);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<NumberInput
					ref= { (ref) => (this.numberInput = ref)}
					id={ControlUtils.getControlId(this.props.propertyId)}
					onChange={this.handleChange.bind(this)}
					disabled={state === STATES.DISABLED}
					step={this.props.control.increment}
					value={controlValue}
					placeholder={this.props.control.additionalText}
				/>
				<ValidationMessage inTable={this.props.tableControl} state={state} messageInfo={messageInfo} />
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
