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
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class RadiosetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		if (evt.target.checked) {
			this.setState({ controlValue: evt.target.value });
		}
		this.notifyValueChanged(this.props.control.name, evt.target.value);
		this.props.updateControlValue(this.props.control.name, evt.target.value);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "checkbox"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var buttons = [];
		let cssClasses = "control";
		let cssIndicator = "control__indicator";
		if (this.props.control.orientation === "vertical") {
			cssClasses += " control-radio-block";
			cssIndicator += " control__indicator-block";
		}
		for (var i = 0; i < this.props.control.values.length; i++) {
			var val = this.props.control.values[i];
			var checked = val === this.state.controlValue;
			buttons.push(
				<label key={i} className={cssClasses}>
					<input type="radio"
						{...stateDisabled}
						name={this.props.control.name}
						value={val}
						onChange={this.handleChange}
						onBlur={this.validateInput}
						checked={checked}
					/>
					{this.props.control.valueLabels[i]}
					<div className={cssIndicator} />
				</label>
			);
		}
		return (
			<div id={this.getControlID()} className="radio" style={stateStyle} >
				<div id={controlIconContainerClass} >
					<div id="radioset-control-container">{buttons}</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	control: PropTypes.object,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
