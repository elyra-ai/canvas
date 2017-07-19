/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { TextField } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

export default class PasswordControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)[0]
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		this.props.updateControlValue(this.props.control.name, evt.target.value);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		const controlName = this.getControlID().split(".")[1];
		const conditionProps = {
			controlName: controlName,
			controlType: "textfield"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		return (
		<div className="editor_control_area" style={stateStyle}>
			<TextField {...stateDisabled}
				style={stateStyle}
				type="password"
				id={this.getControlID()}
				placeholder={this.props.control.additionalText}
				onChange={this.handleChange}
				onBlur={this.validateInput}
				value={this.state.controlValue}
			/>
			{errorMessage}
		</div>);
	}
}

PasswordControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.object,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
