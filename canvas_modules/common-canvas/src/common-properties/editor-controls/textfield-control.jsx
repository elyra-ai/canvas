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
		const value = props.valueAccessor ? props.valueAccessor(props.control.name)[0] : props.value;
		this.state = {
			controlValue: value
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		if (this.props.updateControlValue) {
			const ctrlName = this.props.columnDef ? this.props.columnDef.name : this.props.control.name;
			this.props.updateControlValue(ctrlName, evt.target.value, this.props.rowIndex);
		}
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		var controlName = this.getControlID().split(".")[1];
		var stateDisabled = {};
		var stateStyle = {};
		if (this.props.controlStates && typeof this.props.controlStates[controlName] !== "undefined") {
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
		let className = "editor_control_area";
		var errorMessage = <div className="validation-error-message" style={{ "marginTop": "0px" }}></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			className += " error-border";
			errorMessage = (
				<div className="validation-error-message" style={{ "marginTop": "20px" }}>
					<p className="form__validation" style={{ "display": "block" }}>
						<span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
					</p>
				</div>
			);
		}
		const charLimit = this.getCharLimit(CHARACTER_LIMITS.NODE_PROPERTIES_DIALOG_TEXT_FIELD);
		let displayedCharLimit;
		let cellvalue = this.state.controlValue;
		if (!this.props.tableControl) {
			displayedCharLimit = charLimit;
		} else {
			cellvalue = this.props.value;
		}
		cellvalue = cellvalue ? cellvalue : "";
		return (
			<div className={className} style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					id={this.getControlID()}
					onBlur={this.validateInput}
					onFocus={this.clearValidateMsg}
					disabledPlaceholderAnimation
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange}
					value={cellvalue}
					maxCount={displayedCharLimit}
					maxLength={charLimit}
				/>
				{errorMessage}
			</div>
		);
	}
}

TextfieldControl.propTypes = {
	control: React.PropTypes.object,
	controlStates: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
