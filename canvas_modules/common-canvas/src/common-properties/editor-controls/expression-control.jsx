/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import { TextField } from "ap-components-react/dist/ap-components-react";

import EditorControl from "./editor-control.jsx";
import { CHARACTER_LIMITS } from "../constants/constants.js";

export default class ExpressionControl extends EditorControl {
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
		return [this.state.controlValue];
	}

	render() {
		var errorMessage = <div className="validation-error-message"></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			errorMessage = (
				<div className="validation-error-message validation-error-message-padding">
					<p className="form__validation" style={{ "display": "block" }}>
						<span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
					</p>
				</div>
			);
		}

		var controlName = this.getControlID().split(".")[1];
		var stateDisabled = {};
		var stateStyle = {};
		if (typeof this.props.controlStates[controlName] !== "undefined") {
			if (this.props.controlStates[controlName] === "disabled") {
				stateDisabled.disabled = true;
				stateStyle = {
					color: "#D8D8D8",
					borderColor: "#D8D8D8"
				};
			} else if (this.props.controlStates[controlName] === "hidden") {
				stateStyle.visibility = "hidden";
			}
		}
		const charLimit = this.getCharLimit(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_AREA);
		return (
			<div className="editor_control_area" style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					type="textarea"
					id={this.getControlID()}
					onBlur={this.validateInput}
					onFocus={this.clearValidateMsg}
					msg={this.state.validateErrorMessage}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange}
					value={this.state.controlValue}
					rows={4}
					maxCount={charLimit}
					maxLength={charLimit}
				/>
				{errorMessage}
			</div>
		);
	}
}

ExpressionControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
