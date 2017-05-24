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

export default class TextfieldControl extends EditorControl {
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
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
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

		let disablePlaceHolder = true;
		// only enable if additionText is available
		if (this.props.control.additionalText || (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "")) {
			disablePlaceHolder = false;
		}

		return (
			<div className="editor_control_area" style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					type="text"
					id={this.getControlID()}
					onBlur={this.validateInput}
					onFocus={this.clearValidateMsg}
					msg={this.state.validateErrorMessage}
					disabledPlaceholderAnimation={disablePlaceHolder}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange}
					value={this.state.controlValue}
					maxCount={CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD}
					maxLength={CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD}
				/>
			</div>
		);
	}
}

TextfieldControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object
};
