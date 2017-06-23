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

export default class NumberfieldControl extends EditorControl {
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
		var errorMessage = <div className="validation-error-message" style={{ "marginTop": "0px" }}></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			errorMessage = (
				<div className="validation-error-message" style={{ "marginTop": "20px" }}>
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
		return (
			<div className="editor_control_area" style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					type="number"
					id={this.getControlID()}
					onBlur={this.validateInput}
					onFocus={this.clearValidateMsg}
					placeholder={this.props.control.additionalText}
					disabledPlaceholderAnimation
					onChange={this.handleChange}
					value={this.state.controlValue}
					numberInput="close"
					onChange={(e) => this.setState({ controlValue: e.target.value })}
					onReset={() => this.setState({ controlValue: "0" })}
				/>
				{errorMessage}
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: React.PropTypes.object
};
