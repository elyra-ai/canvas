/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import EditorControl from "./editor-control.jsx";

export default class RadiosetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)[0]
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		if (evt.target.checked) {
			this.setState({ controlValue: evt.target.value });
		}
		this.notifyValueChanged(this.props.control.name, evt.target.value);
		this.props.updateControlValue(this.props.control.name, [evt.target.value]);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		const controlName = this.getControlID().split(".")[1];
		const conditionProps = {
			controlName: controlName,
			controlType: "selection"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

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
				<label key={i} className={cssClasses} style={stateStyle}>
					<input type="radio"
						{...stateDisabled}
						name={this.props.control.name}
						value={val}
						onChange={this.handleChange}
						checked={checked}
					/>
						{this.props.control.valueLabels[i]}
					<div className={cssIndicator}></div>
				</label>
			);
		}
		return (
			<div id={this.getControlID()}
				className="radio"
				style={stateStyle}
			>
				{buttons}
				{errorMessage}
			</div>
		);
	}
}

RadiosetControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.object,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
