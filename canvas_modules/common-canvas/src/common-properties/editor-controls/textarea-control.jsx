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
import { CHARACTER_LIMITS, EDITOR_CONTROL } from "../constants/constants.js";

import EditorControl from "./editor-control.jsx";

export default class TextareaControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: EditorControl.joinNewlines(props.valueAccessor(props.control.name))
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		if (this.props.control.valueDef && this.props.control.valueDef.isList) {
			this.props.updateControlValue(this.props.control.name, EditorControl.splitNewlines(evt.target.value));
		} else {
			this.props.updateControlValue(this.props.control.name, evt.target.value);
		}
	}

	getControlValue() {
		if (this.props.control.valueDef.isList) {
			return EditorControl.splitNewlines(this.state.controlValue);
		}
		return this.state.controlValue;
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "textfieldbox"
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

		const charLimit = this.getCharLimit(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<TextField {...stateDisabled}
						style={stateStyle}
						type="textarea"
						id={this.getControlID()}
						onBlur={this.validateInput}
						msg={this.state.validateErrorMessage}
						placeholder={this.props.control.additionalText}
						onChange={this.handleChange}
						value={this.state.controlValue}
						rows={4}
						maxCount={charLimit}
						maxLength={charLimit}
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

TextareaControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.array,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
