/*
 * Copyright 2017-2020 IBM Corporation
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
import { NumberInput } from "carbon-components-react";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

class NumberfieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.onDirection = this.onDirection.bind(this);
		this.id = ControlUtils.getControlId(this.props.propertyId);
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
		let controlValue;
		if (this.props.value !== null) {
			controlValue = this.props.value;
		}
		const className = classNames("properties-numberfield", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null);

		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<NumberInput
					ref= { (ref) => (this.numberInput = ref)}
					id={this.id}
					onChange={this.handleChange.bind(this)}
					disabled={this.props.state === STATES.DISABLED}
					step={this.props.control.increment}
					value={controlValue}
					placeholder={this.props.control.additionalText}
				/>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.number, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(NumberfieldControl);
